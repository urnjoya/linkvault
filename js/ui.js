// cards.js
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
    }

    if (link.pinned) {
        card.style.border = "2px solid gold";
    }

    card.innerHTML = `
        <img src="${link.image}" onerror="this.src='https://via.placeholder.com/300'">

        <div class="cardTitle">${link.title}</div>
        <div class="cardURL">${link.url}</div>

        <div class="cardInfo">
            <span>Visits: ${link.totalVisit}</span>
            <span>${formatDate(link.lastVisit)}</span>
        </div>

        <div class="cardButtons">
            <button onclick="openLink(${link.id})">Open</button>
            <button onclick="toggleFavorite(${link.id})">Fav</button>
            <button onclick="togglePin(${link.id})">Pin</button>
            <button onclick="editLink(${link.id})">Edit</button>
            <button onclick="deleteLink(${link.id})">Del</button>
        </div>

        <div class="cardButtons">
            <button onclick="refetchMetadata(${link.id})">Refetch</button>
            <button onclick="showMoreInfo(${link.id})">Info</button>
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
// dragdrop.js
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
// theme.js
// SET THEME
function setTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
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