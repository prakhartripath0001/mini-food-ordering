const menuQueries = require("../config/menuQueries");

exports.getMenu = async (req, res) => {
    try {
        const { category } = req.query;

        let menuItems;

        if (category) {
            menuItems = await menuQueries.getMenuByCategory(category);
        } else {
            menuItems = await menuQueries.getAllMenuItems();
        }

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });

    } catch (error) {
        console.error("Menu error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch menu"
        });
    }
};