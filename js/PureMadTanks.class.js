'use strict';

const Game = require('./Game.class.js');
const { StaticWorldObject, DynamicWorldObject, CircleWorldObject } = require('./WorldObject.class');

class PureMadTanks extends Game {

    #topBorder;
    #rightBorder;
    #leftBorder;
    #bottomBorder;

    constructor(height, width, scale, gravityX, gravityY, framerate, io){
        super(height, width, scale, gravityX, gravityY, framerate, io);
    }

    init = () => {
        this._spawnAllObjects();
        this._interval = setInterval(() => {
            this.update();
        }, 1000/this._framerate);
    };

    _gameLogic = () => {

    };

    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this.world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    _spawnAllObjects = () => {
        this.#topBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), 0, this._width, 10, 'hBorder', 'topBorder', 0, this._scale, this._world, 'hBorder');
        this.#bottomBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), this._height, this._width, 10, 'hBorder', 'bottomBorder', 0, this._scale, this._world, 'hBorder');
        this.#rightBorder = new StaticWorldObject(1.0, 0.5, 0.05, this._width, (this._height / 2), 10, this._height, 'vBorder', 'rightBorder', 0, this._scale, this._world, 'vBorder');
        this.#leftBorder = new StaticWorldObject(1.0, 0.5, 0.05, 0, (this._height / 2), 10, this._height, 'vBorder', 'leftBorder', 0, this._scale, this._world, 'vBorder');
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

}

module.exports = PureMadTanks;
