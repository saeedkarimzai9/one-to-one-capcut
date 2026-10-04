const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0d0d0f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.loadFile(path.join(__dirname, "index.html"));
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", data => { stderr += data.toString(); });
    proc.on("error", reject);
    proc.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(stderr || "FFmpeg exited with code " + code));
    });
  });
}

ipcMain.handle("export-clip", async (_event, { inputPath, start, end }) => {
  if (!inputPath) throw new Error("No video file is selected.");

  const picked = await dialog.showSaveDialog({
    title: "Export System Edit video",
    defaultPath: "system-edit-export.mp4",
    filters: [{ name: "MP4 Video", extensions: ["mp4"] }]
  });

  if (picked.canceled || !picked.filePath) return { canceled: true };

  const duration = Math.max(0.05, Number(end) - Number(start));
  const args = [
    "-y",
    "-ss", String(Math.max(0, Number(start))),
    "-i", inputPath,
    "-t", String(duration),
    "-map", "0:v:0?",
    "-map", "0:a:0?",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-c:a", "aac",
    "-movflags", "+faststart",
    picked.filePath
  ];

  await runFfmpeg(args);
  return { canceled: false, path: picked.filePath };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
