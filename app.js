"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var managers_1 = require("./engine/managers");
var osc_client_1 = require("./engine/osc_client");
//INTI
var express = require("express");
var path = require("path");
var ip = require("ip");
var rateLimit = require('express-rate-limit');
//SERVER
exports.app = express();
var port = 3000;
//MIDDLEWARE
exports.app.use(express.static(path.join(__dirname, "/public")));
var bodyParser = require("body-parser");
exports.app.use(bodyParser.urlencoded({
    extended: true,
}));
exports.app.use(bodyParser.json());
var cors = require("cors");
exports.app.use(cors());
var limiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true // Disable the `X-RateLimit-*` headers
});
exports.app.use(limiter);
exports.app.get("/monitor_data", function (req, res) {
    //FIXME: non va bene una call al secondo intaserà
    // console.log("🪬 monitor");
    var data = {
        devices: DEVICES,
        time_manager: {
            current_server_time: TIME.current_time,
            duration: TIME.duration,
            current_track_time: TIME.current_track_time,
            current_loop: TIME.current_loop,
        },
        track_manager: TRACKS,
    };
    res.send(data);
});
exports.app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});
exports.app.get("/backend", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/backend.html"));
});
//MANAGER
var TRACKS = new managers_1.TrackManager();
var TIME = new managers_1.TimeManager();
var DEVICES = [];
//API
exports.app.get("/setup", function (req, res) {
    var track = TRACKS.pick_track;
    var d = new managers_1.ServerDevice(track);
    DEVICES.push(d);
    var data = {
        id: d.id,
        track: d.track,
        start_time: TIME.start_time,
        current_time: TIME.current_time,
        current_track_time: TIME.current_track_time,
    };
    res.send(data);
});
exports.app.post("/vitals", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, device_1, track, check_data;
    return __generator(this, function (_a) {
        try {
            id_1 = req.body.id;
            device_1 = DEVICES.find(function (d) { return d.id === id_1; });
            if (!device_1)
                throw new Error("device not found");
            if (!device_1.active) {
                device_1.active = true;
            }
            if (device_1.dead) {
                console.log("PINGING BUT DEAD", device_1.id);
                DEVICES.splice(DEVICES.indexOf(device_1), 1);
                TRACKS.release_track(device_1.track);
                throw new Error("device not active. REMOVE");
            }
            device_1.ping().then(function (res) {
                console.log(device_1.id, "AFTER PING", res);
            })
                .catch(function (err) {
                console.warn("🔴\t", device_1.id, err.message);
                DEVICES.splice(DEVICES.indexOf(device_1), 1);
                throw err;
            });
            track = device_1.track;
            check_data = {
                start_time: TIME.start_time,
                current_time: TIME.current_time,
                current_track_time: TIME.current_track_time,
                track: track,
            };
            res.send(check_data);
        }
        catch (err) {
            res.status(501, err.message);
        }
        return [2 /*return*/];
    });
}); });
//START
function start_server(port) {
    try {
        exports.app.listen(port, function () {
            //gets the server ip address
            var serverIp = ip.address();
            console.debug("\uD83C\uDF08\tServer started at http://".concat(serverIp, ":").concat(port, "\nBACKEND at: http://").concat(serverIp, ":").concat(port, "/backend.html\n"));
            //TIME
            TIME.build(TRACKS.duration);
            //OSC
            setTimeout(function () {
                (0, osc_client_1.startScene)();
                console.debug("▶️\tOSC", "osc sent");
            }, 120 * 1000);
        });
    }
    catch (err) {
        start_server(port + 1);
    }
}
start_server(3333);
