# 🔐 LinkVault – Offline Secure Link Manager

LinkVault is a **privacy-first, offline-capable link manager** that allows you to store, organize, and manage your links securely — all inside your browser.

🌐 Live Demo: https://urnjoya.github.io/linkvault/

---

## 🚀 Features

### 🔒 Security & Privacy

* Password-protected access
* Local storage (no server, no tracking)
* Works completely offline
* Data stays on your device

### 📁 Link Management

* Save and organize links easily
* Add title, image, category, and tags
* Detect duplicate links
* Mark favorites ⭐
* Pin important links 📌

### 🔍 Smart Organization

* Search links instantly
* Filter by categories & tags
* Separate tabs for:

  * Links
  * Instagram
  * Favorites
  * Categories
  * Tags
  * History

### 📊 Insights & Tracking

* Track total visits
* Last visited timestamps
* History graph (basic analytics)

### ⚙️ Utilities

* Import / Export data (backup & restore)
* Dead link detection
* Metadata refetch
* Reminder scheduler (planned/partial)

### 🎨 UI & UX

* Clean card-based interface
* Responsive design (mobile-first)
* Dark mode 🌙
* Toast notifications (no alert spam)

### 📱 PWA Support

* Installable as an app
* Works offline
* Service Worker enabled

---

## 🧠 How It Works

LinkVault uses **browser-based storage**:

* `localStorage` → user authentication & session
* IndexedDB (optional/expandable) → scalable storage
* No backend required

### Authentication Model

* `user` → stored account data
* `currentUser` → active session

---

## 🛠️ Tech Stack

* HTML5
* CSS3 (Responsive + Dark Mode)
* Vanilla JavaScript (No frameworks)
* PWA (Service Worker + Manifest)

---

## 📂 Project Structure

```
/linkvault
│
├── index.html
├── css/
│   ├── style.css
│   └── dark.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── links.js
│   ├── ui.js
│   ├── organize.js
│   ├── tools.js
│   ├── backup.js
│   ├── analytics.js
│   └── pwa.js
│
├── app/
│   ├── manifest.json
│   └── service-worker.js
│
└── assets/
```

---

## 🔧 Installation (Local Use)

1. Clone the repository:

```
git clone https://github.com/urnjoya/linkvault.git
```

2. Open `index.html` in your browser

3. (Optional) Use Live Server for better PWA behavior

---

## 📦 Deployment

You can deploy easily on:

* GitHub Pages ✅
* Netlify
* Vercel

---

## ⚠️ Limitations

* Single-user system (currently)
* Data stored locally (not synced across devices)
* No cloud backup (manual export required)

---

## 🔮 Future Plans

* Multi-user support
* Encrypted storage (AES-based)
* Cloud sync (optional)
* Chrome extension version
* AI-based link categorization
* Better analytics dashboard

---

## 🤝 Contributing

Contributions are welcome.

You can:

* Improve UI/UX
* Add new tools
* Optimize performance
* Fix bugs

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👤 Author

**Joya (urnjoya)**

* GitHub: https://github.com/urnjoya

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* Share it with others
* Suggest improvements

---

## 💡 Final Thought

> Your data should belong to you.
> LinkVault ensures your links stay private, secure, and always accessible — even offline.

---

