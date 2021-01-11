// This is for future use, I've coded this function to convert time offset to UTC timezone
// It was useful for different geoIP API provider. Now, it sits here. Waiting.

function convertOffsetToUTCLabel(offset){

    offset_seconds = data["offset"];
    offset_hours = Math.abs(Math.floor(offset_seconds / 3600));
    offset_minutes = (Math.abs(offset_seconds) - offset_hours * 3600) / 60;

    if (offset_hours < 10)
        offset_hours_string = `0${offset_hours}`;
    else
        offset_hours_string = `${offset_hours}`;

    if (offset_minutes < 10)
        offset_minutes_string = `0${offset_minutes}`;
    else
        offset_minutes_string = `${offset_minutes}`;

    if (offset_seconds < 0)
        utc_string = `UTC -${offset_hours_string}:${offset_minutes_string}`;
    if (offset_seconds > 0)
        utc_string = `UTC +${offset_hours_string}:${offset_minutes_string}`;

    return utc_string;
}

// Initialize map at London. Why? Otherwise we'll have big white box. Bleh.

var map = L.map('mapid').setView([51.505, -0.09], 13);

// Plz don't steal, I am still learning, Internet is scary

var api_key = "at_f37LhNwgglrkSTbl0pCR6sgPN23Na";

// Free map - cool because it's free

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize layer on the map to put and wipe off markers fromm

var marker_group = L.layerGroup().addTo(map);

// Cool minimalistic pin

var myPin =  L.icon({

    iconUrl: './images/icon-location.svg',
    shadowUrl: '', 
    
    iconAnchor:   [23, 56],   
    shadowSize:   [0, 0] 
})

// Quick user's IP fetch at page load 

window.onload = function() {

    $.getJSON("https://api.ipify.org?format=json", function(data) { getGeolocationFromIp(data.ip); });
    map.removeControl(map.zoomControl);

};

// Sets marker on a map at selected [lat,lon] location
// and panning the map to view which puts marker at approx 20% screen height
// This is done by converting [lat,lon] position at the map to physical [x,y] position
// (in pixels) on screen. Then the aforementioned pan offset is added and the inverse
// transformation takes place

function setLocationOnMap(lat, lon, zoom){

    marker_group.clearLayers();
    map = map.setView([lat, lon], zoom);
    
    L.marker([lat, lon], {icon: myPin}).addTo(marker_group);
    
    pixelPosition = map.latLngToLayerPoint([lat,lon]);
    
    if (window.matchMedia('(max-width: 375px)').matches) media_percent = 0.15;    
    else media_percent = 0.25;
    
    pixelPosition.y = media_percent * $("#mapid").height();
    
    latLon = map.layerPointToLatLng(pixelPosition);

    map = map.setView(latLon, zoom);

};

// Stolen cold-heartedly from Internet (probably StackOverflow)

var _ip_regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var _url_regex = `^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$`;

// Validation functions - important for choosing correct AJAX request for IPify and general validation reasons

function isIPAddress(ipaddress) 
{
    if (_ip_regex.test(ipaddress)) return (true);
    return (false);
}

function isValidURL(str) {
    var pattern = new RegExp(_url_regex,'i'); // fragment locator
    return !!pattern.test(str);
}

// Prevent page refresh after form submission

$(".ip_input").submit( function(e) {
    e.preventDefault();
});

// Set separators height to 60% of info dashboard height

function resizeSeparators() { $(".ip_info_separator").css("height",`${ 0.6 * $(".ip_info_wrapper").height() }`); }

function getGeolocationFromIp(given_ip){
    
    // Validation and request

    if( isIPAddress(given_ip) )     geolocationRequest = $.ajax({  url: `https://geo.ipify.org/api/v1?apiKey=${api_key}&ipAddress=${given_ip}` });        
    else if (isValidURL(given_ip))  geolocationRequest = $.ajax({  url: `https://geo.ipify.org/api/v1?apiKey=${api_key}&domain=${given_ip}` });
    else                            window.alert("Invalid domain/IP!");
    
    // Plugging stuff from JSON to correct fields by use of jQuery and selectors in .css sheet
    
    geolocationRequest.done( (data) => {

        geolocation = data["location"]

        return_lat = geolocation["lat"];
        return_lon = geolocation["lng"];

        if (return_lat != undefined && return_lon != undefined){

            setLocationOnMap(return_lat, return_lon, 12);

            $("#address .ip_info_value").text(data["ip"]);
            $("#location .ip_info_value").text(geolocation["city"] + ", " + geolocation["postalCode"] + " " + geolocation["region"]);
            $("#timezone .ip_info_value").text(`UTC${geolocation["timezone"]}`);
            $("#isp .ip_info_value").text(data["isp"]);
            
            resizeSeparators();

        }
        else {

            window.alert("Can't find specified domain/IP. Sorry!");
            window.location.reload();

        }
    }).fail( () => {}).always( () => {} );

}