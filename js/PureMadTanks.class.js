'use strict';

const Game = require('./Game.class.js');
const Wall = require('./Wall.class');
const { StaticWorldObject, DynamicWorldObject, CircleWorldObject } = require('./WorldObject.class');

/**
 * @class PureMadTanks an extensions of the Game class with specific properties and methods to create the Pure Mad Tanks Game
 * @property #borders (Array) array of StaticWorldObject instances to store the map borders for the game
 * @property #players (Array) array of Player instances to store information about the players connected to the game
 * @property #spectators (Array) array of Player instances to store information about spectators connected to the game
 * @property #walls (Array) array of StaticWorldObject instances to store the map's destructible walls
 * @property #numberOfWalls (int) the number of destructible walls that should be created
 * @property #wallSplitQueue (Array) a queue of destructible walls to be split. This is needed to stop trying to update the box2d canvas during a world step
 */
class PureMadTanks extends Game {

    #borders = [];
    #players = [];
    #spectators = [];
    #walls = [];
    #numberOfWalls;
    #wallSplitQueue = [];

    /**
     * @constructor constructor for the PureMadTanks class
     * Calls the constructor from the Game class and updates the #numberOfWalls property.
     * @param height (int) the height of the b2d canvas
     * @param width (int) the width of the game canvas
     * @param scale (int) the scale that b2d will use
     * @param gravityX (float) the number that will represent the horizontal gravitational force of the b2d world
     * @param gravityY (float) the number that will represent the vertical gravitational force of the b2d world
     * @param framerate (int) the framerate at which the game should run
     * @param io (Object) instance of socket.io which will be used to manage web sockets between the server and clients
     * @param numberOfWalls (int) the number of destructible walls which should be spawned on the map
     */
    constructor(height, width, scale, gravityX, gravityY, framerate, io, numberOfWalls){
        super(height, width, scale, gravityX, gravityY, framerate, io);
        this.#numberOfWalls = numberOfWalls;
    }

    // Class getters
    get players(){return this.#players;}

    /**
     * Spawns all of the objects for the map and sets up the game loop to run at the specified framerate. Uses the update method from the Game class
     */
    init = () => {
        this.#spawnAllObjects();
        this._interval = setInterval(() => {
            this.update();
        }, 1000/this._framerate);
    };

    /**
     * Sets game logic to be ran each time the update loop runs
     * Loops through the players array to decelerate each player's tank - this stops the tank from having unlimited momentum
     * Loops through the wall splitqueue and splits the walls that are needed to be split. Emptys the wall split queue
     */
    _gameLogic = () => {
        for(let i in this.#players){
            this.#players[i].tank.decelerateTank();
        }

        for(let j in this.#wallSplitQueue){
            this.#splitWall(this.#wallSplitQueue[j].wall, this.#wallSplitQueue[j].contactPoint);
        }

        this.#wallSplitQueue.length = 0;
    };

    /**
     * Logic to be ran each time objects are destroyed
     * This would be a good place to update score etc. when player's tanks are destroyed
     */
    _destroyListLogic = () => {
        for(let i in this._destroyList){
            this._world.DestroyBody(this._destroyList[i]);
        }
        this._destroyList.length = 0;
    };

    /**
     * Spawns all of the objects required to make the game map and pushes them to the correct arrays when necessary.
     */
    #spawnAllObjects = () => {
        // Spawn borders for the map
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), 0, this._width, 10, 'hBorder', 'topBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), this._height, this._width, 10, 'hBorder', 'bottomBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, this._width, (this._height / 2), 10, this._height, 'vBorder', 'rightBorder', 0, this._scale, this._world, 'vBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, 0, (this._height / 2), 10, this._height, 'vBorder', 'leftBorder', 0, this._scale, this._world, 'vBorder'));

        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), (this._height * 0.375), (this._width / 8) + 10, 10, 'hBorder', 'innerTopBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width / 2), (this._height * 0.625), (this._width / 8) + 10, 10, 'hBorder', 'innerBottomBorder', 0, this._scale, this._world, 'hBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width * 0.375), (this._height / 2), 10, (this._height / 8) + 10, 'vBorder', 'innerLeftBorder', 0, this._scale, this._world, 'vBorder'));
        this.#borders.push(new StaticWorldObject(1.0, 0.5, 0.05, (this._width * 0.625), (this._height / 2), 10, (this._height / 8) + 10, 'vBorder', 'innerRightBorder', 0, this._scale, this._world, 'vBorder'));

        // Spawn destructible walls
        for(let i = 0; i < this.#numberOfWalls; i++){

            let chance = Math.random();
            let angle = 0;
            let x = (Math.random() * this._width);
            let y = (Math.random() * this._height);

            // 50% chance to be vertical or horizontal
            if(chance > 0.5){
                angle = 1.571; // 180 degrees in radians
            }

            // Check to see if the x and y values are not inside the middle borders
            // Could be updated to ensure the walls don't overlap at all
            while ((x > this._width * 0.375 && x < this._width * 0.625) && (y > this._height * 0.375 && y < this._height * 0.625)){
                x = (Math.random() * this._width);
                y = (Math.random() * this._height);
            }

            this.#walls.push(new Wall(1.0, 0.5, 0.05, x, y, ((Math.random() * 300) + 100), 10, angle, 'wall', 'wall' + i, this._scale, this._world, 'wall'));

        }

        // Spawn a tank for each player
        for(let i in this.#players){
            let x = (Math.random() * this._width);
            let y = (Math.random() * this._height);
            // Check that tank isn't spawning in the middle square
            while ((x > this._width * 0.375 && x < this._width * 0.625) && (y > this._height * 0.375 && y < this._height * 0.625)){
                x = (Math.random() * this._width);
                y = (Math.random() * this._height);
            }
            this.#players[i].spawnTank(x, y, this._scale, this._world);
        }

    };

    /**
     * Adds all of the objects on the map to the destroy list and empties the border and wall arrays.
     */
    #destroyAllObjects = () => {
        for(let i in this.#borders){
            this._destroyList.push(this.#borders[i].getBody());
        }
        this.#borders.length = 0;
        for(let i in this.#walls){
            this._destroyList.push(this.#walls[i].getBody());
        }
        this.#walls.length = 0;
        for(let i in this.#players){
            this._destroyList.push(this.#players[i].tank.getBody());
        }
    }

    /**
     * Gets data and attributes from each box2d fixture ready to send to the client and be rendered on the client side using EaselJS
     */
    _drawDomObjects = () => {
        let ret = [];
        // Loop through each box2d body
        for(let i = this._world.GetBodyList(); i; i = i.GetNext()){
            // Loop through each body's fixtures
            for(let j = i.GetFixtureList(); j; j = j.GetNext()){
                let id = j.GetBody().GetUserData().id;
                let width = j.GetBody().GetUserData().width;
                let height = j.GetBody().GetUserData().height;
                let x = j.GetBody().GetPosition().x * this._scale;
                let y = j.GetBody().GetPosition().y * this._scale;
                let r = j.GetBody().GetAngle() * (180/Math.PI); // convert rotation to degrees from radians
                let assetID = j.GetBody().GetUserData().assetID;
                let uniqueName = j.GetBody().GetUserData().uniqueName;
                let destroyed = false;
                let player = j.GetBody().GetUserData().player;
                let linearVelocity = j.GetBody().GetLinearVelocity();

                // Check if the item is in the destroy list
                for(let k in this._destroyList){
                    if(uniqueName === this._destroyList[k].GetUserData().uniqueName){
                        destroyed = true;
                        break;
                    }
                }

                ret.push({
                    id: id,
                    uniqueName: uniqueName,
                    width: Math.floor(width),
                    height: Math.floor(height),
                    x: Math.floor(x),
                    y: Math.floor(y),
                    r: Math.floor(r),
                    assetID: assetID,
                    destroyed: destroyed,
                    player: player,
                    linearVelocity: linearVelocity
                });
            }
        }

        return ret;
    };

    /**
     * Check if there is less than 2 players already connected and adds the player instance to the array if there is
     * If there is more than 2 players, then the player is a spectator
     */
    addPlayer = (player) => {
        if(this.#players.length < 2){
            this.#players.push(player);
            return true;
        } else {
            this.#spectators.push(player);
            return false;
        }
    };

    /**
     * Removes a player from either the player or spectator array
     * Check the players array for the given player id
     * If found, removes the player
     * If not, checks the spectator array and removes the player from there
     * @param id (string) the socket id of the player to be removed
     */
    removePlayer = (id) => {
        let found = false;
        for(let i in this.#players){
            if(id == this.#players[i].id){
                this.#players.splice(i, 1);
                found = true;
                break;
            }
        }
        if(!found){
            for(let j in this.#spectators){
                if(id == this.#spectators[j].id){
                    this.#spectators.splice(j, 1);
                    break;
                }
            }
        }
    };

    /**
     * Checks the player state attribute of each player instance in the players array
     * @return (bool) true if every player's player state attribute is 'ready'
     */
    checkPlayerStatus = () => {
        let playerReady = 0;
        if(this.#players.length > 1){
            for(let i in this.#players){
                if(this.#players[i].playerState == 'ready'){
                    playerReady++;
                }
            }
        }
        return playerReady == this.#players.length;
    };

    /**
     * Loops through the players array to find the player with the given id
     * @param id (string) the socket id of the player to find
     * @return (object) returns the player if the player is found, or null if no player is found
     */
    findPlayer = (playerID) => {
        let player;
        for(let i in this.#players){
            if(this.#players[i].id === playerID){
                player = this.#players[i];
                break;
            }
        }
        return player;
    };

    /**
     * Loops through the walls array to find the wall with the given id
     * @param wallID (string) the id of the wall to be found
     * @return (object) returns the wall object if the wall is found or null if no wall is found
     */
    findWall = (wallID) => {
        let wall;
        for(let i in this.#walls){
            if(this.#walls[i].uniqueName === wallID){
                wall = this.#walls[i];
                break;
            }
        }
        return wall;
    }

    /**
     * Destroys all objects and sets the pause property to true, stopping the update loop
     * Can pass through a loser so that a winner and loser can be determined on the front end
     * If loser id is passed then emits 'endGame' on the socket with the winner and loser ids
     * @param loserid (string) the id of the losing player
     */
    endGame = (loserid = null) => {

        this.#destroyAllObjects();
        this.pause = true;

        if(loserid){
            let loser = loserid;
            let winner = '';

            for(let i in this.#players){
                if(this.#players[i].id != loserid){
                    winner = this.#players[i].id;
                }
            }

            this._io.emit('endGame', {
                winner: winner,
                loser: loser
            });

            this.#players.length = 0;
        }
    };

    /**
     * 'Splits' a wall by destroying the original wall and creating two walls with a gap of 50px in between where the wall was hit
     * Will only create one new wall if the wall is hit within 50px of the edge. The original wall will be destroyed and a smaller wall will be created.
     * Will determine how to split the wall and whether to use the x or y value to get start/end points based on the angle of the wall
     * Determines the start and end points of the wall based on the x/y value and the width (x/y value is in the middle so start point is x - width / 2 and end point is x + width / 2)
     * @param wall (wall object) the wall that has been hit by a rocket
     * @param contactPoint (b2vec2 object) The co-ordinates where the wall has been hit
     */
    #splitWall = (wall, contactPoint) => {
        let startPoint, endPoint;

        // Random integers to concatenate onto unique name to prevent duplicates
        let randomID1 = Math.random() * 10000000;
        let randomID2 = Math.random() * 10000000;

        // Check if the wall is horizontal or vertical (can only be 0 or 180 degrees)
        if(wall.angle > 1){
            // Calculate start and end points
            startPoint = wall.y - (wall.width / 2);
            endPoint = wall.y + (wall.width / 2);
            // Check if the contact point is less than 50px from the start point
            if(contactPoint.y - 50 < startPoint){
                // Calculate new wall width and y co-ordinate
                let wallWidth = endPoint - (contactPoint.y + 25);
                let wally = endPoint - (wallWidth / 2);
                // Destroy the original wall
                this.destroyObject(wall.getBody());
                // Create a new wall and add it to the walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wally, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                // Remove the old wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else if(endPoint - 50 < contactPoint.y){  // Check if the contact point is less than 50px from the end point
                // Calculate new wall width and y co-ordinate
                let wallWidth = (contactPoint.y - 25) - startPoint;
                let wally = startPoint + (wallWidth / 2);
                // Destroy the wall which was hit
                this.destroyObject(wall.getBody());
                // Create new wall with and add it to the walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wally, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                // Remove the old wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else {    // Wall has been hit in the middle section
                // Calculate wall width and y co-ordinates for two new walls
                let wall1Width = (contactPoint.y - 25) - startPoint;
                let wall2Width = endPoint - (contactPoint.y + 25);
                let wall1y = startPoint + (wall1Width / 2);
                let wall2y = endPoint - (wall2Width / 2);
                // Destroy the original wall
                this.destroyObject(wall.getBody());
                // Create 2 new walls and add them to the walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wall1y, wall1Width, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall.x, wall2y, wall2Width, 10, wall.angle, 'wall', 'wall' + randomID2, this._scale, this._world, 'wall'));
                // Remove the original wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            }
        } else {    // Wall is horizontal
            // Calculate start and end points
            startPoint = wall.x - (wall.width / 2);
            endPoint = wall.x + (wall.width / 2);
            // Check if contactPoint is less than 50px from start point
            if(contactPoint.x - 50 < startPoint){
                // Calculate new wall width and x co-ordinate
                let wallWidth = endPoint - (contactPoint.x + 25);
                let wallx = endPoint - (wallWidth / 2);
                // Destroy the original wall
                this.destroyObject(wall.getBody());
                // Create new wall and add to walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wallx, wall.y, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                // Remove old wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else if(endPoint - 50 < contactPoint.x){  // Contact point is less than 50px from end point
                // Calculate new wall width and x co-ordinate
                let wallWidth = (contactPoint.x - 25) - startPoint;
                let wallx = startPoint + (wallWidth / 2);
                // Destroy the original wall
                this.destroyObject(wall.getBody());
                // Create new wall and push to walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wallx, wall.y, wallWidth, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                // Remove old wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            } else {    // Contact point is in the middle section of the wall
                // Calculate new wall widths and x co-ordinates for 2 new walls
                let wall1Width = (contactPoint.x - 25) - startPoint;
                let wall2Width = endPoint - (contactPoint.x + 25);
                let wall1x = startPoint + (wall1Width / 2);
                let wall2x = endPoint - (wall2Width / 2);
                // Destroy original wall
                this.destroyObject(wall.getBody());
                // Create 2 new walls and add them to the walls array
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall1x, wall.y, wall1Width, 10, wall.angle, 'wall', 'wall' + randomID1, this._scale, this._world, 'wall'));
                this.#walls.push(new Wall(1.0, 0.5, 0.05, wall2x, wall.y, wall2Width, 10, wall.angle, 'wall', 'wall' + randomID2, this._scale, this._world, 'wall'));
                // remove original wall from the walls array
                this.#walls.splice(this.#walls.indexOf(wall), 1);
            }
        }
    };

    /**
     * Adds the wall object and the contact point to be added to the wall split queue
     * This queue will then be dealt with an emptied the next time the world steps
     * @param wall (object) the wall object to be destroyed
     * @param contactPoint (b2vec2 object) the b2vec2 object with the co-ordinates of the contact point where the wall should be split
     */
    addToWallSplitQueue = (wall, contactPoint) => {
        this.#wallSplitQueue.push({
            wall: wall,
            contactPoint: contactPoint
        });
    };

}

module.exports = PureMadTanks;
