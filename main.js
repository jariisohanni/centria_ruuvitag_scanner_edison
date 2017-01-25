/*
 * Blank IoT Node.js starter app.
 *
 * Use this template to start an IoT Node.js app on any supported IoT board.
 * The target board must support Node.js. It is helpful if the board includes
 * support for I/O access via the MRAA and UPM libraries.
 *
 * https://software.intel.com/en-us/xdk/docs/lp-xdk-iot
 */

// spec jslint and jshint lines for desired JavaScript linting
// see http://www.jslint.com/help.html and http://jshint.com/docs
/* jslint node:true */
/* jshint unused:true */
var request = require('request');
var EddystoneBeaconScanner = require('eddystone-beacon-scanner');
var YOUR_TOKEN = "";
EddystoneBeaconScanner.on('found', function(beacon) {
 // console.log('found Eddystone Beacon:\n', JSON.stringify(beacon, null, 2));
});

EddystoneBeaconScanner.on('updated', function(beacon) {
//  console.log('updated Eddystone Beacon:\n', JSON.stringify(beacon, null, 2));

    var dataRes;

    if(beacon.url.indexOf("https://ruu.vi/#") === 0 && beacon.url.indexOf("#") > 0)
     dataRes = beacon.url.substring("https://ruu.vi/#".length);
    if(beacon.url.indexOf("https://r/") === 0)
     dataRes = beacon.url.substring("https://r/".length);

    if(dataRes !== undefined)
    {
       //  console.log("Ruuvitag data:" + dataRes);

        var pData;
        try {
    pData=  Buffer.from(dataRes, 'base64');
  } catch (err) {
    pData =  new Buffer(dataRes, 'base64');
  }


        var humidity = (pData[1])*0.5;
        var uTemp = (((pData[2] & 127) << 8) | pData[3]);
       var tempSign = (pData[2] >> 7) & 1;
        var temp = tempSign === 0.00 ? uTemp / 256.0 : -1.00 * uTemp / 256.0;
        var air_pressure = ((pData[4] << 8) + pData[5]) + 50000;
         air_pressure /= 100.00;

       // console.log("air_pressure:" + air_pressure);
    //    console.log("humidity:" + humidity);
      //  console.log("temp:" + temp);

        request.post
        (
        'http://things.ubidots.com/api/v1.6/devices/'+beacon.id+'/?token='  + YOUR_TOKEN,
            { json: { temp: temp, air_pressure: air_pressure, humidity: humidity } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  //  console.log(body);
                }
            }
        );
    }
});

EddystoneBeaconScanner.on('lost', function(beacon) {
 // console.log('lost Eddystone beacon:\n', JSON.stringify(beacon, null, 2));
});

EddystoneBeaconScanner.startScanning(true);
