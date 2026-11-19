# SilpaTram — รถรางมหาวิทยาลัยศิลปากร สนามจันทร์

เว็บแอปแสดงป้ายและเส้นทางรถรางภายในมหาวิทยาลัย แยกเป็น Frontend (React/Vite), Backend API (Express) และ Database (Neon PostgreSQL)

## ตั้งค่า Neon

1. คัดลอก `.env.example` เป็น `.env`
2. ใน Neon Console เลือก **Connect** แล้วคัดลอก connection string ของ Node.js ที่มี `sslmode=require` ใส่ใน `DATABASE_URL` ของ `.env`
3. เก็บ `.env` ไว้ในเครื่องหรือ secret manager เท่านั้น ห้าม commit หรือส่ง connection string ในแชต

ตัวอย่าง:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require
API_HOST=127.0.0.1
API_PORT=3001
```

## ติดตั้งและเริ่มต้น

```bash
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` สร้างตาราง `bus_stops`, `routes`, `route_stops` และ seed ข้อมูลเริ่มต้นจาก `Frontend/data.js` สามารถรันซ้ำเพื่ออัปเดตข้อมูล seed ได้

`npm run dev` เริ่ม Frontend ที่ Vite และ Backend ที่พอร์ต `3001` พร้อมกัน โดย Vite proxy `/api` ไปยัง Backend

## Deploy บน Vercel

โปรเจกต์มี Vercel Functions ใน `api/` สำหรับ `/api/stops`, `/api/routes` และ `/api/health` ส่วนการเชื่อม Neon ใช้ `DATABASE_URL` ฝั่ง server เท่านั้น

1. Import repository นี้ใน Vercel โดยใช้ repository root เป็น Root Directory
2. ใน **Project Settings → Environment Variables** เพิ่ม `DATABASE_URL` ด้วย connection string จาก Neon ที่มี `sslmode=require` เลือก environment ที่ต้องการใช้ (เช่น Production)
3. กด Redeploy เพื่อให้ Functions เริ่มทำงานด้วย environment variable ใหม่
4. ทดสอบ `<deployment-url>/api/health` ต้องได้ `{"status":"ok","database":"connected"}` แล้วเปิดหน้าเว็บเพื่อตรวจข้อมูล

อย่าใส่ `DATABASE_URL` ในตัวแปร `VITE_*` เพราะตัวแปรเหล่านั้นถูกส่งไปยัง browser และห้าม commit connection string ลง Git

## โครงสร้าง

- `Frontend/` — React UI, API client, hooks และ components
- `Backend/` — Express app, routes, controllers, repositories และ PostgreSQL connection
- `api/` — Vercel Functions สำหรับ API production
- `Database/schema.sql` — schema ตารางสำหรับ Neon PostgreSQL

API แบบอ่านอย่างเดียว:

- `GET /api/stops`
- `GET /api/routes`
- `GET /api/health`

พิกัดป้ายเก็บเป็น latitude/longitude และ SRID 4326 โดยไม่ต้องเปิด PostGIS ส่วน geometry ของเส้นทางเก็บเป็น GeoJSON `LineString` และจุดจอดเรียงลำดับผ่าน `route_stops`

แอปยังไม่แสดงตำแหน่งรถ GPS แบบเรียลไทม์หรือเวลาถึงรถ แผนที่ใช้ไทล์ OpenStreetMap และต้องเชื่อมต่ออินเทอร์เน็ต
