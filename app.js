// =====================
//  MODEL
// =====================
const model = {
  timeLimit: 60,
  timeLeft: 60,
  score: 0,
  lives: 3,
  questions: [],
  currentIndex: 0,
  timerId: null,
  isActive: false,
  locked: false,

  reset() {
    this.timeLeft = this.timeLimit;
    this.score = 0;
    this.lives = 3;
    this.currentIndex = 0;
    this.isActive = true;
    this.locked = false;
  },

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }
};

// =====================
//  VIEW
// =====================
const view = {
  messageEl: document.getElementById("message"),
  scoreEl: document.getElementById("score"),
  timeEl: document.getElementById("time"),
  livesEl: document.getElementById("lives"),
  qIndexEl: document.getElementById("qIndex"),

  displayMessage(msg) {
    this.messageEl.textContent = msg;
  },

  updateStats() {
    this.scoreEl.textContent = model.score;
    this.timeEl.textContent = model.timeLeft;
    this.livesEl.textContent = model.lives;
    this.qIndexEl.textContent = Math.min(
      model.currentIndex + 1,
      model.questions.length
    );
  }
};

// =====================
//  SESLER
// =====================
const correctSound = document.getElementById("sound-correct");
const wrongSound   = document.getElementById("sound-wrong");

// =====================
//  HARİTA
// =====================
let map;
let geoLayer;
const countryLayers = {};

function defaultCountryStyle() {
  return {
    color: "#333333",
    weight: 1,
    fillColor: "#d9d9d9",
    fillOpacity: 0.6
  };
}

// =====================
//  SORU HAVUZU (30 soru)
// =====================
const QUESTION_POOL = [
  { countryCode: "TUR", text: "Alper Gezeravcı, hangi ülkenin uzaya gönderilen ilk astronotudur?" },
  { countryCode: "USA", text: "SpaceX'in Starship roketini geliştiren ülkeyi seç." },
  { countryCode: "ARE", text: "2021’de Hope Mars Misyonu’nu gerçekleştiren ülkeyi seç." },
  { countryCode: "CHN", text: "2020 sonrası Ay keşif programı (Chang’e) ile Ay’a araç indiren Asya ülkesini seç." },
  { countryCode: "IND", text: "2023’te Chandrayaan-3 ile Ay’ın güney kutbuna inen ülkeyi seç." },
  { countryCode: "GBR", text: "2021’de hayatını kaybeden Prens Philip, hangi ülkenin kraliyet ailesine mensuptur?" },
  { countryCode: "RUS", text: "2022’de Ukrayna’ya yönelik askeri operasyon başlatan ülkeyi seç." },
  { countryCode: "UKR", text: "2022’den bu yana işgale karşı savunma yapan ülkeyi seç." },
  { countryCode: "JPN", text: "2020 Tokyo Olimpiyatlarına ev sahipliği yapan ülkeyi seç." },
  { countryCode: "QAT", text: "2022 FIFA Dünya Kupası’na ev sahipliği yapan ülkeyi seç." },

  { countryCode: "BRA", text: "Son 10 yılda Amazon orman yangınlarıyla gündeme gelen Güney Amerika ülkesini seç." },
  { countryCode: "AUS", text: "2020 büyük orman yangınlarını yaşayan Okyanusya ülkesini seç." },
  { countryCode: "FRA", text: "2018 sonrası Sarı Yelekliler protestolarının yaşandığı ülkeyi seç." },
  { countryCode: "GBR", text: "Brexit referandumuyla AB'den ayrılan ülkeyi seç." },
  { countryCode: "TUR", text: "2023 yılında Cumhuriyet’in 100. yılını kutlayan ülkeyi seç." },
  { countryCode: "USA", text: "2020 başkanlık seçimlerinde Biden’ın seçildiği ülkeyi seç." },
  { countryCode: "CAN", text: "Justin Trudeau’nun başbakan olduğu ülkeyi seç." },
  { countryCode: "ARG", text: "2022 Dünya Kupası'nı kazanan ülkeyi seç." },
  { countryCode: "CHL", text: "2020 yılında anayasa referandumu yapan Güney Amerika ülkesini seç." },
  { countryCode: "IRN", text: "2022 Mahsa Amini protestolarının yaşandığı Orta Doğu ülkesini seç." },

  { countryCode: "SYR", text: "Son 10 yılda iç savaş yaşayan Orta Doğu ülkesini seç." },
  { countryCode: "TUR", text: "2023 Kahramanmaraş depreminden etkilenen ülkeyi seç." },
  { countryCode: "GRC", text: "Ege’de Türkiye ile sık sık gerilim yaşayan ülkeyi seç." },
  { countryCode: "ITA", text: "COVID-19’un ilk büyük dalgasını yaşayan ülkeyi seç." },
  { countryCode: "ESP", text: "Real Madrid ve Barcelona'nın bulunduğu ülkeyi seç." },
  { countryCode: "KOR", text: "K-pop ve Squid Game ile pop kültürü etkisi yapan ülkeyi seç." },
  { countryCode: "SAU", text: "Son yıllarda e-spor etkinlikleri düzenleyen ülkeyi seç." },
  { countryCode: "EGY", text: "Piramidleriyle bilinen Afrika ülkesini seç." },
  { countryCode: "ZAF", text: "Cape Town ve kuraklık haberleriyle gündeme gelen ülkeyi seç." },
  { countryCode: "MEX", text: "Uyuşturucu kartelleriyle gündeme gelen ülkeyi seç." }
];

// =====================
//  SHUFFLE
// =====================
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =====================
//  CONTROLLER
// =====================
const controller = {
  async init() {
    map = L.map("map").setView([20, 10], 2);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 5,
      minZoom: 2
    }).addTo(map);

    const countries = await fetch("data/countries.geojson").then(r => r.json());

    geoLayer = L.geoJSON(countries, {
      style: defaultCountryStyle,
      onEachFeature: (feature, layer) => {
        const code = feature.properties["ISO3166-1-Alpha-3"];
        if (code) countryLayers[code] = layer;

        // SARI HOVER
        layer.on("mouseover", () => {
          if (!model.isActive || model.locked) return;

          layer.setStyle({
            color: "#333",
            weight: 1,
            fillColor: "#ffeb3b",
            fillOpacity: 0.9
          });
        });

        layer.on("mouseout", () => {
          if (!model.isActive || model.locked) return;
          layer.setStyle(defaultCountryStyle());
        });

        layer.on("click", () => controller.handleCountryClick(code));
      }
    }).addTo(map);

    view.displayMessage("Oyuna başlamak için Start'a bas!");
    view.updateStats();
  },

  startGame() {
    if (model.isActive) return;

    model.questions = shuffleArray(QUESTION_POOL);
    model.reset();

    this.clearCountryStyles();
    view.updateStats();

    view.displayMessage("Süre başladı! İlk soruyu cevapla!");
    this.showCurrentQuestion();

    model.timerId = setInterval(() => {
      model.timeLeft--;
      view.updateStats();

      if (model.timeLeft <= 0 || model.lives <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  showCurrentQuestion() {
    const q = model.currentQuestion;
    if (!q) return this.endGame();
    view.displayMessage(`Soru ${model.currentIndex + 1}: ${q.text}`);
  },

  handleCountryClick(clickedCode) {
    if (!model.isActive || model.locked) return;

    const q = model.currentQuestion;
    if (!q) return;

    const correctCode = q.countryCode;
    const clickedLayer = countryLayers[clickedCode];
    const correctLayer = countryLayers[correctCode];

    model.locked = true;
    this.clearCountryStyles();

    // yanlış seçimi kırmızı göster
    if (clickedLayer) {
      clickedLayer.setStyle({
        fillColor: "#d9534f",
        fillOpacity: 0.8
      });
    }

    if (clickedCode === correctCode) {
      // DOĞRU
      if (clickedLayer) {
        clickedLayer.setStyle({
          fillColor: "#5cb85c",
          fillOpacity: 0.8
        });
      }

      model.score += 10;
      view.updateStats();

      correctSound.currentTime = 0;
      correctSound.play();

      correctSound.onended = () => {
        correctSound.onended = null;
        this.goNextQuestion();
      };
    } else {
      // YANLIŞ
      model.lives--;
      view.updateStats();

      if (correctLayer) {
        correctLayer.setStyle({
          fillColor: "#5cb85c",
          fillOpacity: 0.8
        });
      }

      wrongSound.currentTime = 0;
      wrongSound.play();

      wrongSound.onended = () => {
        wrongSound.onended = null;
        if (model.lives <= 0) {
          this.endGame();
        } else {
          this.goNextQuestion();
        }
      };
    }
  },

  goNextQuestion() {
    model.currentIndex++;

    if (model.currentIndex >= model.questions.length) {
      this.endGame();
      return;
    }

    this.clearCountryStyles();
    model.locked = false;
    this.showCurrentQuestion();
  },

  clearCountryStyles() {
    if (geoLayer) geoLayer.resetStyle();
  },

  endGame() {
    model.isActive = false;
    model.locked = false;
    clearInterval(model.timerId);

    view.displayMessage(
      `Oyun bitti! Skorun: ${model.score} | Cevaplanan: ${model.currentIndex}/${model.questions.length}`
    );
  }
};

// =====================
//  BUTON
// =====================
document.getElementById("startBtn").addEventListener("click", () => {
  controller.startGame();
});

// =====================
//  INIT
// =====================
controller.init();
