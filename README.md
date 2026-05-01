# Building Manager

Hệ thống quản lý tòa nhà cho thuê — quản lý công ty thuê, hợp đồng, hóa đơn và theo dõi doanh thu.

---

## Yêu cầu cài đặt (local)

| Công cụ | Phiên bản | Link |
|---|---|---|
| .NET SDK | 6.0 | https://dotnet.microsoft.com/download/dotnet/6.0 |
| Node.js | 18+ | https://nodejs.org |
| SQL Server | 2019+ | Đã cài sẵn trên máy |

---

## Chạy local

### 1. Backend (.NET 6)

```bash
cd BuildingManager
dotnet run
```

> Lần đầu chạy sẽ tự động tạo database, tables, và seed data.

- **API:** http://localhost:5000
- **Swagger:** http://localhost:5000/swagger

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- **Website:** http://localhost:5173

---

## Cấu hình kết nối database

File: `BuildingManager/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=BuildingManagerDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

Nếu SQL Server dùng instance khác (VD: `SQLEXPRESS`):

```
Server=localhost\SQLEXPRESS;Database=BuildingManagerDB;Trusted_Connection=True;TrustServerCertificate=True
```

---

## Deploy lên Railway (Backend + SQL Server) + Vercel (Frontend)

### Bước 1 — Push lên GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/hieuportgas1996/building-manager.git
git push -u origin main
```

> **Lưu ý:** tạo file `.gitignore` trước nếu chưa có (xem mục dưới).

### Bước 2 — Deploy SQL Server trên Railway

1. Vào https://railway.app → **New Project → Deploy a template → Search "MSSQL"**
   - Hoặc: **New Project → Empty project** → **Add Service → Database → Microsoft SQL Server**
2. Sau khi deploy xong, vào service SQL Server → tab **Variables** → copy giá trị:
   - `MSSQL_SA_PASSWORD`
   - `SQLHOST` (hoặc xem trong **Connect** tab để lấy hostname)
   - Port thường là `1433`

### Bước 3 — Deploy Backend API trên Railway

1. Trong cùng project → **Add Service → GitHub Repo** → chọn repo của bạn
2. Railway sẽ tự detect `Dockerfile` và build
3. Vào tab **Variables** của service API, thêm các biến sau:

| Variable | Giá trị |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | `Server=<SQLHOST>;Database=BuildingManagerDB;User Id=sa;Password=<MSSQL_SA_PASSWORD>;TrustServerCertificate=True;MultipleActiveResultSets=true` |
| `AllowedOrigins` | `https://<your-app>.vercel.app` (điền sau khi có Vercel URL) |

4. Vào tab **Settings** → **Networking** → **Generate Domain** để lấy URL dạng `https://xxx.railway.app`

> App sẽ tự động chạy migrations và seed data lần đầu khởi động.

### Bước 4 — Deploy Frontend trên Vercel

1. Vào https://vercel.com → **New Project → Import Git Repository** → chọn repo
2. **Framework Preset:** Vite
3. **Root Directory:** `frontend`
4. **Environment Variables:** thêm:

| Variable | Giá trị |
|---|---|
| `VITE_API_URL` | `https://xxx.railway.app` (URL từ bước 3) |

5. Deploy → Vercel sẽ cho URL dạng `https://building-manager-xxx.vercel.app`

### Bước 5 — Cập nhật CORS trên Railway

Quay lại Railway → service API → tab **Variables** → cập nhật `AllowedOrigins` thành URL Vercel vừa lấy được.

Redeploy API (hoặc Railway tự restart khi đổi env var).

---

## File .gitignore gợi ý

Tạo file `.gitignore` ở root:

```
# .NET
**/bin/
**/obj/
**/*.user
BuildingManager/appsettings.Development.json

# Node
frontend/node_modules/
frontend/dist/

# Misc
.vs/
*.suo
.DS_Store
```

---

## Cấu trúc project

```
BuildingManager/
├── BuildingManager/              ← API (.NET 6 Web API)
│   ├── Controllers/
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   └── Program.cs
├── BuildingManager.Domain/       ← Entities, Enums
├── BuildingManager.Application/  ← Business logic, DTOs, Services
├── BuildingManager.Infrastructure/
│   └── Data/
│       ├── AppDbContext.cs
│       ├── SeedData.cs
│       └── Migrations/
├── frontend/                     ← React + Vite + Ant Design
│   ├── .env.example              ← Template biến môi trường
│   └── src/
│       ├── pages/
│       ├── services/
│       └── types/
├── Dockerfile                    ← Multi-stage build cho Railway
├── docker-compose.yml            ← Local Docker test
└── README.md
```

---

## Các chức năng

| Trang | Mô tả |
|---|---|
| Dashboard | Thống kê doanh thu, tỷ lệ lấp đầy, biểu đồ theo tháng |
| Công ty | Quản lý danh sách công ty thuê (CRUD) |
| Văn phòng | Quản lý các phòng cho thuê, giá, trạng thái |
| Hợp đồng | Tạo và quản lý hợp đồng thuê |
| Hóa đơn | Tạo hóa đơn hàng tháng, xác nhận thanh toán |
