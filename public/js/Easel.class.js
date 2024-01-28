'use strict';

/**
 * @class Easel class to handle easelJS components, create bitmap graphics and manage the stage being shown on the client
 * @property {element} _easelCan the canvas to be used to display graphics
 * @property {context} _easelCtx the context which easel will use (2d in this case)
 * @property {object} _loader load queue object to be used to find images from the manifest
 * @property {object} _stage the stage where graphics will be displayed
 * @property {int} _stageHeight the height of the stage
 * @property {int} _stageWidth the width of the stage
 * @property {array} _timestamps timestamps to be used to calculate the framerate
 * @property {float} _framerate the framerate the game is running at on the client side
 * @property {array} _datastamps data stamps to be used to calculate the data rate
 * @property {array} _objects an array of objects that have been added to the stage
 * @property {array} _manifest an array of objects with information regarding images and their sources
 * @property {bool} _initialised a flag to determine whether the stage has been set up
 * @property {object} _viewport an instance of the viewport class to be used to manipulate the viewport
 * @property {string} playerID the socket ID of the client connected to the server
 */
class Easel {

    _easelCan;
    _easelCtx;
    _loader = new createjs.LoadQueue(false);
    _stage;
    _stageHeight;
    _stageWidth;
    _timestamps = [];
    _framerate;
    _datastamps;
    _objects = [];
    _manifest;
    _initialised;
    _viewport;
    playerID;

    /**
     * @constructor creates an instance of the Easel class
     * @param {string} canvasName the id of the canvas to be used to display graphics
     * @param {array} manifest array of objects containing information about images and their sources
     * @param {int} framerate the framerate the game should run at in frames per second
     * @param {object} viewport an instance of the viewport class to manipulate the viewport
     */
    constructor(canvasName, manifest, framerate, viewport){
        this._easelCan = document.getElementById(canvasName);
        this._easelCtx = this._easelCan.getContext('2d');
        this._stage = new createjs.Stage(this._easelCan);
        this._stage.snapPixelsEnabled = true;
        this._stageWidth = this._stage.canvas.width;
        this._stageHeight = this._stage.canvas.height;
        this._manifest = manifest;
        this._loader.addEventListener('complete', this._handleComplete);
        this._loader.loadManifest(this._manifest, true);
        this._framerate = framerate;
        this._inititialised = false;
        this._viewport = viewport;
    }

    /**
     * Adds the background to the stage and adds an event listener for the tick event
     */
    _handleComplete = () => {
        let background = this._makeBitmap(this._loader.getResult('background'), this._stageWidth, this._stageHeight);
        this._addToStage(background);
        createjs.Ticker.framerate = this._framerate;
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener('tick', this._tick);
    };

    /**
     * Updates the stage each frame
     * Calculates and sets the framerate in frames per second
     * @param {event} e the tick event
     */
    _tick = (e) => {
        const now = performance.now();
        while(this._timestamps.length > 0 && this._timestamps[0] <= now - 1000){
            this._timestamps.shift();
        }
        this._timestamps.push(now);
        if(this._timestamps.length < 45){
            this._framerate = 30;
        } else if(this._timestamps.length < 75){
            this._framerate = 60;
        } else if(this._timestamps.length < 105){
            this._framerate = 90;
        } else if(this._timestamps.length < 135){
            this._framerate = 120;
        } else if(this._timestamps.length < 160){
            this._framerate = 144;
        } else if(this._timestamps.length < 180){
            this._framerate = 165;
        } else {
            this._framerate = 240;
        }
        createjs.Ticker.framerate = this._framerate;
        this._stage.update(e);
    };

    /**
     * Creates a new bitmap image and sets its x and y values accordingly
     * @param {ImageBitmap} loaderimage the image to be used
     * @param {int} b2x the x co-ordinate from box2d
     * @param {iny} b2y the y co-ordinate from box2d
     * @returns bitmap image to be added to the stage
     */
    _makeBitmap = (loaderimage, b2x, b2y) => {
        let image = new createjs.Bitmap(loaderimage);
        let scalex = (b2x * 2) / image.image.naturalWidth;
        let scaley = (b2y * 2) / image.image.naturalHeight;
        image.scaleX = scalex;
        image.scaleY = scaley;
        image.regX = image.image.width / 2;
        image.regY = image.image.height / 2;
        return image;
    };

    /**
     * Adds a bitmap image to the stage
     * @param {ImageBitmap} bitmap the image to be added to the stage
     * @param {int} x the x co-ordinate of the image
     * @param {int} y the y co-ordinate of the image
     */
    _addToStage = (bitmap, x, y) => {
        let graphic = bitmap;
        graphic.x = x;
        graphic.y = y;
        this._stage.addChild(graphic);
    };

    /**
     * Adds new graphics to the stage and updates graphics based on data sent from box2d server
     * Also removes objects from the stage which are to be destroyed
     * @param {array} data array of objects containing data of box2d objects to be used to update the stage
     */
    drawB2DGraphics = (data) => {
        if(!this._initialised){     // check if the stage has been initliased
            // Loop through each object and add them to the stage
            for(let i in data){
                this._objects.push({
                    image: this._makeBitmap(
                        this._loader.getResult(data[i].assetID),
                        data[i].width,
                        data[i].height
                    ),
                    id: data[i].uniqueName  // use the uniqename attribute instead of id to avoid duplication
                });
                this._addToStage(this._objects[this._objects.length - 1].image, data[i].x, data[i].y);
                // If the object is the current player's tank then play an animation to manipulate the viewport so the tank is in the centre
                if(data[i].id === "tank" && data[i].player === this.playerID){
                    this._viewport.initialise(data[i].x, data[i].y);
                }
            }
            this._initialised = true;
        } else {
            let index = -1;
            // Search for the current object in the objects array
            for(let i in data){
                for(let j in this._objects){
                    if(data[i].uniqueName == this._objects[j].id){
                        // record the index of the item in the objects array
                        index = j;
                    }
                }
                if(index >= 0){
                    // Object already exists, update the stage
                    if(data[i].destroyed){
                        this._stage.removeChild(this._objects[index].image);
                    } else {
                        this._objects[index].image.x = data[i].x;
                        this._objects[index].image.y = data[i].y;
                        this._objects[index].image.rotation = data[i].r;
                        // If the object is the player's tank then manipulate the viewport so the tank is in the center
                        if(data[i].id === "tank" && data[i].player === this.playerID){
                            this._viewport.moveCamera(data[i].x, data[i].y, data[i].linearVelocity);
                        }
                    }
                } else {
                    // Object does not exist, create new object and add to the stage
                    this._objects.push({
                        image: this._makeBitmap(
                            this._loader.getResult(data[i].assetID),
                            data[i].width,
                            data[i].height
                        ),
                        id: data[i].uniqueName
                    });
                    this._addToStage(this._objects[this._objects.length - 1].image, data[i].x, data[i].y);
                }
            }
        }
    };
}
