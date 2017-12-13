var http = require('http');
var Static = require('node-static');
var WebSocketServer = new require('ws');
var scoresN;
var scoresC;
var scoresS = {};

// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);

    if (message.indexOf('scores') === -1) {
        for(var key in clients) {
            clients[key].send(message);
        }
    } else {
      scoresN = JSON.parse(message.replace('scores',''));
      console.log(scoresN);
      var fs = require('fs');
      scoresC = JSON.parse(fs.readFileSync('json/highscores.json', 'utf8'));
      console.log(scoresC);

      if (scoresN.panzer1 > scoresC.panzer1) {
          scoresS.panzer1 = scoresN.panzer1;
      } else {
          scoresS.panzer1 = scoresC.panzer1;
      }
      if (scoresN.panzer2 > scoresC.panzer2) {
          scoresS.panzer2 = scoresN.panzer2;
      } else {
          scoresS.panzer2 = scoresC.panzer2;
      }
        fs.writeFileSync('json/highscores.json', JSON.stringify(scoresS));
    }

  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});

console.log("Сервер запущен на порту 8081");