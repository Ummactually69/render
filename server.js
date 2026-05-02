const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3000;
const DB   = path.join(__dirname, 'data.json');

/* ── Khởi tạo file lưu trữ nếu chưa có ── */
if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify([]));

/* ── Middleware ── */
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));     // Serve index.html + dep.mp3 luôn từ đây

/* ── Helpers ── */
function readDB()      { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB, JSON.stringify(data, null, 2)); }

/* ════════════════════════════════
   API ROUTES
   ════════════════════════════════ */

/**
 * GET /api/sets
 * Trả về danh sách tất cả bộ câu hỏi (không kèm nội dung câu hỏi, chỉ metadata)
 * để trang cộng đồng load nhanh
 */
app.get('/api/sets', (req, res) => {
    const sets = readDB();
    const meta = sets.map(({ id, name, author, createdAt, questionCount, likes }) => ({
        id, name, author, createdAt, questionCount, likes
    }));
    // Sắp xếp mới nhất lên trước
    meta.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(meta);
});

/**
 * GET /api/sets/:id
 * Trả về toàn bộ nội dung 1 bộ câu hỏi (kèm questions[])
 */
app.get('/api/sets/:id', (req, res) => {
    const sets = readDB();
    const set  = sets.find(s => s.id === req.params.id);
    if (!set) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi.' });
    res.json(set);
});

/**
 * POST /api/sets
 * Đăng bộ câu hỏi mới lên cộng đồng
 * Body: { name, author, questions[] }
 */
app.post('/api/sets', (req, res) => {
    const { name, author, questions } = req.body;

    // Validate cơ bản
    if (!name || typeof name !== 'string' || name.trim().length < 2)
        return res.status(400).json({ error: 'Tên bộ câu hỏi cần ít nhất 2 ký tự.' });
    if (!Array.isArray(questions) || questions.length === 0)
        return res.status(400).json({ error: 'Bộ câu hỏi không được rỗng.' });
    if (questions.length > 50)
        return res.status(400).json({ error: 'Tối đa 50 câu hỏi mỗi bộ.' });

    // Validate từng câu
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.q || typeof q.q !== 'string')
            return res.status(400).json({ error: `Câu ${i+1} thiếu nội dung.` });
        if (!Array.isArray(q.options) || q.options.length < 2)
            return res.status(400).json({ error: `Câu ${i+1} cần ít nhất 2 đáp án.` });
    }

    const newSet = {
        id:            uuidv4(),
        name:          name.trim().slice(0, 80),
        author:        (author || 'Ẩn danh').trim().slice(0, 40),
        createdAt:     new Date().toISOString(),
        questionCount: questions.length,
        likes:         0,
        questions
    };

    const sets = readDB();
    sets.push(newSet);
    writeDB(sets);

    res.status(201).json({ id: newSet.id, message: 'Đã đăng thành công!' });
});

/**
 * POST /api/sets/:id/like
 * Thả tim cho bộ câu hỏi
 */
app.post('/api/sets/:id/like', (req, res) => {
    const sets = readDB();
    const set  = sets.find(s => s.id === req.params.id);
    if (!set) return res.status(404).json({ error: 'Không tìm thấy.' });
    set.likes = (set.likes || 0) + 1;
    writeDB(sets);
    res.json({ likes: set.likes });
});

/**
 * DELETE /api/sets/:id
 * Xóa bộ câu hỏi (dùng secret key để bảo vệ đơn giản)
 */
app.delete('/api/sets/:id', (req, res) => {
    const { secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET)
        return res.status(403).json({ error: 'Không có quyền xóa.' });

    let sets = readDB();
    const before = sets.length;
    sets = sets.filter(s => s.id !== req.params.id);
    if (sets.length === before)
        return res.status(404).json({ error: 'Không tìm thấy.' });
    writeDB(sets);
    res.json({ message: 'Đã xóa.' });
});

/* ── Start ── */
app.listen(PORT, () => {
    console.log(`✅ RCV Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📁 Dữ liệu lưu tại: ${DB}`);
});
