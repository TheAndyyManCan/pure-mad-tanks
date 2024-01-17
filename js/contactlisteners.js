'use strict';

const contactListener = require("..");

/**
 * Collision logic
 */
contactListener.BeginContact = (contact) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();
    let fixaId = fixa.GetUserData().id;
    let fixbId = fixb.GetUserData().id;

    if(fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id != 'tank'){
        fixa.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixa);
    }

    if(fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id != 'tank'){
        fixb.SetLinearVelocity(new b2Vec2(0,0));
        game.destroyObject(fixb);
    }

    if((fixa.GetUserData().id === 'rocket' && fixb.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixb.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {
                game.destroyObject(tankPlayer.tank.getBody());
            }
            game.destroyObject(fixa);
        }
    }

    if((fixb.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player !== fixb.GetUserData().player)){
        // Find the tank that has been hit and reduce its health
        let tankPlayer = game.findPlayer(fixa.GetUserData().player);
        if(tankPlayer){
            let currentTankHealth = tankPlayer.tank.getBody().GetUserData().health;
            let newHealth = currentTankHealth - 25;
            if(newHealth > 0){
                tankPlayer.tank.changeUserData('health', newHealth);
            } else {
                game.destroyObject(tankPlayer.tank.getBody());
            }
            game.destroyObject(fixb);
        }
    }

    if(fixaId === "rocket" && fixbId === "wall"){
        let worldManifold = new b2WorldManifold();
        worldManifold.Initialize(contact.GetManifold(), fixa.m_xf, contact.GetFixtureA().GetShape().radius, fixb.m_xf, contact.GetFixtureB().GetShape().radius);
        let contactPoint = new b2Vec2(worldManifold.m_points[0].x * game.scale, worldManifold.m_points[0].y * game.scale);
        let wall = game.findWall(fixb.GetUserData().uniqueName);
        game.addToWallSplitQueue(wall, contactPoint);
    }

    if(fixbId === "rocket" && fixaId === "wall"){
        let worldManifold = new b2WorldManifold();
        worldManifold.Initialize(contact.GetManifold(), fixa.m_xf, contact.GetFixtureA().GetShape().radius, fixb.m_xf, contact.GetFixtureB().GetShape().radius);
        let contactPoint = new b2Vec2(worldManifold.m_points[0].x * game.scale, worldManifold.m_points[0].y * game.scale);
        let wall = game.findWall(fixa.GetUserData().uniqueName);
        game.addToWallSplitQueue(wall, contactPoint);
    }
};

contactListener.EndContact = (contact) => {

};

contactListener.PreSolve = (contact, Impulse) => {
    let fixa = contact.GetFixtureA().GetBody();
    let fixb = contact.GetFixtureB().GetBody();

    if((fixa.GetUserData().id === 'tank' && fixb.GetUserData().id === 'rocket') || (fixa.GetUserData().id === 'rocket' && fixa.GetUserData().id === 'tank') && (fixa.GetUserData().player === fixb.GetUserData().player)){
        contact.SetEnabled(false);
    }
};

contactListener.PostSolve = (contact, oldManifest) => {

};
