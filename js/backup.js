// export.js
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
    let blob = new Blob([content], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}
// import.js
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