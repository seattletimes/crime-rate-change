//load our custom elements
require("component-leaflet-map");
require("component-responsive-frame");

var $ = require("./lib/qsa")
var dot = require("./lib/dot");
var legendTemplate = dot.compile(require("./_legend.html"));

//get access to Leaflet and the map
var element = document.querySelector("leaflet-map");
var L = element.leaflet;
var map = element.map;
var legendElement = $.one('.legend');

map.scrollWheelZoom.disable();

// Add labels
var topLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
  opacity: 0.8,
  pane: "markerPane",
}).addTo(map);

var mapOptions = {
  "change-total": {
    legendTitle: "Change in crime, 2008-2011 to 2015-2017",
    buckets: [
      { min: -1000, max: -10.1, label: 'More than 10% decrease' },
      { min: -10, max: -0.1, label: '-0.1% to -10%' },
      { min: 0, max: 10, label: '0% to 10%' },
      { min: 10.1, max: 1000, label: 'More than 10% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=PiYG&n=8
    colors: ['#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221'].reverse(),
  },
  "change-violent": {
    legendTitle: "Change in violent crime, 2008-2011 to 2015-2017",
    buckets: [
      { min: -1000, max: -1.1, label: 'More than 1% decrease' },
      { min: -1, max: -0.1, label: '-0.1% to -1%' },
      { min: 0, max: 1, label: '0% to 1%' },
      { min: 1.1, max: 1000, label: 'More than 1% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=PuOr&n=8
    colors: ['#b35806', '#e08214', '#fdb863', '#fee0b6', '#d8daeb', '#b2abd2', '#8073ac', '#542788'].reverse(),
  },
  "change-property": {
    legendTitle: "Change in property crime, 2008-2011 to 2015-2017",
    buckets: [
      { min: -1000, max: -10.1, label: 'More than 10% decrease' },
      { min: -10, max: -0.1, label: '-0.1% to -10%' },
      { min: 0, max: 10, label: '0% to 10%' },
      { min: 10.1, max: 1000, label: 'More than 10% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=BrBG&n=8
    colors: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'].reverse(),
  }
};

// Support switching styles
var currentStyle = "";
var toggleStyle = function toggleStyle(slug) {
  var geojsonLayer = element.lookup.geojson;
  if (!geojsonLayer) return; // Hasn't loaded geojson asynchronously yet

  if (slug === currentStyle) return; // No change
  currentStyle = slug;
  var mapOption = mapOptions[slug];

  // Change map colors
  geojsonLayer.setStyle((feature) => {
    for (var i = 0; i < mapOption.buckets.length; i += 1) {
      var bucket = mapOption.buckets[i];
      if (bucket.min <= feature.properties[slug] && feature.properties[slug] <= bucket.max) {
        return { fillColor: mapOption.colors[i * 2] };
      }
    }
    return {}; // uh-oh
  });

  // Change legend
  legendElement.innerHTML = legendTemplate(mapOption);
};

toggleStyle("change-total");

$.one(".mode-controls").addEventListener("change", () => {
  var selected = $.one(".mode-controls input:checked").value;
  toggleStyle(selected);
});