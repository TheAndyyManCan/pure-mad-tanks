'use strict';

const raf = require('raf');
const { b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, b2EdgeShape } = require('./defs.js');
const ControlHandler = require('./EventHandlers.class.js');

class Game {

    _height;
    _width;
    _scale;
    _gravity;
    _framerate;
    _itemList = [];
    _destroyList = [];
    _controlHandler = [];
    _interval;

    constructor(height, width, scale, gravityX, gravityY, framerate){
        this._height = height;
        this._width = width;
        this._scale = scale;
        this._gravity = new b2Vec2(gravityX, gravityY);
        this._framerate = framerate;
        this._world = new b2World(this.gravity, true);
    }

    update = () => {
        this._world.Step(
            1 / this._framerate, // framerate
            10, // velocity iterations
            10 // position iterations
        );

        this._gameLogic();
        this._world.DrawDebugData();
        this._world.ClearForces();
        this._destroyListLogic();

        raf(this.update);
    };

    _gameLogic = () => {

    };

    _addItem = (item) => {
        this._itemList.push(item);
    };

    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this.world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    addControlHandler(ctx, type, runfunc){
        this._controlHandler.push(new ControlHandler(ctx, type, runfunc));
    }

    _handleMouseDown = (e) => {

    }

    _handleMouseUp = (e) => {

    }

    _handleMouseMove = (e) => {

    }
}

module.exports = Game;
