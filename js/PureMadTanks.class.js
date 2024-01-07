'use strict';

const Game = require('./Game.class.js');
const Wall = require('./Wall.class');
const { StaticWorldObject, DynamicWorldObject, CircleWorldObject } = require('./WorldObject.class');

class PureMadTanks extends Game {

    #borders = [];
    #players = [];
    #spectators = [];
    #walls = [];
    #numberOfWalls;

    constructor(height, width, scale, gravityX, gravityY, framerate, io, numberOfWalls){
        super(height, width, scale, gravityX, gravityY, framerate, io);
        this.#numberOfWalls = numberOfWalls;
    }

    get players(){return this.#players;}

    init = () => {
        this.#spawnAllObjects();
        this._interval = setInterval(() => {
            this.update();
        }, 1000/this._framerate);
    };

    _gameLogic = () => {
        for(let i in this.#players){
            this.#players[i].tank.decelerateTank();
        }
    };

    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this._world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    #spawnAllObjects = () => {
        // Spawn borders for the map
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), 0, this._width, 10, 'hBorder', 'topBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), this._height, this._width, 10, 'hBorder', 'bottomBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, this._width, (this._height / 2), 10, this._height, 'vBorder', 'rightBorder', 0, this._scale, this._world, 'vBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, 0, (this._height / 2), 10, this._height, 'vBorder', 'leftBorder', 0, this._scale, this._world, 'vBorder'));

        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), (this._height * 0.375), (this._width / 8) + 10, 10, 'hBorder', 'innerTopBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), (this._height * 0.625), (this._width / 8) + 10, 10, 'hBorder', 'innerBottomBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width * 0.375), (this._height / 2), 10, (this._height / 8) + 10, 'vBorder', 'innerLeftBorder', 0, this._scale, this._world, 'vBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width * 0.625), (this._height / 2), 10, (this._height / 8) + 10, 'vBorder', 'innerRightBorder', 0, this._scale, this._world, 'vBorder'));

        // Spawn destructible walls
        for(let i = 0; i < this.#numberOfWalls; i++){

            let chance = Math.random();
            let angle = 0;
            let x = (Math.random() * this._width);
            let y = (Math.random() * this._height);

            // 50% chance to vertical or horizontal
            if(chance > 0.5){
                angle = 1.571; // 180 degrees in radians
            }

            while ((x > this._width * 0.375 && x < this._width * 0.625) && (y > this._height * 0.375 && y < this._height * 0.625)){
                x = (Math.random() * this._width);
                y = (Math.random() * this._height);
            }

            this.#walls.push(new Wall(1.0, 0.5, 0.05, x, y, ((Math.random() * 500) + 100), 10, angle, 'wall', 'wall' + i, this._scale, this._world, 'wall'));

        }

        // Spawn a tank for each player
        for(let i in this.#players){
            let x = (Math.random() * this._width);
            let y = (Math.random() * this._height);
            // Check that tank isn't spawning in the middle square
            // TODO: Add logic for not spawning on same pixel as destructible walls
            while ((x > this._width * 0.375 && x < this._width * 0.625) && (y > this._height * 0.375 && y < this._height * 0.625)){
                x = (Math.random() * this._width);
                y = (Math.random() * this._height);
            }
            this.#players[i].spawnTank(x, y, this._scale, this._world);
        }

    };

    #destroyAllObjects = () => {
        for(let i in this.#borders){
            this._destroyList.push(this.#borders[i].getBody());
        }
        for(let i in this.#walls){
            this._destroyList.push(this.#walls[i].getBody());
        }
        for(let i in this.#players){
            this._destroyList.push(this.#players[i].tank.getBody());
        }
    }

    _drawDomObjects = () => {
        let ret = [];
        for(let i = this._world.GetBodyList(); i; i = i.GetNext()){
            for(let j = i.GetFixtureList(); j; j = j.GetNext()){
                let id = j.GetBody().GetUserData().uniqueName;
                let width = j.GetBody().GetUserData().width;
                let height = j.GetBody().GetUserData().height;
                let x = j.GetBody().GetPosition().x * this._scale;
                let y = j.GetBody().GetPosition().y * this._scale;
                let r = j.GetBody().GetAngle() * (180/Math.PI);
                let assetID = j.GetBody().GetUserData().assetID;
                let uniqueName = j.GetBody().GetUserData().uniqueName;
                let destroyed = false;

                // Check if the item is in the destroy list
                for(let k in this._destroyList){
                    if(uniqueName === this._destroyList[k].GetUserData().uniqueName){
                        destroyed = true;
                        break;
                    }
                }

                ret.push({
                    id: id,
                    uniqueName: uniqueName,
                    width: Math.floor(width),
                    height: Math.floor(height),
                    x: Math.floor(x),
                    y: Math.floor(y),
                    r: Math.floor(r),
                    assetID: assetID,
                    destroyed: destroyed
                });
            }
        }

        return ret;
    };

    addPlayer = (player) => {
        if(this.#players.length < 2){
            this.#players.push(player);
            return true;
        } else {
            this.#spectators.push(player);
            return false;
        }
    };

    removePlayer = (id) => {
        let found = false;
        for(let i in this.#players){
            if(id == this.#players[i].id){
                this.#players.splice(i, 1);
                found = true;
                break;
            }
        }
        if(!found){
            for(let j in this.#spectators){
                if(id == this.#spectators[j].id){
                    this.#spectators.splice(j, 1);
                    break;
                }
            }
        }
    };

    checkPlayerStatus = () => {
        let playerReady = 0;
        if(this.#players.length > 1){
            for(let i in this.#players){
                console.log(this.#players[i].playerState);
                if(this.#players[i].playerState == 'ready'){
                    playerReady++;
                }
            }
        }
        return playerReady == this.#players.length;
    }

    findPlayer = (playerID) => {
        let player;

        for(let i in this.#players){
            if(this.#players[i].id === playerID){
                player = this.#players[i];
                break;
            }
        }

        return player;
    }

    endGame = () => {
        this.#destroyAllObjects();
        this.pause = true;
    }

}

module.exports = PureMadTanks;
