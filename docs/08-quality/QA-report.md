# Test Execution Report

## Integration test execution log — 2026-10-07 (latest run)

- **Command:** `npm.cmd --prefix src/backend run test:integration`
- **Database:** Railway `testing` database; connection succeeded and test fixtures were created.
- **Suites:** `tests/integration/itinerary.apply.test.ts`, `tests/integration/concurrency.test.ts`
- **Result:** 38 tests executed; **29 passed, 9 failed**; 0 skipped.
- **Test files:** 2 failed.
- **Status:** **FAIL** — this run reached application assertions; it is no longer BLOCKED by database connectivity.
- **Main failures:** 4 FIX-06 itinerary-apply tests and 5 FIX-08 concurrency tests.
- **Observed errors:** `Transaction API error: Transaction not found` leading to HTTP 500 responses where tests expected 200/201/409; FIX-06 also showed missing trip/audit records and unexpected audit count.
- **Affected code areas in stack traces:** `mutation.service.ts`, `notification.service.ts`, `audit.service.ts`, `trip.service.ts`, `expense.service.ts`, and `itinerary.service.ts`.
- **Conclusion:** Database setup/migration is working. The remaining failures are application transaction/concurrency or test-fixture isolation issues and require investigation; they must not be recorded as BLOCKED.

**Cập nhật:** 2026-10-07

**Nguồn business Test Case:** `docs/06-testing/testcase.md` (51 TC)
**Phân biệt kết quả:** PASS manual và PASS automated được báo riêng; kết quả của test tầng thấp không tự động quy đổi thành PASS cho business TC.

## Tóm tắt

| Phạm vi | Total | PASS | FAIL | BLOCKED | Ghi chú |
| --- | ---: | ---: | ---: | ---: | --- |
| Unit automation | 117 | 117 | 0 | 0 | Chạy 2026-10-01; backend và frontend |
| Integration automation | 38 | 29 | 9 | 0 | Latest run 2026-10-07 trên Railway `testing`; DB kết nối thành công |
| API automation | 22 | 22 | 0 | 0 | Chạy 2026-10-01; Supertest, mock Prisma/service |
| E2E automation | 1 | 1 | 0 | 0 | E2E-01 chạy 2026-10-05; cover TC-001 và TC-008 |
| **Tổng automated execution** | **178** | **169** | **9** | **0** | Unit + Integration + API + E2E; chưa tính các lần chạy cũ |

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

Kết quả Unit/API dưới đây được giữ từ lần chạy trước; Integration đã được cập nhật theo execution log ngày 2026-10-07.

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
| `tests/integration/itinerary.apply.test.ts` | Integration | FAIL | 3/7 PASS, 4/7 FAIL; lỗi fixture/audit/trip và transaction behavior |
| `tests/integration/concurrency.test.ts` | Integration | FAIL | 26/31 PASS, 5/31 FAIL; lỗi `Transaction API error: Transaction not found` và HTTP 500 |
| `tests/api/trips.api.test.ts` | API | PASS | Supertest; kiểm tra response, validation, auth, role và state; mock Prisma/service |

Unit gồm 117 assertions/tests (70 backend, 47 frontend); Integration latest run có 29 PASS và 9 FAIL; API có 22 tests PASS.

## Môi trường và giới hạn

- Integration latest run dùng Railway `testing` database; connection và migration thành công. 9 assertion/test failures còn lại là lỗi application transaction/concurrency hoặc test-fixture isolation, không phải BLOCKED môi trường.
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

Integration latest run đã kết nối được Railway database trong environment `testing` và đã áp dụng migration. Khi chạy lại, dùng database test cô lập tương tự hoặc PostgreSQL local riêng; không trỏ test tới database phát triển hoặc production.
