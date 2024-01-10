'use strict';

const { StaticWorldObject } = require("./WorldObject.class");

class Wall extends StaticWorldObject {

    #x;
    #y;
    #height;
    #width;
    #id;
    #angle;
    #uniqueName;

    constructor(density, friction, restitution, x, y, width, height, angle, objid, uniquename, SCALE, world, assetID){
        console.log('density: ' + density);
        console.log('friction: ' + friction);
        console.log('restitution: ' + restitution);
        console.log('x: ' + x);
        console.log('y: ' + y);
        console.log('width: ' + width);
        console.log('height: ' + height);
        console.log('angle: ' + angle);
        console.log('objid: ' + objid);
        console.log('uniquename: ' + uniquename);
        console.log('SCALE: ' + SCALE);
        console.log('world: ' + world);
        console.log('assetID: ' + assetID);
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

    get x(){return this.#x;}
    get y(){return this.#y;}
    get height(){return this.#height;}
    get width(){return this.#width;}
    get id(){return this.#id;}
    get angle(){return this.#angle;}
    get uniqueName(){return this.#uniqueName;}
}

module.exports = Wall;
