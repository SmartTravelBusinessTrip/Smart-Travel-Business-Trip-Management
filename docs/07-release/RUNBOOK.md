# Runbook — Smart Travel & Business Trip Management

Runbook này hướng dẫn sinh viên cách chạy, kiểm tra và debug ứng dụng trên máy local. Mục tiêu là giữ cho quy trình giống nhau dù từng người dùng ở môi trường khác nhau.

## 1. Mục tiêu

- Khởi động backend và frontend đúng cách
- Chuẩn bị PostgreSQL local
- Chạy migration + seed
- Kiểm tra app hoạt động trên browser
- Xử lý lỗi thường gặp nhanh

## 2. Yêu cầu hệ thống

- Node.js >= 20
- npm >= 9
- Docker Desktop hoặc PostgreSQL đã cài sẵn
- Git

## 3. Cài đặt ban đầu

```bash
git clone <repo-url>
cd Smart-Travel-Business-Trip-Management
npm install
```

> Repo có `workspaces`; cách cài đặt chuẩn là chạy ở thư mục gốc. Không cần install ở từng package riêng nếu đã chạy ở root.

## 4. Chuẩn bị biến môi trường

Tạo file `src/backend/.env`:

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_travel?schema=public"
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:5173
GROQ_API_KEY=your_groq_key_here
```

Tạo file `src/frontend/.env` nếu cần:

```env
VITE_API_BASE_URL=/api/v1
```

> Nếu thiếu `.env`, backend có thể chạy ở port `3001` theo code mặc định. Điều này không khớp với Vite proxy `5000`; vì vậy phải tạo `.env` trước khi khởi động server.

## 5. Chuẩn bị PostgreSQL

### Cách nhanh nhất bằng Docker

```bash
docker run --name smart-travel-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_travel \
  -p 5432:5432 \
  -d postgres:16
```

Kiểm tra container:

```bash
docker ps
```

### Nếu database chưa tạo

```bash
docker exec -it smart-travel-db psql -U postgres -d postgres
CREATE DATABASE smart_travel;
```

## 6. Khởi tạo database

```bash
cd src/backend
npm run db:setup
```

Nếu cần reset từ đầu:

```bash
npm run db:reset
```

## 7. Chạy backend

```bash
cd src/backend
npm run dev
```

Backend sẽ mở ở port 5000 và expose các endpoint dưới `/api/v1`.

Kiểm tra trạng thái:

```bash
curl http://localhost:5000/health
```

Kết quả mong đợi:

```json
{
  "status": "ok",
  "service": "smart-travel-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-10T10:00:00.000Z",
  "environment": "development"
}
```

## 8. Chạy frontend

Mở terminal mới:

```bash
cd src/frontend
npm run dev
```

Frontend chạy ở:

- http://localhost:5173

## 9. Đăng nhập

Tất cả tài khoản demo có cùng mật khẩu:

```text
12345678
```

| Vai trò | Email |
|---|---|
| Employee | `nhanvien@smarttravel.vn` |
| Manager | `truongphong@smarttravel.vn` |
| Travel Admin | `admin@smarttravel.vn` |
| Finance | `ketoan@smarttravel.vn` |

## 10. Kiểm tra app

- Truy cập http://localhost:5173
- Tạo trip request mới
- Kiểm tra một vòng duyệt manager / admin / finance
- Nếu cần AI, mở chức năng Generate AI Itinerary và đảm bảo `GROQ_API_KEY` đúng

## 11. Chạy test

```bash
# Backend
npm --prefix src/backend run test:run

# Frontend
npm --prefix src/frontend run test:run
```

## 12. Xử lý sự cố thường gặp

### Lỗi database connection

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` trong `src/backend/.env`
- Kiểm tra port 5432 không bị sử dụng bởi service khác

### Lỗi CORS

- Đảm bảo backend chạy trên port 5000
- Đảm bảo `CORS_ORIGIN=http://localhost:5173`

### Lỗi JWT / login

- Kiểm tra `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` có giá trị không rỗng
- Dùng chuỗi dài và ngẫu nhiên

### Lỗi AI

- Kiểm tra `GROQ_API_KEY`
- Nếu không có key, bạn chỉ có thể chạy các tính năng không cần AI

### Lỗi frontend không gọi được API

- Kiểm tra Vite dev server đang chạy trên 5173
- Kiểm tra backend đang chạy trên 5000
- Kiểm tra `src/frontend/vite.config.ts` proxy `/api` vẫn trỏ tới `http://localhost:5000`

## 13. Kết luận

Runbook này đủ để một sinh viên mới clone repo và chạy được hệ thống. Nếu cần phân tích nghiệp vụ, hãy xem thêm:

- [README.md](../../README.md)
- [docs/TRACEABILITY.md](../TRACEABILITY.md)
- [docs/02-vault/02-requirements/requirements.md](../02-vault/02-requirements/requirements.md)
