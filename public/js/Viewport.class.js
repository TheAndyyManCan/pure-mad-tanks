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

        let leftLimitMax = this.#canvasWidth - this.#viewportWidth - this.#zoomPadding;
        let leftLimitMin = this.#zoomPadding;
        let topLimitMax = this.#canvasHeight - this.#viewportHeight - this.#zoomPadding;
        let topLimitMin = this.#zoomPadding;
    };

    #zoomInOnInitialise = () => {
        this.#canvas.css({
            'transform' : 'scale(1)',
            'transition' : 'transform 3000ms'
        });
    }
}
