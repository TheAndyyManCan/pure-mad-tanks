'use strict';

class Player {

    #id;
    #nickname;
    #playerState; // connected, named, ready, disconnected
    tankSpawned = false;

    constructor(id){
        this.#id = id;
    }

    get id(){return this.#id;}
    get nickname(){return this.#nickname;}
    get playerState(){return this.#playerState;}

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
}

module.exports = Player;
