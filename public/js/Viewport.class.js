'use strict';

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

    constructor(viewport, canvas, zoomPadding, activeWindow){
        this.#viewport = viewport;
        this.#canvas = canvas;
        this.#viewportHeight = this.#viewport.height();
        this.#viewportWidth = this.#viewport.width();
        this.#canvasWidth = this.#canvas.width();
        this.#canvasHeight = this.#canvas.height();
        this.#canvasTop = this.#canvas.css('top');
        this.#canvasLeft = this.#canvas.css('left');
        this.#zoomPadding = zoomPadding;
        this.#activeWindow = activeWindow;
        this.#leftLimitMax = this.#canvasWidth - this.#viewportWidth - this.#zoomPadding;
        this.#leftLimitMin = this.#zoomPadding;
        this.#topLimitMax = this.#canvasHeight - this.#viewportHeight - this.#zoomPadding;
        this.#topLimitMin = this.#zoomPadding;
    }

    get canvas(){return this.#canvas;}

    initialise = (x, y) => {
        this.#canvas.css({
            'transform' : 'scale(0.7)',
            'top' : -600,
            'left' : -600
        });

        let leftPosition = x - (this.#viewportWidth / 2);
        let topPosition = y - (this.#viewportHeight / 2);

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

        this.#canvas.animate({
            left: -leftPosition,
            top: -topPosition,
            easing: 'swing'
        }, {
            duration : 3000,
            start : this.#zoomInOnInitialise()
        });
    };

    moveCamera = (x, y, linearVelocity) => {
        this.#canvasLeft = parseFloat(this.#canvas.css('left'));
        this.#canvasTop = parseFloat(this.#canvas.css('top'));

        let leftPosition = 0;
        let topPosition = 0;

        if(x >= (-this.#canvasLeft + (this.#viewportWidth - this.#activeWindow.rightPadding)) && linearVelocity.x >= 0){
            leftPosition = x + this.#activeWindow.rightPadding - this.#viewportWidth;
        } else if(x <= -this.#canvasLeft + this.#activeWindow.leftPadding && linearVelocity.x <= 0){
            leftPosition = x - this.#activeWindow.leftPadding;
        } else {
            leftPosition = this.#canvasLeft;
        }

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

        this.#canvas.css({
            left: -Math.abs(leftPosition),
            top: -Math.abs(topPosition),
            transition: 'top 34ms left 34ms'
        });

    };

    #zoomInOnInitialise = () => {
        this.#canvas.css({
            'transform' : 'scale(1)',
            'transition' : 'transform 3000ms'
        });
    }
}
