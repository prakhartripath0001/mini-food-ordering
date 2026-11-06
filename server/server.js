require("dotenv").config();

const express = require("express");
const path = require("node:path");
const db = require("./config/db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const menuRoutes = require("./routes/menuRoutes");
app.use("/menu", menuRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/orders", orderRoutes);

app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.status(200).json({ success: true, status: "ok" });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(503).json({ success: false, status: "unavailable" });
    }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.query("SELECT 1");
        console.log("MySQL connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

startServer();