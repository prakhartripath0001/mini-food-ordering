const express = require("express");
const router = express.Router();

const orderController = require("../controller/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.listOrders);
router.get("/:id", orderController.getOrder);
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;
