'use strict';

let socket = io();
let manifest = [
    {src: './assets/background.png', id: 'background'},
    {src: './assets/vBorder.png', id: 'vBorder'},
    {src: './assets/hBorder.png', id: 'hBorder'},
    {src: './assets/tank.png', id: 'tank'},
    {src: './assets/wall.png', id:'wall'},
    {src: './assets/rocket.png', id:'rocket'}
];

let activeWindow = {
    leftPadding : 200,
    topPadding : 200,
    rightPadding : 200,
    bottomPadding : 200
};

let viewport = new Viewport($('#viewport'), $('#easelCan'), 100, activeWindow);
let easel = new Easel('easelCan', manifest, 60, viewport);

socket.on('connection', () => {
    easel.playerID = socket.id;
});

socket.on('objdata', function(data){
    easel.drawB2DGraphics(data);
});

socket.on('spectatorWaiting', () => {
    $('#loginScreen').css('display', 'none');
    $('#spectatorWaitScreen').css('display', 'flex');
    $('#viewport').css({
        height: 2000,
        width: 2000
    })
});

socket.on('nicknameConfirm', () => {
    $('#loginScreen').css('display', 'none');
    $('#waitScreen').css('display', 'flex');
});

socket.on('playersReady', () => {
    $('#loginScreen').css('display', 'none');
    $('#waitScreen').css('display', 'none');
    $('#spectatorWaitScreen').css('display', 'none');
    $('#viewport').css('display', 'block');
    $('#easelCan').css('display', 'block');
});

socket.on('endGame', (data) => {
    if(data.winner == Easel.playerID){
        window.alert('You won!');
    } else if(data.loser == Easel.playerID){
        window.alert('You lose!');
    }

    $('#easelCan').css('display', 'none');
    $('viewport').css('display', 'none');
    $('#splashScreen').css('display', 'flex');
});

$('#nicknameForm').submit((e) => {
    e.preventDefault();
    if($('#nicknameInput').val()){
        socket.emit('nicknameEnter', $('#nicknameInput').val());
    }
});

/**
 * Control listeners
 */
$(document).keydown((e) => {
    socket.emit('keydown', e.keyCode);
});

$(document).keyup((e) => {
    socket.emit('keyup', e.keycode);
});

$('#easelCan').mousedown((e) => {
    console.log('hit');
    socket.emit('mousedown', e)
});

$('#splashScreen').click(function(e){
    socket.emit('connectClient');
    $('#splashScreen').css('display', 'none');
    $('#loginScreen').css('display', 'flex');
});

$('#easelCan').mousemove((e) => {
    let mousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
    socket.emit('mousemove', mousePosition);
});
