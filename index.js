'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { b2Vec2 } = require('box2dweb-commonjs');
const PureMadTanks = require('./js/PureMadTanks.class.js');
const Player = require('./js/Player.class');
const { b2WorldManifold } = require('./js/defs');

let connections = [];

app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// Create a new instance of the pure mad tanks class
let game = new PureMadTanks(2000, 2000, 30, 0, 0, 60, io, 10);

// Set the server to listen on port 8000
http.listen(8000, function(){

    io.on('connection', (socket) => {

        // Create a new player instance and add to the players or spectators array in the PureMadTanks class
        let player = new Player(socket.id);
        let isPlayer = game.addPlayer(player);
        // Add the new socket to the connections array
        connections.push(socket);
        // Send a signal to the client that a player has connected
        socket.emit('connection');

        // Handles player disconnections
        socket.on('disconnect', () => {
            if(isPlayer && !game.pause){    // Check if the game is currently paused
                game.endGame();
                // Send signal to end game on all connections
                for(let i in connections){
                    connections[i].emit('endGame');
                }
            }
            game.removePlayer(socket.id);
        });

        socket.on('connectClient', () => {
            if(game.pause){
                if(isPlayer){
                    // Set the player's nickname and change the player state to ready
                    socket.on('nicknameEnter', (nickname) => {
                        player.setNickname(socket.id, nickname);
                        player.setPlayerState(socket.id, 'ready');
                        socket.emit('nicknameConfirm');
                        if(game.checkPlayerStatus()){   // Check all players are ready
                            // If all players are ready, begin the game
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
        });

        // Handle the keydown event and move the player's tank
        socket.on('keydown', (e) => {
            if(!game.pause && isPlayer){
                player.moveTank(e);
            }
        });

        // When a mousedown event occurs, shoot a rocket from the player's tank
        socket.on('mousedown', (e) => {
            if(!game.pause && isPlayer){
                player.tank.shootRocket(game.scale, game.world, player.mouseX, player.mouseY);
            }
        });

        // Update the mouse position whenever a player moves their mouse on the canvas
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
    let fixaId = fixa.GetUserData().id;
    let fixbId = fixb.GetUserData().id;

    /* Destroy the rocket if it hits anything other than a tank
     * This stops rockets flying around the map */
    if(fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id != 'tank'){
        fixa.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixa);
    }

    if(fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id != 'tank'){
        fixb.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixb);
    }

    /* Listen for a rocket to hit a tank that doesn't belong to the player on this connection
     * Reduce the health of the tank that is hit if it does not belong to the player */
    if((fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixb.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {    // If the hit brings the tank's health below zero, the game ends
                game.destroyObject(tankPlayer.tank.getBody());
                game.endGame(tankPlayer.id);
            }
            game.destroyObject(fixa);
        }
    }

    if((fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixa.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {    // If the hit brings the tank's health below zero, the game ends
                game.destroyObject(tankPlayer.tank.getBody());
                game.endGame(tankPlayer.id);
            }
            game.destroyObject(fixb);
        }
    }

    /* If a rocket hits a destructible wall, we need to figure out where this has hit in relation to the game world
     * We create and initialize a worldManifold to do this
     * We then add the wall to the wall queue in the Game class so the wall can be split */
    if(fixaId === "rocket" && fixbId === "wall"){
        let worldManifold = new b2WorldManifold();
        worldManifold.Initialize(contact.GetManifold(), fixa.m_xf, contact.GetFixtureA().GetShape().radius, fixb.m_xf, contact.GetFixtureB().GetShape().radius);
        let contactPoint = new b2Vec2(worldManifold.m_points[0].x * game.scale, worldManifold.m_points[0].y * game.scale);
        let wall = game.findWall(fixb.GetUserData().uniqueName);
        game.addToWallSplitQueue(wall, contactPoint);
    }

    if(fixbId === "rocket" && fixaId === "wall"){
        let worldManifold = new b2WorldManifold();
        worldManifold.Initialize(contact.GetManifold(), fixa.m_xf, contact.GetFixtureA().GetShape().radius, fixb.m_xf, contact.GetFixtureB().GetShape().radius);
        let contactPoint = new b2Vec2(worldManifold.m_points[0].x * game.scale, worldManifold.m_points[0].y * game.scale);
        let wall = game.findWall(fixa.GetUserData().uniqueName);
        game.addToWallSplitQueue(wall, contactPoint);
    }
};

game.contactListener.EndContact = (contact) => {

};

game.contactListener.PreSolve = (contact, Impulse) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    // Turn off collisions between a rocket and the tank it is being fired from
    if((fixa.GetUserData().id === 'tank' && fixb.GetUserData().id === 'rocket') || (fixa.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player === fixb.GetUserData().player)){
        contact.SetEnabled(false);
    }
};

game.contactListener.PostSolve = (contact, oldManifest) => {

};
