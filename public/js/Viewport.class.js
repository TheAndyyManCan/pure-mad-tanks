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
            duration:3000,
            start : this.#zoomInOnInitialise()
        });
    };

    moveCamera = (x, y) => {
        this.#canvasLeft = this.#canvas.css('left');
        this.#canvasTop = this.#canvas.css('top');

    };

    #zoomInOnInitialise = () => {
        this.#canvas.css({
            'transform' : 'scale(1)',
            'transition' : 'transform 3000ms'
        });
    }
}
