var querystring = require('querystring');
var http = require('http');
var express = require('express')

var app = express()

app.get('/', function (req, res) {
  var req_options = {
    host: 'legacy.cafebonappetit.com',
    port: 80,
    path: '/api/2/menus?format=json&cafe=792,704,403',
    method: 'GET',
    headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
      }
  };

  http.request(req_options, function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      var menus = JSON.parse(str);
      var cafes = menus.days[0].cafes;

      var item_cafe_map = {};

      for(var cafe_id in cafes) {
        var floor_name = cafes[cafe_id].name;
        for(var j=0; j<cafes[cafe_id].dayparts[0].length; j++) {
          var daytime = cafes[cafe_id].dayparts[0][j].label;
          for(var k=0; k<cafes[cafe_id].dayparts[0][j].stations.length; k++)  {
            var station_name = cafes[cafe_id].dayparts[0][j].stations[k].label;
            for(var l=0; l<cafes[cafe_id].dayparts[0][j].stations[k].items.length; l++)  {
              var station = {
                floor: floor_name,
                daytime: daytime,
                station: station_name
              };

              item_cafe_map[cafes[cafe_id].dayparts[0][j].stations[k].items[l]] = station;
            }
          }
        }
      }

      var daytime_item_map = {};
      for(var item_id in menus.items) {
        var item = menus.items[item_id];
        item.floor = item_cafe_map[item_id].floor;
        item.daytime = item_cafe_map[item_id].daytime;
        item.station = item_cafe_map[item_id].station;

        if(Array.isArray(item.cor_icon)) {
          item.cor_icon = {};
        }

        if(daytime_item_map[item.daytime] == undefined) {
          daytime_item_map[item.daytime] = {};
          daytime_item_map[item.daytime][item.floor] = [item];
        } else {
          if(daytime_item_map[item.daytime][item.floor] == undefined) {
            daytime_item_map[item.daytime][item.floor] = [item];
          } else {
            daytime_item_map[item.daytime][item.floor].push(item);
          }
        }
      }

      res.json(daytime_item_map);
    });
  }).end();
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


