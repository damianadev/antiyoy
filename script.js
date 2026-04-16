const DB = "https://tinkr.tech/sdb/Damian_space/Damian_Adamson";
const BASE = "https://tinkr.tech";

const container = document.getElementById("game");

let selectedHex = null;
let movedThisTurn = false;


// LOAD GAME
async function loadGame() {
  try {
    const res = await fetch(DB);
    const state = await res.json();

    container.innerHTML = "";

    for (const hex of state.map) {
      if (hex.type === "impassable") continue;

      const el = document.createElement("div");
      el.className = "hex";

      el.style.left = hex.x + "px";
      el.style.top = hex.y + "px";
      el.style.width = hex.width + "px";
      el.style.height = hex.height + "px";

      const img = document.createElement("img");
      img.src = BASE + hex.image;
      el.appendChild(img);

      if (hex.unit_image) {
        const unit = document.createElement("img");
        unit.src = BASE + hex.unit_image;
        unit.className = "overlay";
        el.appendChild(unit);
      }

      if (hex.building_image) {
        const building = document.createElement("img");
        building.src = BASE + hex.building_image;
        building.className = "overlay";
        el.appendChild(building);
      }

      el.addEventListener("click", () => onHexClick(el, hex));

      container.appendChild(el);
    }

  } catch (err) {
    console.error("Load error:", err);
  }
}


// CLICK SYSTEM
function onHexClick(el, hex) {
  document.querySelectorAll(".hex").forEach(h => h.classList.remove("selected"));

  if (movedThisTurn) return;

  if (!selectedHex) {
    if (!hex.unit) return;

    selectedHex = hex;
    el.classList.add("selected");
    return;
  }

  moveUnit(selectedHex, hex);
  selectedHex = null;
}


// MOVE SYSTEM
async function moveUnit(from, to) {
  const player_key = localStorage.getItem("player_key");

  if (!player_key) return;
  if (!from.unit) return;
  if (movedThisTurn) return;

  const res = await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "move",
      player_key,
      from: { col: from.col, row: from.row },
      to: { col: to.col, row: to.row }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("MOVE ERROR:", data.error);
    return;
  }

  movedThisTurn = true;
}


// END TURN
async function endTurn() {
  const player_key = localStorage.getItem("player_key");

  const res = await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "end_turn",
      player_key
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("END TURN ERROR:", data.error);
    return;
  }

  movedThisTurn = false;
  selectedHex = null;
}


// JOIN GAME
async function joinGame() {
  const username = prompt("Enter username");

  const res = await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "join",
      username
    })
  });

  const data = await res.json();

  if (data.player_key) {
    localStorage.setItem("player_key", data.player_key);
    alert("Joined!");
  } else {
    console.log(data);
    alert("Join failed");
  }
}


// START GAME
async function startGame() {
  const res = await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data);
  }
}


// AUTO UPDATE
loadGame();
setInterval(loadGame, 1000);