# Test Execution Report

**Cập nhật:** 2026-10-05

**Nguồn business Test Case:** `docs/06-testing/testcase.md` (51 TC)
**Phân biệt kết quả:** PASS manual và PASS automated được báo riêng; kết quả của test tầng thấp không tự động quy đổi thành PASS cho business TC.

## Tóm tắt

| Phạm vi | Total | PASS | FAIL | BLOCKED | Ghi chú |
| --- | ---: | ---: | ---: | ---: | --- |
| Unit automation | 117 | 117 | 0 | 0 | Chạy 2026-10-01; backend và frontend |
| Integration automation | 38 | 0 | 0 | 38 | PostgreSQL test DB tại `localhost:5432` không khả dụng trong lần chạy 2026-10-01 |
| API automation | 22 | 22 | 0 | 0 | Chạy 2026-10-01; Supertest, mock Prisma/service |
| E2E automation | 1 | 1 | 0 | 0 | E2E-01 chạy 2026-10-05; cover TC-001 và TC-008 |
| **Tổng automated execution** | **178** | **140** | **0** | **38** | Unit + Integration + API + E2E |

## Manual Business Test Case Coverage

Theo xác nhận của QA, toàn bộ **51/51 TC** trong `testcase.md` đã được thực thi manual và đánh dấu **PASS**. Đây là kết quả manual do QA xác nhận; report này không kèm execution log, ngày chạy riêng hoặc ảnh chụp cho từng TC.

| Nhóm | Total | Manual PASS | Manual FAIL | Manual BLOCKED |
| --- | ---: | ---: | ---: | ---: |
| US-01 đến US-10 | 51 | 51 | 0 | 0 |

## E2E Playwright — E2E-01

- **Scenario:** Nhân viên tạo yêu cầu, lưu Draft, bỏ qua AI bằng “Tiếp tục” và gửi duyệt.
- **User Story:** US-01, US-02, US-04 (scenario source); business TC được cover là TC-001 và TC-008.
- **Kết quả:** **1 PASS, 0 FAIL, 0 BLOCKED.** Trip được tạo ở trạng thái Draft; Employee tiếp tục qua bước lịch trình không sinh AI; submit trả trạng thái `SUBMITTED`; UI hiển thị “Đã gửi yêu cầu duyệt” và dashboard hiển thị “Chờ duyệt cấp 1”.
- **Thời gian:** 2026-10-05 khoảng 10:02 (+07:00), runtime khoảng 9 giây.
- **Spec:** `tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts`
- **Lệnh:** `npm.cmd run test:e2e -- tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts`
- **HTML report:** `playwright-report/index.html`.
- Environment URL đã được QA/DevOps xác nhận là test biệt lập. Trip đã gửi duyệt được giữ lại để reset sau demo; thao tác xóa thông thường chỉ cho phép Trip ở trạng thái Draft.
- Hai lần chạy đầu dừng do lỗi automation (locator strict-mode và thiếu chờ Draft tải xong); test code được sửa và lần chạy cuối PASS. Không sửa production code.

### Traceability business TC ↔ automated test

| TC ID | Manual status | Automated status | Test file / ghi chú |
| --- | --- | --- | --- |
| TC-001 | PASS (QA xác nhận) | PASS | `tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts` |
| TC-008 | PASS (QA xác nhận) | PASS | `tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts` |
| TC-002–007, TC-009–051 | PASS (QA xác nhận) | Chưa chạy automated execution được trace trực tiếp tới TC | Không suy diễn từ kết quả Unit/API/Integration |

## Unit, Integration và API execution

Kết quả dưới đây được giữ từ lần chạy 2026-10-01; các suite này chưa được chạy lại trong lần cập nhật report này.

| Test file | Layer | Status | Kết quả |
| --- | --- | --- | --- |
| `tests/unit/ai.client.test.ts` | Unit | PASS | Mock HTTP Groq deterministic; không gọi AI thật |
| `tests/unit/ai.service.test.ts` | Unit | PASS | Prisma và AI client mock |
| `tests/unit/auth.guard.test.ts` | Unit | PASS | Auth middleware |
| `tests/unit/role.guard.test.ts` | Unit | PASS | Role middleware |
| `tests/unit/trip.validator.test.ts` | Unit | PASS | Trip schema và validator |
| `tests/unit/frontend/LoginForm.test.tsx` | Unit | PASS | Frontend component test |
| `tests/unit/frontend/PolicyBanner.test.tsx` | Unit | PASS | Frontend component test |
| `tests/unit/frontend/TripRequestForm.test.tsx` | Unit | PASS | Frontend component test |
| `tests/integration/itinerary.apply.test.ts` | Integration | BLOCKED | Không kết nối được PostgreSQL test DB tại `localhost:5432` |
| `tests/integration/concurrency.test.ts` | Integration | BLOCKED | Không kết nối được PostgreSQL test DB tại `localhost:5432` |
| `tests/api/trips.api.test.ts` | API | PASS | Supertest; kiểm tra response, validation, auth, role và state; mock Prisma/service |

Unit gồm 117 assertions/tests (70 backend, 47 frontend); Integration có 38 tests bị block bởi suite setup; API có 22 tests PASS. Không có assertion nào FAIL trong lần chạy đó.

## Môi trường và giới hạn

- Integration dùng test database `smart_travel_test` tại `localhost:5432`; PostgreSQL không nhận kết nối trong lần chạy được ghi nhận.
- Không chạy seed/reset và không kết nối database production.
- Test data E2E-01 thuộc deployed test environment biệt lập; cần reset Trip đã gửi duyệt sau demo.
- 51 status manual PASS phản ánh xác nhận của QA trong `testcase.md`; báo cáo không có bộ evidence manual theo từng TC.

## Lệnh chạy lại

```powershell
npm.cmd run test:unit
npm.cmd --prefix src/backend run test:integration
npm.cmd --prefix src/backend run test:api
npm.cmd run test:e2e -- tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts
```

Để Integration chạy được, cần khởi động PostgreSQL riêng cho test, tạo/migrate database `smart_travel_test`, rồi chạy suite. Không trỏ test tới database phát triển hoặc production.
