import { Vitals, setup_data } from "../app";
import { Track } from "../engine/managers";

console.log("FRONTEND");
var PROCESS!: Promise<ClientDevice>;

window.addEventListener("DOMContentLoaded", async () => {
  PROCESS = fetch("/setup")
    .then((res) => {
      console.debug(res, res.ok, res.status, res.statusText);
      return res.json();
    })
    .then((data: setup_data) => init(data))
    .then(async (device) => {
      console.log("DEVICE CREATED", device);
      await device.setup();
      return device;
    })
    .then((device) => {
      return device;
    });

  await PROCESS;

  const playbtn = document.getElementById("play");
  if (!playbtn) throw new Error("NO PLAY BUTTON");
  playbtn.classList.add("active");

  playbtn.addEventListener("click", () => {
    const ping_log = document.getElementById("ping") as HTMLElement;
    PROCESS.then(async (device) => {
      device.play();
      ping_log.classList.add("active");
      try {
        while (true) {
          console.warn("PINGING");
          await device.ping();
        }
      } catch (err) {
        ping_log.style.backgroundColor = "red";
        return false;
      }
    })
      .then((res) => {
        ping_log.classList.remove("active");
        console.log("PROCESS ENDED", res);
      })
      .catch((err) => {
        console.log("PROCESS ERROR", err);
      });
  });
});

//INIT
async function init(data: setup_data) {
  console.log("INIT", data);
  const { id, track, start_time, current_time } = data;

  const device = new ClientDevice(
    id,
    track,
    Date.now(),
    start_time,
    current_time
  );
  return device;
}

export class ClientDevice {
  static ADJUST_THRESHOLD = 5000;

  private audio: HTMLAudioElement;
  private log: HTMLElement;
  private status: HTMLElement;
  private error_log: HTMLElement;
  private track_log: HTMLElement;

  private timeout: ReturnType<typeof setTimeout>;

  private async kill() {
    await this.fade_out();
    this.audio.pause();
    this.audio.src = "";
    this.audio.load();
    this.status.innerHTML = "DEAD";
    throw new Error("DEAD");
  }

  constructor(
    private id: number,
    private track: Track,
    private client_start_time: number,
    private server_start_time: number,
    private server_current_time: number
  ) {
    this.audio = document.getElementById("audio") as HTMLAudioElement;
    this.log = document.getElementById("log") as HTMLElement;
    this.status = document.getElementById("status") as HTMLElement;
    this.error_log = document.getElementById("error_log") as HTMLElement;
    this.track_log = document.getElementById("track_log") as HTMLElement;

    this.log.innerHTML = "ID: " + this.id;
    this.status.innerHTML = "INIT";
  }

  public async setup() {
    console.log(
      "SETTING UP",
      this.id,
      this.track.label,
      this.current_playback_time
    );
    await this.set_track(this.track);
    await this.set_time(this.current_playback_time);
    console.log("SETTED UP", this.audio.src, this.audio.currentTime);

    return true;
  }

  private get offset() {
    // console.log("OFFSET", this.server_start_time, this.client_start_time);

    // return this.server_start_time - this.client_start_time;
    return 0;
  }

  private get current_client_time() {
    return Date.now();
  }

  private get current_playback_time() {
    return (
      (this.current_client_time -
        this.client_start_time +
        this.server_current_time -
        this.server_start_time) /
      1000
    );
  }

  private set_track(t: Track) {
    const src = "/tracks/" + t.src;
    console.log(src);

    return new Promise(async (resolve, reject) => {
      await this.fade_out();

      this.track = t;
      this.audio.src = src;
      this.audio.load();
      this.track_log.innerHTML = "TRACK: " + this.track.label;
      //when the audio is ready to play
      this.audio.oncanplay = () => {
        this.fade_in();
        // this.play()
        resolve(true);
      };
    });
  }

  public async play() {
    if (this.audio.src == "") throw new Error("NO TRACK");
    // if (!this.audio.paused) {
    //   console.warn("ALREADY PLAYING");
    //   return
    // }
    try {
      console.log("DICOANE");
      
      await this.audio.play();
    } catch (err) {
      console.log("NOT TIME YET");
      return
    }
    // this.audio.play();
    this.status.innerHTML = "PLAYING";
    // if (this.audio.volume === 0) {
    //   await this.fade_in();
    // }
  }

  private async set_time(time: number) {
    await this.fade_out();

    this.audio.currentTime = time - this.offset;
    // this.play();
    await this.fade_in();
  }

  private get audio_current_time() {
    return this.audio.currentTime;
  }

  private get src() {
    return this.track.src;
  }

  private get client_vitals(): Vitals {
    return {
      start_time: this.server_start_time,
      current_time: this.current_client_time,
      current_track_time: this.current_playback_time,
      track: this.track,
      id: this.id,
    };
  }

  private fade_in() {
    this.log.innerHTML = "FADING IN";
    return new Promise((resolve, reject) => {
      //animate audio volume from 0 to 1 iin 2 seconds
      this.audio.volume = 1;
      // this.audio.play();
      // $(this.audio)
      //   .animate(
      //     { volume: 1 }, 2000
      //   )
      //   .on("finish", () => {
      resolve(true);
      //   });
    });
  }
  private fade_out() {
    this.log.innerHTML = "FADING OUT";
    return new Promise((resolve, reject) => {
      //animate audio volume from 0 to 1 iin 2 seconds
      this.audio.volume = 0;
      // this.audio.play();

      // $(this.audio)
      //   .animate({ volume: 0 }, 2000)
      //   .on("finish", () => {
      //     this.log.innerHTML = "FADED OUT";
      resolve(true);
      //   });
    });
  }

  private delay(time: number = 2000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  static PING_COUNT = 3;
  static PING_TIMEOUT = 5000;
  static PING_HOLD = 3000;
  private missed_pings = 0;

  private reset_timer() {
    console.log("RESETTING TIMEOUT");

    if (this.timeout) {
      console.debug("CLEARING TIMEOUT");
      window.clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.missed_pings++;
      this.error_log.innerHTML = "ERROR: NO PING #" + this.missed_pings;
      if (this.missed_pings > ClientDevice.PING_COUNT) {
        this.error_log.innerHTML = "ERROR: TOO MANY MISSED PINGS";
        this.kill();
      } else {
        this.reset_timer();
      }
    }, ClientDevice.PING_TIMEOUT);
  }

  public ping() {
    console.debug("PING");
    this.reset_timer();
    const ping = fetch("/vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.client_vitals),
    })
      .then((res) => res.json())
      .then(async (data: Vitals) => {
        await this.check(data);
      });
    ////
    return ping.then(async (res) => {
      await this.delay(ClientDevice.PING_HOLD);
      return res;
    });
  }

  private check(server_vitals: Vitals) {
    const client_vitals = this.client_vitals;
    return Promise.all([
      this.check_time(client_vitals, server_vitals),
      this.check_track(client_vitals, server_vitals),
      //TODO: Add checks here
    ]);
  }

  private async check_time(client_vitals: Vitals, server_vitals: Vitals) {
    //checks difference between client and server time
    const client_time = client_vitals.current_time - client_vitals.start_time;
    const server_time = server_vitals.current_time - server_vitals.start_time;
    const time_difference = client_time - server_time;
    if (
      time_difference > ClientDevice.ADJUST_THRESHOLD ||
      time_difference < -ClientDevice.ADJUST_THRESHOLD
    ) {
      //adjust
      console.log("ADJUSTING TIME");
      return this.set_time(server_time);
    }
    console.log("TIME OK");
    
    return;
  }

  private async check_track(client_vitals: Vitals, server_vitals: Vitals) {
    //checks difference between client and server track
    if (client_vitals.track.id !== server_vitals.track.id) {
      //replace
      this.log.innerHTML = "REPLACING TRACK";
      return this.set_track(server_vitals.track);
    }
    console.log("TRACK OK");
    return;
  }
}
