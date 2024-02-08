/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWJvemFpZDAxIiwiYSI6ImNsbDU5eTloMzAzOTYza3Fqb3Q4Z2NscmoifQ.sDPpBLaTQFIKJcXSKFAshQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/abozaid01/clsapb3oq00t101qlhmte2ekx', // style URL
    scrollZoom: false,
    // center: [31.2410507, 29.9594365], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
