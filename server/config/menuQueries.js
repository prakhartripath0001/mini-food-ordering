const db = require("../config/db");

const getAllMenuItems = async () => {
    const [rows] = await db.query(`
        SELECT *
        FROM menu_items
        WHERE is_available = TRUE
        ORDER BY category, name
    `);

    return rows;
};

const getMenuByCategory = async (category) => {
    const [rows] = await db.execute(
        `SELECT *
         FROM menu_items
         WHERE category = ?
         AND is_available = TRUE`,
        [category]
    );

    return rows;
};

module.exports = {
    getAllMenuItems,
    getMenuByCategory
};