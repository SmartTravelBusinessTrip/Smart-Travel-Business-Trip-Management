# Nhật ký thay đổi (Changelog)

## Chưa phát hành
### Nâng cấp dự kiến
- Cải thiện typing Prisma và xử lý lỗi type payload sinh ra từ Prisma
- Tăng cường kiểm tra biến môi trường và validate khởi động ứng dụng
- Mở rộng test tự động cho các trường hợp biên và tình huống đồng thời
- Cải thiện trải nghiệm dashboard và tính rõ ràng của thông báo
- Bảo mật và monitor API tốt hơn trước khi triển khai rộng rãi

## v1.0.0 — 2026-10-10
### Đã thêm
- Thiết lập monorepo ban đầu cho backend và frontend
- Chức năng tạo yêu cầu đi công tác cho nhân viên, hỗ trợ lưu nháp
- Tích hợp AI tạo lịch trình theo mô hình Groq-compatible SDK
- Kiểm tra chính sách và ràng buộc nghiệp vụ cho yêu cầu đi công tác
- Luồng phê duyệt cho quản lý và quản trị viên du lịch
- Gửi chi phí công tác và kiểm tra chênh lệch biến động chi phí
- Trung tâm thông báo với trạng thái stream/read
- Dashboard tổng quan cho trạng thái trip và expense
- Xuất PDF cho hồ sơ và báo cáo liên quan
- Dữ liệu demo và tài khoản mẫu cho kiểm thử cục bộ

### Đã thay đổi
- Chuẩn hóa cách cài đặt theo root workspace
- Làm rõ yêu cầu `.env` của backend và cách xử lý port mặc định
- Cập nhật tài liệu để phù hợp với cấu trúc code và route thực tế
- Đồng bộ traceability với file nghiệp vụ, service và test thực tế

### Đã sửa
- Điều chỉnh hướng dẫn setup backend và lỗi lệch port khi thiếu `.env`
- Sửa README và Runbook để phù hợp với cấu trúc workspace thực tế
- Sửa các tham chiếu traceability theo đúng service `policy.service.ts`, `policyRules.ts`, `expense.service.ts`
- Thêm file `.env.example` cho backend
- Cập nhật ví dụ phản hồi `/health` theo payload thực tế của ứng dụng

### Vấn đề còn tồn tại
- Một số lỗi TypeScript trong backend vẫn còn liên quan đến Prisma payload typings ở layer controller/service
- Việc kiểm thử local cần được thực hiện với cấu hình `.env` và PostgreSQL chính xác
- Việc hardening cho môi trường production chưa được triển khai trong phiên bản demo hiện tại

## Ghi chú lịch sử phiên bản
Đây là lần đầu tiên dự án được ghi nhận với một bản phát hành tài liệu rõ ràng. Mục tiêu của phiên bản này là hỗ trợ học tập, minh họa quy trình và kiểm thử chức năng cục bộ, không phải là một bản release production hoàn chỉnh.
