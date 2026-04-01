# Aqon - PR System (Purchase Requisition)

ระบบจัดการใบขอซื้อ (PR) สำหรับองค์กร รองรับการสร้าง ส่งอนุมัติ และ workflow การอนุมัติแบบหลายระดับ

## Tech Stack

- **Next.js 16** + TypeScript + Tailwind CSS 4
- **Prisma ORM** + SQLite
- **JWT Authentication** (jose + bcryptjs)
- **Vitest** สำหรับ unit testing

## โครงสร้างโปรเจค

```
quick/
├── index.html          # Landing page (Aqon Dashboard)
├── styles.css          # Landing page styles
├── PRD.md              # Product Requirements Document
├── TASKS.md            # Task tracking
└── pr-system/          # Next.js application
    ├── src/
    │   ├── app/        # Pages + API routes
    │   ├── components/ # React components
    │   ├── lib/        # Business logic (auth, rbac, approval)
    │   ├── types/      # TypeScript interfaces
    │   ├── utils/      # Utilities (PR number generation)
    │   └── __tests__/  # Unit tests
    └── prisma/         # Database schema + migrations
```

## เริ่มต้นใช้งาน

```bash
cd pr-system
npm install
```

### ตั้งค่า Environment

สร้างไฟล์ `pr-system/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

### ตั้งค่า Database

```bash
npm run db:migrate    # รัน migration
npm run db:generate   # สร้าง Prisma client
```

### รัน Development Server

```bash
npm run dev
```

เปิด http://localhost:3000

## Scripts

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน dev server |
| `npm run build` | Build สำหรับ production |
| `npm run start` | รัน production server |
| `npm run test` | รัน unit tests |
| `npm run test:watch` | รัน tests แบบ watch mode |
| `npm run lint` | ตรวจสอบ code quality |
| `npm run lint:fix` | แก้ไข lint errors อัตโนมัติ |
| `npm run format` | Format code ด้วย Prettier |
| `npm run db:studio` | เปิด Prisma Studio |
| `npm run db:push` | Sync schema กับ database |

## ฟีเจอร์หลัก

### 1. สร้างและส่งใบขอซื้อ
- สร้าง PR พร้อมรายการสินค้าหลายรายการ
- คำนวณราคารวมอัตโนมัติ (จำนวน x ราคาต่อหน่วย)
- กำหนดวันที่ต้องการสินค้า
- บันทึกเป็น Draft หรือส่งอนุมัติได้
- เลข PR อัตโนมัติ รูปแบบ `PR-YYYYMMDD-###`

### 2. Workflow การอนุมัติ (1-2 ระดับ)
- ต่ำกว่า 3,000 บาท: อนุมัติอัตโนมัติ
- 3,000 - 20,000 บาท: Manager อนุมัติ (1 ระดับ)
- มากกว่า 20,000 บาท: Manager + Finance อนุมัติ (2 ระดับ)

### 3. ระบบผู้ใช้และสิทธิ์
- สมัครสมาชิก / เข้าสู่ระบบ
- 4 บทบาท: Employee, Manager, Finance, Admin
- Role-Based Access Control (RBAC)

## API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Purchase Requisition
- `GET /api/pr` - รายการ PR ของฉัน
- `POST /api/pr` - สร้าง PR ใหม่
- `GET /api/pr/:id` - รายละเอียด PR
- `PUT /api/pr/:id` - แก้ไข PR (Draft)
- `POST /api/pr/:id/submit` - ส่ง PR เข้าอนุมัติ
- `POST /api/pr/:id/attachments` - แนบไฟล์

### Approvals
- `GET /api/approvals` - รายการรออนุมัติ
- `POST /api/approvals/:prId/decide` - อนุมัติ/ปฏิเสธ

## Database Schema

| ตาราง | คำอธิบาย |
|-------|----------|
| `users` | ข้อมูลผู้ใช้และบทบาท |
| `pr_requests` | ข้อมูลหลักใบขอซื้อ |
| `pr_items` | รายการสินค้าในใบขอซื้อ |
| `pr_approvals` | ประวัติการอนุมัติ |
| `approval_rules` | กฎเกณฑ์การอนุมัติตามวงเงิน |
| `attachments` | ไฟล์แนบ |

## สถานะการพัฒนา

- [x] Project Setup
- [x] Database Design
- [x] User Authentication & Roles
- [x] Create & Submit PR
- [x] Basic Approval Workflow
- [ ] Auto-Approval (Threshold Configuration)
- [ ] Admin Configuration UI
- [ ] Testing & QA
