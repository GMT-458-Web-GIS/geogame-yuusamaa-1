# 🌍 GeoGame — General Knowledge Map Quiz (Last 10 Years)

GeoGame is an interactive geography-based quiz game where players answer general knowledge questions related to world events from the last decade. Each question corresponds to a specific country, and the user must click the correct country on the map. The game uses **Leaflet.js** for interactive mapping and a **GeoJSON** dataset for global country boundaries.

The game includes:

- 30 random questions  
- A 1-minute timer  
- 3 lives  
- +10 points for every correct answer  
- -1 life for each incorrect answer  
- Sound effects for correct and incorrect responses  



## 🎯 Game Objective & Mechanism

The purpose of the game is to test players’ geographical knowledge by associating recent global events with the correct country on the world map.

### **How It Works**
1. When the user clicks **Start**, a random question from the question pool is shown.  
2. The user must select the correct country on the map.  
3. If the selected country matches the correct one:
   - Shown in **green**
   - Correct-answer sound plays  
   - Score increases by **+10**
4. If the answer is incorrect:
   - Selected country is colored **red**
   - Wrong-answer sound plays  
   - Player loses **1 life**
5. The next question automatically appears after each answer.
6. The game ends when:
   - Time runs out  
   - Player loses all 3 lives  
   - All 30 questions are answered  



## 📁 Project Structure

geogame-yuusamaa-1/
│
├── index.html
├── style.css
├── app.js
│
├── data/
│ └── countries.geojson
│
└── sounds/
├── correct.mp4
└── wrong.mp4




## 📄 File Descriptions

### **🔹 index.html**
- Loads the game structure  
- Includes UI layout (header, timer, score, map container)  
- Imports Leaflet.js  
- Connects CSS and JS files  

### **🔹 style.css**
- Responsible for all styling  
- Map, UI elements, colors, and responsive layout  

### **🔹 app.js**
Handles:

- Game logic (questions, score, timer, lives)  
- Map interactions  
- Click events on countries  
- Checking answers  
- Sound effect triggers  
- Game start / end flow  

### **🔹 data/countries.geojson**
Contains country Polygon/MultiPolygon geometries used by Leaflet to draw the world map.



## 🌐 GeoJSON Source

The country polygons were downloaded from DataHub.io.

**Download Link:**  
👉 https://r2.datahub.io/clvyjaryy0000la0cxieg4o8o/main/raw/data/countries.geojson

This file includes:

- Global country boundaries  
- Polygon/MultiPolygon shapes  
- Country names used for answer matching  



## 🔊 Sound Effects

| Event           | File                  |
|-----------------|-----------------------|
| Correct answer  | `sounds/correct.mp3`  |
| Wrong answer    | `sounds/wrong.mp3`    |



## 🚀 Features Summary

- Fully interactive world map  
- 30 random general knowledge questions  
- Timer & life system  
- Audio feedback  
- Clean and responsive UI  
- Works entirely offline  



