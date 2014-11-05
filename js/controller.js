var connected = false;

// Add a listener on the connection button
$("#connected-button").click(function(){

    var serial_selection = $('input[name="graph1"]:checked').val()

    // Open/close a connection
    if (connected==false){
        chrome.serial.connect(serial_selection, {bitrate:57600, name:serial_selection}, connectCallback);
        chrome.serial.onReceive.addListener(onReceiveCallback);

        $("#control-panel input:radio").attr('disabled',true);
    } else {
        // Check if the connection is already open
        var closeConn = function(connlist) {
            var connections = connlist;
            var connection  = connections.filter(function(c) {
                return c.name==serial_selection;
            });
            chrome.serial.disconnect(connection[0].connectionId, function(response){
                console.log(response);
            });
        }
        chrome.serial.getConnections(closeConn);
        $("#control-panel input:radio").attr('disabled',false);
    }

    // Switch text of connection button
    if (connected==true){
        $("#connected-button").html("Connect");
        connected = false;
    } else {
        $("#connected-button").html("Disconnect");
        connected = true;
    }
});


$("#freq-input").change(function(){
    new_freq = $(this).val();
    if (new_freq!="") {
        freq = Number(new_freq);
    } else {
        $(this).val(freq);
    }
});

$("#xlim-input").change(function(){
    new_max_x = $(this).val();
    if (new_max_x!="") {
        max_x = Number(new_max_x);
        x.domain([0, max_x]);
        svg.select(".x").call(d3.svg.axis().scale(x).orient("bottom"));
    } else {
        $(this).val(max_x);
    }
});
