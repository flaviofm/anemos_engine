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
      console.log("PLAYING NOW");

      // console.warn("1");

      // await device.ping();
      // console.warn("2");
      ping_log.classList.add("active");
      try {
        while (true) {
          await device.ping();
          device.play();
          await device.delay(ClientDevice.PING_HOLD);
          //   console.warn("PINGING");
          //   console.warn("PINGIED");
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
  static ADJUST_THRESHOLD = 5; //seconds

  private audio: HTMLAudioElement;
  private log: HTMLElement;
  private status: HTMLElement;
  private error_log: HTMLElement;
  private track_log: HTMLElement;

  private async kill(str: string) {
    await this.fade_out();
    this.audio.pause();
    this.audio.src = "";
    this.audio.load();
    this.status.innerHTML = "DEAD by " + str;
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
    return this.audio.currentTime;
    // return (
    //   (this.current_client_time -
    //     this.client_start_time +
    //     this.server_current_time -
    //     this.server_start_time) /
    //   1000
    // );
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
    console.warn("PLAY");

    if (this.audio.src == "") throw new Error("NO TRACK");
    // if (!this.audio.paused) {
    //   console.warn("ALREADY PLAYING");
    //   return
    // }
    //CHECKS TIME - qua controlla manualmente ma i ping confermeranno
    // this.ping_once();
    this.set_time(this.computed_current_track_time);

    try {
      await this.audio.play();
    } catch (err) {
      console.log("NOT TIME YET");
      return;
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

  private get local_duration() {
    return this.audio.duration;
  }

  private get computed_current_track_time() {
    const server_count = this.server_start_time - this.server_current_time;
    const local_count =
      (Date.now() - this.server_start_time) % this.local_duration;

    const check_time = server_count - local_count;
    if (check_time < 2 && check_time > -2) {
      return local_count;
    } else {
      return server_count;
    }
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

  public delay(time: number = 2000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  private timeout: ReturnType<typeof setTimeout>;

  static PING_COUNT = 10;
  static PING_TIMEOUT = 9500;
  static PING_HOLD = 4000;
  private missed_pings = 0;

  private stop_timeout() {
    if (this.timeout) {
      console.debug("CLEARING TIMEOUT");
      window.clearTimeout(this.timeout);
    }
  }

  private reset_timer() {
    console.log("RESETTING TIMEOUT");
    this.timeout = setTimeout(() => {
      this.missed_pings++;
      this.error_log.innerHTML = "ERROR: NO PING #" + this.missed_pings;
      if (this.missed_pings > ClientDevice.PING_COUNT) {
        this.error_log.innerHTML = `ERROR: TOO MANY MISSED PINGS (${this.missed_pings})`;
        this.kill("missed pings");
      }
    }, ClientDevice.PING_TIMEOUT);
  }

  private ping_once() {
    return fetch("/vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.client_vitals),
    })
      .then((res) => {
        console.log(res, res.ok, res.status);
        if (!res.ok) {
          this.error_log.innerText = "SERVER IS THE KILLER";
        }
        return res.json();
      })
      .then(async (data: Vitals) => {
        this.missed_pings = 0;
        this.error_log.innerHTML = "";
        return await this.check(data);
      });
  }

  public async ping() {
    console.debug("PING");
    this.stop_timeout();
    ////
    return await this.ping_once().then(async (res) => {
      // await this.delay(ClientDevice.PING_HOLD);
      this.reset_timer();
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
    const server_track_time = server_vitals.current_track_time / 1000;
    const client_track_time = client_vitals.current_track_time;

    const hold = 30; //seconds

    const difference = server_track_time - client_track_time;
    console.log(
      "TRACK TIME DIFF",
      difference,
      server_track_time,
      client_track_time
    );
    if (
      difference > ClientDevice.ADJUST_THRESHOLD ||
      difference < -ClientDevice.ADJUST_THRESHOLD
    ) {
      //adjust
      console.log("ADJUSTING TIME", server_track_time);
      if (server_track_time < hold) {
        console.log("DELAY", (hold - server_track_time) * 1000);
        await this.delay((hold - server_track_time) * 1000);
        return this.set_time(0);
      }
      console.log("NO DELAY", server_track_time, server_track_time - hold);

      return await this.set_time(server_track_time - hold);
    } else {
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
