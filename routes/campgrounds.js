const express = require('express');
const router = express.Router();
const { cloudinary } = require('../cloudinary');  // Add this line
const catchAsync = require('../utils/catchAsync');
const validateCampground = require('../middleware/validateCampground');
const multer = require('multer');
const { storage } = require('../cloudinary'); // Assuming you're using Cloudinary
const upload = multer({ 
    storage,
    limits: {
        fileSize: 200000000 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const Campground = require('../models/campground'); // Adjust path as needed

const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require("../middleware")
const { isAuthor } = require("../middleware")

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', isLoggedIn, (req, res) => {

    res.render('campgrounds/new');
})


router.post('/', isLoggedIn, upload.array('image', 5), validateCampground, catchAsync(async (req, res, next) => {
    console.log("Files in request:", req.files); // Debug line
    try {
        if (!req.files) {
            throw new ExpressError('Please upload at least one image', 400);
        }

        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        
        if (!geoData.body.features || !geoData.body.features.length) {
            throw new ExpressError("Could not find that location. Please try a different location.", 400);
        }

        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;

        campground.images = req.files.map(f => ({
            url: f.path,
            filename: f.filename
        }));
        
        campground.author = req.user._id;
        
        await campground.save();
        console.log('Created campground:', campground); // Add this for debugging
        
        req.flash('success', 'Successfully created a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        console.error("Campground creation error:", error);
        
        // Cleanup uploaded images if campground creation fails
        if (req.files) {
            for (let file of req.files) {
                await cloudinary.uploader.destroy(file.filename);
            }
        }
        
        next(error);
    }
}));



router.get('/:id', catchAsync(async (req, res,) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate(
        {
            path: 'reviews',
            populate: {
                path: "author"
            }
        }
    ).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    campground.images.push(...images)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;