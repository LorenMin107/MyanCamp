MyanCamp
MyanCamp is a web application for discovering, booking, and reviewing campgrounds in Myanmar. This project uses Node.js, Express, MongoDB, and EJS for server-side rendering.
Features:
User Authentication (Login/Register)
Campground Management (CRUD operations)
Booking System
Review System
Admin Dashboard
Map Integration with Mapbox
Secure with Helmet, Mongo Sanitize, and Content Security Policy

Installation:

1. Open your terminal.
2. Navigate to the project directory:
   cd path/to/your/project
3. Install dependencies:
   npm install
4. Configure MongoDB:
   Ensure MongoDB is running on your device. Update the MongoDB connection URL in the code if necessary. The default URL is mongodb://localhost:27017/myan-camp.
5. Seed the database:
   node seeds/index.js
6. Seed the admin:
   node seedDB.js
7. Run the application:
   node app.js (or) nodemon app.js

Usage:
Register or log in to manage campgrounds, make bookings, and leave reviews.
Project Structure:
app.js: Main application file.
models/: Mongoose models for User, Campground, Review, and Booking.
controllers/: Route handlers for campgrounds, reviews, bookings, and users.
routes/: Express routes for different parts of the application.
views/: EJS templates for server-side rendering.
public/: Static files (CSS, JS, images).
Key Files:
Models
models/user.js: User schema and authentication setup.
models/campground.js: Campground schema with virtuals and post hooks.
models/review.js: Review schema.
models/booking.js: Booking schema.
Controllers:
controllers/campgrounds.js: Handlers for campground routes.
controllers/reviews.js: Handlers for review routes.
controllers/bookings.js: Handlers for booking routes.
Routes:
routes/campgrounds.js: Routes for campground operations.
routes/reviews.js: Routes for review operations.
routes/bookings.js: Routes for booking operations.
routes/users.js: Routes for user authentication and profile.
Views:
views/layouts/boilerplate.ejs: Main layout template.
views/campgrounds/: Templates for campground operations.
views/reviews/: Templates for review operations.
views/bookings/: Templates for booking operations.
views/users/: Templates for user authentication.
Public:
public/stylesheets/: CSS files.
public/javascripts/: Client-side JavaScript files.
Security
Helmet for setting various HTTP headers.
Mongo Sanitize to prevent NoSQL injection.
Local Passport for hashing users' password with hash and salt
