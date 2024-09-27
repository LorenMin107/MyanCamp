const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController = require("../controllers/admin");

router.get("/dashboard", isLoggedIn, isAdmin, adminController.adminDashboard);
router.delete("/bookings/:id", isLoggedIn, isAdmin, adminController.cancelBooking);
router.get("/users", isLoggedIn, isAdmin, adminController.viewAllUsers); // Ensure this line is correct
router.get("/users/:id", isLoggedIn, isAdmin, adminController.viewUserDetails);
module.exports = router;
