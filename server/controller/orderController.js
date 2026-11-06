const orderQueries = require("../config/orderQueries");

const allowedStatuses = ["PLACED", "PREPARING", "DELIVERED"];
const validId = (id) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;

exports.createOrder = async (req, res) => {
    const { customer_name: customerName, phone, items } = req.body || {};
    if (
        typeof customerName !== "string" ||
        !customerName.trim() ||
        customerName.trim().length > 150 ||
        typeof phone !== "string" ||
        !phone.trim() ||
        phone.trim().length > 32 ||
        !Array.isArray(items) ||
        items.length === 0 ||
        items.some((item) =>
            !item ||
            !Number.isSafeInteger(item.menu_item_id) ||
            item.menu_item_id <= 0 ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        )
    ) {
        return res.status(400).json({ success: false, message: "Invalid order details" });
    }

    try {
        const result = await orderQueries.createOrder({
            customerName: customerName.trim(),
            phone: phone.trim(),
            items
        });

        if (result.unavailable) {
            return res.status(400).json({
                success: false,
                message: "One or more menu items do not exist or are unavailable"
            });
        }
        if (result.totalTooLarge) {
            return res.status(400).json({ success: false, message: "Order total is too large" });
        }

        const order = await orderQueries.getOrderById(result.id);
        return res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error("Create order error:", error);
        return res.status(500).json({ success: false, message: "Unable to create order" });
    }
};

exports.getOrder = async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    try {
        const order = await orderQueries.getOrderById(Number(req.params.id));
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ success: false, message: "Unable to fetch order" });
    }
};

exports.listOrders = async (req, res) => {
    const status = req.query.status;
    if (status !== undefined && !allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    try {
        const orders = await orderQueries.listOrders(status);
        return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error("List orders error:", error);
        return res.status(500).json({ success: false, message: "Unable to fetch orders" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const { status } = req.body || {};
    const previousStatus = { PREPARING: "PLACED", DELIVERED: "PREPARING" }[status];
    if (!previousStatus) {
        return res.status(400).json({
            success: false,
            message: "Status must transition to PREPARING or DELIVERED"
        });
    }

    try {
        const id = Number(req.params.id);
        const updated = await orderQueries.updateOrderStatus(id, status, previousStatus);
        if (!updated) {
            if (!(await orderQueries.orderExists(id))) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
            return res.status(409).json({
                success: false,
                message: `Order must be ${previousStatus} before moving to ${status}`
            });
        }

        const order = await orderQueries.getOrderById(id);
        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({ success: false, message: "Unable to update order status" });
    }
};
