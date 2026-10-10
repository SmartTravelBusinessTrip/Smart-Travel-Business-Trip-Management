# Smart Travel & Business Trip Management

Dự án web quản lý xin đi công tác, phê duyệt, lịch trình, chi phí và báo cáo trong doanh nghiệp. Ứng dụng mô phỏng quy trình từ khi nhân viên tạo trip request đến khi finance đóng hồ sơ và xuất báo cáo.

Nhóm 11 — MIS3032_1

## Tóm tắt chức năng

- Employee tạo Trip Request, cập nhật itinerary và nộp expense claim.
- Manager phê duyệt/từ chối ở cấp 1; Travel Admin xử lý cấp 2 nếu cần.
- Hệ thống kiểm tra policy, cảnh báo vi phạm và định tuyến theo quyền.
- AI sinh nháp itinerary theo điểm đến, ngày đi, ngân sách và ràng buộc.
- Dashboard theo vai trò, thông báo nội bộ và export PDF.

## Kiến trúc

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + Prisma
- Database: PostgreSQL
- Auth: JWT access/refresh token
- AI: Groq SDK, model `openai/gpt-oss-20b`

## Cấu trúc repo chính

```text
Smart-Travel-Business-Trip-Management/
├─ README.md
├─ .env.example
├─ .env.e2e.example
├─ package.json
├─ playwright.config.ts
├─ .github/
│  └─ workflows/ci.yml
├─ docs/
│  ├─ 00-project-index.md
│  ├─ TRACEABILITY.md
│  ├─ team-roles.md
│  ├─ 01-discovery/
│  ├─ 02-vault/
│  ├─ 03-product/
│  ├─ 04-design/
│  ├─ 05-technical/
│  ├─ 06-testing/
│  ├─ 07-release/          (có RUNBOOK.md)
│  ├─ 08-quality/
│  └─ logs/
├─ src/
│  ├─ frontend/
│  └─ backend/
│     ├─ .env.example
│     └─ src/
├─ tests/
│  ├─ api/
│  ├─ e2e/
│  ├─ integration/
│  └─ unit/
└─ package-lock.json
```

## Cách cài đặt

Repo khai báo `workspaces` ở `package.json` gốc, nên chỉ cần chạy một lần ở thư mục gốc:

```bash
npm install
```

Lệnh này cài dependency cho root, `src/backend` và `src/frontend`. Không cần `npm install` riêng ở từng package; chỉ dùng `npm --prefix ...` khi muốn gọi script của package đó.

## Bắt đầu nhanh

### 1) Yêu cầu

- Node.js 20+
- npm 9+
- PostgreSQL 16 hoặc Docker Desktop
- Git

### 2) Clone repo

```bash
git clone <repo-url>
cd Smart-Travel-Business-Trip-Management
npm install
```

### 3) Tạo file môi trường backend

Sao chép mẫu `src/backend/.env.example` thành `src/backend/.env`:

```bash
# macOS / Linux / Git Bash
cp src/backend/.env.example src/backend/.env

# Windows PowerShell
Copy-Item src/backend/.env.example src/backend/.env
```

Nội dung mẫu:

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_travel?schema=public"
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
CORS_ORIGIN=http://localhost:5173
GROQ_API_KEY=your_groq_key_here
```

> **Quan trọng:** nếu thiếu `.env`, backend dùng giá trị mặc định trong code và chạy ở cổng `3001` thay vì `5000`. Vite proxy trỏ tới `http://localhost:5000`, nên bắt buộc phải có `src/backend/.env` với `PORT=5000`.

### 4) Chuẩn bị PostgreSQL

Cách nhanh nhất bằng Docker:

```bash
docker run --name smart-travel-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_travel \
  -p 5432:5432 \
  -d postgres:16
```

Kiểm tra:

```bash
docker ps
```

Nếu cần dùng lại container cũ:

```bash
docker start smart-travel-db
```

### 5) Khởi tạo schema và seed dữ liệu demo

```bash
cd src/backend
npm run db:setup
```

Lệnh này chạy Prisma migration và seed user demo.

Nếu cần reset lại dữ liệu:

```bash
npm run db:reset
```

### 6) Chạy backend

```bash
cd src/backend
npm run dev
```

Backend chạy ở:
- API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/health

### 7) Chạy frontend

Mở một terminal khác:

```bash
cd src/frontend
npm run dev
```

Frontend dev server chạy ở http://localhost:5173. Vite proxy `/api` sang `http://localhost:5000`.

### 8) Truy cập ứng dụng

Mở trình duyệt tại http://localhost:5173

### 9) Tài khoản demo

Mật khẩu mặc định cho tất cả tài khoản demo: `12345678`

| Email | Vai trò |
|---|---|
| `nhanvien@smarttravel.vn` | Employee |
| `truongphong@smarttravel.vn` | Manager |
| `admin@smarttravel.vn` | Travel Admin |
| `ketoan@smarttravel.vn` | Finance |

## AI integration

AI itinerary dùng `groq-sdk` với model `openai/gpt-oss-20b` (cấu hình trong `src/backend/src/lib/ai.client.ts`).

- Cần `GROQ_API_KEY` để sinh lịch trình bằng AI. Nếu thiếu key, tính năng AI không hoạt động.
- Các chức năng còn lại vẫn chạy bình thường khi không có key.

## Chạy theo mode production-like

```bash
cd src/backend && npm run build
cd src/backend && npm start
```

`npm run build` của backend đã bao gồm bước build frontend. Khi backend chạy ở production mode, frontend build được phục vụ từ `src/frontend/dist`.

## Kiểm tra nhanh

Chạy từ thư mục gốc:

```bash
# Backend tests
npm --prefix src/backend run test:run

# Frontend tests
npm --prefix src/frontend run test:run
```

Các script riêng ở `package.json` gốc: `npm run test:unit`, `npm run test:api`, `npm run test:integration` (cần PostgreSQL), `npm run test:e2e` (Playwright, cần cấu hình theo `.env.e2e.example`).

## Tài liệu liên quan

- [docs/00-project-index.md](docs/00-project-index.md)
- [docs/TRACEABILITY.md](docs/TRACEABILITY.md)
- [docs/07-release/RUNBOOK.md](docs/07-release/RUNBOOK.md)
- [docs/02-vault/02-requirements/requirements.md](docs/02-vault/02-requirements/requirements.md)

## Lưu ý cho sinh viên

- Cài đặt chuẩn là ở thư mục gốc theo `workspaces`; không cần `npm install` ở từng package.
- Nếu thiếu `src/backend/.env`, backend chạy ở cổng `3001` và không khớp với Vite proxy 5000.
- Nếu sai `DATABASE_URL`, backend không khởi động được.
- Khi đổi code frontend, reload Vite dev server để thấy thay đổi.
- Nếu gặp lỗi CORS, kiểm tra `CORS_ORIGIN=http://localhost:5173` và `PORT=5000` trong `src/backend/.env`.
