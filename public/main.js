// main socket instance
const socket = io();
// on connect (clinet side)
socket.on('connect', () => {
    console.log(socket.id);
});
const box = document.getElementById('box');
// on newuser
socket.on('dataFromServer', (data) => {
    const pos = data.data;
    // update data for other players
    box.style.left = pos.x + 'px';
    box.style.top = pos.y + 'px';
    console.log(pos);
});

window.onmousemove = (e) => {
    const pos = {x: e.clientX, y: e.clientY};
    // update the client
    box.style.left = pos.x + 'px';
    box.style.top = pos.y + 'px';
    socket.emit('posFromClient', pos);
}