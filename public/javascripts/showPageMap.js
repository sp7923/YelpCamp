maptilersdk.config.apiKey = mapApiKey;
  const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.STREETS,
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
  });

var popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
    `<h5>${campground.title}</h5><p>${campground.location}</p>`
);

map.setStyle(maptilersdk.MapStyle.STREETS.PASTEL);
  const marker = new maptilersdk.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);