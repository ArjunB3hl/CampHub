const mongoose = require('mongoose');
const cities = require('./canadian_cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/project')
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random100 = Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 30);
        const camp = new Campground({
            author: '658e6576081235f3d0fbc157',
            location: `${cities[random100].city}, ${cities[random100].province}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random100].longitude,
                    cities[random100].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/du5i9fhlv/image/upload/v1703957422/YelpCamp/uoc57nr1wfxnobfjyboi.jpg',
                    filename: 'YelpCamp/uoc57nr1wfxnobfjyboi',
                }
            ],
            description: "jdjaddiuqwudhw  wquodh qwohdoq wodhqwouwdhq wqdu qidwoqodhw wudqhduhwo ",
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})