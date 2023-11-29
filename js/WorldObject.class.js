'use strict';

const { b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, b2EdgeShape } = require('./defs.js');

class WorldObject {

    _userData = {};
    _uniqueName;
    _fixDef = new b2FixtureDef();
    _bodyDef = new b2BodyDef();
    _b2dobj;

    constructor(density, friction, restitution, x, y, SCALE){
        this._fixDef.density = density;
        this._fixDef.friction = friction;
        this._fixDef.restitution = restitution;
        this._bodyDef.position.x = x / SCALE;
        this._bodyDef.position.y = y / SCALE;
    }

    _createObj(world, userDataFields){
        this._b2dobj = world.CreateBody(this._bodyDef).CreateFixture(this._fixDef);
        for(let i in userDataFields){
            this.changeUserData(userDataFields[i].field, userDataFields[i].value);
        }
    }

    changeUserData(property, newValue){
        let objdata = this.getBody().GetUserData();
        this._userData = typeof objdata === undefined || objdata === null?{}:this._userData;
        this._userData[property] = newValue;
        this.getBody().SetUserData(this._userData);
    }

    getBody(){
        return this._b2dobj.GetBody();
    }
}

class StaticWorldObject extends WorldObject {
    constructor(density, friction, restitution, x, y, width, height, objid, uniqueName, angle, SCALE, world, assetID){
        super(density, friction, restitution, x, y, SCALE, world);
        this._bodyDef.type = b2Body.b2_staticBody;
        this._bodyDef.angle = angle;
        this._fixDef.shape = new b2PolygonShape;
        this._fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
        this._userDataFields = [
            {field: 'id', value: objid},
            {field: 'uniqueName', value: uniqueName},
            {field: 'width', value: width},
            {field: 'height', value: height},
            {field: 'assetID', value: assetID}
        ];
        this._createObj(world, this._userDataFields);
    }
}

class DynamicWorldObject extends WorldObject {
    constructor(density, friction, restitution, x, y, width, height, objid, uniqueName, SCALE, world){
        super(density, friction, restitution, x, y, SCALE, world);
        this._bodyDef.type = b2Body.b2_dynamicBody;
        this._fixDef.shape = new b2PolygonShape;
        this._fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
        this._createObj(world, objid, uniqueName);
    }
}

class CircleWorldObject extends WorldObject {
    constructor(density, friction, restitution, x, y, objid, uniqueName, radius, SCALE, world){
        super(density, friction, restitution, x, y, SCALE, world);
        this._bodyDef.type = b2Body.b2_dynamicBody;
        this._fixDef.shape = new b2CircleShape(radius / SCALE);
        this._createObj(world, objid, uniqueName);
    }
}

module.exports = { StaticWorldObject, DynamicWorldObject, CircleWorldObject };
