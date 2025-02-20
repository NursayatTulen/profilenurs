const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // JSON сұраныстарын оқу
app.use(express.urlencoded({ extended: true })); // Форма деректерін оқу

const UPLOADS_DIR = path.join(__dirname, "uploads");

// 📌 Егер "uploads" бумасы жоқ болса, оны жасаймыз
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
    console.log("📂 'uploads' бумасы жасалды.");
}

// 📌 Файлдарды сақтау параметрлері
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`📂 Файл сақталатын орын: ${UPLOADS_DIR}`);
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        console.log(`📁 Файл аты: ${file.originalname}`);
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// 📌 Жүктелген файлдарды ашық түрде көрсету
app.use("/uploads", express.static(UPLOADS_DIR));

// 📌 **Файл жүктеу API**
app.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            console.error("❌ Файл жүктелмеді!");
            return res.status(400).json({ error: "Файл жүктелмеді" });
        }

        console.log(`✅ Файл сәтті жүктелді: ${req.file.originalname}`);
        res.json({ fileName: req.file.originalname, filePath: `/uploads/${req.file.originalname}` });
    } catch (err) {
        console.error("🚨 Файл жүктеу қатесі:", err);
        res.status(500).json({ error: "Файл жүктеу кезінде қате пайда болды" });
    }
});

// 📌 **Файлдар тізімін алу API**
app.get("/files", (req, res) => {
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        console.log(`📂 Қолжетімді файлдар:`, files);
        res.json(files.map(file => ({ name: file, url: `/uploads/${file}` })));
    } catch (err) {
        console.error("🚨 Файл тізімін оқу қатесі:", err);
        res.status(500).json({ error: "Файл тізімін алу кезінде қате пайда болды" });
    }
});

// 📌 **Файлды жою API (код арқылы тексеру)**
app.delete("/delete/:fileName", express.json(), (req, res) => {
    try {
        const { fileName } = req.params;
        const { code } = req.body; // Пайдаланушы енгізген код

        if (code !== "nurs") {
            console.warn(`❌ Қате код! Файл "${fileName}" өшірілмеді.`);
            return res.status(403).json({ error: "Қате код! Файл өшірілмеді." });
        }

        const filePath = path.join(UPLOADS_DIR, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Файл табылмады: ${fileName}`);
            return res.status(404).json({ error: "Файл табылмады" });
        }

        fs.unlinkSync(filePath);
        console.log(`❌ Файл өшірілді: ${fileName}`);
        res.json({ message: "Файл сәтті өшірілді" });
    } catch (err) {
        console.error("🚨 Файл өшіру қатесі:", err);
        res.status(500).json({ error: "Файл өшіру кезінде қате пайда болды" });
    }
});

// 📌 **Серверді іске қосу**
app.listen(PORT, () => {
    console.log(`🚀 Сервер іске қосылды: http://localhost:${PORT}`);
});
