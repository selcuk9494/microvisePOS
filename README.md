# Microvise POS

## Gelistirme

```bash
npm install
npm run dev
```

## Electron (Kullanici Dostu Calisma)

Electron uygulamasi acildiginda:
- Next.js uygulamasini yukler.
- Ingenico bridge (`MicPOS.IngenicoBridge.exe`) prosesini otomatik baslatir.
- Bridge kapanirsa otomatik yeniden dener.
- Uygulama kapaninca arka prosesleri temiz kapatir.

### Dev Modu

```bash
npm run desktop:dev
```

### Windows Paket Alma (x64)

On kosul: Bridge publish klasoru dolu olmali.
- Beklenen klasor: `integrations/ingenico-bridge/MicPOS.IngenicoBridge/publish`

Komutlar:

```bash
npm run desktop:build:dir
# veya
npm run desktop:build
```

Uretilen paketler:
- `dist-electron/win-unpacked/` (klasor cikisi)
- `dist-electron/*.exe` (NSIS kurulum dosyasi)

## Notlar

- Electron, Next tarafini `standalone` cikisla paketler.
- Bridge yolu varsayilan olarak paket icindeki `resources/bridge` altindan okunur.
- Gerekirse manuel bridge yolu icin ortam degiskeni kullan:
  - `MICPOS_BRIDGE_PATH=C:\\path\\to\\MicPOS.IngenicoBridge.exe`

## Otomatik Guncelleme

Uygulama `electron-updater` ile GitHub Release uzerinden otomatik guncelleme alir.

Calisma sekli:
- Uygulama acilinca update kontrol eder.
- Yeni surum varsa arka planda indirir.
- Indirme bitince kullaniciya "Simdi Yeniden Baslat" secenegi sunar.
- Kullanici "Sonra" derse uygulama kapanisinda otomatik kurulum yapilir.

Varsayilan update kaynagi:
- GitHub repo: `selcuk9494/microvisePOS`

Opsiyonel override:
- Generic update URL vermek istersen:
  - `MICPOS_UPDATE_URL=https://domain.com/microvise-updates/`
- Kontrol araligi (ms):
  - `MICPOS_UPDATE_INTERVAL_MS=900000`

CI/CD:
- Workflow dosyasi: `.github/workflows/release-electron.yml`
- Tetikleme:
  - `v*` tag push
  - veya manuel `workflow_dispatch`

Release ciktilari:
- `Microvise POS Setup <version>.exe`
- `latest.yml`

Not:
- Workflow `GH_TOKEN` ile ayni repoya release yukler.
- Build zinciri otomatik olarak bridge publish + `GMPSmartDLL.dll` kopyalama adimlarini icerir.
