# TEST STRATEGY — Smart Travel Business Trip Management

## 1. TEST STRATEGY

| Layer          | Coverage cho case mẫu |
| -------------- | --------------------- |
| Unit           | Validation và helper ngày/urgency; calculation Combined_Limit; approval routing và expense variance; state/permission rules. |
| Integration    | API/OpenAPI, database workflow, transaction, RBAC/ownership, policy snapshot, notification/SSE và PDF response. Dùng Vitest/Supertest cùng test database hoặc fixture cô lập. |
| E2E            | Luồng Employee tạo yêu cầu và đi qua form; Manager/Travel Admin duyệt; Employee nộp quyết toán; Finance duyệt/đóng; Dashboard, notification và PDF. Dùng Playwright cho thao tác trình duyệt. |
| Non-functional | NFR-TR-01 response time; NFR-TR-02 AI latency/loading; NFR-TR-03 RBAC/security; NFR-TR-04 audit; NFR-TR-05 transaction/data integrity; NFR-TR-06 accessibility/layout. Chỉ báo PASS khi có evidence đo/kiểm tra tương ứng. |

### 10 TEST CASES MẪU

| ID | Case | Trace | Expected | Mode |
| -- | ---- | ----- | -------- | ---- |
| TC-001 | Employee lưu Trip Request hợp lệ | REQ-TR-01 / AC 1.1 | Trip được tạo với status DRAFT | Automated |
| TC-006 | Lý do urgent dưới 10 ký tự sau trim | REQ-TR-01 / BR-TR-03 / AC 1.3 | Không tạo Trip; hiển thị lỗi độ dài | Automated |
| TC-007 | Sinh và xem itinerary AI | REQ-TR-02 / BR-TR-07 / AC 2.1 | Hiển thị lịch trình AI theo ngày/buổi | Automated |
| TC-016 | Submit Trip vượt Combined_Limit | REQ-TR-03 / BR-TR-08 / AC 4.2 | Policy Check chính thức tạo cảnh báo và snapshot | Automated |
| TC-022 | Manager ngoài phạm vi duyệt Trip | REQ-TR-04 / NFR-TR-03 / AC 5.1 | 403 – không được phép duyệt | Automated |
| TC-034 | Finance duyệt và đóng quyết toán hợp lệ | REQ-TR-09 / BR-TR-05, BR-TR-06 / AC 8.1 | Trip chuyển CLOSED và chỉ đọc | Automated |
| TC-035 | Finance xử lý variance >10% chưa có Manager approval | REQ-TR-09 / BR-TR-05 / AC 8.2 | Finance bị chặn đến khi Manager re-approve | Automated |
| TC-038 | Employee xem Dashboard cá nhân | REQ-TR-10 / NFR-TR-03 / AC 9.1 | Chỉ hiển thị Trip của Employee hiện tại | Automated |
| TC-043 | Nhận notification khi Trip được duyệt | REQ-TR-11 / AC 10.1 | Notification đến Employee; unread count cập nhật | Automated |
| TC-046 | Employee owner export PDF hợp lệ | REQ-TR-12 / BR-TR-06 / AC 10.2 | Tải file `.pdf` với `application/pdf` | Automated |

Các case mẫu có mode Automated vì được chọn từ các test case `Automation Candidate` trong `docs/06-testing/testcase.md`. Mode này là định hướng tự động hóa, không phải kết quả thực thi; hiện không ghi nhận PASS nếu chưa có execution evidence. AI cần mock/fixture ổn định; SSE cần môi trường test có thể kiểm soát kết nối; PDF có thể tự động kiểm tra header, filename và nội dung trích xuất. Visual/font/layout cần đánh giá thủ công nếu được đưa thành tiêu chí riêng.
