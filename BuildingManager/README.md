# Building Manager

## Hướng dẫn chạy dự án

### Backend (.NET 6)

1. **Cài đặt SQL Server LocalDB** (nếu chưa có)

2. **Restore packages và chạy migration**:
```bash
cd BuildingManager
dotnet restore
dotnet ef migrations add InitialCreate --project ../BuildingManager.Infrastructure -- --connectionstring "Server=(localdb)\mssqllocaldb;Database=BuildingManagerDB;Trusted_Connection=True;"
dotnet ef database update
dotnet run
```

API chạy tại: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## Cấu trúc project

```
BuildingManager/
├── BuildingManager/          ← API project (Web API)
├── BuildingManager.Domain/   ← Entities, Enums
├── BuildingManager.Application/ ← DTOs, Interfaces, Services
├── BuildingManager.Infrastructure/ ← DbContext, SeedData, Migrations
└── frontend/                 ← React + Vite + Ant Design
```
