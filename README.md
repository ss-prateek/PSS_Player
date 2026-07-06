# PSS Player 🎵

A premium, responsive, dark-themed music player featuring **liquid glassmorphism styling**, powered by the **YouTube IFrame API**, and connected to a serverless **Google Sheets database** for user login tracking.

---

## 🌌 Live Demo & Visuals

> [!TIP]
> You can host this repository for free on **GitHub Pages** (Settings ➡️ Pages ➡️ Deploy from `main` branch) to get a live, shareable link instantly!

---

## 🚀 Key Features

* **🎨 Liquid Glassmorphism UI:** Features floating monochrome ambient background spheres drifting slowly behind semi-transparent, frosted-glass panels (`backdrop-filter: blur(12px)`).
* **🔒 Secure Caching Logins:** Full-screen greeting gateway that validates inputs and caches sessions locally using `localStorage` so users remain logged in.
* **📊 Serverless Sheets Logging:** Connects to a private Google Sheet using Google Apps Script. Logs user logins with names, emails, and server-side timestamps.
* **🎵 Advanced Playback Utilities:** Includes **Shuffle mode** (randomizes skip index), **Repeat mode** (replays active track on end), and a **Surprise Me** button (picks a random song from the database).
* **✨ Glowing Audio Visualizer:** 15 glowing, monochrome equalizer bars that bounce organically when music is active and dim to a flat baseline when paused.
* **📱 Adaptive Breakpoints:**
  * **Desktop:** Three-panel sidebar layout.
  * **Tablets:** Slide-out library drawer with a custom circular liquid-glass close button.
  * **Mobile:** Vertical grid stacking with nowrap pills to fit narrow screens cleanly.

---

## 🛠️ Technology Stack

* **Frontend Structure:** HTML5 (Semantic elements)
* **Design & Styling:** Vanilla CSS3 (Custom keyframes, resets, and glassmorphic designs)
* **Logical Engine:** Vanilla JavaScript ES6 (State management, event bubbles, and array mapping)
* **Media Streaming:** YouTube IFrame Player API (Direct stream binding, controls bypass, and active time-scrubbing queries)
* **Database Pipeline:** Google Apps Script Web App (Redirect-safe GET request pipeline)

---

## ⚙️ Quick Installation & Setup

### 1. Clone the project locally
```bash
git clone https://github.com/ss-prateek/PSS_Player.git
cd PSS_Player
```

### 2. Connect your Google Sheet (Database)
To track user logins in your own Google Sheet:
1. Create a blank spreadsheet on [Google Sheets](https://sheets.google.com).
2. Go to **Extensions ➡️ Apps Script**.
3. Replace the template code with this script:
   ```javascript
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var name = e.parameter.name;
     var email = e.parameter.email;
     sheet.appendRow([new Date(), name, email]);
     return ContentService.createTextOutput("Success")
                          .setMimeType(ContentService.MimeType.TEXT);
   }
   ```
4. Save and click **Deploy ➡️ New deployment**.
5. Select **Web app** as the type, set *Execute as* to **Me**, and *Who has access* to **Anyone**.
6. Deploy, authorize permissions, and copy the **Web App URL**.
7. Open **`music_card.js`** in your project, and paste your URL on line 72:
   ```javascript
   const GOOGLE_SHEET_API_URL = "YOUR_DEPLOYED_URL_HERE";
   ```

### 3. Open the player
Launch `index.html` in your browser (or use VS Code's *Live Server* extension) and enjoy your player!

---

## 📄 Documentation Manual
For a deep-dive, line-by-line developer manual explaining the CSS visual physics, sequence diagrams, and detailed logic wrappers, refer to the compiled documentation folder:
* 📄 **Markdown Document:** [PSS_Player_Manual.md](./PSS_Player_Manual.md)
* 📂 **Print-Ready PDF:** [PSS_Player_Manual.pdf](./PSS_Player_Manual.pdf)

---

## ✍️ Credits
* **Developer:** Vidit Singh Sisodia
* **LinkedIn:** [Vidit Singh Sisodia](https://www.linkedin.com/in/viditsinghsisodia/)
* **GitHub Profile:** [@ss-prateek](https://github.com/ss-prateek)
