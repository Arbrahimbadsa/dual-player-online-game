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
let playerAllowed = true;
// on a new connection
io.on('connection', (socket) => {
    socket.on('firstEntry', data => {
        const idExists = data.split('/').length > 4;
        if (idExists) {
            const id = data.split('/')[data.split('/').length - 1]; // player one id.
            // we emit to player one that we have got player two.
            // this socket.id is the id of the new user who got the link from player one.
            // emit this player id
            // however only two players in a room is allowed
            if (playerAllowed) {
                // let me in..
                socket.to(id).emit('player_one_got_player_two', socket.id);
            } else {
                // sorry babe, you may try some other room
                socket.emit('sorry_babe', socket.id);
            }
        } else {
            // no id exists means this is the first player.
            // emit the first player id.
            socket.emit('inviteId', socket.id);
            playerAllowed = true;
        }
    });
    socket.on('player_two_got_player_one', playerTwoId => {
        // let player two know that now it's time to play.
        socket.to(playerTwoId).emit('game_starts_for_player_two', socket.id);
        playerAllowed = false;
    });
    socket.on('player_one_got_player_two', playerOneId => {
        // let player one know game has started for player two and prepare player first two start
        socket.to(playerOneId).emit('game_starts_for_player_one', socket.id);
    });
    socket.on('updates', data => {
        io.to(data.sender).emit('gameUpdates', {sender: socket.id, selected: data.selected});
    });
});

// port
const port = 5000;
// app.listen will not work here cause http creates a new server
httpServer.listen(port, () => console.log(`Sever started at port ${port}`));