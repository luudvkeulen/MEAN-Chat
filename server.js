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
    socket.on("send", function (msg) {
        for (var room in socket.rooms) {
            io.sockets.in(room).emit("chat", clients[room][socket.id], msg);
        }
    });

    socket.on("disconnect", function () {
        for(var room in clients) {
            if(typeof clients[room][socket.id] != 'undefined') {
                io.sockets.in(room).emit("update", clients[room][socket.id] + ' has left the server');
                delete clients[room][socket.id];
                io.sockets.in(room).emit("update-clients", clients[room]);
            }
        }
    });

    socket.on("room", function (roomname, name, create) {
        for (var room in socket.rooms) {
            socket.leave(room);
        }

        if(!create && containsObject(roomname, io.sockets.adapter.rooms) === false) {
            socket.emit("roomnotfound");
            return;
        }
            socket.join(roomname);

        if (clients[roomname] == null) {
            clients[roomname] = {};
        }

        socket.emit("joinroom", roomname);
        clients[roomname][socket.id] = name;
        socket.in(roomname).emit("update", name + " has joined the server");
        io.sockets.in(roomname).emit("update-clients", clients[roomname]);
    });
});

function containsObject(obj, list) {
    for (var object in list) {
        if(object === obj) {
            return true;
        }
    }

    return false;
}

http.listen(80, function () {
    console.log("Listening...");
});