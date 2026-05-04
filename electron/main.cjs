/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { autoUpdater } = require("electron-updater");

const APP_URL = process.env.MICPOS_APP_URL || "http://127.0.0.1:3000";
const APP_PORT = Number(process.env.PORT || "3000");
const UPDATE_URL = process.env.MICPOS_UPDATE_URL || "";
const UPDATE_CHECK_INTERVAL_MS = Number(process.env.MICPOS_UPDATE_INTERVAL_MS || "900000");
const isDev = !app.isPackaged;

let mainWindow = null;
let bridgeProcess = null;
let nextServerProcess = null;
let isQuitting = false;
let bridgeRestartTimer = null;
let updaterConfigured = false;
let updateInterval = null;

function log(message) {
  console.log(`[MicroviseDesktop] ${message}`);
}

function setupAutoUpdater() {
  if (isDev || updaterConfigured) {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  if (UPDATE_URL) {
    // Opsiyonel: generic update sunucusu ile override edilebilir.
    autoUpdater.setFeedURL({
      provider: "generic",
      url: UPDATE_URL,
    });
    log(`Update provider: generic (${UPDATE_URL})`);
  }
  else
  {
    // Varsayilan: electron-builder app-update.yml (GitHub release) bilgisi kullanilir.
    log("Update provider: package config (GitHub release).");
  }

  autoUpdater.on("checking-for-update", () => {
    log("Update kontrol ediliyor.");
  });

  autoUpdater.on("update-available", (info) => {
    log(`Yeni surum bulundu: ${info.version ?? "bilinmiyor"}`);
  });

  autoUpdater.on("update-not-available", () => {
    log("Guncel surum kullaniyor.");
  });

  autoUpdater.on("download-progress", (progress) => {
    log(`Update indiriliyor: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    log(`Update indirildi: ${info.version ?? "bilinmiyor"}`);

    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Simdi Yeniden Baslat", "Sonra"],
      defaultId: 0,
      cancelId: 1,
      title: "Guncelleme Hazir",
      message: "Yeni surum indirildi.",
      detail: "Guncellemeyi uygulamak icin uygulama yeniden baslatilacak.",
    });

    if (result.response === 0) {
      isQuitting = true;
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", (error) => {
    log(`Auto update hata: ${error?.message ?? String(error)}`);
  });

  updaterConfigured = true;
}

function startAutoUpdateChecks() {
  if (!updaterConfigured || isDev) {
    return;
  }

  const runCheck = () => {
    autoUpdater.checkForUpdates().catch((error) => {
      log(`Update kontrol hatasi: ${error?.message ?? String(error)}`);
    });
  };

  runCheck();
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  updateInterval = setInterval(runCheck, UPDATE_CHECK_INTERVAL_MS);
}

function resolveBridgeExecutable() {
  if (process.env.MICPOS_BRIDGE_PATH && fs.existsSync(process.env.MICPOS_BRIDGE_PATH)) {
    return process.env.MICPOS_BRIDGE_PATH;
  }

  if (app.isPackaged) {
    const packagedBridge = path.join(process.resourcesPath, "bridge", "MicPOS.IngenicoBridge.exe");
    if (fs.existsSync(packagedBridge)) {
      return packagedBridge;
    }
  }

  const localBridge = path.join(
    app.getAppPath(),
    "integrations",
    "ingenico-bridge",
    "MicPOS.IngenicoBridge",
    "publish",
    "MicPOS.IngenicoBridge.exe",
  );
  if (fs.existsSync(localBridge)) {
    return localBridge;
  }

  return null;
}

function startBridge() {
  if (bridgeProcess) {
    return;
  }

  const bridgeExe = resolveBridgeExecutable();
  if (!bridgeExe) {
    log("Ingenico bridge executable bulunamadi. MICPOS_BRIDGE_PATH ile yol verebilirsin.");
    return;
  }

  const bridgeCwd = path.dirname(bridgeExe);
  log(`Ingenico bridge baslatiliyor: ${bridgeExe}`);

  bridgeProcess = spawn(bridgeExe, [], {
    cwd: bridgeCwd,
    windowsHide: true,
    stdio: "pipe",
    env: {
      ...process.env,
      ASPNETCORE_URLS: process.env.ASPNETCORE_URLS || "http://0.0.0.0:5000",
    },
  });

  bridgeProcess.stdout?.on("data", (data) => {
    log(`Bridge: ${data.toString().trim()}`);
  });

  bridgeProcess.stderr?.on("data", (data) => {
    log(`Bridge ERR: ${data.toString().trim()}`);
  });

  bridgeProcess.on("exit", (code, signal) => {
    log(`Bridge kapandi. code=${code ?? "null"} signal=${signal ?? "null"}`);
    bridgeProcess = null;

    if (!isQuitting) {
      clearTimeout(bridgeRestartTimer);
      bridgeRestartTimer = setTimeout(() => {
        startBridge();
      }, 2000);
    }
  });
}

function resolveStandaloneServerPath() {
  if (!app.isPackaged) {
    return null;
  }

  const candidates = [
    path.join(process.resourcesPath, "app.asar.unpacked", ".next", "standalone", "server.js"),
    path.join(app.getAppPath(), ".next", "standalone", "server.js"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function startNextServerIfNeeded() {
  if (isDev || nextServerProcess) {
    return;
  }

  const serverPath = resolveStandaloneServerPath();
  if (!serverPath) {
    throw new Error("Next standalone server.js bulunamadi. Önce `npm run build` calistir.");
  }

  const cwd = path.dirname(serverPath);
  if (!fs.existsSync(cwd)) {
    throw new Error(`Next standalone klasoru bulunamadi: ${cwd}`);
  }

  log(`Next standalone baslatiliyor: ${serverPath}`);

  nextServerProcess = spawn(process.execPath, [serverPath], {
    cwd,
    windowsHide: true,
    stdio: "pipe",
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(APP_PORT),
      HOSTNAME: "127.0.0.1",
    },
  });

  nextServerProcess.stdout?.on("data", (data) => {
    log(`Next: ${data.toString().trim()}`);
  });

  nextServerProcess.stderr?.on("data", (data) => {
    log(`Next ERR: ${data.toString().trim()}`);
  });

  nextServerProcess.on("exit", (code, signal) => {
    log(`Next server kapandi. code=${code ?? "null"} signal=${signal ?? "null"}`);
    nextServerProcess = null;
    if (!isQuitting) {
      app.quit();
    }
  });
}

function stopManagedProcesses() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  if (bridgeRestartTimer) {
    clearTimeout(bridgeRestartTimer);
    bridgeRestartTimer = null;
  }

  if (bridgeProcess) {
    bridgeProcess.removeAllListeners("exit");
    bridgeProcess.kill();
    bridgeProcess = null;
  }

  if (nextServerProcess) {
    nextServerProcess.removeAllListeners("exit");
    nextServerProcess.kill();
    nextServerProcess = null;
  }
}

function waitForUrl(url, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      req.on("error", retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() >= deadline) {
        reject(new Error(`URL hazir degil: ${url}`));
        return;
      }
      setTimeout(attempt, 500);
    };

    attempt();
  });
}

async function createWindow() {
  setupAutoUpdater();
  startBridge();
  startNextServerIfNeeded();

  await waitForUrl(APP_URL);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  await mainWindow.loadURL(APP_URL);
  startAutoUpdateChecks();
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      await createWindow();
    } catch (error) {
      log(`Baslatma hatasi: ${error instanceof Error ? error.message : String(error)}`);
      app.quit();
    }
  });
}

app.on("before-quit", () => {
  isQuitting = true;
  stopManagedProcesses();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error?.message ?? String(error)}`);
});
