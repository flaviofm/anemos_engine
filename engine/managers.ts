import { setup_data } from "../app";
import { ClientDevice } from "../public/front";

const getMP3Duration = require("get-mp3-duration");

export interface Track {
  id: number;
  src: string;
  label: string;
  instances: number;
  duration: number;
}

export class TrackManager {
  private _tracks: Array<Track> = [];
  private start_time = Date.now();

  constructor() {
    //reads all .mp3 files in /tracks folder and fills the array tracks with nasme, file path, duration and increasing id. Must read them in alphabetical oreder so the ids are incrementing
    const fs = require("fs");
    const path = require("path");
    const tracks_path = path.join(__dirname, "../public/tracks");
    const files = fs.readdirSync(tracks_path);
    files
      .filter((file: string) => path.extname(file) === ".mp3")
      .sort()
      .forEach((file: string, index: number) => {
        const buffer = fs.readFileSync(path.join(tracks_path, file));
        const duration = getMP3Duration(buffer);
        const track: Track = {
          id: index,
          src: file,
          label: file,
          instances: 0,
          duration: duration,
        };
        this._tracks.push(track);
      });
    console.debug("TRACK LOADED", ...this._tracks.map((t) => t.label));
  }

  public get preview_track() {
    return this._tracks.reduce((prev, curr) =>
      prev.instances < curr.instances ? prev : curr
    );
  }

  public get pick_track() {
    //finds the first track with less instances, increased the instances and returns the track
    const track = this.preview_track;
    track.instances++;
    return track;
  }

  public release_track(t:Track) {
    this._tracks.find((track) => track.id === t.id)!.instances--;
  }

  public get duration() {
    if (this._tracks.length === 0) return 0;
    return this._tracks[0].duration;
  }
}

//TIME
export interface timestamp {
  duration: number;
  server_start_time: number;
  server_current_time: number;
}

export class TimeManager {
  private duration: number;
  private _start_time: number;

  constructor() {}

  public build(duration: number) {
    const d = Date.now();
    this._start_time = d;
    this.duration = duration;
  }

  public get start_time() {
    return this._start_time;
  }

  public get current_track_time() {
    let time = this.current_time - this.start_time;
    while (time > this.duration) {
      time -= this.duration;
    }
    return time;
  }

  public get current_time() {
    return Date.now();
  }
}

export class ServerDevice {
  static id = 0;
  static PING_WAIT_TIMEOUT = 15000;

  private timeout: ReturnType<typeof setTimeout>;

  private _active = true;

  public get active() {
    return this._active;
  }

  private _id: number;
  constructor(private _track: Track) {
    this._id = ServerDevice.id++;
  }
  public get id() {
    return this._id;
  }

  public get track() {
    return this._track;
  }

  //write a method ping that will run a method kill after 15 seconds but if ping is executed again the timer restarts
  public async ping() {
    clearTimeout(this.timeout);
    if(!this._active) {
      console.warn("should ping but not active - OLD DEVICE");
      return
    } else {
      console.log("PINGING", this.id, Date.now());
      
    }
    this.timeout = setTimeout(() => {
      this._active = false;
    }, ServerDevice.PING_WAIT_TIMEOUT);
  }
}
