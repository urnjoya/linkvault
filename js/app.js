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

    showTab("linksTab");

    loadTheme();
    handleSharedData();
    startReminderScheduler();
    startDeadLinkScheduler();
    loadProfile();
}

// PAGE SWITCHING
function showPage(pageId) {
    let pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("activePage"));

    document.getElementById(pageId).classList.add("activePage");
}

// TAB SWITCHING
function showTab(tabId) {
    let tabs = document.querySelectorAll(".tabPage");
    tabs.forEach(tab => tab.classList.remove("activeTab"));

    document.getElementById(tabId).classList.add("activeTab");
}

// LOGIN NAVIGATION
function showCreateAccount() {
    showPage("createAccountPage");
}

function showRecovery() {
    showPage("importTab");
    showPage("dashboardPage");
}

function goToLogin() {
    showPage("loginPage");
}

// LOCK SYSTEM
function lockApp() {
    showPage("lockScreen");
}

function unlockApp() {
    let inputPass = document.getElementById("lockPassword").value;
    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    if (inputPass === user.password) {
        showPage("dashboardPage");
        loadAllCards();
    } else {
        alert("Wrong Password");
    }
}

// POPUP CONTROL
function showAddPopup() {
    document.getElementById("addPopup").style.display = "flex";
}

function closeAddPopup() {
    document.getElementById("addPopup").style.display = "none";
}

// SORT MENU (placeholder)
function sortMenu() {
    alert("Sort options coming here");
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