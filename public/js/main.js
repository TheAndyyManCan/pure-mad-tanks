'use strict';

let socket = io();
let manifest = [
    {src: './assets/background.png', id: 'background'},
    {src: './assets/vBorder.png', id: 'vBorder'},
    {src: './assets/hBorder.png', id: 'hBorder'},
    {src: './assets/tank.png', id: 'tank'}
];

let easel = new Easel('easelCan', manifest, 60);

socket.on('objdata', function(data){
    easel.drawB2DGraphics(data);
});

socket.on('nicknameConfirm', () => {
    $('loginScreen').css('display', 'hidden');
    $('waitScreen').css('display', 'flex');
})

socket.on('playersReady', () => {
    $('waitScreen').css('display', 'hidden');
    $('easelCan').css('display', 'block');
})

$('#nicknameForm').submit( (e) => {
    e.preventDefault();
    if($('#nicknameInput').val()){
        socket.emit('nicknameEnter', $('nicknameInput').val());
    }
});

/**
 * Control listeners
 */
$(document).keydown( (e) => {
    socket.emit('keydown', e);
});

$(document).keyup( (e) => {
    socket.emit('keyup', e);
});

$('#easelCan').mousedown( (e) => {
    socket.emit('mousedown', e)
});
