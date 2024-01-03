'use strict';

const { DynamicWorldObject, BulletWorldObject } = require("./WorldObject.class");
const { b2Vec2 } = require("./defs");

class Tank extends DynamicWorldObject {

    #reloading = false;
    #rocketIndex = 0;

    constructor(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID, playerID){
        super(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID);
        this.changeUserData('health', 100);
        this.changeUserData('player', playerID);
    }

    moveTank = (keycode) => {
        switch (keycode) {
            case 65:
                this.#changeRotation(false);
                break;
            case 68:
                this.#changeRotation(true);
                break;
            case 87:
                this.#changeTankSpeed(true);
                break;
            case 83:
                this.#changeTankSpeed(false);
                break;
        }
    };

    decelerateTank = () => {
        let x, y;
        let currentX = this.getBody().GetLinearVelocity().x;
        let currentY = this.getBody().GetLinearVelocity().y;

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

    shootRocket = (scale, world, mouseX, mouseY) => {
        if(!this.#reloading){
            console.log('shoot');
            let tankPosition = this.getBody().GetWorldCenter();
            let bullet = new BulletWorldObject(1.0, 0.5, 0, (tankPosition.x * scale), (tankPosition.y * scale), 'rocket', 'rocket'+ this.getBody().GetUserData().player + this.#rocketIndex, 10, scale, world, 'rocket');
            bullet.changeUserData('player', this.getBody().GetUserData().player);
            bullet.getBody().ApplyImpulse(new b2Vec2((mouseX - tankPosition.x * scale), (mouseY - tankPosition.y * scale)), bullet.getBody().GetWorldCenter());
            this.#reloading = true;
            this.#rocketIndex++;
            setTimeout(() => {
                this.#reloading = false;
            }, 2500);
        }
    }

    #changeTankSpeed = (forward) => {

        let impulseForce;

        if(forward){
            impulseForce = 5;
        } else {
            impulseForce = -5;
        }

        let angle = this.getBody().GetAngle();
        let x = impulseForce * Math.cos(angle);
        let y = impulseForce * Math.sin(angle);

        // Apply the impulse to the tank body
        this.getBody().ApplyImpulse(new b2Vec2(x, y), this.getBody().GetWorldCenter());

        // Clamp the tank's velocity if necessary
        let maxVelocity = 2.5;
        let currentVelocity = this.getBody().GetLinearVelocity();
        if (currentVelocity.Length() > maxVelocity) {
            currentVelocity.Normalize();
            let vx = currentVelocity.x * maxVelocity;
            let vy = currentVelocity.y * maxVelocity;
            this.getBody().SetLinearVelocity(new b2Vec2(vx, vy));
        }
    }

    #changeRotation = (clockwise) => {
        let currentRotation = this.getBody().GetAngle();
        if(clockwise){
            this.getBody().SetAngle(currentRotation + 0.025);
        } else {
            this.getBody().SetAngle(currentRotation - 0.025);
        }
    }
}
 module.exports = Tank;
