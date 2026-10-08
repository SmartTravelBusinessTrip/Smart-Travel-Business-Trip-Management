# Bug Log

Danh sách này tổng hợp các lỗi và finding đã được ghi nhận trong QA/test artifacts của repository. Đây chưa phải xác nhận rằng mọi phần của hệ thống đã được kiểm thử đầy đủ; bổ sung entry khi có lỗi mới kèm evidence và cập nhật trạng thái sau khi verify.

## Open bugs

Nguồn execution: integration run ngày 2026-10-07 trên Railway `testing`; 38 tests, 29 PASS, 9 FAIL, 0 skipped. Các dòng dưới đây là chín test failures đã được QA report ghi nhận. Chưa xác định root cause chung, nên không gộp chúng thành một lỗi duy nhất.

| ID | Mức độ | Khu vực | Lỗi quan sát được | Expected / actual | Evidence | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | Chưa phân loại | Itinerary apply / audit | Batch và single-item payload cùng endpoint không tạo audit record như mong đợi. | Expected audit count `1`; actual `0`. | `tests/integration/itinerary.apply.test.ts` — “accepts batch and existing single-item payloads on the same POST endpoint”; `docs/08-quality/QA-report.md`. | OPEN — cần điều tra audit transaction/write. |
| BUG-002 | Chưa phân loại | Itinerary apply / trip lookup | Thao tác itinerary cho trip fixture không tìm thấy trip. | Expected request thành công; actual `TRIP_NOT_FOUND`. | `tests/integration/itinerary.apply.test.ts` — “keeps manual additions false and preserves read/update/delete”. | OPEN — cần kiểm tra fixture, transaction và trip lookup. |
| BUG-003 | Chưa phân loại | Itinerary apply / AI batch | Trip hoặc itinerary fixture không sẵn có khi kiểm tra cờ AI và số lượng item. | Expected trip/items hiện diện; actual `TRIP_NOT_FOUND`. | `tests/integration/itinerary.apply.test.ts` — “flags every AI item and counts only the actual AI batch, excluding existing/manual items”. | OPEN — cần kiểm tra fixture, transaction và trip lookup. |
| BUG-004 | Chưa phân loại | Itinerary apply / rollback audit | Database insert failure vẫn để lại success audit sau rollback. | Expected audit count `0`; actual `1`. | `tests/integration/itinerary.apply.test.ts` — “rolls back on a database insert failure without a success audit”. | OPEN — cần xác minh audit có cùng transaction và rollback. |
| BUG-005 | Chưa phân loại | Concurrent approvals | Hai quyết định approve đồng thời trả lỗi server thay vì một request bị conflict. | Expected status `[200, 409]`; actual `[200, 500]`; log `Transaction API error: Transaction not found`. | `tests/integration/concurrency.test.ts` — “two manager decisions: approve versus approve”. | OPEN — lỗi transaction/concurrency. |
| BUG-006 | Chưa phân loại | Expense submit / notification | Submit expense đồng thời không hoàn tất khi notification được tạo. | Expected submit `200`; actual `500`; transaction unavailable trong lúc tạo notification. | `tests/integration/concurrency.test.ts` — “expense item racing submit leaves an internally consistent variance snapshot”. | OPEN — kiểm tra transaction lifetime và notification side effect. |
| BUG-007 | Chưa phân loại | Trip close / itinerary / notification | Mutation itinerary đồng thời với close trả lỗi transaction thay vì serialized success. | Expected itinerary mutation `200`; actual `500`; log `Transaction API error: Transaction not found` khi tạo notification. | `tests/integration/concurrency.test.ts` — “close racing itinerary mutation permits only writes serialized before close”. | OPEN — lỗi transaction/concurrency. |
| BUG-008 | Chưa phân loại | Concurrent trip creation | Tạo trip đồng thời không trả thành công cho cả hai request. | Expected status `[201, 201]`; actual `[201, 500]`; log `Transaction API error: Transaction not found`. | `tests/integration/concurrency.test.ts` — “concurrent trip creation allocates unique codes, including after deletion”. | OPEN — lỗi transaction/concurrency. |
| BUG-009 | Chưa phân loại | Expense item update/delete | Hai thao tác đồng thời không cùng hoàn tất; một thao tác trả lỗi server. | Expected `[200, 204]`; actual `[500, 204]`. | `tests/integration/concurrency.test.ts` — “expense item update versus delete keeps the header sum exact”. | OPEN — kiểm tra transaction, locking và cập nhật tổng. |

### Pattern cần điều tra

- Nhiều concurrency failure phát sinh `Transaction API error: Transaction not found` và HTTP 500 ở `mutation.service.ts`, `notification.service.ts` hoặc `audit.service.ts`.
- Nhóm itinerary apply có trip không tìm thấy và audit không khớp với kết quả rollback.
- QA report cũng liệt kê `trip.service.ts`, `expense.service.ts` và `itinerary.service.ts` trong các vùng code liên quan. Đây là vùng cần trace; chưa đủ evidence để kết luận nguyên nhân gốc.

## Verification findings (chưa xác nhận là bug)

| ID | Khu vực | Finding / điều kiện đóng | Evidence hiện có | Trạng thái |
| --- | --- | --- | --- | --- |
| QA-Q-05 | PDF (`US-10`, AC 10.2) | Cần gọi endpoint thực tế, xác nhận `Content-Type: application/pdf`, tên file `.pdf` và các quyền/trạng thái theo TC-046–049. | Code controller khai báo PDF content type và filename; chưa có execution evidence. | PENDING VERIFICATION — không kết luận là bug cho tới khi chạy xác minh. |
| QA-Q-06 | Notification (`US-10`, AC 10.1) | Cần xác minh tạo notification khi approve/reject/close, mark-read đơn và read-all. | Chưa có execution evidence theo `docs/06-testing/qa-verification.md`. | PENDING VERIFICATION — không kết luận là bug cho tới khi chạy xác minh. |
| E2E-07 | Expense re-approval | Tài liệu dùng `PENDING_MANAGER_APPROVAL`, implementation dùng `MANAGER_REAPPROVE` và UI có nhãn khác; cần BA/PO thống nhất expected status/label. | `docs/06-testing/e2e-scenarios.md`, `docs/06-testing/e2e-readiness.md`. | NEEDS CONFIRMATION — yêu cầu chưa chốt, chưa phải defect đã xác nhận. |

## Resolved / historical items

| ID | Mô tả | Trạng thái hiện tại | Nguồn |
| --- | --- | --- | --- |
| HIST-001 | Hai lần chạy đầu của E2E-01 bị locator strict-mode và thiếu chờ Draft tải xong. Test automation đã được sửa; lần chạy 2026-10-05 PASS. | RESOLVED (automation); không có production fix được ghi nhận. | `docs/08-quality/QA-report.md`, `docs/06-testing/e2e-report.md`. |
| HIST-002 | Integration tests trước đây BLOCKED vì PostgreSQL `localhost:5432` không nhận kết nối. Run ngày 2026-10-07 đã kết nối Railway `testing` và chạy assertions; hiện trạng mới nhất là 9 FAIL ở trên, không còn BLOCKED do kết nối. | SUPERSEDED bởi execution mới hơn; không tính là bug application đang mở. | `docs/06-testing/integration-test-runbook.md`, `docs/08-quality/QA-report.md`. |

## Quy ước cập nhật

- Chỉ ghi bug đã có bước tái hiện hoặc execution evidence; để finding chưa xác minh ở bảng riêng.
- Mỗi bug cần có ID ổn định, expected/actual, nguồn evidence, trạng thái và liên kết tới fix/verification khi có.
- Chỉ chuyển sang RESOLVED sau khi có fix và xác minh lại; ghi ngày chạy và kết quả xác minh.
- Khi một failure đã có root cause chung được chứng minh, có thể liên kết các entry nhưng giữ trace tới từng test case.
