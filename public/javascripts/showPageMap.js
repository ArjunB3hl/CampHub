
mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
//     center: campground.geometry.coordinates, // starting position [lng, lat]
//     zoom: 10 // starting zoom
// });



const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: campground.geometry.coordinates,
    pitch: 60,
    bearing: -60,
    zoom: 10
});



new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)

map.addControl(new mapboxgl.NavigationControl());