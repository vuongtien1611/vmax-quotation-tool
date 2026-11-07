const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow = null;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// 50MB File Limit
const MAX_BACKUP_SIZE = 50 * 1024 * 1024; // 50MB in bytes

/**
 * Bootstrap assets localizer to download Google Fonts, FontAwesome and SortableJS locally
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const file = fs.createWriteStream(destPath);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

async function bootstrapLibraries() {
    const libs = [
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js",
            path: "libs/sortable/Sortable.min.js"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
            path: "libs/font-awesome/css/all.min.css"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
            path: "libs/font-awesome/webfonts/fa-solid-900.woff2"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff",
            path: "libs/font-awesome/webfonts/fa-solid-900.woff"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2",
            path: "libs/font-awesome/webfonts/fa-brands-400.woff2"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff",
            path: "libs/font-awesome/webfonts/fa-brands-400.woff"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2",
            path: "libs/font-awesome/webfonts/fa-regular-400.woff2"
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff",
            path: "libs/font-awesome/webfonts/fa-regular-400.woff"
        }
    ];

    let needsDownload = false;
    for (const lib of libs) {
        const fullPath = path.join(__dirname, lib.path);
        if (!fs.existsSync(fullPath)) {
            needsDownload = true;
            break;
        }
    }
    
    const googleFontCssPath = path.join(__dirname, "libs/fonts/be-vietnam-pro.css");
    if (!fs.existsSync(googleFontCssPath)) {
        needsDownload = true;
    }

    if (!needsDownload) return;

    console.log("Localizing external libraries for offline execution...");
    for (const lib of libs) {
        const fullPath = path.join(__dirname, lib.path);
        if (!fs.existsSync(fullPath)) {
            try {
                await downloadFile(lib.url, fullPath);
            } catch (e) {
                console.error(`Failed to download ${lib.url}:`, e);
            }
        }
    }

    if (!fs.existsSync(googleFontCssPath)) {
        try {
            const googleFontsUrl = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
            const tempCssPath = path.join(__dirname, "libs/fonts/temp.css");
            await downloadFile(googleFontsUrl, tempCssPath);
            
            let cssContent = fs.readFileSync(tempCssPath, 'utf8');
            fs.unlinkSync(tempCssPath);

            const urls = [];
            const regex = /url\((https:\/\/[^)]+)\)/g;
            let match;
            while ((match = regex.exec(cssContent)) !== null) {
                urls.push(match[1]);
            }

            for (let i = 0; i < urls.length; i++) {
                const fontUrl = urls[i];
                const filename = `be-vietnam-pro-font-${i}.woff2`;
                const destPath = path.join(__dirname, "libs/fonts", filename);
                await downloadFile(fontUrl, destPath);
                cssContent = cssContent.replace(fontUrl, filename);
            }

            fs.writeFileSync(googleFontCssPath, cssContent, 'utf8');
            console.log("Offline Google Fonts successfully initialized.");
        } catch (e) {
            console.error("Failed to bootstrap Google Fonts:", e);
        }
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', fs.existsSync(path.join(__dirname, 'assets/icon.ico')) ? 'icon.ico' : 'logo-vmax.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile('index.html');

    // Block navigation to external links and open in default OS browser
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const currentUrl = mainWindow.webContents.getURL();
        if (url !== currentUrl && /^https?:\/\//i.test(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:\/\//i.test(url)) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

app.whenReady().then(async () => {
    try {
        await bootstrapLibraries();
    } catch (e) {
        console.error("Failed to bootstrap local assets:", e);
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC EVENT HANDLERS ---

// 1. PDF Export
ipcMain.handle('pdf:export', async (event, filename) => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Xuất file PDF báo giá',
            defaultPath: filename || 'Báo giá VMAX.pdf',
            filters: [{ name: 'Adobe PDF Document', extensions: ['pdf'] }]
        });

        if (!filePath) {
            return { success: false, error: 'Cancelled' };
        }

        // Print page using standard margins: 12mm top/bottom (0.47 in), 15mm left/right (0.59 in)
        const pdfOptions = {
            margins: {
                top: 0.47,
                bottom: 0.47,
                left: 0.59,
                right: 0.59
            },
            pageSize: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false
        };

        const data = await mainWindow.webContents.printToPDF(pdfOptions);
        fs.writeFileSync(filePath, data);
        return { success: true, path: filePath };
    } catch (err) {
        console.error("Error generating PDF:", err);
        return { success: false, error: err.message };
    }
});

// 2. Backup Save
ipcMain.handle('backup:save', async (event, rawJson) => {
    try {
        if (typeof rawJson !== 'string') {
            return { success: false, error: 'Dữ liệu sao lưu không đúng định dạng.' };
        }

        if (rawJson.length > MAX_BACKUP_SIZE) {
            return { success: false, error: 'Dữ liệu sao lưu vượt quá giới hạn cho phép (50MB).' };
        }

        // Verify JSON parses correctly before writing
        const parsed = JSON.parse(rawJson);
        if (parsed.format !== "vmax-quotation-backup") {
            return { success: false, error: 'Định dạng dữ liệu không khớp.' };
        }

        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Lưu file cấu hình sao lưu',
            defaultPath: `VMAX-Quotation-Backup-${new Date().toISOString().slice(0,10)}.json`,
            filters: [{ name: 'JSON Backup File', extensions: ['json'] }]
        });

        if (!filePath) {
            return { success: false, error: 'Cancelled' };
        }

        fs.writeFileSync(filePath, rawJson, 'utf8');
        return { success: true, path: filePath };
    } catch (err) {
        console.error("Backup save failed:", err);
        return { success: false, error: err.message };
    }
});

// 3. Backup Load
ipcMain.handle('backup:load', async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'Chọn file cấu hình khôi phục',
            filters: [{ name: 'JSON Backup File', extensions: ['json'] }],
            properties: ['openFile']
        });

        if (!filePaths || filePaths.length === 0) {
            return { success: false, error: 'Cancelled' };
        }

        const filePath = filePaths[0];
        const stats = fs.statSync(filePath);
        if (stats.size > MAX_BACKUP_SIZE) {
            return { success: false, error: 'Kích thước file vượt quá giới hạn cho phép (50MB).' };
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawData);

        // Validation checks
        if (parsed.format !== "vmax-quotation-backup") {
            return { success: false, error: 'File được chọn không phải là bản sao lưu hợp lệ của ứng dụng VMAX.' };
        }

        if (typeof parsed.schemaVersion !== 'number') {
            return { success: false, error: 'Phiên bản schema dữ liệu không hợp lệ.' };
        }

        // Validated successfully
        return { success: true, data: parsed };
    } catch (err) {
        console.error("Backup load failed:", err);
        return { success: false, error: err.message };
    }
});
