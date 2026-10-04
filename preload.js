const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("systemEdit", {
  getFilePath(file) {
    return webUtils.getPathForFile(file);
  },
  exportClip(inputPath, start, end) {
    return ipcRenderer.invoke("export-clip", { inputPath, start, end });
  }
});
