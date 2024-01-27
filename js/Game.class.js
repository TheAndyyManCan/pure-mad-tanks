'use strict';

const { b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, b2EdgeShape } = require('./defs.js');
const ControlHandler = require('./EventHandlers.class.js');
const { Box2D } = require('box2dweb-commonjs');

/**
 * @class Game provides the bare minimum to create a game using box2d and easeljs. Should be used as an interface and extended to create a specific game
 * @property _height (int) the height of the box2d canvas (basically the height of the gamespace)
 * @property _width (int) the width of the box2d canvas
 * @property _scale (int) the scale that box2d will use
 * @property _gravity (b2Vec2 object) A b2vec2 object which defines the horizontal and vertical gravitational forces
 * @property _framerate (int) the frame rate the game should run at in frames per second
 * @property _itemList (array) an array of items created in the box2d world
 * @property _destroyList (array) an array of box2d bodies to be destroyed the next time the world steps
 * @property _controlHandler (object) a control handler object which will handle input listeners
 * @property _interval (object) the interval which is set when the world is initiated and can be cleared to stop the world stepping
 * @property _contactListener (object) an object which handles collisions and stores collision logic
 * @property _io (object) socket.io instance used for handling web sockets with the client
 * @property pause (bool) determines whether should be paused
 */
class Game {

    _height;
    _width;
    _scale;
    _gravity;
    _framerate;
    _world;
    _itemList = [];
    _destroyList = [];
    _controlHandler = [];
    _interval;
    _contactListener;
    _io;
    pause;

    get scale(){return this._scale;}
    get world(){return this._world;}
    get contactListener(){return this._contactListener;}

    /**
     * @constructor constructor for the Game class
     * Creates a new box2d world with the provided parameters
     * @param height (int) the height of the b2d canvas
     * @param width (int) the width of the game canvas
     * @param scale (int) the scale that b2d will use
     * @param gravityX (float) the number that will represent the horizontal gravitational force of the b2d world
     * @param gravityY (float) the number that will represent the vertical gravitational force of the b2d world
     * @param framerate (int) the framerate at which the game should run
     * @param io (Object) instance of socket.io which will be used to manage web sockets between the server and clients
     */
    constructor(height, width, scale, gravityX, gravityY, framerate, io){
        this._height = height;
        this._width = width;
        this._scale = scale;
        this._gravity = new b2Vec2(gravityX, gravityY);
        this._framerate = framerate;
        this._world = new b2World(this._gravity, true);
        this._contactListener = new Box2D.Dynamics.b2ContactListener();
        this._world.SetContactListener(this._contactListener);
        this._io = io;
        this.pause = true;
    }

    /**
     * Updates the game world each frame
     * Runs methods necessary for the game world to move forward
     * Sends object data to client using socket.io instance
     */
    update = () => {
        if(!this.pause){
            this._world.Step(
                1 / this._framerate, // framerate
                10, // velocity iterations
                10 // position iterations
            );

            this._gameLogic();
            this._world.DrawDebugData();
            this._world.ClearForces();
            this._io.sockets.emit('objdata', this._drawDomObjects());
            this._destroyListLogic();
        }
    };

    /**
     * Adds a box2d body to the destroy list
     * @param objectBody (box2d body object) the box2d body to be destroyed
     */
    destroyObject = (objectBody) => {
        this._destroyList.push(objectBody);
    }

    /**
     * Stub to hold game logic when class is inherited
     */
    _gameLogic = () => {

    };

    /**
     * Adds an item to the item list
     * @param item (object) object to be added to the item list
     */
    _addItem = (item) => {
        this._itemList.push(item);
    };

    /**
     * Destroys all bodies stored within the destroy list
     */
    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this.world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    /**
     * Stub to hold logic to send data to client using io instance
     */
    _drawDomObjects = () => {

    };

    /**
     * Adds a control handler instance to the control handler array
     * @param {context} ctx context which the handler is being listened for
     * @param {type} type
     * @param {function} runfunc
     */
    addControlHandler(ctx, type, runfunc){
        this._controlHandler.push(new ControlHandler(ctx, type, runfunc));
    };

    /**
     * Stub to hold logic to handle mouse down events
     * @param {object} Event object
     */
    _handleMouseDown = (e) => {

    };

    /**
     * Stub to hold logic to handle mouse up events
     * @param {object} Event object
     */
    _handleMouseUp = (e) => {

    };

    /**
     * Stub to hold logic to handle mouse move events
     * @param {object} Event object
     */
    _handleMouseMove = (e) => {

    };
}

module.exports = Game;
