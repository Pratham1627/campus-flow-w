// backend/server.js
import express from "express";
import cors from "cors";
import { scrapeAttendance } from "./attendance.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow your frontend to call this
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "Backend alive" });
});

app.post("/api/attendance", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Missing credentials" });
  }

  try {
    const result = await scrapeAttendance(username, password);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
