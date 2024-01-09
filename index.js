'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { b2Vec2 } = require('box2dweb-commonjs');
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
            if(isPlayer && !game.pause){
                game.endGame();
                for(let i in connections){
                    connections[i].emit('endgame');
                }
            }
            game.removePlayer(socket.id);
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
            if(!game.pause && isPlayer){
                player.tank.shootRocket(game.scale, game.world, player.mouseX, player.mouseY);
            }
        });

        socket.on('mousemove', (e) => {
            if(!game.pause && isPlayer){
                player.updateMousePosition(e);
            }
        });

    });
});

/**
 * Collision logic
 */
game.contactListener.BeginContact = (contact) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    if(fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id != 'tank'){
        fixa.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixa);
    }

    if(fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id != 'tank'){
        fixb.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixb);
    }

    if((fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixb.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {
                game.destroyObject(tankPlayer.tank.getBody());
            }
            game.destroyObject(fixa);
        }
        console.log(tankPlayer.tank.getBody().GetUserData());
    }

    if((fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixa.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {
                game.destroyObject(tankPlayer.tank.getBody());
            }
            game.destroyObject(fixb);
        }
        console.log(tankPlayer.tank.getBody().GetUserData());
    }
};

game.contactListener.EndContact = (contact) => {

};

game.contactListener.PreSolve = (contact, Impulse) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    if((fixa.GetUserData().id === 'tank' && fixb.GetUserData().id === 'rocket') || (fixa.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player === fixb.GetUserData().player)){
        contact.SetEnabled(false);
    }
};

game.contactListener.PostSolve = (contact, oldManifest) => {

};
