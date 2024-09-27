const express = require("express");
const router = express.Router();
const { isLoggedIn, validateBookingDates, addBookingCountToUser } = require("../middleware");
const bookings = require("../controllers/bookings");

router.get("/view", isLoggedIn, addBookingCountToUser, bookings.viewBooking);
router.post("/:id/book", isLoggedIn, validateBookingDates, bookings.bookCampground);
router.get("/:id/checkout", isLoggedIn, validateBookingDates, bookings.renderCheckoutPage);
router.post("/:id/proceed", isLoggedIn, validateBookingDates, addBookingCountToUser, bookings.proceedBooking);
router.get("/:id/pay", isLoggedIn, validateBookingDates, bookings.processPayment);
router.get("/:id/success", isLoggedIn, bookings.paymentSuccess);
router.get("/:id/transaction", isLoggedIn, bookings.viewTransaction);
module.exports = router;
