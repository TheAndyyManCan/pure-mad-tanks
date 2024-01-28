'use strict';

const { StaticWorldObject } = require("./WorldObject.class");

/**
 * @class Wall class to create destructible walls and store relevant information needed in other classes
 * @property {int} #x the x co-ordinate of the wall
 * @property {int} #y the y co-ordinate of the wall
 * @property {int} #height the height of the wall
 * @property {int} #width the width of the wall
 * @property {string} #id the unique id given to the type of object
 * @property {float} #angle the angle of the wall in radians
 * @property {string} #uniqueName a unique name given to each wall
 */
class Wall extends StaticWorldObject {

    #x;
    #y;
    #height;
    #width;
    #id;
    #angle;
    #uniqueName;

    /**
     * @constructor creates a new instance of the wall class
     * @param {float} density the density of the new object
     * @param {float} friction the friction of the new object
     * @param {float} restitution the restitution (bounciness) of the new object
     * @param {int} x the x co-ordinate of the new object
     * @param {int} y the y co-ordinate of the new object
     * @param {int} width the width in pixels of the new object
     * @param {int} height the height in pixels of the new object
     * @param {string} objid the unique id given to the object to be used by box2d
     * @param {string} uniquename unique name given to this specific object
     * @param {int} scale the scale used by box2d
     * @param {object} world the world the object will be spawned in
     * @param {string} assetid the assetid to be used on the client side by easeljs to pick the correct image
     */
    constructor(density, friction, restitution, x, y, width, height, angle, objid, uniquename, SCALE, world, assetID){
        super(density, friction, restitution, x, y, width, height, objid, uniquename, angle, SCALE, world, assetID);
        this.changeUserData('health', 10);
        this.#x = x;
        this.#y = y;
        this.#height = height;
        this.#width = width;
        this.#id = objid;
        this.#angle = angle;
        this.#uniqueName = uniquename;
    }

    // Class getters
    get x(){return this.#x;}
    get y(){return this.#y;}
    get height(){return this.#height;}
    get width(){return this.#width;}
    get id(){return this.#id;}
    get angle(){return this.#angle;}
    get uniqueName(){return this.#uniqueName;}
}

module.exports = Wall;
