'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PureMadTanks = require('./js/PureMadTanks.class.js');

app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/assets', express.static(__dirname + '/public/assets'));

let game = new PureMadTanks(2000, 2000, 30, 0, 0, 60, 'easelCan');
game.init();

http.listen(8000, function(){
    console.log('server up on *:8000');
    io.on('connection', function(socket){
        connections.push(socket);
    });
});
