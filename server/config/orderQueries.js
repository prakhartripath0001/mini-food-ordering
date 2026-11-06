const db = require("./db");

const getOrderById = async (id) => {
    const [orders] = await db.execute(
        `SELECT id, customer_name, phone, status, total, created_at, updated_at
         FROM orders
         WHERE id = ?`,
        [id]
    );

    if (orders.length === 0) {
        return null;
    }

    const [items] = await db.execute(
        `SELECT id, menu_item_id, item_name, unit_price, quantity
         FROM order_items
         WHERE order_id = ?
         ORDER BY id`,
        [id]
    );

    return { ...orders[0], items };
};

const createOrder = async ({ customerName, phone, items }) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const menuItemIds = [...new Set(items.map((item) => item.menu_item_id))];
        const placeholders = menuItemIds.map(() => "?").join(", ");
        const [menuItems] = await connection.execute(
            `SELECT id, name, price
             FROM menu_items
             WHERE is_available = TRUE AND id IN (${placeholders})`,
            menuItemIds
        );
        const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));

        if (menuItemsById.size !== menuItemIds.length) {
            await connection.rollback();
            return { unavailable: true };
        }

        const orderItems = items.map((item) => {
            const menuItem = menuItemsById.get(item.menu_item_id);
            return {
                menu_item_id: item.menu_item_id,
                item_name: menuItem.name,
                unit_price: menuItem.price,
                quantity: item.quantity
            };
        });

        const totalCents = orderItems.reduce((total, item) => {
            const [whole, fraction = ""] = String(item.unit_price).split(".");
            const priceCents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2));
            return total + priceCents * BigInt(item.quantity);
        }, 0n);

        if (totalCents > 9999999999n) {
            await connection.rollback();
            return { totalTooLarge: true };
        }

        const total = `${totalCents / 100n}.${String(totalCents % 100n).padStart(2, "0")}`;
        const [result] = await connection.execute(
            `INSERT INTO orders (customer_name, phone, total)
             VALUES (?, ?, ?)`,
            [customerName, phone, total]
        );

        for (const item of orderItems) {
            await connection.execute(
                `INSERT INTO order_items
                    (order_id, menu_item_id, item_name, unit_price, quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [result.insertId, item.menu_item_id, item.item_name, item.unit_price, item.quantity]
            );
        }

        await connection.commit();
        return { id: result.insertId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const listOrders = async (status) => {
    const query = `SELECT id, customer_name, phone, status, total, created_at, updated_at
                   FROM orders${status ? " WHERE status = ?" : ""}
                   ORDER BY created_at DESC, id DESC`;
    const [orders] = status
        ? await db.execute(query, [status])
        : await db.query(query);
    return orders;
};

const updateOrderStatus = async (id, status, currentStatus) => {
    const [result] = await db.execute(
        `UPDATE orders
         SET status = ?
         WHERE id = ? AND status = ?`,
        [status, id, currentStatus]
    );
    return result.affectedRows > 0;
};

const orderExists = async (id) => {
    const [rows] = await db.execute("SELECT id FROM orders WHERE id = ?", [id]);
    return rows.length > 0;
};

module.exports = {
    createOrder,
    getOrderById,
    listOrders,
    orderExists,
    updateOrderStatus
};
