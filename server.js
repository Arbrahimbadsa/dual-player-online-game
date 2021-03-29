const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
// init scoket.io with express
const http = require('http');
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);


// body parser
app.use(bodyParser.urlencoded({extended: true}));

// server static files so that the server can access the files.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// serve the html page at '/' (root directory)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/main.html'));
});

// invite link route
app.get('/invite/:id', (req, res) => {
    const inviteId = req.params.id;
    res.sendFile(path.join(__dirname, 'views/main.html'));
});
// on a new connection
io.on('connection', (socket) => {
    socket.on('firstEntry', data => {
        const idExists = data.split('/').length > 4;
        if (idExists) {
            try {
                // this is the room name or room id which will be used to create communicaion
                // with two players
                const id = data.split('/')[data.split('/').length - 1];
                const maximumPlayers = io.sockets.adapter.rooms.get(id).size;
                // let's allow two players in a room.
                if (maximumPlayers < 2) {
                    // add the new player in the room.
                    socket.join(id);
                    // emit the room id.
                    io.to(id).emit('gameStarts', {playerId: socket.id, roomId: id});
                } else {
                    socket.emit('sorry_babe', socket.id);
                }
            } catch (error) {
                socket.emit('error', 'Ok kiddo!');
            }  
        } else {
            // no id exists means this is the first player.
            // emit the first player id.
            socket.emit('inviteId', socket.id);
        }
    });
    socket.on('updates', data => {
        io.to(data.roomId).emit('gameUpdates', {sender: socket.id, selected: data.selected});
    });
});

// port
const port = 5000;
// app.listen will not work here cause http creates a new server
httpServer.listen(port, () => console.log(`Sever started at port ${port}`));