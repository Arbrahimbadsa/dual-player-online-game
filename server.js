const express = require('express');
const app = express();
const path = require('path');
// init scoket.io with express
const http = require('http');
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);


// server static files so that the server can access the files.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// serve the html page at '/' (root directory)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/main.html'));
});

// on a new connection
io.on('connection', (socket) => {
    // data flow => first a client comes > clicks on the button > client emits an event > 
    // sever listens on the event > server emits a new event > client listens on the event.
    // listen from client
    socket.on('posFromClient', data => {
        // broadcast to all clients including sender
        socket.broadcast.emit('dataFromServer', {sender: socket.id, data: {x: data.x, y: data.y}});
    });
});

// port
const port = 5000;
// app.listen will not work here cause http creates a new server
httpServer.listen(port, () => console.log(`Sever started at port ${port}`));