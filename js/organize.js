// tag.js
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
// category.js
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
// favorite.js
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
// pin.js
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
// search.js
// SEARCH LINKS
async function searchLinks() {
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
// sort.js
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
        case "1": sortLinks("recent"); break;
        case "2": sortLinks("oldest"); break;
        case "3": sortLinks("mostVisited"); break;
        case "4": sortLinks("leastVisited"); break;
        case "5": sortLinks("az"); break;
        case "6": sortLinks("za"); break;
        case "7": sortLinks("createdNew"); break;
        case "8": sortLinks("createdOld"); break;
        case "9": sortLinks("pinned"); break;
        case "10": sortLinks("favorite"); break;
        case "11": sortLinks("reminder"); break;
        case "12": sortLinks("dead"); break;
    }
}