var express = require('express'),
    http = require('http');

var app = express();
var server = http.createServer(app);
server.listen(3000);
var io = require('socket.io').listen(server);

var chat_room = io;

var username;
function User(name) {
  this.name = name;
}

app.get('/*', function(req, res) {
  if (req.params[0])
    username = req.params[0];
  else
    username = 'Anonymous';
  res.sendfile(__dirname + '/public/index.html');
});

chat_room.sockets.on('connection', function(socket) {
  var user = new User(username);

  var welcome_msg = 'Welcome to chat room ' + user.name;
  if (user.name == 'Anonymous')
    welcome_msg = 'Welcome to chat room. Append /yourname to display your name.';
  socket.emit('entrance', { message: welcome_msg });

  socket.on('disconnect', function() {
    chat_room.sockets.emit('exit', { message: '<strong>' + user.name + '</strong>' + ' has left the room.' });
  });

  socket.on('chat', function(data) {
    chat_room.sockets.emit('chat', { message: '<strong>' + user.name + '</strong>' + '#: ' + data.message });
  });

  chat_room.sockets.emit('entrance', { message: '<strong>' + user.name + '</strong>' + ' joined the chat room.' });
});
