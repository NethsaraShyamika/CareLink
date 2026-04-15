import express from "express";
import multer from "multer";
import { generateToken, createRoom, getRoom, endRoom, getAllRooms } from "../controllers/roomController.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

router.post("/room", createRoom);
router.get("/rooms", getAllRooms);
router.get("/room/:appointmentId", getRoom);
router.post("/token", generateToken);
router.post("/room/end", endRoom);

router.post("/upload", upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl, filename: req.file.originalname });
});

export default router;