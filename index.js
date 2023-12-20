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

let game = new PureMadTanks(2000, 2000, 30, 0, 0, 60, io, 10);

http.listen(8000, function(){

    console.log('server up on *:8000');

    io.on('connection', (socket) => {

        let player = new Player(socket.id);
        let isPlayer = game.addPlayer(player);
        connections.push(socket);

        socket.on('disconnect', () => {
            game.removePlayer(socket.id);
            if(isPlayer && !game.pause){
                game.endGame();
                game.removePlayer(socket.id);
                for(let i in connections){
                    connections[i].emit('endgame');
                }
            }
        });

        if(game.pause){
            if(isPlayer){
                socket.on('nicknameEnter', (nickname) => {
                    player.setNickname(socket.id, nickname);
                    player.setPlayerState(socket.id, 'ready');
                    socket.emit('nicknameConfirm');
                    if(game.checkPlayerStatus()){
                        for(let i in connections){
                            connections[i].emit('playersReady');
                        }
                        game.init();
                        game.pause = false;
                    }
                });
            } else {
                socket.emit('spectatorWaiting');
            }
        } else {
            socket.emit('playersReady');
        }

        socket.on('keydown', (e) => {
            if(!game.pause && isPlayer){
                player.moveTank(e);
            }
        });

        socket.on('keyup', (e) => {
            // Handle key up in PureMadTanks class
        });

        socket.on('mousedown', (e) => {
            // Handle mouse press
        });

        socket.on('mousemove', (e) => {
            // Handle mouse move
        });

    });
});
