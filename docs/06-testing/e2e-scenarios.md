# E2E Scenarios — Smart Travel Business Trip Management

Các scenario dưới đây gom những Test Case thành các hành trình nghiệp vụ. Chúng mô tả kết quả theo tài liệu hiện tại; chưa phải bằng chứng đã chạy E2E. Tại thời điểm soạn, web/API/database test không chạy trên các cổng đã kiểm tra và workspace chưa có Playwright, nên không scenario nào được đánh dấu READY.

## E2E-01 — Nhân viên tạo yêu cầu, bỏ qua AI và gửi duyệt

- E2E ID: E2E-01
- User Story liên quan: US-01, US-02, US-04
- Test Case liên quan: TC-001, TC-008
- Role: Employee
- Status: Ready
- Preconditions: Employee đăng nhập; có dữ liệu chuyến đi hợp lệ với ngày đi cách ít nhất 3 ngày làm việc.
Scenario: Nhân viên tạo yêu cầu, bỏ qua AI và gửi duyệt

Given Employee đang tạo yêu cầu công tác với thông tin cơ bản hợp lệ
When Employee hoàn thiện dữ liệu, lưu nháp và mở bước lịch trình
And Employee chọn “Tiếp tục” mà không sinh lịch trình AI
And Employee bấm “Gửi yêu cầu”
Then thông tin hợp lệ được gửi thành công và lưu ở trạng thái đã gửi duyệt
And “Tiếp tục” chuyển sang bước kế tiếp mà không bắt buộc dùng AI
- Kết quả mong đợi: Yêu cầu hợp lệ được lưu, có thể bỏ qua AI khi gửi.

## E2E-02 — Nhân viên tạo và chỉnh sửa lịch trình có AI gợi ý

- E2E ID: E2E-02
- User Story liên quan: US-02, US-03
- Test Case liên quan: TC-007, TC-009, TC-010, TC-011, TC-012, TC-013
- Role: Employee
- Preconditions: Employee có Trip chưa đóng với thông tin điểm đến, ngày và ngân sách; fixture AI ổn định cần được chuẩn bị.

Scenario: Nhân viên tạo và chỉnh sửa lịch trình có AI gợi ý

Given Employee mở bước lịch trình của một Trip chưa đóng
And có fixture AI xác định trước để trả về lịch trình theo ngày/buổi
When Employee chọn “Sinh lịch trình bằng AI”
And Employee xem lịch trình được gợi ý rồi thêm, sửa hoặc xóa một mục
Then lịch trình gợi ý hiển thị theo ngày/buổi
And thay đổi được phản ánh trong lịch trình và tổng dự toán
And nếu tổng chi vượt Combined_Limit thì chỉ hiển thị một cảnh báo tổng hợp, không yêu cầu lý do

- Kết quả mong đợi: Lịch trình AI hiển thị; các thay đổi được lưu và tổng dự toán/cảnh báo phản ánh dữ liệu hiện có.

## E2E-03 — Nhân viên gửi chuyến khẩn cấp để duyệt hai cấp

- E2E ID: E2E-03
- User Story liên quan: US-01, US-04, US-05, US-06
- Test Case liên quan: TC-005, TC-006, TC-017, TC-019, TC-023, TC-024, TC-025
- Role: Employee, Manager, Travel Admin
- Preconditions: Employee thuộc phạm vi Manager; chuyến đi cách dưới 3 ngày làm việc; có các hồ sơ thử riêng để Manager chuyển duyệt cấp 2, Travel Admin duyệt và từ chối.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database và Playwright; seed account hiện chỉ được xác định trong mã seed, chưa xác nhận đã được tạo trong test DB.

Scenario: Nhân viên gửi chuyến khẩn cấp để duyệt hai cấp

Given Employee tạo Trip có ngày đi dưới 3 ngày làm việc
And Trip có lý do khẩn cấp với khoảng trắng đầu/cuối để kiểm tra độ dài sau khi trim
When Employee nhập lý do còn 9 ký tự sau khi trim và thử tiếp tục/lưu
And Employee thay bằng lý do còn 10 ký tự sau khi trim, xác nhận chuyến khẩn cấp và gửi yêu cầu
And Manager duyệt yêu cầu cần Level 2
And Travel Admin xử lý yêu cầu cấp 2, một hồ sơ được duyệt và một hồ sơ khác bị từ chối kèm lý do
Then lý do có 9 ký tự sau trim bị từ chối và yêu cầu không được tạo
And lý do có 10 ký tự sau trim được chấp nhận và chuyến đi có cảnh báo khẩn cấp
And Policy Check chính thức nhận diện chuyến khẩn cấp và Manager chuyển yêu cầu cần cấp 2 sang hàng chờ Travel Admin
And Travel Admin có thể đưa hồ sơ sang Approved hoặc Rejected theo quyết định; từ chối phải có lý do
And Employee và Manager đều không thể xử lý duyệt cấp 2

- Kết quả mong đợi: Lý do khẩn cấp được kiểm tra sau trim; yêu cầu đi đúng luồng duyệt; chỉ Travel Admin xử lý quyết định cấp 2.

## E2E-04 — Manager xử lý yêu cầu trong phạm vi quản lý

- E2E ID: E2E-04
- User Story liên quan: US-05, US-09
- Test Case liên quan: TC-018, TC-020, TC-021, TC-022, TC-039
- Role: Manager
- Preconditions: Có yêu cầu SUBMITTED của nhân viên trực tiếp, yêu cầu cần từ chối và yêu cầu của nhân viên ngoài phạm vi Manager.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database và Playwright; cần seed nhân viên/Manager có quan hệ báo cáo và hồ sơ chờ duyệt.

Scenario: Manager xử lý yêu cầu trong phạm vi quản lý

Given Manager mở dashboard có yêu cầu của nhân viên trực tiếp đang chờ xử lý
And có một yêu cầu SUBMITTED của nhân viên ngoài phạm vi quản lý
When Manager mở danh sách yêu cầu chờ duyệt
And Manager thử từ chối một yêu cầu mà chưa nhập lý do rồi nhập lý do và gửi lại
And Manager duyệt một yêu cầu một cấp của nhân viên trực tiếp
And Manager thử xử lý yêu cầu ngoài phạm vi quản lý
Then dashboard hiển thị các yêu cầu thuộc phạm vi Manager cần xử lý
And thiếu lý do thì yêu cầu chưa bị từ chối; có lý do thì yêu cầu chuyển Rejected
And yêu cầu một cấp được duyệt chuyển Approved
And Manager không thể duyệt yêu cầu của nhân viên ngoài phạm vi

- Kết quả mong đợi: Manager chỉ xử lý yêu cầu trong phạm vi; kết quả duyệt/từ chối đúng với dữ liệu và lý do đã nhập.

## E2E-05 — Nhân viên lập quyết toán không vượt dự toán

- E2E ID: E2E-05
- User Story liên quan: US-07
- Test Case liên quan: TC-026, TC-027, TC-028, TC-029, TC-033
- Role: Employee
- Preconditions: Employee sở hữu Trip đã duyệt và một Trip DRAFT; Trip đã duyệt có thể dùng để tạo Expense Claim.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database, tài khoản và hồ sơ thử ở trạng thái nêu trên.

Scenario: Nhân viên lập quyết toán không vượt dự toán

Given Employee sở hữu một Trip APPROVED hoặc ONGOING và một Trip DRAFT
When Employee mở Expense Claim cho Trip đã duyệt
And Employee thêm khoản chi có ngày, danh mục, số tiền dương và mô tả
And Employee xem đối chiếu dự toán với chi phí thực tế rồi nộp claim có tổng thực tế không vượt dự toán, không có justification
And Employee thử tạo claim cho Trip DRAFT
Then claim gắn với Trip đã duyệt và khoản chi xuất hiện trong danh sách
And giá trị đối chiếu phản ánh khoản chi đã nhập
And claim không vượt dự toán được nộp mà không cần justification
And không thể tạo claim cho Trip DRAFT

- Kết quả mong đợi: Claim hợp lệ được lập và nộp không cần giải trình khi chi phí thực tế không vượt dự toán; Trip DRAFT không cho tạo claim.

## E2E-06 — Nhân viên giải trình khoản vượt dự toán đến 10%

- E2E ID: E2E-06
- User Story liên quan: US-07
- Test Case liên quan: TC-030, TC-031
- Role: Employee
- Preconditions: Employee sở hữu Trip đủ điều kiện lập claim; dữ liệu khoản chi tạo variance dương không quá 10%.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database, Trip và dữ liệu claim thử.

Scenario: Nhân viên giải trình khoản vượt dự toán đến 10%

Given Employee có Expense Claim với tổng chi phí thực tế vượt dự toán 5%
When Employee nộp claim khi chưa có justification
And Employee nhập justification rồi nộp lại
Then claim chưa được nộp khi thiếu justification
And claim được nộp sau khi có justification

- Kết quả mong đợi: Variance dương đến 10% yêu cầu justification trước khi nộp claim.

## E2E-07 — Manager xem xét khoản vượt dự toán trên 10% trước khi Finance đóng

- E2E ID: E2E-07
- User Story liên quan: US-03, US-07, US-08
- Test Case liên quan: TC-014, TC-032, TC-034, TC-035, TC-037
- Role: Employee, Manager, Finance
- Preconditions: Có claim variance trên 10% chưa được Manager duyệt bổ sung; sau khi duyệt có thể tiếp tục Finance xử lý và đóng hồ sơ.
- Playwright Ready: NEEDS CONFIRMATION
- Ghi chú: AC 7.5 gọi trạng thái là `PENDING_MANAGER_APPROVAL`; backend hiện dùng `MANAGER_REAPPROVE` và frontend ánh xạ sang nhãn khác. Cần xác nhận tên trạng thái/nhãn hiển thị. Môi trường chạy E2E cũng chưa sẵn sàng.

Scenario: Manager xem xét khoản vượt dự toán trên 10% trước khi Finance đóng

Given Employee có claim variance trên 10% kèm justification và chưa được Manager duyệt bổ sung
When Employee nộp claim
And Finance thử duyệt hoặc đóng claim trước khi có duyệt bổ sung
And Manager thực hiện duyệt bổ sung rồi Finance duyệt và đóng hồ sơ
And Employee mở lại hồ sơ đã đóng và thử chỉnh sửa lịch trình
Then Manager re-approval được yêu cầu và Finance chưa thể đóng hồ sơ trước khi có duyệt bổ sung
And sau khi có duyệt bổ sung, Finance có thể duyệt và đóng hồ sơ hợp lệ
And hồ sơ CLOSED hiển thị chỉ đọc và thay đổi không được lưu

- Kết quả mong đợi: Khoản vượt trên 10% cần Manager duyệt bổ sung trước khi Finance đóng; hồ sơ đã đóng không thể chỉnh sửa.

## E2E-08 — Finance yêu cầu Employee chỉnh sửa quyết toán

- E2E ID: E2E-08
- User Story liên quan: US-08, US-10
- Test Case liên quan: TC-036, TC-050
- Role: Finance, Employee
- Preconditions: Finance có claim chờ duyệt; Employee liên quan có thể nhận notification.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database và claim chờ duyệt. Việc gửi notification cần execution evidence theo QA-Q-06.

Scenario: Finance yêu cầu Employee chỉnh sửa quyết toán

Given Finance mở claim đang chờ duyệt của Employee
When Finance yêu cầu chỉnh sửa và nhập lý do
Then claim được trả về Employee để bổ sung
And lý do được hiển thị
And người gửi nhận được notification từ chối/yêu cầu chỉnh sửa theo TC-050

- Kết quả mong đợi: Claim được trả về kèm lý do và Employee liên quan nhận được notification.

## E2E-09 — Các role xem đúng công việc trên dashboard

- E2E ID: E2E-09
- User Story liên quan: US-09
- Test Case liên quan: TC-038, TC-039, TC-040, TC-041, TC-042
- Role: Employee, Manager, Finance, Travel Admin
- Preconditions: Có test accounts riêng theo role và hồ sơ mẫu thuộc các trạng thái tương ứng; có account không có dữ liệu liên quan.
- Playwright Ready: BLOCKED
- Ghi chú: Cần khởi chạy ứng dụng, test database và seed đúng quan hệ/hồ sơ. Tài khoản seed đã thấy trong mã nhưng chưa xác nhận tồn tại trong test DB.

Scenario: Các role xem đúng công việc trên dashboard

Given Employee, Manager, Finance và Travel Admin đăng nhập bằng tài khoản riêng
And dữ liệu thử gồm Trip của nhiều Employee, yêu cầu của direct report, Trip chờ cấp 2, claim chờ Finance và account không có dữ liệu liên quan
When từng role mở dashboard của mình
Then Employee chỉ thấy Trip của mình được phân theo trạng thái
And Manager thấy yêu cầu thuộc phạm vi cần xử lý
And Travel Admin thấy yêu cầu chờ duyệt cấp 2
And Finance thấy các quyết toán cần duyệt hoặc đóng
And dashboard của account không có dữ liệu hiển thị trạng thái rỗng phù hợp

- Kết quả mong đợi: Mỗi role thấy đúng danh sách công việc của mình; account rỗng có trạng thái rỗng phù hợp.

## E2E-10 — Notification theo quyết định duyệt và thao tác đọc

- E2E ID: E2E-10
- User Story liên quan: US-05, US-06, US-08, US-10
- Test Case liên quan: TC-043, TC-044, TC-045, TC-050, TC-051
- Role: Employee, Manager, Travel Admin, Finance
- Preconditions: Có hồ sơ thử để duyệt, từ chối và đóng; user liên quan có notification chưa đọc.
- Playwright Ready: BLOCKED
- Ghi chú: Mark-read, read-all và tạo notification khi approve/reject/close đang chờ execution evidence theo QA-Q-06. Cần khởi chạy ứng dụng, test database và các hồ sơ theo trạng thái.

Scenario: Notification theo quyết định duyệt và thao tác đọc

Given user liên quan có thể nhận notification khi Trip được duyệt, yêu cầu bị từ chối hoặc hồ sơ được đóng
And user có ít nhất hai notification chưa đọc
When Manager duyệt Trip, một yêu cầu bị từ chối và Finance đóng một hồ sơ
And user đánh dấu một notification đã đọc rồi chọn đánh dấu tất cả đã đọc
Then Employee nhận notification khi Trip được duyệt
And người gửi nhận notification khi yêu cầu bị từ chối
And Employee nhận notification khi hồ sơ được đóng
And đánh dấu một notification đã đọc làm giảm số chưa đọc tương ứng
And read-all đánh dấu toàn bộ notification của user đã đọc và badge về 0

- Kết quả mong đợi: Notification được tạo cho các kết quả nghiệp vụ nêu trong TC; thao tác đọc đơn/làm tất cả cập nhật trạng thái và badge đúng.

## E2E-11 — Tải PDF theo quyền sở hữu, role và trạng thái Trip

- E2E ID: E2E-11
- User Story liên quan: US-10
- Test Case liên quan: TC-046, TC-047, TC-048, TC-049
- Role: Employee, Finance
- Preconditions: Có Trip APPROVED của Employee hiện tại, Trip APPROVED của Employee khác và Trip DRAFT hoặc SUBMITTED.
- Playwright Ready: BLOCKED
- Ghi chú: QA-Q-05 đang PENDING VERIFICATION; đã xem code khai báo `application/pdf` và tên `.pdf` nhưng chưa có execution evidence. Cần khởi chạy ứng dụng, test database và chạy request thực tế.

Scenario: Tải PDF theo quyền sở hữu, role và trạng thái Trip

Given Employee sở hữu Trip APPROVED và có Trip APPROVED của Employee khác
And có Trip DRAFT hoặc SUBMITTED chưa được duyệt
When Employee tải PDF của Trip APPROVED thuộc mình
And Finance tải PDF của Trip APPROVED
And Employee thử tải PDF của Trip thuộc người khác và Trip chưa được duyệt
Then Employee owner và Finance tải được file `.pdf` với nội dung báo cáo theo TC-046/TC-047
And Employee không tải được PDF của Trip thuộc người khác hoặc Trip chưa được duyệt

- Kết quả mong đợi: Người có quyền tải PDF của Trip đủ điều kiện; các trường hợp không có quyền hoặc trạng thái chưa được duyệt bị chặn.

## Traceability

| E2E ID | Scenario | User Story | Test Case | Role | Playwright Ready |
| ------ | -------- | ---------- | --------- | ---- | ---------------- |
| E2E-01 | Nhân viên tạo yêu cầu, bỏ qua AI và gửi duyệt | US-01, US-02, US-04 | TC-001, TC-002, TC-003, TC-004, TC-008, TC-015, TC-016 | Employee | NEEDS CONFIRMATION |
| E2E-02 | Nhân viên tạo và chỉnh sửa lịch trình có AI gợi ý | US-02, US-03 | TC-007, TC-009, TC-010, TC-011, TC-012, TC-013 | Employee | NEEDS CONFIRMATION |
| E2E-03 | Nhân viên gửi chuyến khẩn cấp để duyệt hai cấp | US-01, US-04, US-05, US-06 | TC-005, TC-006, TC-017, TC-019, TC-023, TC-024, TC-025 | Employee, Manager, Travel Admin | BLOCKED |
| E2E-04 | Manager xử lý yêu cầu trong phạm vi quản lý | US-05, US-09 | TC-018, TC-020, TC-021, TC-022, TC-039 | Manager | BLOCKED |
| E2E-05 | Nhân viên lập quyết toán không vượt dự toán | US-07 | TC-026, TC-027, TC-028, TC-029, TC-033 | Employee | BLOCKED |
| E2E-06 | Nhân viên giải trình khoản vượt dự toán đến 10% | US-07 | TC-030, TC-031 | Employee | BLOCKED |
| E2E-07 | Manager xem xét khoản vượt dự toán trên 10% trước khi Finance đóng | US-03, US-07, US-08 | TC-014, TC-032, TC-034, TC-035, TC-037 | Employee, Manager, Finance | NEEDS CONFIRMATION |
| E2E-08 | Finance yêu cầu Employee chỉnh sửa quyết toán | US-08, US-10 | TC-036, TC-050 | Finance, Employee | BLOCKED |
| E2E-09 | Các role xem đúng công việc trên dashboard | US-09 | TC-038, TC-039, TC-040, TC-041, TC-042 | Employee, Manager, Finance, Travel Admin | BLOCKED |
| E2E-10 | Notification theo quyết định duyệt và thao tác đọc | US-05, US-06, US-08, US-10 | TC-043, TC-044, TC-045, TC-050, TC-051 | Employee, Manager, Travel Admin, Finance | BLOCKED |
| E2E-11 | Tải PDF theo quyền sở hữu, role và trạng thái Trip | US-10 | TC-046, TC-047, TC-048, TC-049 | Employee, Finance | BLOCKED |

## Open QA Questions
.
 **Nhãn trạng thái re-approval (US-07, AC 7.5):** Tài liệu dùng `PENDING_MANAGER_APPROVAL`, trong khi implementation dùng `MANAGER_REAPPROVE` và hiển thị nhãn frontend khác. Cần thống nhất trạng thái/nhãn quan sát được trước khi xác nhận expected UI.

QA-Q-05 (PDF) và QA-Q-06 (Notification) vẫn PENDING VERIFICATION trong `qa-verification.md`; các scenario E2E-10 và E2E-11 chưa được xem là PASS/READY khi chưa có execution evidence.
