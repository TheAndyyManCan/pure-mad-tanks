'use strict';

const { b2Vec2 } = require("box2dweb-commonjs");
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
        this.#tank = new DynamicWorldObject(1.0, 0.5, 0.05, x, y, 200, 200, this.#id + 'tank', this.#id + 'tank', scale, world, 'tank');
    };

    moveTank = (e) => {
        console.log(this.#tank.getBody().GetUserData());
        let x = 0;
        let y = 0;

        switch (e) {
            case 65:
                x = -5;
                break;
            case 68:
                x = 5;
                break;
            case 87:
                y = -5;
                break;
            case 83:
                y = 5;
                break;
        }

        // Apply the impulse to the tank body
        this.#tank.getBody().ApplyImpulse(new b2Vec2(x, y), this.#tank.getBody().GetWorldCenter());

        // Clamp the tank's velocity if necessary
        let maxVelocity = 5;
        let currentVelocity = this.#tank.getBody().GetLinearVelocity();
        if (currentVelocity.Length() > maxVelocity) {
            this.#tank.getBody().SetLinearVelocity(currentVelocity.Normalize().SelfMultiply(maxVelocity));
        }
    };
}

module.exports = Player;
