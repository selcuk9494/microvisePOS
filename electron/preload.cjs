/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("microviseDesktop", {
  platform: process.platform,
  version: process.versions.electron,
});
