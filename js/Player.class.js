'use strict';

const { DynamicWorldObject } = require("./WorldObject.class");

class Player {

    #id;
    #nickname;
    #playerState; // connected, named, ready, disconnected
    #tank;
    tankSpawned = false;

    constructor(id){
        this.#id = id;
    }

    get id(){return this.#id;}
    get nickname(){return this.#nickname;}
    get playerState(){return this.#playerState;}
    get tank(){return this.#tank;}

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
        this.#tank = new DynamicWorldObject(1.0, 0.5, 0.05, x, y, 200, 200, 'tank', this.#nickname + 'tank', scale, world, 'tank');
    };
}

module.exports = Player;
