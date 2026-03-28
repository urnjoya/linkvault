// duplicate.js

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
// deadlink.js
// CHECK SINGLE LINK DEAD OR NOT
async function checkDeadLink(link) {
    try {
        let response = await fetch(link.url, { method: "HEAD", mode: "no-cors" });

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
// reminder.js
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
