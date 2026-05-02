# 🔔 Rung Chuông Vàng – Server

Server chia sẻ bộ câu hỏi cho game Rung Chuông Vàng.

---

## 📁 Cấu trúc
```
rcv-server/
├── server.js      ← API server (Node.js + Express)
├── index.html     ← File game (copy lên GitHub Pages)
├── dep.mp3        ← Nhạc nền (bạn tự thêm)
├── data.json      ← Tự tạo khi chạy lần đầu
└── package.json
```

---

## 🚀 Deploy server lên Render (miễn phí)

1. Push folder này lên **GitHub** (repo mới)
2. Vào [render.com](https://render.com) → **New → Web Service**
3. Kết nối repo GitHub vừa tạo
4. Cài đặt:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
5. Nhấn **Deploy** → đợi ~2 phút
6. Render sẽ cho bạn URL dạng: `https://rcv-server-xxxx.onrender.com`

---

## ⚙️ Sau khi deploy

Mở file `index.html`, tìm dòng này và sửa URL:

```js
const API = 'https://your-server.onrender.com'; // ← ĐỔI THÀNH URL CỦA BẠN
```

---

## 🌐 Deploy frontend lên GitHub Pages

1. Push `index.html` và `dep.mp3` vào repo GitHub
2. Vào **Settings → Pages → Branch: main → Save**
3. GitHub Pages sẽ serve tại `https://username.github.io/repo-name`

---

## 🔑 Xóa bộ câu hỏi (Admin)

Thêm biến môi trường `ADMIN_SECRET` trên Render.  
Gọi API:
```
DELETE /api/sets/:id
Body: { "secret": "your_secret" }
```

---

## 📡 API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/sets` | Lấy danh sách (metadata) |
| GET | `/api/sets/:id` | Lấy chi tiết 1 bộ |
| POST | `/api/sets` | Đăng bộ câu hỏi mới |
| POST | `/api/sets/:id/like` | Thả tim |
| DELETE | `/api/sets/:id` | Xóa (cần ADMIN_SECRET) |
