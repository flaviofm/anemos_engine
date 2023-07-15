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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDevice = exports.TimeManager = exports.TrackManager = void 0;
var getMP3Duration = require("get-mp3-duration");
var TrackManager = /** @class */ (function () {
    function TrackManager() {
        var _this = this;
        this._tracks = [];
        this.start_time = Date.now();
        //reads all .mp3 files in /tracks folder and fills the array tracks with nasme, file path, duration and increasing id. Must read them in alphabetical oreder so the ids are incrementing
        var fs = require("fs");
        var path = require("path");
        var tracks_path = path.join(__dirname, "../public/tracks");
        var files = fs.readdirSync(tracks_path);
        files
            .filter(function (file) { return path.extname(file) === ".mp3"; })
            .sort()
            .forEach(function (file, index) {
            var buffer = fs.readFileSync(path.join(tracks_path, file));
            var duration = getMP3Duration(buffer);
            var track = {
                id: index,
                src: file,
                label: file,
                instances: 0,
                duration: duration,
            };
            _this._tracks.push(track);
        });
        console.debug.apply(console, __spreadArray(["TRACK LOADED"], this._tracks.map(function (t) { return t.label; }), false));
    }
    Object.defineProperty(TrackManager.prototype, "preview_track", {
        get: function () {
            return this._tracks.reduce(function (prev, curr) {
                return prev.instances < curr.instances ? prev : curr;
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TrackManager.prototype, "pick_track", {
        get: function () {
            //finds the first track with less instances, increased the instances and returns the track
            var track = this.preview_track;
            track.instances++;
            return track;
        },
        enumerable: false,
        configurable: true
    });
    TrackManager.prototype.release_track = function (t) {
        this._tracks.find(function (track) { return track.id === t.id; }).instances--;
    };
    Object.defineProperty(TrackManager.prototype, "duration", {
        get: function () {
            if (this._tracks.length === 0)
                return 0;
            return this._tracks[0].duration;
        },
        enumerable: false,
        configurable: true
    });
    return TrackManager;
}());
exports.TrackManager = TrackManager;
var TimeManager = /** @class */ (function () {
    function TimeManager() {
    }
    TimeManager.prototype.build = function (duration) {
        var d = Date.now();
        this._start_time = d;
        this.duration = duration;
    };
    Object.defineProperty(TimeManager.prototype, "start_time", {
        get: function () {
            return this._start_time;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeManager.prototype, "current_track_time", {
        get: function () {
            var time = this.current_time - this.start_time;
            while (time > this.duration) {
                time -= this.duration;
            }
            return time;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeManager.prototype, "current_time", {
        get: function () {
            return Date.now();
        },
        enumerable: false,
        configurable: true
    });
    return TimeManager;
}());
exports.TimeManager = TimeManager;
var ServerDevice = exports.ServerDevice = /** @class */ (function () {
    function ServerDevice(_track) {
        this._track = _track;
        this._active = true;
        this._id = ServerDevice.id++;
    }
    Object.defineProperty(ServerDevice.prototype, "active", {
        get: function () {
            return this._active;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServerDevice.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServerDevice.prototype, "track", {
        get: function () {
            return this._track;
        },
        enumerable: false,
        configurable: true
    });
    //write a method ping that will run a method kill after 15 seconds but if ping is executed again the timer restarts
    ServerDevice.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                clearTimeout(this.timeout);
                if (!this._active) {
                    console.warn("should ping but not active - OLD DEVICE");
                    return [2 /*return*/];
                }
                else {
                    console.log("PINGING", this.id, Date.now());
                }
                this.timeout = setTimeout(function () {
                    _this._active = false;
                }, ServerDevice.PING_WAIT_TIMEOUT);
                return [2 /*return*/];
            });
        });
    };
    ServerDevice.id = 0;
    ServerDevice.PING_WAIT_TIMEOUT = 15000;
    return ServerDevice;
}());