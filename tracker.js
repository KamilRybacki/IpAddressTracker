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

var map = L.map('mapid').setView([51.505, -0.09], 13);
var api_key = "at_f37LhNwgglrkSTbl0pCR6sgPN23Na";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker_group = L.layerGroup().addTo(map);

var myPin =  L.icon({

    iconUrl: './images/icon-location.svg',
    shadowUrl: '', 
    
    iconAnchor:   [23, 56],   
    shadowSize:   [0, 0] 
})

window.onload = function() {

    $.getJSON("https://api.ipify.org?format=json", function(data) { getGeolocationFromIp(data.ip); });
    map.removeControl(map.zoomControl);

};

function setLocationOnMap(lat, lon, zoom){

    marker_group.clearLayers();
    map = map.setView([lat, lon], zoom);
    
    L.marker([lat, lon], {icon: myPin}).addTo(marker_group);
    
    pixelPosition = map.latLngToLayerPoint([lat,lon]);
    
    if (window.matchMedia('(max-width: 375px)').matches) {
        media_percent = 0.15;    
    } 
    else {
        media_percent = 0.25;
    }
    
    pixelPosition.y = media_percent * $("#mapid").height();
    
    latLon = map.layerPointToLatLng(pixelPosition);

    map = map.setView(latLon, zoom);

};

function isIPAddress(ipaddress) 
{
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)){ return (true); }
 return (false);
}

function isValidURL(str) {
    var pattern = new RegExp(`^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$` /* protocol*/ /* domain name*/ /* OR ip (v4) address*/ /* port and path*/ /* query string*/,'i'); // fragment locator
    return !!pattern.test(str);
}

$(".ip_input").submit( function(e) {
    e.preventDefault();
});

function getGeolocationFromIp(given_ip){
    
    // Validation and request

    if( isIPAddress(given_ip) )     geolocationRequest = $.ajax({  url: `https://geo.ipify.org/api/v1?apiKey=${api_key}&ipAddress=${given_ip}` });        
    else if (isValidURL(given_ip))  geolocationRequest = $.ajax({  url: `https://geo.ipify.org/api/v1?apiKey=${api_key}&domain=${given_ip}` });
    else                            window.alert("Invalid domain/IP!");
    
    geolocationRequest.done( (data) => {

        geolocation = data["location"]

        return_lat = geolocation["lat"];
        return_lon = geolocation["lng"];
        
        console.log(data)

        if (return_lat != undefined && return_lon != undefined){

            setLocationOnMap(return_lat, return_lon, 12);

            $("#address .ip_info_value").text(data["ip"]);
            $("#location .ip_info_value").text(geolocation["city"] + ", " + geolocation["postalCode"] + " " + geolocation["region"]);
            $("#timezone .ip_info_value").text(`UTC${geolocation["timezone"]}`);
            $("#isp .ip_info_value").text(data["isp"]);
            
        }
        else {

            window.alert("Can't find specified domain/IP. Sorry!");
            window.location.reload();

        }
    }).fail( () => {}).always( () => {} );

    
}