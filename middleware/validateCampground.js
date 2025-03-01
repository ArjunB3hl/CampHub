const ExpressError = require('../utils/ExpressError');

module.exports = (req, res, next) => {
    const { campground } = req.body;
    if (!campground) {
        return next(new ExpressError('Campground data is missing', 400));
    }
    if (!campground.title) {
        return next(new ExpressError('Campground title is required', 400));
    }
    if (!campground.location) {
        return next(new ExpressError('Campground location is required', 400));
    }
    // Add any other required field validations here
    next();
}
