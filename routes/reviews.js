const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams: true allows us to access the params from the parent router

const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor, isAdmin } = require("../middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));
module.exports = router;
