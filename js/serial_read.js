var n = 40, data = [0];

var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var max_x = 10;
var freq = 4;
var x = d3.scale.linear()
    .domain([0, max_x])
    .range([0, width]);

var max_y = 15;
var y = d3.scale.linear()
    .domain([0, max_y])
    .range([height, 0]);

var line = d3.svg.line()
    .x(function(d, i) { return x((i-1)/freq); })
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
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

// Plotting function
function update_plot(d) {

    // Re-scale y-axis if necessary
    if (d > max_y) {
        max_y = d*1.1;
        y.domain([0, max_y]);
        svg.select(".y").call(d3.svg.axis().scale(y).orient("left"));
    }

    // push a new data point onto the back
    data.push(d);
    if (data.length>=max_x*freq){
        max_x = max_x*1.5;
        x.domain([0, max_x]);
        svg.select(".x").call(d3.svg.axis().scale(x).orient("bottom"));
    }
  // redraw the line
    path
      .attr("d", line)
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

// Keep track of existing connection... deprecate this in favor of chrome.serial's built-in getConnections
var connections = [];
var connectCallback = function(connection) {
    connections[0] = {'id':connection.connectionId} ;
}

var onReceiveCallback = function(info) {

    str = ab2str(info.data);

    if ( (/\S/.test(str)) && (info.connectionId===connections[0].id) ) {
        if (!isNaN(Number(str))){
            update_plot(Number(str));
        }
    } else {
        var skip = true;
    }
}
