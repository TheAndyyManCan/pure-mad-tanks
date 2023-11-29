'use strict';

let socket = io();
let manifest = [
    {src: './assets/background.png', id: 'background'},
    {src: './assets/vBorder.png', id: 'vBorder'},
    {src: './assets/hBorder.png', id: 'hBorder'}
];

let easel = new Easel('easelCan', manifest, 60);

socket.on('objdata', function(data){
    easel.drawB2DGraphics(data);
})
