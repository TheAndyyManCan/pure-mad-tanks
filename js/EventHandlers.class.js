'use strict';

// Not used
class ControlHandler {
    constructor(target, type, runfunc){
        target.addEventListener(type, (e) => {
            runfunc(e);
        });
    }
}

module.exports = ControlHandler;
