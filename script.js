const DB = "https://tinkr.tech/sdb/Damian_space/Damian_Adamson";
const container = document.getElementById("game");

// Assets
const hexAssets = {
  red: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_red.svg",
  green: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_green.svg",
  blue: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_blue.svg",
  yellow: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_yellow.svg",
  purple: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_purple.svg",
  neutral: "https://tinkr.tech/sdb_apps/antiyoy/images/hex_neutral.svg"
};

const unitAssets = {
  peasant: "https://tinkr.tech/sdb_apps/antiyoy/images/unit_peasant.svg",
  spearman: "https://tinkr.tech/sdb_apps/antiyoy/images/unit_spearman.svg",
  knight: "https://tinkr.tech/sdb_apps/antiyoy/images/unit_knight.svg",
  baron: "https://tinkr.tech/sdb_apps/antiyoy/images/unit_baron.svg"
};

const buildingAssets = {
  farm: "https://tinkr.tech/sdb_apps/antiyoy/images/building_farm.svg",
  tower: "https://tinkr.tech/sdb_apps/antiyoy/images/building_tower.svg",
  fortress: "https://tinkr.tech/sdb_apps/antiyoy/images/building_fortress.svg"
};

const miscAssets = {
  tree: "https://tinkr.tech/sdb_apps/antiyoy/images/tree.svg",
  coin: "https://tinkr.tech/sdb_apps/antiyoy/images/coin.svg"
};

async function loadGame() {
  try {
    const res = await fetch(DB);
    const state = await res.json();

    container.innerHTML = "";

    for (const hex of state.map) {
      if (hex.type === "impassable") continue;

      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = hex.x + "px";
      el.style.top = hex.y + "px";
      el.style.width = hex.width + "px";
      el.style.height = hex.height + "px";

      // Hex
      const img = document.createElement("img");
      const color = hex.owner ? hex.owner : "neutral";
      img.src = hexAssets[color] || hexAssets.neutral;
      img.style.width = "100%";
      img.style.height = "100%";
      el.appendChild(img);

      // Units
      if (hex.unit_image) {
        const unitName = hex.unit_image.replace(".svg", "").replace("unit_", "");
        const unit = document.createElement("img");
        unit.src = unitAssets[unitName] || "";
        unit.style.position = "absolute";
        unit.style.left = "0";
        unit.style.top = "0";
        unit.style.width = "100%";
        unit.style.height = "100%";
        unit.style.pointerEvents = "none";
        el.appendChild(unit);
      }

      // Buildings
      if (hex.building_image) {
        const buildingName = hex.building_image.replace(".svg", "").replace("building_", "");
        const building = document.createElement("img");
        building.src = buildingAssets[buildingName] || "";
        building.style.position = "absolute";
        building.style.left = "0";
        building.style.top = "0";
        building.style.width = "100%";
        building.style.height = "100%";
        building.style.pointerEvents = "none";
        el.appendChild(building);
      }

      // Trees
      if (hex.hasTree || hex.tree_image) {
        const tree = document.createElement("img");
        tree.src = hex.tree_image ? DB + hex.tree_image : miscAssets.tree;
        tree.style.position = "absolute";
        tree.style.left = "0";
        tree.style.top = "0";
        tree.style.width = "100%";
        tree.style.height = "100%";
        tree.style.pointerEvents = "none";
        el.appendChild(tree);
      }

      // Coins
      if (hex.hasCoin || hex.coin_image) {
        const coin = document.createElement("img");
        coin.src = hex.coin_image ? DB + hex.coin_image : miscAssets.coin;
        coin.style.position = "absolute";
        coin.style.left = "0";
        coin.style.top = "0";
        coin.style.width = "100%";
        coin.style.height = "100%";
        coin.style.pointerEvents = "none";
        el.appendChild(coin);
      }

      container.appendChild(el);
    }

  } catch (err) {
    console.error("Error with map rendering", err);
  }
}

loadGame();
setInterval(loadGame, 1000);