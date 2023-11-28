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
    }

    _handleComplete = () => {
        createjs.Ticker.framerate = this._framerate;
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener('tick', this._tick);
    }

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
        stage.update(e);
    }

    _makeBitmap = (loaderimage, b2x, b2y) => {
        let image = new createjs.Bitmap(loaderimage);
        let scalex = (b2x * 2) / image.image.naturalWidth;
        let scaley = (b2y * 2) / image.image.naturalHeight;
        image.scaleX = scalex;
        image.scaleY = scaley;
        image.regX = image.image.width / 2;
        image.regY = image.image.height / 2;
        image.snapToPixel = true;
        return image;
    }

}