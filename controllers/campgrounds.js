const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { query } = require("express");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // initialize the geocoding service with the token

module.exports.index = async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    const locations = await Campground.distinct("location"); // Fetching unique locations
    res.render("campgrounds/index", { campgrounds, locations, searchPerformed: false, currentPage: "campgrounds" });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).send("Error loading page");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new", { currentPage: "newCampground" });
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename })); // Map over the files array and create an object for each file with the url and filename
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground, currentPage: "campgrounds" });
};

module.exports.searchCampgrounds = async (req, res) => {
  const { search } = req.query;
  try {
    const campgrounds = await Campground.find({
      title: { $regex: new RegExp(search, "i") }, // Search for campgrounds with titles that match the search query
    });
    const locations = await Campground.distinct("location");
    res.render("campgrounds/index", { campgrounds, locations, searchPerformed: true, currentPage: "campgrounds" });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Error performing search");
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground, currentPage: "campgrounds" });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
    geometry: geoData.body.features[0].geometry,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
