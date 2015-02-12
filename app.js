var express = require('express');
var path = require('path');
var app = express();
var router = express.Router();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// router.use(express.static(__dirname + '/public'));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.use(express.static(__dirname + '/public'));
}


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var message = "hi";
  socket.on('game', function(data){
  	console.log(data);
  });
  
    io.emit('ping', message);
  socket.on('chat message', function(msg){
    var msg = "hi";
    io.emit('chat message', msg);
  });
});

server.listen(process.env.PORT || 3000);

