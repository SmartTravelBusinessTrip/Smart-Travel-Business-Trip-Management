import { expect, test, type Locator, type Page } from '@playwright/test';

// E2E-01 (nguồn ID: E2E-01)
// User Story: US-01, US-02, US-04
// Test Cases: TC-001, TC-008
test('E2E-01: Employee lưu nháp, bỏ qua AI và gửi duyệt', async ({ page }, testInfo) => {
  test.setTimeout(120_000);

  const email = process.env.E2E_EMPLOYEE_EMAIL;
  const password = process.env.E2E_EMPLOYEE_PASSWORD;
  test.skip(!email || !password, 'BLOCKED: chưa cấu hình account Employee.');

  let tripId: string | undefined;
  let tripCode: string | undefined;
  let authHeader: string | undefined;
  let submitStarted = false;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/api/v1/trips') && request.method() === 'POST') {
      authHeader = request.headers()['authorization'];
    }
  });

  const departureDate = addBusinessDays(new Date(), 5);
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 2);
  const runTag = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const purpose = `E2E-01 Playwright ${runTag}`;

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    await page.getByPlaceholder('ten@smarttravel.vn').fill(email!);
    await page.getByPlaceholder('Nhập mật khẩu').fill(password!);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Chuyến công tác của bạn' })).toBeVisible({ timeout: 25_000 });

    await page.getByRole('button', { name: /Tạo Trip Request/ }).click();
    await expect(page.getByRole('heading', { name: 'Tạo yêu cầu công tác' })).toBeVisible();
    await page.getByPlaceholder('Đà Nẵng').fill('Đà Nẵng');
    await page.getByPlaceholder('TP. Hồ Chí Minh').fill('Hà Nội');
    const dateInputs = page.locator('input[placeholder="dd/mm/yyyy"]');
    await chooseDate(dateInputs.nth(0), departureDate);
    await chooseDate(dateInputs.nth(1), returnDate);
    await page.getByPlaceholder('Mô tả mục đích chi tiết (tối thiểu 10 ký tự)...').fill(purpose);
    await page.getByPlaceholder('Ví dụ: 8000000').fill('100000');

    const createResponsePromise = page.waitForResponse((response) => {
      const request = response.request();
      return new URL(response.url()).pathname.endsWith('/api/v1/trips') && request.method() === 'POST';
    });
    await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    const createdBody = await createResponse.json();
    tripId = createdBody.data?.id;
    tripCode = createdBody.data?.tripCode;
    expect(tripId, 'API tạo Trip phải trả về id để tiếp tục flow').toBeTruthy();
    expect(tripCode, 'API tạo Trip phải trả về mã để nhận diện fixture').toBeTruthy();

    await expect(page.getByRole('heading', { name: 'Chuyến công tác của bạn' })).toBeVisible({ timeout: 15_000 });
    const draftCard = tripCard(page, tripCode!);
    await expect(draftCard.getByText('Bản nháp', { exact: true })).toBeVisible();
    await draftCard.locator('button').filter({ hasText: 'Tiếp tục soạn thảo' }).click();
    await expect(page.getByRole('heading', { name: 'Tạo yêu cầu công tác' })).toBeVisible();
    await expect(page.getByText('Đang tải bản nháp...')).toBeHidden();
    await expect(page.getByPlaceholder('Đà Nẵng')).toHaveValue('Đà Nẵng');
    await expect(page.getByPlaceholder('TP. Hồ Chí Minh')).toHaveValue('Hà Nội');
    await expect(page.getByPlaceholder('Mô tả mục đích chi tiết (tối thiểu 10 ký tự)...')).toHaveValue(purpose);

    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sinh lịch trình bằng AI' })).toBeVisible();
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await expect(page.getByText('Xem lại trước khi gửi', { exact: true })).toBeVisible();

    const submitResponsePromise = page.waitForResponse((response) => {
      const path = new URL(response.url()).pathname;
      return path.endsWith(`/api/v1/trips/${tripId}/submit`) && response.request().method() === 'POST';
    });
    submitStarted = true;
    await page.getByRole('button', { name: 'Gửi yêu cầu duyệt', exact: true }).click();
    const submitResponse = await submitResponsePromise;
    expect(submitResponse.ok(), 'API gửi yêu cầu phải thành công').toBeTruthy();
    const submittedBody = await submitResponse.json();
    expect(submittedBody.data?.status).toBe('SUBMITTED');

    await expect(page.getByRole('heading', { name: 'Đã gửi yêu cầu duyệt' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: '← Về Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Chuyến công tác của bạn' })).toBeVisible();
    const submittedCard = tripCard(page, tripCode!);
    await expect(submittedCard.getByText('Chờ duyệt cấp 1', { exact: true })).toBeVisible();

    await testInfo.attach('e2e-01-trip-reference.txt', {
      body: `Trip code: ${tripCode}\nTrip ID: ${tripId}\nFinal status: ${submittedBody.data.status}\n`,
      contentType: 'text/plain',
    });
  } finally {
    // Only remove an unfinished draft. Submitted Trips are kept for the isolated test-environment reset.
    if (tripId && authHeader && !submitStarted) {
      const cleanupUrl = new URL(`/api/v1/trips/${tripId}`, page.url()).toString();
      const cleanupResponse = await page.request.delete(cleanupUrl, { headers: { authorization: authHeader } });
      if (!cleanupResponse.ok()) {
        console.warn(`Draft cleanup did not succeed (HTTP ${cleanupResponse.status()}); Trip ${tripCode ?? tripId} may need test DB reset.`);
      }
    }
  }
});

function tripCard(page: Page, code: string): Locator {
  return page.locator('.ui-card').filter({ hasText: code });
}

function addBusinessDays(start: Date, businessDays: number): Date {
  const date = new Date(start);
  date.setHours(12, 0, 0, 0);
  let added = 0;
  while (added < businessDays) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added += 1;
  }
  return date;
}

async function chooseDate(input: Locator, date: Date): Promise<void> {
  await input.click();
  const picker = input.locator('xpath=../..');
  const calendar = picker.locator('div.absolute.top-full');
  const expectedMonth = `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
  const heading = calendar.locator('span').first();
  for (let count = 0; (await heading.innerText()) !== expectedMonth && count < 18; count += 1) {
    await calendar.getByRole('button').nth(1).click();
  }
  await expect(heading).toHaveText(expectedMonth);
  await calendar.getByRole('button', { name: String(date.getDate()), exact: true }).click();
}
