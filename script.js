const DB = "https://tinkr.tech/sdb/Damian_space/Damian_Adamson";
const BASE = "https://tinkr.tech";

const container = document.getElementById("game");

let selectedHex = null;
let movedThisTurn = false;

let currentPlayer = null;
let myUsername = localStorage.getItem("username");

// PRICES
const PRICES = {
  peasant: 10,
  spearman: 20,
  knight: 40,
  farm: 12,
  tower: 15,
  fortress: 35
};

//LOAD GAME
async function loadGame() {
  try {
    const res = await fetch(DB);
    const state = await res.json();

    container.innerHTML = "";

    currentPlayer = state.current_player;

    const me = state.players.find(
      p => p.username.toLowerCase() === (myUsername || "").toLowerCase()
    );

    console.log("CURRENT TURN:", state.current_player);

    let ui = document.getElementById("ui");

    if (ui && me) {
      ui.innerHTML = `
        <div>Turn: <b>${state.current_player}</b></div>
        <hr>
        <div>💰 My money: <b>${me.money}</b></div>
        <div>📈 Income: +${me.income}</div>
        <hr>
        <div>Peasant: ${PRICES.peasant}</div>
        <div>Spearman: ${PRICES.spearman}</div>
        <div>Knight: ${PRICES.knight}</div>
        <div>Farm: ${PRICES.farm}</div>
        <div>Tower: ${PRICES.tower}</div>
        <div>Fortress: ${PRICES.fortress}</div>
      `;
    }

    for (const hex of state.map) {
      if (hex.type === "impassable") continue;

      const el = document.createElement("div");
      el.className = "hex";

      el.style.left = hex.x + "px";
      el.style.top = hex.y + "px";
      el.style.width = hex.width + "px";
      el.style.height = hex.height + "px";

      el.dataset.col = hex.col;
      el.dataset.row = hex.row;

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

      el.addEventListener("click", () => onHexClick(hex));

      container.appendChild(el);
    }

  } catch (err) {
    console.error("Load error:", err);
  }
}

//CLICK
function onHexClick(hex) {
  if (movedThisTurn) return;
  if (currentPlayer !== myUsername) return;

  document.querySelectorAll(".hex").forEach(h => h.classList.remove("selected"));

  // BUY MODE
  if (hex.unit === null && selectedHex === "BUY_PEASANT") {
    buy("peasant", hex);
    selectedHex = null;
    return;
  }

  if (hex.unit === null && selectedHex === "BUY_SPEARMAN") {
    buy("spearman", hex);
    selectedHex = null;
    return;
  }

  if (hex.unit === null && selectedHex === "BUY_KNIGHT") {
    buy("knight", hex);
    selectedHex = null;
    return;
  }

  if (hex.unit === null && selectedHex === "BUY_FARM") {
    buy("farm", hex);
    selectedHex = null;
    return;
  }

  if (hex.unit === null && selectedHex === "BUY_TOWER") {
    buy("tower", hex);
    selectedHex = null;
    return;
  }

  if (hex.unit === null && selectedHex === "BUY_FORTRESS") {
    buy("fortress", hex);
    selectedHex = null;
    return;
  }

  // MOVE MODE
  if (!selectedHex) {
    if (!hex.unit) return;

    selectedHex = hex;

    const el = findHexElement(hex);
    if (el) el.classList.add("selected");

    return;
  }

  moveUnit(selectedHex, hex);
  selectedHex = null;
}

//FIND ELEMENT
function findHexElement(hex) {
  return [...document.querySelectorAll(".hex")]
    .find(el => el.dataset.col == hex.col && el.dataset.row == hex.row);
}

//MOVE
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
    alert("MOVE ERROR: " + data.error);
    return;
  }

  console.log(`${myUsername} moved from (${from.col},${from.row}) to (${to.col},${to.row})`);

  movedThisTurn = true;
}

//BUY
async function buy(type, hex) {
  const player_key = localStorage.getItem("player_key");

  if (!player_key) return;
  if (currentPlayer !== myUsername) return;

  const res = await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "buy",
      player_key,
      type,
      hex: { col: hex.col, row: hex.row }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert("BUY ERROR: " + data.error);
    return;
  }

  console.log(`${myUsername} bought ${type} at (${hex.col},${hex.row})`);
}

//END TURN
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
    alert("END TURN ERROR: " + data.error);
    return;
  }

  console.log("END TURN by", myUsername);

  movedThisTurn = false;
  selectedHex = null;
}

//JOIN
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
    localStorage.setItem("username", username);
    myUsername = username;
    alert("Joined!");
  } else {
    alert("Join failed: " + data.error);
  }
}

//START GAME
async function startGame() {
  await fetch(DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" })
  });
}

//INIT
window.onload = () => {
  myUsername = localStorage.getItem("username");
  loadGame();
};

setInterval(loadGame, 1500);

//DEBUG
setInterval(() => {
  console.log("---- DEBUG ----");
  console.log("Current:", currentPlayer);
  console.log("Me:", myUsername);
  console.log("Selected:", selectedHex);
}, 5000);