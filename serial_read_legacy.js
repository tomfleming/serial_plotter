var n = 40,
    data1 = [0],
    data2 = [0];

var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, n - 1])
    .range([0, width]);

var max_y = 15;

var y = d3.scale.linear()
    .domain([0, max_y])
    .range([height, 0]);

var line = d3.svg.line()
    .x(function(d, i) { return x((i-1)/4); })
    .y(function(d, i) { return y(d); });

var svg = d3.select("#graph1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));

svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(data1)
    .attr("class", "line")
    .attr("d", line);

var y1 = d3.scale.linear()
    .domain([0, 40])
    .range([height, 0]);

var line1 = d3.svg.line()
    .x(function(d, i) { return x((i-1)/4); })
    .y(function(d, i) { return y1(d); })

var svg2 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg2.append("defs").append("clipPath")
    .attr("id", "clip2")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y1(0) + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));

svg2.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y1).orient("left"));

var path2 = svg2.append("g")
    .attr("clip-path", "url(#clip2)")
  .append("path")
    .datum(data2)
    .attr("class", "line")
    .attr("d", line1);

// Plotting function
function plot1(d1) {

  // Re-scale y-axis if necessary
  if (d1 > max_y) {
      max_y = d1*1.1;
      y.domain([0,max_y]);
      svg.select(".y").call(d3.svg.axis().scale(y).orient("left"));
  }

  // push a new data point onto the back
  data1.push(d1);
    if (data1.length==350){
        data1.shift();
    }
  // redraw the line
  path
      .attr("d", line)
      .attr("transform", null)
      .transition()
      .duration(500)
      .ease("linear")
}

function plot2(d2) {

  // push a new data point onto the back
  data2.push(d2);
  if (data2.length==350){
      data2.shift();
  }

  // redraw the line
  path2
      .attr("d", line1)
      .attr("transform", null)
      .transition()
      .duration(500)
      .ease("linear")
}


/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};


// List all available serial devices
var radioTag = function(value) {
    return '<input type="radio" name="graph1" value="' + value + '">' + value + '<br>'
}

var onGetDevices = function(ports) {
  for (var i=0; i<ports.length; i++) {
    $("#device-list").append(radioTag(ports[i].path));
  }
}
chrome.serial.getDevices(onGetDevices);


// Connect
var connections = [];
var connectCallback = function(connection) {
    connections.push(connection.connectionId);
}

var onReceiveCallback = function(info) {

    str = ab2str(info.data);

    if ( (/\S/.test(str)) && (info.connectionId===connections[0]) ) {
        if (!isNaN(Number(str))){
            plot1(Number(str));
        }
    } else if ( (/\S/.test(str)) && (info.connectionId===connections[1]) ){
        plot2(Number(str));
    } else {
        var skip = true;
    }
}

// Connect to serial device
// chrome.serial.connect("/dev/tty.usbserial-A7006SqO", {bitrate: 57600}, connectCallback);
// chrome.serial.connect("/dev/tty.usbserial-A7006SqO", {bitrate: 57600}, connectCallback);
// chrome.serial.onReceive.addListener(onReceiveCallback);
