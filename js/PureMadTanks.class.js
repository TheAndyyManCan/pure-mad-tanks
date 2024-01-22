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
    #wallSplitQueue = [];

    constructor(height, width, scale, gravityX, gravityY, framerate, io, numberOfWalls){
        super(height, width, scale, gravityX, gravityY, framerate, io);
        this.#numberOfWalls = numberOfWalls;
    }

    get players(){return this.#players;}

    init = () => {
        this.#spawnAllObjects();
        // for(let i in this.#walls){
        //     console.log(i + ' x: ' + this.#walls[i].getBody().GetWorldCenter().x * this._scale);
        //     console.log(i + ' y: ' + this.#walls[i].getBody().GetWorldCenter().y * this._scale);
        // }
        this._interval = setInterval(() => {
            this.update();
        }, 1000/this._framerate);
    };

    _gameLogic = () => {
        for(let i in this.#players){
            this.#players[i].tank.decelerateTank();
        }

        for(let j in this.#wallSplitQueue){
            this.#splitWall(this.#wallSplitQueue[j].wall, this.#wallSplitQueue[j].contactPoint);
        }

        this.#wallSplitQueue.length = 0;
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

            // 50% chance to be vertical or horizontal
            if(chance > 0.5){
                angle = 1.571; // 180 degrees in radians
            }

            while ((x > this._width * 0.375 && x < this._width * 0.625) && (y > this._height * 0.375 && y < this._height * 0.625)){
                x = (Math.random() * this._width);
                y = (Math.random() * this._height);
            }

            this.#walls.push(new Wall(1.0, 0.5, 0.05, x, y, ((Math.random() * 300) + 100), 10, angle, 'wall', 'wall' + i, this._scale, this._world, 'wall'));

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
                if(this.#players[i].playerState == 'ready'){
                    playerReady++;
                }
            }
        }
        return playerReady == this.#players.length;
    };

    findPlayer = (playerID) => {
        let player;
        for(let i in this.#players){
            if(this.#players[i].id === playerID){
                player = this.#players[i];
                break;
            }
        }
        return player;
    };

    findWall = (wallID) => {
        let wall;
        for(let i in this.#walls){
            if(this.#walls[i].uniqueName === wallID){
                wall = this.#walls[i];
                break;
            }
        }
        return wall;
    }

    endGame = () => {
        this.#destroyAllObjects();
        this.pause = true;
    };

    #splitWall = (wall, contactPoint) => {
        let startPoint, endPoint;
        let randomID1 = Math.random() * 10000000;
        let randomID2 = Math.random() * 10000000;

        if(wall.angle > 1){
            startPoint = wall.y - (wall.width / 2);
            endPoint = wall.y + (wall.width / 2);
            if(contactPoint.y - 50 < startPoint){
                let wallWidth = endPoint - (contactPoint.y + 25);
                let wally = endPoint - (wallWidth / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wally, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else if(endPoint - 50 < contactPoint.y){
                let wallWidth = (contactPoint.y - 25) - startPoint;
                let wally = startPoint + (wallWidth / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wally, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else {
                console.log(wall.getBody().GetUserData().uniqueName);
                let wall1Width = (contactPoint.y - 25) - startPoint;
                let wall2Width = endPoint - (contactPoint.y + 25);
                let wall1y = startPoint + (wall1Width / 2);
                let wall2y = endPoint - (wall2Width / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wall1y, wall1Width, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wall2y, wall2Width, 10, wall.angle, 'wall', 'wall' + randomID2, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            }
        } else {
            startPoint = wall.x - (wall.width / 2);
            endPoint = wall.x + (wall.width / 2);
            if(contactPoint.x - 50 < startPoint){
                let wallWidth = endPoint - (contactPoint.x + 25);
                let wallx = endPoint - (wallWidth / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wallx, wall.y, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else if(endPoint - 50 < contactPoint.x){
                let wallWidth = (contactPoint.x - 25) - startPoint;
                let wallx = startPoint + (wallWidth / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wallx, wall.y, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else {
                let wall1Width = (contactPoint.x - 25) - startPoint;
                let wall2Width = endPoint - (contactPoint.x + 25);
                let wall1x = startPoint + (wall1Width / 2);
                let wall2x = endPoint - (wall2Width / 2);
                this.destroyObject(wall.getBody());
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall1x, wall.y, wall1Width, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall2x, wall.y, wall2Width, 10, wall.angle, 'wall', 'wall' + randomID2, this._scale, this._world, 'wall'));
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            }
        }
    };

    addToWallSplitQueue = (wall, contactPoint) => {
        this.#wallSplitQueue.push({
            wall: wall,
            contactPoint: contactPoint
        });
    };

}

module.exports = PureMadTanks;
