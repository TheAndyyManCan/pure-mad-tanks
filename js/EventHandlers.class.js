'use strict';

const Box2D = require('box2dweb-commonjs').Box2D;

let b2Listener = new Box2D.Dynamics.b2ContactListener();
b2Listener.BeginContact = (contact) => {};
b2Listener.EndContact = (contact) => {};
b2Listener.PreSolve = (contact, Impulse) => {};
b2Listener.PostSolve = (contact, oldManifest) => {};

/**
 * Mouse controls
 */

class ControlHandler {
    constructor(target, type, runfunc){
        target.addEventListener(type, (e) => {
            runfunc(e);
        });
    }
}

module.exports = ControlHandler;
