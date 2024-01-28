'use strict';

const { DynamicWorldObject, BulletWorldObject } = require("./WorldObject.class");
const { b2Vec2 } = require("./defs");

/**
 * @class Tank class to hold information about the tank and handle moving and shooting from the tank
 * @property {bool} #reloading flag to determine if the tank is reloading after shooting
 * @property {int} #rocketIndex rocket iterator to concatenate to new rockets to avoid duplicate ids
 */
class Tank extends DynamicWorldObject {

    #reloading = false;
    #rocketIndex = 0;

    /**
     * @constructor creates a new instance of the tank class
     * @param {float} density the density of the new tank object
     * @param {float} friction the friction of the new tank object
     * @param {float} restitution the restitution (bounciness) of the new tank object
     * @param {int} x the x co-ordinate of the new tank object
     * @param {int} y the y co-ordinate of the new tank object
     * @param {int} width the width in pixels of the new tank object
     * @param {int} height the height in pixels of the new tank object
     * @param {string} objid the unique id given to the tank to be used by box2d
     * @param {string} uniquename unique name given to this specific tank object
     * @param {int} scale the scale used by box2d
     * @param {object} world the world the tank will be spawned in
     * @param {string} assetid the assetid to be used on the client side by easeljs to pick the correct image
     * @param {string} playerid the player id associated with the tank
     */
    constructor(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID, playerID){
        super(density, friction, restitution, x, y, width, height, objid, uniquename, SCALE, world, assetID);
        this.changeUserData('health', 100);
        this.changeUserData('player', playerID);
    }

    /**
     * Checks the keycode provided and calls the correct function with the correct parameter
     * @param {int} keycode the event keycode from the client
     */
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

    /**
     * Decelerates the tank by reducing its linear velocity each time the function is called
     * Will bring the tank to a stop if it is suitable
     */
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

    /**
     * Shoots a rocket from the middle of the tank to the co-ordinates of the mouse cursor
     * @param {int} scale the scale the box2d world is using
     * @param {object} world b2d world object where the rocket will spawn
     * @param {float} mouseX the x co-ordinate of the mouse from the client 
     * @param {float} mouseY the y co-ordinate of the mouse from the client
     */
    shootRocket = (scale, world, mouseX, mouseY) => {
        if(!this.#reloading){
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


    /**
     * Changes the tank speed and pushes the tank in the direction the tank is currently facing
     * Will clamp the speed so the tank does not move too fast (it's a tank)
     * @param {bool} forward set to true if the tank should be moved forward or false if it should be moved backward
     */
    #changeTankSpeed = (forward) => {

        let impulseForce;

        if(forward){
            impulseForce = 5;
        } else {
            impulseForce = -5;
        }

        // Base the impulse force on the tanks current angle
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

    /**
     * Changes the angle of the tank in order to simulate steering
     * @param {bool} clockwise to be set to true if the tank is turning right
     */
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
