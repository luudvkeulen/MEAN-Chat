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
        io.emit('update', 'You have connected to the server');
        io.sockets.emit("update", name + ' has joined the server');
    });

    socket.on("send", function (msg) {
        io.sockets.emit("chat", clients[socket.id], msg);
    });

    socket.on("disconnect", function () {
        io.sockets.emit("update", clients[socket.id] + ' has left the server');
        delete clients[socket.id];
    });
});

http.listen(80, function () {
    console.log("Listening...");
});