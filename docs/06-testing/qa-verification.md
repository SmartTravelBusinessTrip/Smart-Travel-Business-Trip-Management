# QA Human Verification

## QA-Q-01 — US-01 Urgency Reason

### Decision

- Lý do chuyến khẩn cấp tối thiểu 10 ký tự.
- Trim khoảng trắng đầu/cuối trước khi kiểm tra độ dài.
- Dưới 10 ký tự: không cho tạo yêu cầu.
- Từ 10 ký tự trở lên: hợp lệ.

### Affected

- US-01
- BR-TR-03
- AC 1.3

### Status

RESOLVED

## QA-Q-02 — US-03 Hotel/Per Diem Warning

### Decision

- Không hiển thị cảnh báo riêng cho Hotel và Per Diem.
- Chỉ hiển thị một cảnh báo tổng hợp khi tổng chi phí vượt `Combined_Limit`.
- Căn cứ BR-TR-08 / D-16.

### Affected

- US-03
- BR-TR-08
- AC 3.2

### Status

RESOLVED

## QA-Q-03 — US-04 Policy Check Trigger

### Decision

- Khi nhập/chỉnh form, có thể hiển thị policy preview.
- Khi bấm “Gửi yêu cầu”, thực hiện Policy Check chính thức.
- Submit tạo snapshot `approvalReasons` và `requiresLevel2`.

### Affected

- US-04
- AC 4.1 / AC 4.2

### Status

RESOLVED

## QA-Q-04 — US-07 Expense Variance

### Decision

- Chi phí không vượt dự toán: không cần justification.
- `variance > 0` và `≤10%`: cần justification.
- `variance >10%`: cần Manager re-approval.

### Affected

- US-07 / US-08
- BR-TR-05
- AC 7.3 / AC 8.2

### Status

RESOLVED

## AI-QA-03 — TC-004

### AI Output

Codex phát hiện TC-004 trace AC 1.1 nhưng AC 1.1
chỉ mô tả happy path.

### Human Verification

Đã kiểm tra Story Spec US-01 và xác nhận validation
errors được mô tả tại E-01 đến E-04.

### Final Decision

REVISE TC-004.

QA cập nhật trace của testcase.

## QA-Q-05 — US-10 PDF

### QA Verification

- Kiểm tra implementation PDF hiện tại.
- Nếu endpoint trả `application/pdf` và file `.pdf`, đóng finding cũ và tiếp tục execute TC PDF.
- Nếu vẫn trả HTML, trạng thái là NOT READY.
- Không đánh dấu PASS nếu chưa có execution evidence.

### Affected

- US-10
- AC 10.2

### Evidence hiện có

Đã kiểm tra `src/backend/src/controllers/pdf.controller.ts`: code hiện đặt response `Content-Type: application/pdf` và tên file `.pdf`. Đây là evidence kiểm tra code; chưa phải execution evidence từ request thực tế.

### Status

PENDING VERIFICATION

## QA-Q-06 — US-10 Notification

### QA Verification

- Verify mark-read một notification.
- Verify read-all.
- Verify notification được tạo khi approve/reject/close.
- Chỉ PASS khi có execution evidence.

### Affected

- US-10
- AC 10.1

### Status

PENDING VERIFICATION
