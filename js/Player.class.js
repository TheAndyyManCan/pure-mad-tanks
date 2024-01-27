'use strict';

const Tank = require("./Tank.class");

class Player {

    #id;
    #nickname;
    #playerState; // connected, named, ready, disconnected, winner, loser
    #tank;
    #mouseX;
    #mouseY;
    tankSpawned = false;

    constructor(id){
        this.#id = id;
    }

    get id(){return this.#id;}
    get nickname(){return this.#nickname;}
    get playerState(){return this.#playerState;}
    get tank(){return this.#tank;}
    get mouseX(){return this.#mouseX;}
    get mouseY(){return this.#mouseY;}

    setNickname(socketId, nickname){
        if(socketId == this.id){
            this.#nickname = nickname;
        }
    }

    setPlayerState(socketId, state){
        if(socketId == this.id){
            this.#playerState = state;
        }
    }

    spawnTank = (x, y, scale, world) => {
        this.#tank = new Tank(1.0, 0.5, 0.05, x, y, 100, 100, 'tank', this.#id + 'tank', scale, world, 'tank', this.#id);
    };

    moveTank = (keycode) => {
        this.#tank.moveTank(keycode);
    };

    updateMousePosition = (e) => {
        this.#mouseX = e.x;
        this.#mouseY = e.y;
    }
}

module.exports = Player;
