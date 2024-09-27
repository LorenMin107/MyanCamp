const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/myan-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected!");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const random20 = Math.floor(Math.random() * 20);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6665e48afb77d753e040d0ec",
      location: `${cities[random20].city}, ${cities[random20].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit dignissimos cupiditate vero nam necessitatibus, debitis autem ea minus vel tempora, aut magnam minima expedita inventore sequi vitae animi itaque placeat.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random20].longitude, cities[random20].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dlvtzyb7j/image/upload/v1717955180/MyanCamp/poyqcicerovtohj5nd7e.jpg",
          filename: "MyanCamp/poyqcicerovtohj5nd7e",
        },
        {
          url: "https://res.cloudinary.com/dlvtzyb7j/image/upload/v1717955176/MyanCamp/k4ou1y2ad2dzt2luu5pf.jpg",
          filename: "MyanCamp/k4ou1y2ad2dzt2luu5pf",
        },
      ],
    });
    await camp.save();
  }
};

seedDB();
