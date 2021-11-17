/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/lib/utils.ts
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
function minutesInMs(min) {
    return 1000 * 60 * min;
}
function secSince(date) {
    return mssince(date) / 1000;
}
function getEntities(filter_by, do_something) {
    var entities = [];
    for (var i in parent.entities) {
        var entity = parent.entities[i];
        if (filter_by(entity)) {
            if (do_something)
                do_something(entity);
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
function ui() {
    var iframes = parent.$('#iframelist iframe');
    for (var i in iframes) {
        var iframe = iframes[i];
        if (!iframe.contentDocument)
            continue;
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
function startChar(name) {
    start_character(name);
    setTimeout(function () {
        ui();
    }, 20000);
}

;// CONCATENATED MODULE: ./src/characters/character.ts

var CharacterFunction = /** @class */ (function () {
    function CharacterFunction(skills, usePercent) {
        if (usePercent === void 0) { usePercent = 50; }
        this.skills = skills;
        this.usePercent = usePercent;
        this.lastHpPotionUsedAt = new Date();
        this.lastMpPotionUsedAt = new Date();
    }
    CharacterFunction.prototype.getSkills = function () {
        return this.skills;
    };
    CharacterFunction.prototype.beforeBusy = function () {
        this.hpPotUse();
        this.mpPotUse();
    };
    CharacterFunction.prototype.afterSystem = function () {
        loot();
    };
    CharacterFunction.prototype.setup = function () { };
    CharacterFunction.prototype.hpPotUse = function () {
        if (safeties && mssince(this.lastHpPotionUsedAt) < min(200, character.ping * 3))
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
        if (safeties && mssince(this.lastMpPotionUsedAt) < min(200, character.ping * 3))
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
        this.systems = [combatSystem, locationSystem, partySystem, inventorySystem];
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
        parent.combatSystem = this.combatSystem;
        parent.inventorySystem = this.inventorySystem;
        parent.partySystem = this.partySystem;
        parent.locationSystem = this.locationSystem;
        parent.loggingSystem = this.loggingSystem;
        fixAddLog();
        this.characterFunction.setup();
        setInterval(function () {
            _this.loggingSystem.tick();
            if (character.rip) {
                respawn();
                parent.currentLocation = "?";
                return;
            }
            _this.characterFunction.beforeBusy();
            if (is_moving(character) || smart.moving || Object.keys(character.q).length != 0)
                return;
            _this.characterFunction.tick();
            _this.systemFunc();
            _this.characterFunction.afterSystem();
        }, ms);
    };
    Character.prototype.systemFunc = function () {
        this.systems.forEach(function (system) { return system === null || system === void 0 ? void 0 : system.tick(); });
    };
    return Character;
}());


;// CONCATENATED MODULE: ./src/lib/skills.ts
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
function buff(skill, target, time_left_ms) {
    if (target === void 0) { target = character; }
    if (time_left_ms === void 0) { time_left_ms = 0; }
    // can't replace buff from other people
    if (Object.keys(target.s).length === 0
        || !target.s[skill.name]
        || (target.s[skill.name].f === character.name && target.s[skill.name].ms < time_left_ms)) {
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
            game_log("Doesn't meet character requirements for " + skill.name);
        }
        if (!hasItems) {
            game_log("Doesn't meet item requirements for " + skill.name);
        }
        if (!hasMp) {
            game_log("Not enough MP for " + skill.name);
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

var Skills = /** @class */ (function () {
    function Skills() {
        this.scare = new Skill({ name: "scare", mpCost: 50, cooldown: 5, itemReq: { name: "jacko", slot: "orb" } });
        this.town = new Skill({ name: "useTown" });
    }
    return Skills;
}());

var WarriorSkills = /** @class */ (function (_super) {
    __extends(WarriorSkills, _super);
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
    __extends(RogueSkills, _super);
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
    __extends(PriestSkills, _super);
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
    __extends(MerchantSkills, _super);
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
    __extends(PaladinSkills, _super);
    function PaladinSkills() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PaladinSkills;
}(Skills));

var RangerSkills = /** @class */ (function (_super) {
    __extends(RangerSkills, _super);
    function RangerSkills() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RangerSkills;
}(Skills));

var MageSkills = /** @class */ (function (_super) {
    __extends(MageSkills, _super);
    function MageSkills() {
        return _super !== null && _super.apply(this, arguments) || this;
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


;// CONCATENATED MODULE: ./src/lib/cms/cm-move.ts


function sendComingRequest(name) {
    var payload = cms_cmBuilder(COMING);
    cms_sendCharacterMessage(name, payload);
}
function sendComeToMeCommand(name, data, isReply) {
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
    else if (smart.moving) {
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

;// CONCATENATED MODULE: ./src/lib/cms/cm-buff.ts



function sendBuffRequest(name, buffName) {
    var payload = cms_cmBuilder(BUFF_ME, utils_getLocationSystem().getSmartMoveLocation());
    payload["content"]["buff"] = buffName;
    cms_sendCharacterMessage(name, payload);
}
function handleBuffRequest(name, data) {
    if (smart.moving)
        return; // in case multiple people request at the same time
    utils_getLocationSystem().smartMove(data, "buff-" + name).then(function () {
        useSkill(data.buff, get_player(name));
    });
}

;// CONCATENATED MODULE: ./src/lib/cms/cms.ts





var COMING = "COMING";
var COME_TO_ME = "COME_TO_ME";
var cms_MOVE_TO = "MOVE_TO";
var BRING_POTION = "BRING_POTION";
var cms_INVENTORY = "INVENTORY";
var INVENTORY_PREVIEW = "INVENTORY_PREVIEW";
var BUFF_ME = "BUFF_ME";
var CM_WHITELIST = ["Zettex", "Zetd", "Zett", "Zetchant", "Zetadin", "Zeter", "Zetx"];
var C_CM_SEND_THRESHOLD = 15; // seconds
var CM_MAP = {
    COMING: sendComeToMeCommand,
    COME_TO_ME: movingToData,
    MOVE_TO: movingToData,
    BRING_POTION: bringPotionReply,
    INVENTORY: sendInventoryData,
    INVENTORY_PREVIEW: inventoryPreview,
    BUFF_ME: handleBuffRequest,
};
var F_CM_LAST_SENT = pastDatePlusMins(60);
function cms_sendCharacterMessage(name, data, isReply) {
    if (isReply === void 0) { isReply = false; }
    if (!isReply && secSince(F_CM_LAST_SENT) < C_CM_SEND_THRESHOLD)
        return;
    log("--> " + name + ": " + data.msg_type);
    send_cm(name, data);
    F_CM_LAST_SENT = new Date();
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
    CM_MAP[data.msg_type](name, data.content, true);
};

;// CONCATENATED MODULE: ./src/lib/cms/cm-potion.ts


function sendBringPotionCommand(name, pot, pot_qty) {
    if (pot_qty === void 0) { pot_qty = 2000; }
    var payload = cms_cmBuilder(BRING_POTION, utils_getLocationSystem().getSmartMoveLocation());
    payload["content"]["pot"] = pot;
    payload["content"]["pot_qty"] = pot_qty;
    cms_sendCharacterMessage(name, payload);
}
function bringPotionReply(name, data) {
    utils_getLocationSystem().smartMove(data, data.pot + "-" + name).then(function () {
        send_item(name, locate_item(data.pot), data.pot_qty);
    });
}

;// CONCATENATED MODULE: ./src/systems/inventory/inventory.ts


var C_DO_NOT_STORE_ITEM = ["pot", "cscroll", "scroll0", "scroll1", "tracker", "stand"];
var FindItemParameters = /** @class */ (function () {
    function FindItemParameters() {
    }
    return FindItemParameters;
}());
var InventorySystem = /** @class */ (function () {
    function InventorySystem(merchantName, hpPotName, mpPotName, potQtyThreshold) {
        if (hpPotName === void 0) { hpPotName = "hpot0"; }
        if (mpPotName === void 0) { mpPotName = "mpot0"; }
        if (potQtyThreshold === void 0) { potQtyThreshold = 100; }
        this.merchantName = merchantName;
        this.hpPotName = hpPotName;
        this.mpPotName = mpPotName;
        this.potQtyThreshold = potQtyThreshold;
        this.lastMerchantInteractionAt = pastDatePlusMins(60);
    }
    InventorySystem.prototype.restockPotionsAt = function (pot, pot_qty, cm_restock) {
        if (pot_qty === -1)
            return;
        if (locate_item(pot) === -1 || character.items[locate_item(pot)].q < pot_qty) {
            if (cm_restock) {
                sendBringPotionCommand(this.merchantName, pot);
            }
            else {
                utils_getLocationSystem().smartMove("town");
                buy(pot, pot_qty);
            }
        }
    };
    InventorySystem.prototype.storage = function (threshold, store_cond) {
        if (threshold === void 0) { threshold = 42; }
        if (store_cond === void 0) { store_cond = function (item) { return !C_DO_NOT_STORE_ITEM.find(function (element) { return item.name.includes(element); }); }; }
        // character.q.banking = true;
        var num_items = this.inventorySize();
        if (num_items >= threshold) {
            return utils_getLocationSystem().smartMove("bank").then(function () {
                for (var i = 0; i < character.items.length; i++) {
                    var item = character.items[i];
                    if (!item)
                        continue;
                    if (store_cond(item)) {
                        bank_store(i);
                    }
                }
                // delete character.q.banking;
            });
        }
    };
    InventorySystem.prototype.inventorySize = function () {
        var num_items = 0;
        for (var i in character.items)
            if (character.items[i])
                num_items++;
        return num_items;
    };
    InventorySystem.prototype.findItem = function (params) {
        var items = this.findItems(params);
        return items ? items[0] : -1;
    };
    InventorySystem.prototype.findItems = function (params) {
        var items = [];
        for (var i = 0; i < character.items.length; i++) {
            if (!character.items[i])
                continue;
            if (params.name && character.items[i].name != params.name)
                continue;
            if (params.max_refine && character.items[i].level >= params.max_refine)
                continue;
            if (params.level && character.items[i].level != params.level)
                continue;
            items.push(i);
        }
        return (items.length === 0) ? null : items;
    };
    InventorySystem.prototype.sendItems = function (name, start_idx, end_idx) {
        if (start_idx === void 0) { start_idx = 0; }
        if (end_idx === void 0) { end_idx = 42; }
        for (var i = start_idx; i < end_idx; i++) {
            if (!character.items[i]
                || character.items[i].name === "tracker"
                || character.items[i].name.includes("pot"))
                continue;
            send_item(name, i, character.items[i].q);
        }
    };
    return InventorySystem;
}());


;// CONCATENATED MODULE: ./src/systems/logging.ts

var C_MESSAGE_TYPE_MERCHANT = "t_merchant";
var C_MESSAGE_TYPE_STALL = "t_stall";
var C_MESSAGE_TYPE_GOLD = "t_gold";
var C_MESSAGE_TYPE_COMPOUND = "t_compound";
var C_MESSAGE_TYPE_UPGRADE = "t_upgrade";
var C_MESSAGE_TYPE_WALKING = "t_walking";
var C_MESSAGE_TYPE_TARGET = "t_target";
var LoggingSystem = /** @class */ (function () {
    function LoggingSystem(refreshMs) {
        if (refreshMs === void 0) { refreshMs = 1000; }
        this.refreshMs = refreshMs;
        this.lastMessageLoggedAt = new Date();
        this.messageQueue = {};
    }
    LoggingSystem.prototype.tick = function () {
        if (mssince(this.lastMessageLoggedAt) < this.refreshMs)
            return;
        this.displayLogMessages();
        this.lastMessageLoggedAt = new Date();
    };
    LoggingSystem.prototype.displayLogMessages = function () {
        var display_msg = Math.trunc(getHpPercent() * 100) + "%/" + Math.trunc(getMpPercent() * 100) + "% | Lv" + character.level + " (" + Math.trunc(character.xp / character.max_xp * 100) + "%)<br>";
        var first_message = true;
        for (var k in this.messageQueue) {
            if (!first_message)
                display_msg += " | ";
            display_msg += this.messageQueue[k];
            first_message = false;
        }
        if (display_msg === "")
            return;
        set_message(display_msg);
        var has_moving = smart.moving
            && this.messageQueue[C_MESSAGE_TYPE_WALKING]
            ? this.messageQueue[C_MESSAGE_TYPE_WALKING]
            : null;
        this.messageQueue = {};
        if (has_moving) {
            this.messageQueue[C_MESSAGE_TYPE_WALKING] = has_moving;
        }
    };
    LoggingSystem.prototype.addLogMessage = function (message, msg_type) {
        if (!msg_type) {
            log(message);
            return;
        }
        this.messageQueue[msg_type] = message;
    };
    return LoggingSystem;
}());


;// CONCATENATED MODULE: ./src/characters/zetchant-merchant.ts
var zetchant_merchant_extends = (undefined && undefined.__extends) || (function () {
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





// Merchant
var C_MERCHANT_STAND_LOCATION = {
    map: "main",
    x: 130,
    y: 0
};
var C_MERCHANT_SELL_ITEM_VALUE_MULT = 4;
var ZetchantMerchant = /** @class */ (function (_super) {
    zetchant_merchant_extends(ZetchantMerchant, _super);
    function ZetchantMerchant(skills) {
        var _this = _super.call(this, skills) || this;
        _this.UPGRADE_LIST = [
            { name: "wcap", refine: 7, auto_buy: true },
            { name: "wshoes", refine: 7, auto_buy: true },
            { name: "wbreeches", refine: 7, auto_buy: true },
            { name: "wattire", refine: 7, auto_buy: true },
            { name: "wgloves", refine: 7, auto_buy: true },
            { name: "coat1", refine: 7, auto_buy: true },
            { name: "shoes1", refine: 7, auto_buy: true },
            { name: "pants1", refine: 7, auto_buy: true },
            { name: "gloves1", refine: 7, auto_buy: true },
            { name: "helmet1", refine: 7, auto_buy: true },
            { name: "sshield", refine: 7, auto_buy: true },
            { name: "slimestaff", refine: 7, auto_buy: true },
            { name: "phelmet", refine: 7, auto_buy: true },
            { name: "firestaff", refine: 7, auto_buy: true },
            { name: "mcape", refine: 6, auto_buy: true },
            { type: "c", name: "ringsj", refine: 4, auto_buy: true },
            { type: "c", name: "hpamulet", refine: 4, auto_buy: true },
            { type: "c", name: "hpbelt", refine: 4, auto_buy: true },
            { type: "c", name: "wbook0", refine: 4, auto_buy: true },
            { type: "c", name: "strearring", refine: 3, auto_buy: true },
            { type: "c", name: "intearring", refine: 3, auto_buy: true },
            { type: "c", name: "dexearring", refine: 3, auto_buy: true },
            { type: "c", name: "vitearring", refine: 3, auto_buy: true },
        ];
        _this.VEND_LIST = [
        // { level: 3, name: "ringsj" },
        // { level: 3, name: "hpamulet" },
        // { level: 3, name: "hpbelt" },
        ];
        _this.UPGRADE_QUEUE = []; // TODO: create classes
        _this.LAST_UPGRADE_PUSH_THRESHOLD = 300; // seconds
        _this.SCROLL_NPC = find_npc(G.npcs.scrolls.id);
        _this.UPGRADE_ATTEMPTS = 0;
        _this.GO_BANK = true;
        _this.LAST_UPGRADE_PUSH = pastDatePlusMins(6);
        return _this;
    }
    ZetchantMerchant.prototype.getName = function () {
        return "Zetchant";
    };
    ZetchantMerchant.prototype.setup = function () {
        ui();
    };
    ZetchantMerchant.prototype.beforeBusy = function () {
        _super.prototype.beforeBusy.call(this);
        buff(this.getSkills().mluck);
        buffEveryone(this.getSkills().mluck, minutesInMs(45));
    };
    ZetchantMerchant.prototype.afterSystem = function () {
        _super.prototype.afterSystem.call(this);
        if (character.q && (character.q.compound || character.q.upgrade)) {
            getLoggingSystem().addLogMessage("&#128296; " + this.UPGRADE_QUEUE[0].name, C_MESSAGE_TYPE_UPGRADE);
        }
    };
    ZetchantMerchant.prototype.tick = function () {
        var _this = this;
        // if its been X minutes since upgrade
        var last_upgrade_push = secSince(this.LAST_UPGRADE_PUSH);
        getLoggingSystem().addLogMessage("&#128092;" + Math.trunc((this.LAST_UPGRADE_PUSH_THRESHOLD - last_upgrade_push) / 60) + "m", C_MESSAGE_TYPE_STALL);
        getLoggingSystem().addLogMessage("&#128184;" + character.gold, C_MESSAGE_TYPE_GOLD);
        if (this.UPGRADE_QUEUE.length === 0) {
            if (last_upgrade_push < this.LAST_UPGRADE_PUSH_THRESHOLD) {
                if (isStandOpen()) {
                    this.m_stand_register_items(this.VEND_LIST);
                    return;
                }
                else if (this.GO_BANK) {
                    this.m_bank(this.UPGRADE_LIST, this.VEND_LIST);
                    this.GO_BANK = false;
                }
                else {
                    this.m_open_stand();
                }
            }
            else {
                for (var i = 0; i < this.UPGRADE_LIST.length; i++) {
                    this.UPGRADE_QUEUE.push(this.UPGRADE_LIST[i]);
                }
                this.LAST_UPGRADE_PUSH = new Date();
                this.GO_BANK = true;
                utils_getLocationSystem().smartMove("scrolls");
                return;
            }
        }
        else {
            var u_item = this.UPGRADE_QUEUE[0];
            if (!u_item)
                return; // callback executes async, so it fucks the array sometimes?
            if (getInventorySystem().findItem({ name: u_item.name }) === -1) {
                this.UPGRADE_QUEUE.shift();
                return;
            }
            // TODO: go to the bank, retrieve all the <u_item.name> we can find and THEN try to upgrade
            if (distance(character, this.SCROLL_NPC) > 100) {
                utils_getLocationSystem().smartMove("scrolls");
                return;
            }
            buff(this.getSkills().massproduction);
            if (u_item.type === "c") {
                this.smart_compound(u_item.name, u_item.refine, u_item.auto_buy, function () { _this.upgrade_success_handler(); }, function (data) { _this.upgrade_failure_handler(data); });
            }
            else {
                this.smart_upgrade(u_item.name, u_item.refine, u_item.auto_buy, function () { _this.upgrade_success_handler(); }, function (data) { _this.upgrade_failure_handler(data); });
            }
        }
    };
    ZetchantMerchant.prototype.upgrade_success_handler = function () {
        this.UPGRADE_ATTEMPTS = 0;
    };
    ZetchantMerchant.prototype.upgrade_failure_handler = function (data) {
        if (data.reason === "no_item" && this.UPGRADE_ATTEMPTS > 2) {
            this.UPGRADE_QUEUE.shift();
            this.UPGRADE_ATTEMPTS = 0;
        }
        this.UPGRADE_ATTEMPTS++;
    };
    ZetchantMerchant.prototype.smart_upgrade = function (item_name, max_refine, auto_buy, scb, fcb) {
        if (max_refine === void 0) { max_refine = -1; }
        if (auto_buy === void 0) { auto_buy = false; }
        var item_idx = max_refine === -1 ? locate_item(item_name)
            : getInventorySystem().findItem({ name: item_name, max_refine: max_refine });
        var grade = item_grade(character.items[item_idx]);
        var scroll_idx = locate_item("scroll" + grade);
        getLoggingSystem().addLogMessage("&#128296; " + item_name, C_MESSAGE_TYPE_UPGRADE);
        var upgrade_promise = upgrade(item_idx, scroll_idx);
        upgrade_promise.then(function (data) { return scb(data); }, function (data) {
            game_log("[" + item_name + "]: " + data.reason);
            if (data.reason === "no_scroll" && auto_buy)
                buy("scroll" + grade);
            fcb(data);
        });
        return upgrade_promise;
    };
    ZetchantMerchant.prototype.smart_compound = function (item_name, item_level, auto_buy, scb, fcb) {
        if (auto_buy === void 0) { auto_buy = false; }
        var items = getInventorySystem().findItems({ name: item_name, max_refine: item_level });
        if (!items) {
            fcb({ reason: "no_item" });
            return;
        }
        var item_matrix = [];
        for (var i_lvl = 0; i_lvl < item_level; i_lvl++) {
            item_matrix.push([]);
            for (var i = 0; i < items.length; i++) {
                if (character.items[items[i]].level === i_lvl)
                    item_matrix[i_lvl].push(items[i]);
            }
        }
        var grade = 0;
        var compound_promise = null;
        for (var i_lvl = 0; i_lvl < item_level; i_lvl++) {
            if (item_matrix[i_lvl].length >= 3) {
                items = item_matrix[i_lvl];
                grade = item_grade(character.items[items[0]]);
                compound_promise = compound(items[0], items[1], items[2], locate_item("cscroll" + grade));
                break;
            }
        }
        if (!compound_promise) {
            fcb({ reason: "no_item" });
            return;
        }
        getLoggingSystem().addLogMessage("&#128296; " + item_name, C_MESSAGE_TYPE_COMPOUND);
        compound_promise.then(function (data) { return scb(data); }, function (data) {
            game_log("[" + item_name + "] : " + data.reason + " (" + locate_item("cscroll" + grade) + ") " + items);
            if (locate_item("cscroll" + grade) === -1 && auto_buy)
                buy("cscroll" + grade);
        });
        return compound_promise;
    };
    ZetchantMerchant.prototype.m_open_stand = function () {
        return utils_getLocationSystem().smartMove(C_MERCHANT_STAND_LOCATION, "open_stand").then(function () {
            open_stand(0);
        });
    };
    ZetchantMerchant.prototype.m_get_stand_slots = function () {
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
    ZetchantMerchant.prototype.m_stand_register_items = function (items, price) {
        var open_stand_slots = this.m_get_stand_slots();
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
    // TODO: create classes for Vend/Refine Items
    ZetchantMerchant.prototype.m_bank = function (refine_items, vend_items) {
        return getInventorySystem().storage(0, function (item) {
            if (C_DO_NOT_STORE_ITEM.find(function (element) { var _a; return (_a = item.name) === null || _a === void 0 ? void 0 : _a.includes(element); }))
                return false;
            for (var i in refine_items) {
                var r_item = refine_items[i];
                if (r_item.name === item.name && r_item.refine != item.level)
                    return false;
            }
            for (var i in vend_items) {
                var v_item = vend_items[i];
                if (v_item.name === item.name && v_item.level === item.level)
                    return false;
            }
            return true;
        });
    };
    ZetchantMerchant.prototype.findItemInBank = function () {
        character.q.banking = true;
        if (!character.bank) {
            utils_getLocationSystem().smartMove("bank").then(function () {
                // TODO:
                // character.bank has "items0" thru "itemsN"
                // itemsN is an array with same structure as inventory
                // re-use inventory, make the find items generic
                delete character.q.banking;
            });
        }
    };
    return ZetchantMerchant;
}(CharacterFunction));


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
            if (getCombatSystem().isBossMonster(current) && current.target && current.target != character.name && !current.s.cursed) {
                useSkill(this.getSkills().curse, current);
                break;
            }
        }
        if (!character.s.mluck)
            sendBuffRequest(getInventorySystem().merchantName, "mluck");
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
                else if (distance(character, member) > 150) {
                    move(character.x + (member.x - character.x) / 4, character.y + (member.y - character.y) / 4);
                }
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
        getCombatSystem().setPreAttack(function (tar) {
            if (getHpPercent(tar) > 0.8)
                useSkill(_this.getSkills().invis);
        });
    };
    ZettexRogue.prototype.tick = function () {
        buff(this.getSkills().rspeed);
        buffEveryone(this.getSkills().rspeed);
        if (!character.s.mluck) {
            sendBuffRequest(getInventorySystem().merchantName, "mluck");
        }
    };
    return ZettexRogue;
}(CharacterFunction));


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
        var partyMembers = getPartySystem().partyMembers;
        for (var i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i] === character.name)
                continue;
            start_character(partyMembers[i], partyMembers[i]);
        }
        setTimeout(function () { return ui(); }, 30000);
    };
    ZettWarrior.prototype.tick = function () {
        // Party Logic
        this.taunt_targeted_party(function (tar) {
            return tar.type === "monster"
                && tar.target != character.name
                && (getPartySystem().partyMembers.includes(tar.target));
        });
        getPartySystem().checkConditionOnPartyAndCount(function (member) { return character.name != member.name && character.x === member.x && character.y === member.y; }, function () { return move(character.x + 1, character.y + 1); });
        useSkill(this.getSkills().charge);
    };
    ZettWarrior.prototype.taunt_targeted_party = function (f_condition) {
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


;// CONCATENATED MODULE: ./src/systems/combat/combatSystem.ts

var C_IGNORE_MONSTER = ["Target Automatron"];
var C_BOSS_MONSTER = ["Dracul", "Phoenix", "Franky"];
var C_ATTACK_THRESHOLD = 400;
var C_COMBAT_HP_THRESHOLD = 6000;
var C_COMBAT_BOSS_HP_THRESHOLD = 10000;
var C_PARTY_ATTACK_DISTANCE_THRESHOLD = 100;
var CombatSystem = /** @class */ (function () {
    function CombatSystem(stuckThreshold, stuck, pre_attack, post_attack) {
        if (stuckThreshold === void 0) { stuckThreshold = 10; }
        if (stuck === void 0) { stuck = 0; }
        if (pre_attack === void 0) { pre_attack = function () { }; }
        if (post_attack === void 0) { post_attack = function () { }; }
        this.stuckThreshold = stuckThreshold;
        this.stuck = stuck;
        this.pre_attack = pre_attack;
        this.post_attack = post_attack;
    }
    CombatSystem.prototype.setPreAttack = function (func) {
        this.pre_attack = func;
    };
    CombatSystem.prototype.setPostAttack = function (func) {
        this.post_attack = func;
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
            this.pre_attack(target);
            if (is_in_range(target, "attack"))
                attack(target);
            this.post_attack(target);
            this.stuck = 0;
        }
    };
    /**
     * Priority:
     *  1. Follow the party leaders target
     *  2. Kill monsters targeting me
     *  3. Find bosses
     *  4. Find the closest monster [non-boss/non-ignored] (repeat this in case of respawns)
     */
    CombatSystem.prototype.getTarget = function (ignoreBoss) {
        var _this = this;
        if (ignoreBoss === void 0) { ignoreBoss = false; }
        var follow_leader_attack = this.shouldFollowLeaderAttack();
        if (follow_leader_attack) {
            return getPartySystem().getPartyLeaderTarget();
        }
        var target = this.getTargetedMonster();
        var targetingMe = this.findMonstersTargeting();
        if (target && target.target != character.name) {
            target = null; // only keep target if its targeting me
        }
        if (targetingMe.length > 1) {
            ignoreBoss = true; // if there are multiple units attacking me, ignore boss for now
        }
        if (!ignoreBoss) {
            // see if there's a boss target
            var entities = getEntities(function (entity) { return _this.isBossMonster(entity); });
            if (entities.length) {
                target = entities[0];
            }
        }
        return target ? target : this.getNearestMonster();
    };
    CombatSystem.prototype.shouldFollowLeaderAttack = function () {
        if (character.name === getPartySystem().partyLeader)
            return false;
        if (getHpPercent() < .5)
            return true;
        for (var id in parent.entities) {
            var current = parent.entities[id];
            if (current.type != "monster")
                continue;
            if (distance(character, current) > C_PARTY_ATTACK_DISTANCE_THRESHOLD)
                continue;
            if (current.max_hp > C_COMBAT_HP_THRESHOLD)
                return true;
            if (current.attack > C_ATTACK_THRESHOLD)
                return true;
        }
        return false;
    };
    CombatSystem.prototype.getTargetedMonster = function () {
        if (parent.ctarget && !parent.ctarget.dead && parent.ctarget.type == 'monster')
            return parent.ctarget;
        return null;
    };
    CombatSystem.prototype.getNearestMonster = function () {
        var target = null;
        var minDistance = 999999;
        for (var id in parent.entities) {
            var current = parent.entities[id];
            if (current.type != "monster" || !current.visible || current.dead)
                continue;
            if (current.attack > C_ATTACK_THRESHOLD)
                continue;
            if (!can_move_to(current))
                continue;
            if (this.isBossMonster(current))
                continue;
            if (this.isIgnoredMonster(current))
                continue;
            var currentDistance = distance(character, current);
            if (currentDistance < minDistance) {
                minDistance = currentDistance;
                target = current;
            }
        }
        return target;
    };
    CombatSystem.prototype.findMonstersTargeting = function (target) {
        if (target === void 0) { target = character; }
        var targetingMe = [];
        for (var id in parent.entities) {
            var current = parent.entities[id];
            if (current.type != "monster")
                continue;
            if (current.target === target.name) {
                targetingMe.push(current);
            }
        }
        return targetingMe;
    };
    CombatSystem.prototype.isIgnoredMonster = function (target) {
        return target && C_IGNORE_MONSTER.includes(target.name);
    };
    CombatSystem.prototype.isBossMonster = function (target) {
        return target && C_BOSS_MONSTER.includes(target.name);
    };
    CombatSystem.prototype.findTarget = function () {
        var target = this.getTarget();
        if (target) {
            if (target.max_hp > C_COMBAT_BOSS_HP_THRESHOLD && this.isBossMonster(target)) {
                var pty_members = 0;
                var partyMembers = getPartySystem().combatPartyMembers;
                for (var i in partyMembers) {
                    var party_member = partyMembers[i];
                    var player = get_player(party_member);
                    if (player && player.visible) {
                        pty_members++;
                    }
                }
                if (pty_members < 3) {
                    return this.getTarget(true);
                }
            }
        }
        return target;
    };
    return CombatSystem;
}());


;// CONCATENATED MODULE: ./src/systems/combat/combat.ts
var combat_extends = (undefined && undefined.__extends) || (function () {
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



var C_LOG_ICON = "&#128924;"; // &#127919;
var SoloCombat = /** @class */ (function (_super) {
    combat_extends(SoloCombat, _super);
    function SoloCombat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SoloCombat.prototype.tick = function () {
        var target = this.findTarget();
        if (!target)
            return;
        change_target(target);
        getLoggingSystem().addLogMessage(C_LOG_ICON + " " + target.name, C_MESSAGE_TYPE_TARGET);
        this.attack(target);
    };
    return SoloCombat;
}(CombatSystem));


;// CONCATENATED MODULE: ./src/systems/location/locationSystem.ts


var LocationSystem = /** @class */ (function () {
    function LocationSystem() {
    }
    LocationSystem.prototype.smartMove = function (dest, dest_name) {
        if (isStandOpen())
            close_stand();
        getLoggingSystem().addLogMessage("&#128099;" + (typeof dest === "object" ? dest_name : dest), C_MESSAGE_TYPE_WALKING);
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
    return LocationSystem;
}());


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


var SoloLocation = /** @class */ (function (_super) {
    soloLocation_extends(SoloLocation, _super);
    function SoloLocation(mobDestination, bossDestination, locationChangeIntervalMin) {
        var _this = _super.call(this) || this;
        _this.mobDestination = mobDestination;
        _this.bossDestination = bossDestination;
        _this.locationChangeIntervalMin = locationChangeIntervalMin;
        _this.lastDestinationChangeAt = pastDatePlusMins(6);
        _this.atBoss = true;
        parent.currentLocation = "?";
        return _this;
    }
    // TODO: quests
    // TODO: World bosses
    SoloLocation.prototype.tick = function () {
        var target = get_target();
        if (target && getCombatSystem().isBossMonster(target))
            return;
        var nextLocation;
        if (!this.bossDestination || this.atBoss || parent.currentLocation === "?" || character.map === "bank") {
            nextLocation = this.mobDestination;
        }
        else {
            nextLocation = this.bossDestination;
        }
        if (nextLocation === parent.currentLocation)
            return;
        // TODO: create a better helper for logging/time diffs
        var locChangeSecs = this.locationChangeIntervalMin * 60;
        getLoggingSystem().addLogMessage("&#9758; " + nextLocation + "-" + Math.trunc(locChangeSecs - secSince(this.lastDestinationChangeAt)), "t_location");
        if (mssince(this.lastDestinationChangeAt) > minutesInMs(this.locationChangeIntervalMin)) {
            this.smartMove(nextLocation);
            this.atBoss = nextLocation === this.bossDestination;
            parent.currentLocation = nextLocation;
            this.lastDestinationChangeAt = new Date();
        }
    };
    return SoloLocation;
}(LocationSystem));


;// CONCATENATED MODULE: ./src/systems/party.ts

var PartySystem = /** @class */ (function () {
    function PartySystem(partyLeader, partyMembers) {
        var _this = this;
        this.partyLeader = partyLeader;
        this.partyMembers = partyMembers;
        window.on_party_request = function (name) {
            if (_this.partyMembers.includes(name))
                accept_party_request(name);
        };
        window.on_party_invite = function (name) {
            if (_this.partyMembers.includes(name))
                accept_party_invite(name);
        };
        setTimeout(function () {
            _this.combatPartyMembers = [];
            _this.partyMembers.forEach(function (member) {
                if (member != getInventorySystem().merchantName)
                    _this.combatPartyMembers.push(member);
            });
        }, 1000);
    }
    PartySystem.prototype.tick = function () {
        if (character.name === this.partyLeader)
            return;
        if (!parent.party[this.partyLeader]) {
            send_party_request(this.partyLeader);
        }
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
    PartySystem.prototype.useSkillOnParty = function (skill_block) {
        for (var member in parent.party) {
            var party_member = get_player(member);
            if (!party_member)
                continue;
            skill_block(party_member);
        }
    };
    PartySystem.prototype.checkConditionOnPartyAndCount = function (cond_check, cond_func) {
        var condition_count = 0;
        for (var member in parent.party) {
            var party_member = get_player(member);
            if (!party_member)
                continue;
            if (cond_check(party_member)) {
                condition_count++;
                cond_func(party_member);
            }
        }
        return condition_count;
    };
    return PartySystem;
}());


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
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
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
    ZetadinPaladin.prototype.tick = function () {
        throw new Error("Method not implemented.");
    };
    ZetadinPaladin.prototype.getName = function () {
        return "Zetadin";
    };
    return ZetadinPaladin;
}(CharacterFunction));


;// CONCATENATED MODULE: ./src/systems/location/NoOpLocation.ts
var NoOpLocation_extends = (undefined && undefined.__extends) || (function () {
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

var NoOpLocation = /** @class */ (function (_super) {
    NoOpLocation_extends(NoOpLocation, _super);
    function NoOpLocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoOpLocation.prototype.tick = function () {
        return;
    };
    return NoOpLocation;
}(LocationSystem));


;// CONCATENATED MODULE: ./src/systems/location/followPartyLocation.ts
var followPartyLocation_extends = (undefined && undefined.__extends) || (function () {
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



var FollowPartyLocation = /** @class */ (function (_super) {
    followPartyLocation_extends(FollowPartyLocation, _super);
    function FollowPartyLocation(followDistance) {
        if (followDistance === void 0) { followDistance = 0; }
        var _this = _super.call(this) || this;
        _this.followDistance = followDistance;
        return _this;
    }
    FollowPartyLocation.prototype.tick = function () {
        var party_const = get_party();
        var partyLeaderName = getPartySystem().partyLeader;
        var party_leader = get_player(partyLeaderName);
        if (party_const[partyLeaderName] // do not change this 
            && (!party_leader
                || !party_leader.visible
                || (this.followDistance && distance(character, party_leader) > this.followDistance)))
            sendComingRequest(partyLeaderName);
    };
    return FollowPartyLocation;
}(LocationSystem));


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
var C_MERCHANT_INTERACTION_THRESHOLD = 300;
var C_MERCHANT_SEND_GOLD_THRESHOLD = 500000;
var C_ICON = "&#128093;"; // &#128176;
var UseMerchant = /** @class */ (function (_super) {
    useMerchant_extends(UseMerchant, _super);
    function UseMerchant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UseMerchant.prototype.tick = function () {
        this.transferItemsToMerchant();
        this.restockPotionsAt(this.hpPotName, this.potQtyThreshold, true);
        this.restockPotionsAt(this.mpPotName, this.potQtyThreshold, true);
    };
    UseMerchant.prototype.transferItemsToMerchant = function () {
        var maybe_target = get_player(this.merchantName);
        var last_interaction = secSince(this.lastMerchantInteractionAt);
        var display = Math.trunc((C_MERCHANT_INTERACTION_THRESHOLD - last_interaction));
        getLoggingSystem().addLogMessage("" + C_ICON + (display < 0 ? 0 : display), C_MESSAGE_TYPE_MERCHANT);
        if (last_interaction > C_MERCHANT_INTERACTION_THRESHOLD) {
            if (maybe_target
                && distance(character, maybe_target) < C_SEND_ITEM_DISTANCE) {
                this.lastMerchantInteractionAt = new Date();
                this.sendItems(this.merchantName);
                send_gold(this.merchantName, character.gold - C_MERCHANT_SEND_GOLD_THRESHOLD);
            }
            else if (get_party()[this.merchantName] && character.name === getPartySystem().partyLeader) {
                sendComeToMeCommand(this.merchantName, null, false);
            }
        }
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
        this.restockPotionsAt(this.hpPotName, this.potQtyThreshold, false);
        this.restockPotionsAt(this.mpPotName, this.potQtyThreshold, false);
        this.storage();
    };
    return IsMerchant;
}(InventorySystem));


;// CONCATENATED MODULE: ./src/start.ts

















var characters = {};
var C_FULL_PARTY_MEMBERS = ["Zett", "Zetchant", "Zettex", "Zetd", "Zeter", "Zetx", "Zetadin"];
characters["Zett"] = new Character(new ZettWarrior(new WarriorSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new SoloLocation("bat", "mvampire", 10), new LoggingSystem(), new PartySystem("Zett", ["Zett", "Zettex", "Zetd", "Zetchant"]));
characters["Zetadin"] = new Character(new ZetadinPaladin(new PaladinSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new SoloLocation("bee"), new LoggingSystem(), new PartySystem("Zetadin", ["Zetadin", "Zetx", "Zeter", "Zetchant"]));
characters["Zetd"] = new Character(new ZetdPriest(new PriestSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new FollowPartyLocation(), new LoggingSystem(), new PartySystem("Zett", C_FULL_PARTY_MEMBERS));
characters["Zettex"] = new Character(new ZettexRogue(new RogueSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new FollowPartyLocation(), new LoggingSystem(), new PartySystem("Zett", C_FULL_PARTY_MEMBERS));
characters["Zeter"] = new Character(new ZeterRanger(new RangerSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new FollowPartyLocation(), new LoggingSystem(), new PartySystem("Zetadin", C_FULL_PARTY_MEMBERS));
characters["Zetx"] = new Character(new ZetxMage(new MageSkills()), new SoloCombat(), new UseMerchant("Zetchant"), new FollowPartyLocation(), new LoggingSystem(), new PartySystem("Zetadin", C_FULL_PARTY_MEMBERS));
characters["Zetchant"] = new Character(new ZetchantMerchant(new MerchantSkills()), null, // combat system
new IsMerchant("Zetchant", "hpot0", "mpot0", 3000), new NoOpLocation(), new LoggingSystem(), new PartySystem("Zett", C_FULL_PARTY_MEMBERS));
function start_c(name) {
    game_log(">>> Invoking " + name);
    characters[name].start();
}
//@ts-ignore
parent.start_c = start_c;

/******/ })()
;