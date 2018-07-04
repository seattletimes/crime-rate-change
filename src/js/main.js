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
var geojsonLayer = element.lookup.geojson;
var legendElement = $.one('.legend');

map.scrollWheelZoom.disable();

// Bind popups
geojsonLayer.eachLayer((layer) => {
  var props = layer.feature.properties;
  var format = attr => `${(props[attr] > 0 ? "+" : "")}${props[attr].toFixed(1)}`;
  layer.bindPopup(`<h1 class="bigheader">${props.name}</h1>
    <ul>
      <li><span>Total crime rate change:</span><span>${format('change-total')}%</span></li>
      <li><span>Violent crime rate change:</span><span>${format('change-violent')}%</span></li>
      <li><span>Property crime rate change:</span><span>${format('change-property')}%</span></li>
      <li>&nbsp;</li>
      <li><span>Crime rate ranking, 2015-2017:&nbsp;</span><span>${props['rate-rank']} of 57</span></li>
      <li>(Ranked from highest to lowest rate)</li>
    </ul>`);
});

// Add labels
var topLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
  opacity: 0.8,
  pane: "markerPane",
}).addTo(map);

var mapOptions = {
  "change-total": {
    legendTitle: "Change in crime rate, 2008-2010 to 2015-2017",
    buckets: [
      { min: -1000, max: -20.1, label: 'More than 20% decrease' },
      { min: -20, max: -0.1, label: '-0.1% to -20%' },
      { min: 0, max: 20, label: '0% to 20%' },
      { min: 20.1, max: 1000, label: 'More than 20% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=RdBu&n=8
      colors: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'].reverse(),
  },
  "change-violent": {
    legendTitle: "Change in violent crime rate, 2008-2010 to 2015-2017",
    buckets: [
      { min: -1000, max: -20.1, label: 'More than 20% decrease' },
      { min: -20, max: -0.1, label: '-0.1% to -20%' },
      { min: 0, max: 20, label: '0% to 20%' },
      { min: 20.1, max: 1000, label: 'More than 20% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=RdYlBu&n=8 - lightened yellow and blue
    colors: ['#d73027', '#f46d43', '#fdae61', '#feeab3', '#e0f3f8', '#c3e4ef', '#74add1', '#4575b4'].reverse(),
  },
  "change-property": {
    legendTitle: "Change in property crime rate, 2008-2010 to 2015-2017",
    buckets: [
      { min: -1000, max: -20.1, label: 'More than 20% decrease' },
      { min: -20, max: -0.1, label: '-0.1% to -20%' },
      { min: 0, max: 20, label: '0% to 20%' },
      { min: 20.1, max: 1000, label: 'More than 20% increase' },
    ],
    // http://colorbrewer2.org/?type=diverging&scheme=BrBG&n=8
    colors: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'].reverse(),
  }
};

// Support switching styles
var currentStyle = "";
var toggleStyle = function toggleStyle(slug) {
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