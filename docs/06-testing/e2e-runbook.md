# Hướng dẫn chạy E2E Tests — Smart Travel

Tài liệu này hướng dẫn từng bước để chạy Playwright E2E tests trên môi trường local, trỏ vào Railway test DB riêng biệt.

**Yêu cầu trước khi bắt đầu:**
- Node.js ≥ 20 đã cài
- Dependencies đã cài (`npm install` ở root)
- Playwright/Chromium đã cài (`npx playwright install chromium`)
- Có Railway test DB riêng (không phải production DB)

---

## Tổng quan

```
Bước 1            Bước 2              Bước 3           Bước 4
Chuẩn bị DB  →   Cấu hình env   →   Khởi động app →  Chạy test
(một lần)         (một lần)           (mỗi lần test)   (mỗi lần test)
```

---

## Bước 1 — Chuẩn bị Railway test DB

Chỉ cần chạy **một lần** khi setup lần đầu, hoặc sau khi reset data.

Mở PowerShell tại thư mục gốc repository. Trỏ `DATABASE_URL` vào Railway test DB:

```powershell
$env:DATABASE_URL = "postgresql://postgres:<password>@<host>.railway.app:<port>/railway"
```

Lấy connection string từ Railway dashboard → chọn database test → tab **Connect** → mục **DATABASE_URL**.

Kiểm tra URL đã đúng:

```powershell
$env:DATABASE_URL
```

Apply migration để tạo schema:

```powershell
npm.cmd --prefix src/backend run db:migrate:prod
```

Seed dữ liệu base:

```powershell
npm.cmd --prefix src/backend run db:seed
```

Seed dữ liệu E2E fixtures (accounts, trips, expenses theo các trạng thái cần test):

```powershell
npm.cmd --prefix src/backend run db:seed:e2e
```

Nếu cần reset sạch và seed lại từ đầu:

```powershell
npm.cmd --prefix src/backend run db:reset:e2e
```

> `db:reset:e2e` xóa toàn bộ DB rồi migrate lại và seed lại cả base lẫn E2E. Chỉ dùng khi data bị stale hoặc fixture trùng key.

---

## Bước 2 — Cấu hình file env cho Playwright

Playwright đọc cấu hình từ `.env.e2e.local` ở thư mục gốc. File này đã được gitignore.

Copy file mẫu:

```powershell
Copy-Item .env.e2e.example .env.e2e.local
```

Mở `.env.e2e.local` và điền hai thông tin bắt buộc:

```dotenv
# URL frontend đang chạy local (xem Bước 3)
BASE_URL=http://localhost:5173

# Connection string Railway test DB (cùng URL ở Bước 1)
DATABASE_URL=postgresql://postgres:<password>@<host>.railway.app:<port>/railway
```

Các dòng `E2E_*_EMAIL` / `E2E_*_PASSWORD` đã có giá trị đúng từ file mẫu — không cần thay đổi vì khớp với tài khoản được tạo trong seed.

---

## Bước 3 — Khởi động app local

Playwright cần frontend và backend đang chạy để test. Mở **hai cửa sổ PowerShell riêng**.

**Cửa sổ 1 — Backend** (phải set `DATABASE_URL` trỏ vào test DB):

```powershell
$env:DATABASE_URL = "postgresql://postgres:TyCRhVomswEMmQJIvfzkkWuDUkmYxlLN@nozomi.proxy.rlwy.net:40373/railway"
npm.cmd --prefix src/backend run dev
```

Backend khởi động tại `http://localhost:3000`. Chờ đến khi thấy log `Server listening on port 3000`.

**Cửa sổ 2 — Frontend:**

```powershell
npm.cmd --prefix src/frontend run dev
```

Frontend khởi động tại `http://localhost:5173`. Chờ đến khi thấy log `Local: http://localhost:5173/`.

Mở `http://localhost:5173` trên browser và thử đăng nhập bằng một account test để xác nhận app kết nối đúng DB:

```
Email:    nam.nguyen@smarttravel.dev
Password: Password123!
```

Nếu đăng nhập được và thấy dashboard → app đã sẵn sàng.

---

## Bước 4 — Chạy E2E tests

Quay lại **cửa sổ PowerShell thứ ba** (hoặc bất kỳ cửa sổ nào không phải terminal đang chạy app).

**Chạy toàn bộ E2E:**

```powershell
npm.cmd run test:e2e
```

**Chạy một scenario cụ thể:**

```powershell
npm.cmd run test:e2e -- tests/e2e/e2e-01-employee-skip-ai-submit.spec.ts
```

**Xem danh sách tất cả test cases:**

```powershell
npm.cmd run test:e2e:list
```

**Xem HTML report sau khi chạy:**

```powershell
npx playwright show-report
```

Report lưu tại `playwright-report/index.html`. Mở file này để xem kết quả chi tiết, screenshot và trace khi test fail.

---

## Accounts E2E và mục đích sử dụng

Tất cả accounts dưới đây đã được tạo bởi `db:seed` + `db:seed:e2e`. Password đồng nhất: `Password123!`

| Account | Email | Dùng cho |
|---|---|---|
| Employee 1 | nam.nguyen@smarttravel.dev | E2E-01, 02, 03, 05, 06, 11 — có nhiều trips ở các trạng thái |
| Employee 2 | bao.tran@smarttravel.dev | E2E-03, 04, 07, 11 — có trips APPROVED và REJECTED |
| Employee (empty) | hoa.dinh@smarttravel.dev | E2E-09 — không có trip, kiểm tra empty state |
| Employee (out-of-scope) | phong.ly@smarttravel.dev | E2E-04 — báo cáo Manager B, không thuộc phạm vi Manager A |
| Manager A | hung.tran@smarttravel.dev | E2E-03, 04, 05, 07, 09, 10 — quản lý Employee 1 và 2 |
| Manager B | khoa.nguyen@smarttravel.dev | E2E-04 — quản lý Employee out-of-scope |
| Manager (empty) | an.tran@smarttravel.dev | E2E-09 — không có direct report nào gửi trip |
| Travel Admin | mai.le@smarttravel.dev | E2E-03, 09, 10 — duyệt Level 2 |
| Finance | trang.pham@smarttravel.dev | E2E-07, 08, 09, 10, 11 — xử lý quyết toán |

---

## Trips và trạng thái đã seed

| Trip Code | Trạng thái | Thuộc | Dùng cho E2E |
|---|---|---|---|
| TR-2026-0001 | DRAFT | Employee 1 | E2E-01 |
| TR-2026-0002 | SUBMITTED | Employee 1 | E2E-03, 04 |
| TR-2026-0003 | APPROVED | Employee 2 | E2E-05, 11 |
| TR-2026-0004 | PENDING_LEVEL2 | Employee 1 | E2E-03, 09, 10 |
| TR-2026-0005 | REJECTED | Employee 2 | E2E-03, 04 |
| TR-2026-0006 | SUBMITTED | Employee out-of-scope | E2E-04, 09 |
| TR-2026-0007 | ONGOING | Employee 1 | E2E-05 |
| TR-2026-0008 | APPROVED | Employee 2 | E2E-07, 11 |
| TR-2026-0009 | CLOSED | Employee 1 | E2E-07 |
| TR-2026-0010 | APPROVED | Employee 1 | E2E-06 |

---

## Khi test fail

**Lỗi kết nối / không mở được app:**
- Kiểm tra backend và frontend đang chạy (`localhost:3000` và `localhost:5173`)
- Kiểm tra `BASE_URL=http://localhost:5173` trong `.env.e2e.local`

**Lỗi đăng nhập / sai credentials:**
- Kiểm tra `E2E_*_EMAIL` và `E2E_*_PASSWORD` trong `.env.e2e.local`
- Xác nhận seed đã chạy thành công (thử đăng nhập thủ công trên browser)

**Lỗi không tìm thấy trip / data không đúng trạng thái:**
- DB có thể còn data từ lần chạy E2E trước làm thay đổi trạng thái fixtures
- Reset và seed lại: `npm.cmd --prefix src/backend run db:reset:e2e`

**Lỗi trùng fixture key:**
- Nguyên nhân: seed chạy hai lần trên cùng DB không được reset
- `db:seed:e2e` dùng upsert nên an toàn để chạy lại — nếu vẫn lỗi thì chạy `db:reset:e2e`

**Test BLOCKED (skip):**
- Playwright hiển thị "skipped" nếu biến `E2E_*_EMAIL` chưa được set trong `.env.e2e.local`
- Kiểm tra file `.env.e2e.local` tồn tại và có đủ các key

**Assertion fail sau khi kết nối được:**
- Ghi nhận là **FAIL thật** — không phải lỗi môi trường
- Xem chi tiết trong `playwright-report/index.html`
- Không sửa code để ép test xanh; ghi nhận bug và báo cáo

---

## Dừng app sau khi test xong

Nhấn `Ctrl+C` trong cả hai terminal đang chạy backend và frontend.

Railway test DB vẫn giữ nguyên data cho lần chạy tiếp theo. Chỉ reset khi cần thiết.
