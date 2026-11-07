const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    exportPDF: (filename) => ipcRenderer.invoke('pdf:export', filename),
    saveBackup: (data) => ipcRenderer.invoke('backup:save', data),
    loadBackup: () => ipcRenderer.invoke('backup:load')
});
