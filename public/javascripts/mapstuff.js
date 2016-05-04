// var map;

function initMap() {
  getGPS();
}

// loads GPS data from default.gpx & initializes the google map
function getGPS() {
  var xml = new XMLHttpRequest();
  // var url = "/gps?filename=default_coord.js";
  var url = "/gps";
  var file_link = document.getElementById('path').innerHTML;
  if (file_link) {
    url += "?filename=" + file_link;
  }
  console.log(url);

  xml.onreadystatechange = function() {
    if (xml.readyState == 4 && xml.status == 200) {
      // console.log(xml);
      if (!xml.responseText) {
        console.log("NO DATA HERE");
      }
      var res = JSON.parse(xml.responseText);

      res.points.pop();
      // now, need to convert the points to numbers
      for (var i = 0; i < res.points.length; ++i) {
        res.points[i].lat = +res.points[i].lat;
        res.points[i].lng = +res.points[i].lng;
      }
      // then do all the initMap shizz
      var run_coords = res.points;
      var min_max = getMinMax(run_coords);
      var ctr = getCenter(min_max);
      var zm = getZoomFactor(min_max);

      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: zm,
        center: ctr,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });

      var startPos = { lat: res.points[0].lat, lng: res.points[0].lng };

      var mapDot = {
        url: 'images/dot.png',
        scaledSize: new google.maps.Size(32, 32),
        // origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(16,16)
      };
     
      var marker = new google.maps.Marker({
        position: startPos,
        map: map,
        // icon: 'images/dot.png'
        icon: mapDot
      });

      var runPath = new google.maps.Polyline({
        path: run_coords,
        geodesic: true,
        strokeColor: '#F54E0C',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      runPath.setMap(map);

      // now do plotly stuff here with rest of data in res?
      var x_coords = [];
      var y_coords = [];
      var alt_coords = [];
      var max_pace = 0;
      var min_pace = 100;
      var max_elev = -1000000;
      var min_elev = 1000000;
      
      for (var i = 0; i < res.points.length - 1; ++i) {
        x_coords.push(new Date(res.points[i].elapsed * 1000).toISOString().substr(11,8));
        alt_coords.push(res.points[i].elev);
        if (res.points[i].elev > max_elev) { max_elev = res.points[i].elev; }
        if (res.points[i].elev < min_elev) { min_elev = res.points[i].elev; }

        // y_coords.push(res.points[i].distance / 5280.0);
        y_coords.push(res.points[i].pace);
        if (res.points[i].pace > max_pace) { max_pace = res.points[i].pace; }
        if (res.points[i].pace < min_pace) { min_pace = res.points[i].pace; }
      } 
      

      // build Plotly XY div
      graphDiv = document.getElementById('plotly');

      var distance_trace = {
        x: x_coords,
        y: y_coords,
        line: { shape: 'spline' },
        mode: 'lines',
        type: 'scatter',
        name: 'min/mile',
        // yaxis: 'y1',
        marker: {
          color: 'rgb(64,128,64)'
        }
      };
      var elevation_trace = {
        x: x_coords,
        y: alt_coords,
        line: { shape: 'spline' },
        // mode: 'lines',
        type: 'bar',
        name: 'ft',
        yaxis: 'y2',
        marker: {
          color: 'rgb(208,208,208)'
        }
      };

      var dat = [distance_trace, elevation_trace];

      var layout = {
        margin: { t: 0 },
        xaxis: {
          title: 'Elapsed Time',
          nticks: 15, 
          // range: [0,2000]
        },
        yaxis: {
          title: 'Average Speed',
          // range: [max_pace + (0.5 * max_pace), min_pace - (0.5 * min_pace)]
          // range: [0, max_pace + (0.5 * max_pace)]
          range: [0, 1.5 * max_pace]
        },
        yaxis2: {
          title: 'Elevation',
          overlaying: 'y',
          side: 'right',
          range: [min_elev - (0.25 * min_elev), 2 * max_elev]

        }
      };

      Plotly.newPlot(graphDiv, dat, layout);

      var markerPos;
      graphDiv.on('plotly_hover', function(data) {
        // store data.points[0].pointNumber and move marker to there
        // console.log(data.points[0].pointNumber);
        markerPos = res.points[data.points[0].pointNumber];
        newPos = { lat: markerPos.lat, lng: markerPos.lng };
        marker.setPosition(newPos);
        // use line below if want to keep newPos centered
        // map.panTo(newPos);

      
      });

    }
  }
  xml.open("GET", url, true);
  xml.send(null);
}

function getMinMax(coords) {
  var min_max = [];

  var min = new Object;
  var max = new Object;

  min.lat = coords[0].lat;
  max.lat = coords[0].lat;
  min.lng = coords[0].lng;
  max.lng = coords[0].lng;

  for (var i = 0; i < coords.length; i++) {
    if (coords[i].lat > max.lat) { max.lat = coords[i].lat; }
    if (coords[i].lat < min.lat) { min.lat = coords[i].lat; }
    if (coords[i].lng > max.lng) { max.lng = coords[i].lng; }
    if (coords[i].lng < min.lng) { min.lng = coords[i].lng; }
  }
  min_max.push(min);
  min_max.push(max);
  return min_max;
}

function getCenter(coord_pair) {
  var center = new Object();

  center.lat = (coord_pair[0].lat + coord_pair[1].lat) / 2;
  center.lng = (coord_pair[0].lng + coord_pair[1].lng) / 2;

  return center;
}

function getZoomFactor(coord_pair) {
  var zm;
  var zoom_factor = 100 * Math.max((coord_pair[1].lat - coord_pair[0].lat), (coord_pair[1].lng - coord_pair[0].lng));

  if (zoom_factor < 1) { zm = 16; }
  else if (zoom_factor >= 1 && zoom_factor < 3) { zm = 15; }
  else if (zoom_factor >= 3 && zoom_factor < 5) { zm = 14; }
  else if (zoom_factor >= 5 && zoom_factor < 10) { zm = 13; }
  else if (zoom_factor >= 10 && zoom_factor < 20) {zm = 12; }
  else if (zoom_factor >= 20 && zoom_factor < 40) {zm = 11; }
  else if (zoom_factor >= 40 && zoom_factor < 68) {zm = 10; }
  else if (zoom_factor >= 68) { zm = 9; }

  return zm;
}

