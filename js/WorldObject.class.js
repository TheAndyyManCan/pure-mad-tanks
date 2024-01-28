'use strict';

const { b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, b2EdgeShape } = require('./defs.js');

/**
 * @class WorldObject class to create new box2d objects. Should be treated as an interface and expanded on to specify the type of object and different attributes
 * @property {array} _userData associative array to store user data for the object
 * @property {array} _userDataFields array of objects to store attributes that will be used in the object's user data
 * @property {object} _fixDef object to store the fixture definition attributes of the object
 * @property {object} _bodyDef object to store the body definition attributes of the object
 * @property {object} _b2dobj object to store the actual box2d object that is created
 * @property {calculation} _r2d equation to convert radians to degrees for use with easeljs on the client side
 */
class WorldObject {

    _userData = [];
    _userDataFields = [];
    _fixDef = new b2FixtureDef();
    _bodyDef = new b2BodyDef();
    _b2dobj;
    _r2d = 180/Math.PI;

    /**
     * @constructor creates a new instance of the world object class
     * Also sets certain fixture definition and body definition attributes
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
    constructor(density, friction, restitution, x, y, SCALE, objid, uniqueName, width, height, assetID){
        this._fixDef.density = density;
        this._fixDef.friction = friction;
        this._fixDef.restitution = restitution;
        this._bodyDef.position.x = x / SCALE;
        this._bodyDef.position.y = y / SCALE;

        this._userDataFields = [
            {field: 'id', value: objid},
            {field: 'uniqueName', value: uniqueName},
            {field: 'width', value: width},
            {field: 'height', value: height},
            {field: 'assetID', value: assetID}
        ];
    }

    /**
     * Creates an object and spawns it in the provided b2d world
     * Also loops through the user data fields array and adds the user data to the object
     * @param {object} world the box2d world where the object will be created
     */
    _createObj(world){
        this._b2dobj = world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);
        for(let i in this._userDataFields){
            this.changeUserData(this._userDataFields[i].field, this._userDataFields[i].value);
        }
    }

    /**
     * Adds or updates an item in the userdata array and assigns the array to the box2d object
     * @param {string} property the key for the property being updated
     * @param {any} newValue the value to be associated with the key
     */
    changeUserData(property, newValue){
        let objdata = this.getBody().GetUserData();
        this._userData = typeof objdata === undefined || objdata === null?{}:this._userData;
        this._userData[property] = newValue;
        this.getBody().SetUserData(this._userData);
    }

    /**
     * Returns the body object of the box2d object
     * @returns {object} box2d body object associated with the class instance
     */
    getBody(){
        return this._b2dobj.GetBody();
    }
}

/**
 * @class StaticWorldObject extension of the WorldObject class. Creates a box2d static object
 */
class StaticWorldObject extends WorldObject {
    /**
     * @constructor creates a new instance of the world object class
     * Also sets certain fixture definition and body definition attributes
     * @param {float} density the density of the new object
     * @param {float} friction the friction of the new object
     * @param {float} restitution the restitution (bounciness) of the new object
     * @param {int} x the x co-ordinate of the new object
     * @param {int} y the y co-ordinate of the new object
     * @param {int} width the width in pixels of the new object
     * @param {int} height the height in pixels of the new object
     * @param {string} objid the unique id given to the object to be used by box2d
     * @param {string} uniquename unique name given to this specific object
     * @param {float} angle the angle of the object in radians
     * @param {int} scale the scale used by box2d
     * @param {object} world the world the object will be spawned in
     * @param {string} assetid the assetid to be used on the client side by easeljs to pick the correct image
     */
    constructor(density, friction, restitution, x, y, width, height, objid, uniqueName, angle, SCALE, world, assetID){
        super(density, friction, restitution, x, y, SCALE, objid, uniqueName, width, height, assetID);
        this._bodyDef.type = b2Body.b2_staticBody;
        this._bodyDef.angle = angle;
        this._fixDef.shape = new b2PolygonShape;
        this._fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
        this._createObj(world, this._userDataFields);
    }
}

/**
 * @class DynamicWorldObject extension of the WorldObject class. Creates a box2d dynamic object
 */
class DynamicWorldObject extends WorldObject {
    /**
     * @constructor creates a new instance of the world object class
     * Also sets certain fixture definition and body definition attributes
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
    constructor(density, friction, restitution, x, y, width, height, objid, uniqueName, SCALE, world, assetID){
        super(density, friction, restitution, x, y, SCALE, objid, uniqueName, width, height, assetID);
        this._bodyDef.type = b2Body.b2_dynamicBody;
        this._fixDef.shape = new b2PolygonShape;
        this._fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
        this._createObj(world, this._userDataFields);
    }
}

/**
 * @class CircleWorldObject extension of the WorldObject class. Creates a new box2d circle object
 */
class CircleWorldObject extends WorldObject {
    /**
     * @constructor creates a new instance of the world object class
     * Also sets certain fixture definition and body definition attributes
     * @param {float} density the density of the new object
     * @param {float} friction the friction of the new object
     * @param {float} restitution the restitution (bounciness) of the new object
     * @param {int} x the x co-ordinate of the new object
     * @param {int} y the y co-ordinate of the new object
     * @param {string} objid the unique id given to the object to be used by box2d
     * @param {string} uniquename unique name given to this specific object
     * @param {float} radius the radius of the new object
     * @param {int} scale the scale used by box2d
     * @param {object} world the world the object will be spawned in
     * @param {string} assetid the assetid to be used on the client side by easeljs to pick the correct image
     */
    constructor(density, friction, restitution, x, y, objid, uniqueName, radius, SCALE, world, assetID){
        super(density, friction, restitution, x, y, SCALE, objid, uniqueName, radius*this._r2d, radius*this._r2d, assetID);
        this._bodyDef.type = b2Body.b2_dynamicBody;
        this._fixDef.shape = new b2CircleShape(radius / SCALE);
        this._createObj(world, this._userDataFields);
    }
}

/**
 * @class BulletWorldObject extension of the CircleWorldObject class. Does the exact same as the CircleWorldObject class but sets the bullet body def attribute to true
 */
class BulletWorldObject extends CircleWorldObject {
    /**
     * @constructor creates a new instance of the world object class
     * Also sets certain fixture definition and body definition attributes
     * @param {float} density the density of the new object
     * @param {float} friction the friction of the new object
     * @param {float} restitution the restitution (bounciness) of the new object
     * @param {int} x the x co-ordinate of the new object
     * @param {int} y the y co-ordinate of the new object
     * @param {string} objid the unique id given to the object to be used by box2d
     * @param {string} uniquename unique name given to this specific object
     * @param {float} radius the radius of the new object
     * @param {int} scale the scale used by box2d
     * @param {object} world the world the object will be spawned in
     * @param {string} assetid the assetid to be used on the client side by easeljs to pick the correct image
     */
    constructor(density, friction, restitution, x, y, objid, uniqueName, radius, SCALE, world, assetID){
        super(density, friction, restitution, x, y, objid, uniqueName, radius, SCALE, world, assetID);
        this._bodyDef.bullet = true;
    }
}

module.exports = { StaticWorldObject, DynamicWorldObject, CircleWorldObject, BulletWorldObject };
