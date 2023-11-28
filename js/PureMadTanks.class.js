'use strict';

const Game = require('./Game.class.js');
const { StaticWorldObject, DynamicWorldObject, CircleWorldObject } = require('./WorldObject.class');

class PureMadTanks extends Game {

    #topBorder;
    #rightBorder;
    #leftBorder;
    #bottomBorder;

    constructor(height, width, scale, gravityX, gravityY, framerate, canvasName){
        super(height, width, scale, gravityX, gravityY, framerate, canvasName);
    }

    init = () => {
        this._spawnAllObjects();
        this._interval = setInterval(() => {
            this.update();
        }, 1000/this._framerate);
    }

    _gameLogic = () => {

    };

    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this.world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    _spawnAllObjects = () => {
        this.#topBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), 0, this._width, 10, 'topBorder', 'topBorder', 0, this._scale, this._world);
        this.#bottomBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), this._height, this._width, 10, 'bottomBorder', 'bottomBorder', 0, this._scale, this._world);
        this.#rightBorder = new StaticWorldObject(1.0, 0.5, 0.05, this._width, (this._height / 2), 10, this._height, 'rightBorder', 'rightBorder', 0, this._scale, this._world);
        this.#leftBorder = new StaticWorldObject(1.0, 0.5, 0.05, 0, (this._height / 2), 10, this._height, 'leftBorder', 'leftBorder', 0, this._scale, this._world);
    }

}

module.exports = PureMadTanks;
