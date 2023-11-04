// const getMP3Duration = require("get-mp3-duration");
// const { getVideoDurationInSeconds } = require("get-video-duration");

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

  static async build() {
    const n = new TrackManager();
    const fs = require("fs");
    const path = require("path");
    const tracks_path = path.join(__dirname, "../public/tracks");
    const files = fs.readdirSync(tracks_path) as string[];
    await Promise.all(files
      .filter((file: string) => path.extname(file) === ".mp4")
      .sort()
      .map(async (file: string, index: number) => {
        // const buffer = fs.readFileSync(path.join(tracks_path, file));
        // const duration = getMP3Duration(buffer);
        const p = path.join(tracks_path, file)
        console.log(p);
        
        //ffmpeg does not work on vercel
        // const duration = (await getVideoDurationInSeconds(p)) * 1000;
        const duration = 599333

        // const v = document.createElement("video");
        // v.preload = "metadata";
        // v.src = "/tracks/" + file;

        // const duration = await new Promise<number>((succ, rej) => {
        //   v.addEventListener("loadedmetadata", () => {
        //     window.URL.revokeObjectURL(v.src);
        //     succ(v.duration);
        //   });
        //   v.load()
        // })

        console.log("DURATION", duration);
        
        

        const track: Track = {
          id: index,
          src: file,
          label: file,
          instances: 0,
          duration: duration,
        };
        console.log("TRACK", track);
        
        n._tracks.push(track);
        return
      }))
    console.debug("TRACK LOADED", ...n._tracks.map((t) => t.label));
    return n
  }

  private constructor() {}

  public get preview_track() {
    return this._tracks.reduce((prev, curr) =>
      prev.instances <= curr.instances ? prev : curr
    );
  }

  public get pick_track() {
    const track = this.preview_track;
    track.instances++;
    console.log("PICKED", track.label);
    return track;
  }

  public release_track(t: Track) {
    this._tracks.find((track) => track.id === t.id)!.instances--;
  }

  public get duration() {
    console.log("TRACK LENG", this._tracks.length);
    
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
  private _duration: number;
  private _start_time: number;

  constructor() {}

  public build(duration: number) {
    const d = Date.now();
    this._start_time = d;
    this._duration = duration;
  }

  public get duration() {
    return this._duration;
  }

  public get start_time() {
    return this._start_time;
  }

  public get current_server_time() {
    return this.current_time - this.start_time;
  }

  public get current_track_time() {
    console.warn("current track time", this.current_server_time, this.duration, this.current_loop);
    
    // console.log("current time", this.current_server_time, this.duration, this.current_loop);
    const res = this.current_server_time - this.duration * this.current_loop;
    // console.log("=", res);
    return res
  }

  public get current_loop() {
    return Math.floor(this.current_server_time / this.duration);
  }

  public get current_time() {
    return Date.now();
  }
}

export class ServerDevice {
  static id = 0;
  static PING_WAIT_TIMEOUT = 9500;
  static KILL_DEVICE_TIMEOUT = ServerDevice.PING_WAIT_TIMEOUT * 5;

  private timeout: ReturnType<typeof setTimeout>;

  private __dead__ = false;
  private kill() {
    console.warn("🪦", "RIP DEVICE", this.id);
    this.stop_dead_sentence()
    this.stop_ping_timeout()
    this.__dead__ = true;
  }
  public get dead() {
    return this.__dead__;
  }

  //ACTIVE
  private _active = true;
  public get active() {
    return this._active;
  }
  private inactivity_timeout: ReturnType<typeof setTimeout>;
  private stop_dead_sentence() {
    if(!this.inactivity_timeout) return
    clearTimeout(this.inactivity_timeout);
    this.inactivity_timeout = undefined!
  }
  public set active(a: boolean) {
    if(this.dead) throw new Error("NO")
    if (a == false && this._active == true) {
      console.log("DEACTIVATED", this.id, this._lastPing, Date.now());
      this.inactivity_timeout = setTimeout(() => {
        //TODO: kill device
        this.kill();
        console.warn("SERVER KILLED INACTIVE", this.id);
      }, ServerDevice.KILL_DEVICE_TIMEOUT);
    }
    if (a == true && this._active == false) {
      console.log("REVIVING", this.id);
      if (!this.inactivity_timeout) this.stop_dead_sentence()
    }
    this._active = a;
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

  private stop_ping_timeout() {
    
    if(!this.timeout) return
    clearTimeout(this.timeout)
    this.timeout = undefined!
    console.log("STOPPED TIMEOUT", this.id);
  }

  private _pinging = false;
  private _lastPing : number

  public async ping() {
    console.log('🏓', this.id, "pings");
    this._pinging = true
    if(!!this._lastPing) {
      console.log(this.id, "last ping", Date.now() - this._lastPing);
      this._lastPing = Date.now()
    } else {
      this._lastPing = Date.now()
    }
    
    this.stop_ping_timeout()
    
    if(this.dead) {
      throw new Error("DEVICE IS DEAD")
    }
    if (!this._active) {
      console.warn("should ping but not active - OLD DEVICE");
      // return;
    }
    this.active = true
    // console.log("PINGING", this.id, Date.now());
    console.log("running", this.id, "ping timeout");
    this.timeout = setTimeout(() => {
      console.warn("PING TIMEOUT FOR", this.id);
      if(!this._pinging) this.active = false;
      else {
        console.log("NOT HAPPENING PING WENT THROUGHN FOR", this.id);
        
      }
    }, ServerDevice.PING_WAIT_TIMEOUT);

    this._pinging = false
    return
  }
}
