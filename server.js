var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var clients = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.use('/css', express.static(__dirname + '/public/css'));

io.on('connection', function (socket) {
    socket.on('join', function (name) {
        clients[socket.id] = name;
        io.emit('chat message', name + ' has joined');
        console.log(name + ' has joined');
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function () {
        io.emit('chat message', 'An user disconnected');
    });
});

http.listen(80, function () {
    console.log("Listening...");
});