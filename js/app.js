/* =========================
   1. APP START / INIT
========================= */
// APP START
document.addEventListener("DOMContentLoaded", () => {
    startApp();
});
// START APP
function startApp() {
    let user = localStorage.getItem("user");

    if (!user) {
        showPage("loginPage");
    } else {
        showPage("lockScreen");
    }
    // Default tab
    let firstTabBtn = document.querySelector(".tabs button");
    showTab("linksTab", firstTabBtn);
    // showTab("linksTab");

    loadTheme();
    handleSharedData();
    startReminderScheduler();
    startDeadLinkScheduler();
    loadProfile();
}

/* =========================
   2. DATABASE (IndexedDB)
========================= */
let db;
// OPEN DATABASE
function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("LinkVaultDB", 1);

        request.onupgradeneeded = function (e) {
            db = e.target.result;

            // LINKS TABLE
            if (!db.objectStoreNames.contains("links")) {
                let linksStore = db.createObjectStore("links", {
                    keyPath: "id",
                    autoIncrement: true
                });
                linksStore.createIndex("url", "url", {
                    unique: false
                });
                linksStore.createIndex("category", "category", {
                    unique: false
                });
                linksStore.createIndex("favorite", "favorite", {
                    unique: false
                });
                linksStore.createIndex("pinned", "pinned", {
                    unique: false
                });
            }

            // HISTORY TABLE
            if (!db.objectStoreNames.contains("history")) {
                let historyStore = db.createObjectStore("history", {
                    keyPath: "id",
                    autoIncrement: true
                });
                historyStore.createIndex("linkId", "linkId", {
                    unique: false
                });
            }

            // SETTINGS TABLE
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", {
                    keyPath: "id"
                });
            }
            // USER TABLE
            if (!db.objectStoreNames.contains("user")) {
                db.createObjectStore("user", {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            resolve(db);
        };

        request.onerror = function () {
            reject("Database error");
        };
    });
}
// ADD LINK
function dbAddLink(linkData) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("links", "readwrite");
        let store = tx.objectStore("links");
        let request = store.add(linkData);

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

// GET ALL LINKS
function dbGetAllLinks() {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("links", "readonly");
        let store = tx.objectStore("links");
        let request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
    });
}

// UPDATE LINK
function dbUpdateLink(linkData) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("links", "readwrite");
        let store = tx.objectStore("links");
        let request = store.put(linkData);

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

// DELETE LINK
function dbDeleteLink(id) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("links", "readwrite");
        let store = tx.objectStore("links");
        let request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

// ADD HISTORY
function dbAddHistory(historyData) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("history", "readwrite");
        let store = tx.objectStore("history");
        let request = store.add(historyData);

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

// GET HISTORY
function dbGetHistory() {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("history", "readonly");
        let store = tx.objectStore("history");
        let request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
    });
}

// SAVE SETTINGS
function dbSaveSettings(settings) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("settings", "readwrite");
        let store = tx.objectStore("settings");
        let request = store.put(settings);

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

// GET SETTINGS
function dbGetSettings() {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("settings", "readonly");
        let store = tx.objectStore("settings");
        let request = store.get(1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
    });
}

function dbSaveUser(user) {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("user", "readwrite");
        let store = tx.objectStore("user");
        let request = store.put({
            id: 1,
            ...user
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject();
    });
}

function dbGetUser() {
    return new Promise((resolve, reject) => {
        let tx = db.transaction("user", "readonly");
        let store = tx.objectStore("user");
        let request = store.get(1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
    });
}

// INITIALIZE DB WHEN APP STARTS
openDB();
/* =========================
   3. AUTH / USER SYSTEM
========================= */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}
// CREATE ACCOUNT
function createAccount() {
    let name = document.getElementById("name").value;
    let gender = document.getElementById("gender").value;
    let password = document.getElementById("password").value;
    let question = document.getElementById("securityQuestion").value;
    let answer = document.getElementById("securityAnswer").value;

    if (!name || !password || !answer) {
        showNotification("error", "Fill all fields");
        return;
    }

    let user = {
        name: name,
        gender: gender,
        password: password,
        securityQuestion: question,
        securityAnswer: answer,
        createdDate: new Date().toISOString()
    };

    localStorage.setItem("user", JSON.stringify(user));

    showNotification("success", "Account Created! Please Login.");
    showPage("lockScreen");
}

// VERIFY PASSWORD
function verifyPassword(inputPassword) {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) return false;

    return inputPassword === user.password;
}

// CHANGE PASSWORD USING SECURITY QUESTION
function resetPassword() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    let answer = prompt(user.securityQuestion);

    if (answer === user.securityAnswer) {
        let newPass = prompt("Enter New Password");
        user.password = newPass;
        localStorage.setItem("user", JSON.stringify(user));
        showNotification("success", "Password Updated");
    } else {
        showNotification("error", "Wrong Answer");
    }
}

// LOAD PROFILE DATA
function loadProfile() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    let profileDiv = document.getElementById("profileData");

    profileDiv.innerHTML = `
    <div class="profileCard">

        <div class="profileHeader">
            <div class="profileAvatar">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <div class="profileName">${user.name}</div>
                <div class="profileMeta">${user.gender}</div>
            </div>
        </div>

        <div class="profileBody">
            <div class="profileItem">
                <span class="label">Name</span>
                <span class="value">${user.name}</span>
            </div>

            <div class="profileItem">
                <span class="label">Gender</span>
                <span class="value">${user.gender}</span>
            </div>

            <div class="profileItem">
                <span class="label">Created</span>
                <span class="value">${formatDate(user.createdDate)}</span>
            </div>
        </div>

        <div class="profileActions">
            <button class="btn btn-warning" onclick="resetPassword()">Reset Password</button>
        </div>

    </div>
`;
}
// LOGOUT
async function logout() {
    let pass = prompt("Enter password to logout");
    if (!pass) return;

    let user = JSON.parse(localStorage.getItem("user"));

    if (pass === user.password) {
        localStorage.removeItem("currentUser");
        showNotification("info", "Logged out");
        showPage("lockScreen");
    } else {
        showNotification("error", "Wrong password");
    }
}
// HASH PASSWORD
async function hashPassword(password) {
    let encoder = new TextEncoder();
    let data = encoder.encode(password);
    let hash = await crypto.subtle.digest("SHA-256", data);
    return bufferToHex(hash);
}
// BUFFER → HEX
function bufferToHex(buffer) {
    let bytes = new Uint8Array(buffer);
    let hex = "";

    bytes.forEach(b => {
        hex += b.toString(16).padStart(2, "0");
    });

    return hex;
}

// SAVE PASSWORD
async function savePassword(password) {
    let hash = await hashPassword(password);
    let user = await dbGetUser();

    user.password = hash;
    await dbSaveUser(user);
}

// VERIFY PASSWORD
async function verifyPasswordHash(password) {
    let user = await dbGetUser();
    if (!user || !user.password) return false;

    let hash = await hashPassword(password);
    return hash === user.password;
}

// CHANGE PASSWORD
async function changePassword(oldPass, newPass) {
    let valid = await verifyPassword(oldPass);

    if (!valid) {
        showNotification("error", "Wrong old password");
        return false;
    }

    await savePassword(newPass);
    showNotification("success", "Password changed");
    return true;
}
// EXPORT USER DATA (Used in export.js later)
function getUserData() {
    return JSON.parse(localStorage.getItem("user"));
}

// IMPORT USER DATA (Recovery)
function importUserData(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
}
/* =========================
   4. UI NAVIGATION (Pages / Tabs / Popup)
========================= */
// PAGE SWITCHING
function showPage(pageId) {
    let pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("activePage"));
    document.getElementById(pageId).classList.add("activePage");
}

// TAB SWITCHING
function showTab(tabId, el) {
    let tabs = document.querySelectorAll(".tabPage");
    tabs.forEach(tab => tab.classList.remove("activeTab"));

    document.getElementById(tabId).classList.add("activeTab");

    // Active tab button
    let btns = document.querySelectorAll(".tabs button");
    btns.forEach(btn => btn.classList.remove("activeTabBtn"));

    if (el) {
        el.classList.add("activeTabBtn");
    }
}

// LOGIN NAVIGATION
function showCreateAccount() {
    showPage("createAccountPage");
}

function showRecovery() {
    showPage("importTab");
    showPage("dashboardPage");
    const nav = document.querySelector('nav');
    // nav.style.display = "none";
}

function goToLogin() {
    showPage("loginPage");
}

// LOCK SYSTEM
function lockApp() {
    // localStorage.removeItem("currentUser"); // ✅ important
    if (!getCurrentUser()) {
        showNotification("error", "Login Required!");
        return;
    } else {
        showPage("lockScreen");
    }
}

function unlockApp() {
    let inputPass = document.getElementById("lockPassword").value;
    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    if (inputPass === user.password) {

        // ✅ SET current user
        localStorage.setItem("currentUser", JSON.stringify(user));

        showPage("dashboardPage");
        loadAllCards();
    } else {
        showNotification("error", "Wrong Password!");
    }
}

// POPUP CONTROL
function showAddPopup() {
    if (!getCurrentUser()) {
        showNotification("error", "Login Required!");
        return;
    } else {
        document.getElementById("addPopup").style.display = "flex";
    }
}

function closeAddPopup() {
    document.getElementById("addPopup").style.display = "none";
}
/* =========================
   5. THEME / SETTINGS / UPDATE / LOGOUT
========================= */
// SET THEME
function setTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        // document.body.classList.toggle("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        // document.body.classList.toggle("dark");
        localStorage.setItem("theme", "light");
    }
}

// TOGGLE THEME
function toggleTheme() {
    let current = localStorage.getItem("theme");

    if (current === "dark") {
        setTheme("light");
    } else {
        setTheme("dark");
    }
}

// LOAD THEME ON START
function loadTheme() {
    let theme = localStorage.getItem("theme");

    if (!theme) theme = "light";

    setTheme(theme);
}
// DARK MODE TOGGLE
function toggleDarkMode() {
    document.body.classList.toggle("darkMode");

    let dark = document.body.classList.contains("darkMode");
    localStorage.setItem("darkMode", dark);
}

// LOAD DARK MODE
(function () {
    let dark = localStorage.getItem("darkMode");
    if (dark === "true") {
        document.body.classList.add("darkMode");
    }
})();
// update
async function checkForUpdates() {
    try {
        let res = await fetch("/linkvault/app/version.json?t=" + Date.now());
        let data = await res.json();

        let currentVersion = localStorage.getItem("appVersion");

        if (currentVersion === data.version) {
            showNotification("info", "No updates available");
        } else {
            showNotification("success", "New update found. Updating...");

            localStorage.setItem("appVersion", data.version);

            // Clear cache
            if ('caches' in window) {
                let keys = await caches.keys();
                for (let key of keys) {
                    await caches.delete(key);
                }
            }

            // Reload app
            setTimeout(() => {
                location.reload(true);
            }, 1500);
        }

    } catch (e) {
        showNotification("error", "Update check failed");
    }
}

function clearAllData() {
    let confirmDelete = confirm("Delete all data?");
    if (!confirmDelete) return;

    localStorage.clear();

    if ('indexedDB' in window) {
        indexedDB.deleteDatabase("LinkVaultDB");
    }

    showNotification("warning", "All data cleared");

    setTimeout(() => {
        location.reload();
    }, 1000);
}
/* =========================
   6. LOADER / NOTIFICATIONS / OFFLINE
========================= */
function showLoader(text = "Processing...") {
    document.getElementById("loaderOverlay").classList.remove("hidden");
    document.getElementById("loaderText").innerText = text;
    updateProgress(10);
}

function updateProgress(percent) {
    document.getElementById("progressFill").style.width = percent + "%";
}

function hideLoader() {
    updateProgress(100);
    setTimeout(() => {
        document.getElementById("loaderOverlay").classList.add("hidden");
        updateProgress(0);
    }, 400);
}

function showNotification(type, message) {
    let container = document.getElementById("notificationContainer");

    let notif = document.createElement("div");
    notif.className = "notification " + type;
    notif.innerText = message;

    container.appendChild(notif);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notif.classList.add("hide");
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}
window.addEventListener("offline", () => {
    showNotification("warning", "You are offline");
});

window.addEventListener("online", () => {
    showNotification("success", "Back online");
});
if (!navigator.onLine) {
    showNotification("warning", "No internet connection");
}
/* =========================
   7. LINK CRUD (Add / Edit / Delete / Metadata)
========================= */
// ADD LINK FROM POPUP
async function addLink() {
    showLoader("Checking URL...");
    let url = document.getElementById("linkURL").value;
    let title = document.getElementById("linkTitle").value;
    let image = document.getElementById("linkImage").value;
    let category = document.getElementById("linkCategory").value;
    let tags = document.getElementById("linkTags").value;

    if (!url) {
        showNotification("error", "URL is required");
        return;
    }
    updateProgress(20);
    // Duplicate check
    let duplicate = await checkDuplicate(url);
    if (duplicate) {
        if (!confirm("Duplicate URL found. Save anyway?")) {
            hideLoader();
            return;
        }
    }
    updateProgress(40);
    showLoader("Fetching metadata...");
    // Fetch metadata if missing
    let meta = await fetchMetadata(url);
    updateProgress(60);
    if (!title) title = meta.title;
    if (!image) image = meta.image;

    // Default image
    if (!image) image = "https://placehold.co/300x200/0330fc/ffffff?text=XXX";

    // Instagram detect
    let type = "normal";
    if (url.includes("instagram.com/reel")) {
        type = "instagram";
    }

    let linkData = {
        title: title || "No Title",
        url: url,
        image: image,
        category: category || "General",
        tags: tags ? tags.split(",") : [],
        favorite: false,
        pinned: false,
        totalVisit: 0,
        lastVisit: "",
        createdDate: new Date().toISOString(),
        reminderDate: "",
        notes: "",
        isDead: false,
        type: type,
        lastChecked: ""
    };
    updateProgress(80);
    showLoader("Saving link...");
    await dbAddLink(linkData);
    updateProgress(90);
    closeAddPopup();
    loadAllCards();
    hideLoader();
    showNotification("success", "Link added successfully");
}
// DELETE LINK
async function deleteLink(id) {
    if (!confirm("Delete this link?")) return;

    await dbDeleteLink(id);
    loadAllCards();
}

// EDIT LINK
async function editLink(id) {
    let pass = prompt("Enter password to edit");
    if (!verifyPassword(pass)) {
        showNotification("error", "Wrong password");
        return;
    }

    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === id);

    if (!link) return;

    let newTitle = prompt("Edit Title", link.title);
    let newCategory = prompt("Edit Category", link.category);
    let newTags = prompt("Edit Tags (comma)", link.tags.join(","));

    link.title = newTitle;
    link.category = newCategory;
    link.tags = newTags.split(",");

    await dbUpdateLink(link);
    loadAllCards();
}

// FETCH METADATA (TITLE + IMAGE)
async function fetchMetadata(url) {
    try {
        let response = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url));
        let text = await response.text();

        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");

        let title = doc.querySelector("title")?.innerText;

        let image = doc.querySelector("meta[property='og:image']")?.content;

        return {
            title: title,
            image: image
        };
    } catch (e) {
        return {
            title: "",
            image: ""
        };
    }
}

// REFRESH METADATA
async function refetchMetadata(id) {
    let pass = prompt("Enter password to refetch");
    if (!verifyPassword(pass)) {
        showNotification("error", "Wrong password");
        return;
    }
    showLoader("Rechecking URL...");
    updateProgress(5);
    let links = await dbGetAllLinks();
    updateProgress(15);
    let link = links.find(l => l.id === id);
    if (!link) {
        hideLoader();
        return;
    }
    showLoader("Fetching metadata...");
    let meta = await fetchMetadata(link.url);
    updateProgress(40);
    if (meta.title) link.title = meta.title;
    if (meta.image) link.image = meta.image;

    await dbUpdateLink(link);
    updateProgress(60);
    loadAllCards();
    updateProgress(75);
    await fetchData();
    updateProgress(90);
    saveData();
    updateProgress(100);
    hideLoader();
    showNotification("success", "Metadata updated");
}
async function fetchData() {
    showLoader("Syncing data...");

    let links = await dbGetAllLinks();

    // Save cache copy
    localStorage.setItem("linksCache", JSON.stringify(links));

    return links;
}
async function saveData() {
    let links = await dbGetAllLinks();
    localStorage.setItem("linksBackup", JSON.stringify(links));
}
// LOAD ALL CARDS
async function loadAllCards() {
    let links = await dbGetAllLinks();

    renderCards(links);
}
/* =========================
   8. CARDS RENDER / OPEN LINK
========================= */
// RENDER ALL CARDS
function renderCards(links) {
    let container = document.getElementById("cardsContainer");
    let instaContainer = document.getElementById("instagramContainer");
    let favContainer = document.getElementById("favoritesContainer");

    container.innerHTML = "";
    instaContainer.innerHTML = "";
    favContainer.innerHTML = "";

    links.forEach(link => {
        let card = createCard(link);

        // Instagram section
        if (link.type === "instagram") {
            instaContainer.appendChild(card);
        } else {
            container.appendChild(card);
        }

        // Favorites section
        if (link.favorite) {
            let favCard = createCard(link);
            favContainer.appendChild(favCard);
        }
    });
}

// CREATE CARD
function createCard(link) {
    let card = document.createElement("div");
    card.className = "card";

    card.setAttribute("draggable", "true");
    card.ondragstart = (e) => dragStart(e, link.id);
    card.ondragover = dragOver;
    card.ondrop = (e) => dropCard(e, link.id);
    // let card = document.createElement("div");
    card.className = "card";

    if (link.isDead) {
        card.style.border = "2px solid red";
        console.warn("Dead link detected: " + link.url);
        showNotification("error", "Dead link: " + link.title);
    }

    if (link.pinned) {
        card.style.border = "2px solid gold";
    }

    card.innerHTML = `
        <img src="${link.image}" onerror="this.src='https://placehold.co/300x200/0f172a/ffffff?text=No+Preview'">

        <div class="cardTitle">${link.title}</div>
        <div class="cardURL">${link.url}</div>

        <div class="cardInfo">
            <span>Visits: ${link.totalVisit}</span>
            <span>${formatDate(link.lastVisit)}</span>
        </div>

        <div class="cardButtons">
            <button class="btn btn-primary" onclick="openLink(${link.id})">Open</button>
            <button class="btn btn-ghost" onclick="toggleFavorite(${link.id})">Fav</button>
            <button class="btn btn-ghost" onclick="togglePin(${link.id})">Pin</button>
            <button class="btn btn-secondary" onclick="editLink(${link.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteLink(${link.id})">Del</button>
        </div>

        <div class="cardButtons">
            <button class="btn btn-warning" onclick="refetchMetadata(${link.id})">Refetch</button>
            <button class="btn btn-secondary" onclick="showMoreInfo(${link.id})">Info</button>
        </div>
    `;

    return card;
}

// OPEN LINK
async function openLink(id) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === id);

    if (!link) return;

    link.totalVisit++;
    link.lastVisit = new Date().toISOString();

    await dbUpdateLink(link);

    await dbAddHistory({
        linkId: id,
        visitDate: new Date().toISOString()
    });

    loadAllCards();

    window.open(link.url, "_blank");
}

// MORE INFO
async function showMoreInfo(id) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === id);

    if (!link) return;

    alert(
        "Title: " + link.title +
        "\nURL: " + link.url +
        "\nCategory: " + link.category +
        "\nTags: " + link.tags.join(",") +
        "\nCreated: " + formatDate(link.createdDate) +
        "\nLast Visit: " + formatDate(link.lastVisit) +
        "\nReminder: " + formatDate(link.reminderDate) +
        "\nDead Link: " + link.isDead
    );
}

// FORMAT DATE
function formatDate(dateString) {
    if (!dateString) return "-";
    let d = new Date(dateString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
/* =========================
   9. SEARCH / FILTER / SORT
========================= */
// SEARCH LINKS
async function searchLinks() {
    if (!getCurrentUser()) {
        // showNotification("error", "Login Required!");
        document.getElementById("searchBar").disabled = true;
        return;
    } else {
        let query = document.getElementById("searchBar").value.toLowerCase();

        let links = await dbGetAllLinks();

        if (!query) {
            renderCards(links);
            return;
        }

        let filtered = links.filter(link => {
            let title = link.title.toLowerCase();
            let url = link.url.toLowerCase();
            let category = link.category.toLowerCase();
            let tags = link.tags.join(",").toLowerCase();

            return (
                title.includes(query) ||
                url.includes(query) ||
                category.includes(query) ||
                tags.includes(query)
            );
        });

        renderCards(filtered);
    }
}

// SEARCH BY CATEGORY
async function searchByCategory(categoryName) {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => link.category === categoryName);

    renderCards(filtered);
}

// SEARCH BY TAG
async function searchByTag(tagName) {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => link.tags.includes(tagName));

    renderCards(filtered);
}

// SHOW FAVORITES ONLY
async function showFavorites() {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => link.favorite === true);

    renderCards(filtered);
}

// SHOW PINNED ONLY
async function showPinned() {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => link.pinned === true);

    renderCards(filtered);
}

// CLEAR SEARCH
async function clearSearch() {
    document.getElementById("searchBar").value = "";
    let links = await dbGetAllLinks();
    renderCards(links);
}

let currentSortMode = "recent";

// MAIN SORT FUNCTION
async function sortLinks(mode) {
    currentSortMode = mode;

    let links = await dbGetAllLinks();

    switch (mode) {
        case "recent":
            links.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
            break;

        case "oldest":
            links.sort((a, b) => new Date(a.lastVisit) - new Date(b.lastVisit));
            break;

        case "mostVisited":
            links.sort((a, b) => b.totalVisit - a.totalVisit);
            break;

        case "leastVisited":
            links.sort((a, b) => a.totalVisit - b.totalVisit);
            break;

        case "az":
            links.sort((a, b) => a.title.localeCompare(b.title));
            break;

        case "za":
            links.sort((a, b) => b.title.localeCompare(a.title));
            break;

        case "createdNew":
            links.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            break;

        case "createdOld":
            links.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
            break;

        case "pinned":
            links.sort((a, b) => b.pinned - a.pinned);
            break;

        case "favorite":
            links.sort((a, b) => b.favorite - a.favorite);
            break;

        case "reminder":
            links.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
            break;

        case "dead":
            links.sort((a, b) => b.isDead - a.isDead);
            break;
    }

    renderCards(links);
}

// AUTO SORT AFTER OPEN OR ADD
async function autoSort() {
    sortLinks(currentSortMode);
}

// SORT MENU (Basic Prompt Menu)
function sortMenu() {
    let option = prompt(
        "Sort Options:\n" +
        "1 Recent Open\n" +
        "2 Oldest Open\n" +
        "3 Most Visited\n" +
        "4 Least Visited\n" +
        "5 A-Z\n" +
        "6 Z-A\n" +
        "7 New Created\n" +
        "8 Old Created\n" +
        "9 Pinned First\n" +
        "10 Favorites First\n" +
        "11 Reminder\n" +
        "12 Dead Links"
    );

    switch (option) {
        case "1":
            sortLinks("recent");
            break;
        case "2":
            sortLinks("oldest");
            break;
        case "3":
            sortLinks("mostVisited");
            break;
        case "4":
            sortLinks("leastVisited");
            break;
        case "5":
            sortLinks("az");
            break;
        case "6":
            sortLinks("za");
            break;
        case "7":
            sortLinks("createdNew");
            break;
        case "8":
            sortLinks("createdOld");
            break;
        case "9":
            sortLinks("pinned");
            break;
        case "10":
            sortLinks("favorite");
            break;
        case "11":
            sortLinks("reminder");
            break;
        case "12":
            sortLinks("dead");
            break;
    }
}
// SORT MENU (placeholder)
function sortMenu() {
    showNotification("info", "Sort options coming soon");
}
/* =========================
   10. FAVORITE / PIN
========================= */
// TOGGLE FAVORITE
async function toggleFavorite(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.favorite = !link.favorite;

    await dbUpdateLink(link);
    autoSort();
}

// SHOW FAVORITES ONLY
async function showOnlyFavorites() {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => link.favorite === true);

    renderCards(filtered);
}
// REMOVE FROM FAVORITES
async function removeFavorite(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.favorite = false;

    await dbUpdateLink(link);
    loadAllCards();
}
// GET FAVORITE LINKS
async function getFavoriteLinks() {
    let links = await dbGetAllLinks();
    return links.filter(link => link.favorite === true);
}

// PIN / UNPIN LINK
async function togglePin(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.pinned = !link.pinned;

    await dbUpdateLink(link);
    autoSort();
}

// GET PINNED LINKS
async function getPinnedLinks() {
    let links = await dbGetAllLinks();
    return links.filter(link => link.pinned === true);
}

// SHOW ONLY PINNED
async function showOnlyPinned() {
    let links = await dbGetAllLinks();
    let filtered = links.filter(link => link.pinned === true);
    renderCards(filtered);
}

// UNPIN ALL
async function unpinAllLinks() {
    let links = await dbGetAllLinks();

    for (let link of links) {
        if (link.pinned) {
            link.pinned = false;
            await dbUpdateLink(link);
        }
    }

    loadAllCards();
}
/* =========================
   11. CATEGORY / TAGS
========================= */
// GET ALL CATEGORIES
async function getAllCategories() {
    let links = await dbGetAllLinks();
    let categorySet = new Set();

    links.forEach(link => {
        if (link.category && link.category !== "") {
            categorySet.add(link.category.trim());
        }
    });

    return Array.from(categorySet);
}

// SHOW ALL CATEGORIES
async function showAllCategories() {
    let categories = await getAllCategories();
    // let container = document.getElementById("categoriesTab");
    let container = document.getElementById("categoriesContainer");

    if (!container) return;

    container.innerHTML = "";

    categories.forEach(cat => {
        let btn = document.createElement("button");
        btn.innerText = cat;
        btn.onclick = () => searchByCategory(cat);
        container.appendChild(btn);
    });
}

// ADD CATEGORY TO LINK
async function setCategoryToLink(linkId, categoryName) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.category = categoryName;

    await dbUpdateLink(link);
    loadAllCards();
}

// RENAME CATEGORY
async function renameCategory(oldName, newName) {
    let links = await dbGetAllLinks();

    for (let link of links) {
        if (link.category === oldName) {
            link.category = newName;
            await dbUpdateLink(link);
        }
    }

    loadAllCards();
}

// DELETE CATEGORY
async function deleteCategory(categoryName) {
    let links = await dbGetAllLinks();

    for (let link of links) {
        if (link.category === categoryName) {
            link.category = "";
            await dbUpdateLink(link);
        }
    }

    loadAllCards();
}
// GET ALL TAGS
async function getAllTags() {
    let links = await dbGetAllLinks();
    let tagsSet = new Set();

    links.forEach(link => {
        if (link.tags && link.tags.length > 0) {
            link.tags.forEach(tag => tagsSet.add(tag.trim()));
        }
    });

    return Array.from(tagsSet);
}

// SHOW TAGS LIST
async function showAllTags() {
    let tags = await getAllTags();
    // let container = document.getElementById("tagsTab");
    let container = document.getElementById("tagsContainer");

    container.innerHTML = "";

    tags.forEach(tag => {
        let btn = document.createElement("button");
        btn.innerText = tag;
        btn.onclick = () => searchByTag(tag);
        container.appendChild(btn);
    });
}

// ADD TAG TO LINK
async function addTagToLink(linkId, newTag) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    if (!link.tags.includes(newTag)) {
        link.tags.push(newTag);
    }

    await dbUpdateLink(link);
    loadAllCards();
}

// REMOVE TAG FROM LINK
async function removeTagFromLink(linkId, tag) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.tags = link.tags.filter(t => t !== tag);

    await dbUpdateLink(link);
    loadAllCards();
}

// FILTER BY MULTIPLE TAGS
async function filterByMultipleTags(tagArray) {
    let links = await dbGetAllLinks();

    let filtered = links.filter(link => {
        return tagArray.every(tag => link.tags.includes(tag));
    });

    renderCards(filtered);
}
/* =========================
   12. DUPLICATE SYSTEM
========================= */
// NORMALIZE URL (remove trailing slash, www etc.)
function normalizeUrl(url) {
    try {
        let u = new URL(url);
        return u.hostname.replace("www.", "") + u.pathname.replace(/\/$/, "");
    } catch {
        return url;
    }
}

// CHECK DUPLICATE URL BEFORE ADD
async function isDuplicateUrl(url) {
    let links = await dbGetAllLinks();
    let normalized = normalizeUrl(url);

    return links.some(link => normalizeUrl(link.url) === normalized);
}

// THIS FUNCTION links.js CALL KAREGA
async function checkDuplicate(url) {
    return await isDuplicateUrl(url);
}

// GET ALL DUPLICATES
async function getDuplicateLinks() {
    let links = await dbGetAllLinks();
    let map = {};
    let duplicates = [];

    links.forEach(link => {
        let nUrl = normalizeUrl(link.url);

        if (map[nUrl]) {
            duplicates.push(link);
        } else {
            map[nUrl] = true;
        }
    });

    return duplicates;
}

// SHOW DUPLICATES
async function showDuplicateLinks() {
    let duplicates = await getDuplicateLinks();
    renderCards(duplicates);
}

// REMOVE DUPLICATE (KEEP FIRST)
async function removeDuplicateLinks() {
    let links = await dbGetAllLinks();
    let map = {};

    for (let link of links) {
        let nUrl = normalizeUrl(link.url);

        if (map[nUrl]) {
            await dbDeleteLink(link.id);
        } else {
            map[nUrl] = true;
        }
    }

    loadAllCards();
}

// COUNT DUPLICATES
async function countDuplicates() {
    let duplicates = await getDuplicateLinks();
    return duplicates.length;
}
/* =========================
   13. DEAD LINK CHECKER
========================= */
// CHECK SINGLE LINK DEAD OR NOT
async function checkDeadLink(link) {
    try {
        let response = await fetch(link.url, {
            method: "HEAD",
            mode: "no-cors"
        });

        // no-cors me status nahi milta, so assume alive if no error
        link.isDead = false;
    } catch (error) {
        link.isDead = true;
    }

    await dbUpdateLink(link);
}

// CHECK ALL LINKS DEAD STATUS
async function checkAllDeadLinks() {
    let links = await dbGetAllLinks();

    for (let link of links) {
        await checkDeadLink(link);
    }

    loadAllCards();
}

// SHOW DEAD LINKS
async function showDeadLinks() {
    let links = await dbGetAllLinks();
    let deadLinks = links.filter(link => link.isDead === true);
    renderCards(deadLinks);
}

// AUTO WEEKLY DEAD LINK CHECK
function startDeadLinkScheduler() {
    // 7 days interval
    let week = 7 * 24 * 60 * 60 * 1000;

    setInterval(() => {
        checkAllDeadLinks();
    }, week);
}

// REMOVE DEAD FLAG (Manual refresh)
async function refreshDeadStatus(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    await checkDeadLink(link);
    loadAllCards();
}
/* =========================
   14. REMINDER SYSTEM
========================= */
// SET REMINDER
async function setReminder(linkId, reminderDate) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.reminderDate = reminderDate;

    await dbUpdateLink(link);
    loadAllCards();
}

// REMOVE REMINDER
async function removeReminder(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.reminderDate = null;

    await dbUpdateLink(link);
    loadAllCards();
}

// CHECK REMINDERS
async function checkReminders() {
    let links = await dbGetAllLinks();
    let now = new Date();

    links.forEach(link => {
        if (link.reminderDate) {
            let reminder = new Date(link.reminderDate);

            if (reminder <= now) {
                alert("Reminder: Open link → " + link.title);
            }
        }
    });
}

// SHOW REMINDER LINKS
async function showReminderLinks() {
    let links = await dbGetAllLinks();
    let filtered = links.filter(link => link.reminderDate !== null);
    renderCards(filtered);
}

// REMINDER CHECK EVERY 1 HOUR
function startReminderScheduler() {
    setInterval(() => {
        checkReminders();
    }, 60 * 60 * 1000);
}
/* =========================
   15. VISIT HISTORY / GRAPH
========================= */
// UPDATE VISIT (Manual call if needed)
async function updateVisit(linkId) {
    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === linkId);

    if (!link) return;

    link.totalVisit += 1;
    link.lastVisit = new Date().toISOString();

    await dbUpdateLink(link);

    await dbAddHistory({
        linkId: linkId,
        visitDate: new Date().toISOString()
    });
}

// GET TOTAL VISITS (ALL LINKS)
async function getTotalVisits() {
    let links = await dbGetAllLinks();
    let total = 0;

    links.forEach(link => {
        total += link.totalVisit;
    });

    return total;
}

// GET MOST VISITED LINK
async function getMostVisitedLink() {
    let links = await dbGetAllLinks();

    links.sort((a, b) => b.totalVisit - a.totalVisit);

    return links[0];
}

// GET RECENTLY VISITED LINKS
async function getRecentVisited(limit = 5) {
    let history = await dbGetHistory();

    history.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    return history.slice(0, limit);
}

// GET VISITS PER DAY (For Graph)
async function getVisitsPerDay() {
    let history = await dbGetHistory();

    let visitsPerDay = {};

    history.forEach(h => {
        let date = new Date(h.visitDate).toLocaleDateString();

        if (!visitsPerDay[date]) {
            visitsPerDay[date] = 0;
        }

        visitsPerDay[date]++;
    });

    return visitsPerDay;
}

// GET VISITS FOR SPECIFIC LINK
async function getLinkVisitHistory(linkId) {
    let history = await dbGetHistory();

    return history.filter(h => h.linkId === linkId);
}
// GET VISIT STATS FOR GRAPH
async function getVisitStats() {
    let history = await dbGetHistory();
    let stats = {};

    history.forEach(h => {
        let date = new Date(h.visitDate).toLocaleDateString();

        if (!stats[date]) {
            stats[date] = 0;
        }

        stats[date]++;
    });

    return stats;
}

// DRAW SIMPLE GRAPH (CANVAS)
async function drawVisitGraph() {
    let stats = await getVisitStats();

    let canvas = document.getElementById("visitGraph");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");

    let dates = Object.keys(stats);
    let values = Object.values(stats);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let max = Math.max(...values);
    let width = canvas.width / dates.length;

    values.forEach((value, index) => {
        let height = (value / max) * canvas.height;

        ctx.fillRect(
            index * width,
            canvas.height - height,
            width - 5,
            height
        );
    });
}

// SHOW GRAPH TAB
function showGraph() {
    drawVisitGraph();
}
/* =========================
   16. IMPORT / EXPORT
========================= */
// EXPORT ALL DATA
async function exportAllData() {
    let password = prompt("Enter password to export data:");
    if (!password) return;

    let valid = await verifyPassword(password);
    if (!valid) {
        alert("Wrong password!");
        return;
    }

    let user = await dbGetUser();
    let links = await dbGetAllLinks();
    let history = await dbGetHistory();

    let exportData = {
        user: user,
        links: links,
        history: history,
        exportDate: new Date().toISOString()
    };

    let dataStr = JSON.stringify(exportData, null, 2);

    downloadFile(dataStr, "backup.txt");
}

// DOWNLOAD FILE
function downloadFile(content, fileName) {
    let blob = new Blob([content], {
        type: "text/plain"
    });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}
// IMPORT DATA FROM TXT FILE
function importDataFromFile(file) {
    let reader = new FileReader();

    reader.onload = async function (e) {
        try {
            let data = JSON.parse(e.target.result);

            if (!data.user || !data.links) {
                alert("Invalid backup file!");
                return;
            }

            await dbSaveUser(data.user);

            for (let link of data.links) {
                await dbAddLink(link);
            }

            if (data.history) {
                for (let h of data.history) {
                    await dbAddHistory(h);
                }
            }

            alert("Account recovered successfully!");
            loadAllCards();

        } catch (err) {
            alert("Import failed!");
        }
    };

    reader.readAsText(file);
}

// IMPORT FROM INPUT FILE
function importFromInput() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    input.onchange = function (e) {
        let file = e.target.files[0];
        if (file) {
            importDataFromFile(file);
        }
    };

    input.click();
}
/* =========================
   17. SHARE TARGET
========================= */
// HANDLE SHARE TARGET URL
function handleSharedData() {
    const params = new URLSearchParams(window.location.search);

    const sharedUrl = params.get("url");
    const sharedTitle = params.get("title");
    const sharedText = params.get("text");

    if (sharedUrl) {
        addSharedLink(sharedUrl, sharedTitle || sharedText || "Shared Link");
        showNotification("success", "Link imported from share");
        window.history.replaceState({}, document.title, "index.html");

    }
}

// ADD SHARED LINK
async function addSharedLink(url, title) {
    let duplicate = await isDuplicateUrl(url);

    if (duplicate) {
        // alert("Link already saved!");
        showNotification("warning", "Link already saved!")
        return;
    }

    let newLink = {
        id: Date.now().toString(),
        title: title,
        url: url,
        img: "",
        category: "shared",
        tags: ["shared"],
        favorite: false,
        pinned: false,
        totalVisit: 0,
        lastVisit: null,
        createdDate: new Date().toISOString(),
        reminderDate: null,
        isDead: false,
        order: Date.now()
    };

    await dbAddLink(newLink);
    loadAllCards();

    // alert("Link saved from share!");
    showNotification("success", "Link save from share.");
}
// URLSearchParams code
const params = new URLSearchParams(location.search);

const title = params.get("title");
const text = params.get("text");
const url = params.get("url");

if (url) {
    addNewLink(url, title || text || "Shared Link");
    showNotification("success", "Link imported from share");
    window.location.href = "index.html";
}
/* =========================
   18. INSTAGRAM FEATURES
========================= */
// CHECK INSTAGRAM URL
function isInstagramUrl(url) {
    return url.includes("instagram.com");
}

// CHECK INSTAGRAM REEL
function isInstagramReel(url) {
    return url.includes("/reel/");
}

// PROCESS INSTAGRAM LINK BEFORE SAVE
async function processInstagramLink(linkData) {
    if (!isInstagramUrl(linkData.url)) {
        return linkData;
    }

    // Set category
    linkData.category = "instagram";

    // Add tag
    if (!linkData.tags.includes("instagram")) {
        linkData.tags.push("instagram");
    }

    // Reel detection
    if (isInstagramReel(linkData.url)) {
        if (!linkData.tags.includes("reel")) {
            linkData.tags.push("reel");
        }

        linkData.category = "reels";
    }

    // Try thumbnail fetch (basic method)
    try {
        let thumbnail = await fetchInstagramThumbnail(linkData.url);
        if (thumbnail) {
            linkData.img = thumbnail;
        }
    } catch (e) {
        console.log("Thumbnail fetch failed");
    }

    return linkData;
}

// FETCH INSTAGRAM THUMBNAIL (Simple OpenGraph)
async function fetchInstagramThumbnail(url) {
    try {
        let response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));
        let data = await response.json();

        let parser = new DOMParser();
        let doc = parser.parseFromString(data.contents, "text/html");

        let ogImage = doc.querySelector('meta[property="og:image"]');

        if (ogImage) {
            return ogImage.getAttribute("content");
        }

        return "";
    } catch {
        return "";
    }
}

// SHOW INSTAGRAM LINKS
async function showInstagramLinks() {
    let links = await dbGetAllLinks();
    let filtered = links.filter(link => link.category === "instagram");
    renderCards(filtered);
}

// SHOW REELS ONLY
async function showReels() {
    let links = await dbGetAllLinks();
    let filtered = links.filter(link => link.tags.includes("reel"));
    renderCards(filtered);
}
/* =========================
   19. DRAG & DROP
========================= */
let draggedCardId = null;

// DRAG START
function dragStart(event, id) {
    draggedCardId = id;
}

// DRAG OVER
function dragOver(event) {
    event.preventDefault();
}

// DROP CARD
async function dropCard(event, targetId) {
    event.preventDefault();

    if (!draggedCardId || draggedCardId === targetId) return;

    let links = await dbGetAllLinks();

    let draggedIndex = links.findIndex(l => l.id === draggedCardId);
    let targetIndex = links.findIndex(l => l.id === targetId);

    // Swap order
    let temp = links[draggedIndex].order;
    links[draggedIndex].order = links[targetIndex].order;
    links[targetIndex].order = temp;

    await dbUpdateLink(links[draggedIndex]);
    await dbUpdateLink(links[targetIndex]);

    loadAllCards();
}

// SORT BY MANUAL ORDER
async function sortByManualOrder() {
    let links = await dbGetAllLinks();
    links.sort((a, b) => a.order - b.order);
    renderCards(links);
}
