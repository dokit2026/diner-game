/* =========================
   要素の取得
========================= */

const sceneImage = document.getElementById("sceneImage");

const statusBar = document.getElementById("statusBar");
const moneyText = document.getElementById("moneyText");
const fullnessText = document.getElementById("fullnessText");

const startLayer = document.getElementById("startLayer");
const menuLayer = document.getElementById("menuLayer");
const eatLayer = document.getElementById("eatLayer");
const resultLayer = document.getElementById("resultLayer");

const startButton = document.getElementById("startButton");

const detailModal = document.getElementById("detailModal");
const detailMoney = document.getElementById("detailMoney");
const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailPrice = document.getElementById("detailPrice");
const detailDesc = document.getElementById("detailDesc");

const detailBackButton = document.getElementById("detailBackButton");
const buyButton = document.getElementById("buyButton");

const foodOnTable = document.getElementById("foodOnTable");
const eatButton = document.getElementById("eatButton");

const saltButton = document.getElementById("saltButton");
const sauceButton = document.getElementById("sauceButton");

const message = document.getElementById("message");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resultMoney = document.getElementById("resultMoney");
const resultFullness = document.getElementById("resultFullness");
const restartButton = document.getElementById("restartButton");


/* =========================
   ゲーム設定
========================= */

const START_MONEY = 30;
const CLEAR_FULLNESS = 100;

document.title = "Diner $30 Challenge";


/* =========================
   画像パス
========================= */

const START_IMAGE = "images/start.png";
const MENU_IMAGE = "images/menu.png";
const TABLE_IMAGE = "images/table_empty.png";
const EXIT_IMAGE = "images/exit.png";


/* =========================
   メニュー情報
========================= */

const menuItems = {
hamburger: {
  name: "Hamburger",
  price: 8,
  fullness: 12,
  desc: "ケチャップ付き",
  detailImage: "images/hamburger.png",
  tableFrames: ["images/hamburger.png"],
  tableWidth: "36%",
  tableScale: 1.1,
  detailWidth: "100%",
  detailMaxHeight: "210px",
  detailScale: 1.25
},

  hotdog: {
    name: "Hot-dog",
    price: 8,
    fullness: 11,
    desc: "ケチャップ付き",
    detailImage: "images/hotdog.png",
    tableFrames: ["images/hotdog.png"],
    tableWidth: "30%",
    tableScale: 1,
    detailWidth: "100%",
    detailMaxHeight: "190px",
    detailScale: 1
  },

  omelet: {
    name: "Omelet",
    price: 7,
    fullness: 10,
    desc: "ポテトとベーコン\n付き",
    detailImage: "images/omelet_1.png",
    tableFrames: [
      "images/omelet_1.png",
      "images/omelet_2.png",
      "images/omelet_3.png"
    ],
    tableWidth: "36%",
    tableScale: 1.15,
    detailWidth: "100%",
    detailMaxHeight: "260px",
    detailScale: 1.45
  },

  milkshake: {
    name: "Milkshake",
    price: 6,
    fullness: 7,
    desc: "素朴なバニラ味",
    detailImage: "images/milkshake.png",
    tableFrames: ["images/milkshake.png"],
    tableWidth: "18%",
    tableScale: 1,
    detailWidth: "82%",
    detailMaxHeight: "210px",
    detailScale: 1
  },

  creamsoda: {
    name: "Creamsoda",
    price: 6,
    fullness: 6,
    desc: "すごく甘い",
    detailImage: "images/creamsoda_1.png",
    tableFrames: [
      "images/creamsoda_1.png",
      "images/creamsoda_2.png",
      "images/creamsoda_3.png"
    ],
    tableWidth: "18%",
    tableScale: 1,
    detailWidth: "82%",
    detailMaxHeight: "210px",
    detailScale: 1
  },

  coffee: {
    name: "Coffee",
    price: 5,
    fullness: 4,
    desc: "飲み放題",
    detailImage: "images/coffee.png",
    tableFrames: ["images/coffee.png"],
    tableWidth: "20%",
    tableScale: 1,
    detailWidth: "95%",
    detailMaxHeight: "190px",
    detailScale: 1
  },

  pancake: {
    name: "Pancake",
    price: 7,
    fullness: 10,
    burntFullness: 6,
    desc: "たまに焦げる",
    detailImage: "images/pancake.png",
    tableFrames: ["images/pancake.png"],
    burntFrames: ["images/pancake_burnt.png"],
    tableWidth: "28%",
    tableScale: 1,
    detailWidth: "105%",
    detailMaxHeight: "190px",
    detailScale: 1
  },

  salad: {
    name: "Salad",
    price: 7,
    fullness: 8,
    desc: "ギリシャサラダ",
    detailImage: "images/salad_top.png",
    tableFrames: ["images/salad_side.png"],
    tableWidth: "28%",
    tableScale: 1,
    detailWidth: "105%",
    detailMaxHeight: "190px",
    detailScale: 1
  }
};


/* =========================
   ゲーム状態
========================= */

let money = START_MONEY;
let fullness = 0;

let selectedItemKey = null;
let currentOrder = null;
let currentEatIndex = 0;

let usedSeasonings = new Set();
let orderHistory = [];

let secretComboDone = false;
let burntPancakeCount = 0;
let burntSecretDone = false;

// Coffeeを1回頼んだら、2回目以降は無料
let coffeeRefillUnlocked = false;


/* =========================
   共通処理
========================= */

function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

function updateStatus() {
  moneyText.textContent = `$ ${money}`;
  fullnessText.textContent = `FULL ${fullness}%`;
  detailMoney.textContent = `$ ${money}`;
}

function showMessage(text, time = 1500) {
  message.textContent = text;
  show(message);

  clearTimeout(showMessage.timer);

  showMessage.timer = setTimeout(() => {
    hide(message);
  }, time);
}

function clampFullness(value) {
  return Math.max(0, Math.min(100, value));
}

function getCheapestPrice() {
  // Coffeeおかわり無料が解放されていたら、無料で頼めるものがある
  if (coffeeRefillUnlocked) {
    return 0;
  }

  return Math.min(...Object.values(menuItems).map(item => item.price));
}


/* =========================
   ゲーム開始・リセット
========================= */

function resetGame() {
  money = START_MONEY;
  fullness = 0;

  selectedItemKey = null;
  currentOrder = null;
  currentEatIndex = 0;

  usedSeasonings.clear();
  orderHistory = [];

  secretComboDone = false;
  burntPancakeCount = 0;
  burntSecretDone = false;
  coffeeRefillUnlocked = false;

  document.title = "Diner $30 Challenge";

  sceneImage.src = START_IMAGE;

  show(startLayer);
  hide(menuLayer);
  hide(eatLayer);
  hide(detailModal);
  hide(resultLayer);
  hide(message);
  hide(statusBar);

  updateStatus();
}

function openMenu() {
  sceneImage.src = MENU_IMAGE;

  hide(startLayer);
  hide(eatLayer);
  hide(detailModal);
  hide(resultLayer);
  show(menuLayer);
  show(statusBar);

  showMessage("メニューを開いた！");
}


/* =========================
   商品詳細
========================= */

function openDetail(itemKey) {
  selectedItemKey = itemKey;

  const item = menuItems[itemKey];

  detailImage.src = item.detailImage;
  detailImage.alt = item.name;
  detailName.textContent = item.name;

  // Coffeeは2回目以降だけFREE表示
  if (itemKey === "coffee" && coffeeRefillUnlocked) {
    detailPrice.textContent = "FREE";
    detailDesc.textContent = "おかわり無料";
  } else {
    detailPrice.textContent = `$${item.price}`;
    detailDesc.textContent = item.desc;
  }

  detailImage.style.width = item.detailWidth || "100%";
  detailImage.style.maxHeight = item.detailMaxHeight || "190px";
  detailImage.style.transform = `scale(${item.detailScale || 1})`;
  detailImage.style.transformOrigin = "center center";

  updateStatus();

  hide(statusBar);
  show(detailModal);
}

function closeDetail() {
  selectedItemKey = null;
  hide(detailModal);
  show(statusBar);
}


/* =========================
   購入処理
========================= */

function buySelectedItem() {
  if (!selectedItemKey) return;

  const item = menuItems[selectedItemKey];
  const cheapest = getCheapestPrice();

  // Coffeeは1回目だけ有料、2回目以降は無料
  const isFreeCoffee = selectedItemKey === "coffee" && coffeeRefillUnlocked;
  const priceToPay = isFreeCoffee ? 0 : item.price;

  // もう何も買えない金額なら終了
  // ただしCoffee無料が解放されているなら終わらない
  if (!coffeeRefillUnlocked && money < cheapest) {
    hide(detailModal);

    setTimeout(() => {
      showResult({
        title: "MONEY END",
        text: "もう買えるものがない…"
      });
    }, 500);

    return;
  }

  // 選んだメニューが高すぎる場合
  if (money < priceToPay) {
    showMessage("このメニューは買えない…");
    return;
  }

  money -= priceToPay;
  updateStatus();

  const order = createOrder(selectedItemKey);

  // Coffeeを初めて買ったら、次から無料
  if (selectedItemKey === "coffee" && !coffeeRefillUnlocked) {
    coffeeRefillUnlocked = true;
    order.refillUnlockedNow = true;
  }

  hide(detailModal);
  openEatingScreen(order);
}


/* =========================
   注文内容を作る
========================= */

function createOrder(itemKey) {
  const item = menuItems[itemKey];

  const order = {
    key: itemKey,
    name: item.name,
    price: item.price,
    fullness: item.fullness,
    frames: [...item.tableFrames],
    tableWidth: item.tableWidth,
    tableScale: item.tableScale || 1,
    isBurnt: false,
    refillUnlockedNow: false
  };

  // パンケーキだけ30%の確率で焦げる
  if (itemKey === "pancake") {
    const isBurnt = Math.random() < 0.3;

    if (isBurnt) {
      order.frames = [...item.burntFrames];
      order.fullness = item.burntFullness;
      order.isBurnt = true;
    }
  }

  return order;
}


/* =========================
   テーブルに料理を出す
========================= */

function openEatingScreen(order) {
  currentOrder = order;
  currentEatIndex = 0;
  usedSeasonings.clear();

  sceneImage.src = TABLE_IMAGE;

  foodOnTable.src = order.frames[0];
  foodOnTable.alt = order.name;
  foodOnTable.style.width = order.tableWidth;
  foodOnTable.style.transform = `translate(-50%, -50%) scale(${order.tableScale || 1})`;

  saltButton.classList.remove("used");
  sauceButton.classList.remove("used");

  hide(menuLayer);
  hide(detailModal);
  show(eatLayer);
  show(statusBar);

   if (order.refillUnlockedNow) {

    showMessage("Coffee が運ばれてきた！\n次からCoffeeはFREE！");

  } else if (order.isBurnt) {

    showMessage("あれ…パンケーキが焦げてる！");

  } else {

    showMessage(`${order.name} が運ばれてきた！`);

  }

}

/* =========================

   調味料

========================= */

function useSeasoning(type) {

  if (!currentOrder) return;

  if (usedSeasonings.has(type)) {

    showMessage("もうかけたよ");

    return;

  }

  usedSeasonings.add(type);

  if (type === "salt") {

    saltButton.classList.add("used");

    showMessage("塩をかけた！");

  }

  if (type === "sauce") {

    sauceButton.classList.add("used");

    showMessage("ソースをかけた！");

  }

}

function getSeasoningBonus(itemKey) {

  let bonus = 0;

  const notes = [];

  const isDrink = ["coffee", "milkshake", "creamsoda"].includes(itemKey);

  if (usedSeasonings.has("salt")) {

    if (["omelet", "salad", "pancake"].includes(itemKey)) {

      bonus += 2;

      notes.push("塩が合う！ +2");

    } else if (isDrink) {

      bonus -= 2;

      notes.push("飲み物に塩は変な味… -2");

    }

  }

  if (usedSeasonings.has("sauce")) {

    if (["hamburger", "hotdog", "omelet"].includes(itemKey)) {

      bonus += 3;

      notes.push("ソースが合う！ +3");

    } else if (isDrink) {

      bonus -= 3;

      notes.push("飲み物にソースはまずい… -3");

    } else if (itemKey === "pancake") {

      bonus -= 1;

      notes.push("パンケーキにソース…？ -1");

    }

  }

  return {

    bonus,

    notes

  };

}

/* =========================

   食べる処理

========================= */

function eatCurrentFood() {

  if (!currentOrder) return;

  // 食べ進み画像がある場合は画像を進める

  if (currentEatIndex < currentOrder.frames.length - 1) {

    currentEatIndex++;

    foodOnTable.src = currentOrder.frames[currentEatIndex];

    showMessage("もぐもぐ…");

    return;

  }

  finishEating();

}

function finishEating() {
  const seasoningResult = getSeasoningBonus(currentOrder.key);

  const foodGain = currentOrder.fullness;
  const seasoningBonus = seasoningResult.bonus;

  fullness = clampFullness(fullness + foodGain);
  fullness = clampFullness(fullness + seasoningBonus);

  orderHistory.push(currentOrder.key);

  let text = `${currentOrder.name} を食べた！\nFULL +${foodGain}`;

  if (seasoningResult.notes.length > 0) {
    text += `\n${seasoningResult.notes.join("\n")}`;
  }

  if (currentOrder.isBurnt) {
    burntPancakeCount++;
    text += "\n焦げてたけど食べた…";
  }

  const secretText = checkSecrets();

  if (secretText) {
    text += `\n${secretText}`;
  }

  updateStatus();
  showMessage(text, 2300);

  const result = getGameResult();

  if (result) {
    setTimeout(() => {
      showResult(result);
    }, 1200);
  } else {
    setTimeout(() => {
      returnToMenu();
    }, 1200);
  }
}

function returnToMenu() {

  currentOrder = null;

  currentEatIndex = 0;

  usedSeasonings.clear();

  sceneImage.src = MENU_IMAGE;

  hide(eatLayer);

  show(menuLayer);

  show(statusBar);

}

/* =========================

   隠し機能

========================= */

function checkSecrets() {

  let secretText = "";

  // Hamburger → Hot-dog → Milkshake の順番で食べるとボーナス

  const last3 = orderHistory.slice(-3).join(",");

  if (!secretComboDone && last3 === "hamburger,hotdog,milkshake") {

    money += 3;

    secretComboDone = true;

    updateStatus();

    secretText += "SECRET! American Combo! +$3";

  }

  // 焦げパンケーキを3回食べると隠しメッセージ

  if (!burntSecretDone && burntPancakeCount >= 3) {

    burntSecretDone = true;

    if (secretText) {

      secretText += "\n";

    }

    secretText += "SECRET! 焦げパンケーキ常連さん";

  }

  return secretText;

}

/* =========================

   結果判定

========================= */

function getGameResult() {

  const cheapest = getCheapestPrice();

  // 満腹度100%かつお金も使い切り

  if (fullness >= CLEAR_FULLNESS && money <= 0) {

    return {

      title: "PERFECT END",

      text: "30ドルも使い切って、おなかもいっぱい！"

    };

  }

  // 満腹度100%

  if (fullness >= CLEAR_FULLNESS) {

    return {

      title: "GAME CLEAR",

      text: "おなかいっぱい！"

    };

  }

  // お金が0

  // Coffee無料がある場合は、Coffeeを飲めるので続行

  if (money <= 0 && !coffeeRefillUnlocked) {

    return {

      title: "MONEY END",

      text: "30ドルを使い切った！"

    };

  }

  // 一番安いメニューも買えない

  // Coffee無料がある場合は続行

  if (money < cheapest && !coffeeRefillUnlocked) {

    return {

      title: "MONEY END",

      text: "もう買えるものがない…"

    };

  }

  return null;

}

function showResult(result) {

  sceneImage.src = EXIT_IMAGE;

  hide(startLayer);

  hide(menuLayer);

  hide(eatLayer);

  hide(detailModal);

  hide(statusBar);

  hide(message);

  resultTitle.textContent = result.title;

  resultText.textContent = result.text;

  resultMoney.textContent = `残金 $ ${money}`;

  resultFullness.textContent = `満腹度 ${fullness}%`;

  show(resultLayer);

}

/* =========================

   イベント設定

========================= */

startButton.addEventListener("click", openMenu);

document.querySelectorAll(".menu-item").forEach(button => {

  button.addEventListener("click", () => {

    const itemKey = button.dataset.item;

    openDetail(itemKey);

  });

});

detailBackButton.addEventListener("click", closeDetail);

buyButton.addEventListener("click", buySelectedItem);

eatButton.addEventListener("click", eatCurrentFood);

saltButton.addEventListener("click", () => {

  useSeasoning("salt");

});

sauceButton.addEventListener("click", () => {

  useSeasoning("sauce");

});

restartButton.addEventListener("click", resetGame);

/* =========================

   最初に実行

========================= */

resetGame();
