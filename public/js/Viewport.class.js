'use strict';

/**
 * @class Viewport class to manipulate the viewport and keep the player's tank in the centre of the view
 * @property {element} #canvas the canvas element which will be moved to manipulate the camera
 * @property {element} #viewport the viewport div which will display the game window
 * @property {int} #viewportHeight the height of the viewport element
 * @property {int} #viewportWidth the width of the viewport element
 * @property {int} #canvasWidth the width of the canvas element
 * @property {int} #canvasHeight the height of the canvas element
 * @property {int} #canvasTop the top css property of the canvas element
 * @property {int} #canvasLeft the left css property of the canvas element
 * @property {int} #zoomPadding the amount of padding left at the edge of the activeWindow to account for zoom
 * @property {object} #activeWindow object with attributes detailing the size of the active window
 * @property {int} #leftLimitMax the maximum limit of the left css property of the canvas
 * @property {int} #leftLimitMin the minimum limit of the left css property of the canvas
 * @property {int} #topLimitMin the minimum limit of the top css property of the canvas
 * @property {int} #topLimitMax the maximum limit of the top css property of the canvas
 */
class Viewport {

    #canvas;
    #viewport;
    #viewportHeight;
    #viewportWidth;
    #canvasWidth;
    #canvasHeight;
    #canvasTop;
    #canvasLeft;
    #zoomPadding;
    #activeWindow;
    #leftLimitMin;
    #leftLimitMax;
    #topLimitMin;
    #topLimitMax;

    /**
     * @constructor Creates a new instance of the viewport class
     * @param {element} viewport the viewport div to display the game window
     * @param {element} canvas the canvas element to be manipulated
     * @param {int} zoomPadding the amount of padding at the edge of the active window to account for zoom
     * @param {object} activeWindow object with attributes detailing the size of the active window
     */
    constructor(viewport, canvas, zoomPadding, activeWindow){
        this.#viewport = viewport;
        this.#canvas = canvas;
        this.#viewportHeight = this.#viewport.height();
        this.#viewportWidth = this.#viewport.width();
        this.#canvasWidth = this.#canvas.width();
        this.#canvasHeight = this.#canvas.height();
        this.#canvasTop = parseFloat(this.#canvas.css('top'));  // Use parseFloat to remove the 'px' from the end
        this.#canvasLeft = parseFloat(this.#canvas.css('left'));
        this.#zoomPadding = zoomPadding;
        this.#activeWindow = activeWindow;
        this.#leftLimitMax = this.#canvasWidth - this.#viewportWidth - this.#zoomPadding;
        this.#leftLimitMin = this.#zoomPadding;
        this.#topLimitMax = this.#canvasHeight - this.#viewportHeight - this.#zoomPadding;
        this.#topLimitMin = this.#zoomPadding;
    }

    // Class getters
    get canvas(){return this.#canvas;}

    /**
     * Play an animation at the start of the game to bring the tank into view
     * @param {int} x the x co-ordinate of the tank
     * @param {int} y the y co-ordinate of the tank
     */
    initialise = (x, y) => {
        // Set the game window in the middle of the canvas
        this.#canvas.css({
            'transform' : 'scale(0.7)',
            'top' : -600,
            'left' : -600
        });

        // Calculate the left and top css properties based on the x and y co-ordinates of the tank and the viewport width/height
        let leftPosition = x - (this.#viewportWidth / 2);
        let topPosition = y - (this.#viewportHeight / 2);

        // Ensure the viewport doesn't show any overflow by ensuring it stays within the limits set
        if(leftPosition < this.#leftLimitMin){
            leftPosition = this.#leftLimitMin;
        } else if(leftPosition > this.#leftLimitMax){
            leftPosition = this.#leftLimitMax;
        }

        if(topPosition < this.#topLimitMin){
            topPosition = this.#topLimitMin;
        } else if(topPosition > this.#topLimitMax){
            topPosition = this.#topLimitMax;
        }

        // Animate the viewport to show the tank in the centre of the game window
        this.#canvas.animate({
            left: -leftPosition,
            top: -topPosition,
            easing: 'swing'
        }, {
            duration : 3000,
            start : this.#zoomInOnInitialise()
        });
    };

    /**
     * Moves the camera based on the x and y co-ordinates of the tank to keep the tank on the screen
     * Uses the linear velocity object to determine the direction the camera should move
     * @param {int} x the x co-ordinate of the tank
     * @param {int} y the y co-ordinate of the tank
     * @param {object} linearVelocity box2d linearVelocity object which details the speed and direction the tank is moving
     */
    moveCamera = (x, y, linearVelocity) => {
        this.#canvasLeft = parseFloat(this.#canvas.css('left'));
        this.#canvasTop = parseFloat(this.#canvas.css('top'));

        let leftPosition = 0;
        let topPosition = 0;

        /* If the tank is pushing against the left or right wall of the active window then move the camera accordingly
         * otherwise, don't move the camera */
        if(x >= (-this.#canvasLeft + (this.#viewportWidth - this.#activeWindow.rightPadding)) && linearVelocity.x >= 0){
            leftPosition = x + this.#activeWindow.rightPadding - this.#viewportWidth;
        } else if(x <= -this.#canvasLeft + this.#activeWindow.leftPadding && linearVelocity.x <= 0){
            leftPosition = x - this.#activeWindow.leftPadding;
        } else {
            leftPosition = this.#canvasLeft;
        }

        /* If the tank is pushing against the top or bottom wall of the active window then move the camera accordingly
         * otherwise, don't move the camera */
        if(y >= (-this.#canvasTop + (this.#viewportHeight - this.#activeWindow.bottomPadding)) && linearVelocity.y >= 0){
            topPosition = y + this.#activeWindow.bottomPadding - this.#viewportHeight;
        } else if(y <= -this.#canvasTop + this.#activeWindow.topPadding && linearVelocity.y <= 0){
            topPosition = y - this.#activeWindow.topPadding;
        } else {
            topPosition = this.#canvasTop;
        }

        // This breaks the viewport functionality somehow
        // if(Math.abs(leftPosition) < this.#leftLimitMin){
        //     leftPosition = this.#leftLimitMin;
        // } else if(Math.abs(leftPosition) > this.#leftLimitMax){
        //     leftPosition = this.#leftLimitMax;
        // }

        // if(Math.abs(topPosition) < this.#topLimitMin){
        //     topPosition = this.#topLimitMin;
        // } else if(Math.abs(topPosition) > this.#topLimitMax){
        //     topPosition = this.#topLimitMax;
        // }

        // Adjust the css of the canvas to move the camera
        this.#canvas.css({
            left: -Math.abs(leftPosition),
            top: -Math.abs(topPosition),
            transition: 'top 34ms left 34ms'
        });

    };

    /**
     * Plays an animation to zoom in on the tank
     */
    #zoomInOnInitialise = () => {
        this.#canvas.css({
            'transform' : 'scale(1)',
            'transition' : 'transform 3000ms'
        });
    }
}
