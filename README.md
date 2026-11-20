# SilpaTram — รถรางมหาวิทยาลัยศิลปากร สนามจันทร์

เว็บแอปแสดงป้ายและเส้นทางรถรางภายในมหาวิทยาลัย แยกเป็น Frontend (React/Vite), Backend API (Express) และ Database (Neon PostgreSQL)

## ตั้งค่า Neon

1. คัดลอก `.env.example` เป็น `.env`
2. ใน Neon Console เลือก **Connect** แล้วคัดลอก connection string ของ Node.js ที่มี `sslmode=require` ใส่ใน `DATABASE_URL` ของ `.env`
3. หากต้องการเปิดกู้รหัสผ่านทาง SMS ให้สร้าง Verify Service ใน Twilio Console แล้วตั้ง `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` และ `TWILIO_VERIFY_SERVICE_SID` (สมัครและเข้าสู่ระบบไม่ต้องใช้ Twilio)
4. สร้าง `AUTH_SECRET` แบบสุ่มอย่างน้อย 32 bytes (เช่น `openssl rand -base64 48`)
5. เก็บ `.env` ไว้ในเครื่องหรือ secret manager เท่านั้น ห้าม commit หรือส่ง secret ในแชต

ตัวอย่าง:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require
API_HOST=127.0.0.1
API_PORT=3001
AUTH_SECRET=<random-secret>
# ตั้งค่าเฉพาะเมื่อเปิดกู้รหัสผ่านทาง SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_VERIFY_SERVICE_SID=VA...
```

## ติดตั้งและเริ่มต้น

```bash
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` สร้างตาราง `bus_stops`, `routes`, `route_stops`, `users` และ `user_locations` พร้อม seed ข้อมูลเริ่มต้นจาก `Frontend/data.js` สามารถรันซ้ำเพื่ออัปเดตข้อมูล seed และ schema ได้

Schema ยังสร้างตาราง `auth_sms_rate_limits` และ `auth_login_rate_limits` สำหรับจำกัดการขอ OTP/ลองเข้าสู่ระบบ รหัสผ่านเก็บเป็น bcrypt hash; OTP ตรวจผ่าน Twilio Verify และไม่เก็บรหัส OTP ในฐานข้อมูล

`npm run dev` เริ่ม Frontend ที่ Vite และ Backend ที่พอร์ต `3001` พร้อมกัน โดย Vite proxy `/api` ไปยัง Backend

## Deploy บน Vercel

โปรเจกต์มี Vercel Functions ใน `api/` สำหรับแผนที่และสมาชิก ส่วนการเชื่อม Neon ใช้ `DATABASE_URL` ฝั่ง server เท่านั้น

1. Import repository นี้ใน Vercel โดยใช้ repository root เป็น Root Directory
2. ใน **Project Settings → Environment Variables** เพิ่ม `DATABASE_URL` และ `AUTH_SECRET` (จำเป็นสำหรับสมัคร/เข้าสู่ระบบ) ส่วน `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` และ `TWILIO_VERIFY_SERVICE_SID` เป็นตัวเลือกและจำเป็นเฉพาะเมื่อเปิดกู้รหัสผ่านทาง SMS เลือก environment ที่ต้องการใช้ (เช่น Production) ใช้ `AUTH_SECRET` ชุดเดียวกันทุก deployment ที่ต้องการให้ cookie/session ทำงานต่อเนื่อง
3. กด Redeploy เพื่อให้ Functions เริ่มทำงานด้วย environment variable ใหม่
4. ทดสอบ `<deployment-url>/api/health` ต้องได้ `{"status":"ok","database":"connected"}` แล้วเปิดหน้าเว็บเพื่อตรวจข้อมูล

อย่าใส่ `DATABASE_URL` ในตัวแปร `VITE_*` เพราะตัวแปรเหล่านั้นถูกส่งไปยัง browser และห้าม commit connection string ลง Git

## โครงสร้าง

- `Frontend/` — React UI, API client, hooks และ components
- `Backend/` — Express app, routes, controllers, repositories และ PostgreSQL connection
- `api/` — Vercel Functions สำหรับ API production
- `Database/schema.sql` — schema ตารางสำหรับ Neon PostgreSQL

API สำหรับข้อมูลแผนที่:

- `GET /api/stops`
- `GET /api/routes`
- `GET /api/health`

เฉพาะสมาชิกที่เข้าสู่ระบบเท่านั้นที่ระบบจะขออนุญาตตำแหน่งจากเบราว์เซอร์และเริ่มติดตามอัตโนมัติ; ผู้เข้าชมที่ไม่ได้เข้าสู่ระบบจะไม่ถูกติดตาม และการปฏิเสธสิทธิ์จะปิดการติดตาม แผนที่แสดงสถานะและพิกัดล่าสุด ส่วนการหยุดติดตาม/เริ่มใหม่และลบข้อมูลอยู่ในเมนูบัญชี ระบบบันทึกพิกัด GPS ใหม่ลง `user_locations` สูงสุดทุก 30 วินาทีและเขียนทับจุดเดิม ไม่ส่งพิกัดเดิมซ้ำเมื่อไม่มีข้อมูล GPS ใหม่ และไม่เก็บประวัติเส้นทาง API คือ `GET`, `PUT` และ `DELETE /api/me/location` ข้อมูลจุดล่าสุดยังคงอยู่จนกว่าจะถูกเขียนทับหรือลบ ดังนั้นการคำนวณความหนาแน่นในอนาคตควรนับเฉพาะพิกัดที่อัปเดตใหม่ (เช่น ภายใน 2 นาที) และส่งออกเฉพาะผลรวม ไม่เปิดเผยพิกัดของสมาชิกคนอื่น

หลังอัปเดต schema ให้รัน `npm run db:setup` อีกครั้งเพื่อสร้าง `user_locations` ก่อนเริ่มใช้งาน; เบราว์เซอร์ต้องรองรับ Geolocation และอยู่บน HTTPS (ยกเว้น `localhost`)

ระบบสมาชิกใช้ Username/Password สมัครและเข้าสู่ระบบได้โดยไม่ต้องใช้ OTP เบอร์โทรที่สมัครจะยังไม่ถือว่ายืนยันแล้ว ส่วนการกู้รหัสผ่านยังต้องยืนยัน SMS OTP และตั้งค่าผู้ให้บริการ SMS ก่อน; session เก็บใน HttpOnly cookie:

- `POST /api/auth/register`
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/auth/password-reset/start`, `POST /api/auth/password-reset/verify`

พิกัดป้ายเก็บเป็น latitude/longitude และ SRID 4326 โดยไม่ต้องเปิด PostGIS ส่วน geometry ของเส้นทางเก็บเป็น GeoJSON `LineString` และจุดจอดเรียงลำดับผ่าน `route_stops`

แผนที่ซ่อนเส้นทางรถราง แต่ยังเก็บ geometry ของเส้นทางไว้และใช้จำลองรถ Demo 5 คันให้วิ่งวนต่อเนื่อง ตำแหน่งรถเหล่านี้เป็นข้อมูลจำลองฝั่ง Frontend ไม่ใช่ GPS รถจริง; แผนที่ใช้ไทล์ OpenStreetMap และต้องเชื่อมต่ออินเทอร์เน็ต
