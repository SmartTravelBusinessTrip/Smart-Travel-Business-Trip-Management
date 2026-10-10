# Yêu cầu phi chức năng về bảo mật (Security NFR)

## Mục tiêu
Tài liệu này định nghĩa mức độ an toàn và các tiêu chuẩn bảo mật kỳ vọng đối với hệ thống Smart Travel & Business Trip Management trong giai đoạn phát triển local, kiểm thử QA và các bước nâng cấp tiếp theo trong môi trường production.

## Mục tiêu bảo mật
- Bảo vệ danh tính người dùng và tính toàn vẹn của phiên làm việc
- Áp dụng phân quyền theo vai trò cho các quy trình nhạy cảm
- Ngăn chặn truy cập trái phép vào API trip, expense và approval
- Validate dữ liệu đầu vào trước khi xử lý logic nghiệp vụ
- Bảo vệ bí mật hệ thống và cấu hình môi trường
- Giảm rủi ro lộ thông tin qua CORS hoặc endpoint công khai
- Duy trì khả năng kiểm tra nhật ký hành động quan trọng của hệ thống

## NFR-Security-01: Xác thực người dùng
Hệ thống phải yêu cầu xác thực cho các route được bảo vệ. JWT, cơ chế refresh token và kiểm tra phân quyền theo vai trò phải được áp dụng trước khi người dùng có thể truy cập các nghiệp vụ quan trọng.

Trạng thái: Đã có cơ sở triển khai theo cấu trúc auth middleware và các route bảo vệ, nhưng cần tiếp tục rà soát tính đầy đủ.

## NFR-Security-02: Ủy quyền theo vai trò
Người dùng chỉ được truy cập vào chức năng phù hợp với vai trò của mình. Ví dụ:
- Nhân viên tạo và quản lý yêu cầu của bản thân
- Quản lý xét duyệt các trip trong phạm vi phụ trách
- Quản trị viên du lịch xử lý duyệt cấp 2
- Kế toán kiểm tra và đóng hồ sơ chi phí
- Admin có quyền giám sát và vận hành hệ thống

Trạng thái: Được định nghĩa trong cấu trúc role guard và route-level authorization của backend.

## NFR-Security-03: Quản lý secret
Các giá trị nhạy cảm như JWT secret, thông tin database và API key của Groq không được lưu trực tiếp vào mã nguồn. Tất cả secret cần lưu trong file môi trường `.env` và loại trừ khỏi bộ điều khiển quản lý phiên bản.

Trạng thái: Cần tuân thủ nghiêm ngặt khi triển khai. File `.env.example` đã có sẵn để làm template, nhưng thông tin thật phải được giữ ở môi trường local riêng và không đưa lên repo.

## NFR-Security-04: Validate đầu vào
Tất cả dữ liệu đầu vào cần được validate và sanitize trước khi xử lý logic. Bao gồm:
- payload trip
- dữ liệu expense
- itinerary data
- thông tin đăng nhập
- payload thông báo và action

Trạng thái: Cấu trúc backend đã có phần validate, nhưng cần liên tục rà soát tính đầy đủ và độ ổn định khi gặp lỗi nghiệp vụ.

## NFR-Security-05: Quản lý phiên làm việc và token
JWT secret cần có độ mạnh cao, độc lập theo môi trường và không lặp lại giữa các hệ thống. Token cần được bảo vệ tốt, không bị lộ ra phía client hoặc log hệ thống.

Trạng thái: Repo có cấu hình secret và route xác thực JWT; trong môi trường production cần triển khai chiến lược rotation và expiry hợp lý hơn.

## NFR-Security-06: Bảo vệ CORS và origin
Backend cần giới hạn nguồn truy cập hợp lệ để tránh việc chấp nhận request từ domain không đáng tin cậy. `CORS_ORIGIN` cần trùng với origin frontend đáng tin cậy và được quy định rõ theo môi trường triển khai.

Trạng thái: Cấu hình local đã có CORS, nhưng môi trường production cần kiểm soát chặt hơn theo whitelist rõ ràng.

## NFR-Security-07: Giới hạn tần suất và chống abuse
Các endpoint công khai và endpoint xác thực cần có cơ chế rate limiting để giảm nguy cơ brute force hoặc tấn công lặp lại.

Trạng thái: Kiến trúc API có thể tích hợp rate limiting, nhưng cần kiểm tra lại trong quá trình chạy tải và kiểm thử thực tế.

## NFR-Security-08: Khả năng audit
Các thao tác quan trọng như approve, reject, re-approve, cập nhật expense phải được ghi log kèm thông tin người thực hiện, thời gian và dữ liệu liên quan để phục vụ kiểm tra sau này.

Trạng thái: Có sự hiện diện của pattern notification và audit trong hệ thống, nhưng cần xác minh tính đầy đủ của nhật ký trong thực tế.

## NFR-Security-09: Xử lý lỗi an toàn
Hệ thống không được lộ dữ liệu nhạy cảm hoặc stack trace trong phản hồi API đối với người dùng. Thông báo lỗi cần hữu ích nhưng phải kiểm soát để tránh rò rỉ chi tiết kỹ thuật.

Trạng thái: Log cục bộ và error runtime đã có, nhưng cần thiết kế bảo vệ cho môi trường production để tránh leak thông tin nội bộ.

## NFR-Security-10: Sẵn sàng triển khai production
Việc triển khai production cần thêm các lớp bảo vệ vượt xa môi trường dev/local, bao gồm:
- tách môi trường deploy
- rotation secret định kỳ
- giới hạn CORS chặt hơn
- bảo mật credentials database
- kiểm tra log và monitoring
- audit dependency và cập nhật patch kịp thời

Trạng thái: Không nằm trong phạm vi release demo hiện tại, nhưng là yêu cầu bắt buộc trước khi đưa hệ thống vào môi trường production thực tế.

## Tổng kết rủi ro
Hiện tại, dự án đã có các thành phần nền tảng hướng tới bảo mật như xác thực, phân quyền và tách biệt môi trường. Tuy nhiên, repo nên được xem là nền tảng phát triển và học tập, chưa phải là hệ thống đã hoàn tất đánh giá bảo mật và sẵn sàng triển khai production.

## Các bước tiếp theo đề xuất
1. Xác nhận mọi route cần bảo vệ đều được kiểm soát bởi auth guard và role guard
2. Review toàn bộ endpoint API cho validation đầu vào và phân quyền
3. Kiểm tra secret không được commit vào repo và có cơ chế rotation phù hợp
4. Thực hiện review bảo mật chuyên sâu trước khi deploy production
5. Bổ sung audit log cho các workflow có rủi ro cao như phê duyệt và điều chỉnh chi phí
6. Cập nhật lại policy CORS và rate limiting trong môi trường staging/production

## Kết luận
Dự án đã sở hữu các nền tảng cơ bản để xây dựng một hệ thống quản lý đi công tác an toàn, nhưng để đạt được mức độ an toàn production, cần thêm các bước kiểm định, hardening và đánh giá bảo mật nghiêm ngặt trước khi triển khai ngoài môi trường demo hoặc học tập.
