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
        this.#tank = new DynamicWorldObject(1.0, 0.5, 0.05, x, y, 200, 200, 'tank', this.#nickname + 'tank', scale, world, 'tank');
    };

    moveTank = (e) => {
        let x = 0;
        let y = 0;

        switch(e){
            case 65:
                x = -1;
                break;
            case 68:
                x = 1;
                break;
            case 87:
                y = -1;
                break;
            case 83:
                y = 1;
                break;
        }

        console.log('keycode: ' + e);
        console.log('x: ' + x);
        console.log('y: ' + y);

        this.#tank.getBody().ApplyImpulse(new b2Vec2(x, y), this.#tank.getBody().GetWorldCenter());

        if(this.#tank.getBody().GetLinearVelocity().x > 5){
            this.#tank.getBody().SetLinearVelocity(5, this.#tank.getBody().GetLinearVelocity().y);
        }

        if(this.#tank.getBody().GetLinearVelocity().x < -5){
            this.#tank.getBody().SetLinearVelocity(-5, this.#tank.getBody().GetLinearVelocity().y);
        }

        if(this.#tank.getBody().GetLinearVelocity().y > 5){
            this.#tank.getBody().SetLinearVelocity(this.#tank.getBody().GetLinearVelocity().x, 5);
        }

        if(this.#tank.getBody().GetLinearVelocity().y < -5){
            this.#tank.getBody().SetLinearVelocity(this.#tank.getBody().GetLinearVelocity().x, -5);
        }
    };
}

module.exports = Player;
