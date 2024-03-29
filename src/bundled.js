/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/lib/smartLocation.ts
var SmartMoveLocation = /** @class */ (function () {
    function SmartMoveLocation(x, y, map, name) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.name = name;
    }
    SmartMoveLocation.create = function (x, y, map, name) {
        return new SmartMoveLocation(x, y, map, name);
    };
    SmartMoveLocation.createName = function (name) {
        return new SmartMoveLocation(null, null, null, name);
    };
    SmartMoveLocation.prototype.get = function () {
        if (!this.x && !this.y && !this.map)
            return this.name;
        return this;
    };
    return SmartMoveLocation;
}());

var SmartLocations = /** @class */ (function () {
    function SmartLocations() {
    }
    SmartLocations.TOWN = SmartMoveLocation.create(0, 0, "main", "town");
    SmartLocations.OPEN_STAND = SmartMoveLocation.create(130, -5, "main", "open_stand");
    return SmartLocations;
}());

var BAT1 = SmartMoveLocation.create(20, -350, "cave", "bat1");
var BAT2 = SmartMoveLocation.create(1188, -12, "cave", "bat2");
var BAT_BOSS = SmartMoveLocation.create(342, -1170, "cave", "bbat");
var SNOWMAN = SmartMoveLocation.create(1125, -900, "winterland", "snowman");
var BEE1 = SmartMoveLocation.create(530, 1070, "main", "bee1");
var BEE2 = SmartMoveLocation.create(160, 1490, "main", "bee2");
var BEE3 = SmartMoveLocation.create(635, 740, "main", "bee3");
var POISIO = SmartMoveLocation.create(-170, 1290, "main", "poisio");
var SQUIGTOAD = SmartMoveLocation.create(-1160, 560, "main", "squigtoad");
var TORTOISE = SmartMoveLocation.create(-1127, 1080, "main", "tortoise");
var ICE_ROAMER = SmartMoveLocation.create(823.5, -45.5, "winterland", "iceroamer");
var ICE_ROAMER2 = SmartMoveLocation.create(1512, 104, "winterland", "iceroamer2");

;// CONCATENATED MODULE: ./src/lib/state.ts

var PREVIOUS_SYMBOL = createDivWithColor("&#9737;", "yellow", 10);
var CURRENT_SYMBOL = createDivWithColor("&#9737;", "#A6D422", 10);
var StateMachine = /** @class */ (function () {
    function StateMachine(name, stateEnumAccessor, shouldLog) {
        if (shouldLog === void 0) { shouldLog = false; }
        this.name = name;
        this.stateEnumAccessor = stateEnumAccessor;
        this.shouldLog = shouldLog;
        this._stateLastSetTime = {};
        this._currentStateSetTime = new Date();
    }
    Object.defineProperty(StateMachine.prototype, "previousState", {
        get: function () {
            return this._previousState;
        },
        set: function (value) {
            this._previousState = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "previousStateSetDurationMs", {
        get: function () {
            return this._previousStateSetDurationMs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "currentState", {
        get: function () {
            return this._currentState;
        },
        set: function (newState) {
            if (newState === this._currentState)
                return; // TODO: is this fine? game_log(`State error: setting indetical ${newState}`);
            this._previousState = this.currentState;
            this._previousStateSetDurationMs = this._currentStateSetTime ? mssince(this._currentStateSetTime) : 0;
            this._currentState = newState;
            this._currentStateSetTime = new Date();
            this._stateLastSetTime[newState.toString()] = this._currentStateSetTime;
            if (this.shouldLog)
                this.logState();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "currentStateSetTime", {
        get: function () {
            return this._currentStateSetTime;
        },
        enumerable: false,
        configurable: true
    });
    StateMachine.prototype.getStateLastSetTime = function (state, timeIn) {
        if (timeIn === void 0) { timeIn = TimeIn.SECONDS; }
        var lastSetTime = this._stateLastSetTime[state.toString()];
        if (!lastSetTime) {
            this._stateLastSetTime[state.toString()] = pastDatePlusMins(60);
        }
        return sinceConvert(this._stateLastSetTime[state.toString()], timeIn);
    };
    Object.defineProperty(StateMachine.prototype, "previousStateDisplay", {
        get: function () {
            return createDivWithColor(this.stateEnumAccessor(this._previousState), "yellow");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "currentStateDisplay", {
        get: function () {
            return createDivWithColor(this.stateEnumAccessor(this._currentState), "#A6D422");
        },
        enumerable: false,
        configurable: true
    });
    StateMachine.prototype.logState = function () {
        if (this.previousState != null && this.currentState != null) {
            getLoggingSystem().addLogMessage(PREVIOUS_SYMBOL + " " + this.name + " " + this.getStateLastSetTime(this.previousState) + "s <br>" + this.previousStateDisplay, "t_previous_state_" + this.name, 60000);
            getLoggingSystem().addLogMessage(CURRENT_SYMBOL + " " + this.name + " " + this.getStateLastSetTime(this.currentState) + "s <br>" + this.currentStateDisplay, "t_current_state_" + this.name, 60000);
        }
    };
    return StateMachine;
}());


;// CONCATENATED MODULE: ./src/systems/system.ts
var System = /** @class */ (function () {
    function System() {
    }
    System.prototype.beforeBusy = function () { };
    System.prototype.tick = function () { };
    return System;
}());


;// CONCATENATED MODULE: ./src/systems/combat/combatSystem.ts
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var C_IGNORE_MONSTER = ["Target Automatron", "Puppy"];
var C_BOSS_MONSTER = ["Dracul", "Phoenix", "Green Jr.", "Golden Bat"];
var C_WORLD_BOSS_MONSTER = ["Grinch", "Snowman", "Franky"];
var CombatDifficulty;
(function (CombatDifficulty) {
    CombatDifficulty[CombatDifficulty["EASY"] = 1] = "EASY";
    CombatDifficulty[CombatDifficulty["MEDIUM"] = 2] = "MEDIUM";
    CombatDifficulty[CombatDifficulty["HARD"] = 3] = "HARD";
    CombatDifficulty[CombatDifficulty["DEATH"] = 4] = "DEATH";
})(CombatDifficulty || (CombatDifficulty = {}));
var CombatState;
(function (CombatState) {
    CombatState[CombatState["WB"] = -99] = "WB";
    CombatState[CombatState["B"] = -9] = "B";
    CombatState[CombatState["NO_ENEMY"] = -1] = "NO_ENEMY";
    CombatState[CombatState["ATK_ME"] = 0] = "ATK_ME";
    CombatState[CombatState["EASY"] = 1] = "EASY";
    CombatState[CombatState["FOLLOW"] = 2] = "FOLLOW";
    CombatState[CombatState["NEAR"] = 99] = "NEAR";
})(CombatState || (CombatState = {}));
var CombatSystem = /** @class */ (function (_super) {
    __extends(CombatSystem, _super);
    function CombatSystem() {
        var _this = _super.call(this) || this;
        _this.stuckThreshold = 10;
        _this.stuck = 0;
        _this.preAttackFunc = function () { };
        _this.postAttackFunc = function () { };
        _this._stateMachine = new StateMachine(_this.getLogIcon(), function (state) { return CombatState[state]; });
        return _this;
    }
    Object.defineProperty(CombatSystem.prototype, "stateMachine", {
        get: function () {
            return this._stateMachine;
        },
        enumerable: false,
        configurable: true
    });
    CombatSystem.prototype.getName = function () {
        return "CombatSystem";
    };
    CombatSystem.prototype.getLogIcon = function () {
        return createDivWithColor("&#128924;", "orange", 10);
    };
    CombatSystem.prototype.setPreAttack = function (func) {
        this.preAttackFunc = func;
    };
    CombatSystem.prototype.setPostAttack = function (func) {
        this.postAttackFunc = func;
    };
    CombatSystem.prototype.attack = function (target) {
        if (!is_in_range(target)) {
            move(character.x + (target.x - character.x) / 2, character.y + (target.y - character.y) / 2);
            if (character.real_x === character.from_x && character.real_y === character.from_y)
                this.stuck++;
            if (this.stuck > this.stuckThreshold) {
                utils_getLocationSystem().smartMove({ x: target.x, y: target.y }, "stuck-move");
                this.stuck = 0;
            }
        }
        else if (can_attack(target)) {
            this.preAttackFunc(target);
            if (is_in_range(target, "attack"))
                attack(target);
            this.postAttackFunc(target);
            this.stuck = 0;
        }
    };
    /**
     * Priority:
     *  1. Follow the party leaders target
     *  2. Kill world bosses
     *  3. Kill monsters targeting me
     *  3. Find bosses
     *  4. Find the closest monster [non-boss/non-ignored] (repeat this in case of respawns)
     */
    CombatSystem.prototype.getTarget = function () {
        var target;
        // Kill NON BOSS monsters targeting me
        var monsterTargetingMe = this.findNonBossMonsterTargeting();
        // Pick world boss next
        var worldBossTarget = this.getWorldBossTarget();
        // Pick boss monster
        var bossTarget = this.getBossTarget();
        // Pick a free target if the difficulty is below MEDIUM combat difficulty
        var freeBeatableTarget = this.getFreeTarget(CombatDifficulty.MEDIUM);
        // find the party leader's target
        var partyLeaderTarget = getPartySystem().getPartyLeaderTarget();
        // always world boss first, otherwise it'll create edge cases where hostile monsters attack me
        // and i switch target which will switch servers on me
        if (worldBossTarget) {
            target = worldBossTarget;
            this._stateMachine.currentState = CombatState.WB;
        }
        else if (monsterTargetingMe) {
            target = monsterTargetingMe;
            this._stateMachine.currentState = CombatState.ATK_ME;
        }
        else if (bossTarget) {
            target = bossTarget;
            this._stateMachine.currentState = CombatState.B;
        }
        else if (freeBeatableTarget) {
            target = freeBeatableTarget;
            this._stateMachine.currentState = CombatState.EASY;
        }
        else if (partyLeaderTarget) {
            target = partyLeaderTarget;
            this._stateMachine.currentState = CombatState.FOLLOW;
        }
        else {
            // 0 - Find nearest monster
            target = this.getNearestMonster();
            this._stateMachine.currentState = CombatState.NEAR;
        }
        if (!target) {
            this._stateMachine.currentState = CombatState.NO_ENEMY;
        }
        return target;
    };
    CombatSystem.prototype.getWorldBossTarget = function () {
        var _this = this;
        var entities = getEntities(function (entity) { return _this.isWorldBoss(entity); });
        return entities.length ? entities[0] : null;
    };
    CombatSystem.prototype.getBossTarget = function () {
        var _this = this;
        var entities = getEntities(function (entity) { return _this.isBoss(entity); });
        if (!entities.length)
            return null;
        var bossTarget = entities[0];
        // boss is targeting one of our party members, attack back
        if (getPartySystem().partyMembers.includes(bossTarget.target))
            return bossTarget;
        var combatPartyMemberCount = 0;
        var combatPartyMemberTargetCount = 0;
        var combatPartyMembers = getPartySystem().combatPartyMembers;
        for (var i in combatPartyMembers) {
            var party_member = combatPartyMembers[i];
            var player = get_player(party_member);
            if (player && distance(character, player) < 300) {
                combatPartyMemberCount++;
            }
            if ((player === null || player === void 0 ? void 0 : player.target) === bossTarget.id) {
                combatPartyMemberTargetCount++;
            }
        }
        if (combatPartyMemberCount != 3 && combatPartyMemberTargetCount != 3) {
            getPartySystem().assembleCombatMembers();
            bossTarget = null;
        }
        return bossTarget;
    };
    CombatSystem.prototype.getFreeTarget = function (combatDifficultyThreshold) {
        var _this = this;
        return this.getNearestMonster(function (monster) {
            var isTargetedByParty = false;
            // check if target is free; exclude if not
            getPartySystem().combatPartyMembers.forEach(function (member) {
                var _a;
                if (((_a = parent.entities[member]) === null || _a === void 0 ? void 0 : _a.target) === monster.id) {
                    isTargetedByParty = true;
                }
            });
            var targetTooDifficult = _this.combatDifficulty(monster) > combatDifficultyThreshold;
            return isTargetedByParty || targetTooDifficult;
        });
    };
    CombatSystem.prototype.calculateDamage = function (attacker, defender) {
        return attacker.attack * (1 - (defender.armor / 100) * .1); // every 100 armor is about 10% +/- diminishing
    };
    CombatSystem.prototype.combatDifficulty = function (monster) {
        // Calculate number of attacks per second and find out how many attacks a monster can do in the time
        // my character can
        var numMonsterAttackInPlayerAttacks = function (numAttacks) {
            var mAtkPerSecond = 1 / monster.frequency;
            var cAtkPerSecond = 1 / character.frequency;
            return Math.floor((numAttacks * cAtkPerSecond) / mAtkPerSecond);
        };
        // TODO: range, incorporate evasion, incorporate pierce // rpiercing // apiercing
        // reflection
        // life steal
        // Attack count TO KILL calculation
        var acutalCharDmg = this.calculateDamage(character, monster);
        var numAttacksToKillMonster = Math.ceil(monster.hp / acutalCharDmg);
        var damageSuffered = numMonsterAttackInPlayerAttacks(numAttacksToKillMonster) * this.calculateDamage(monster, character);
        var percentHpRemaining = (character.max_hp - damageSuffered) / character.max_hp;
        if (percentHpRemaining > .8) {
            return CombatDifficulty.EASY;
        }
        // Medium: Can kill monsters within 10 attacks && lose up to 50% HP
        else if (percentHpRemaining > .5) {
            return CombatDifficulty.MEDIUM;
        }
        else if (percentHpRemaining > .2) {
            debugLog("HARD: " + monster.name + " (HP:" + monster.max_hp + "/ATK:" + monster.attack + ".\n\t\t\t\n-> numAtks: " + numAttacksToKillMonster + " | numAtksMonster: " + numMonsterAttackInPlayerAttacks(numAttacksToKillMonster) + "\n\t\t\t\n---> -" + damageSuffered + "HP (" + percentHpRemaining + ")\n\n", "diffculty", 10000);
            return CombatDifficulty.HARD;
        }
        return CombatDifficulty.DEATH;
    };
    CombatSystem.prototype.getTargetedMonster = function () {
        if (parent.ctarget && !parent.ctarget.dead && parent.ctarget.type === "monster")
            return parent.ctarget;
        return null;
    };
    CombatSystem.prototype.getNearestMonster = function (excludeCondition) {
        if (excludeCondition === void 0) { excludeCondition = function () { return false; }; }
        var target = null;
        var minDistance = 999999;
        for (var id in parent.entities) {
            var current = parent.entities[id];
            // if(current.type != "monster" || !current.visible || current.dead) continue;
            if (current.type != "monster" || current.dead)
                continue;
            if (!can_move_to(current))
                continue;
            if (this.isBoss(current))
                continue;
            if (this.isIgnoredMonster(current))
                continue;
            if (excludeCondition(current))
                continue;
            var currentDistance = distance(character, current);
            if (currentDistance < minDistance) {
                minDistance = currentDistance;
                target = current;
            }
        }
        return target;
    };
    CombatSystem.prototype.findNonBossMonsterTargeting = function (target) {
        var _this = this;
        if (target === void 0) { target = character; }
        var entities = getEntities(function (current) {
            return current.type === "monster" && !_this.isBoss(current) && current.target === target.name && distance(character, current) < character.range;
        });
        return entities.length ? entities[0] : null;
    };
    CombatSystem.prototype.isIgnoredMonster = function (target) {
        return C_IGNORE_MONSTER.includes(target === null || target === void 0 ? void 0 : target.name);
    };
    CombatSystem.prototype.isBoss = function (target) {
        return C_BOSS_MONSTER.includes(target === null || target === void 0 ? void 0 : target.name);
    };
    CombatSystem.prototype.isWorldBoss = function (target) {
        return C_WORLD_BOSS_MONSTER.includes(target === null || target === void 0 ? void 0 : target.name);
    };
    CombatSystem.prototype.findTarget = function () {
        var target = this.getTarget();
        if (!target) {
            return null;
        }
        this.currentTarget = target;
        return target;
    };
    return CombatSystem;
}(System));

var NoOpCombat = /** @class */ (function (_super) {
    __extends(NoOpCombat, _super);
    function NoOpCombat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoOpCombat.prototype.tick = function () {
        return;
    };
    return NoOpCombat;
}(CombatSystem));


;// CONCATENATED MODULE: ./src/systems/location/locationSystem.ts
var locationSystem_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var LocationState;
(function (LocationState) {
})(LocationState || (LocationState = {}));
var LocationSystem = /** @class */ (function (_super) {
    locationSystem_extends(LocationSystem, _super);
    function LocationSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocationSystem.prototype.getName = function () {
        return "LocationSystem";
    };
    LocationSystem.prototype.getLogIcon = function () {
        return createDivWithColor("&#128099;", "purple", 10);
    };
    LocationSystem.prototype.smartMove = function (dest, destinationName) {
        if (isStandOpen())
            close_stand();
        this.destination = dest;
        this.destinationName = destinationName;
        this.lastDestinationChangeAt = new Date();
        this.setLocation(destinationName);
        return smart_move(dest);
    };
    LocationSystem.prototype.getSmartMoveLocation = function (smartMoveLoc) {
        return smartMoveLoc ? smartMoveLoc : {
            map: character.map,
            x: character.real_x - 5,
            y: character.real_y + 5,
            smart: smart
        };
    };
    LocationSystem.prototype.setLocation = function (location) {
        parent.currentLocation = location;
    };
    return LocationSystem;
}(System));

var NoOpLocation = /** @class */ (function (_super) {
    locationSystem_extends(NoOpLocation, _super);
    function NoOpLocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NoOpLocation;
}(LocationSystem));


;// CONCATENATED MODULE: ./src/systems/location/soloLocation.ts
var soloLocation_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();





var whitelistedWorldBosses = [];
var worldBossSmartMoveLocation = {};
var SoloLocation = /** @class */ (function (_super) {
    soloLocation_extends(SoloLocation, _super);
    function SoloLocation(mobDestination, locationChangeIntervalMin) {
        var _this = _super.call(this) || this;
        _this.mobDestination = mobDestination;
        _this.locationChangeIntervalMin = locationChangeIntervalMin;
        _this.lastDestinationChangeAt = pastDatePlusMins(locationChangeIntervalMin + 1);
        parent.currentLocation = "?";
        return _this;
    }
    SoloLocation.prototype.beforeBusy = function () {
        var _a;
        if (parent.S.grinch && parent.S.grinch.live) {
            if (parent.S.grinch.hp < 1000000) { // try to move to kane when less than 1m hp
                if (!AlDataClient.data.Kane && canCall("fetchNpcInfo", "alData", 5000)) {
                    AlDataClient.fetchData();
                }
                if (((_a = AlDataClient.data.Kane) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    for (var i = 0; i < AlDataClient.data.Kane.length; i++) {
                        var kane = AlDataClient.data.Kane[i];
                        if (kane.serverRegion === server.region && kane.serverIdentifier === server.id && sinceConvert(new Date(kane.lastSeen), TimeIn.MINUTES) < 5) {
                            utils_getLocationSystem().smartMove(kane, "kane");
                            return;
                        }
                    }
                }
            }
            if (!this.previousGrinchLocation) {
                this.previousGrinchLocation = SmartMoveLocation.create(parent.S.grinch.x, parent.S.grinch.y, parent.S.grinch.map, "grinch");
            }
            if (secSince(this.lastDestinationChangeAt) > 10 && getCombatSystem().stateMachine.currentState != CombatState.WB) {
                var currentGrinchLocation = SmartMoveLocation.create(parent.S.grinch.x, parent.S.grinch.y, parent.S.grinch.map, "grinch");
                if (!smart.moving || !isWithinSquare(this.previousGrinchLocation, currentGrinchLocation, 200)) {
                    this.smartMove(parent.S["grinch"], "grinch");
                    this.lastDestinationChangeAt = new Date();
                }
                this.previousGrinchLocation = currentGrinchLocation;
            }
        }
    };
    SoloLocation.prototype.tick = function () {
        // TODO: grinch is special, remove after event is over
        var grinch = getAlWorldBoss("grinch");
        if (parent.S.grinch && parent.S.grinch.live) {
            // no-op, handled in beforeBusy()
        }
        else if (grinch && timeTillWorldBoss(grinch) <= 0) { // grinch is live
            changeServer(grinch.serverRegion, grinch.serverIdentifier);
        }
        // Engaged in boss/worldboss, do not move
        else if (getCombatSystem().stateMachine.currentState === CombatState.WB || getCombatSystem().stateMachine.currentState === CombatState.B) {
            if (sinceConvert(getCombatSystem().stateMachine.currentStateSetTime, TimeIn.SECONDS) > 10) {
                this.forceNextLocation();
            }
        }
        else if (parent.S.holidayseason && !character.s.holidayspirit) {
            this.smartMove("town", "xmas-buff").then(function () {
                parent.socket.emit("interaction", { type: "newyear_tree" });
            });
            return;
        }
        else {
            var sinceWb = getCombatSystem().stateMachine.getStateLastSetTime(CombatState.WB);
            var sinceB = getCombatSystem().stateMachine.getStateLastSetTime(CombatState.B);
            if (sinceWb > 30 && sinceB > 30) {
                this.moveToNextLocation();
            }
            else {
                debugLog("sinceWb: " + sinceWb + " | sinceB: " + sinceB, "location_debug!");
            }
        }
    };
    SoloLocation.prototype.forceNextLocation = function () {
        this.lastDestinationChangeAt = pastDatePlusMins(this.locationChangeIntervalMin + 1);
    };
    SoloLocation.prototype.moveToNextLocation = function () {
        var nextLocation;
        var bossSpawningSoon = false;
        // always goes to bosses in order
        for (var boss in whitelistedWorldBosses) {
            var worldBossName = whitelistedWorldBosses[boss];
            var worldBoss = isWorldBossReady(worldBossName);
            if (!worldBossSmartMoveLocation[worldBossName])
                debugLog("No SmartLocation found for " + worldBossName);
            if (worldBoss) {
                if (worldBoss.serverIdentifier != server.id || worldBoss.serverRegion != server.region) {
                    changeServer(worldBoss.serverRegion, worldBoss.serverIdentifier);
                    return;
                }
                nextLocation = parent.S[worldBossName].live ? parent.S[worldBossName] : worldBossSmartMoveLocation[worldBossName];
                this.nextLocationName = worldBossName;
                this.forceNextLocation();
                bossSpawningSoon = true;
            }
        }
        // if no boss is spawning soon and we considered the data from AlData, switch server back if applicable
        if (!bossSpawningSoon && ("I" != server.id || "US" != server.region)) {
            changeServer("US", "I");
        }
        if (!nextLocation) {
            if (typeof this.mobDestination === "string") {
                nextLocation = this.nextLocationName = this.mobDestination;
            }
            else {
                nextLocation = this.mobDestination.get();
                this.nextLocationName = this.mobDestination.name;
            }
        }
        if (this.nextLocationName === parent.currentLocation) {
            return;
        }
        if (mssince(this.lastDestinationChangeAt) > minutesInMs(this.locationChangeIntervalMin)) {
            this.smartMove(nextLocation, this.nextLocationName);
            this.lastDestinationChangeAt = new Date();
        }
    };
    return SoloLocation;
}(LocationSystem));


;// CONCATENATED MODULE: ./src/lib/aldata/earthiverseData.ts

var AlDataClient = /** @class */ (function () {
    function AlDataClient() {
    }
    AlDataClient.fetchData = function () {
        if (whitelistedWorldBosses.length === 0)
            return;
        //create XMLHttpRequest object
        var xhr = new XMLHttpRequest();
        //triggered when the response is completed
        xhr.onload = function () {
            if (xhr.status === 200) {
                //parse JSON datax`x
                var data = JSON.parse(xhr.responseText);
                data.forEach(function (alNpcInfoData) {
                    if (!AlDataClient.data[alNpcInfoData.type]) {
                        AlDataClient.data[alNpcInfoData.type] = [];
                    }
                    AlDataClient.data[alNpcInfoData.type].push(alNpcInfoData);
                });
            }
            else if (xhr.status === 404) {
                console.log("No records found");
            }
        };
        //open a get request with the remote server URL
        xhr.open("GET", "https://aldata.earthiverse.ca/monsters/" + whitelistedWorldBosses.join(","));
        //send the Http request
        xhr.send();
    };
    AlDataClient.data = {};
    return AlDataClient;
}());


;// CONCATENATED MODULE: ./src/lib/utils.ts

var GLOBAL_FUNCTIONS = [z, zUi, zStart, zStop, zStopAll, zGiveaway];
function getPartySystem() {
    return parent.partySystem;
}
function getInventorySystem() {
    return parent.inventorySystem;
}
function getCombatSystem() {
    return parent.combatSystem;
}
function getLoggingSystem() {
    return parent.loggingSystem;
}
function utils_getLocationSystem() {
    return parent.locationSystem;
}
function pastDatePlusMins(minutes) {
    return new Date(new Date().getTime() - minutesInMs(minutes));
}
function getCharFunction() {
    return parent.characterFunction;
}
function minutesInMs(min) {
    return 1000 * 60 * min;
}
function secSince(date) {
    return mssince(date) / 1000;
}
function getEntities(filterBy, doSomething) {
    var entities = [];
    for (var i in parent.entities) {
        var entity = parent.entities[i];
        if (filterBy(entity)) {
            if (doSomething)
                doSomething(entity);
            entities.push(entity);
        }
    }
    return entities;
}
function getHpPercent(target) {
    if (target === void 0) { target = character; }
    return target.hp / target.max_hp;
}
function getMpPercent(target) {
    if (target === void 0) { target = character; }
    return target.mp / target.max_mp;
}
function isStandOpen() {
    return character.stand != false;
}
function isQBusy() {
    return Object.keys(character.q).length != 0;
}
function isWorldBossReady(bossName) {
    var parentWorldBoss = getParentWorldBoss(bossName);
    var isSpawningSoonParent = msConvert(timeTillWorldBoss(parentWorldBoss), TimeIn.MINUTES) < 1.5;
    // prioritize current server
    if (parentWorldBoss && (parentWorldBoss.live || isSpawningSoonParent)) {
        return parentWorldBoss;
    }
    var alWorldBoss = getAlWorldBoss(bossName);
    var isSpawningSoonAl = msConvert(timeTillWorldBoss(alWorldBoss), TimeIn.MINUTES) < 1.5;
    if (alWorldBoss && (alWorldBoss.live || isSpawningSoonAl)) {
        return alWorldBoss;
    }
    return null;
}
function getParentWorldBoss(bossName) {
    var worldBosses = getWorldBosses();
    if (!worldBosses[bossName])
        return null;
    return worldBosses[bossName];
}
function getAlWorldBoss(bossName) {
    if (AlDataClient.data[bossName] && AlDataClient.data[bossName].length) {
        var alWorldBossData = AlDataClient.data[bossName][0];
        // AlDataClient.alData[bossName].forEach(adata => console.log(`${adata.eventname} (${adata.live}) ${adata.spawn}`));
        return WorldBoss.create(alWorldBossData);
    }
    return null;
}
/**
 * TODO: This is bad; using string html elements requires the browser to parse the data and then create/insert the dom element
 *
 * Instead, the better way would be to create DOM elments and re-using them and hiding/showing them if needed
 */
function createDivWithColor(text, color, size) {
    return "<div style=\"" + (size ? "font-size:" + size + "px;" : "") + " color:" + color + "; display: inline; padding-bottom: 1px; padding-top: 1px;\">" + text + "</div>";
}
var TimeIn;
(function (TimeIn) {
    TimeIn[TimeIn["MILISECONDS"] = 0] = "MILISECONDS";
    TimeIn[TimeIn["SECONDS"] = 1] = "SECONDS";
    TimeIn[TimeIn["MINUTES"] = 2] = "MINUTES";
    TimeIn[TimeIn["DAYS"] = 3] = "DAYS";
})(TimeIn || (TimeIn = {}));
function msConvert(ms, timeIn) {
    switch (timeIn) {
        case TimeIn.MILISECONDS: return ms;
        case TimeIn.SECONDS: return ms / 1000;
        case TimeIn.MINUTES: return ms / (60 * 1000);
        case TimeIn.DAYS: return ms / (24 * 60 * 1000);
        default: {
            game_log("Don't recgonize " + timeIn);
            return -1;
        }
    }
}
function sinceConvert(date, timeIn) {
    return msConvert(mssince(date), timeIn);
}
function timeTillWorldBoss(worldBoss) {
    if (!worldBoss || !worldBoss.spawn)
        return Number.MAX_SAFE_INTEGER;
    var bossSpawnTime = new Date(worldBoss.spawn);
    var currentTime = new Date();
    var timeRemaining = bossSpawnTime.getTime() - currentTime.getTime();
    return timeRemaining;
}
function isWithinSquare(previousLocation, targetLocation, size) {
    var destinationX = targetLocation.x;
    var destinationY = targetLocation.y;
    var currDestinationX = previousLocation.x;
    var currDestinationY = previousLocation.y;
    return Math.abs(destinationX - currDestinationX) < size && Math.abs(destinationY - currDestinationY) < size;
}
function isCharacterWithin(targetLocation, size) {
    if (character.map != targetLocation.map)
        return false;
    var destinationX = targetLocation.x;
    var destinationY = targetLocation.y;
    var currDestinationX = character.real_x;
    var currDestinationY = character.real_y;
    return Math.abs(destinationX - currDestinationX) <= size && Math.abs(destinationY - currDestinationY) <= size;
}
function changeServer(region, id) {
    if (character.controller)
        return; // don't let iframe characters switch servers
    if (region === server.region && id === server.id)
        return; // don't switch servers to the same server
    var minutesSinceLogin = sinceConvert(parent.loginDate, TimeIn.MINUTES);
    getLoggingSystem().addLogMessage(region + "_" + id + "_" + minutesSinceLogin, "changeServer");
    // proxy characters should not invoke change_server
    if (minutesSinceLogin >= 1) {
        parent.loginDate = new Date();
        parent.changingServers = true;
        change_server(region, id);
    }
    else {
        debugLog("--> " + region + "_" + id + " - " + minutesSinceLogin + "m ago...", "loggedin_ago");
    }
}
function changeServers(server) {
    switch (server) {
        case ServerEnum.ASIA_1:
            change_server("ASIA", "I");
            break;
        case ServerEnum.EU_1:
            change_server("EU", "I");
            break;
        case ServerEnum.EU_2:
            change_server("EU", "II");
            break;
        case ServerEnum.EU_PVP:
            change_server("EU", "PVP");
            break;
        case ServerEnum.US_1:
            change_server("US", "I");
            break;
        case ServerEnum.US_2:
            change_server("US", "II");
            break;
        case ServerEnum.US_3:
            change_server("US", "III");
            break;
        case ServerEnum.US_PVP:
            change_server("US", "PVP");
            break;
        default: game_log("Server " + server + " is not recognized");
    }
}
function getWorldBosses() {
    var worldbosses = {};
    for (var bossName in parent.S) {
        var bossDetails = parent.S[bossName];
        worldbosses[bossName] = new WorldBoss(bossName, bossDetails.x, bossDetails.y, bossDetails.live, bossDetails.map, bossDetails.hp, bossDetails.max_hp, bossDetails.target, bossDetails.spawn, server.region, server.id);
    }
    return worldbosses;
}
function timeRemainingInSeconds(timeThresholdInSeconds, dateTime) {
    return Math.trunc(timeThresholdInSeconds - secSince(dateTime));
}
function trimString(inputString, stringLength) {
    if (stringLength === void 0) { stringLength = 3; }
    return inputString.substring(0, Math.min(stringLength, inputString.length));
}
function fixAddLog() {
    if (parent.addLogFixed) {
        return;
    }
    var oldAddLog = parent.add_log;
    var regex = /killed|gold/;
    parent.add_log = function (message, color) {
        if (!message.match(regex)) {
            oldAddLog(message, color);
        }
    };
    parent.addLogFixed = true;
}
function modifyUi() {
    if (parent.modifyUi || character.controller) { // iframe characater
        return;
    }
    parent.modifyUi = true; // DO NOT MOVE AS IT CRASHES ON bottomPanel.insertBefore LINE
    var iFrameList = parent.$('#iframelist')[0];
    var bottomPanel = parent.$('#bottommid')[0];
    var pausedUi = parent.$("#pausedui")[0];
    bottomPanel.insertBefore(iFrameList, pausedUi);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logException(name, exception) {
    debugLog(name + ": " + exception, "exception");
    console.log(name + ": " + exception);
}
var loggedDebug = {};
function debugLog(message, key, ms) {
    if (key === void 0) { key = ""; }
    if (ms === void 0) { ms = 5000; }
    if (!key.length) {
        for (var i = 0; i < message.length; i++) {
            if (i % 2 == 0)
                key += message[i];
        }
    }
    if (!loggedDebug[key] || mssince(loggedDebug[key]) > ms) {
        game_log(message);
        loggedDebug[key] = new Date();
    }
}
var throttleMap = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function canCall(fName, inputString, ms) {
    var throttleKey = inputString + "_" + fName;
    if (!throttleMap[throttleKey] || mssince(throttleMap[throttleKey]) > ms) {
        throttleMap[throttleKey] = new Date();
        return true;
    }
    return false;
}
// export function addButtonToUI(buttonText: string, func: Function) {
// 	const button = `div class="gamebutton promode" onclick="${func.name}()">MY_LABEL</div>`;
// }
/**
 * Snippet executor runs in an iFrame. In order for the iFrame to get access to these functions, they need
 * to be added to the IFRAME'S <head>.
 * - $('iframe#maincode')[0].contentWindow.document.getElementsByTagName("head")[0];
 *
 * The main DOM (parent.document) does not have this <script> in the <head> because everything gets executed in the iFrame
 * - document. (iframe)
 * - parent.document (main dom)
 */
function addGlobalFunctions() {
    // Hack to make z() work - this puts the function name in, which gets evaluated to be the 
    // reference of the actual function again and not the function name itself in game
    var code = "let GLOBAL_FUNCTIONS = [";
    GLOBAL_FUNCTIONS.forEach(function (f) {
        code += f.name + ",";
    });
    code = code.substring(0, code.length - 1) + "];\n";
    GLOBAL_FUNCTIONS.forEach(function (f) {
        code += f.toString() + "\n";
    });
    var library = document.createElement("script");
    library.type = "text/javascript";
    library.text = code;
    library.onerror = onerror || function () { game_log("load_code: Failed to load"); };
    document.getElementsByTagName("head")[0].appendChild(library);
}
function z() {
    var functionList = "";
    GLOBAL_FUNCTIONS.forEach(function (f) {
        functionList += f.name + ", ";
    });
    game_log("Available Functions: [" + functionList + "]");
}
function zStart(name, slot) {
    if (slot) {
        start_character(name, slot);
    }
    else {
        start_character(name, "webpack");
    }
    setTimeout(function () {
        zUi();
    }, 5000);
}
function zStop(name) {
    stop_character(name);
}
function zStopAll() {
    ["Zetd", "Zettex", "Zetchant"].forEach(function (member) { return stop_character(member); });
}
function zUi() {
    // parent.$('#bottomrightcorner')[0].style.display = "flex";
    // parent.$('#bottomrightcorner .xpsui')[0].style.height = "30px";
    var iFrameList = parent.$('#iframelist')[0];
    iFrameList.style.display = "flex";
    var iframes = parent.$('#iframelist iframe');
    for (var i in iframes) {
        var iframe = iframes[i];
        if (!iframe.contentDocument)
            continue;
        iframe.style.height = "240px";
        iframe.contentDocument.body.style.marginTop = "1px";
        iframe.contentDocument.body.style.marginLeft = "";
        iframe.contentDocument.body.style.marginRight = "";
        iframe.contentDocument.body.style.marginBottom = "";
        iframe.contentDocument.body.getElementsByTagName("div")[0].style.fontSize = "8px";
        iframe.contentDocument.body.getElementsByTagName("div")[0].style.marginBottom = "";
        iframe.contentDocument.body.getElementsByTagName("div")[0].style.border = "";
        iframe.contentDocument.body.getElementsByTagName("div")[1].style.fontSize = "15px";
    }
}
function getRealCharactersData() {
    var mainWindow = parent.global ? parent : parent.parent.parent;
    var iframes = mainWindow.$('iframe');
    return Array.from(Array(iframes.length).keys()).map(function (index) { return iframes[index].contentWindow.character; }).reduce(function (chars, char) {
        chars[char.id] = char;
        return chars;
    }, {});
}
function zGiveaway() {
    for (var id in parent.entities) {
        var entity = parent.entities[id];
        if (entity.id != character.id) {
            for (var slot_name in entity.slots) {
                var slot = entity.slots[slot_name];
                if (slot && slot.giveaway) {
                    if (!slot.list.includes(character.id)) {
                        game_log("Joining [" + entity.name + "] giveaway (" + slot_name + ", " + entity.id + ", " + slot.rid + ")");
                        parent.join_giveaway(slot_name, entity.id, slot.rid);
                    }
                }
            }
        }
    }
}
var ServerEnum;
(function (ServerEnum) {
    ServerEnum[ServerEnum["ASIA_1"] = 0] = "ASIA_1";
    ServerEnum[ServerEnum["EU_1"] = 1] = "EU_1";
    ServerEnum[ServerEnum["EU_2"] = 2] = "EU_2";
    ServerEnum[ServerEnum["EU_PVP"] = 3] = "EU_PVP";
    ServerEnum[ServerEnum["US_1"] = 4] = "US_1";
    ServerEnum[ServerEnum["US_2"] = 5] = "US_2";
    ServerEnum[ServerEnum["US_3"] = 6] = "US_3";
    ServerEnum[ServerEnum["US_PVP"] = 7] = "US_PVP";
})(ServerEnum || (ServerEnum = {}));
var UpgradeItem = /** @class */ (function () {
    function UpgradeItem(name, maxRefine, upgradeType, autoBuy) {
        if (upgradeType === void 0) { upgradeType = UpgradeType.UPGRADE; }
        if (autoBuy === void 0) { autoBuy = true; }
        this.name = name;
        this.maxRefine = maxRefine;
        this.upgradeType = upgradeType;
        this.autoBuy = autoBuy;
    }
    return UpgradeItem;
}());

var UpgradeType;
(function (UpgradeType) {
    UpgradeType[UpgradeType["COMPOUND"] = 0] = "COMPOUND";
    UpgradeType[UpgradeType["UPGRADE"] = 1] = "UPGRADE";
})(UpgradeType || (UpgradeType = {}));
var VendItem = /** @class */ (function () {
    function VendItem() {
        this.quantity = 1;
    }
    return VendItem;
}());

var FindItemParameters = /** @class */ (function () {
    function FindItemParameters() {
    }
    return FindItemParameters;
}());

/**
 * {
    "snowman": {
        "x": 804.5379240488363,
        "y": -869.248421494252,
        "live": true,
        "map": "winterland",
        "hp": 6600,
        "max_hp": 6600
    },
    "icegolem": {
        "x": 874.7500300154555,
        "y": 474.8436881022569,
        "live": true,
        "map": "winterland",
        "hp": 16000000,
        "max_hp": 16000000
    },
    "franky": {
        "x": -355.42647315357243,
        "y": 175.4011095021466,
        "live": true,
        "map": "level2w",
        "hp": 120000000,
        "max_hp": 120000000
    }
}
 */
var WorldBoss = /** @class */ (function () {
    function WorldBoss(name, x, y, live, map, hp, maxHp, target, spawn, serverRegion, serverIdentifier) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.live = live;
        this.map = map;
        this.hp = hp;
        this.maxHp = maxHp;
        this.target = target;
        this.spawn = spawn;
        this.serverRegion = serverRegion;
        this.serverIdentifier = serverIdentifier;
    }
    WorldBoss.create = function (alWorldBossData) {
        var live = alWorldBossData.estimatedRespawn
            ? new Date(alWorldBossData.estimatedRespawn).getTime() - new Date().getTime() <= 0
            : false;
        return new WorldBoss(alWorldBossData.type, alWorldBossData.x, alWorldBossData.y, live, alWorldBossData.map, alWorldBossData.hp, alWorldBossData.hp, alWorldBossData.target, alWorldBossData.estimatedRespawn, alWorldBossData.serverRegion, alWorldBossData.serverIdentifier);
    };
    return WorldBoss;
}());

// TODO: game events
// http://adventure.land/docs/code/game/events
// TODO: char events
// http://adventure.land/docs/code/character/events

;// CONCATENATED MODULE: ./src/characters/character.ts


var CharacterFunction = /** @class */ (function () {
    function CharacterFunction(skills, usePercent) {
        if (usePercent === void 0) { usePercent = 75; }
        this.skills = skills;
        this.usePercent = usePercent;
        this.lastHpPotionUsedAt = new Date();
        this.lastMpPotionUsedAt = new Date();
    }
    CharacterFunction.prototype.getSkills = function () {
        return this.skills;
    };
    CharacterFunction.prototype.beforeBusy = function () {
        this.mpPotUse();
        this.hpPotUse();
        loot();
    };
    CharacterFunction.prototype.setup = function () {
        fixAddLog();
        addGlobalFunctions();
        modifyUi();
        parent.loginDate = new Date(); // prevent spam change_server
        setInterval(function () { return AlDataClient.fetchData(); }, 30000);
    };
    CharacterFunction.prototype.hpPotUse = function () {
        if (is_on_cooldown("use_hp") || safeties && mssince(this.lastHpPotionUsedAt) < min(200, character.ping * 3))
            return;
        var used = true;
        if (getHpPercent() < this.usePercent / 100)
            use_skill('use_hp'); // leaving it as is
        else
            used = false;
        if (used)
            this.lastHpPotionUsedAt = new Date();
    };
    CharacterFunction.prototype.mpPotUse = function () {
        if (is_on_cooldown("use_hp") || safeties && mssince(this.lastMpPotionUsedAt) < min(200, character.ping * 3))
            return;
        var used = true;
        if (getMpPercent() < this.usePercent / 100)
            use_skill('use_mp');
        else
            used = false;
        if (used)
            this.lastMpPotionUsedAt = new Date();
    };
    return CharacterFunction;
}());

var Character = /** @class */ (function () {
    function Character(characterFunction, combatSystem, inventorySystem, locationSystem, loggingSystem, partySystem) {
        this.characterFunction = characterFunction;
        this.combatSystem = combatSystem;
        this.inventorySystem = inventorySystem;
        this.locationSystem = locationSystem;
        this.loggingSystem = loggingSystem;
        this.partySystem = partySystem;
        this.started = false;
        this.systems = [loggingSystem, locationSystem, combatSystem, partySystem, inventorySystem];
    }
    Character.prototype.start = function (ms) {
        var _this = this;
        if (ms === void 0) { ms = 250; }
        if (this.started)
            return;
        game_log("Starting " + this.characterFunction.getName() + " with " + ms + "ms per interval");
        this.started = true;
        // leave it here so we can assign it when the game is loaded with parent available
        // This is so we can get access to the systems for a given character from anywhere
        parent.characterFunction = this.characterFunction;
        parent.combatSystem = this.combatSystem;
        parent.inventorySystem = this.inventorySystem;
        parent.partySystem = this.partySystem;
        parent.locationSystem = this.locationSystem;
        parent.loggingSystem = this.loggingSystem;
        this.characterFunction.setup();
        setInterval(function () {
            if (character.rip) {
                respawn();
                parent.currentLocation = "?";
                return;
            }
            if (parent.changingServers) {
                return;
            }
            _this.characterFunction.beforeBusy();
            _this.systemFuncBeforeBusy();
            if (is_moving(character) || smart.moving || isQBusy())
                return;
            _this.characterFunction.tick();
            _this.systemFuncTick();
        }, ms);
    };
    Character.prototype.systemFuncBeforeBusy = function () {
        this.systems.forEach(function (system) {
            system.beforeBusy();
        });
    };
    Character.prototype.systemFuncTick = function () {
        this.systems.forEach(function (system) {
            system.tick();
        });
    };
    return Character;
}());


;// CONCATENATED MODULE: ./src/lib/skills.ts
var skills_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

function useSkill(skill, target) {
    if (!canUseSkill(skill, target))
        return false;
    if (skill instanceof Skill) {
        use_skill(skill.name, target);
    }
    else {
        use_skill(skill, target);
    }
    return true;
}
function buffEveryone(skill, timeLeftMs) {
    if (timeLeftMs === void 0) { timeLeftMs = 0; }
    getEntities(function (entity) { return entity.player && !entity.npc && distance(character, entity) < skill.range; }, function (entity) { return buff(skill, entity, timeLeftMs); });
}
function buff(skill, target, timeLeftMs) {
    if (target === void 0) { target = character; }
    if (timeLeftMs === void 0) { timeLeftMs = 0; }
    // can't replace buff from other people
    if (Object.keys(target.s).length === 0
        || !target.s[skill.name]
        || (target.s[skill.name].f === character.name && target.s[skill.name].ms < timeLeftMs)) {
        return useSkill(skill, target);
    }
    return false;
}
function canUseSkill(skill, target) {
    if (skill instanceof Skill) {
        var hasCharacterReq = checkCharReqs(character, skill.charReq);
        var hasItems = checkItemReqs(skill.itemReq);
        var hasMp = character.mp >= skill.mpCost;
        if (!hasCharacterReq) {
            debugLog("Doesn't meet character requirements for " + skill.name);
        }
        if (!hasItems) {
            debugLog("Doesn't meet item requirements for " + skill.name);
        }
        if (!hasMp) {
            debugLog("Not enough MP for " + skill.name);
        }
        return hasCharacterReq && hasItems && hasMp && !is_on_cooldown(skill.name) && (!target || (target && is_in_range(target, skill.name)));
    }
    return !is_on_cooldown(skill) && (target && is_in_range(target, skill));
}
function checkCharReqs(target, charReq) {
    return target.level >= charReq.level
        && target.int >= charReq.int
        && target.dex >= charReq.dex
        && target.str >= charReq.str
        && target.vit >= charReq.vit;
}
function checkItemReqs(itemReq) {
    return !itemReq || getInventorySystem().findItem({ name: itemReq.name }) != -1
        || (itemReq.slot && character.slots[itemReq.slot].name === itemReq.name);
}
var Skill = /** @class */ (function () {
    function Skill(details) {
        this.name = details.name;
        this.mpCost = details.mpCost ? details.mpCost : 0;
        this.charReq = details.charReq ? details.charReq : { level: 0, int: 0, str: 0, vit: 0, dex: 0 };
        this.charReq.level = this.charReq.level ? this.charReq.level : 0;
        this.charReq.int = this.charReq.int ? this.charReq.int : 0;
        this.charReq.dex = this.charReq.dex ? this.charReq.dex : 0;
        this.charReq.str = this.charReq.str ? this.charReq.str : 0;
        this.charReq.vit = this.charReq.vit ? this.charReq.vit : 0;
        this.cooldown = details.cooldown ? details.cooldown : 0;
        this.range = details.range ? details.range : 9999;
        this.duration = details.duration ? details.duration : 0;
        this.isBuff = details.isBuff ? details.isBuff : false;
        this.itemReq = details.itemReq;
    }
    return Skill;
}());

// TODO: go through each skill and find the damage
var Skills = /** @class */ (function () {
    function Skills() {
        this.scare = new Skill({ name: "scare", mpCost: 50, cooldown: 5, itemReq: { name: "jacko", slot: "orb" } });
        this.town = new Skill({ name: "useTown" });
    }
    return Skills;
}());

var WarriorSkills = /** @class */ (function (_super) {
    skills_extends(WarriorSkills, _super);
    function WarriorSkills() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.agitate = new Skill({ name: "agitate", mpCost: 420, charReq: { level: 68 }, cooldown: 2.2, range: 320 });
        _this.charge = new Skill({ name: "charge", cooldown: 40, duration: 3.2 });
        _this.cleave = new Skill({ name: "cleave", mpCost: 720, charReq: { level: 52 }, cooldown: 1.2, range: 160 });
        _this.dash = new Skill({ name: "dash", mpCost: 120 });
        _this.hardshell = new Skill({ name: "hardshell", mpCost: 480, charReq: { level: 60 }, cooldown: 16, duration: 8 });
        _this.stomp = new Skill({ name: "stomp", mpCost: 120, charReq: { level: 52 }, cooldown: 24, range: 400, duration: 3.2 });
        _this.taunt = new Skill({ name: "taunt", mpCost: 40, cooldown: 3, range: 200 });
        _this.warcry = new Skill({ name: "warcry", mpCost: 320, charReq: { level: 70 }, cooldown: 60, range: 600, duration: 8 });
        return _this;
    }
    return WarriorSkills;
}(Skills));

var RogueSkills = /** @class */ (function (_super) {
    skills_extends(RogueSkills, _super);
    function RogueSkills() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.invis = new Skill({ name: "invis", cooldown: 12 });
        _this.mentalburst = new Skill({ name: "mentalburst", mpCost: 180, cooldown: 0.9, range: character.range * 1.2 + 32, charReq: { int: 64 } });
        _this.pcoat = new Skill({ name: "pcoat", mpCost: 600, cooldown: 50, duration: 7, itemReq: { name: "poison" } });
        _this.quickpunch = new Skill({ name: "quickpunch", mpCost: 240, cooldown: .25, range: character.range });
        _this.quickstab = new Skill({ name: "quickstab", mpCost: 320, cooldown: .25, range: character.range });
        _this.rspeed = new Skill({ name: "rspeed", mpCost: 320, charReq: { level: 40 }, cooldown: 0.1, range: 320, duration: 2700 });
        _this.shadowstrike = new Skill({ name: "shadowstrike", mpCost: 320, charReq: { level: 70 }, cooldown: 1.2, range: 360, itemReq: { name: "shadowstone" } });
        return _this;
    }
    return RogueSkills;
}(Skills));

var PriestSkills = /** @class */ (function (_super) {
    skills_extends(PriestSkills, _super);
    function PriestSkills() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.absorb = new Skill({ name: "absorb", mpCost: 200, cooldown: .4, range: 240, charReq: { level: 55 } });
        _this.curse = new Skill({ name: "curse", mpCost: 400, cooldown: 5, duration: 5 });
        _this.darkblessing = new Skill({ name: "darkblessing", mpCost: 900, cooldown: 60, range: 600, charReq: { level: 70 }, duration: 8 });
        _this.partyheal = new Skill({ name: "partyheal", mpCost: 400, cooldown: 0.2 });
        _this.phaseout = new Skill({ name: "phaseout", mpCost: 200, cooldown: 4, charReq: { level: 64 }, duration: 5, itemReq: { name: "shadowstone" } });
        _this.revive = new Skill({ name: "revive", mpCost: 500, cooldown: 0.2, range: 240, itemReq: { name: "essenceoflife" } });
        return _this;
    }
    return PriestSkills;
}(Skills));

var MerchantSkills = /** @class */ (function (_super) {
    skills_extends(MerchantSkills, _super);
    function MerchantSkills() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fishing = new Skill({ name: "fishing", mpCost: 120, charReq: { level: 16 }, cooldown: 2880, range: 15 });
        _this.massproduction = new Skill({ name: "massproduction", mpCost: 20, charReq: { level: 30 }, cooldown: 0.05 });
        _this.massproductionpp = new Skill({ name: "massproductionpp", mpCost: 200, charReq: { level: 60 }, cooldown: 0.05 });
        _this.mcourage = new Skill({ name: "mcourage", mpCost: 2400, charReq: { level: 70 }, cooldown: 2 });
        _this.mining = new Skill({ name: "mining", mpCost: 120, charReq: { level: 16 }, cooldown: 7440, range: 15 });
        _this.mluck = new Skill({ name: "mluck", mpCost: 10, charReq: { level: 40 }, cooldown: 0.1, range: 320, duration: 3600 });
        _this.throw = new Skill({ name: "throw", mpCost: 200, charReq: { level: 60 }, cooldown: 0.4, range: 200 });
        return _this;
    }
    return MerchantSkills;
}(Skills));

var PaladinSkills = /** @class */ (function (_super) {
    skills_extends(PaladinSkills, _super);
    function PaladinSkills() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PaladinSkills;
}(Skills));

var RangerSkills = /** @class */ (function (_super) {
    skills_extends(RangerSkills, _super);
    function RangerSkills() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RangerSkills;
}(Skills));

var MageSkills = /** @class */ (function (_super) {
    skills_extends(MageSkills, _super);
    function MageSkills() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.alchemy = new Skill({ name: "alchemy", mpCost: 347, cooldown: 8, charReq: { level: 40 } });
        _this.blink = new Skill({ name: "blink", mpCost: 1600, cooldown: 1.2 });
        _this.manaBurst = new Skill({ name: "burst", mpCost: 1600, cooldown: 6 }); // 0.555 pure damage for each MP
        _this.controlledManaBurst = new Skill({ name: "cburst", mpCost: 80, cooldown: 0.24, charReq: { level: 75 } });
        _this.energize = new Skill({ name: "energize", cooldown: 4, charReq: { level: 20 }, range: 320 });
        _this.entangle = new Skill({ name: "entangle", mpCost: 360, cooldown: 40, duration: 5, charReq: { level: 72 }, range: 480, itemReq: { name: "essenceofnature" } });
        _this.light = new Skill({ name: "light", mpCost: 2000 });
        _this.magiport = new Skill({ name: "magiport", mpCost: 900 });
        _this.reflectiveShield = new Skill({ name: "reflection", mpCost: 540, cooldown: 30, charReq: { level: 60 }, range: 320 });
        return _this;
    }
    return MageSkills;
}(Skills));

var SkillDetail = /** @class */ (function () {
    function SkillDetail() {
    }
    return SkillDetail;
}());

var CharacterRequirement = /** @class */ (function () {
    function CharacterRequirement() {
    }
    return CharacterRequirement;
}());


;// CONCATENATED MODULE: ./src/characters/zetd-priest.ts
var zetd_priest_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var ZetdPriest = /** @class */ (function (_super) {
    zetd_priest_extends(ZetdPriest, _super);
    function ZetdPriest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZetdPriest.prototype.getName = function () {
        return "Zetd";
    };
    ZetdPriest.prototype.tick = function () {
        this.heal_party_members_percent(85);
        for (var id in parent.entities) {
            var current = parent.entities[id];
            if ((getCombatSystem().isBoss(current) || getCombatSystem().isWorldBoss(current)) && current.target && current.target != character.name) {
                useSkill(this.getSkills().darkblessing);
                if (!current.s.cursed) {
                    useSkill(this.getSkills().curse, current);
                    break;
                }
            }
        }
        getPartySystem().checkConditionOnPartyAndCount(function (member) { return character.name != member.name && character.x === member.x && character.y === member.y; }, function () { return move(character.x + 5, character.y - 5); });
    };
    ZetdPriest.prototype.heal_party_members_percent = function (percent) {
        // const condition_count = getPartySystem().checkConditionOnPartyAndCount(
        // 	member => getHpPercent(member) < (percent - 10) / 100,
        // 	() => { }
        // );
        // if (condition_count >= 2)
        // 	getCombatSystem().useSkill("partyheal");
        getPartySystem().useSkillOnParty(function (member) {
            if (getHpPercent(member) < percent / 100) {
                if (can_heal(member) && !is_on_cooldown("heal"))
                    heal(member);
                // else if (distance(character, member) > 150) {
                // 	move(
                // 		character.x+(member.x-character.x)/4,
                // 		character.y+(member.y-character.y)/4
                // 	);
                // }
            }
        });
    };
    return ZetdPriest;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/characters/zettex-rogue.ts
var zettex_rogue_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var ZettexRogue = /** @class */ (function (_super) {
    zettex_rogue_extends(ZettexRogue, _super);
    function ZettexRogue() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZettexRogue.prototype.getName = function () {
        return "Zettex";
    };
    ZettexRogue.prototype.setup = function () {
        var _this = this;
        _super.prototype.setup.call(this);
        getCombatSystem().setPreAttack(function (tar) {
            if (getHpPercent(tar) > 0.8)
                useSkill(_this.getSkills().invis);
        });
    };
    ZettexRogue.prototype.tick = function () {
        buff(this.getSkills().rspeed);
        buffEveryone(this.getSkills().rspeed);
        getPartySystem().checkConditionOnPartyAndCount(function (member) { return character.name != member.name && character.x === member.x && character.y === member.y; }, function () { return move(character.x - 5, character.y - 5); });
    };
    return ZettexRogue;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/lib/cms/cm-potion.ts


function sendBringPotionCommand(name, pot, moveToMe, potQty) {
    if (moveToMe === void 0) { moveToMe = true; }
    if (potQty === void 0) { potQty = 2000; }
    var payload = cms_cmBuilder(BRING_POTION, utils_getLocationSystem().getSmartMoveLocation());
    payload["content"]["pot"] = pot;
    payload["content"]["pot_qty"] = potQty;
    payload["content"]["moveToMe"] = moveToMe;
    cms_sendCharacterMessage(name, payload);
}
function bringPotionReply(name, data) {
    if (!data.moveToMe) {
        send_item(name, locate_item(data.pot), data.pot_qty);
        return;
    }
    if (smart.moving && smart.map === data.map) {
        var destinationX = data.x;
        var destinationY = data.y;
        var currDestinationX = smart.x;
        var currDestinationY = smart.y;
        if (Math.abs(destinationX - currDestinationX) < 100 || Math.abs(destinationY - currDestinationY) < 100) {
            game_log("New destination too close, continuing to old one...");
            return;
        }
    }
    utils_getLocationSystem().smartMove(data, data.pot + "-" + name).then(function () {
        send_item(name, locate_item(data.pot), data.pot_qty);
    });
}

;// CONCATENATED MODULE: ./src/lib/cms/cm-move.ts


function sendComingRequest(name) {
    var payload = cmBuilder(COMING);
    sendCharacterMessage(name, payload);
}
function sendComeToMeCommand(name, data, isReply) {
    if (isReply === void 0) { isReply = false; }
    var payload = cms_cmBuilder(COME_TO_ME, utils_getLocationSystem().getSmartMoveLocation());
    cms_sendCharacterMessage(name, payload, isReply);
}
function sendMoveToCommand(name, smartMoveLoc, isReply) {
    var payload = cmBuilder(MOVE_TO, getLocationSystem().getSmartMoveLocation(smartMoveLoc));
    sendCharacterMessage(name, payload, isReply);
}
function movingToData(name, data) {
    if (data.smart.moving) {
        game_log("Target [" + name + "] is moving... retrying");
        return;
    }
    else if (smart.moving && smart.map === data.map) {
        // i'm moving and is the new coordinate I'm moving to "valid"?
        // i.e. 50x50 within the old destination?
        var destinationX = data.x;
        var destinationY = data.y;
        var currDestinationX = smart.x;
        var currDestinationY = smart.y;
        if (Math.abs(destinationX - currDestinationX) < 100 || Math.abs(destinationY - currDestinationY) < 100) {
            game_log("New destination too close, continuing to old one...");
            return;
        }
    }
    utils_getLocationSystem().smartMove(data, name);
}

;// CONCATENATED MODULE: ./src/lib/cms/cm-inventory.ts

function sendInventoryRequest(name) {
    var payload = cmBuilder(INVENTORY);
    sendCharacterMessage(name, payload);
}
function sendInventoryData(name, data, isReply) {
    var payload = cms_cmBuilder(INVENTORY_PREVIEW);
    payload["content"]["inventory"] = character.items;
    cms_sendCharacterMessage(name, payload, isReply);
}
function inventoryPreview(name, data) {
    preview_item(data.inventory);
}

;// CONCATENATED MODULE: ./src/lib/cms/cms.ts





var cms_COMING = "COMING";
var COME_TO_ME = "COME_TO_ME";
var cms_MOVE_TO = "MOVE_TO";
var BRING_POTION = "BRING_POTION";
var cms_INVENTORY = "INVENTORY";
var INVENTORY_PREVIEW = "INVENTORY_PREVIEW";
var BUFF_ME = "BUFF_ME";
var CM_WHITELIST = ["Zettex", "Zetd", "Zett", "Zetchant", "Zetadin", "Zeter", "Zetx"];
var C_CM_SEND_THRESHOLD = 5; // seconds
var CM_MAP = {
    COMING: sendComeToMeCommand,
    COME_TO_ME: movingToData,
    MOVE_TO: movingToData,
    BRING_POTION: bringPotionReply,
    INVENTORY: sendInventoryData,
    INVENTORY_PREVIEW: inventoryPreview,
    BUFF_ME: handleBuffRequest,
};
function cms_sendCharacterMessage(name, data, isReply) {
    if (isReply === void 0) { isReply = false; }
    if (!isReply && !canCall("sendCharacterMessage", "cm", 1000 * C_CM_SEND_THRESHOLD))
        return;
    log("--> " + name + ": " + data.msg_type);
    send_cm(name, data);
}
/**
2 types of Character Message (CM) flows:
 1. Request --> Reply --> Action
 2. Command
**/
function cms_cmBuilder(msg_type, with_data) {
    if (with_data === void 0) { with_data = new Object(); }
    var payload = {};
    payload["content"] = with_data;
    payload["msg_type"] = msg_type;
    return payload;
}
window.on_cm = function (name, data) {
    if (!CM_WHITELIST.includes(name)) {
        game_log(name + " not allowed to use CMs");
        return;
    }
    log("<== " + name + ": " + data.msg_type);
    if (!CM_MAP[data.msg_type])
        game_log(data.msg_type + " not found!");
    if (isQBusy()) {
        game_log("busy -- ignoring CM");
        return;
    }
    CM_MAP[data.msg_type](name, data.content, true);
};

;// CONCATENATED MODULE: ./src/lib/cms/cm-buff.ts



function sendBuffRequest(name, buffName) {
    var payload = cms_cmBuilder(BUFF_ME, utils_getLocationSystem().getSmartMoveLocation());
    payload["content"]["buff"] = buffName;
    cms_sendCharacterMessage(name, payload);
}
function handleBuffRequest(name, data) {
    if (smart.moving) { // in case multiple people request at the same time
        var destinationX = data.x;
        var destinationY = data.y;
        var currDestinationX = smart.x;
        var currDestinationY = smart.y;
        if (Math.abs(destinationX - currDestinationX) < 100 || Math.abs(destinationY - currDestinationY) < 100) {
            game_log("New destination too close, continuing to old one...");
            return;
        }
    }
    utils_getLocationSystem().smartMove(data, "buff-" + name).then(function () {
        useSkill(data.buff, get_player(name));
    });
}

;// CONCATENATED MODULE: ./src/systems/inventory/inventory.ts
var inventory_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var C_DO_NOT_STORE_ITEM = ["pot", "cscroll", "scroll0", "scroll1", "tracker", "stand", "lostearring"];
var InventorySystem = /** @class */ (function (_super) {
    inventory_extends(InventorySystem, _super);
    function InventorySystem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.potQtyThreshold = 100;
        _this.hpPotName = "hpot1";
        _this.mpPotName = "mpot1";
        return _this;
    }
    InventorySystem.prototype.getName = function () {
        return "InventorySystem";
    };
    InventorySystem.prototype.getLogIcon = function () {
        return createDivWithColor("&#128093;", "", 10);
    };
    InventorySystem.prototype.setPotQtyThreshold = function (num) {
        this.potQtyThreshold = num;
        return this;
    };
    InventorySystem.prototype.restockPotionsAt = function (pot, useCmRestock) {
        if (locate_item(pot) === -1 || character.items[locate_item(pot)].q < this.potQtyThreshold) {
            if (useCmRestock) {
                sendBringPotionCommand(InventorySystem.merchantName, pot);
            }
            else {
                if (smart.moving)
                    return;
                else if (!isCharacterWithin(SmartLocations.TOWN, 100))
                    utils_getLocationSystem().smartMove("town", "town");
                else
                    buy(pot, this.potQtyThreshold);
            }
        }
    };
    InventorySystem.prototype.storage = function (threshold, storeCond) {
        if (threshold === void 0) { threshold = 40; }
        if (storeCond === void 0) { storeCond = function (item) { return !C_DO_NOT_STORE_ITEM.find(function (element) { return item.name.includes(element); }); }; }
        var num_items = this.inventorySize();
        var itemIdxs = [];
        if (num_items >= threshold) {
            if (!smart.moving && character.map != "bank") {
                return utils_getLocationSystem().smartMove("bank", "bank");
            }
            for (var i = 0; i < character.items.length; i++) {
                var item = character.items[i];
                if (!item)
                    continue;
                if (storeCond(item)) {
                    itemIdxs.push(i);
                }
            }
        }
        this.bankItems(itemIdxs);
    };
    InventorySystem.prototype.bankItems = function (itemIdxs) {
        for (var i = 0; i < itemIdxs.length; i++) {
            bank_store(itemIdxs[i]);
        }
    };
    InventorySystem.prototype.inventorySize = function () {
        var num_items = 0;
        for (var i in character.items)
            if (character.items[i])
                num_items++;
        return num_items;
    };
    InventorySystem.prototype.findItem = function (params, items) {
        if (items === void 0) { items = character.items; }
        var foundItems = this.findItems(params, items);
        return foundItems ? foundItems[0] : -1;
    };
    InventorySystem.prototype.findItems = function (params, items) {
        if (items === void 0) { items = character.items; }
        var foundItems = [];
        for (var i = 0; i < items.length; i++) {
            if (!items[i])
                continue;
            if (params.name && items[i].name != params.name)
                continue;
            if (params.maxRefine && items[i].level >= params.maxRefine)
                continue;
            if (params.level && items[i].level != params.level)
                continue;
            foundItems.push(i);
        }
        return (foundItems.length === 0) ? null : foundItems;
    };
    InventorySystem.prototype.sendItems = function (name, startIdx, endIdx) {
        if (startIdx === void 0) { startIdx = 0; }
        if (endIdx === void 0) { endIdx = 42; }
        for (var i = startIdx; i < endIdx; i++) {
            if (!character.items[i]
                || character.items[i].name === "tracker"
                || character.items[i].name.includes("pot"))
                continue;
            send_item(name, i, character.items[i].q);
        }
    };
    InventorySystem.merchantName = "Zetchant";
    return InventorySystem;
}(System));


;// CONCATENATED MODULE: ./src/characters/zett-warrior.ts
var zett_warrior_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();






var ZettWarrior = /** @class */ (function (_super) {
    zett_warrior_extends(ZettWarrior, _super);
    function ZettWarrior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZettWarrior.prototype.getName = function () {
        return "Zett";
    };
    ZettWarrior.prototype.setup = function () {
        _super.prototype.setup.call(this);
        var partyMembers = getPartySystem().partyMembers;
        for (var i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i] === character.name)
                continue;
            start_character(partyMembers[i], "webpack");
        }
        setTimeout(function () {
            zUi();
        }, 30000);
        // for(const server of parent.X.servers) {
        // 	game_log(`Starting ws://${server.addr}:${server.port}`);
        // 	const socket = parent.io(`//${server.addr}:${server.port}`, {transports: ["websocket"], reconnection: true, autoConnect: true})
        // 	socket.on("server_info", (data: any) => {
        // 		// Creates a listener for `server_data` (this is what feeds info in to parent.S)
        // 		if(data && Object.keys(data).length > 0) {
        // 			// There is some sort of data (i.e. not an empty object)
        // 			if(data["franky"]) {
        // 			// franky is alive!
        // 			console.log(`franky is alive on ${server.region} ${server.name}!`)
        // 			console.log(data["franky"])
        // 			} else {
        // 			// franky is not alive, but there might be another special monster's data available
        // 			console.log(`New data for ${server.region} ${server.name}`)
        // 			console.log(data)
        // 			}
        // 		}
        // 	});
        // }
    };
    ZettWarrior.prototype.beforeBusy = function () {
        _super.prototype.beforeBusy.call(this);
        if (smart.moving) {
            useSkill(this.getSkills().charge);
        }
    };
    ZettWarrior.prototype.tick = function () {
        // Party Logic
        this.tauntTargetedPartyMember(function (tar) {
            return tar.type === "monster"
                && tar.target != character.name
                && getCombatSystem().combatDifficulty(tar) > CombatDifficulty.MEDIUM
                && (getPartySystem().partyMembers.includes(tar.target));
        });
        getPartySystem().checkConditionOnPartyAndCount(function (member) { return character.name != member.name && character.real_x === member.real_x && character.real_y === member.real_y; }, function () { return move(character.x + 5, character.y + 5); });
        if (getCombatSystem().stateMachine.currentState === CombatState.WB) {
            useSkill(this.getSkills().warcry);
        }
        if (!character.s.mluck)
            sendBuffRequest(InventorySystem.merchantName, "mluck");
    };
    ZettWarrior.prototype.tauntTargetedPartyMember = function (f_condition) {
        if (!is_on_cooldown("taunt")) {
            for (var id in parent.entities) {
                var current = parent.entities[id];
                if (f_condition(current)) {
                    useSkill(this.getSkills().taunt, current);
                    break;
                }
            }
        }
    };
    return ZettWarrior;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/systems/combat/soloCombat.ts
var soloCombat_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var SoloCombat = /** @class */ (function (_super) {
    soloCombat_extends(SoloCombat, _super);
    function SoloCombat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SoloCombat.prototype.tick = function () {
        var attackTarget = this.findTarget();
        if (!attackTarget)
            return;
        change_target(attackTarget);
        this.attack(attackTarget);
    };
    return SoloCombat;
}(CombatSystem));


;// CONCATENATED MODULE: ./src/systems/debug/logging.ts
var logging_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var C_MESSAGE_TYPE_MERCHANT = "t_merchant";
var C_MESSAGE_TYPE_STALL = "t_stall";
var C_MESSAGE_TYPE_GOLD = "t_gold";
var C_MESSAGE_TYPE_COMPOUND = "t_compound";
var C_MESSAGE_TYPE_UPGRADE = "t_upgrade";
var C_MESSAGE_TYPE_WALKING = "t_walking";
var C_MESSAGE_TYPE_TARGET = "t_target";
var C_ICON_DIV = createDivWithColor("@", "purple");
var NL = "<br>";
var LoggingSystem = /** @class */ (function (_super) {
    logging_extends(LoggingSystem, _super);
    function LoggingSystem() {
        var _this = _super.call(this) || this;
        _this.messageQueue = {};
        _this._logMovement = true;
        _this._logStatus = true;
        _this._logMoney = false;
        _this._logInventory = true;
        _this._logCombat = true;
        _this._logLocation = true;
        _this._logWorldBosses = true;
        _this._itemsShownCount = 0;
        return _this;
    }
    LoggingSystem.prototype.setLogMovement = function (value) {
        this._logMovement = value;
        return this;
    };
    LoggingSystem.prototype.setLogStatus = function (value) {
        this._logStatus = value;
        return this;
    };
    LoggingSystem.prototype.setLogMoney = function (value) {
        this._logMoney = value;
        return this;
    };
    LoggingSystem.prototype.setLogInventory = function (value) {
        this._logInventory = value;
        return this;
    };
    LoggingSystem.prototype.setLogCombat = function (value) {
        this._logCombat = value;
        return this;
    };
    LoggingSystem.prototype.setLogLocation = function (value) {
        this._logLocation = value;
        return this;
    };
    LoggingSystem.prototype.setLogWorldBosses = function (value) {
        this._logWorldBosses = value;
        return this;
    };
    LoggingSystem.prototype.getName = function () {
        return "LoggingSystem";
    };
    LoggingSystem.prototype.getLogIcon = function () {
        throw new Error("Method not implemented.");
    };
    LoggingSystem.prototype.beforeBusy = function () {
        if (!canCall("displayLogMessages", this.getName(), 1000))
            return;
        this.displayLogMessages();
    };
    LoggingSystem.prototype.tick = function () { };
    LoggingSystem.prototype.displayLogMessages = function () {
        // Status Logging
        var hpDiv = createDivWithColor(Math.trunc(getHpPercent() * 100) + "%", "indianred");
        var mpDiv = createDivWithColor(Math.trunc(getMpPercent() * 100) + "%", "lightblue");
        var lvlDiv = createDivWithColor("Lv" + character.level + " (" + Math.trunc(character.xp / character.max_xp * 100) + "%)", "greenyellow");
        var statusLogging = !this._logStatus ? "" : hpDiv + "/" + mpDiv + " | " + lvlDiv;
        // Money Logging
        var moneyLogging = !this._logMoney ? "" : NL + "&#128184; " + character.gold;
        // Inventory Logging
        var inventoryLogging = "";
        if (this._logInventory) {
            var inventorySize = getInventorySystem().inventorySize();
            inventoryLogging = "" + NL + getInventorySystem().getLogIcon() + " " + inventorySize + ": ";
            var itemsSeen = 0;
            for (var i = 0; i < character.items.length; i++) {
                var maybeItem = character.items[i];
                if (!maybeItem)
                    continue;
                itemsSeen++;
                if (itemsSeen <= this._itemsShownCount)
                    continue;
                inventoryLogging += createDivWithColor("" + (maybeItem.level ? "+" + maybeItem.level + " " : "") + maybeItem.name, "yellow");
                this._itemsShownCount++;
                break;
            }
            if (this._itemsShownCount >= inventorySize) {
                this._itemsShownCount = 0;
            }
        }
        // Combat Logging
        var currentTarget = getCombatSystem().currentTarget;
        var combatLogIcon = getCombatSystem().getLogIcon();
        var combatLogging = !this._logCombat ? "" : "" + NL + combatLogIcon + " " + getCombatSystem().stateMachine.previousStateDisplay + "->" + getCombatSystem().stateMachine.currentStateDisplay + "<br>" + combatLogIcon + " (" + sinceConvert(getCombatSystem().stateMachine.currentStateSetTime, TimeIn.SECONDS).toString() + ") " + (currentTarget ? currentTarget.name : "N/A");
        // Movement Logging
        var movementLogging = !this._logMovement || !smart.moving ? "" : NL + (utils_getLocationSystem().getLogIcon() + " " + utils_getLocationSystem().destinationName);
        // Location Logging
        var locationLogging = "";
        if (this._logLocation) {
            var locSystem = utils_getLocationSystem();
            var locChangeSecs = timeRemainingInSeconds(60 * locSystem.locationChangeIntervalMin, locSystem.lastDestinationChangeAt);
            locationLogging = "" + parent.currentLocation;
            if (parent.currentLocation != locSystem.nextLocationName)
                locationLogging += "->" + locSystem.nextLocationName;
            locationLogging = "" + NL + C_ICON_DIV + " " + locationLogging + " " + (locChangeSecs > 0 ? locChangeSecs : "");
        }
        // World Boss Logging
        var wbLogging = "";
        if (this._logWorldBosses) {
            // const trackedWorldBosses = ["grinch"];
            var trackedWorldBosses_1 = [];
            whitelistedWorldBosses.forEach(function (wb) { return trackedWorldBosses_1.push(wb); });
            for (var i = 0; i < trackedWorldBosses_1.length; i++) {
                var wbName = trackedWorldBosses_1[i];
                var worldBoss = void 0, isLive = void 0, timeRemaining = void 0;
                var parentWorldBoss = getParentWorldBoss(wbName);
                var alWorldBoss = getAlWorldBoss(wbName);
                // Check for live status first
                if (parentWorldBoss && parentWorldBoss.live) {
                    worldBoss = parentWorldBoss;
                    isLive = true;
                }
                else if (alWorldBoss && alWorldBoss.live) {
                    worldBoss = alWorldBoss;
                    isLive = true;
                }
                else {
                    // check remaining timer on both bosses
                    var parentTts = timeTillWorldBoss(parentWorldBoss);
                    var alTts = timeTillWorldBoss(alWorldBoss);
                    worldBoss = parentTts < alTts ? parentWorldBoss : alWorldBoss;
                    timeRemaining = parentTts < alTts ? parentTts : alTts;
                }
                if (worldBoss) {
                    if (isLive) {
                        wbLogging += NL + createDivWithColor("[" + worldBoss.serverRegion + "_" + worldBoss.serverIdentifier + "] " + worldBoss.name + " LIVE!", "green");
                    }
                    else if (timeRemaining) {
                        console.log(worldBoss);
                        wbLogging += NL + createDivWithColor("[" + worldBoss.serverRegion + "_" + worldBoss.serverIdentifier + "] " + worldBoss.name + " " + msConvert(timeRemaining, TimeIn.SECONDS) + "s", "green");
                    }
                }
                else {
                    wbLogging += NL + createDivWithColor("[???] " + wbName + ": N/A", "red");
                }
            }
        }
        var display_msg = "" + statusLogging + moneyLogging + inventoryLogging + combatLogging + locationLogging + movementLogging + wbLogging;
        for (var k in this.messageQueue) {
            display_msg += NL;
            display_msg += this.messageQueue[k].message;
        }
        if (display_msg === "")
            return;
        set_message(display_msg);
        for (var k in this.messageQueue) {
            if (mssince(this.messageQueue[k].date) > this.messageQueue[k].ttl) {
                delete this.messageQueue[k];
            }
        }
    };
    LoggingSystem.prototype.addLogMessage = function (message, msg_type, ttlMs) {
        if (ttlMs === void 0) { ttlMs = 1000; }
        if (!msg_type) {
            log(message);
            return;
        }
        this.messageQueue[msg_type] = { message: message, date: new Date(), ttl: ttlMs };
    };
    return LoggingSystem;
}(System));


;// CONCATENATED MODULE: ./src/systems/party.ts
var party_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var PartySystem = /** @class */ (function (_super) {
    party_extends(PartySystem, _super);
    function PartySystem() {
        var _this = _super.call(this) || this;
        // override event handlers
        window.on_party_request = function (name) {
            if (getPartySystem().partyMembers.includes(name))
                accept_party_request(name);
        };
        // override event handlers
        window.on_party_invite = function (name) {
            if (getPartySystem().partyMembers.includes(name))
                accept_party_invite(name);
        };
        return _this;
    }
    PartySystem.prototype.getLogIcon = function () {
        throw new Error("Method not implemented.");
    };
    PartySystem.prototype.setPartyLeader = function (name) {
        this.partyLeader = name;
        return this;
    };
    PartySystem.prototype.setPartyMembers = function (names) {
        var _this = this;
        this.partyMembers = names;
        this.combatPartyMembers = [];
        this.partyMembers.forEach(function (member) {
            if (member != InventorySystem.merchantName)
                _this.combatPartyMembers.push(member);
        });
        return this;
    };
    PartySystem.prototype.getName = function () {
        return "PartySystem";
    };
    PartySystem.prototype.beforeBusy = function () {
        if (character.name === this.partyLeader)
            return;
        if (!parent.party[this.partyLeader] && canCall("sendPartyRequest", this.getName(), 5000)) {
            this.sendPartyRequest();
        }
    };
    PartySystem.prototype.sendPartyRequest = function () {
        send_party_request(this.partyLeader);
    };
    PartySystem.prototype.getPartyLeaderTarget = function () {
        for (var id in parent.entities) {
            var current = parent.entities[id];
            if (current.type === "monster" && current.target === this.partyLeader) {
                return current;
            }
        }
        return null;
    };
    PartySystem.prototype.useSkillOnParty = function (skillBlock) {
        for (var member in parent.party) {
            var partyMember = get_player(member);
            if (!partyMember)
                continue;
            skillBlock(partyMember);
        }
    };
    PartySystem.prototype.checkConditionOnPartyAndCount = function (condCheck, condFunc, onConditionCount) {
        if (onConditionCount === void 0) { onConditionCount = 1; }
        var conditionCount = 0;
        for (var member in parent.party) {
            var partyMember = get_player(member);
            if (!partyMember)
                continue;
            if (condCheck(partyMember)) {
                conditionCount++;
            }
        }
        if (condFunc && conditionCount >= onConditionCount) {
            condFunc();
        }
        return conditionCount;
    };
    PartySystem.prototype.assembleCombatMembers = function () {
        this.combatPartyMembers.forEach(function (name) {
            if (character.name != name) {
                if (!parent.entities[name] || (parent.entities[name] && distance(character, parent.entities[name]) > 200)) {
                    sendComeToMeCommand(name, null, false);
                }
            }
        });
    };
    return PartySystem;
}(System));


;// CONCATENATED MODULE: ./src/characters/zeter-ranger.ts
var zeter_ranger_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ZeterRanger = /** @class */ (function (_super) {
    zeter_ranger_extends(ZeterRanger, _super);
    function ZeterRanger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZeterRanger.prototype.tick = function () {
        return;
    };
    ZeterRanger.prototype.getName = function () {
        return "Zeter";
    };
    return ZeterRanger;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/characters/zetx-mage.ts
var zetx_mage_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ZetxMage = /** @class */ (function (_super) {
    zetx_mage_extends(ZetxMage, _super);
    function ZetxMage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZetxMage.prototype.tick = function () {
        return;
    };
    ZetxMage.prototype.getName = function () {
        return "Zetx";
    };
    return ZetxMage;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/characters/zetadin-paladin.ts
var zetadin_paladin_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var ZetadinPaladin = /** @class */ (function (_super) {
    zetadin_paladin_extends(ZetadinPaladin, _super);
    function ZetadinPaladin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZetadinPaladin.prototype.setup = function () {
        _super.prototype.setup.call(this);
        var partyMembers = getPartySystem().partyMembers;
        for (var i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i] === character.name)
                continue;
            start_character(partyMembers[i], "webpack");
        }
        setTimeout(function () {
            zUi();
        }, 30000);
    };
    ZetadinPaladin.prototype.tick = function () {
        return;
    };
    ZetadinPaladin.prototype.getName = function () {
        return "Zetadin";
    };
    return ZetadinPaladin;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/systems/inventory/useMerchant.ts
var useMerchant_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var C_SEND_ITEM_DISTANCE = 400;
var C_MERCHANT_SEND_GOLD_THRESHOLD = 500000;
var C_INVENTORY_DEFAULT_SIZE = 3; // 2 pots + tracker
var UseMerchant = /** @class */ (function (_super) {
    useMerchant_extends(UseMerchant, _super);
    function UseMerchant(newItemThreshold) {
        if (newItemThreshold === void 0) { newItemThreshold = 2; }
        var _this = _super.call(this) || this;
        _this.newItemThreshold = newItemThreshold;
        return _this;
    }
    UseMerchant.prototype.beforeBusy = function () {
        _super.prototype.beforeBusy.call(this);
        this.transferItemsToMerchant();
    };
    UseMerchant.prototype.tick = function () {
        var _a, _b, _c, _d;
        this.hpPotQty = (_b = (_a = character.items[locate_item(this.hpPotName)]) === null || _a === void 0 ? void 0 : _a.q) !== null && _b !== void 0 ? _b : 0;
        this.mpPotQty = (_d = (_c = character.items[locate_item(this.mpPotName)]) === null || _c === void 0 ? void 0 : _c.q) !== null && _d !== void 0 ? _d : 0;
        this.restockPotionsAt(this.hpPotName, true);
        this.restockPotionsAt(this.mpPotName, true);
    };
    UseMerchant.prototype.transferItemsToMerchant = function () {
        var inventorySize = this.inventorySize();
        var maybeTarget = get_player(InventorySystem.merchantName);
        if (maybeTarget && distance(character, maybeTarget) < C_SEND_ITEM_DISTANCE && canCall("useMerchant", this.getName(), 30000)) {
            this.useMerchant();
        }
        else if (get_party()[InventorySystem.merchantName] && inventorySize > C_INVENTORY_DEFAULT_SIZE + this.newItemThreshold) {
            if (canCall("comeToMeMerchant", this.getName(), 30000)) {
                sendComeToMeCommand(InventorySystem.merchantName);
            }
        }
    };
    UseMerchant.prototype.useMerchant = function () {
        this.sendItems(InventorySystem.merchantName);
        send_gold(InventorySystem.merchantName, character.gold - C_MERCHANT_SEND_GOLD_THRESHOLD);
        var hpPotRequestCount = 20 * this.potQtyThreshold - this.hpPotQty;
        var mpPotRequestCount = 20 * this.potQtyThreshold - this.mpPotQty;
        if (hpPotRequestCount > 0)
            sendBringPotionCommand(InventorySystem.merchantName, this.hpPotName, false, hpPotRequestCount);
        if (mpPotRequestCount > 0)
            sendBringPotionCommand(InventorySystem.merchantName, this.mpPotName, false, mpPotRequestCount);
    };
    return UseMerchant;
}(InventorySystem));


;// CONCATENATED MODULE: ./src/systems/inventory/isMerchant.ts
var isMerchant_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var IsMerchant = /** @class */ (function (_super) {
    isMerchant_extends(IsMerchant, _super);
    function IsMerchant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IsMerchant.prototype.tick = function () {
        this.restockPotionsAt(this.hpPotName, false);
        this.restockPotionsAt(this.mpPotName, false);
        this.storage();
    };
    return IsMerchant;
}(InventorySystem));


;// CONCATENATED MODULE: ./src/characters/merchant/config.ts


var MerchantConfig = /** @class */ (function () {
    function MerchantConfig() {
    }
    MerchantConfig.MERCHANT_SKILLS = new MerchantSkills();
    MerchantConfig.UPGRADE_LIST = [
        // new UpgradeItem("gloves", 1),
        // new UpgradeItem("coat1", 7),
        // new UpgradeItem("pants1", 7),
        // new UpgradeItem("shoes1", 7),
        // new UpgradeItem("helmet1", 7),
        // new UpgradeItem("stinger", 8),
        new UpgradeItem("bow", 6),
        new UpgradeItem("gcape", 7),
        new UpgradeItem("wcap", 7),
        new UpgradeItem("wshoes", 8),
        new UpgradeItem("wbreeches", 8),
        new UpgradeItem("wattire", 8),
        new UpgradeItem("wgloves", 8),
        new UpgradeItem("slimestaff", 7),
        new UpgradeItem("phelmet", 7),
        new UpgradeItem("sshield", 7),
        new UpgradeItem("firestaff", 7),
        new UpgradeItem("fireblade", 7),
        new UpgradeItem("mcape", 6),
        new UpgradeItem("shield", 7),
        new UpgradeItem("ringsj", 4, UpgradeType.COMPOUND),
        new UpgradeItem("hpamulet", 4, UpgradeType.COMPOUND),
        new UpgradeItem("hpbelt", 4, UpgradeType.COMPOUND),
        new UpgradeItem("wbook0", 4, UpgradeType.COMPOUND),
        new UpgradeItem("wbookhs", 2, UpgradeType.COMPOUND),
        new UpgradeItem("strring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("intring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("dexring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("vitring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("strearring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("intearring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("dexearring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("vitearring", 4, UpgradeType.COMPOUND),
        new UpgradeItem("dexamulet", 4, UpgradeType.COMPOUND),
        new UpgradeItem("stramulet", 4, UpgradeType.COMPOUND),
        new UpgradeItem("vitamulet", 4, UpgradeType.COMPOUND),
        new UpgradeItem("intamulet", 4, UpgradeType.COMPOUND),
    ];
    MerchantConfig.VEND_LIST = [
    // { level: 3, name: "ringsj" },
    // { level: 3, name: "hpamulet" },
    // { level: 3, name: "hpbelt" },
    ];
    MerchantConfig.SELL_LIST = [
        { name: "xmace" },
        { name: "iceskates" },
        { name: "gloves" },
        { name: "stinger" },
        { name: "cclaw" },
        { name: "snowball" },
    ];
    return MerchantConfig;
}());


;// CONCATENATED MODULE: ./src/characters/merchant/upgrading.ts




var UpgradingState;
(function (UpgradingState) {
    UpgradingState[UpgradingState["IDLING"] = 0] = "IDLING";
    UpgradingState[UpgradingState["MOVING_BANK"] = 1] = "MOVING_BANK";
    UpgradingState[UpgradingState["ARRIVING_BANK"] = 2] = "ARRIVING_BANK";
    UpgradingState[UpgradingState["SEARCHING_BANK"] = 3] = "SEARCHING_BANK";
    UpgradingState[UpgradingState["STORING_BANK"] = 4] = "STORING_BANK";
    UpgradingState[UpgradingState["MOVING_REFINER"] = 5] = "MOVING_REFINER";
    UpgradingState[UpgradingState["PREPARING"] = 6] = "PREPARING";
    UpgradingState[UpgradingState["STARTING_UPGRADE"] = 7] = "STARTING_UPGRADE";
    UpgradingState[UpgradingState["UPGRADING"] = 8] = "UPGRADING";
    UpgradingState[UpgradingState["UPGRADING_COMPLETE"] = 9] = "UPGRADING_COMPLETE";
})(UpgradingState || (UpgradingState = {}));
var C_MERCHANT_OPENED_BANKS = 8;
var SCROLL_NPC = find_npc(G.npcs.scrolls.id);
var Upgrading = /** @class */ (function () {
    function Upgrading() {
        this._stateMachine = new StateMachine(createDivWithColor("&#128296;", "", 10), function (state) { return UpgradingState[state]; }, true);
        this._stateMachine.currentState = UpgradingState.IDLING;
        this._upgradeQueue = [];
        this.startRefineQueueUpdater();
    }
    Object.defineProperty(Upgrading.prototype, "stateMachine", {
        get: function () {
            return this._stateMachine;
        },
        enumerable: false,
        configurable: true
    });
    Upgrading.prototype.hasItems = function () {
        return this._upgradeQueue.length > 0;
    };
    Upgrading.prototype.startRefineQueueUpdater = function () {
        var _this = this;
        setInterval(function () {
            for (var i = 0; i < MerchantConfig.UPGRADE_LIST.length; i++) {
                var checkUpgradeItem = MerchantConfig.UPGRADE_LIST[i];
                if (Upgrading.canRefineItem(checkUpgradeItem)) {
                    // if upgrade queue has the item, skip
                    for (var j = 0; j < _this._upgradeQueue.length; j++) {
                        if (_this._upgradeQueue[j].name === checkUpgradeItem.name)
                            return;
                    }
                    game_log("Adding " + checkUpgradeItem.name + " to the queue");
                    _this._upgradeQueue.push(checkUpgradeItem);
                }
            }
        }, 1000);
    };
    Upgrading.canRefineItem = function (upgradeItem, inventory) {
        if (inventory === void 0) { inventory = character.items; }
        if (upgradeItem.upgradeType == UpgradeType.COMPOUND) {
            // TODO: can optimize this by caching "active" item being upgraded instead of checking the entire inventory each time
            var items = getInventorySystem().findItems({ name: upgradeItem.name, maxRefine: upgradeItem.maxRefine }, inventory);
            if (!items)
                return false;
            var item_matrix = [];
            for (var i_lvl = 0; i_lvl < upgradeItem.maxRefine; i_lvl++) {
                item_matrix.push([]);
                for (var i = 0; i < items.length; i++) {
                    if (character.items[items[i]].level === i_lvl)
                        item_matrix[i_lvl].push(items[i]);
                }
            }
            for (var i_lvl = 0; i_lvl < upgradeItem.maxRefine; i_lvl++) {
                if (item_matrix[i_lvl].length >= 3) {
                    return true;
                }
            }
            return false;
        }
        else {
            var item_idx = upgradeItem.maxRefine === -1 ? locate_item(upgradeItem.name)
                : getInventorySystem().findItem({ name: upgradeItem.name, maxRefine: upgradeItem.maxRefine }, inventory);
            return item_idx != -1;
        }
    };
    Upgrading.prototype.tick = function () {
        if (this._stateMachine.currentState === UpgradingState.IDLING) {
            this._targetItem = this._upgradeQueue[0];
            if (character.map != "bank")
                utils_getLocationSystem().smartMove("bank", "bank");
            this._stateMachine.currentState = UpgradingState.MOVING_BANK;
        }
        else if (this._stateMachine.currentState === UpgradingState.MOVING_BANK) {
            if (character.map === "bank") {
                this._stateMachine.currentState = UpgradingState.ARRIVING_BANK;
            }
            else if (smart.moving) {
                return;
            }
            else {
                utils_getLocationSystem().smartMove("bank", "bank");
            }
        }
        else if (this._stateMachine.currentState === UpgradingState.ARRIVING_BANK) {
            if (this._targetItem)
                this._stateMachine.currentState = UpgradingState.SEARCHING_BANK;
            else if (this._lastTargetItem)
                this._stateMachine.currentState = UpgradingState.STORING_BANK;
            else
                throw new Error("State Error in " + UpgradingState[UpgradingState.ARRIVING_BANK]);
        }
        else if (this._stateMachine.currentState === UpgradingState.SEARCHING_BANK) {
            this.searchForTargetItem();
            utils_getLocationSystem().smartMove("scrolls", "scrolls");
            this._stateMachine.currentState = UpgradingState.MOVING_REFINER;
        }
        else if (this._stateMachine.currentState === UpgradingState.STORING_BANK) {
            this.storeLastTargetItem();
            this._lastTargetItem = null;
            this._upgradeQueue.shift();
            this._stateMachine.currentState = UpgradingState.IDLING;
        }
        else if (this._stateMachine.currentState === UpgradingState.MOVING_REFINER) {
            if (smart.moving)
                return;
            else if (distance(character, SCROLL_NPC) < 50) {
                this._stateMachine.currentState = UpgradingState.PREPARING;
            }
            else {
                utils_getLocationSystem().smartMove("scrolls", "scrolls");
            }
        }
        else if (this._stateMachine.currentState === UpgradingState.PREPARING) {
            this.handlePreparing();
            this._stateMachine.currentState = UpgradingState.STARTING_UPGRADE;
        }
        else if (this._stateMachine.currentState === UpgradingState.STARTING_UPGRADE) {
            this.handleUpgrading();
            this._stateMachine.currentState = UpgradingState.UPGRADING;
        }
        else if (this._stateMachine.currentState === UpgradingState.UPGRADING) {
            if (isQBusy())
                return; // mid-upgrade
            else if (Upgrading.canRefineItem(this._targetItem)) {
                this._stateMachine.currentState = UpgradingState.PREPARING;
            }
            else {
                this._stateMachine.currentState = UpgradingState.UPGRADING_COMPLETE;
            }
        }
        else if (this._stateMachine.currentState === UpgradingState.UPGRADING_COMPLETE) {
            this._lastTargetItem = this._upgradeQueue[0];
            this._targetItem = null;
            utils_getLocationSystem().smartMove("bank", "bank");
            this._stateMachine.currentState = UpgradingState.MOVING_BANK;
        }
        else {
            throw new Error("Don't recognize state: " + UpgradingState[this._stateMachine.currentState]);
        }
    };
    Upgrading.prototype.searchForTargetItem = function () {
        var takeItemCount = Math.max(0, 39 - getInventorySystem().inventorySize());
        if (takeItemCount === 0)
            return;
        var itemTakenCount = 0;
        for (var packNum = 0; packNum < C_MERCHANT_OPENED_BANKS; packNum++) {
            var packName = "items" + packNum;
            if (!character.bank[packName])
                continue;
            var item = this._targetItem;
            var itemIdxs = getInventorySystem().findItems({ name: item.name, maxRefine: item.maxRefine }, character.bank[packName]);
            if (itemIdxs) {
                for (var idx = 0; idx < itemIdxs.length; idx++) {
                    if (itemTakenCount === takeItemCount)
                        return;
                    game_log("Getting " + item.name + " on " + packName + ": " + idx);
                    bank_retrieve(packName, itemIdxs[idx]);
                    itemTakenCount++;
                }
            }
        }
    };
    Upgrading.prototype.storeLastTargetItem = function () {
        var itemIdxs = [];
        for (var i = 0; i < character.items.length; i++) {
            var item = character.items[i];
            if (!item)
                continue;
            if (item.name === this._lastTargetItem.name)
                itemIdxs.push(i);
        }
        getInventorySystem().bankItems(itemIdxs);
    };
    Upgrading.prototype.handlePreparing = function (useHigherIngredients) {
        if (useHigherIngredients === void 0) { useHigherIngredients = false; }
        if (!smart.moving && distance(character, SCROLL_NPC) > 50) {
            utils_getLocationSystem().smartMove("scrolls", "scrolls");
        }
        else if (this._targetItem.upgradeType === UpgradeType.UPGRADE) {
            var item_idx = this._targetItem.maxRefine === -1 ? locate_item(this._targetItem.name)
                : getInventorySystem().findItem({ name: this._targetItem.name, maxRefine: this._targetItem.maxRefine });
            var grade = item_grade(character.items[item_idx]);
            if (useHigherIngredients && grade + 1 < 2) {
                grade = 1;
            }
            var scrollIdx = locate_item("scroll" + grade);
            if (scrollIdx === -1) {
                buy("scroll" + grade);
            }
        }
        else {
            var items = getInventorySystem().findItems({ name: this._targetItem.name, maxRefine: this._targetItem.maxRefine });
            var item_matrix = [];
            for (var i_lvl = 0; i_lvl < this._targetItem.maxRefine; i_lvl++) {
                item_matrix.push([]);
                for (var i = 0; i < items.length; i++) {
                    if (character.items[items[i]].level === i_lvl)
                        item_matrix[i_lvl].push(items[i]);
                }
            }
            for (var i_lvl = 0; i_lvl < this._targetItem.maxRefine; i_lvl++) {
                if (item_matrix[i_lvl].length >= 3) {
                    items = item_matrix[i_lvl];
                    var itemGrade = item_grade(character.items[items[0]]);
                    if (useHigherIngredients && itemGrade + 1 < 2) {
                        itemGrade = 1;
                    }
                    if (locate_item("cscroll" + itemGrade) === -1) {
                        buy("cscroll" + itemGrade);
                    }
                    return;
                }
            }
        }
    };
    Upgrading.prototype.handleUpgrading = function () {
        game_log("Upgrading " + this._targetItem.name);
        buff(MerchantConfig.MERCHANT_SKILLS.massproductionpp);
        if (this._targetItem.upgradeType === UpgradeType.COMPOUND) {
            this.smartCompound(this._targetItem);
        }
        else {
            this.smartUpgrade(this._targetItem);
        }
    };
    Upgrading.prototype.smartUpgrade = function (upgradeItem, useHigherIngredients) {
        if (useHigherIngredients === void 0) { useHigherIngredients = false; }
        var item_idx = upgradeItem.maxRefine === -1 ? locate_item(upgradeItem.name)
            : getInventorySystem().findItem({ name: upgradeItem.name, maxRefine: upgradeItem.maxRefine });
        var grade = item_grade(character.items[item_idx]);
        if (useHigherIngredients && grade + 1 < 2) {
            grade = 1;
        }
        var scroll_idx = locate_item("scroll" + grade);
        getLoggingSystem().addLogMessage("&#128296; " + upgradeItem.name, "t_upgrading");
        var upgrade_promise = upgrade(item_idx, scroll_idx);
        return upgrade_promise;
    };
    Upgrading.prototype.smartCompound = function (upgradeItem, useHigherIngredients) {
        if (useHigherIngredients === void 0) { useHigherIngredients = false; }
        var items = getInventorySystem().findItems({ name: upgradeItem.name, maxRefine: upgradeItem.maxRefine });
        var item_matrix = [];
        for (var i_lvl = 0; i_lvl < upgradeItem.maxRefine; i_lvl++) {
            item_matrix.push([]);
            for (var i = 0; i < items.length; i++) {
                if (character.items[items[i]].level === i_lvl)
                    item_matrix[i_lvl].push(items[i]);
            }
        }
        for (var i_lvl = 0; i_lvl < upgradeItem.maxRefine; i_lvl++) {
            if (item_matrix[i_lvl].length >= 3) {
                items = item_matrix[i_lvl];
                var grade = item_grade(character.items[items[0]]);
                if (useHigherIngredients && grade + 1 < 2) {
                    grade = 1;
                }
                getLoggingSystem().addLogMessage("&#128296; " + upgradeItem.name, "t_upgrading");
                return compound(items[0], items[1], items[2], locate_item("cscroll" + grade));
            }
        }
        // TODO: throw new Error(`Should not happen: ${this._stateMachine.currentState}`);
    };
    return Upgrading;
}());


;// CONCATENATED MODULE: ./src/characters/merchant/cleaning.ts





var CleaningState;
(function (CleaningState) {
    CleaningState[CleaningState["IDLING"] = 0] = "IDLING";
    CleaningState[CleaningState["MOVING_BANK"] = 1] = "MOVING_BANK";
    CleaningState[CleaningState["BANKING"] = 2] = "BANKING";
    CleaningState[CleaningState["CLEANING"] = 3] = "CLEANING";
})(CleaningState || (CleaningState = {}));
var Cleaning = /** @class */ (function () {
    function Cleaning() {
        this._cleanQueue = [];
        this._stateMachine = new StateMachine(createDivWithColor("&#9780;", "", 10), function (state) { return CleaningState[state]; }, true);
        this._stateMachine.currentState = CleaningState.IDLING;
        this.startCheckCleanLoop();
    }
    Object.defineProperty(Cleaning.prototype, "stateMachine", {
        get: function () {
            return this._stateMachine;
        },
        enumerable: false,
        configurable: true
    });
    Cleaning.prototype.hasItems = function () {
        return this._cleanQueue.length > 0;
    };
    Cleaning.prototype.tick = function () {
        if (this._stateMachine.currentState === CleaningState.IDLING) {
            if (character.map != "bank")
                utils_getLocationSystem().smartMove("bank", "bank");
            this._stateMachine.currentState = CleaningState.MOVING_BANK;
        }
        else if (this._stateMachine.currentState === CleaningState.MOVING_BANK) {
            if (smart.moving) {
                return;
            }
            else if (character.map === "bank") {
                this._stateMachine.currentState = CleaningState.BANKING;
            }
            else {
                utils_getLocationSystem().smartMove("bank", "bank");
            }
        }
        else if (this._stateMachine.currentState === CleaningState.BANKING) {
            this.bankItems();
            this.getItemsFromBank();
            this.sortBankItems();
            this._stateMachine.currentState = CleaningState.IDLING;
        }
        else {
            throw new Error("Don't recognize state: " + this._stateMachine.currentStateDisplay);
        }
    };
    Cleaning.prototype.bankItems = function () {
        var itemIdxs = [];
        for (var i = 0; i < this._cleanQueue.length; i++) {
            itemIdxs.push(this._cleanQueue[i].idx);
        }
        getInventorySystem().bankItems(itemIdxs);
        this._cleanQueue = [];
    };
    Cleaning.prototype.sortBankItems = function () {
        // TODO:
    };
    Cleaning.prototype.getItemsFromBank = function () {
        var takeItemCount = Math.max(0, 35 - getInventorySystem().inventorySize());
        if (takeItemCount === 0)
            return;
        var itemTakenCount = 0;
        for (var packNum = 0; packNum < C_MERCHANT_OPENED_BANKS; packNum++) {
            var packName = "items" + packNum;
            if (!character.bank[packName])
                continue;
            for (var i = 0; i < MerchantConfig.SELL_LIST.length; i++) {
                var item = MerchantConfig.SELL_LIST[i];
                var itemIdxs = getInventorySystem().findItems({ name: item.name }, character.bank[packName]);
                if (itemIdxs) {
                    for (var idx = 0; idx < itemIdxs.length; idx++) {
                        if (itemTakenCount === takeItemCount)
                            return;
                        game_log("Getting " + item.name + " on " + packName + ": " + idx);
                        bank_retrieve(packName, itemIdxs[idx]);
                        itemTakenCount++;
                    }
                }
            }
            // TODO: implement getting upgradeable items from bank
            // for (let i = 0; i < MerchantConfig.UPGRADE_LIST.length; i++) {
            // 	const item = MerchantConfig.UPGRADE_LIST[i];
            // 	if (Upgrading.canRefineItem(item, character.bank[packName])) {
            // 		const itemIdxs = getInventorySystem().findItems({name: item.name, maxRefine: item.maxRefine}, character.bank[packName])
            // 		if (itemIdxs) {
            // 			for (let idx = 0; idx < itemIdxs.length; idx++) {
            // 				if (itemTakenCount === takeItemCount) return;
            // 				game_log(`Getting ${item.name} on ${packName}: ${idx}`);
            // 				bank_retrieve(packName, itemIdxs[idx]);
            // 				itemTakenCount++;
            // 			}
            // 		}
            // 	}
            // }
        }
    };
    Cleaning.prototype.startCheckCleanLoop = function () {
        var _this = this;
        setInterval(function () {
            var _loop_1 = function (i) {
                var item = character.items[i];
                if (!item)
                    return "continue";
                if (C_DO_NOT_STORE_ITEM.find(function (element) { var _a; return (_a = item.name) === null || _a === void 0 ? void 0 : _a.includes(element); }))
                    return "continue";
                var bankItem = true;
                for (var i_1 in MerchantConfig.UPGRADE_LIST) {
                    var upgradeItem = MerchantConfig.UPGRADE_LIST[i_1];
                    if (upgradeItem.name === item.name) {
                        bankItem = false;
                    }
                }
                for (var i_2 in MerchantConfig.VEND_LIST) {
                    var v_item = MerchantConfig.VEND_LIST[i_2];
                    if (v_item.name === item.name) {
                        bankItem = false;
                    }
                }
                for (var i_3 in MerchantConfig.SELL_LIST) {
                    var s_item = MerchantConfig.SELL_LIST[i_3];
                    if (s_item.name === item.name) {
                        bankItem = false;
                    }
                }
                // if clean queue has the item, skip
                for (var j = 0; j < _this._cleanQueue.length; j++) {
                    if (_this._cleanQueue[j].item.name === item.name)
                        bankItem = false;
                }
                if (bankItem) {
                    game_log("Will clean " + item.name);
                    _this._cleanQueue.push({ idx: i, item: item });
                }
            };
            for (var i = 0; i < character.items.length; i++) {
                _loop_1(i);
            }
        }, 1000);
    };
    return Cleaning;
}());


;// CONCATENATED MODULE: ./src/characters/merchant/vending.ts


var C_MERCHANT_SELL_ITEM_VALUE_MULT = 4;
var Vending = /** @class */ (function () {
    function Vending() {
        this.vendingItemQueue = [];
        this.registerVendingItemQueueUpdater();
    }
    Vending.prototype.tick = function () {
        if (!isCharacterWithin(SmartLocations.OPEN_STAND, 10) && !smart.moving) {
            utils_getLocationSystem().smartMove(SmartLocations.OPEN_STAND, SmartLocations.OPEN_STAND.name);
        }
        else if (!smart.moving && !isStandOpen() && isCharacterWithin(SmartLocations.OPEN_STAND, 5)) {
            open_stand(0);
        }
        else if (isStandOpen() && this.vendingItemQueue.length) {
            this.registerVendingItemsFromQueue();
        }
    };
    Vending.prototype.registerVendingItemsFromQueue = function () {
        // TODO:
    };
    Vending.prototype.registerVendingItemQueueUpdater = function () {
        // TODO:
    };
    Vending.prototype.getStandSlots = function () {
        if (!isStandOpen())
            return null;
        var stand_slots = [];
        for (var i = 1; i <= 16; i++) {
            var slot_name = "trade" + i;
            if (!character.slots[slot_name]) {
                stand_slots.push(slot_name);
            }
        }
        return stand_slots;
    };
    Vending.prototype.registerStandItems = function (items, price) {
        var open_stand_slots = this.getStandSlots();
        if (!open_stand_slots || open_stand_slots.length === 0)
            return;
        var stand_idx = 0;
        for (var i in items) {
            var item = items[i];
            var vend_item_idx = getInventorySystem().findItem({ name: item.name, level: item.level });
            if (vend_item_idx != -1) {
                var list_price = price ? price : item_value(item) * C_MERCHANT_SELL_ITEM_VALUE_MULT;
                trade(vend_item_idx, open_stand_slots[stand_idx++], list_price);
                log("Listing " + item.name + " for " + list_price + " gold");
            }
        }
    };
    return Vending;
}());


;// CONCATENATED MODULE: ./src/characters/merchant/zetchant.ts









var Zetchant = /** @class */ (function () {
    function Zetchant(partySystem, inventorySystem, loggingSystem) {
        this.partySystem = partySystem;
        this.inventorySystem = inventorySystem;
        this.loggingSystem = loggingSystem;
    }
    Zetchant.prototype.start = function () {
        this.upgrading = new Upgrading();
        this.cleaning = new Cleaning();
        this.vending = new Vending();
        // global variables
        parent.locationSystem = new NoOpLocation();
        parent.inventorySystem = this.inventorySystem;
        parent.loggingSystem = this.loggingSystem;
        parent.partySystem = this.partySystem;
        parent.combatSystem = new NoOpCombat();
        // legacy system to be removed loop
        this.legacyLoop();
        // start loops
        this.mainLoop();
        this.startBuffLoop();
        this.startSellingLoop();
        // Global Stuff
        addGlobalFunctions();
        fixAddLog();
        modifyUi();
        zUi();
    };
    Zetchant.prototype.mainLoop = function () {
        var _this = this;
        setInterval(function () {
            if (character.rip)
                respawn();
            _this.loggingSystem.beforeBusy();
            _this.loggingSystem.tick();
            _this.upgrading.stateMachine.logState();
            _this.cleaning.stateMachine.logState();
            if (_this.upgrading.hasItems()) {
                _this.upgrading.tick();
            }
            else if (_this.cleaning.hasItems()) {
                _this.cleaning.tick();
            }
            else if (!smart.moving && !isCharacterWithin(SmartLocations.TOWN, 500)) {
                utils_getLocationSystem().smartMove("town", "town");
            }
            else {
                _this.vending.tick();
            }
        }, 250);
    };
    Zetchant.prototype.legacyLoop = function () {
        var _this = this;
        setInterval(function () {
            _this.partySystem.beforeBusy();
            _this.partySystem.tick();
            _this.inventorySystem.beforeBusy();
            _this.inventorySystem.tick();
            if (getHpPercent() < .5)
                use_skill('use_hp'); // leaving it as is
            if (getMpPercent() < .75)
                use_skill('use_mp'); // leaving it as is
        }, 1000);
    };
    /**
     * Buff everyone including myself every X interval
     */
    Zetchant.prototype.startBuffLoop = function (ms) {
        if (ms === void 0) { ms = 1000; }
        setInterval(function () {
            buff(MerchantConfig.MERCHANT_SKILLS.mluck);
            buffEveryone(MerchantConfig.MERCHANT_SKILLS.mluck, minutesInMs(45));
        }, ms);
    };
    Zetchant.prototype.startSellingLoop = function () {
        setInterval(function () {
            if (!isCharacterWithin(SmartLocations.TOWN, 500))
                return;
            // TODO: remove after christmas
            // if(!character.s.holidayspirit)
            // 	parent.socket.emit("interaction",{type:"newyear_tree"});
            for (var i = 0; i < character.items.length; i++) {
                var item = character.items[i];
                if (!item)
                    continue;
                for (var j = 0; j < MerchantConfig.SELL_LIST.length; j++) {
                    if (item.name === MerchantConfig.SELL_LIST[j].name)
                        sell(i, character.items[i].q);
                }
            }
        }, 1000);
    };
    return Zetchant;
}());


;// CONCATENATED MODULE: ./src/start.ts
















var characters = {};
characters["Zett"] = new Character(new ZettWarrior(new WarriorSkills()), new SoloCombat(), new UseMerchant(), 
// new SoloLocation("bat", "mvampire", 10),
new SoloLocation(ICE_ROAMER, 5), new LoggingSystem(), new PartySystem().setPartyLeader("Zett").setPartyMembers(["Zett", "Zettex", "Zetd", "Zetchant"]));
characters["Zetadin"] = new Character(new ZetadinPaladin(new PaladinSkills()), new SoloCombat(), new UseMerchant(), new SoloLocation(BEE1, 5), new LoggingSystem(), new PartySystem().setPartyLeader("Zetadin").setPartyMembers(["Zetadin", "Zetx", "Zeter", "Zetchant"]));
characters["Zetd"] = new Character(new ZetdPriest(new PriestSkills()), 
// new KiteCombat(),
new SoloCombat(), new UseMerchant(), new SoloLocation(ICE_ROAMER, 5), 
// new FollowPartyLocation(),
new LoggingSystem(), new PartySystem().setPartyLeader("Zett").setPartyMembers(["Zett", "Zettex", "Zetd", "Zetchant"]));
characters["Zettex"] = new Character(new ZettexRogue(new RogueSkills()), new SoloCombat(), new UseMerchant(), 
// new FollowPartyLocation(),
new SoloLocation(ICE_ROAMER, 5), new LoggingSystem(), new PartySystem().setPartyLeader("Zett").setPartyMembers(["Zett", "Zettex", "Zetd", "Zetchant"]));
characters["Zeter"] = new Character(new ZeterRanger(new RangerSkills()), new SoloCombat(), new UseMerchant(), new SoloLocation(BEE2, 5), new LoggingSystem(), new PartySystem().setPartyLeader("Zetadin").setPartyMembers(["Zetadin", "Zetx", "Zeter", "Zetchant"]));
characters["Zetx"] = new Character(new ZetxMage(new MageSkills()), new SoloCombat(), new UseMerchant(), new SoloLocation(BEE3, 5), new LoggingSystem(), new PartySystem().setPartyLeader("Zetadin").setPartyMembers(["Zetadin", "Zetx", "Zeter", "Zetchant"]));
characters["Zetchant"] = new Zetchant(new PartySystem().setPartyLeader("Zett").setPartyMembers(["Zett", "Zettex", "Zetd", "Zetchant"]), new IsMerchant().setPotQtyThreshold(3000), new LoggingSystem().setLogCombat(false).setLogLocation(false).setLogMoney(true));
function start_c(name, ms) {
    if (ms === void 0) { ms = 250; }
    game_log(">>> Invoking " + name);
    characters[name].start(ms);
}
//@ts-ignore
parent.start_c = start_c;
// function on_draw(){
// 	clear_drawings();
// 	draw_circle(character.real_x, character.real_y, character.range);
// 	const target = get_target(character);
// 	if(target){
// 		draw_line(character.real_x, character.real_y, target.x, target.y);
// 	}
// 	if(is_moving(character)){
// 		draw_line(character.from_x, character.from_y, character.going_x, character.going_y, 1, 0x33FF42);
// 	}
// 	for(const id in parent.entities){
// 		const entity = parent.entities[id];
// 		const entity_targ = get_target_of(entity);
// 		if(entity_targ && entity_targ.name === character.name && entity.moving) {
// 			draw_line(entity.from_x, entity.from_y, entity.going_x, entity.going_y, 1, 0xda0b04);
// 			draw_circle(entity.x, entity.y, entity.range, 1, 0xda0b04);
// 		}
// 	}
// }
// //@ts-ignore
// window.on_draw = on_draw;
/**
 * function draw_borders(){
  for(let x_line of G.geometry[parent.character.map].x_lines){
    draw_line(x_line[0], x_line[1], x_line[0], x_line[2], 2,0x04f8e2)
  }
  for(let y_line of G.geometry[parent.character.map].y_lines){
    draw_line(y_line[1], y_line[0], y_line[2], y_line[0], 2,0x04f8e2)
  }
}

function draw_spawn_ranges(){
  for (mon in G.maps[character.map].monsters) {
      const boundary = G.maps[character.map].monsters[mon].boundary;
      if (boundary) {
          //Top
          draw_line(boundary[0], boundary[1], boundary[2], boundary[1], 1, 0xBF00FF);
          //Left
          draw_line(boundary[0], boundary[1], boundary[0], boundary[3], 1, 0xBF00FF);
          //Right
          draw_line(boundary[2], boundary[3], boundary[0], boundary[3], 1, 0xBF00FF);
          //Bottom
          draw_line(boundary[2], boundary[3], boundary[2], boundary[1], 1, 0xBF00FF);
      }
  }
}
 */ 

/******/ })()
;