import { monitor_data } from "../app";
import { Track } from "../engine/managers";

const volume_master = document.getElementById(
  "volume_master"
) as HTMLInputElement;

const time_log = document.getElementById("time_log") as HTMLElement;
const avg_fetch_time = document.getElementById("avg_fetch_time") as HTMLElement;
const last_fetch_time = document.getElementById(
  "last_fetch_time"
) as HTMLElement;
const loop_log = document.getElementById("loop_log") as HTMLElement;

function build_device(device) {
  const d = document.createElement("div");
  d.classList.add("device");

  const h = document.createElement("h2");
  h.innerText = device.name;
  d.appendChild(h);

  const p = document.createElement("p");
  p.innerText = device.track;
  d.appendChild(p);

  return d;
}

const req_times: number[] = [];

// const tracks : {
//     id: number,
//     track: Track,
//     log_element: HTMLElement
// }[] = []
// function set_track(t:Track) {
    
// }

function setup_logs(data: monitor_data & { fetch_time: number }) {
  //deconstruct data
  const { devices, time_manager, track_manager } = data;
  console.log(data);

  //TRACK TIME
  const track_time = time_manager.current_track_time;
  const minutes = Math.floor(track_time / 1000 / 60);
  const seconds = Math.floor(track_time / 1000) % 60;
  const milliseconds = Math.floor(track_time % 1000);
  time_log.innerText = `${minutes}:${seconds}:${milliseconds}`;
  last_fetch_time.innerText = data.fetch_time.toString();
  req_times.push(data.fetch_time) + "ms";
  avg_fetch_time.innerText =
    (req_times.reduce((a, b) => a + b, 0) / req_times.length).toFixed(5) + "ms";

  loop_log.innerText = data.time_manager.current_loop.toString();
}

function start_monitor() {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const monitor_data = await fetch("/monitor_data")
          .then((res) => res.json())
          .then((res: monitor_data) => {
            return {
              ...res,
              fetch_time: Date.now() - start,
            } as monitor_data & { fetch_time: number };
          })
          .then((res) => {
            setup_logs(res);
            return res;
          });
      } catch (err) {
        clearInterval(interval);
        console.log(err);
        resolve(false);
      }
    }, 1000);
  });
}
window.addEventListener("DOMContentLoaded", async () => {
  const monitor = start_monitor();
  monitor.then((res) => {
    console.log("MONITOR ENDED", res);
  });
});
