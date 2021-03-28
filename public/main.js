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
const setLogic = (senderId) => {
    const buttons = document.getElementsByClassName('gameButton');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => {
            socket.emit('updates', {sender: senderId, selected: i + 1});
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
// now if we are connected with player two
socket.on('player_one_got_player_two', playerTwoId => {
    socket.emit('player_two_got_player_one', playerTwoId);
});
// game starts for player two
socket.on('game_starts_for_player_two', playerOneId => {
    message.innerText = `Connected with ${playerOneId}`;
    socket.emit('player_one_got_player_two', playerOneId);
    createButtons(10);
    setLogic(playerOneId);
});
// game starts for player one
socket.on('game_starts_for_player_one', playerTwoId => {
    message.innerText = `Connected with ${playerTwoId}`;
    box.innerText = '';
    createButtons(10);
    setLogic(playerTwoId);
});
// game updates
socket.on('gameUpdates', (data) => {
    const update = `<p><b>${data.sender}: </b> clicked ${data.selected}</p>`;
    updates.innerHTML += update;
});
