# Automated Test Execution Report

**Ngày chạy:** 2026-10-01  
**Phạm vi lần chạy Unit/Integration/API:** `tests/e2e/` khi đó được tạo nhưng để trống; chưa có Playwright/E2E test.  
**Nguồn TC:** `docs/06-testing/testcase.md` (51 TC). Requirement, expected result và business rule không bị thay đổi.

## E2E Playwright

- Playwright Test `1.63.0` và Chromium đã được cài; cấu hình tại `playwright.config.ts`, chỉ chạy project Chromium.
- `BASE_URL` lấy từ `.env.e2e.local`, mặc định theo URL web test đã cung cấp. Tài khoản được lưu trong `.env.e2e.local`; file này bị `.gitignore` bỏ qua và không được commit.
- `tests/e2e/` hiện không có spec. `e2e-scenarios.md` có 11 scenario: **0 READY, 8 BLOCKED, 3 NEEDS CONFIRMATION**. Theo phạm vi yêu cầu chỉ viết test cho READY, nên chưa tạo Playwright test nào và không thực hiện hành trình đăng nhập/thay đổi dữ liệu trên web.
- Execution: **0 test — 0 PASS, 0 FAIL, 0 BLOCKED**. Chưa có test execution; không được hiểu số này là business case đã PASS.
- E2E Scenario coverage: 11 scenario được rà trạng thái; chưa scenario nào được tự động hóa/chạy.
- Business Test Case coverage: 51 TC được trace tới các scenario trong `e2e-scenarios.md`, nhưng **0 TC được execute bằng Playwright**.
- Đã kiểm tra nạp cấu hình bằng `npm.cmd run test:e2e:list`; Playwright đọc config nhưng trả `Error: No tests found` (exit 1), do chưa có scenario READY. Đây không phải kết quả FAIL của một test.
- Evidence được cấu hình lưu tại `test-results/e2e/` (screenshot, trace, video khi test fail) và `playwright-report/` (HTML report). Chưa có report/evidence phát sinh vì không có test được chạy.

Lệnh chạy E2E khi có spec tương ứng với scenario chuyển sang READY:

```powershell
npm.cmd run test:e2e
```

## Kết quả chạy suite

| Layer | Total | PASS | FAIL | BLOCKED | Evidence |
| --- | ---: | ---: | ---: | ---: | --- |
| Unit (backend + frontend) | 117 | 117 | 0 | 0 | `npm.cmd run test:unit` — backend 5 files and frontend 3 files passed |
| Integration | 38 | 0 | 0 | 38 | `npm.cmd --prefix src/backend run test:integration` — 2 suite hooks không kết nối được PostgreSQL tại `localhost:5432`; 38 test bị skip trước khi chạy |
| API | 22 | 22 | 0 | 0 | `npm.cmd --prefix src/backend run test:api` — 1 file passed |

Ba layer Unit + Integration + API: **177 test — 139 PASS, 0 FAIL, 38 BLOCKED**. Unit gồm cả 70 backend tests và 47 frontend component tests.

## Điều kiện môi trường

- Test setup mặc định `DATABASE_URL` thành `postgresql://test:test@localhost:5432/smart_travel_test?schema=public`; biến môi trường này không được set từ shell khi chạy.
- Cổng PostgreSQL `localhost:5432` không nhận kết nối. Không chạy seed/reset, không dùng `src/backend/.env` và không kết nối production DB.
- Đã chạy `npm.cmd ci --no-audit --no-fund` theo lockfile để cài dependencies và `npm.cmd --prefix src/backend run db:generate` để sinh Prisma Client. `db:generate` chỉ tạo client, không migrate hoặc ghi DB.

## Điều chỉnh test-only

- Chuyển 8 suite backend hiện có từ `src/backend/src/**` vào `tests/unit`, `tests/integration`, `tests/api`; không bỏ test vì fail.
- Cập nhật Vitest include và scripts theo layer; thêm script `test:api` ở root/backend.
- Chuyển các component test frontend vào `tests/unit/frontend` và cấu hình jsdom chạy tại vị trí mới.
- Bổ sung API permission checks cho Travel Admin approve và Finance close; kiểm tra response, role và lời gọi service.
- `ai.client.test.ts` cũ mock `@google/genai`, trong khi implementation hiện gọi Groq qua `fetch`. Đổi test mock thành deterministic mock cho HTTP Groq hiện tại và giữ các mục tiêu/assertion hành vi sẵn có; không gọi provider thật.
- Lần chạy đầu sau khi chuyển file phát hiện import path test sai; chỉ sửa import path của test, không đổi expected/business rule. Unit/API đã chạy lại và PASS.

## Traceability tới Test Case hiện tại

Không đánh dấu PASS cho TC chỉ vì có test tầng thấp hơn cùng chủ đề. Trong `testcase.md`, không có TC nào được gán Layer Unit hoặc API; 47 TC thuộc UI/E2E nên nằm ngoài phạm vi task này. Bốn TC Integration cũng chưa có automated test khớp hành vi trong các suite đã chuyển và cần DB để execute, vì vậy được ghi BLOCKED.

Traceability status: **51 BLOCKED** (47 UI/E2E ngoài phạm vi; 4 Integration chưa có test khớp TC và test DB không khả dụng). Không gắn PASS/FAIL của suite với TC khi chưa có trace trực tiếp.

| TC ID | US | Layer | Test File | Status | Reason |
| --- | --- | --- | --- | --- | --- |
| TC-001 | US-01 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-002 | US-01 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-003 | US-01 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-004 | US-01 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-005 | US-01 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-006 | US-01 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-007 | US-02 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-008 | US-02 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-009 | US-03 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-010 | US-03 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-011 | US-03 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-012 | US-03 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-013 | US-03 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-014 | US-03 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-015 | US-04 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-016 | US-04 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-017 | US-04 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-018 | US-05 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-019 | US-05 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-020 | US-05 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-021 | US-05 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-022 | US-05 | Integration | — | BLOCKED | Chưa có automated test khớp TC này; PostgreSQL test DB không khả dụng. |
| TC-023 | US-06 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-024 | US-06 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-025 | US-06 | Integration | — | BLOCKED | Chưa có automated test khớp TC này; PostgreSQL test DB không khả dụng. |
| TC-026 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-027 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-028 | US-07 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-029 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-030 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-031 | US-07 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-032 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-033 | US-07 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-034 | US-08 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-035 | US-08 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-036 | US-08 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-037 | US-08 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-038 | US-09 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-039 | US-09 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-040 | US-09 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-041 | US-09 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-042 | US-09 | UI | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-043 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-044 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-045 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-046 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-047 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-048 | US-10 | Integration | — | BLOCKED | Chưa có automated test khớp TC này; PostgreSQL test DB không khả dụng. |
| TC-049 | US-10 | Integration | — | BLOCKED | Chưa có automated test khớp TC này; PostgreSQL test DB không khả dụng. |
| TC-050 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |
| TC-051 | US-10 | E2E | — | BLOCKED | Layer UI/E2E ngoài phạm vi task; chưa viết/chạy E2E. |

## Test file execution trace

| Test File | Layer | Status | Reason |
| --- | --- | --- | --- |
| `tests/unit/ai.client.test.ts` | Unit | PASS | Groq fetch deterministic mock; không gọi AI thật |
| `tests/unit/ai.service.test.ts` | Unit | PASS | Prisma và AI client mock |
| `tests/unit/auth.guard.test.ts` | Unit | PASS | Auth middleware |
| `tests/unit/role.guard.test.ts` | Unit | PASS | Role middleware |
| `tests/unit/trip.validator.test.ts` | Unit | PASS | Trip schema và validator |
| `tests/unit/frontend/LoginForm.test.tsx` | Unit | PASS | Frontend component tests (jsdom) |
| `tests/unit/frontend/PolicyBanner.test.tsx` | Unit | PASS | Frontend component tests (jsdom) |
| `tests/unit/frontend/TripRequestForm.test.tsx` | Unit | PASS | Frontend component tests (jsdom) |
| `tests/integration/itinerary.apply.test.ts` | Integration | BLOCKED | `beforeAll` không kết nối PostgreSQL test DB |
| `tests/integration/concurrency.test.ts` | Integration | BLOCKED | `beforeAll` không kết nối PostgreSQL test DB |
| `tests/api/trips.api.test.ts` | API | PASS | Supertest, body/status/auth/validation/state, Employee/Manager/Travel Admin/Finance; Prisma/service mocked |

## FAIL và Bug Candidate

- FAIL: không có test assertion nào FAIL.
- Bug Candidate: không ghi nhận. Integration suite chưa chạy được nên không kết luận về hành vi DB.

## Lệnh chạy lại

```powershell
npm.cmd run test:unit
npm.cmd --prefix src/backend run test:integration
npm.cmd --prefix src/backend run test:api
```

Để chạy Integration, cần khởi động PostgreSQL riêng cho test tại `localhost:5432`, tạo/migrate đúng database `smart_travel_test`, rồi chạy lại suite. Không trỏ test tới database phát triển/production.

