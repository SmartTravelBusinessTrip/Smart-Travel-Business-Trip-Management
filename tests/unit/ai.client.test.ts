import { beforeEach, describe, expect, it, vi } from 'vitest';

const groqMock = vi.hoisted(() => ({
  completion: vi.fn(),
}));
const fetchMock = vi.hoisted(() => vi.fn());

vi.stubGlobal('fetch', fetchMock);

const response = (draft: unknown) => ({
  text: JSON.stringify(draft),
});

const rejected = (message: string, status: number, headers?: Headers) => Object.assign(
  new Error(message), { status, headers },
);

import { generateItinerary } from '../../src/backend/src/lib/ai.client';

const input = {
  origin: 'Da Nang',
  destination: 'Ha Noi',
  days: 1,
  budget: 1_000_000,
  departureDate: '2026-10-05',
  returnDate: '2026-10-06',
  purpose: 'Customer meeting',
  preferences: 'Quiet hotel',
  hotelLimitPerNight: 1_000_000,
  perDiemPerDay: 400_000,
};

const validDraft = {
  items: [
    {
      dayNumber: 1,
      date: '2026-10-05',
      timeSlot: 'MORNING',
      location: 'Office',
      activity: 'Customer meeting',
      category: 'MEETING',
      estimatedCost: 120_000,
    },
    {
      dayNumber: 1,
      date: '2026-10-05',
      timeSlot: 'EVENING',
      location: 'Restaurant',
      activity: 'Dinner',
      category: 'MEAL',
      estimatedCost: 80_000,
    },
  ],
  totalEstimatedCost: 200_000,
};

describe('Groq itinerary client (provider mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['GROQ_API_KEY'] = 'test-groq-key';
    groqMock.completion.mockResolvedValue(response(validDraft));
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const request = JSON.parse(String(init.body)) as {
        messages: Array<{ role: string; content: string }>;
        response_format?: { type?: string };
        reasoning_format?: string;
        reasoning_effort?: string;
        max_completion_tokens?: number;
      };
      const mockedResponse = await groqMock.completion(request, _url, init);
      return new Response(JSON.stringify({
        choices: [{ message: { content: mockedResponse.text } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
  });

  it('requests structured JSON and includes validated policy references in the prompt', async () => {
    const result = await generateItinerary(input);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const request = JSON.parse(String(init.body)) as {
      model: string;
      messages: Array<{ role: string; content: string }>;
      response_format?: { type?: string };
      reasoning_format?: string;
      reasoning_effort?: string;
      max_completion_tokens?: number;
    };
    const prompt = request.messages[1]?.content ?? '';

    expect(result.totalEstimatedCost).toBe(200_000);
    expect(result.guardrailPass).toBe(true);
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-groq-key');
    expect(request).toEqual(expect.objectContaining({
      model: 'openai/gpt-oss-20b',
      response_format: expect.objectContaining({ type: 'json_schema' }),
      reasoning_format: 'hidden',
      reasoning_effort: 'low',
      max_completion_tokens: 4096,
    }));
    expect(request.messages[0]?.content).toContain('Toàn bộ activity, location và notes phải bằng tiếng Việt');
    expect(request.messages[0]?.content).toContain('{"items":[...]}');
    expect(prompt).toContain('1.000.000 VNĐ/đêm');
    expect(prompt).toContain('400.000 VNĐ/ngày');
    expect(prompt).toContain('Customer meeting');
    expect(prompt).toContain('Quiet hotel');
    expect(prompt).toContain('Điểm xuất phát: Da Nang');
    expect(prompt).toContain('Trip Request: 2026-10-05 đến 2026-10-06');
    expect(prompt).toContain('Cửa sổ lịch trình AI: 2026-10-05 đến 2026-10-05 (1 ngày)');
  });

  it('handles absent optional preferences without inventing a value', async () => {
    await generateItinerary({
      ...input,
      preferences: undefined,
      hotelLimitPerNight: undefined,
      perDiemPerDay: undefined,
    });
    const request = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body)) as { messages: { content: string }[] };
    const prompt = request.messages[1]?.content ?? '';

    expect(prompt).toContain('Không có');
    expect(prompt).toContain('Không có dữ liệu hạn mức');
  });

  it('accepts a JSON object with the required items root', async () => {
    const result = await generateItinerary(input);

    expect(result.guardrailPass).toBe(true);
    expect(result.items).toHaveLength(2);
  });

  it('rejects root arrays, missing items, malformed JSON, and markdown fences', async () => {
    const invalidResponses = [
      JSON.stringify(validDraft.items),
      JSON.stringify({ itinerary: validDraft.items }),
      '{"items":',
      `\`\`\`json\n${JSON.stringify(validDraft)}\n\`\`\``,
    ];

    for (const text of invalidResponses) {
      groqMock.completion.mockResolvedValue({ text });
      await expect(generateItinerary(input)).rejects.toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
      });
    }
  });

  it('grounds a three-day Da Nang to Ha Noi itinerary in chronological daily phases', async () => {
    groqMock.completion.mockResolvedValueOnce(response({
      items: [10, 11, 12].flatMap((day, index) => [
        { dayNumber: index + 1, date: `2026-10-${day}`, timeSlot: 'MORNING', location: 'Địa điểm công tác', activity: `Hoạt động công tác ngày ${index + 1}`, category: 'MEETING', estimatedCost: 100_000 },
        { dayNumber: index + 1, date: `2026-10-${day}`, timeSlot: 'EVENING', location: 'Khu vực phù hợp', activity: `Nghỉ ngơi ngày ${index + 1}`, category: 'OTHER', estimatedCost: 50_000 },
      ]),
      totalEstimatedCost: 450_000,
    }));
    await generateItinerary({
      ...input,
      days: 3,
      departureDate: '2026-10-10',
      returnDate: '2026-10-12',
      origin: 'Đà Nẵng',
      destination: 'Hà Nội',
      purpose: 'Khảo sát thị trường và làm việc với đối tác',
      preferences: 'Ưu tiên họp buổi sáng',
    });
    const request = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body)) as { messages: { content: string }[] };
    const prompt = request.messages[1]?.content ?? '';

    expect(prompt).toContain('Ngày 1 (2026-10-10)');
    expect(prompt).toContain('Đà Nẵng → Hà Nội');
    expect(prompt).toContain('Các ngày giữa');
    expect(prompt).toContain('Ngày cuối (2026-10-12)');
    expect(prompt).toContain('Hà Nội → Đà Nẵng');
    expect(prompt).toContain('Khảo sát thị trường và làm việc với đối tác');
    expect(prompt).toContain('Ưu tiên họp buổi sáng');
  });

  it('rejects malformed calendar dates and incomplete day coverage', async () => {
    groqMock.completion.mockResolvedValue({
      text: JSON.stringify({
        ...validDraft,
        items: validDraft.items.map(item => ({ ...item, date: '2026-02-30' })),
      }),
    });
    await expect(generateItinerary(input)).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });

    groqMock.completion.mockResolvedValue({
      text: JSON.stringify({
        items: Array.from({ length: 4 }, (_, index) => ({
          ...validDraft.items[index % validDraft.items.length],
          dayNumber: 1,
        })),
        totalEstimatedCost: 400_000,
      }),
    });
    await expect(generateItinerary({ ...input, days: 2 })).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });

    groqMock.completion.mockResolvedValue({
      text: JSON.stringify({
        ...validDraft,
        items: validDraft.items.map(item => ({ ...item, date: '2026-10-06', dayNumber: 2 })),
      }),
    });
    await expect(generateItinerary(input)).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });

    groqMock.completion.mockResolvedValue({
      text: 'not JSON',
    });
    await expect(generateItinerary(input)).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });
  });

  it('retries over-budget results and rejects after the configured attempts', async () => {
    groqMock.completion.mockResolvedValue({
      text: JSON.stringify({
        items: validDraft.items.map(item => ({ ...item, estimatedCost: 600_000 })),
        totalEstimatedCost: 1_200_000,
      }),
    });

    await expect(generateItinerary(input)).rejects.toMatchObject({ errorCode: 'AI_BUDGET_GUARDRAIL_FAILED' });
    expect(groqMock.completion).toHaveBeenCalledTimes(3);
    expect(groqMock.completion.mock.calls[1][0].messages[1].content).toContain('RÀNG BUỘC RETRY');
  });

  it('retries transient 503 responses with backoff and succeeds when Groq recovers', async () => {
    vi.useFakeTimers();
    groqMock.completion
      .mockRejectedValueOnce(rejected('overloaded', 503))
      .mockRejectedValueOnce(rejected('overloaded', 503))
      .mockResolvedValueOnce(response(validDraft));

    try {
      const resultPromise = generateItinerary(input);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.totalEstimatedCost).toBe(200_000);
      expect(groqMock.completion).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns AI_PROVIDER_UNAVAILABLE after three 503 responses', async () => {
    vi.useFakeTimers();
    groqMock.completion.mockRejectedValue(
      rejected('overloaded', 503),
    );

    try {
      const resultPromise = expect(generateItinerary(input)).rejects.toMatchObject({
        statusCode: 503,
        errorCode: 'AI_PROVIDER_UNAVAILABLE',
      });
      await vi.runAllTimersAsync();
      await resultPromise;
      expect(groqMock.completion).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not retry non-503 provider errors', async () => {
    groqMock.completion.mockRejectedValueOnce(
      rejected('forbidden', 403),
    );

    await expect(generateItinerary(input)).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });
    expect(groqMock.completion).toHaveBeenCalledTimes(1);
  });

  it('maps provider 429 to AI_PROVIDER_RATE_LIMITED without retrying', async () => {
    groqMock.completion.mockRejectedValueOnce(
      rejected('rate limited', 429),
    );

    await expect(generateItinerary(input)).rejects.toMatchObject({
      statusCode: 429,
      errorCode: 'AI_PROVIDER_RATE_LIMITED',
    });
    expect(groqMock.completion).toHaveBeenCalledTimes(1);
  });
});
