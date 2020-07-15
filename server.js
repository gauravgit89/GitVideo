const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8080;

app.get('/',(req,res) => res.send("Hello"));

app.use(express.static(__dirname + "/build"));

app.get("/", (req, res, next) => {
    res.sendFile(__dirname + "/build/index.html")
})

const peers = io.of("/webrtcPeer");

let connectedPeers = new Map();

io.on("connection", function(socket){
    console.log(socket);
    socket.emit("connection-success", {success : socket.id});

    connectedPeers.set(socket.id, socket);

    socket.on("disconnect", () => {
        console.log("disconnected");
        connectedPeers.delete(socket.id);
    })

    socket.on("offerOrAnswer", (data) => {
        console.log("offeroranswer");
        console.log(data);
        for(const [socketID, socket] of connectedPeers.entries()){
            if(socketID!=data.socketID)
            {
                socket.emit("offerOrAnswer", data.payload);
            }
        }
    })

    socket.on("candidate", (data) => {
        console.log("candidate");
        console.log(data);
        for(const [socketID, socket] of connectedPeers.entries()){
            if(socketID!=data.socketID)
            {
                socket.emit("candidate", data.payload);
            }
        }
    })
})

http.listen(port, () => console.log("example app"));


