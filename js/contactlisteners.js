'use strict';

const Box2D = require('box2dweb-commonjs').Box2D;

let b2Listener = new Box2D.Dynamics.b2ContactListener();
b2Listener.BeginContact = (contact) => {
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
