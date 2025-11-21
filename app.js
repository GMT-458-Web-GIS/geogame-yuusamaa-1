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
  locked: false, // ses çalarken tıklamayı kilitle

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
  // 1–10
  {
    countryCode: "TUR",
    text: "Alper Gezeravcı, hangi ülkenin uzaya gönderilen ilk astronotudur?"
  },
  {
    countryCode: "USA",
    text: "SpaceX'in Starship roketini geliştiren ülkeyi seç."
  },
  {
    countryCode: "ARE",
    text: "2021’de Hope Mars Misyonu’nu gerçekleştiren ülkeyi seç."
  },
  {
    countryCode: "CHN",
    text: "2020 sonrası Ay keşif programı (Chang’e) ile Ay’a araç indiren Asya ülkesini seç."
  },
  {
    countryCode: "IND",
    text: "2023’te Chandrayaan-3 ile Ay’ın güney kutbuna inen ülkeyi seç."
  },
  {
    countryCode: "GBR",
    text: "2021’de hayatını kaybeden Prens Philip, hangi ülkenin kraliyet ailesine mensuptur?"
  },
  {
    countryCode: "RUS",
    text: "2022’de Ukrayna’ya yönelik askeri operasyon başlatan ülkeyi seç."
  },
  {
    countryCode: "UKR",
    text: "2022’den bu yana işgale karşı savunma yapan ülkeyi seç."
  },
  {
    countryCode: "JPN",
    text: "2020 Tokyo Olimpiyatlarına (pandemiden dolayı 2021’de) ev sahipliği yapan ülkeyi seç."
  },
  {
    countryCode: "QAT",
    text: "2022 FIFA Dünya Kupası’na ev sahipliği yapan ülkeyi seç."
  },

  // 11–20
  {
    countryCode: "BRA",
    text: "Son 10 yılda Amazon orman yangınlarıyla sık sık gündeme gelen Güney Amerika ülkesini seç."
  },
  {
    countryCode: "AUS",
    text: "2020 büyük orman yangınlarında milyonlarca hayvan kaybı yaşayan Okyanusya ülkesini seç."
  },
  {
    countryCode: "FRA",
    text: "2018 sonrası Sarı Yelekliler protestolarının yaşandığı Avrupa ülkesini seç."
  },
  {
    countryCode: "GBR",
    text: "Brexit referandumuyla AB'den ayrılma sürecini başlatan ülkeyi seç."
  },
  {
    countryCode: "TUR",
    text: "2023 yılında Cumhuriyet’in 100. yılını kutlayan ülkeyi seç."
  },
  {
    countryCode: "USA",
    text: "2020 başkanlık seçimlerinde Joe Biden’ın başkan seçildiği ülkeyi seç."
  },
  {
    countryCode: "CAN",
    text: "Justin Trudeau’nun başbakan olduğu Kuzey Amerika ülkesini seç."
  },
  {
    countryCode: "ARG",
    text: "2022 Dünya Kupası'nı kazanan ülkeyi seç."
  },
  {
    countryCode: "CHL",
    text: "2020 yılında büyük anayasa referandumu yapan Güney Amerika ülkesini seç."
  },
  {
    countryCode: "IRN",
    text: "2022 Mahsa Amini protestolarının yaşandığı Orta Doğu ülkesini seç."
  },

  // 21–30
  {
    countryCode: "SYR",
    text: "Son 10 yılda ciddi iç savaş yaşayan Orta Doğu ülkesini seç."
  },
  {
    countryCode: "TUR",
    text: "2023 Kahramanmaraş depreminden etkilenen ülkeyi seç."
  },
  {
    countryCode: "GRC",
    text: "Ege Denizi'nde Türkiye ile sık sık diplomatik gerilim yaşayan komşu ülkeyi seç."
  },
  {
    countryCode: "ITA",
    text: "COVID-19 salgının ilk büyük dalgalarından birini yaşayan Avrupa ülkesini seç."
  },
  {
    countryCode: "ESP",
    text: "Barcelona ve Real Madrid gibi futbol devlerinin bulunduğu ülkeyi seç."
  },
  {
    countryCode: "KOR",
    text: "K-pop, BTS ve Squid Game ile pop kültür etkisi yapan ülkeyi seç."
  },
  {
    countryCode: "SAU",
    text: "Son yıllarda büyük e-spor ve teknoloji etkinlikleri düzenleyen Orta Doğu ülkesini seç."
  },
  {
    countryCode: "EGY",
    text: "Nil Nehri ve piramitleriyle bilinen, Arap Baharı sonrası geçiş süreci yaşayan ülkeyi seç."
  },
  {
    countryCode: "ZAF",
    text: "Cape Town ve Johannesburg şehirlerini içeren, kuraklıkla mücadele eden Afrika ülkesini seç."
  },
  {
    countryCode: "MEX",
    text: "Uyuşturucu kartelleriyle ilgili güvenlik sorunlarıyla sık gündeme gelen Kuzey Amerika ülkesini seç."
  }
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
//  ANİMASYON FONKSİYONLARI
// =====================
function animateCorrect() {
  const mapDiv = document.getElementById("map");
  mapDiv.classList.add("zoomPulse");
  setTimeout(() => mapDiv.classList.remove("zoomPulse"), 500);
}

function animateWrong() {
  const mapDiv = document.getElementById("map");
  mapDiv.classList.add("shake");
  setTimeout(() => mapDiv.classList.remove("shake"), 400);
}

// =====================
//  CONTROLLER
// =====================
const controller = {
  async init() {
    // Harita
    map = L.map("map").setView([20, 10], 2);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 5,
      minZoom: 2
    }).addTo(map);

    // GeoJSON yükle
    const countries = await fetch("data/countries.geojson").then(r => r.json());

    geoLayer = L.geoJSON(countries, {
      style: defaultCountryStyle,
      onEachFeature: (feature, layer) => {
        // DataHub GeoJSON için ülke kodu:
        const code = feature.properties["ISO3166-1-Alpha-3"];

        if (code) {
          countryLayers[code] = layer;
        }

        // HOVER → SARI
        layer.on("mouseover", () => {
          if (!model.isActive || model.locked) return;
          layer.setStyle({
            color: "#333333",
            weight: 1,
            fillColor: "#ffeb3b",
            fillOpacity: 0.9
          });
        });

        // HOVER ÇIKIŞI → DEFAULT
        layer.on("mouseout", () => {
          if (!model.isActive || model.locked) return;
          layer.setStyle(defaultCountryStyle());
        });

        // TIKLAMA
        layer.on("click", () => {
          controller.handleCountryClick(code);
        });
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

    view.displayMessage("Süre başladı! Soruları dikkatle oku.");
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
    if (!q) {
      this.endGame();
      return;
    }
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

    // Önce tüm renkleri sıfırla
    this.clearCountryStyles();

    // Seçilen ülkeyi kırmızı göster
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

      animateCorrect(); // doğru cevap animasyonu

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

      animateWrong(); // yanlış cevap animasyonu

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
    if (!model.isActive) {
      model.locked = false;
      return;
    }

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
    if (geoLayer) {
      geoLayer.resetStyle(); // tüm ülkeleri defaultCountryStyle'a döndür
    }
  },

  endGame() {
    if (!model.isActive) return;

    model.isActive = false;
    model.locked = false;
    clearInterval(model.timerId);

    view.displayMessage(
      `Oyun bitti! Skorun: ${model.score} | Cevaplanan soru: ${model.currentIndex} / ${model.questions.length}`
    );
  }
};

// =====================
//  BUTON & INIT
// =====================
document.getElementById("startBtn").addEventListener("click", () => {
  controller.startGame();
});

controller.init();
