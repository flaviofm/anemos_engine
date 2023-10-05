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
var PROCESS = function () {
    return fetch("/setup").then(function (res) {
        console.debug(res, res.ok, res.status, res.statusText);
        return res.json();
    });
};
var play_btns = Array.from(document.getElementsByClassName("play"));
window.addEventListener("DOMContentLoaded", function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, device, ok;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (_a = document.getElementById('over')) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                return [4 /*yield*/, landing_scene()];
            case 1:
                _b.sent();
                return [4 /*yield*/, PROCESS()];
            case 2:
                res = _b.sent();
                return [4 /*yield*/, init(res)];
            case 3:
                device = _b.sent();
                return [4 /*yield*/, device.setup()];
            case 4:
                ok = _b.sent();
                console.warn("INITED");
                return [4 /*yield*/, ready_scene()];
            case 5:
                _b.sent();
                play_btns.forEach(function (e) {
                    return e.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var isSafari;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                                    if (isSafari) {
                                        device.play();
                                        device.pause();
                                    }
                                    // waiting_scene()
                                    document.getElementById('landing').classList.remove("active");
                                    play_btns.forEach(function (e) { return e.classList.remove("active"); });
                                    return [4 /*yield*/, device.ping_once()];
                                case 1:
                                    _a.sent();
                                    device.play();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
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
        this.audio = document.getElementById("audio");
        this.log = document.getElementById("log");
        this.status = document.getElementById("status");
        this.error_log = document.getElementById("error_log");
        this.track_log = document.getElementById("track_log");
        this.log.innerHTML = "ID: " + this.id;
        this.status.innerHTML = "INIT";
    }
    ClientDevice.prototype.pause = function () {
        this.audio.pause();
    };
    ClientDevice.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("SETTING UP", this.id, this.track.label, this.audio.currentTime);
                        return [4 /*yield*/, this.set_track(this.track)];
                    case 1:
                        _a.sent();
                        // await this.set_time(this.current_playback_time);
                        console.log("SETTED UP", this.audio.src, this.audio.currentTime);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    ClientDevice.prototype.set_track = function (t) {
        var _this = this;
        var src = "/tracks/" + t.src;
        console.log(src);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // await this.fade_out();
                this.track = t;
                this.audio.src = src;
                this.audio.load();
                this.track_log.innerHTML = "TRACK: " + this.track.label;
                //when the audio is ready to play
                this.audio.oncanplay = function () {
                    // play_btns.forEach(e => e.classList.add("active"))
                    ready_scene();
                    resolve(true);
                };
                return [2 /*return*/];
            });
        }); });
    };
    ClientDevice.prototype.play = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.audio.src == "")
                            throw new Error("NO TRACK");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.warn("PLAY");
                        return [4 /*yield*/, this.audio.play()];
                    case 2:
                        _a.sent();
                        console.warn("PLAYING");
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log("NOT TIME YET", err_1);
                        return [2 /*return*/];
                    case 4:
                        this.status.innerHTML = "PLAYING";
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientDevice.prototype.set_time = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.audio.currentTime = time;
                return [2 /*return*/];
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
                current_time: Date.now(),
                current_track_time: this.audio.currentTime,
                track: this.track,
                id: this.id,
            };
        },
        enumerable: false,
        configurable: true
    });
    ClientDevice.prototype.delay = function (time) {
        if (time === void 0) { time = 2000; }
        console.warn("DELAY OF ", time);
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                console.warn("DELAYED ", time);
                resolve(true);
            }, time);
        });
    };
    ClientDevice.prototype.ping_once = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, client_vitals;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/vitals", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(this.client_vitals),
                        }).then(function (res) {
                            console.log(res, res.ok, res.status);
                            if (!res.ok) {
                                _this.error_log.innerText = "SERVER IS THE KILLER";
                            }
                            return res.json();
                        })];
                    case 1:
                        res = _a.sent();
                        client_vitals = this.client_vitals;
                        return [4 /*yield*/, this.check_time(client_vitals, res)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // private check(server_vitals: Vitals) {
    //   const client_vitals = this.client_vitals;
    //   return Promise.all([
    //     this.check_time(client_vitals, server_vitals),
    //     this.check_track(client_vitals, server_vitals),
    //     //TODO: Add checks here
    //   ]);
    // }
    ClientDevice.prototype.check_time = function (client_vitals, server_vitals) {
        return __awaiter(this, void 0, void 0, function () {
            var server_track_time, client_track_time, difference, countdown, cd_div_1, count_1, inter_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server_track_time = server_vitals.current_track_time / 1000;
                        client_track_time = client_vitals.current_track_time;
                        difference = server_track_time - client_track_time;
                        console.log("TRACK TIME DIFF", difference, server_track_time, client_track_time);
                        // if (
                        //   difference > ClientDevice.ADJUST_THRESHOLD ||
                        //   difference < -ClientDevice.ADJUST_THRESHOLD
                        // ) {
                        //adjust
                        console.log("ADJUSTING TIME");
                        countdown = 120;
                        console.error(server_track_time);
                        if (!(server_track_time < countdown)) return [3 /*break*/, 2];
                        waiting_scene();
                        console.warn("COUNTDOWN", countdown - server_track_time);
                        this.status.innerHTML = "COUNTDOWN OF " + (countdown - server_track_time);
                        cd_div_1 = document.getElementById("countdown");
                        count_1 = Math.floor(countdown - server_track_time);
                        inter_1 = setInterval(function () {
                            cd_div_1.innerHTML = "inizier\u00E0 tra ".concat(count_1, " secondi");
                            count_1--;
                            if (count_1 <= 0) {
                                // @ts-ignore
                                clearInterval(inter_1);
                                // playing_scene();
                            }
                        }, 1000);
                        return [4 /*yield*/, this.delay((countdown - server_track_time) * 1000)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        playing_scene();
                        return [4 /*yield*/, this.set_time(server_track_time - countdown)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
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
    return ClientDevice;
}());
////
//////SCENES
//////////MAIN INDEX
// function get_play_btns() {
//   return [
//     document.getElementById("play_btn")!,
//     document.getElementById("play_btn_debug")!,
//   ];
// }
function delay(ms) {
    return new Promise(function (succ, rej) { return setTimeout(function () { return succ(true); }, ms); });
}
function set_section(id) {
    console.log(id);
    var secs = Array.from(document.getElementsByTagName("section"));
    secs.forEach(function (e) {
        if (e.id == id)
            e.classList.add("active");
        else
            e.classList.remove("active");
    });
}
function landing_scene() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            delay(1000)
                .then(function () {
                set_section("landing");
                console.log("1");
            })
                .then(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, delay(3000).then(function (res) {
                                var _a;
                                console.log("2");
                                (_a = document.getElementById("landing")) === null || _a === void 0 ? void 0 : _a.classList.add("ready");
                            })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function ready_scene() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn("READY");
            // set_section("ready");
            play_btns.forEach(function (b) { return b.classList.add("active"); });
            return [2 /*return*/];
        });
    });
}
function waiting_scene() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn('waiting');
            set_section("wait");
            return [2 /*return*/];
        });
    });
}
function playing_scene() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            set_section("playing");
            return [2 /*return*/];
        });
    });
}
