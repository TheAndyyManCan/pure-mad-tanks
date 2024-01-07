'use strict';

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

    constructor(canvasName, manifest, framerate){
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
    }

    _handleComplete = () => {
        let background = this._makeBitmap(this._loader.getResult('background'), this._stageWidth, this._stageHeight);
        this._addToStage(background);
        createjs.Ticker.framerate = this._framerate;
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener('tick', this._tick);
    };

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

    _addToStage = (bitmap, x, y) => {
        let graphic = bitmap;
        graphic.x = x;
        graphic.y = y;
        this._stage.addChild(graphic);
    };

    drawB2DGraphics = (data) => {
        if(!this._initialised){
            for(let i in data){
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
            this._initialised = true;
        } else {
            let index = -1;
            for(let i in data){
                for(let j in this._objects){
                    if(data[i].uniqueName == this._objects[j].id){
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
                    }
                } else {
                    // Object does not exist, create new object and add to the stage
                    this._objects.push({
                        image: this._makeBitmap(
                            this._loader.getResult(data[i].assetID),
                            data[i].width,
                            data[i].height
                        ),
                        id: data[i].id
                    });
                    this._addToStage(this._objects[this._objects.length - 1].image, data[i].x, data[i].y);
                }
            }
        }
    };
}
