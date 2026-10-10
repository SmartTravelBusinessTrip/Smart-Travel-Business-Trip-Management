# Traceability Matrix

Dự án: Smart Travel & Business Trip Management
Nhóm: Nhóm 11 — MIS3032_1

File này nối yêu cầu nghiệp vụ với user story, business rule, API, model dữ liệu, code và test thực tế trong repo.

## 1. Nguồn tham chiếu

- Requirements: [02-vault/02-requirements/requirements.md](02-vault/02-requirements/requirements.md)
- Business rules: [02-vault/03-domain/business-rules.md](02-vault/03-domain/business-rules.md)
- User stories: [03-product/user-stories.md](03-product/user-stories.md)
- Architecture / API: [05-technical/architecture.md](05-technical/architecture.md), [05-technical/API.md](05-technical/API.md)
- Data model: [schema.prisma](../src/backend/src/prisma/schema.prisma)
- Routes: [src/backend/src/routes](../src/backend/src/routes)
- Test case (theo US): [06-testing/testcase.md](06-testing/testcase.md)
- Kịch bản E2E: [06-testing/e2e-scenarios.md](06-testing/e2e-scenarios.md)
- Automated tests: [tests](../tests)

Cột "Business rule" lấy theo bảng ở cuối [user-stories.md](03-product/user-stories.md).

## 2. Ma trận chính: REQ → User Story → Business Rule → API → Model

| Requirement | User story | Business rule | API / feature | Data model | Code chính |
|---|---|---|---|---|---|
| REQ-TR-01 Tạo Trip Request | US-01 | BR-TR-01, BR-TR-02, BR-TR-03, BR-TR-08 | `GET/POST/PATCH/DELETE /api/v1/trips` | `Trip`, `PolicyCheckResult` | `trips.routes.ts`, `trip.controller.ts`, `trip.service.ts` |
| REQ-TR-02 AI Itinerary | US-02 | BR-TR-07 | `POST /api/v1/ai/generate-itinerary` | `ItineraryItem` | `ai.routes.ts`, `ai.controller.ts`, `ai.service.ts`, `ai.client.ts` |
| REQ-TR-03 Policy Check | US-04 | BR-TR-03, BR-TR-04, BR-TR-08 | `POST /api/v1/trips/:id/submit` | `PolicyCheckResult`, `Trip.isUrgent`, `Trip.requiresLevel2` | `policy.service.ts`, `policyRules.ts` |
| REQ-TR-04 Manager duyệt cấp 1 | US-05 | BR-TR-04 | `POST /api/v1/trips/:id/approve`, `POST /api/v1/trips/:id/reject` | `Trip.status`, `ApprovalRecord` | `trips.routes.ts`, `approval.service.ts` |
| REQ-TR-05 Travel Admin duyệt cấp 2 | US-06 | BR-TR-04 | `POST /api/v1/trips/:id/approve` (role `TRAVEL_ADMIN`) | `Trip.status`, `ApprovalRecord` | `role.guard.ts`, `approval.service.ts` |
| REQ-TR-06 Itinerary Builder | US-03 | BR-TR-01, BR-TR-08 | `GET/POST/PATCH/DELETE /api/v1/trips/:id/itinerary` | `ItineraryItem` | `itinerary.routes.ts`, `itinerary.controller.ts`, `itinerary.service.ts` |
| REQ-TR-07 Expense Claim | US-07 | BR-TR-05 | `GET/POST/PATCH /api/v1/trips/:id/expense`, `POST/PATCH/DELETE /api/v1/trips/:id/expense/items[/:itemId]` | `Expense`, `ExpenseItem` | `expense.routes.ts`, `expense.controller.ts`, `expense.service.ts` |
| REQ-TR-08 Variance | US-07 | BR-TR-05 | `POST /api/v1/trips/:id/expense/submit` | `Expense.variancePct`, `Expense.varianceAmount`, `Expense.totalActual` | `expense.service.ts` |
| REQ-TR-09 Finance Close | US-08 | BR-TR-05, BR-TR-06 | `POST /api/v1/trips/:id/expense/approve`, `.../expense/reject`, `.../expense/reapprove`, `POST /api/v1/trips/:id/close` | `Expense`, `Trip.closedAt`, `Notification` | `expense.routes.ts`, `trips.routes.ts`, `expense.service.ts` |
| REQ-TR-10 Dashboard theo vai trò | US-09 | BR-TR-06 | `GET /api/v1/dashboard` | `Trip`, `Expense`, `Notification` | `dashboard.routes.ts`, `dashboard.controller.ts` |
| REQ-TR-11 Thông báo in-app | US-10 | BR-TR-06 | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:notificationId/read`, `PATCH /api/v1/notifications/read-all`, `GET /api/v1/notifications/stream` | `Notification` | `notification.routes.ts`, `notification.controller.ts`, `notification.service.ts`, `sse-emitter.ts` |
| REQ-TR-12 Export PDF | US-10 | BR-TR-06 | `GET /api/v1/trips/:id/export-pdf` | `Trip`, `ItineraryItem`, `Expense`, `ApprovalRecord` | `pdf.routes.ts`, `pdf.controller.ts`, `pdf-generator.ts` |

## 3. Ma trận ngược: User Story → Requirement

| User story | Requirement | Mô tả |
|---|---|---|
| US-01 | REQ-TR-01 | Tạo / cập nhật trip request |
| US-02 | REQ-TR-02 | AI sinh itinerary |
| US-03 | REQ-TR-06 | Itinerary builder |
| US-04 | REQ-TR-03 | Policy check |
| US-05 | REQ-TR-04 | Manager duyệt cấp 1 |
| US-06 | REQ-TR-05 | Travel Admin duyệt cấp 2 |
| US-07 | REQ-TR-07, REQ-TR-08 | Expense claim + variance |
| US-08 | REQ-TR-09 | Finance đóng hồ sơ |
| US-09 | REQ-TR-10 | Dashboard theo vai trò |
| US-10 | REQ-TR-11, REQ-TR-12 | Thông báo + export PDF |

10/10 user story đều map về requirement; không có story mồ côi.

## 4. Business rule → bằng chứng trong code

| BR ID | Quy tắc | Bằng chứng |
|---|---|---|
| BR-TR-01 | Trần khách sạn theo job grade | `policyRules.ts`, `itinerary.service.ts` |
| BR-TR-02 | Phụ cấp công tác (per diem) | `policyRules.ts`, `Trip.perDiemBudget` |
| BR-TR-03 | Nộp trước ≥ 3 ngày làm việc, nếu không là chuyến khẩn cấp | `policyRules.ts`, `policy.service.ts`, `Trip.isUrgent` |
| BR-TR-04 | Ma trận duyệt: ngân sách > 20.000.000 VND hoặc vi phạm policy thì duyệt cấp 2 | `policyRules.ts`, `approval.service.ts`, `role.guard.ts`, `Trip.requiresLevel2` |
| BR-TR-05 | Chi phí vượt dự toán > 10% phải giải trình | `expense.service.ts` |
| BR-TR-06 | Trip `CLOSED` là bất biến | `immutable.guard.ts`, `itinerary.service.ts` |
| BR-TR-07 | AI chỉ sinh trong ngân sách người dùng nhập (guardrail) | `ai.client.ts`, `ai.service.ts` |
| BR-TR-08 | Cảnh báo tổng hợp lưu trú + phụ cấp | `policyRules.ts`, `policy.service.ts` |

## 5. API endpoint traceability

| Endpoint | Requirement | User story | Quyền truy cập |
|---|---|---|---|
| `POST /api/v1/auth/login` | — | — | Public |
| `POST /api/v1/auth/refresh` | — | — | Public |
| `DELETE /api/v1/auth/logout` | — | — | Đã đăng nhập |
| `GET /api/v1/auth/me` | — | — | Đã đăng nhập |
| `GET /api/v1/trips` | REQ-TR-01, REQ-TR-10 | US-01, US-09 | Đã đăng nhập |
| `POST /api/v1/trips` | REQ-TR-01 | US-01 | EMPLOYEE |
| `GET /api/v1/trips/:id` | REQ-TR-01 | US-01 | Đã đăng nhập |
| `PATCH /api/v1/trips/:id` | REQ-TR-01 | US-01 | EMPLOYEE |
| `DELETE /api/v1/trips/:id` | REQ-TR-01 | US-01 | EMPLOYEE |
| `POST /api/v1/trips/:id/submit` | REQ-TR-03 | US-04 | EMPLOYEE |
| `POST /api/v1/trips/:id/start` | — | — | EMPLOYEE |
| `POST /api/v1/trips/:id/end` | — | — | EMPLOYEE |
| `POST /api/v1/trips/:id/approve` | REQ-TR-04, REQ-TR-05 | US-05, US-06 | MANAGER, TRAVEL_ADMIN |
| `POST /api/v1/trips/:id/reject` | REQ-TR-04 | US-05 | MANAGER, TRAVEL_ADMIN |
| `POST /api/v1/trips/:id/close` | REQ-TR-09 | US-08 | FINANCE |
| `GET /api/v1/trips/:id/itinerary` | REQ-TR-06 | US-03 | Đã đăng nhập |
| `POST /api/v1/trips/:id/itinerary` | REQ-TR-06 | US-03 | EMPLOYEE |
| `PATCH /api/v1/trips/:id/itinerary/:itemId` | REQ-TR-06 | US-03 | EMPLOYEE |
| `DELETE /api/v1/trips/:id/itinerary/:itemId` | REQ-TR-06 | US-03 | EMPLOYEE |
| `GET /api/v1/trips/:id/expense` | REQ-TR-07 | US-07 | Đã đăng nhập |
| `POST /api/v1/trips/:id/expense` | REQ-TR-07 | US-07 | EMPLOYEE |
| `PATCH /api/v1/trips/:id/expense` | REQ-TR-07 | US-07 | EMPLOYEE |
| `POST /api/v1/trips/:id/expense/items` | REQ-TR-07 | US-07 | EMPLOYEE |
| `PATCH /api/v1/trips/:id/expense/items/:itemId` | REQ-TR-07 | US-07 | EMPLOYEE |
| `DELETE /api/v1/trips/:id/expense/items/:itemId` | REQ-TR-07 | US-07 | EMPLOYEE |
| `POST /api/v1/trips/:id/expense/submit` | REQ-TR-08 | US-07 | EMPLOYEE |
| `POST /api/v1/trips/:id/expense/approve` | REQ-TR-09 | US-08 | FINANCE |
| `POST /api/v1/trips/:id/expense/reject` | REQ-TR-09 | US-08 | FINANCE |
| `POST /api/v1/trips/:id/expense/reapprove` | REQ-TR-09 | US-08 | MANAGER |
| `GET /api/v1/dashboard` | REQ-TR-10 | US-09 | Đã đăng nhập |
| `GET /api/v1/notifications` | REQ-TR-11 | US-10 | Đã đăng nhập |
| `PATCH /api/v1/notifications/read-all` | REQ-TR-11 | US-10 | Đã đăng nhập |
| `PATCH /api/v1/notifications/:notificationId/read` | REQ-TR-11 | US-10 | Đã đăng nhập |
| `GET /api/v1/notifications/stream` | REQ-TR-11 | US-10 | Token qua query string |
| `GET /api/v1/trips/:id/export-pdf` | REQ-TR-12 | US-10 | Đã đăng nhập |
| `POST /api/v1/ai/generate-itinerary` | REQ-TR-02 | US-02 | EMPLOYEE |

## 6. Test coverage mapping

### 6.1 Automated test (thư mục `tests/`)

| Requirement | Test tự động | Mức phủ |
|---|---|---|
| REQ-TR-01 | `tests/api/trips.api.test.ts`, `tests/unit/trip.validator.test.ts`, `tests/unit/frontend/TripRequestForm.test.tsx`, `tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts` | Có |
| REQ-TR-02 | `tests/unit/ai.client.test.ts`, `tests/unit/ai.service.test.ts`, `tests/integration/itinerary.apply.test.ts` | Có |
| REQ-TR-03 | `tests/api/trips.api.test.ts` (cảnh báo `OVER_20M`), `tests/unit/frontend/PolicyBanner.test.tsx` | Có |
| REQ-TR-04 | `tests/api/trips.api.test.ts` (approve), `tests/unit/role.guard.test.ts` | Có |
| REQ-TR-05 | `tests/api/trips.api.test.ts` (TRAVEL_ADMIN gọi approve), `tests/integration/concurrency.test.ts` (hai lần duyệt cấp 2 chỉ tạo một bản ghi) | Có |
| REQ-TR-06 | `tests/integration/itinerary.apply.test.ts`, `tests/integration/concurrency.test.ts` | Có |
| REQ-TR-07 | `tests/integration/concurrency.test.ts` (thêm/sửa/xóa expense item, tổng chi phí) | Một phần: chưa có API test riêng |
| REQ-TR-08 | `tests/integration/concurrency.test.ts` (variance snapshot khi submit) | Một phần |
| REQ-TR-09 | `tests/api/trips.api.test.ts` (close, quyền FINANCE), `tests/unit/role.guard.test.ts`, `tests/integration/concurrency.test.ts` (double close, reapprove) | Một phần: chưa có API test cho `expense/approve` và `expense/reject` |
| REQ-TR-10 | — | Chưa có test tự động |
| REQ-TR-11 | `tests/integration/concurrency.test.ts` (lỗi lưu notification, lỗi SSE) | Một phần |
| REQ-TR-12 | — | Chưa có test tự động |

Các test dùng chung: `tests/unit/auth.guard.test.ts` (xác thực JWT), `tests/unit/frontend/LoginForm.test.tsx` (đăng nhập).

### 6.2 Test case và kịch bản theo tài liệu

- [06-testing/testcase.md](06-testing/testcase.md): 51 test case (TC-001 đến TC-051), chia theo US-01 đến US-10.
- [06-testing/e2e-scenarios.md](06-testing/e2e-scenarios.md): E2E-01 đến E2E-11. Hiện chỉ E2E-01 có script Playwright (`tests/e2e/`); các kịch bản còn lại chưa tự động hóa.
- Kết quả chạy E2E: [06-testing/e2e-report.md](06-testing/e2e-report.md).

## 7. Coverage summary

- Functional requirements: 12/12 có user story và có route hoặc tính năng tương ứng.
- User stories: 10/10 map về requirement.
- Business rules: 8/8 có bằng chứng trong code.
- Endpoints: map theo route thực tế trong `src/backend/src/routes`.
- Test tự động: REQ-TR-01 đến REQ-TR-06 có test; REQ-TR-07, 08, 09, 11 chỉ phủ một phần; REQ-TR-10 và REQ-TR-12 chưa có test tự động (chỉ có test case thủ công trong `testcase.md`).
