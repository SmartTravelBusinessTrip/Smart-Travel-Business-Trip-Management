# Bản ghi phát hành (Release Notes)

## Thông tin phát hành
- Tên dự án: Smart Travel & Business Trip Management
- Phiên bản: v1.0.0
- Loại phát hành: Phiên bản demo / học tập / kiểm thử cục bộ

## Mục tiêu phát hành
Phiên bản này xây dựng hệ thống quản lý công tác phí và đi công tác nội bộ với mục tiêu hỗ trợ quy trình từ khi nhân viên tạo yêu cầu đi công tác, lập lịch trình, kiểm tra chính sách, duyệt cấp quản lý, theo dõi chi phí, đến khi đóng hồ sơ và xuất báo cáo. Dự án tập trung vào việc mô phỏng quy trình nghiệp vụ thực tế trong môi trường học tập và kiểm thử cục bộ.

## Tổng quan chức năng
Hệ thống cung cấp các chức năng chính sau:
- Tạo và lưu trữ yêu cầu đi công tác dưới dạng bản nháp hoặc gửi duyệt
- Tạo lịch trình đi công tác bằng hỗ trợ AI và chỉnh sửa thủ công
- Kiểm tra chính sách (policy check) trước khi duyệt
- Xử lý quy trình phê duyệt theo vai trò: nhân viên, quản lý, quản trị viên du lịch, kế toán, quản trị hệ thống
- Quản lý chi phí và kiểm tra chênh lệch biến động chi phí
- Theo dõi thông báo và trạng thái xử lý công việc
- Trình bày dashboard tổng quan cho người dùng
- Xuất file PDF phục vụ báo cáo và hồ sơ đi công tác

## Phạm vi phát hành
### Quy trình nghiệp vụ chính
- Tạo yêu cầu đi công tác
- Sinh lịch trình bằng AI hoặc chỉnh sửa thủ công
- Duyệt cấp 1 và cấp 2 theo luồng nghiệp vụ
- Gửi và xử lý chi phí công tác
- Đóng hồ sơ và đánh dấu hoàn tất

### Vai trò người dùng
- Nhân viên
- Quản lý
- Quản trị viên du lịch
- Kế toán
- Quản trị hệ thống

### Công nghệ triển khai
- Backend: Node.js + Express + TypeScript
- Frontend: React + Vite
- Database: PostgreSQL + Prisma ORM
- Xác thực: JWT + phân quyền theo vai trò
- Tích hợp AI: Groq-compatible SDK
- Giao tiếp API: RESTful API

## Môi trường mục tiêu
Phiên bản này được thiết kế cho các môi trường sau:
- phát triển cục bộ
- demo trên lớp
- kiểm thử chức năng và QA
- học tập, minh họa quy trình nghiệp vụ

## Điều kiện tiên quyết
- Node.js >= 20
- npm >= 9
- PostgreSQL đang chạy ở local hoặc thông qua Docker
- Có khóa API Groq hợp lệ nếu muốn sử dụng tính năng AI
- Cần file `.env` cho backend được cấu hình đúng

## Hướng dẫn chạy nhanh
1. Cài đặt dependency ở thư mục gốc:
   ```bash
   npm install
   ```
2. Sao chép mẫu môi trường backend và cấu hình lại các giá trị cần thiết:
   ```bash
   cp src/backend/.env.example src/backend/.env
   ```
3. Tạo hoặc xác nhận database PostgreSQL có tên `smart_travel`.
4. Thiết lập schema và seed dữ liệu mẫu:
   ```bash
   npm run db:setup
   ```
5. Khởi động backend:
   ```bash
   npm run dev:be
   ```
6. Khởi động frontend:
   ```bash
   npm run dev:fe
   ```
7. Truy cập giao diện web tại: `http://localhost:5173`

## Tài khoản demo
Dữ liệu mẫu đã được seed sẵn để người dùng có thể kiểm tra nhanh luồng nghiệp vụ.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Nhân viên | `nhanvien@smarttravel.vn` | `12345678` |
| Quản lý | `truongphong@smarttravel.vn` | `12345678` |
| Quản trị viên du lịch | `admin@smarttravel.vn` | `12345678` |
| Kế toán | `ketoan@smarttravel.vn` | `12345678` |

## Tình trạng phát hành
### Trạng thái chức năng
Ứng dụng hiện đang đáp ứng các luồng nghiệp vụ chính của hệ thống từ tạo yêu cầu, xét duyệt, theo dõi chi phí đến báo cáo và thông báo. Đây là phiên bản đủ để kiểm tra tính khả dụng của luồng chính trong môi trường học tập.

### Hạn chế hiện tại
- Một số lỗi TypeScript ở backend vẫn còn tồn tại trong nhánh hiện tại và cần được xử lý trước khi nâng cấp lên môi trường production.
- Cấu hình database và môi trường phải đúng; nếu thiếu `.env` hoặc cấu hình DB sai, hệ thống có thể không khởi động đúng port như mong muốn.
- Tính năng AI phụ thuộc vào khóa API Groq hợp lệ, nếu không có khóa thì các chức năng AI sẽ không hoạt động đầy đủ.

## Ghi chú vận hành
- Backend mặc định chạy ở port `3001` nếu không có biến `PORT` trong `.env`; trong môi trường chuẩn của dự án, port thực tế cần là `5000`.
- Frontend đã được cấu hình proxy API về `http://localhost:5000`.
- Nên kiểm tra endpoint `/health` sau khi backend khởi động để xác nhận service đang chạy ổn định.

## Tiêu chí hoàn tất phiên bản
Phiên bản này được xem là đủ dùng cho mục đích học tập và demo nếu các điều kiện sau được thỏa mãn:
- Database PostgreSQL đã được tạo và seed thành công
- Backend khởi động mà không gặp lỗi môi trường nghiêm trọng
- Frontend gọi đúng API backend và không lỗi proxy
- Đăng nhập bằng tài khoản demo hoạt động bình thường
- Có thể tạo trip, xét duyệt qua các vai trò và theo dõi trạng thái
- Chi phí và thông báo hiển thị đúng trong dashboard

## Kết luận
Phiên bản v1.0.0 là một bản phát hành đầu tiên của hệ thống, tập trung vào việc triển khai đầy đủ vòng đời nghiệp vụ chính của ứng dụng quản lý đi công tác doanh nghiệp. Đây là nền tảng phù hợp cho mục tiêu học tập, kiểm thử chức năng và demo mô hình hệ thống, đồng thời tạo tiền đề cho các giai đoạn nâng cấp sau này.
