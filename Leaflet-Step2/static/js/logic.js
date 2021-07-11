starttime = "2021-07-03"
endtime = "2021-07-10"
url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}`

urltectonic = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

var Tectonic = L.layerGroup()

d3.json(urltectonic).then(data => {
    var tectonic = L.geoJSON(data, {
        color: "orange",
        weight: 3,
        opacity: 0.5
    }).addTo(Tectonic)
})

// // }).bindPopup(function (layer) {
// //     return layer.feature.properties.description;
// }).addTo(myMap);

// Define variables for our tile layers
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
    });

var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    });

var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
    })

// Only one base layer can be shown at a time
var baseMaps = {
    "Satellite": satellite,
    "Grayscale": light,
    "Outdoor": outdoor
};

// L.control.layers(baseMaps).addTo(myMap);

var earthQuake = []
var EarthQuakeLayer = L.layerGroup()
d3.json(url).then(data => {
    // var earthQuakes = data.features
    data.features.forEach((d, index) => {
        // console.log(d.properties)
        var magnitude = d.properties.mag
        var location = [d.geometry.coordinates[1],d.geometry.coordinates[0]] 
        var dates = d.properties.time
        // console.log(location)
        var latlngs = [
            [d.geometry.coordinates[1],d.geometry.coordinates[0]]
        ];

        earthQuake.push(
            L.circle(location, {
            stroke: false,
            fillOpacity: 1,
            color: getColor(magnitude),
            fillColor: getColor(magnitude),
            // Adjust radius
            radius: magnitude * 50000    
        })
        // Add popup and add the EarthQuakeMarkers to a new layer group.
        .bindPopup("<h4>" + d.properties.title + "</h4> <hr> <p>" + new Date(dates) + "</p>").addTo(EarthQuakeLayer)
        );
        // console.log("Finish Adding earthQuake")
    })
})

// Bubble colors by earthquake magnitude
function getColor(d) {
    return d >= 5 ? '#f50a18' :
           d >= 4 ? '#f5720a' :
           d >= 3 ? '#f39c1d' :
           d >= 2 ? '#f0cc3d' :
           d >= 1 ? '#aadb12' :
           d >= 0 ? '#8cb709' :
                    'white';
}

// console.log(EarthQuakeLayer)
// Overlays
var overlayMaps = {
    "Earthquakes": EarthQuakeLayer,
    "Tectonic": Tectonic
};

// Overlays that may be toggled on or off
var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 3,
    layers: [satellite, EarthQuakeLayer, Tectonic]
});

// Layers control
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Create Legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(){
    // Create new div in the HTML
    var div = L.DomUtil.create("div","legend")
    for (var i = 0; i < 6; i++) {
        let currColor = getColor(i)
        if (i == 5) {
            div.innerHTML += `<i style = "background-color: ${currColor}"> </i> 5+`
        } else {
            div.innerHTML += `<i style = "background-color: ${currColor}"> </i> ${i} - ${i + 1} <br/>`
        }
    }
    return div
}
legend.addTo(myMap)