'use strict';

const Game = require('./Game.class.js');
const { StaticWorldObject, DynamicWorldObject, CircleWorldObject } = require('./WorldObject.class');

class PureMadTanks extends Game {

    #borders = [];
    #players = [];
    #walls = [];

    constructor(height, width, scale, gravityX, gravityY, framerate, io){
        super(height, width, scale, gravityX, gravityY, framerate, io);
    }

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
            this.world.DestroyBody(this._destroyList[i]);
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

        // Spawn a tank for each player
        for(let i in this.#players){
            let x = (Math.random() * (this._width / this.#players.length)) + ((i % 2) * (this._width / this.#players.length));
            let y = (Math.random() * (this._height / this.#players.length)) + ((i % 2) * (this._height / this.#players.length));
            this.#players[i].spawnTank(x, y, this._scale, this._world);
        }

    };

    _drawDomObjects = () => {
        let ret = [];
        for(let i = this._world.GetBodyList(); i; i = i.GetNext()){
            for(let j = i.GetFixtureList(); j; j = j.GetNext()){
                let id = j.GetBody().GetUserData().id;
                let width = j.GetBody().GetUserData().width;
                let height = j.GetBody().GetUserData().height;
                let x = j.GetBody().GetPosition().x * this._scale;
                let y = j.GetBody().GetPosition().y * this._scale;
                let r = j.GetBody().GetAngle();
                let assetID = j.GetBody().GetUserData().assetID;
                ret.push({
                    id: id,
                    width: Math.floor(width),
                    height: Math.floor(height),
                    x: Math.floor(x),
                    y: Math.floor(y),
                    r: Math.floor(r),
                    assetID: assetID
                });
            }
        }

        return ret;
    };

    addPlayer = (player) => {
        this.#players.push(player);
    };

    removePlayer = (id) => {
        for(let i in this.#players){
            if(id == this.#players[i].id){
                this.#players.splice(i, 1);
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

}

module.exports = PureMadTanks;
