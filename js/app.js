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
// 
// 
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
    }
    else {
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
    }
    else {
        document.getElementById("addPopup").style.display = "flex";
    }
}

function closeAddPopup() {
    document.getElementById("addPopup").style.display = "none";
}

// SORT MENU (placeholder)
function sortMenu() {
    showNotification("info", "Sort options coming soon");
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
