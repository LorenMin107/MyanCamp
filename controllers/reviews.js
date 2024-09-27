const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id); // find the campground
  const review = new Review(req.body.review); // create a new review
  review.author = req.user._id; // set the review's author to the current user
  campground.reviews.push(review); // push the review into the campground's reviews array
  await review.save();
  await campground.save();
  req.user.reviews.push(review); // Add this line to associate the review with the user
  await req.user.save(); // Save the user with the new review
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  await User.updateMany({ reviews: reviewId }, { $pull: { reviews: reviewId } });
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
