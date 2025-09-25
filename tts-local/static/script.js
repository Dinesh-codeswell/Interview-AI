const textEl = document.getElementById("text");
const ls = document.getElementById("lengthScale");
const ns = document.getElementById("noiseScale");
const nw = document.getElementById("noiseW");

const lsVal = document.getElementById("lsVal");
const nsVal = document.getElementById("nsVal");
const nwVal = document.getElementById("nwVal");

[ls, ns, nw].forEach(el => el.addEventListener("input", () => {
  lsVal.textContent = ls.value;
  nsVal.textContent = ns.value;
  nwVal.textContent = nw.value;
}));

document.getElementById("speak").addEventListener("click", async () => {
  const payload = {
    text: textEl.value,
    length_scale: parseFloat(ls.value),
    noise_scale: parseFloat(ns.value),
    noise_w: parseFloat(nw.value)
  };
  const res = await fetch("/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    const msg = await res.text();
    alert("TTS failed: " + msg);
    return;
  }
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], { type: "audio/wav" });
  const player = document.getElementById("player");
  player.src = URL.createObjectURL(blob);
  player.play();
});
