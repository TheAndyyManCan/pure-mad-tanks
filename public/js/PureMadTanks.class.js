'use strict';

import { Game } from './Game.class.mjs';

class PureMadTanks extends Game {

    #topBorder;
    #rightBorder;
    #leftBorder;
    #bottomBorder;

    constructor(height, width, scale, gravityX, gravityY, framerate, canvasName){
        super(height, width, scale, gravityX, gravityY, framerate, canvasName);
    }

    // Getters
    // get #topBorder(){return this.#topBorder;}
    // get #rightBorder(){return this.#rightBorder;}
    // get #leftBorder(){return this.#leftBorder};
    // get #bottomBorder(){return this.#bottomBorder;}

    // Setters
    // set #topBorder(topBorder){this.#topBorder = topBorder;}
    // set #rightBorder(rightBorder){this.#rightBorder = rightBorder;}
    // set #leftBorder(leftBorder){this.#leftBorder = leftBorder;}
    // set #bottomBorder(bottomBorder){this.#bottomBorder = bottomBorder;}

    init = () => {
        this.#topBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), 0, this._width, 10, 'topBorder', 'topBorder', 0, this._scale, this._world);
        this.#bottomBorder = new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), this._height, this._width, 10, 'bottomBorder', 'bottomBorder', 0, this._scale, this._world);
        this.#rightBorder = new StaticWorldObject(1.0, 0.5, 0.05, this._width, (this._height / 2), 10, this._height, 'rightBorder', 'rightBorder', 0, this._scale, this._world);
        this.#leftBorder = new StaticWorldObject(1.0, 0.5, 0.05, 0, (this._height / 2), 10, this._height, 'leftBorder', 'leftBorder', 0, this._scale, this._world);

        this._interval = setInterval(function() {
            update();
        }, 1000/this._framerate);
    }

    _gameLogic = () => {

    };


}

module.exports = PureMadTanks;
