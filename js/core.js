// db.js
let db;

// OPEN DATABASE
function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("LinkVaultDB", 1);

        request.onupgradeneeded = function (e) {
            db = e.target.result;

            // LINKS TABLE
            if (!db.objectStoreNames.contains("links")) {
                let linksStore = db.createObjectStore("links", { keyPath: "id", autoIncrement: true });
                linksStore.createIndex("url", "url", { unique: false });
                linksStore.createIndex("category", "category", { unique: false });
                linksStore.createIndex("favorite", "favorite", { unique: false });
                linksStore.createIndex("pinned", "pinned", { unique: false });
            }

            // HISTORY TABLE
            if (!db.objectStoreNames.contains("history")) {
                let historyStore = db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
                historyStore.createIndex("linkId", "linkId", { unique: false });
            }

            // SETTINGS TABLE
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "id" });
            }
            // USER TABLE
            if (!db.objectStoreNames.contains("user")) {
                db.createObjectStore("user", { keyPath: "id" });
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
        let request = store.put({ id: 1, ...user });

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

// auth.js
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

// EXPORT USER DATA (Used in export.js later)
function getUserData() {
    return JSON.parse(localStorage.getItem("user"));
}

// IMPORT USER DATA (Recovery)
function importUserData(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
}

// encrypt.js
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
