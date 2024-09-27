const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Define a new Joi extension for sanitizing HTML input from the user to prevent XSS attacks
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

// Joi schema for validating the user data
const userSchema = Joi.object({
  email: Joi.string().required().email(),
  username: Joi.string().required().escapeHTML(),
  password: Joi.string().required(),
  phone: Joi.string()
    .required()
    .pattern(/^[0-9]{11}$/),
});

// Joi schema for validating the campground data
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

// Joi schema for validating the review data
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
