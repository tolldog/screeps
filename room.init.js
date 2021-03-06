let format = require('format');

const CREEPS = {
    miners: {max: 0, count: 0},
    movers: {max: 0, count: 0},
    flex: {max: 0, count: 0}
};

let roomInit = {

    run: function (currentRoom) {
        if (currentRoom.memory.init === true) {
            return
        }
        format.log(`room.init: ${currentRoom.name}`, 1);

        // Exits Data
        let exitNames = Game.map.describeExits(currentRoom.name);
        let sides = {
            top: [1, 0, 0, 0, 49],
            right: [3, 0, 49, 49, 49],
            bottom: [5, 49, 0, 49, 49],
            left: [7, 0, 0, 49, 0]
        };
        if (exitNames) {
            let exits = {top: {}, right: {}, bottom: {}, left: {}};
            for (let side in sides) {
                let terrainData = _.filter(currentRoom.lookForAtArea(LOOK_TERRAIN,
                    sides[side][1], sides[side][2], sides[side][3], sides[side][4], true),
                    function (tile) {
                        return tile.terrain !== 'wall';
                    });
                for (let tile in terrainData) {
                    delete terrainData[tile]['type'];
                    delete terrainData[tile]['terrain'];
                }
                if (exitNames[sides[side][0]]) {
                    exits[side] = {name: exitNames[sides[side][0]], tiles: terrainData};
                }
            }
            currentRoom.memory.exits = exits;
        }

        // Sources Data (+ creeps.miners and creeps.movers)
        let sourcesData = currentRoom.lookForAtArea(LOOK_SOURCES, 0, 0, 49, 49, true);
        let sources = [];
        let creeps = CREEPS;
        for (let source in sourcesData) {
            let terrainData = _.filter(currentRoom.lookForAtArea(LOOK_TERRAIN,
                sourcesData[source].y - 1, sourcesData[source].x - 1,
                sourcesData[source].y + 1, sourcesData[source].x + 1, true),
                function (tile) {
                    return tile.terrain !== 'wall';
                });
            for (let tile in terrainData) {
                delete terrainData[tile]['type'];
                delete terrainData[tile]['terrain'];
            }
            sources.push({
                x: sourcesData[source].x,
                y: sourcesData[source].y,
                energyCapacity: sourcesData[source].energyCapacity,
                adjacent: terrainData
            });
            creeps['miners']['max'] += terrainData.length
        }
        creeps.movers.max = sources.length;
        currentRoom.memory.creeps = creeps;
        currentRoom.memory.sources = sources;

        // Structures Data
        let structuresData = currentRoom.lookForAtArea(LOOK_STRUCTURES, 0, 0, 49, 49, true);
        for (let structure in structuresData) {
            if (structuresData[structure].structure.structureType === 'controller') {
                currentRoom.memory.controller = {
                    x: structuresData[structure].x,
                    y: structuresData[structure].y,
                    // level: structuresData[structure].structure.level
                };
            }
        }
        currentRoom.memory.init = true
    }
};

module.exports = roomInit;