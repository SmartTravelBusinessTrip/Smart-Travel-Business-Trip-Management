# E2E Automation Demo Report

## Lần chạy mới nhất — E2E-01 business flow (2026-10-05)

### E2E ID

E2E-01 — Nhân viên tạo yêu cầu, bỏ qua AI và gửi duyệt.

### Scenario

Employee tạo Trip hợp lệ, lưu Draft, mở lại, bỏ qua AI bằng “Tiếp tục”, rồi gửi duyệt.

### User Story

US-01, US-02, US-04.

### Test Case liên quan

TC-001, TC-008.

### Steps đã automation

1. Đăng nhập bằng account Employee lấy từ environment variables.
2. Tạo Trip với dữ liệu hợp lệ và chọn “Lưu nháp”.
3. Mở lại Draft từ dashboard.
4. Chọn “Tiếp tục” qua bước lịch trình mà không bấm “Sinh lịch trình bằng AI”.
5. Chọn “Tiếp tục” sang bước xem lại và bấm “Gửi yêu cầu duyệt”.
6. Xác minh kết quả gửi duyệt trên response API và trạng thái Trip ở dashboard.

### Expected Result

Trip được lưu ở trạng thái Draft; có thể bỏ qua bước AI; sau gửi, yêu cầu chuyển sang trạng thái đã gửi duyệt.

### Actual Result

Playwright hoàn tất toàn bộ flow. Trip được tạo và hiển thị ban đầu là “Bản nháp”; sau khi mở lại, nút “Tiếp tục” chuyển qua bước lịch trình mà không gọi AI; submit trả về `SUBMITTED`, trang xác nhận “Đã gửi yêu cầu duyệt” và dashboard hiển thị “Chờ duyệt cấp 1”. Kết quả cuối: **1 passed, 0 failed, 0 skipped**.

### Status

**PASS** — Bản scenario hiện tại chỉ tham chiếu TC-001 và TC-008; hành vi lưu Draft, bỏ qua AI và gửi duyệt đã được kiểm tra end to end. Một locator ambiguity và việc chờ form tải Draft đã được sửa trong test code trước lần chạy PASS; production code không thay đổi. Trip đã gửi được giữ trong test environment để reset; ứng dụng chỉ cho xóa Trip khi còn Draft.

### Evidence

- Spec: `tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts`
- Lệnh chạy: `npm.cmd run test:e2e -- tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts`
- HTML report: `playwright-report/index.html`
- Test attachment chứa mã Trip, ID và trạng thái cuối.
- Screenshot/trace/video chỉ được giữ khi fail theo cấu hình; lần PASS không tạo screenshot/trace.

### Thời gian chạy

2026-10-05 10:02 (+07:00), test runtime 9 giây (Playwright tổng kết khoảng 11.5 giây).

### Dữ liệu test và lần chạy đầu

- QA/DevOps đã xác nhận URL là môi trường test biệt lập và cho phép dọn/reset dữ liệu. Trip được gửi duyệt nên không thể xóa bằng thao tác xóa Draft thông thường; cần reset/dọn Trip test sau demo. Mã và ID cụ thể có trong attachment của HTML report.
- Lần chạy đầu dừng ở locator strict-mode; lần tiếp theo bấm “Tiếp tục” trước khi dữ liệu Draft tải xong. Hai lỗi được sửa trong test code; lần chạy cuối PASS.

---


