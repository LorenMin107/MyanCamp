const User = require("../models/user");
const Booking = require("../models/booking");

module.exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Count total users
    const totalBookings = await Booking.countDocuments(); // Count total bookings
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortField || "startDate"; // Default sort field is username
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Default sort order is ascending
    const sortOptions = {}; // Create an empty object to store sort options
    sortOptions[sortField] = sortOrder; // Add the sort field and order to the sort options object
    const bookings = await Booking.find({})
      .skip(skip)
      .limit(limit)
      .populate("user") // Populate user with username field
      .populate("campground") // Populate campground with title field
      .sort(sortOptions);
    const totalPages = Math.ceil(totalBookings / limit);
    res.render("admin/dashboard", { totalUsers, totalBookings, bookings, page, totalPages, sortField, sortOrder, currentPage: "adminDashboard" });
  } catch (err) {
    req.flash("error", "Unable to load admin dashboard");
    res.redirect("/");
  }
};

module.exports.viewAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/users", { users });
  } catch (err) {
    req.flash("error", "Unable to load users");
    res.redirect("/admin/dashboard");
  }
};

module.exports.viewUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "bookings",
        populate: {
          path: "campground",
          model: "Campground",
        },
      })
      .populate("reviews")
      .populate("contacts");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }

    res.render("admin/userDetails", { user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/admin/users");
  }
};

module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  await Booking.findByIdAndDelete(id);
  req.flash("success", "Successfully canceled booking!");
  res.redirect("/admin/dashboard");
};
