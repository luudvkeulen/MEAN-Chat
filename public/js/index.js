$(document).ready(function () {
    var socket = io();

    $("#nickname").focus();

    $("form").submit(function (event) {
        event.preventDefault();
    });

    $("#join").click(function () {
        setName();
    });

    $("#nickname").keypress(function (e) {
        if (e.which == 13) {
            setName();
        }
    });

    $("#room").keypress(function (e) {
        if (e.which == 13) {
            var roomname = $("#room").val();
            joinRoom(roomname);
        }
    });

    $("#join-room").click(function () {
        var roomname = $("#room").val();
        joinRoom(roomname, false);
    });

    $("#create-room").click(function () {
        createRoom();
    });

    function setName() {
        var name = $("#nickname").val();
        if (name != "") {
            $("#nickname-div").hide();
            $("#room-div").show();
            $("#room").focus();
        } else {
            $(".nicknamerror").css("display", "block");
        }
    }

    function joinRoom(roomname, create) {
        if (roomname != "") {
            var name = $("#nickname").val();
            socket.emit("room", roomname, name, create);
        } else {
            $(".roomerror").css("display", "block");
        }
    }

    function createRoom() {
        var roomname = makeid(12);
        joinRoom(roomname, true);
    }

    socket.on("chat", function (who, msg) {
        $("#messagelist").append("<li><b>" + who + "</b>: " + msg + "</li>");
        $('#messagelist').animate({scrollTop: $('#messagelist').prop("scrollHeight")}, 500);
    });

    $("#send").click(function () {
        sendMessage();
    });

    $("#message").keypress(function (e) {
        if (e.which == 13) {
            sendMessage();
        }
    });

    function sendMessage() {
        var msg = $("#message").val();
        socket.emit("send", msg);
        socket.emit("typing", false);
        $("#message").val("");
    }

    socket.on("update", function (msg) {
        $("#messagelist").append("<li class='update'>" + msg + "</li>");
        $('#messagelist').animate({scrollTop: $('#messagelist').prop("scrollHeight")}, 500);
    });

    socket.on("update-clients", function (clients) {
        $("#clientslist").empty();
        $.each(clients, function (clientid, name) {
            if (clientid != socket.id) {
                $('#clientslist').append("<li>" + name + "</li>");
            }
        });
        $('#clientslist').animate({scrollTop: $('#clientslist').prop("scrollHeight")}, 500);
    });
    
    socket.on("roomnotfound", function () {
        $(".roomnotfound").css("display", "block");
    });

    socket.on("joinroom", function (roomname) {
        $("#room-div").detach();
        $("#chat-div").show();
        $("#message").focus();
        $(".roomid").append(roomname);
    });

    function makeid(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
});