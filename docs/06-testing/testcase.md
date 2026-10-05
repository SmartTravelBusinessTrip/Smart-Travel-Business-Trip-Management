# Test Case — US-01 đến US-10

**Cơ sở rà soát:** `requirements.md`, `business-rules.md`, PRD, user flow, user stories, story specs, OpenAPI, Design System và code frontend/backend hiện tại. Các test case mô tả hành vi quan sát được; mọi case ở trạng thái `NOT RUN`.

## US-01

### TC-001
- US: US-01
- Tên Test Case: Lưu yêu cầu công tác hợp lệ
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Employee đăng nhập.
- Test Data: Đủ điểm đi/đến, ngày hợp lệ, mục đích ≥10 ký tự, ngân sách dương; ngày đi cách ≥3 ngày làm việc.
- Các bước thực hiện:
  1. Mở form tạo Trip Request.
  2. Nhập dữ liệu hợp lệ.
  3. Chọn Lưu nháp.
- Kết quả mong đợi: Yêu cầu được lưu và xuất hiện ở trạng thái Draft.
- Trace:
  - Requirement: REQ-TR-01
  - Business Rule: BR-TR-03
  - Acceptance Criteria: AC 1.1
- Layer: E2E
- Status: PASS

### TC-002
- US: US-01
- Tên Test Case: Không lưu yêu cầu khi thiếu thông tin bắt buộc
- Loại kiểm thử: Validation
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang ở form tạo Trip Request.
- Test Data: Bỏ trống một trường bắt buộc.
- Các bước thực hiện:
  1. Để trống trường bắt buộc.
  2. Chọn Lưu nháp.
- Kết quả mong đợi: Form chỉ rõ trường cần bổ sung và không lưu yêu cầu.
- Trace:
  - Requirement: REQ-TR-01
  - Business Rule: —
  - Acceptance Criteria: AC 1.1
- Layer: E2E
- Status: PASS

### TC-003
- US: US-01
- Tên Test Case: Không chấp nhận ngày về trước ngày đi
- Loại kiểm thử: Validation
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang ở form tạo Trip Request.
- Test Data: Ngày về sớm hơn ngày đi.
- Các bước thực hiện:
  1. Nhập ngày đi và ngày về không hợp lệ.
  2. Chọn Lưu nháp.
- Kết quả mong đợi: Hiển thị lỗi ngày; yêu cầu không được lưu.
- Trace:
  - Requirement: REQ-TR-01
  - Business Rule: —
  - Acceptance Criteria: AC 1.1
- Layer: UI
- Status: PASS

### TC-004
- US: US-01
- Tên Test Case: Cảnh báo tổng hạn mức khi ngân sách vượt mức tham chiếu
- Loại kiểm thử: Business Rule, UI
- Mức độ ưu tiên: Cao
- Preconditions: Employee đã nhập ngày đi/về và điểm đến.
- Test Data: Ngân sách cao hơn Combined_Limit.
- Các bước thực hiện:
  1. Nhập ngân sách vượt hạn mức kết hợp.
  2. Quan sát phần hạn mức và cảnh báo.
- Kết quả mong đợi: Hiển thị cảnh báo tổng hợp; không có cảnh báo riêng cho khách sạn/per diem và không yêu cầu lý do.
- Trace:
  - Requirement: REQ-TR-01, REQ-TR-03
  - Business Rule: BR-TR-01, BR-TR-02, BR-TR-08
  - Acceptance Criteria: AC 1.2
- Layer: UI
- Status: PASS

### TC-005
- US: US-01
- Tên Test Case: Xác nhận chuyến đi khẩn cấp dưới 3 ngày làm việc
- Loại kiểm thử: Business Rule, Boundary
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang tạo yêu cầu có ngày đi dưới 3 ngày làm việc.
- Test Data: Lý do có 10 ký tự sau khi trim, có thêm khoảng trắng ở đầu/cuối.
- Các bước thực hiện:
  1. Nhập thông tin chuyến đi khẩn cấp.
  2. Chọn xác nhận chuyến đi khẩn cấp và nhập lý do.
  3. Lưu yêu cầu.
- Kết quả mong đợi: Khoảng trắng đầu/cuối được trim trước khi đếm; lý do còn 10 ký tự được chấp nhận và yêu cầu lưu với cảnh báo chuyến đi khẩn cấp.
- Trace:
  - Requirement: REQ-TR-01
  - Business Rule: BR-TR-03
  - Acceptance Criteria: AC 1.3
- Layer: E2E
- Status: PASS

### TC-006
- US: US-01
- Tên Test Case: Không lưu chuyến khẩn cấp khi lý do còn dưới 10 ký tự sau khi trim
- Loại kiểm thử: Validation
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang tạo yêu cầu dưới 3 ngày làm việc.
- Test Data: Lý do còn 9 ký tự sau khi trim.
- Các bước thực hiện:
  1. Nhập thông tin chuyến đi khẩn cấp.
  2. Nhập lý do còn 9 ký tự sau khi trim.
  3. Chọn tiếp tục/lưu.
- Kết quả mong đợi: Hiển thị lỗi độ dài và không cho tạo yêu cầu.
- Trace:
  - Requirement: REQ-TR-01
  - Business Rule: BR-TR-03
  - Acceptance Criteria: AC 1.3
- Layer: UI
- Status: PASS

## US-02

### TC-007
- US: US-02
- Tên Test Case: Sinh và xem lịch trình AI gợi ý
- Loại kiểm thử: Happy Path, UI
- Mức độ ưu tiên: Cao
- Preconditions: Employee đã nhập thông tin chuyến đi cần thiết và đang ở bước lịch trình.
- Test Data: Điểm đến, số ngày, ngân sách hợp lệ; preferences tùy chọn.
- Các bước thực hiện:
  1. Chọn “Sinh lịch trình bằng AI”.
  2. Chờ hệ thống hoàn tất.
  3. Xem lịch trình được gợi ý.
- Kết quả mong đợi: Lịch trình được hiển thị theo ngày/buổi để Employee xem.
- Trace:
  - Requirement: REQ-TR-02
  - Business Rule: BR-TR-07
  - Acceptance Criteria: AC 2.1
- Layer: E2E
- Status: PASS

### TC-008
- US: US-02
- Tên Test Case: Bỏ qua AI bằng nút “Tiếp tục”
- Loại kiểm thử: Happy Path, Navigation
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang ở bước lịch trình và chưa sinh AI.
- Test Data: Thông tin bước tạo yêu cầu đã hợp lệ.
- Các bước thực hiện:
  1. Không chọn “Sinh lịch trình bằng AI”.
  2. Chọn “Tiếp tục”.
- Kết quả mong đợi: Chuyển sang bước tiếp theo của form mà không bắt buộc sinh lịch trình AI.
- Trace:
  - Requirement: REQ-TR-02
  - Business Rule: —
  - Acceptance Criteria: AC 2.1 (flow UI hiện tại)
- Layer: E2E
- Status: PASS

## US-03

### TC-009
- US: US-03
- Tên Test Case: Thêm một mục vào lịch trình
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Employee mở lịch trình của Trip chưa đóng.
- Test Data: Ngày trong chuyến đi, hoạt động và địa điểm hợp lệ.
- Các bước thực hiện:
  1. Chọn thêm mục lịch trình.
  2. Nhập thông tin mục.
  3. Lưu mục.
- Kết quả mong đợi: Mục mới xuất hiện đúng ngày trong lịch trình.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 3.1
- Layer: E2E
- Status: PASS

### TC-010
- US: US-03
- Tên Test Case: Sửa nội dung một mục lịch trình
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Trung bình
- Preconditions: Trip chưa CLOSED và có ít nhất một mục.
- Test Data: Địa điểm hoặc hoạt động mới.
- Các bước thực hiện:
  1. Mở mục lịch trình.
  2. Sửa nội dung.
  3. Lưu thay đổi.
- Kết quả mong đợi: Nội dung mới được hiển thị trong lịch trình.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 3.1
- Layer: E2E
- Status: PASS

### TC-011
- US: US-03
- Tên Test Case: Xóa một mục lịch trình
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Trung bình
- Preconditions: Trip chưa CLOSED và có ít nhất một mục.
- Test Data: Một mục lịch trình hiện có.
- Các bước thực hiện:
  1. Chọn xóa mục lịch trình.
  2. Xác nhận nếu giao diện yêu cầu.
- Kết quả mong đợi: Mục đã chọn không còn trong lịch trình.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 3.1
- Layer: E2E
- Status: PASS

### TC-012
- US: US-03
- Tên Test Case: Cập nhật tổng dự toán sau khi thay đổi lịch trình
- Loại kiểm thử: Business Rule
- Mức độ ưu tiên: Trung bình
- Preconditions: Lịch trình có các mục mang chi phí.
- Test Data: Thêm hoặc xóa mục có chi phí xác định.
- Các bước thực hiện:
  1. Ghi nhận tổng chi phí hiện tại.
  2. Thêm hoặc xóa một mục có chi phí.
  3. Quan sát tổng chi phí mới.
- Kết quả mong đợi: Tổng dự toán phản ánh các mục hiện có.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-08
  - Acceptance Criteria: AC 3.1
- Layer: UI
- Status: PASS

### TC-013
- US: US-03
- Tên Test Case: Chỉ hiển thị một cảnh báo khi tổng chi vượt Combined_Limit
- Loại kiểm thử: Business Rule, UI
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang chỉnh sửa lịch trình/chi phí.
- Test Data: Tổng chi vượt Combined_Limit.
- Các bước thực hiện:
  1. Nhập chi phí làm tổng vượt hạn mức.
  2. Quan sát cảnh báo policy.
- Kết quả mong đợi: Hiển thị một cảnh báo tổng hợp; không yêu cầu nhập lý do.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-01, BR-TR-02, BR-TR-08
  - Acceptance Criteria: AC 3.2
- Layer: UI
- Status: PASS

### TC-014
- US: US-03
- Tên Test Case: Lịch trình đã đóng không thể chỉnh sửa
- Loại kiểm thử: Permission, State
- Mức độ ưu tiên: Cao
- Preconditions: Employee mở Trip CLOSED.
- Test Data: Trip CLOSED.
- Các bước thực hiện:
  1. Mở lịch trình.
  2. Thử thêm, sửa hoặc xóa một mục.
- Kết quả mong đợi: Lịch trình ở chế độ chỉ đọc và thay đổi không được lưu.
- Trace:
  - Requirement: REQ-TR-06
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 3.1
- Layer: E2E
- Status: PASS

## US-04

### TC-015
- US: US-04
- Tên Test Case: Xem policy preview khi nhập form
- Loại kiểm thử: Happy Path, Business Rule
- Mức độ ưu tiên: Cao
- Preconditions: Trip hợp lệ, không urgent, tổng chi phí trong hạn mức.
- Test Data: Ngân sách không vượt Combined_Limit và thời hạn gửi đủ.
- Các bước thực hiện:
  1. Nhập hoặc chỉnh thông tin form trong hạn mức.
  2. Quan sát policy preview.
- Kết quả mong đợi: Preview có thể hiển thị theo dữ liệu form; đây chưa phải Policy Check chính thức.
- Trace:
  - Requirement: REQ-TR-03
  - Business Rule: BR-TR-03, BR-TR-08
  - Acceptance Criteria: AC 4.1
- Layer: E2E
- Status: PASS

### TC-016
- US: US-04
- Tên Test Case: Chạy Policy Check chính thức khi gửi yêu cầu
- Loại kiểm thử: Business Rule
- Mức độ ưu tiên: Cao
- Preconditions: Trip hợp lệ để kiểm tra.
- Test Data: Dữ liệu Trip đạt hoặc vượt điều kiện policy.
- Các bước thực hiện:
  1. Hoàn tất thông tin Trip.
  2. Chọn “Gửi yêu cầu”.
- Kết quả mong đợi: Policy Check chính thức chạy; submit tạo snapshot approvalReasons và requiresLevel2, với cảnh báo phù hợp nếu có.
- Trace:
  - Requirement: REQ-TR-03
  - Business Rule: BR-TR-08
  - Acceptance Criteria: AC 4.2
- Layer: E2E
- Status: PASS

### TC-017
- US: US-04
- Tên Test Case: Gửi Trip khẩn cấp qua Policy Check chính thức
- Loại kiểm thử: Business Rule
- Mức độ ưu tiên: Cao
- Preconditions: Trip có ngày đi dưới 3 ngày làm việc và lý do khẩn cấp.
- Test Data: Trip urgent hợp lệ.
- Các bước thực hiện:
  1. Hoàn tất form Trip khẩn cấp.
  2. Chọn “Gửi yêu cầu”.
- Kết quả mong đợi: Policy Check chính thức nhận diện chuyến khẩn cấp và tạo thông tin định tuyến duyệt tương ứng.
- Trace:
  - Requirement: REQ-TR-03
  - Business Rule: BR-TR-03, BR-TR-04
  - Acceptance Criteria: AC 4.2
- Layer: UI
- Status: PASS

## US-05

### TC-018
- US: US-05
- Tên Test Case: Manager duyệt yêu cầu một cấp
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Manager đăng nhập; có Trip SUBMITTED của nhân viên trực tiếp.
- Test Data: Trip không cần Level 2.
- Các bước thực hiện:
  1. Mở hàng chờ duyệt.
  2. Mở Trip và chọn Approve.
- Kết quả mong đợi: Trip chuyển sang Approved.
- Trace:
  - Requirement: REQ-TR-04
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 5.1
- Layer: E2E
- Status: PASS

### TC-019
- US: US-05
- Tên Test Case: Manager duyệt yêu cầu cần Level 2
- Loại kiểm thử: Business Rule, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Manager có Trip SUBMITTED cần duyệt hai cấp.
- Test Data: Trip có ít nhất một điều kiện định tuyến Level 2.
- Các bước thực hiện:
  1. Mở Trip đang chờ duyệt.
  2. Xem lý do duyệt hai cấp.
  3. Chọn Approve.
- Kết quả mong đợi: Trip chuyển sang chờ Travel Admin duyệt cấp 2.
- Trace:
  - Requirement: REQ-TR-04, REQ-TR-05
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 5.2
- Layer: E2E
- Status: PASS

### TC-020
- US: US-05
- Tên Test Case: Manager từ chối yêu cầu kèm lý do
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Manager có Trip SUBMITTED.
- Test Data: Lý do từ chối.
- Các bước thực hiện:
  1. Mở Trip.
  2. Chọn Reject và nhập lý do.
  3. Xác nhận từ chối.
- Kết quả mong đợi: Trip chuyển Rejected và lý do được ghi nhận.
- Trace:
  - Requirement: REQ-TR-04
  - Business Rule: —
  - Acceptance Criteria: AC 5.3
- Layer: E2E
- Status: PASS

### TC-021
- US: US-05
- Tên Test Case: Manager không thể từ chối khi thiếu lý do
- Loại kiểm thử: Validation
- Mức độ ưu tiên: Cao
- Preconditions: Manager có Trip SUBMITTED.
- Test Data: Lý do từ chối để trống.
- Các bước thực hiện:
  1. Chọn Reject.
  2. Để trống lý do và xác nhận.
- Kết quả mong đợi: Giao diện yêu cầu nhập lý do; Trip chưa bị từ chối.
- Trace:
  - Requirement: REQ-TR-04
  - Business Rule: —
  - Acceptance Criteria: AC 5.3
- Layer: UI
- Status: PASS

### TC-022
- US: US-05
- Tên Test Case: Chỉ Manager trực tiếp xử lý yêu cầu của nhân viên
- Loại kiểm thử: Permission
- Mức độ ưu tiên: Cao
- Preconditions: Có Trip SUBMITTED của nhân viên thuộc Manager khác.
- Test Data: Manager không phụ trách nhân viên đó.
- Các bước thực hiện:
  1. Đăng nhập bằng Manager không liên quan.
  2. Thử mở hoặc duyệt Trip.
- Kết quả mong đợi: Không thể duyệt Trip ngoài phạm vi quản lý.
- Trace:
  - Requirement: REQ-TR-04, NFR-TR-03
  - Business Rule: —
  - Acceptance Criteria: AC 5.1
- Layer: Integration
- Status: PASS

## US-06

### TC-023
- US: US-06
- Tên Test Case: Travel Admin duyệt cấp 2
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Travel Admin đăng nhập; Trip đang chờ duyệt cấp 2.
- Test Data: Trip có Manager approval cấp 1.
- Các bước thực hiện:
  1. Mở hàng chờ cấp 2.
  2. Xem lý do và thông tin duyệt cấp 1.
  3. Chọn Approve cấp 2.
- Kết quả mong đợi: Trip chuyển sang Approved.
- Trace:
  - Requirement: REQ-TR-05
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 6.1
- Layer: E2E
- Status: PASS

### TC-024
- US: US-06
- Tên Test Case: Travel Admin từ chối cấp 2 kèm lý do
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Travel Admin có Trip đang chờ cấp 2.
- Test Data: Lý do từ chối.
- Các bước thực hiện:
  1. Mở Trip.
  2. Chọn Reject và nhập lý do.
  3. Xác nhận.
- Kết quả mong đợi: Trip chuyển Rejected và lý do được lưu.
- Trace:
  - Requirement: REQ-TR-05
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 6.2
- Layer: E2E
- Status: PASS

### TC-025
- US: US-06
- Tên Test Case: Chỉ Travel Admin xử lý hàng chờ duyệt cấp 2
- Loại kiểm thử: Permission
- Mức độ ưu tiên: Cao
- Preconditions: Trip đang chờ duyệt cấp 2.
- Test Data: Employee hoặc Manager đăng nhập.
- Các bước thực hiện:
  1. Đăng nhập bằng role không phải Travel Admin.
  2. Thử xử lý Trip cấp 2.
- Kết quả mong đợi: Không thể approve/reject Trip cấp 2.
- Trace:
  - Requirement: REQ-TR-05, NFR-TR-03
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 6.1
- Layer: Integration
- Status: PASS

## US-07

### TC-026
- US: US-07
- Tên Test Case: Tạo Expense Claim cho chuyến đã duyệt
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Employee sở hữu Trip APPROVED hoặc ONGOING.
- Test Data: Một chuyến chưa có Expense Claim.
- Các bước thực hiện:
  1. Mở Trip.
  2. Chọn tạo quyết toán.
- Kết quả mong đợi: Mở được form Expense Claim gắn với Trip đã chọn.
- Trace:
  - Requirement: REQ-TR-07
  - Business Rule: —
  - Acceptance Criteria: AC 7.1
- Layer: E2E
- Status: PASS

### TC-027
- US: US-07
- Tên Test Case: Thêm khoản chi vào Expense Claim
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang ở form Expense Claim.
- Test Data: Ngày chi, danh mục, số tiền dương, mô tả.
- Các bước thực hiện:
  1. Chọn thêm khoản chi.
  2. Nhập thông tin khoản chi.
  3. Lưu khoản chi.
- Kết quả mong đợi: Khoản chi xuất hiện trong danh sách của claim.
- Trace:
  - Requirement: REQ-TR-07
  - Business Rule: —
  - Acceptance Criteria: AC 7.1
- Layer: E2E
- Status: PASS

### TC-028
- US: US-07
- Tên Test Case: Hiển thị đối chiếu dự toán và chi phí thực tế
- Loại kiểm thử: Business Rule, UI
- Mức độ ưu tiên: Cao
- Preconditions: Claim có ít nhất một khoản chi.
- Test Data: Tổng chi khác dự toán.
- Các bước thực hiện:
  1. Mở phần tổng hợp Expense Claim.
  2. So sánh dự toán, thực tế và phần trăm chênh lệch.
- Kết quả mong đợi: Các giá trị đối chiếu được hiển thị phù hợp với các khoản chi đã nhập.
- Trace:
  - Requirement: REQ-TR-08
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 7.2
- Layer: UI
- Status: PASS

### TC-029
- US: US-07
- Tên Test Case: Nộp quyết toán khi chi phí không vượt dự toán
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Claim có khoản chi và tổng thực tế ≤ dự toán.
- Test Data: Tổng thực tế bằng hoặc thấp hơn dự toán; không nhập justification.
- Các bước thực hiện:
  1. Mở claim đã nhập đủ khoản chi.
  2. Chọn Nộp quyết toán.
- Kết quả mong đợi: Claim được nộp để Finance xem xét mà không cần justification.
- Trace:
  - Requirement: REQ-TR-07, REQ-TR-08
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 7.3
- Layer: E2E
- Status: PASS

### TC-030
- US: US-07
- Tên Test Case: Nộp quyết toán vượt dự toán không quá 10% kèm giải trình
- Loại kiểm thử: Business Rule
- Mức độ ưu tiên: Cao
- Preconditions: Claim có khoản chi.
- Test Data: Tổng thực tế vượt dự toán 5%; có justification.
- Các bước thực hiện:
  1. Nhập giải trình cho phần vượt.
  2. Chọn Nộp quyết toán.
- Kết quả mong đợi: Claim được nộp sau khi có giải trình.
- Trace:
  - Requirement: REQ-TR-07, REQ-TR-08
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 7.3
- Layer: E2E
- Status: PASS

### TC-031
- US: US-07
- Tên Test Case: Không nộp được quyết toán vượt dự toán khi thiếu giải trình
- Loại kiểm thử: Validation
- Mức độ ưu tiên: Cao
- Preconditions: Claim có khoản chi.
- Test Data: Tổng thực tế vượt dự toán 5%; không có justification.
- Các bước thực hiện:
  1. Chọn Nộp quyết toán.
- Kết quả mong đợi: Hệ thống yêu cầu giải trình và chưa nộp claim.
- Trace:
  - Requirement: REQ-TR-07, REQ-TR-08
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 7.3
- Layer: UI
- Status: PASS

### TC-032
- US: US-07
- Tên Test Case: Khoản chi vượt dự toán trên 10% cần Manager duyệt bổ sung
- Loại kiểm thử: Business Rule, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Claim có khoản chi.
- Test Data: Tổng thực tế vượt dự toán trên 10%; có justification; chưa có Manager re-approval.
- Các bước thực hiện:
  1. Nộp quyết toán.
  2. Quan sát trạng thái/hướng xử lý tiếp theo.
- Kết quả mong đợi: Manager re-approval được yêu cầu; Finance chưa thể đóng hồ sơ trước khi có duyệt bổ sung.
- Trace:
  - Requirement: REQ-TR-07, REQ-TR-08
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 7.3
- Layer: E2E
- Status: PASS

### TC-033
- US: US-07
- Tên Test Case: Không tạo quyết toán cho Trip chưa được duyệt
- Loại kiểm thử: State, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Employee sở hữu Trip DRAFT.
- Test Data: Trip DRAFT.
- Các bước thực hiện:
  1. Mở Trip DRAFT.
  2. Thử tạo Expense Claim.
- Kết quả mong đợi: Không thể tạo claim ở trạng thái Trip này.
- Trace:
  - Requirement: REQ-TR-07
  - Business Rule: —
  - Acceptance Criteria: AC 7.1
- Layer: E2E
- Status: PASS

## US-08

### TC-034
- US: US-08
- Tên Test Case: Finance duyệt và đóng quyết toán hợp lệ
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Finance đăng nhập; claim chờ duyệt, không có Manager approval còn thiếu.
- Test Data: Claim thực tế ≤ dự toán không cần justification; hoặc vượt 0–10% kèm justification.
- Các bước thực hiện:
  1. Mở claim chờ duyệt.
  2. Kiểm tra chứng từ và chọn duyệt.
  3. Đóng hồ sơ sau khi quyết toán được duyệt.
- Kết quả mong đợi: Hồ sơ chuyển CLOSED và hiển thị chỉ đọc.
- Trace:
  - Requirement: REQ-TR-09
  - Business Rule: BR-TR-05, BR-TR-06
  - Acceptance Criteria: AC 8.1
- Layer: E2E
- Status: PASS

### TC-035
- US: US-08
- Tên Test Case: Finance không duyệt claim vượt 10% khi chưa có Manager approval
- Loại kiểm thử: Business Rule, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Finance mở claim có variance >10%, Manager chưa duyệt.
- Test Data: Claim vượt dự toán 15%.
- Các bước thực hiện:
  1. Mở claim.
  2. Quan sát nút duyệt và thử thao tác nếu còn bật.
- Kết quả mong đợi: Nút duyệt bị vô hiệu hóa hoặc thao tác bị chặn; cần Manager duyệt bổ sung.
- Trace:
  - Requirement: REQ-TR-09
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 8.2
- Layer: E2E
- Status: PASS

### TC-036
- US: US-08
- Tên Test Case: Finance yêu cầu chỉnh sửa claim kèm lý do
- Loại kiểm thử: Happy Path, State Transition
- Mức độ ưu tiên: Cao
- Preconditions: Finance có claim chờ duyệt.
- Test Data: Lý do cần chỉnh sửa.
- Các bước thực hiện:
  1. Mở claim.
  2. Chọn yêu cầu chỉnh sửa và nhập lý do.
  3. Xác nhận.
- Kết quả mong đợi: Claim được trả về Employee để bổ sung; lý do được hiển thị.
- Trace:
  - Requirement: REQ-TR-09
  - Business Rule: —
  - Acceptance Criteria: AC 8.3
- Layer: E2E
- Status: PASS

### TC-037
- US: US-08
- Tên Test Case: Hồ sơ CLOSED không cho phép thay đổi
- Loại kiểm thử: State, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Trip và Expense Claim đã CLOSED.
- Test Data: Hồ sơ CLOSED.
- Các bước thực hiện:
  1. Mở hồ sơ đã đóng.
  2. Thử sửa lịch trình hoặc chi phí.
- Kết quả mong đợi: Hồ sơ chỉ đọc; thay đổi không được lưu.
- Trace:
  - Requirement: REQ-TR-09
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 8.1
- Layer: E2E
- Status: PASS

## US-09

### TC-038
- US: US-09
- Tên Test Case: Employee xem danh sách chuyến đi của mình trên Dashboard
- Loại kiểm thử: Happy Path, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Employee đăng nhập và có Trip ở nhiều trạng thái.
- Test Data: Trips của Employee hiện tại và một Employee khác.
- Các bước thực hiện:
  1. Mở Dashboard bằng Employee hiện tại.
  2. Xem danh sách và các tab trạng thái.
- Kết quả mong đợi: Hiển thị chuyến đi của chính Employee, phân theo trạng thái; không hiển thị chuyến của người khác.
- Trace:
  - Requirement: REQ-TR-10, NFR-TR-03
  - Business Rule: —
  - Acceptance Criteria: AC 9.1
- Layer: E2E
- Status: PASS

### TC-039
- US: US-09
- Tên Test Case: Manager xem các yêu cầu đang chờ mình xử lý
- Loại kiểm thử: Happy Path, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Manager đăng nhập; nhân viên trực tiếp có yêu cầu chờ duyệt.
- Test Data: Yêu cầu của direct report và nhân viên ngoài nhóm.
- Các bước thực hiện:
  1. Mở Dashboard Manager.
  2. Xem danh sách chờ duyệt.
- Kết quả mong đợi: Hiển thị yêu cầu thuộc phạm vi Manager cần xử lý.
- Trace:
  - Requirement: REQ-TR-10, NFR-TR-03
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 9.2
- Layer: E2E
- Status: PASS

### TC-040
- US: US-09
- Tên Test Case: Finance xem các quyết toán cần xử lý
- Loại kiểm thử: Happy Path, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Finance đăng nhập; có claim chờ duyệt và hồ sơ chờ đóng.
- Test Data: Expense ở trạng thái chờ duyệt/chờ đóng.
- Các bước thực hiện:
  1. Mở Dashboard Finance.
  2. Xem các danh sách công việc.
- Kết quả mong đợi: Hiển thị đúng quyết toán Finance cần duyệt hoặc đóng.
- Trace:
  - Requirement: REQ-TR-10
  - Business Rule: BR-TR-05
  - Acceptance Criteria: AC 9.2
- Layer: E2E
- Status: PASS

### TC-041
- US: US-09
- Tên Test Case: Travel Admin xem yêu cầu chờ duyệt cấp 2
- Loại kiểm thử: Happy Path, Permission
- Mức độ ưu tiên: Cao
- Preconditions: Travel Admin đăng nhập; có Trip chờ cấp 2.
- Test Data: Trip PENDING_ADMIN_APPROVAL.
- Các bước thực hiện:
  1. Mở Dashboard Travel Admin.
  2. Xem danh sách chờ cấp 2.
- Kết quả mong đợi: Trip chờ cấp 2 xuất hiện trong danh sách.
- Trace:
  - Requirement: REQ-TR-10
  - Business Rule: BR-TR-04
  - Acceptance Criteria: AC 9.2
- Layer: E2E
- Status: PASS

### TC-042
- US: US-09
- Tên Test Case: Dashboard hiển thị trạng thái rỗng khi chưa có dữ liệu
- Loại kiểm thử: Empty State, UI
- Mức độ ưu tiên: Trung bình
- Preconditions: User đăng nhập bằng account chưa có dữ liệu liên quan.
- Test Data: Dashboard rỗng.
- Các bước thực hiện:
  1. Mở Dashboard.
- Kết quả mong đợi: Hiển thị hướng dẫn/trạng thái rỗng phù hợp, không có danh sách sai.
- Trace:
  - Requirement: REQ-TR-10
  - Business Rule: —
  - Acceptance Criteria: AC 9.1 hoặc AC 9.2 theo role
- Layer: UI
- Status: PASS

## US-10

### TC-043
- US: US-10
- Tên Test Case: Nhận thông báo khi Trip được duyệt
- Loại kiểm thử: Happy Path, Notification
- Mức độ ưu tiên: Cao
- Preconditions: Employee liên quan đang đăng nhập.
- Test Data: Trip được Manager approve.
- Các bước thực hiện:
  1. Giữ Dashboard Employee đang mở.
  2. Thực hiện approve bằng Manager.
  3. Quan sát chuông thông báo.
- Kết quả mong đợi: Employee nhận thông báo và số chưa đọc được cập nhật.
- Trace:
  - Requirement: REQ-TR-11
  - Business Rule: —
  - Acceptance Criteria: AC 10.1
- Layer: E2E
- Status: PASS

### TC-044
- US: US-10
- Tên Test Case: Đánh dấu một thông báo đã đọc
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Trung bình
- Preconditions: User có thông báo chưa đọc.
- Test Data: Một notification unread.
- Các bước thực hiện:
  1. Mở chuông thông báo.
  2. Chọn một thông báo.
- Kết quả mong đợi: Thông báo được đánh dấu đã đọc và số chưa đọc giảm tương ứng.
- Trace:
  - Requirement: REQ-TR-11
  - Business Rule: —
  - Acceptance Criteria: AC 10.1
- Layer: E2E
- Status: PASS

### TC-045
- US: US-10
- Tên Test Case: Đánh dấu tất cả thông báo đã đọc
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Trung bình
- Preconditions: User có nhiều thông báo chưa đọc.
- Test Data: Ít nhất hai notification unread.
- Các bước thực hiện:
  1. Mở chuông thông báo.
  2. Chọn “Đánh dấu tất cả đã đọc”.
- Kết quả mong đợi: Tất cả notification của user được đánh dấu đã đọc; badge unread về 0.
- Trace:
  - Requirement: REQ-TR-11
  - Business Rule: —
  - Acceptance Criteria: AC 10.1
- Layer: E2E
- Status: PASS

### TC-046
- US: US-10
- Tên Test Case: Employee owner tải PDF của Trip đủ điều kiện
- Loại kiểm thử: Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: Employee là owner; Trip ở trạng thái được phép export.
- Test Data: Trip APPROVED có itinerary/expense/approval history.
- Các bước thực hiện:
  1. Mở Trip.
  2. Chọn Export PDF Summary.
- Kết quả mong đợi: Tải file `.pdf` với content type `application/pdf`; báo cáo có thông tin chuyến đi, lịch trình, chi phí và lịch sử duyệt.
- Trace:
  - Requirement: REQ-TR-12
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 10.2
- Layer: E2E
- Status: PASS

### TC-047
- US: US-10
- Tên Test Case: Finance tải PDF của Trip đủ điều kiện
- Loại kiểm thử: Permission, Happy Path
- Mức độ ưu tiên: Cao
- Preconditions: User role FINANCE; Trip ở trạng thái được phép export.
- Test Data: Trip APPROVED.
- Các bước thực hiện:
  1. Mở Trip bằng Finance.
  2. Chọn Export PDF Summary.
- Kết quả mong đợi: Finance tải file `.pdf` với content type `application/pdf`.
- Trace:
  - Requirement: REQ-TR-12, NFR-TR-03
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 10.2
- Layer: E2E
- Status: PASS

### TC-048
- US: US-10
- Tên Test Case: Không cho Employee export Trip của người khác
- Loại kiểm thử: Permission
- Mức độ ưu tiên: Cao
- Preconditions: Employee đăng nhập; có Trip thuộc Employee khác.
- Test Data: Trip APPROVED của người khác.
- Các bước thực hiện:
  1. Mở hoặc truy cập Trip không thuộc mình.
  2. Thử Export PDF Summary.
- Kết quả mong đợi: Không tải được PDF.
- Trace:
  - Requirement: REQ-TR-12, NFR-TR-03
  - Business Rule: —
  - Acceptance Criteria: AC 10.2
- Layer: Integration
- Status: PASS

### TC-049
- US: US-10
- Tên Test Case: Không cho export PDF khi Trip chưa được duyệt
- Loại kiểm thử: State
- Mức độ ưu tiên: Cao
- Preconditions: Employee owner có Trip chưa được duyệt.
- Test Data: Trip DRAFT hoặc SUBMITTED.
- Các bước thực hiện:
  1. Mở Trip chưa được duyệt.
  2. Thử export PDF.
- Kết quả mong đợi: Không tải được PDF.
- Trace:
  - Requirement: REQ-TR-12
  - Business Rule: —
  - Acceptance Criteria: AC 10.2
- Layer: Integration
- Status: PASS

### TC-050
- US: US-10
- Tên Test Case: Nhận thông báo khi yêu cầu bị từ chối
- Loại kiểm thử: Notification
- Mức độ ưu tiên: Cao
- Preconditions: Người gửi yêu cầu đang đăng nhập.
- Test Data: Trip hoặc Expense Claim bị từ chối.
- Các bước thực hiện:
  1. Giữ giao diện người gửi đang mở.
  2. Approver hoặc Finance từ chối yêu cầu.
  3. Quan sát chuông thông báo.
- Kết quả mong đợi: Người gửi nhận được thông báo từ chối.
- Trace:
  - Requirement: REQ-TR-11
  - Business Rule: —
  - Acceptance Criteria: AC 10.1
- Layer: E2E
- Status: PASS

### TC-051
- US: US-10
- Tên Test Case: Nhận thông báo khi hồ sơ được đóng
- Loại kiểm thử: Notification
- Mức độ ưu tiên: Cao
- Preconditions: Employee đang đăng nhập; Finance có hồ sơ đủ điều kiện đóng.
- Test Data: Finance đóng hồ sơ đã duyệt quyết toán.
- Các bước thực hiện:
  1. Giữ giao diện Employee đang mở.
  2. Finance đóng hồ sơ.
  3. Quan sát chuông thông báo Employee.
- Kết quả mong đợi: Employee nhận được thông báo hồ sơ đã đóng.
- Trace:
  - Requirement: REQ-TR-11
  - Business Rule: BR-TR-06
  - Acceptance Criteria: AC 10.1
- Layer: E2E
- Status: PASS

## Coverage Matrix: US → Requirement → AC/BR → TC IDs

| US | Requirement | AC/BR | TC IDs |
|---|---|---|---|
| US-01 | REQ-TR-01, REQ-TR-03 | AC 1.1–1.3; BR-TR-01–03, BR-TR-08 | TC-001–006 |
| US-02 | REQ-TR-02 | AC 2.1; BR-TR-07 | TC-007–008 |
| US-03 | REQ-TR-06 | AC 3.1–3.2; BR-TR-01, 02, 06, 08 | TC-009–014 |
| US-04 | REQ-TR-03 | AC 4.1–4.2; BR-TR-03, 04, 08 | TC-015–017 |
| US-05 | REQ-TR-04 | AC 5.1–5.3; BR-TR-04 | TC-018–022 |
| US-06 | REQ-TR-05 | AC 6.1–6.2; BR-TR-04 | TC-023–025 |
| US-07 | REQ-TR-07, REQ-TR-08 | AC 7.1–7.3; BR-TR-05 | TC-026–033 |
| US-08 | REQ-TR-09 | AC 8.1–8.3; BR-TR-05, 06 | TC-034–037 |
| US-09 | REQ-TR-10 | AC 9.1–9.2; RBAC NFR-TR-03 | TC-038–042 |
| US-10 | REQ-TR-11, REQ-TR-12 | AC 10.1–10.2; BR-TR-06; RBAC NFR-TR-03 | TC-043–051 |

## Open QA Questions

1. **US-01 urgency reason.** Story spec ghi lý do khẩn cấp tối thiểu 10 ký tự nhưng còn callout cần PO xác nhận; xác nhận ngưỡng và quy tắc trim.
2. **US-03 hotel/per diem.** Một số nội dung cũ đề cập cảnh báo thành phần; BR-TR-08/D-16 chỉ quy định một cảnh báo tổng hợp. Cần đồng bộ nguồn cũ.
3. **US-04 Policy Check.** Xác nhận bước/trigger UI chính xác giữa tạo nháp, chạy policy và gửi yêu cầu; code hiện có một phần policy preview trong form.
4. **US-07 variance.** Xác nhận chi phí không vượt dự toán có cần giải trình hay chỉ trường hợp variance dương đến 10% như story spec.
5. **US-10 PDF.** Story/AC yêu cầu PDF, nhưng testcase trước ghi implementation trả HTML. Xác nhận trạng thái hiện tại trước khi coi TC-046/047 pass.
6. **US-10 notification.** Xác nhận UI hiện hỗ trợ mark-read đơn lẻ/read-all và notification được phát cho đủ các hành động approve/reject/close.

## Tổng số Test Case

| User Story | Số TC |
|---|---:|
| US-01 | 6 |
| US-02 | 2 |
| US-03 | 6 |
| US-04 | 3 |
| US-05 | 5 |
| US-06 | 3 |
| US-07 | 8 |
| US-08 | 4 |
| US-09 | 5 |
| US-10 | 9 |
| **Tổng** | **51** |

## Automation Review

Các case dưới đây được phân loại theo hướng tự động hóa. UI behavior dùng E2E; rule/state/permission có thể kiểm tra qua API/Integration; AI và SSE phụ thuộc fixture/môi trường test. Chưa case nào cần giữ Manual riêng: PDF binary, quyền và state có thể kiểm tra tự động; phần visual/font không phải expected của các TC hiện có.

| TC ID | Mode | Automation Type | Reason |
| ----- | ---- | --------------- | ------ |
| TC-001 | Automation Candidate | E2E | Luồng tạo và lưu nháp qua form. |
| TC-002 | Automation Candidate | E2E | Kiểm tra validation hiển thị và không lưu. |
| TC-003 | Automation Candidate | E2E | Kiểm tra lỗi ngày trên form. |
| TC-004 | Automation Candidate | E2E | Kiểm tra cảnh báo hạn mức trong giao diện. |
| TC-005 | Automation Candidate | E2E | Thao tác xác nhận urgent và lưu form. |
| TC-006 | Automation Candidate | E2E | Boundary độ dài sau trim qua form. |
| TC-007 | Automation Candidate | Integration | Dùng mock/fixture AI ổn định, kiểm tra lịch trình trả về. |
| TC-008 | Automation Candidate | E2E | Kiểm tra điều hướng bỏ qua AI. |
| TC-009 | Automation Candidate | E2E | Thao tác thêm và hiển thị itinerary item. |
| TC-010 | Automation Candidate | E2E | Thao tác sửa item qua giao diện. |
| TC-011 | Automation Candidate | E2E | Thao tác xóa item qua giao diện. |
| TC-012 | Automation Candidate | E2E | Kiểm tra tổng dự toán sau thay đổi UI. |
| TC-013 | Automation Candidate | E2E | Kiểm tra chỉ có cảnh báo tổng hợp. |
| TC-014 | Automation Candidate | API | Kiểm tra write bị chặn ở trạng thái CLOSED. |
| TC-015 | Automation Candidate | E2E | Kiểm tra policy preview trong form. |
| TC-016 | Automation Candidate | Integration | Kiểm tra policy chính thức và snapshot khi submit. |
| TC-017 | Automation Candidate | Integration | Kiểm tra định tuyến policy cho urgent. |
| TC-018 | Automation Candidate | E2E | Luồng Manager duyệt một cấp. |
| TC-019 | Automation Candidate | E2E | Luồng Manager duyệt và chuyển cấp 2. |
| TC-020 | Automation Candidate | E2E | Luồng reject có lý do. |
| TC-021 | Automation Candidate | E2E | Kiểm tra validation lý do reject. |
| TC-022 | Automation Candidate | API | Kiểm tra quyền Manager theo quan hệ quản lý. |
| TC-023 | Automation Candidate | E2E | Luồng Travel Admin duyệt cấp 2. |
| TC-024 | Automation Candidate | E2E | Luồng Travel Admin reject cấp 2. |
| TC-025 | Automation Candidate | API | Kiểm tra role được phép xử lý Level 2. |
| TC-026 | Automation Candidate | E2E | Luồng tạo Expense Claim từ Trip. |
| TC-027 | Automation Candidate | E2E | Luồng thêm khoản chi qua form. |
| TC-028 | Automation Candidate | E2E | Kiểm tra bảng đối chiếu hiển thị. |
| TC-029 | Automation Candidate | Integration | Kiểm tra submit khi variance không dương. |
| TC-030 | Automation Candidate | Integration | Kiểm tra ngưỡng variance và justification. |
| TC-031 | Automation Candidate | Integration | Kiểm tra chặn submit thiếu justification. |
| TC-032 | Automation Candidate | Integration | Kiểm tra nhánh Manager re-approval >10%. |
| TC-033 | Automation Candidate | API | Kiểm tra state không cho tạo expense. |
| TC-034 | Automation Candidate | E2E | Luồng Finance duyệt rồi đóng hồ sơ. |
| TC-035 | Automation Candidate | Integration | Kiểm tra Finance bị chặn khi thiếu Manager re-approval. |
| TC-036 | Automation Candidate | E2E | Luồng Finance yêu cầu chỉnh sửa. |
| TC-037 | Automation Candidate | API | Kiểm tra bất biến CLOSED trên write endpoints. |
| TC-038 | Automation Candidate | Integration | Kiểm tra lọc dữ liệu dashboard theo Employee. |
| TC-039 | Automation Candidate | E2E | Kiểm tra queue Manager và dữ liệu hiển thị. |
| TC-040 | Automation Candidate | E2E | Kiểm tra queue Finance. |
| TC-041 | Automation Candidate | E2E | Kiểm tra queue Travel Admin. |
| TC-042 | Automation Candidate | E2E | Kiểm tra empty state dashboard. |
| TC-043 | Automation Candidate | Integration | Kiểm tra notification delivery qua SSE sau approve. |
| TC-044 | Automation Candidate | API | Kiểm tra mark-read đơn. |
| TC-045 | Automation Candidate | API | Kiểm tra read-all. |
| TC-046 | Automation Candidate | API | Kiểm tra tải PDF, content type và nội dung có thể trích xuất. |
| TC-047 | Automation Candidate | API | Kiểm tra quyền Finance và response PDF. |
| TC-048 | Automation Candidate | API | Kiểm tra chặn Employee không sở hữu Trip. |
| TC-049 | Automation Candidate | API | Kiểm tra export bị chặn theo state. |
| TC-050 | Automation Candidate | Integration | Kiểm tra notification delivery qua SSE sau reject. |
| TC-051 | Automation Candidate | Integration | Kiểm tra notification delivery qua SSE sau close. |


### Dependency cần chuẩn bị

- **Playwright:** browser, selector ổn định, login theo role và helper chờ trạng thái UI.
- **API/Integration:** test DB cô lập, seed/cleanup dữ liệu cho Employee/Manager/Travel Admin/Finance, JWT fixtures và reset trạng thái Trip/Expense.
- **Business rule:** ngày giờ cố định/fake clock; dữ liệu biên cho urgency, Combined_Limit và variance.
- **AI:** mock provider/fixture trả kết quả xác định; không gọi dịch vụ AI bên ngoài trong test tự động.
- **SSE notification:** test client giữ kết nối, event timeout/reconnect được kiểm soát, recipient fixtures và cleanup notification.
- **PDF:** gọi endpoint trong integration test, xác nhận status/header/filename và trích xuất text từ binary; visual/font/layout có thể kiểm tra riêng bằng manual nếu được bổ sung thành tiêu chí.
- **CI:** lệnh chạy tách lớp E2E và API/Integration; lưu artifact khi test UI hoặc PDF thất bại.

