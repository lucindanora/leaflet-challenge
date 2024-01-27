// Store API endpoint as queryURL.
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Define earthquake layer in the global scope
let earthquake;

// Perform a GET request to the query URL.
d3.json(queryURL).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    earthquake = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });

    // Send our earthquakes layer to the createMap function.
    createMap(earthquake);
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            '<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create legend
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depthRanges = [-10, 10, 30, 50, 70, 90];
        let labels = [];
        // Add the legend title.
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
        // Add the legend labels with more colors and larger size.
        for (let i = 0; i < depthRanges.length; i++) {
            labels.push(
                '<i style="background:' +
                getColor(depthRanges[i] + 1) +
                '; width: 30px; height: 30px; display: inline-block;"></i> ' +
                depthRanges[i] +
                (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+')
            );
        }
        // Add the labels to the legend.
        div.innerHTML += "<div style='font-size: 14px;'>" + labels.join("") + "</div>";
        //add border to legend
        div.style.border = '2px solid black';
        div.style.padding = '10px'; // Optional: Add padding for better appearance.

        return div;
    };
    legend.addTo(myMap);

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

// Helper function to get color based on depth
function getColor(d) {
    return d > 90 ? '#800026' :
           d > 70 ? '#BD0026' :
           d > 50 ? '#E31A1C' :
           d > 30 ? '#FC4E2A' :
           d > 10 ? '#FD8D3C' :
                    '#FFEDA0';
}
