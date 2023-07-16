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
exports.ClientDevice = void 0;
console.log("FRONTEND");
var PROCESS;
window.addEventListener("DOMContentLoaded", function () { return __awaiter(void 0, void 0, void 0, function () {
    var playbtn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                PROCESS = fetch("/setup")
                    .then(function (res) {
                    console.debug(res, res.ok, res.status, res.statusText);
                    return res.json();
                })
                    .then(function (data) { return init(data); })
                    .then(function (device) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("DEVICE CREATED", device);
                                return [4 /*yield*/, device.setup()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, device];
                        }
                    });
                }); })
                    .then(function (device) {
                    return device;
                });
                return [4 /*yield*/, PROCESS];
            case 1:
                _a.sent();
                playbtn = document.getElementById("play");
                if (!playbtn)
                    throw new Error("NO PLAY BUTTON");
                playbtn.classList.add("active");
                playbtn.addEventListener("click", function () {
                    var ping_log = document.getElementById("ping");
                    PROCESS.then(function (device) { return __awaiter(void 0, void 0, void 0, function () {
                        var err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    device.play();
                                    ping_log.classList.add("active");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 5, , 6]);
                                    _a.label = 2;
                                case 2:
                                    if (!true) return [3 /*break*/, 4];
                                    console.warn("PINGING");
                                    return [4 /*yield*/, device.ping()];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 2];
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _a.sent();
                                    ping_log.style.backgroundColor = "red";
                                    return [2 /*return*/, false];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })
                        .then(function (res) {
                        ping_log.classList.remove("active");
                        console.log("PROCESS ENDED", res);
                    })
                        .catch(function (err) {
                        console.log("PROCESS ERROR", err);
                    });
                });
                return [2 /*return*/];
        }
    });
}); });
//INIT
function init(data) {
    return __awaiter(this, void 0, void 0, function () {
        var id, track, start_time, current_time, device;
        return __generator(this, function (_a) {
            console.log("INIT", data);
            id = data.id, track = data.track, start_time = data.start_time, current_time = data.current_time;
            device = new ClientDevice(id, track, Date.now(), start_time, current_time);
            return [2 /*return*/, device];
        });
    });
}
var ClientDevice = exports.ClientDevice = /** @class */ (function () {
    function ClientDevice(id, track, client_start_time, server_start_time, server_current_time) {
        this.id = id;
        this.track = track;
        this.client_start_time = client_start_time;
        this.server_start_time = server_start_time;
        this.server_current_time = server_current_time;
        this.missed_pings = 0;
        this.audio = document.getElementById("audio");
        this.log = document.getElementById("log");
        this.status = document.getElementById("status");
        this.error_log = document.getElementById("error_log");
        this.track_log = document.getElementById("track_log");
        this.log.innerHTML = "ID: " + this.id;
        this.status.innerHTML = "INIT";
    }
    ClientDevice.prototype.kill = function (str) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fade_out()];
                    case 1:
                        _a.sent();
                        this.audio.pause();
                        this.audio.src = "";
                        this.audio.load();
                        this.status.innerHTML = "DEAD by " + str;
                        throw new Error("DEAD");
                }
            });
        });
    };
    ClientDevice.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("SETTING UP", this.id, this.track.label, this.current_playback_time);
                        return [4 /*yield*/, this.set_track(this.track)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.set_time(this.current_playback_time)];
                    case 2:
                        _a.sent();
                        console.log("SETTED UP", this.audio.src, this.audio.currentTime);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Object.defineProperty(ClientDevice.prototype, "offset", {
        get: function () {
            // console.log("OFFSET", this.server_start_time, this.client_start_time);
            // return this.server_start_time - this.client_start_time;
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "current_client_time", {
        get: function () {
            return Date.now();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "current_playback_time", {
        get: function () {
            return this.audio.currentTime;
            // return (
            //   (this.current_client_time -
            //     this.client_start_time +
            //     this.server_current_time -
            //     this.server_start_time) /
            //   1000
            // );
        },
        enumerable: false,
        configurable: true
    });
    ClientDevice.prototype.set_track = function (t) {
        var _this = this;
        var src = "/tracks/" + t.src;
        console.log(src);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fade_out()];
                    case 1:
                        _a.sent();
                        this.track = t;
                        this.audio.src = src;
                        this.audio.load();
                        this.track_log.innerHTML = "TRACK: " + this.track.label;
                        //when the audio is ready to play
                        this.audio.oncanplay = function () {
                            _this.fade_in();
                            // this.play()
                            resolve(true);
                        };
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ClientDevice.prototype.play = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.audio.src == "")
                            throw new Error("NO TRACK");
                        // if (!this.audio.paused) {
                        //   console.warn("ALREADY PLAYING");
                        //   return
                        // }
                        //CHECKS TIME - qua controlla manualmente ma i ping confermeranno
                        // this.ping_once();
                        this.set_time(this.computed_current_track_time);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.audio.play()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        console.log("NOT TIME YET");
                        return [2 /*return*/];
                    case 4:
                        // this.audio.play();
                        this.status.innerHTML = "PLAYING";
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientDevice.prototype.set_time = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fade_out()];
                    case 1:
                        _a.sent();
                        this.audio.currentTime = time - this.offset;
                        // this.play();
                        return [4 /*yield*/, this.fade_in()];
                    case 2:
                        // this.play();
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(ClientDevice.prototype, "audio_current_time", {
        get: function () {
            return this.audio.currentTime;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "local_duration", {
        get: function () {
            return this.audio.duration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "computed_current_track_time", {
        get: function () {
            var server_count = this.server_start_time - this.server_current_time;
            var local_count = (Date.now() - this.server_start_time) % this.local_duration;
            var check_time = server_count - local_count;
            if (check_time < 2 && check_time > -2) {
                return local_count;
            }
            else {
                return server_count;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "src", {
        get: function () {
            return this.track.src;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientDevice.prototype, "client_vitals", {
        get: function () {
            return {
                start_time: this.server_start_time,
                current_time: this.current_client_time,
                current_track_time: this.current_playback_time,
                track: this.track,
                id: this.id,
            };
        },
        enumerable: false,
        configurable: true
    });
    ClientDevice.prototype.fade_in = function () {
        var _this = this;
        this.log.innerHTML = "FADING IN";
        return new Promise(function (resolve, reject) {
            //animate audio volume from 0 to 1 iin 2 seconds
            _this.audio.volume = 1;
            // this.audio.play();
            // $(this.audio)
            //   .animate(
            //     { volume: 1 }, 2000
            //   )
            //   .on("finish", () => {
            resolve(true);
            //   });
        });
    };
    ClientDevice.prototype.fade_out = function () {
        var _this = this;
        this.log.innerHTML = "FADING OUT";
        return new Promise(function (resolve, reject) {
            //animate audio volume from 0 to 1 iin 2 seconds
            _this.audio.volume = 0;
            // this.audio.play();
            // $(this.audio)
            //   .animate({ volume: 0 }, 2000)
            //   .on("finish", () => {
            //     this.log.innerHTML = "FADED OUT";
            resolve(true);
            //   });
        });
    };
    ClientDevice.prototype.delay = function (time) {
        if (time === void 0) { time = 2000; }
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(true);
            }, time);
        });
    };
    ClientDevice.prototype.stop_timeout = function () {
        if (this.timeout) {
            console.debug("CLEARING TIMEOUT");
            window.clearTimeout(this.timeout);
        }
    };
    ClientDevice.prototype.reset_timer = function () {
        var _this = this;
        console.log("RESETTING TIMEOUT");
        this.timeout = setTimeout(function () {
            _this.missed_pings++;
            _this.error_log.innerHTML = "ERROR: NO PING #" + _this.missed_pings;
            if (_this.missed_pings > ClientDevice.PING_COUNT) {
                _this.error_log.innerHTML = "ERROR: TOO MANY MISSED PINGS (".concat(_this.missed_pings, ")");
                _this.kill("missed pings");
            }
        }, ClientDevice.PING_TIMEOUT);
    };
    ClientDevice.prototype.ping_once = function () {
        var _this = this;
        return fetch("/vitals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.client_vitals),
        })
            .then(function (res) {
            console.log(res, res.ok, res.status);
            if (!res.ok) {
                _this.error_log.innerText = "SERVER IS THE KILLER";
            }
            return res.json();
        })
            .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.missed_pings = 0;
                        this.error_log.innerHTML = "";
                        return [4 /*yield*/, this.check(data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ClientDevice.prototype.ping = function () {
        var _this = this;
        console.debug("PING");
        this.stop_timeout();
        var ping = this.ping_once();
        ////
        return ping.then(function (res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delay(ClientDevice.PING_HOLD)];
                    case 1:
                        _a.sent();
                        this.reset_timer();
                        return [2 /*return*/, res];
                }
            });
        }); });
    };
    ClientDevice.prototype.check = function (server_vitals) {
        var client_vitals = this.client_vitals;
        return Promise.all([
            this.check_time(client_vitals, server_vitals),
            this.check_track(client_vitals, server_vitals),
            //TODO: Add checks here
        ]);
    };
    ClientDevice.prototype.check_time = function (client_vitals, server_vitals) {
        return __awaiter(this, void 0, void 0, function () {
            var server_track_time, client_track_time, difference;
            return __generator(this, function (_a) {
                server_track_time = server_vitals.current_track_time / 1000;
                client_track_time = client_vitals.current_track_time;
                difference = server_track_time - client_track_time;
                console.log("TRACK TIME DIFF", difference, server_track_time, client_track_time);
                if (difference > ClientDevice.ADJUST_THRESHOLD ||
                    difference < -ClientDevice.ADJUST_THRESHOLD) {
                    //adjust
                    console.log("ADJUSTING TIME");
                    return [2 /*return*/, this.set_time(server_track_time)];
                }
                else {
                    console.log("TIME OK");
                }
                // //checks difference between client and server time
                // const client_time = client_vitals.current_time - client_vitals.start_time;
                // const server_time = server_vitals.current_time - server_vitals.start_time;
                // const offset = client_time - server_time;
                // const time_difference = client_time - server_time;
                // if (
                //   time_difference > ClientDevice.ADJUST_THRESHOLD ||
                //   time_difference < -ClientDevice.ADJUST_THRESHOLD
                // ) {
                //   //adjust
                //   console.log("ADJUSTING TIME");
                //   return this.set_time(server_time);
                // }
                return [2 /*return*/];
            });
        });
    };
    ClientDevice.prototype.check_track = function (client_vitals, server_vitals) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                //checks difference between client and server track
                if (client_vitals.track.id !== server_vitals.track.id) {
                    //replace
                    this.log.innerHTML = "REPLACING TRACK";
                    return [2 /*return*/, this.set_track(server_vitals.track)];
                }
                console.log("TRACK OK");
                return [2 /*return*/];
            });
        });
    };
    ClientDevice.ADJUST_THRESHOLD = 5; //seconds
    ClientDevice.PING_COUNT = 10;
    ClientDevice.PING_TIMEOUT = 9500;
    ClientDevice.PING_HOLD = 4000;
    return ClientDevice;
}());
