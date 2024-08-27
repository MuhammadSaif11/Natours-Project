// // /*eslint-disable*/
// require('ol/ol.css');
// const Map = require('ol/Map').default;
// const View = require('ol/View').default;
// const TileLayer = require('ol/layer/Tile').default;
// const OSM = require('ol/source/OSM').default;

// const locations = JSON.parse(
//   this.document.getElementById('map').dataset.locations,
// );
// console.log(locations);

// const map = new Map({
//   target: 'map', // The id of the element to render the map in
//   layers: [
//     new TileLayer({
//       source: new OSM(), // Use OpenStreetMap as the tile source
//     }),
//   ],
//   view: new View({
//     center: [0, 0], // Initial center of the map (longitude, latitude in EPSG:3857)
//     zoom: 2, // Initial zoom level
//   }),
// });

// // Set the initial view to the correct projection (WGS 84)
// map.getView().setCenter(ol.proj.fromLonLat([0, 0]));
