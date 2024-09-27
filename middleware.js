const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");
const Booking = require("./models/booking");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // store the returnTo path in the session
    req.flash("error", "You must be signed in to create a new campground.");
    return res.redirect("/login");
  }
  next();
};

// storeReturnTo middleware to store the returnTo path in the session
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground || (!campground.author.equals(req.user._id) && !req.user.isAdmin)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review || (!review.author.equals(req.user._id) && !req.user.isAdmin)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateBookingDates = (req, res, next) => {
  const { startDate, endDate } = req.body;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  if (startDate < tomorrow || endDate < tomorrow) {
    req.flash("error", "Booking dates must be in the future.");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }

  if (new Date(endDate) < new Date(startDate)) {
    req.flash("error", "End date cannot be before start date.");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }

  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    req.flash("error", msg);
    return res.redirect(`/campgrounds/${req.params.id}`);
  } else {
    next();
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    req.flash("error", "You do not have permission to perform this action.");
    return res.redirect("/campgrounds");
  }
};

module.exports.addBookingCountToUser = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id).populate("bookings");
    req.user.bookingsCount = user.bookings.length;
  }
  next();
};
