// main socket instance
const socket = io();
// on connect (clinet side)
const box = document.getElementById('box');
const message = document.getElementById('message');
const updates = document.getElementById('updates');
const createButtons = (count) => {
    const p = document.getElementById('parent');
    for (let i = 0; i < count; i++) {
        const button = document.createElement('button');
        button.classList.add('gameButton');
        button.innerText = i + 1;
        p.append(button);
    }
}
const setLogic = (roomId) => {
    const buttons = document.getElementsByClassName('gameButton');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => {
            socket.emit('updates', {roomId: roomId, selected: i + 1});
        });
    }
}
// on connecting a new user.
socket.on('connect', () => {
    socket.emit('firstEntry', window.location.href);
});
// generate the invite id for player two to come
socket.on('inviteId', id => {
    //invite link
    message.innerText = 'Waiting for player two to join...';
    const url = `<p><b>Share your link: </b>http://localhost:5000/invite/${id}</p>`;
    box.innerHTML = url;
});
// game starts
socket.on('gameStarts', data => {
    message.innerText = `Connected with ${data.roomId === socket.id ? data.playerId : data.roomId}`;
    box.innerText = '';
    createButtons(10);
    setLogic(data.roomId);
});
// game updates
socket.on('gameUpdates', (data) => {
    if (data.sender !== socket.id) {
        const update = `<p><b>${data.sender}: </b> clicked ${data.selected}</p>`;
        updates.innerHTML += update;
    }
});
// if more than two people in one room
socket.on('sorry_babe', id => {
    message.innerText = 'Sorry babe, you may try some other room. There is no roam for you here.';
});
// if something goes wrong
socket.on('error', error => {
    message.innerText = error;
});