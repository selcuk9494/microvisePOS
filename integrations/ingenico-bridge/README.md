# MicPOS Ingenico Bridge

Bu klasor, `Ingenico Move5000F` icin Windows tarafinda calisacak HTTP bridge iskeletini icerir.

## Amac

- Next.js uygulamasinin tarayici veya Linux/macOS ortamindan dogrudan `GMPSmartDLL.dll` cagiramasini telafi eder.
- `precheck`, `pairing`, `payment`, `cancel` endpoint'lerini tek bir Windows servisinde toplar.
- MicPOS icindeki `INGENICO_BRIDGE_URL` ortam degiskeni ile konusur.

## Klasor

- `MicPOS.IngenicoBridge/Program.cs`
- `MicPOS.IngenicoBridge/MicPOS.IngenicoBridge.csproj`

## Hazir Endpointler

- `GET /health`
- `POST /precheck`
- `POST /pairing`
- `POST /payment`
- `POST /cancel`

## Bugunku Durum

- `precheck`: `Json_FP3_UpdateInterfaceXmlDataByID`, `FP3_GetInterfaceHandleByID`, `Json_FP3_Echo`, `FP3_IsGmpPairingDone`
- `pairing`: `Json_FP3_StartPairingInit`
- `payment`: bridge akisi ve payload hazir, varsayilan olarak mock veya pending cevap dondurur
- `cancel`: endpoint hazir, native iptal fonksiyonunu baglamak icin stub durumda

## Windows Kurulum

1. Bu klasoru Windows makineye kopyalayin.
2. `GMPSmartDLL.dll` ve vendor bagimliliklarini servis exe'si ile ayni klasore koyun.
3. Bridge'i calistirin:

```bash
dotnet run --project integrations/ingenico-bridge/MicPOS.IngenicoBridge
```

Yayin alip Windows makineye kopyalamak icin:

```bash
dotnet publish integrations/ingenico-bridge/MicPOS.IngenicoBridge/MicPOS.IngenicoBridge.csproj -c Release -r win-x64 --self-contained false
```

- Guncel `Program.cs` degisikligi ancak yeni `publish` alindiginda Windows exe'ye yansir.
- Publish ciktisinda `MicPOS.IngenicoBridge.exe`, `GMPSmartDLL.dll`, `GMP.XML` ve vendor bagimli DLL dosyalari ayni klasorde bulunmalidir.
- Eski exe calisiyorsa yeni kopyayi almadan once prosesi kapatin.

- Varsayilan olarak servis `http://0.0.0.0:5000` uzerinden dinler.
- Ayni Windows makinede `http://localhost:5000/health`
- Yerel agdan `http://WINDOWS-IP:5000/health`
- Farkli bir adres vermek isterseniz `ASPNETCORE_URLS` ile override edebilirsiniz.

4. MicPOS uygulamasinda su ortam degiskenini tanimlayin:

```bash
INGENICO_BRIDGE_URL=http://WINDOWS-IP:5000
```

## Notlar

- Eger `useMock=true` ise MicPOS yine mock odeme onayi verir.
- Gercek kart cekimi icin bridge tarafinda `FP3_Start` ve `Json_FP3_Payment` adimini tamamlamak gerekir.
- Dokumanlarda `FP3_StartEx` yerine `FP3_Start` akisinin daha stabil oldugu notu dikkate alin.
- Yerel agdan erisim icin gerekirse Windows Firewall uzerinde `5000/TCP` portunu izinli yapin.

## DLL Sorun Giderme

- `Unable to load DLL 'GmpSmartDLL.dll'` hatasi alirsaniz sadece ana DLL degil, vendor'in verdigi tum bagimli DLL dosyalarini da ayni klasore koyun.
- Sik nedenler:
  - `GMPSmartDLL.dll` kopyalandi ama bagimli vendor DLL dosyalari eksik
  - Microsoft Visual C++ Redistributable eksik
  - Bridge prosesi ile native DLL mimarisi farkli
- Windows ARM cihazlarda DLL `x64` ise bridge'i `x64` .NET ile calistirin veya `x64` Windows makine kullanin.
