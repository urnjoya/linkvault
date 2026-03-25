// share.js
// HANDLE SHARE TARGET URL
function handleSharedData() {
    const params = new URLSearchParams(window.location.search);

    const sharedUrl = params.get("url");
    const sharedTitle = params.get("title");
    const sharedText = params.get("text");

    if (sharedUrl) {
        addSharedLink(sharedUrl, sharedTitle || sharedText || "Shared Link");
    }
}

// ADD SHARED LINK
async function addSharedLink(url, title) {
    let duplicate = await isDuplicateUrl(url);

    if (duplicate) {
        alert("Link already saved!");
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

    alert("Link saved from share!");
}
// instagram.js
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