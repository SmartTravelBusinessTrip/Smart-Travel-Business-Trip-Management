# Hướng dẫn chuẩn bị chạy 38 Integration Tests

Tài liệu dành cho Dev. Mục tiêu là chuẩn bị PostgreSQL test riêng để các integration test chạy được trước khi đánh giá PASS/FAIL. Không dùng database production hoặc database E2E đang triển khai.

## Vì sao hiện các test đang BLOCKED?

QA report ghi nhận 38 integration tests bị BLOCKED vì PostgreSQL tại `localhost:5432` không nhận kết nối. Test bị dừng ở bước chuẩn bị kết nối database, nên đây chưa phải kết quả PASS/FAIL của các assertion.

Hai suite nằm tại:

- `tests/integration/itinerary.apply.test.ts`
- `tests/integration/concurrency.test.ts`

Vitest đọc các file này từ `src/backend/vitest.config.mts`. Cả hai suite cần PostgreSQL thật; suite concurrency còn tạo và xóa SQL trigger. Vì vậy, dùng một database test cục bộ riêng với user có quyền quản trị schema/trigger.

## Điều kiện cần

- Node.js và dependencies của repository đã được cài.
- Docker Desktop đang chạy, hoặc có PostgreSQL cục bộ tương đương.
- Cổng `5432` trên máy còn trống (hoặc chọn cổng khác và cập nhật `DATABASE_URL`).
- Database dành riêng cho test, có thể tạo lại vì test sử dụng fixture cố định.

Không trỏ `DATABASE_URL` vào `.env` production, database dùng chung, hoặc database của môi trường E2E.

## Cách chuẩn bị bằng Docker trên Windows PowerShell

Mở PowerShell tại thư mục gốc repository. Tạo PostgreSQL test riêng:

```powershell
docker run --name smart-travel-test-db `
  -e POSTGRES_USER=test `
  -e POSTGRES_PASSWORD=test `
  -e POSTGRES_DB=smart_travel_test `
  -p 5432:5432 `
  -d postgres:16
```

Nếu container cùng tên đã tồn tại, dùng lại container đó bằng `docker start smart-travel-test-db`. Kiểm tra container và PostgreSQL:

```powershell
docker ps --filter "name=smart-travel-test-db"
docker exec smart-travel-test-db pg_isready -U test -d smart_travel_test
Test-NetConnection localhost -Port 5432
```

`pg_isready` cần báo server đang nhận kết nối; `TcpTestSucceeded` cần là `True`.

Nếu cổng 5432 đang được dùng, tạo container với ánh xạ `-p 5433:5432` rồi dùng cổng `5433` trong URL bên dưới.

## Trỏ lệnh migration và test vào test database

Trong cùng cửa sổ PowerShell, đặt URL rõ ràng:

```powershell
$env:DATABASE_URL = "postgresql://test:test@localhost:5432/smart_travel_test?schema=public"
```

Kiểm tra URL trước khi chạy lệnh tiếp theo:

```powershell
$env:DATABASE_URL
```

Áp dụng các migration rồi chạy integration tests:

```powershell
npm.cmd --prefix src/backend run db:migrate:prod
npm.cmd --prefix src/backend run test:integration
```

Script `db:migrate:prod` có tên dễ gây nhầm: trong `src/backend/package.json`, lệnh thực tế là `prisma migrate deploy`. Nó dùng `DATABASE_URL` của cửa sổ hiện tại. Chỉ chạy sau khi đã xác nhận URL trỏ đúng `smart_travel_test`.

Các suite tự tạo dữ liệu test; không cần chạy seed. `src/backend/src/__tests__/setup.ts` đặt giá trị mặc định `DATABASE_URL` về `localhost:5432/smart_travel_test`, nhưng giá trị `$env:DATABASE_URL` được đặt trong PowerShell sẽ ghi đè mặc định đó.

## Lưu ý về dữ liệu và chạy lại

Các suite có fixture với ID cố định. `itinerary.apply.test.ts` tạo user/trip fixture trong `beforeAll`; `concurrency.test.ts` cũng tạo các user fixture. Do đó:

- Lần đầu hãy dùng database test mới, đã migrate.
- Nếu lần chạy trước dừng giữa chừng hoặc lần chạy tiếp theo báo trùng khóa/fixture, hãy làm sạch hoặc tạo lại **chỉ database test riêng** rồi chạy migration và test lại.
- Không chạy lệnh reset khi chưa kiểm tra `DATABASE_URL`. Script `db:reset` xóa dữ liệu database đích và chạy seed.
- Không chỉnh fixture hoặc expected result để che lỗi của application.

## Khi test vẫn chưa chạy được

- **Connection refused / timeout:** kiểm tra Docker Desktop, `docker ps`, `pg_isready`, cổng ánh xạ và `DATABASE_URL`.
- **Lỗi thiếu bảng/schema:** xác nhận migration đã chạy thành công trên đúng database test.
- **Trùng khóa fixture:** database test còn dữ liệu từ lần chạy trước; làm sạch/tạo lại database test riêng rồi migrate lại.
- **Lỗi quyền tạo/xóa trigger:** dùng test database cục bộ với user quản trị do container tạo (`test` trong ví dụ), không dùng user DB chia sẻ hạn quyền.
- **Assertion thất bại sau khi kết nối được:** ghi nhận là FAIL kèm output thực tế; không coi là BLOCKED do môi trường và không sửa production để làm test xanh.

## Dừng PostgreSQL test

Khi hoàn tất, có thể dừng container và giữ lại dữ liệu test:

```powershell
docker stop smart-travel-test-db
```

Đây là database test cục bộ, tách biệt với deployed E2E environment. Giữ container giúp lần sau chạy lại nhanh hơn; chỉ xóa container/database khi đã xác nhận không cần dữ liệu test đó nữa.
