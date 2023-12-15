'use strict';

const { StaticWorldObject } = require("./WorldObject.class");

class Wall extends StaticWorldObject {

    #x;
    #y;
    #height;
    #width;

    constructor(density, friction, restitution, x, y, width, height, angle, objid, uniquename, SCALE, world, assetID){
        super(density, friction, restitution, x, y, width, height, objid, uniquename, angle, SCALE, world, assetID);
        this.changeUserData('health', 10);
        this.#x = x;
        this.#y = y;
        this.#height = height;
        this.#width = width;
    }

    get x(){return this.#x;}
    get y(){return this.#y;}
    get height(){return this.#height;}
    get width(){return this.#width;}
}

module.exports = Wall;
