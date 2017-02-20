var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var clients = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.use('/', express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    /*socket.on('join', function (name) {
        clients[socket.id] = name;
        socket.emit('update', 'You have connected to the server');
        for(var room in socket.rooms) {
            io.sockets.in(room).emit("update-clients", clients);
            socket.in(room).broadcast("update", name + ' has joined the server');
        }
    });*/

    socket.on("send", function (msg) {
        for(var room in socket.rooms) {
            io.sockets.in(room).emit("chat", clients[room][socket.id], msg);
        }
    });

    socket.on("disconnect", function () {
        for(var room in socket.rooms) {
            io.sockets.in(room).emit("update", clients[room][socket.id] + ' has left the server');
            io.sockets.in(room).emit("update-clients", clients[room]);
        }
        delete clients[socket.id];
    });

    socket.on("room", function (roomname, name) {
        for(var room in socket.rooms) {
            socket.leave(room);
        }
        socket.join(roomname);
        if(clients[roomname] == null) {
            clients[roomname] = {};
        }
        clients[roomname][socket.id] = name;
        socket.in(roomname).emit("update", name + " has joined the server");
        io.sockets.in(roomname).emit("update-clients", clients[roomname]);
    });
});

http.listen(80, function () {
    console.log("Listening...");
});