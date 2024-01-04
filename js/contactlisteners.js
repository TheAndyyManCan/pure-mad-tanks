'use strict';

const Box2D = require('box2dweb-commonjs').Box2D;
const { b2Vec2 } = require('box2dweb-commonjs');
const game = require('../index.js');

let b2Listener = new Box2D.Dynamics.b2ContactListener();
b2Listener.BeginContact = (contact) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    if(fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id != 'tank'){
        fixa.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixa);
    }

    if(fixb.GetUserData().id === 'rocket' && fixb.GetUserData().id != 'tank'){
        fixb.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixb);
    }
};
b2Listener.EndContact = (contact) => {};

b2Listener.PreSolve = (contact, Impulse) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    if((fixa.GetUserData().id === 'tank' && fixb.GetUserData().id === 'rocket') || (fixa.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player === fixb.GetUserData().player)){
        contact.SetEnabled(false);
    }
};

b2Listener.PostSolve = (contact, oldManifest) => {};

module.exports = b2Listener;
