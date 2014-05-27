var express = require('express'),
    http = require('http');

var app = express();
var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);

var chat_room = io;

var username; // a temp variable to collect user's nickname from GET /

// A reusable User object to whole unique user nicknames
function User(name) {
  this.name = name;
}

/**
 * Chat room view
 *
 * if / is called, user will be Anonymous
 * if /nickname is passed, we can use it to identify user
 */
app.get('/*', function(req, res) {
  if (req.params[0]) // if nickname is passed
    username = req.params[0];
  else
    username = 'Anonymous';

  // show the chat room page
  res.sendfile(__dirname + '/public/index.html');
});


/**
 * chat room socket operations
 */
chat_room.sockets.on('connection', function(socket) {

  // new user with nickname created
  var user = new User(username);

  // Welcome message on entrance event
  var welcome_msg = 'Welcome to chat room ' + user.name;
  if (user.name == 'Anonymous')
    welcome_msg = 'Welcome to chat room. Append /nickname with url to display it with your chat.';

  // Socket events
  socket.emit('entrance', { message: welcome_msg });

  socket.on('disconnect', function() {
    chat_room.sockets.emit('exit', { message: '<strong>' + user.name + '</strong>' + ' has left the room.' });
  });

  socket.on('chat', function(data) {
    chat_room.sockets.emit('chat', { message: '<strong>' + user.name + '</strong>' + '#: ' + data.message });
  });

  chat_room.sockets.emit('entrance', { message: '<strong>' + user.name + '</strong>' + ' joined the chat room.' });
});
