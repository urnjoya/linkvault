// ADD LINK FROM POPUP
async function addLink() {
    let url = document.getElementById("linkURL").value;
    let title = document.getElementById("linkTitle").value;
    let image = document.getElementById("linkImage").value;
    let category = document.getElementById("linkCategory").value;
    let tags = document.getElementById("linkTags").value;

    if (!url) {
        alert("URL required");
        return;
    }

    // Duplicate check
    let duplicate = await checkDuplicate(url);
    if (duplicate) {
        if (!confirm("Duplicate URL found. Save anyway?")) {
            return;
        }
    }


    // Fetch metadata if missing
    let meta = await fetchMetadata(url);

    if (!title) title = meta.title;
    if (!image) image = meta.image;

    // Default image
    if (!image) image = "https://via.placeholder.com/300";

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

    await dbAddLink(linkData);

    closeAddPopup();
    loadAllCards();
}

// LOAD ALL CARDS
async function loadAllCards() {
    let links = await dbGetAllLinks();

    renderCards(links);
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
        alert("Wrong password");
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
        alert("Wrong password");
        return;
    }

    let links = await dbGetAllLinks();
    let link = links.find(l => l.id === id);

    if (!link) return;

    let meta = await fetchMetadata(link.url);

    if (meta.title) link.title = meta.title;
    if (meta.image) link.image = meta.image;

    await dbUpdateLink(link);
    loadAllCards();
}
