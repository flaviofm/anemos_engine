import { Vitals, setup_data } from "../app";
import { Track } from "../engine/managers";

console.log("FRONTEND");
var PROCESS: () => Promise<setup_data> = () =>
  fetch("/setup").then((res) => {
    console.debug(res, res.ok, res.status, res.statusText);
    return res.json();
  });

const play_btns = Array.from(document.getElementsByClassName("play"));

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById('over')?.classList.add('active')
  await landing_scene();
  const res = await PROCESS();
  const device = await init(res);
  const ok = await device.setup();
  console.warn("INITED");
  await ready_scene();

  play_btns.forEach((e) =>
    e.addEventListener("click", async () => {
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        device.play();
        device.pause();
      }

      // waiting_scene()
      document.getElementById('landing')!.classList.remove("active");

      play_btns.forEach((e) => e.classList.remove("active"));
      await device.ping_once();

      device.play();
    })
  );
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
  pause() {
    this.audio.pause();
  }
  static ADJUST_THRESHOLD = 5; //seconds

  private audio: HTMLVideoElement;
  private log: HTMLElement;
  private status: HTMLElement;
  private error_log: HTMLElement;
  private track_log: HTMLElement;

  constructor(
    private id: number,
    private track: Track,
    private client_start_time: number,
    private server_start_time: number,
    private server_current_time: number
  ) {
    this.audio = document.getElementById("audio") as HTMLVideoElement;
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
      this.audio.currentTime
    );
    await this.set_track(this.track);
    // await this.set_time(this.current_playback_time);
    console.log("SETTED UP", this.audio.src, this.audio.currentTime);

    return true;
  }

  private set_track(t: Track) {
    //CAMBIATE TRACKS CONO SERVER MAX
    // const src = "/tracks/" + t.src;
    const src = t.src;
    
    console.log(src);

    return new Promise(async (resolve, reject) => {
      // await this.fade_out();

      this.track = t;
      this.audio.src = src;
      this.audio.load();
      this.track_log.innerHTML = "TRACK: " + this.track.label;
      //when the audio is ready to play
      this.audio.oncanplay = () => {
        // play_btns.forEach(e => e.classList.add("active"))
        ready_scene();

        resolve(true);
      };
    });
  }

  public async play() {
    if (this.audio.src == "") throw new Error("NO TRACK");
    try {
      console.warn("PLAY");
      await this.audio.play();
      console.warn("PLAYING");
    } catch (err) {
      console.log("NOT TIME YET", err);
      return;
    }
    this.status.innerHTML = "PLAYING";
  }

  private async set_time(time: number) {
    this.audio.currentTime = time;
    // this.play();
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
      current_time: Date.now(),
      current_track_time: this.audio.currentTime,
      track: this.track,
      id: this.id,
    };
  }

  public delay(time: number = 2000) {
    console.warn("DELAY OF ", time);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.warn("DELAYED ", time);
        resolve(true);
      }, time);
    });
  }

  public async ping_once() {
    const res = await fetch("/vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.client_vitals),
    }).then((res) => {
      console.warn("VITALS", res);
      
      console.log(res, res.ok, res.status);
      if (!res.ok) {
        this.error_log.innerText = "SERVER IS THE KILLER";
      }
      return res.json();
    }).then((x) => {
      console.log(x);
      return x
    });
    const client_vitals = this.client_vitals;

    return await this.check_time(client_vitals, res);
    // .then(async (data: Vitals) => {
    //   // this.missed_pings = 0;
    //   // this.error_log.innerHTML = "";
    //   // await this.check(data);
    //   const client_vitals = this.client_vitals;

    //   return await this.check_time(client_vitals, data);
    // });
  }

  // private check(server_vitals: Vitals) {
  //   const client_vitals = this.client_vitals;
  //   return Promise.all([
  //     this.check_time(client_vitals, server_vitals),
  //     this.check_track(client_vitals, server_vitals),
  //     //TODO: Add checks here
  //   ]);
  // }

  private async check_time(client_vitals: Vitals, server_vitals: Vitals) {
    console.warn("CHECK VITALS", client_vitals, server_vitals);
    
    const server_track_time = server_vitals.current_track_time / 1000;
    const client_track_time = client_vitals.current_track_time;

    const difference = server_track_time - client_track_time;
    console.log(
      "TRACK TIME DIFF",
      difference,
      server_track_time,
      client_track_time
    );
    // if (
    //   difference > ClientDevice.ADJUST_THRESHOLD ||
    //   difference < -ClientDevice.ADJUST_THRESHOLD
    // ) {
    //adjust
    console.log("ADJUSTING TIME");

    const countdown = 20; //seconds

    console.error("CHECK COUNT", server_track_time, countdown);

    if (server_track_time < countdown) {
      
      waiting_scene();

      console.warn("COUNTDOWN", countdown - server_track_time);
      this.status.innerHTML = "COUNTDOWN OF " + (countdown - server_track_time);

      //UI
      const cd_div = document.getElementById("countdown")!;
      let count = Math.floor(countdown - server_track_time);
      const inter = setInterval(() => {
        cd_div.innerHTML = `inizierà tra ${count} secondi`;
        count--;
        if (count <= 0) {
          // @ts-ignore
          clearInterval(inter);
          // playing_scene();
        }
      }, 1000);

      await this.delay((countdown - server_track_time) * 1000);
      // return await this.set_time(server_track_time);
    }

    playing_scene()

    return await this.set_time(server_track_time - countdown);
    // } else {
    //   console.log("TIME OK");
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

////

//////SCENES
//////////MAIN INDEX
// function get_play_btns() {
//   return [
//     document.getElementById("play_btn")!,
//     document.getElementById("play_btn_debug")!,
//   ];
// }
function delay(ms: number) {
  return new Promise((succ, rej) => setTimeout(() => succ(true), ms));
}
function set_section(id: string) {
  console.log(id);

  const secs = Array.from(document.getElementsByTagName("section"));
  secs.forEach((e) => {
    if (e.id == id) e.classList.add("active");
    else e.classList.remove("active");
  });
}
async function landing_scene() {
  delay(1000)
    .then(() => {
      set_section("landing");
      console.log("1");
    })
    .then(async () => {
      return await delay(3000).then((res) => {
        console.log("2");
        document.getElementById("landing")?.classList.add("ready");
      });
    });
}
async function ready_scene() {
  console.warn("READY");
  // set_section("ready");
  play_btns.forEach((b) => b.classList.add("active"));
  // play_btns.forEach((b) => b.classList.add("active"));
  //TODO: pagina con il tasto play
}
async function waiting_scene() {
  console.warn('waiting');
  
  set_section("wait");

  //TODO: pagina con presentazione artisti
}
async function playing_scene() {
  set_section("playing");

  //TODO: schermata mentre c'è play
}
