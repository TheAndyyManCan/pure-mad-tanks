'use strict';

const { DynamicWorldObject } = require("./WorldObject.class");
const { b2Vec2 } = require("./defs");

class Tank extends DynamicWorldObject {
    
    constructor(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID){
        super(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID);
    }

    moveTank = (keycode) => {
        let x = 0;
        let y = 0;

        switch (keycode) {
            case 65:
                x = -5;
                break;
            case 68:
                x = 5;
                break;
            case 87:
                y = -5;
                break;
            case 83:
                y = 5;
                break;
        }

        // Apply the impulse to the tank body
        this.getBody().ApplyImpulse(new b2Vec2(x, y), this.getBody().GetWorldCenter());

        // Clamp the tank's velocity if necessary
        let maxVelocity = 2.5;
        let currentVelocity = this.getBody().GetLinearVelocity();
        if (currentVelocity.Length() > maxVelocity) {
            currentVelocity.Normalize();
            let x = currentVelocity.x * maxVelocity;
            let y = currentVelocity.y * maxVelocity;
            this.getBody().SetLinearVelocity(new b2Vec2(x, y));
        }
    };

    decelerateTank = () => {
        var x, y;
        var currentX = this.getBody().GetLinearVelocity().x;
        var currentY = this.getBody().GetLinearVelocity().y;

        if((currentX < 0.025 && currentX > 0) || (currentX > -0.025 && currentX < 0)){
            x = 0;
        } else if(currentX > 0){
            x = currentX - 0.025;
        } else if(currentX < 0){
            x = currentX + 0.025;
        }

        if((currentY < 0.025 && currentY > 0) || (currentY > -0.025 && currentY < 0)){
            y = 0;
        } else if(currentY > 0){
            y = currentY - 0.025;
        } else if(currentY < 0){
            y = currentY + 0.025;
        }

        this.getBody().SetLinearVelocity(new b2Vec2(x, y));
    }
}
 module.exports = Tank;
