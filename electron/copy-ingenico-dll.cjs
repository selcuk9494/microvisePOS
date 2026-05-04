/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const bridgePublishDir = path.join(
  root,
  "integrations",
  "ingenico-bridge",
  "MicPOS.IngenicoBridge",
  "publish",
);

const vendorDir = path.join(root, "dokuman", "GDP_v16r38", "DLL", "Windows", "x64");
const filesToCopy = ["GMPSmartDLL.dll", "GMP.XML"];

for (const fileName of filesToCopy) {
  const source = path.join(vendorDir, fileName);
  const target = path.join(bridgePublishDir, fileName);

  if (!fs.existsSync(source)) {
    console.warn(`[copy-ingenico-dll] Kaynak bulunamadi, atlandi: ${source}`);
    continue;
  }

  fs.copyFileSync(source, target);
  console.log(`[copy-ingenico-dll] Kopyalandi: ${fileName}`);
}
