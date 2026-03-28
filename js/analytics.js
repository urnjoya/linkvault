// visit.js
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
// graph.js
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
