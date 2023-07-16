import { startScene as osc_start } from "./engine/osc_client";
import {
  ServerDevice,
  TimeManager,
  Track,
  TrackManager,
} from "./engine/managers";

//INTI
const express = require("express");
const path = require("path");
const ip = require("ip");
const rateLimit = require('express-rate-limit')

//SERVER
export const app = express();
const port = 3000;

//MIDDLEWARE
app.use(express.static(path.join(__dirname, "/public")));

const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());


const limiter = rateLimit({
	windowMs: 20 * 60 * 1000,
	max: 100,
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true // Disable the `X-RateLimit-*` headers
})
app.use(limiter)

//SOCKET
// Handle socket connection
//TODO: observable socket stream
export interface monitor_data {
  devices: ServerDevice[];
  time_manager: {
    current_server_time: number;
    duration: number;
    current_track_time: number;
    current_loop: number;
  };
  track_manager: TrackManager;
}
app.get("/monitor_data", (req, res) => {
  //FIXME: non va bene una call al secondo intaserà
  // console.log("🪬 monitor");
  const data: monitor_data = {
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/backend", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/backend.html"));
});
//SETUP
export interface setup_data extends Vitals {
  id: number;
  // track: Track
  // server_start_time: number,
  // server_current_time: number,
}
export interface Vitals {
  start_time: number;
  current_time: number;
  current_track_time: number;
  track: Track;
  id?: number;
}
//MANAGER
const TRACKS = new TrackManager();
const TIME = new TimeManager();
const DEVICES: ServerDevice[] = [];
//API
app.get("/setup", (req, res) => {
  const track = TRACKS.pick_track;
  const d = new ServerDevice(track);
  DEVICES.push(d);
  const data: setup_data = {
    id: d.id,
    track: d.track,
    start_time: TIME.start_time,
    current_time: TIME.current_time,
    current_track_time: TIME.current_track_time,
  };
  res.send(data);
});

app.post("/vitals", async (req, res) => {
  try {
    const { id } = req.body;
    const device = DEVICES.find((d) => d.id === id);
    if (!device) throw new Error("device not found");
    if (!device.active) {
      device.active = true;
    }
    if (device.dead) {
      console.log("PINGING BUT DEAD", device.id);
      DEVICES.splice(DEVICES.indexOf(device), 1);
      TRACKS.release_track(device.track);
      throw new Error("device not active. REMOVE");
    }
    device.ping().then(res => {
      console.log(device.id, "AFTER PING", res);
    })
    .catch((err) => {
      console.warn("🔴\t", device.id, err.message);
      DEVICES.splice(DEVICES.indexOf(device), 1);
      throw err
    })
    const track = device!.track;
    const check_data: Vitals = {
      start_time: TIME.start_time,
      current_time: TIME.current_time,
      current_track_time: TIME.current_track_time,
      track: track,
    };
    res.send(check_data);
  } catch (err) {
    res.status(501, err.message);
  }
});

//START
function start_server(port: number) {
  try {
    app.listen(port, () => {
      //gets the server ip address
      const serverIp = ip.address();
      console.debug(
        `🌈\tServer started at http://${serverIp}:${port}\nBACKEND at: http://${serverIp}:${port}/backend.html\n`
      );
      //TIME
      TIME.build(TRACKS.duration);
      //OSC
      osc_start();
      console.debug("▶️\tOSC", "osc sent");
    });
  } catch (err) {
    start_server(port + 1);
  }
}

start_server(3333);
