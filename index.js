'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PureMadTanks = require('./js/PureMadTanks.class.js');
const Player = require('./js/Player.class');

let connections = [];

app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/assets', express.static(__dirname + '/public/assets'));

let game = new PureMadTanks(2000, 2000, 30, 0, 0, 60, io);

http.listen(8000, function(){
    console.log('server up on *:8000');
    io.on('connection', (socket) => {
        connections.push(socket);
        let player = new Player(socket.id);
        game.addPlayer(player);

        socket.on('disconnect', () => {
            game.removePlayer(socket.id);
        });

        socket.on('nicknameEnter', (nickname) => {
            player.setNickname(socket.id, nickname);
            player.setPlayerState(socket.id, 'ready');
            socket.emit('nicknameConfirm');
            if(game.checkPlayerStatus()){
                for(let i in connections){
                    connections[i].emit('playersReady');
                }
                game.init();
                game.setPause(false);
            }
        });

    });
});
