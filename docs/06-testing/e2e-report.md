# E2E Automation Demo Report

## E2E ID

E2E-04 — Manager xử lý yêu cầu trong phạm vi quản lý (chỉ nhánh duyệt một cấp).

## Scenario

Manager đăng nhập, mở yêu cầu `SUBMITTED` của direct report không cần Level 2, phê duyệt cấp 1 và xác minh Trip chuyển `Approved`.

## User Story

US-05

## Test Case liên quan

TC-018 — Manager duyệt yêu cầu một cấp.

## Steps đã automation

1. Đăng nhập bằng account Manager lấy từ environment variables.
2. Mở hàng chờ duyệt cấp 1.
3. Chọn Trip theo `E2E_MANAGER_TRIP_CODE`; kiểm tra đang chờ duyệt cấp 1 và không có dấu hiệu yêu cầu Level 2.
4. Chọn “Phê duyệt cấp 1”.
5. Mở danh sách đã xử lý và xác minh Trip hiển thị `Đã duyệt`.

## Expected Result

Trip `SUBMITTED` của nhân viên trực tiếp, không cần Level 2, được Manager phê duyệt và chuyển `Approved`.

## Actual Result

Lần chạy cuối tải được trang, đăng nhập Manager và xác minh dashboard “Phê duyệt yêu cầu cấp 1”. Test dừng trước khi mở/duyệt Trip vì chưa cấu hình `E2E_MANAGER_TRIP_CODE`; không có dữ liệu nghiệp vụ nào được thay đổi. Hai lần chạy trước gặp timeout tải trang/đăng nhập; tăng thời gian chờ và đổi sang chờ `domcontentloaded` giúp lần chạy cuối đi tới bước kiểm tra fixture.

## Status

**BLOCKED** — thiếu mã Trip test cụ thể; môi trường Railway chưa được xác nhận là deployment cô lập có thể ghi dữ liệu demo.

## Evidence

- HTML report: `playwright-report/index.html` (lần chạy cuối, 1 test skipped).
- Ảnh chụp và trace được bật khi test fail trong `playwright.config.ts`. Lần chạy cuối bị skip theo điều kiện thiếu fixture nên không tạo screenshot/trace; không có PASS evidence.
- Test spec: `tests/e2e/e2e-004-manager-approve.spec.ts`.

## Thời gian chạy

2026-10-01 11:43 (+07:00), lần chạy cuối khoảng 15 giây. Hai lần chạy trước trong cùng phiên không hoàn tất do timeout môi trường.

## Cần chuẩn bị để chạy demo hoàn chỉnh

- **DevOps:** xác nhận URL Railway là môi trường test cô lập; backend/API và database hoạt động, cho phép dùng fixture mà không ảnh hưởng dữ liệu thật.
- **Dev/QA:** tạo một Trip test `SUBMITTED` của direct report, không cần Level 2, có mã nhận diện duy nhất; giữ Trip chưa được xử lý cho tới khi chạy demo.
- **QA:** đặt mã đó vào `E2E_MANAGER_TRIP_CODE` trong `.env.e2e.local`, xác minh account Manager đăng nhập được và fixture xuất hiện đúng hàng chờ.
- Chạy lại: `npm.cmd run test:e2e -- tests/e2e/e2e-004-manager-approve.spec.ts`.
