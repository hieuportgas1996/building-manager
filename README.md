# Building Manager

Hệ thống quản lý tòa nhà cho thuê — quản lý công ty thuê, hợp đồng, hóa đơn, theo dõi doanh thu, **import hóa đơn từ PDF** và **tự động ghi nhận thanh toán qua webhook SePay**.

---

## Stack công nghệ

- **Backend:** .NET 6 Web API, Entity Framework Core, PostgreSQL (Npgsql)
- **Frontend:** React 18 + Vite 5 + TypeScript + Ant Design + Recharts
- **Deploy:** Railway (API + PostgreSQL) + Vercel (Frontend)
- **Tích hợp:** SePay webhook (auto-match thanh toán), PdfPig (đọc hóa đơn đỏ)

---

## Yêu cầu cài đặt (local)

| Công cụ | Phiên bản | Link |
|---|---|---|
| .NET SDK | 6.0 | https://dotnet.microsoft.com/download/dotnet/6.0 |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |

> Hoặc trỏ thẳng connection string lên PostgreSQL trên Railway, không cần cài local.

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
  "DefaultConnection": "Host=localhost;Database=BuildingManagerDB;Username=postgres;Password=postgres"
}
```

Trỏ Railway PostgreSQL:

```
Host=postgres.railway.internal;Database=railway;Username=postgres;Password=<your_password>;Port=5432
```

---

## Deploy production

### Bước 1 — Push lên GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/hieuportgas1996/building-manager.git
git push -u origin main
```

### Bước 2 — Deploy PostgreSQL trên Railway

1. Vào https://railway.app → **New Project → Empty Project**
2. **Add Service → Database → PostgreSQL**
3. Vào service PostgreSQL → tab **Variables** → copy `DATABASE_URL` (dạng `postgresql://user:pass@host:5432/db`)

### Bước 3 — Deploy Backend API trên Railway

1. Trong cùng project → **Add Service → GitHub Repo** → chọn repo
2. Railway tự detect `Dockerfile` và build
3. Vào tab **Variables** của service API, thêm:

| Variable | Giá trị |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | `Host=<host>;Database=<db>;Username=postgres;Password=<pass>;Port=5432` (chuyển từ `DATABASE_URL`) |
| `AllowedOrigins` | `*` (cập nhật sau khi có Vercel URL) |
| `Sepay__ApiKey` | (tạo sau khi đăng ký SePay — xem mục **Tích hợp SePay** dưới) |

4. Vào tab **Settings → Networking → Generate Domain** để lấy URL `https://xxx.railway.app`

> App sẽ tự chạy migrations và seed data lần đầu khởi động.

### Bước 4 — Deploy Frontend trên Vercel

1. Vào https://vercel.com → **Add New Project → Import Git Repository** → chọn repo
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (tự detect)
4. **Environment Variables:**

| Variable | Giá trị |
|---|---|
| `VITE_API_URL` | `https://xxx.railway.app` (URL từ bước 3) |

5. **Deploy** → URL dạng `https://building-manager-xxx.vercel.app`

### Bước 5 — Cập nhật CORS

Quay lại Railway → service API → **Variables** → đổi `AllowedOrigins` thành URL Vercel.

---

## Tích hợp SePay (auto-match thanh toán)

Khi công ty chuyển khoản vào tài khoản ACB / Vietcombank → SePay gửi webhook → backend tự động tìm hóa đơn cùng số tiền + tên/MST công ty và đánh dấu **Đã thanh toán**.

### Bước 1 — Đăng ký SePay

1. Vào https://my.sepay.vn → đăng ký tài khoản
2. **Liên kết tài khoản** → thêm tài khoản ACB và Vietcombank
   - SePay yêu cầu login Internet Banking để cấp quyền đọc giao dịch (chỉ đọc, không gửi tiền)
3. Vào **Cài đặt → API → Tạo API Token** → copy token

### Bước 2 — Thêm token vào Railway

Vào service API trên Railway → **Variables** → thêm:

| Variable | Value |
|---|---|
| `Sepay__ApiKey` | (token vừa copy) |

### Bước 3 — Cấu hình webhook trên SePay

1. Vào SePay → **Cài đặt → Webhook** → tạo webhook mới
2. **URL:** `https://<your-railway-url>.railway.app/api/banktransactions/webhook/sepay`
3. **Authorization:** chọn **Apikey** → paste token đã tạo
4. **Lưu**

### Bước 4 — Test

- Chuyển khoản 10k vào tài khoản ACB/VCB
- Sau vài giây, mở trang **Giao dịch NH** trên web — giao dịch sẽ tự xuất hiện
- Nếu nội dung khớp với hóa đơn pending → tự động tick **Đã thanh toán**

### Logic auto-match (theo độ ưu tiên)

1. **Theo mã hóa đơn:** nội dung có `HD<số>` (vd: `HD123`) → match invoice id 123 nếu cùng số tiền
   → Khuyến khích bảo công ty ghi mã hóa đơn vào nội dung chuyển khoản
2. **Theo MST + số tiền:** nội dung có mã số thuế công ty (10-13 chữ số)
3. **Theo tên công ty + số tiền:** loại bỏ "CTY", "TNHH"... rồi so khớp keyword

Nếu không match → giao dịch hiện trong tab với tag **Chưa gắn**, người dùng bấm **Gắn** chọn invoice thủ công.

---

## Tính năng Import PDF hóa đơn đỏ

1. Vào trang **Import PDF**
2. Kéo thả nhiều file PDF hóa đơn (định dạng VAT chuẩn VN)
3. Bấm **Đọc PDF** — hệ thống tự extract: tên công ty, mã số thuế, địa chỉ, tháng, tiền thuê
4. Xem trước, **Sửa** nếu parse sai
5. Bấm **Import X hóa đơn vào hệ thống** → tự tạo Company (nếu chưa có) + Invoice
6. Vào tab **Hóa đơn** xem các hóa đơn vừa import (status: Chờ thanh toán)

---

## Cấu trúc project

```
BuildingManager/
├── BuildingManager/                  ← API (.NET 6 Web API)
│   ├── Controllers/
│   │   ├── BuildingsController.cs
│   │   ├── CompaniesController.cs
│   │   ├── ContractsController.cs
│   │   ├── DashboardController.cs
│   │   ├── InvoicesController.cs
│   │   ├── OfficesController.cs
│   │   ├── PdfImportController.cs    ← Parse PDF hóa đơn đỏ
│   │   └── BankTransactionsController.cs ← Webhook SePay
│   ├── Migrations/
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   └── Program.cs
├── BuildingManager.Domain/           ← Entities, Enums
├── BuildingManager.Application/      ← Business logic, DTOs, Services
│   └── Services/
│       ├── BankTransactionService.cs ← Logic auto-match thanh toán
│       └── PdfParserService.cs       ← Logic đọc PDF
├── BuildingManager.Infrastructure/
│   └── Data/
│       ├── AppDbContext.cs
│       └── SeedData.cs
├── frontend/                         ← React + Vite + Ant Design
│   ├── .env.example
│   └── src/
│       ├── pages/
│       │   ├── Dashboard/
│       │   ├── Companies/
│       │   ├── Buildings/
│       │   ├── Offices/
│       │   ├── Contracts/
│       │   ├── Invoices/
│       │   ├── BankTransactions/     ← Lịch sử giao dịch ngân hàng
│       │   └── PdfImport/            ← Import PDF
│       ├── services/
│       └── types/
├── Dockerfile                        ← Multi-stage build cho Railway
├── docker-compose.yml                ← Local Docker test
└── README.md
```

---

## Các chức năng

| Trang | Mô tả |
|---|---|
| Dashboard | Thống kê doanh thu, tỷ lệ lấp đầy, biểu đồ theo tháng |
| Công ty | Quản lý công ty thuê (CRUD) |
| Tòa nhà | CRUD tòa nhà + thêm/xóa tầng |
| Văn phòng | CRUD văn phòng (chọn tòa nhà → tầng) |
| Hợp đồng | Tạo và quản lý hợp đồng thuê |
| Hóa đơn | Tạo hóa đơn hàng tháng, xác nhận thanh toán |
| Giao dịch NH | Lịch sử giao dịch nhận từ SePay, auto-match hóa đơn |
| Import PDF | Upload PDF hóa đơn đỏ → tự tạo Company + Invoice |

---

## API endpoints chính

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/dashboard` | Thống kê doanh thu, biểu đồ |
| `GET/POST/PUT/DELETE` | `/api/companies` | CRUD công ty |
| `GET/POST/PUT/DELETE` | `/api/buildings` | CRUD tòa nhà |
| `GET/POST` | `/api/buildings/{id}/floors` | Quản lý tầng |
| `GET/POST/PUT/DELETE` | `/api/offices` | CRUD văn phòng |
| `GET/POST/DELETE` | `/api/contracts` | Quản lý hợp đồng |
| `GET/POST/DELETE` | `/api/invoices` | Quản lý hóa đơn |
| `PATCH` | `/api/invoices/{id}/pay` | Đánh dấu đã thanh toán |
| `POST` | `/api/pdfimport/parse-multiple` | Parse PDF (preview) |
| `POST` | `/api/pdfimport/import-multiple` | Import PDF → tạo Company + Invoice |
| `GET` | `/api/banktransactions` | Lịch sử giao dịch ngân hàng |
| `POST` | `/api/banktransactions/webhook/sepay` | Webhook SePay (auth: `Apikey <token>`) |
| `POST` | `/api/banktransactions/{txId}/match/{invoiceId}` | Match thủ công |
