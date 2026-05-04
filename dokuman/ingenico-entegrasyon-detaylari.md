# Ingenico Entegrasyon Detaylari

## Amac

Bu dokuman, projedeki Ingenico entegrasyonunun nasil calistigini teknik olarak aciklar.

Kapsam:

- servis mimarisi
- precheck akisi
- pairing akisi
- odeme akisi
- iptal ve tekrar dene davranisi
- kullanilan native DLL cagrilari
- ornek veri yapilari
- loglama ve hata ayiklama notlari

Bu entegrasyonun ana hedefi, `GMPSmartDLL.dll` uzerinden Ingenico cihaziyla haberlesip mali satis fisini ve kart odemesini ayni akista yonetmektir.

## Kullanilan Bilesenler

Ana dosyalar:

- `Kiosk.App/Services/NativeIngenicoPaymentService.cs`
- `Kiosk.App/Services/IsolatedIngenicoPaymentService.cs`
- `Kiosk.App/Services/IsolatedIngenicoDiagnosticsService.cs`
- `Kiosk.App/ViewModels/MainViewModel.cs`
- `Kiosk.App/Services/IngenicoRuntimeConfigurator.cs`
- `Kiosk.App/Services/IngenicoLogService.cs`
- `Kiosk.App/ingenico.settings.json`
- `Kiosk.App/IngenicoRuntime/x64/GMPSmartDLL.dll`
- `Kiosk.App/IngenicoRuntime/x64/GMP.XML`

## Genel Mimari

Entegrasyon 3 katmanli ilerler:

### 1. UI Katmani

`MainViewModel` odeme butonuna basildiginda odeme context olusturur ve odeme servisini cagirir.

Ilgili akis:

- `ExecutePaymentAsync(...)`
- `EnsureIngenicoReadyAsync(...)`
- `CancelPendingPaymentAsync(...)`

Referans:

- [MainViewModel](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/ViewModels/MainViewModel.cs#L316-L388)

### 2. Orkestrasyon Katmani

`IsolatedIngenicoPaymentService`, uygulama tarafinda kullanilan odeme servisidir.

Gorevleri:

- gerçek mod aciksa worker servisini cagirir
- kapaliysa mock servise duser
- iptal istegini worker servisine iletir

Referans:

- [IsolatedIngenicoPaymentService](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/IsolatedIngenicoPaymentService.cs#L8-L64)

### 3. Native Katman

`NativeIngenicoPaymentService`, DLL ile gercek haberlesmeyi yapan siniftir.

Gorevleri:

- interface olusturmak
- precheck yapmak
- pairing baslatmak
- fis acmak
- urunleri gondermek
- kart odemesi baslatmak
- mali fisi kapatmak
- acik islemi recover/iptal etmek

Referans:

- [NativeIngenicoPaymentService](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L16-L1422)

## Baglanti Ayarlari

Baglanti ayarlari `IngenicoSettings` uzerinden gelir.

Temel alanlar:

- `Enabled`
- `InterfaceId`
- `ConnectionMode`
- `IpAddress`
- `Port`
- `PortName`
- `BaudRate`
- `DefaultTimeoutMs`
- `CardTimeoutMs`
- `UseEchoHealthCheck`

Interface olusturma asamasinda bu bilgiler JSON'a cevrilip DLL'e verilir.

Ornek mantik:

```json
{
  "RetryCounter": 3,
  "IpRetryCount": 3,
  "AckTimeOut": 1000,
  "CommTimeOut": 30000,
  "InterCharacterTimeOut": 1000,
  "PortName": "COM1",
  "BaudRate": 115200,
  "IsTcpConnection": 1,
  "IP": "192.168.2.13",
  "Port": 9000,
  "IsTcpKeepAlive": 1
}
```

Bu veri `Json_FP3_CreateInterface` ve `Json_FP3_UpdateInterfaceXmlDataByID` cagrilarinda kullanilir.

Referans:

- [EnsureInterface](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L461-L528)

## Uygulama Acilisinda Precheck

Odeme ekranina gecmeden once sistem cihazin hazir olup olmadigini kontrol eder.

Akis:

1. native gereksinimler kontrol edilir
2. transport baglantisi test edilir
3. runtime konfigurasyonu uygulanir
4. interface handle alinur
5. gerekiyorsa `ECHO` atilir
6. `FP3_IsGmpPairingDone` ile pairing durumu sorulur

Referans:

- [RunPrecheckAsync](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L165-L241)

Onemli detay:

- bu entegrasyonda pairing durumu `FP3_IsGmpPairingDone` ile dogrulaniyor
- cihaz hazirsa `Ingenico ödeme için hazır` donuyor
- pairing gerekiyorsa UI tarafina `Pairing Baslat` akisi tasiniyor

## Pairing Akisi

Pairing `StartPairingAsync()` ile baslar.

Akis:

1. interface hazirlanir
2. gerekiyorsa `ECHO` yapilir
3. `Json_FP3_StartPairingInit` cagrilir
4. pairing sonrasi cihaz "warm-up" edilir
5. pairing sonrasinda acik handle var mi kontrol edilir

Referans:

- [StartPairingAsync](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L243-L273)
- [StartPairing](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L551-L589)
- [InitializePairingRuntimeState](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L591-L698)
- [CleanupDanglingTransactionAfterPairing](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L700-L712)

### Pairing Request Ornegi

Su an koddaki pairing istegi bu formatta uretiliyor:

```json
{
  "szProcOrderNumber": "000001",
  "szProcDate": "260413",
  "szProcTime": "153045",
  "szExternalDeviceBrand": "WORLDLINE",
  "szExternalDeviceModel": "IWE280",
  "szExternalDeviceSerialNumber": "12344567",
  "szEcrSerialNumber": "JHWE20000079"
}
```

Kod referansi:

- [StartPairing request](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L556-L568)

Not:

- pairing sonrasi cihaz hemen kullanima hazir olmayabiliyor
- bu nedenle vergi, departman ve kur profili gibi veriler warm-up amaciyla cekiliyor
- bu adim, pairing tamamlandi ama odeme baslamiyor tipindeki sorunlari azaltmak icin eklendi

### Warm-up Cagrilari

Pairing sonrasinda su cagrilar yapilir:

- `Json_FP3_GetTaxRates_Ex`
- `Json_FP3_GetDepartments_Ex`
- `Json_FP3_GetCurrencyProfile`

Bu cagrilarin amaci cihaz runtime state'ini doldurup ilk satis akisini stabil hale getirmektir.

## Odeme Akisi

Odeme akisi `Execute(...)` metodunda ilerler.

Referans:

- [Execute](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L275-L435)

Akis:

1. native ortam kontrol edilir
2. interface hazirlanir
3. gerekiyorsa precheck ve echo calisir
4. yeni transaction baslatilir
5. fis basligi acilir
6. option flag'ler ayarlanir
7. sepetteki urunler tek tek mali fis kalemine cevrilir
8. kart odemesi POS'a yonlendirilir
9. toplam ve odeme satirlari bastirilir
10. mali fis kapatilir

## Neden `FP3_Start` Kullaniliyor

Bu projede odeme baslatmak icin `FP3_StartEx` yerine `FP3_Start` kullaniliyor.

Sebep:

- `FP3_StartEx` ile bazi akislarda kart odemesi cihaza gitmiyordu
- `FP3_Start` daha stabil sonuc verdi
- ayrica `uniqueId` her denemede rastgele degil, interface bazli sabit mantikla tekrar kullaniliyor

Kod:

- [StartTransaction](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L714-L746)
- [GetTransactionUniqueId](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L748-L754)

Ornek cagrinin mantigi:

```csharp
var uniqueId = GetTransactionUniqueId(interfaceHandle);
var retcode = NativeMethods.FP3_Start(
    interfaceHandle,
    ref transactionHandle,
    0,
    uniqueId,
    uniqueId.Length,
    Array.Empty<byte>(),
    0,
    Array.Empty<byte>(),
    0,
    settings.DefaultTimeoutMs);
```

## Fis Kalemlerinin Gonderilmesi

Sepetteki her satir `CartItem` olarak gelir ve `Json_FP3_ItemSale` ile cihaza gonderilir.

Kod:

- [SendItem](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L756-L798)

Ornek mantik:

```json
{
  "type": 1,
  "deptIndex": 0,
  "unitType": 1,
  "amount": 1250,
  "currency": 949,
  "count": 1,
  "name": "Hamburger"
}
```

Not:

- `amount` minor unit olarak gider
- yani `12.50 TL` -> `1250`

## Kart Odemesinin Gonderilmesi

Kart odemesi `Json_FP3_Payment` ile baslatilir.

Kod:

- [SendPayment](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L800-L844)

Ornek odeme istegi:

```json
{
  "typeOfPayment": 4,
  "subtypeOfPayment": 1,
  "payAmount": 1250,
  "payAmountCurrencyCode": 949,
  "numberOfinstallments": 0,
  "paymentName": "Sipariş 123",
  "paymentInfo": "Müşteri No: 123",
  "LoyaltyCustomerId": "123"
}
```

Anlamlari:

- `typeOfPayment = 4`: banka karti / kart odemesi
- `subtypeOfPayment = 1`: satis
- `payAmount`: kurus cinsinden tutar
- `paymentName`, `paymentInfo`: fis ve cihazda gorunen aciklama alanlari

## UI Tarafinda Odeme Akisi

`MainViewModel` tarafinda odeme su sekilde ilerler:

1. sepetten `PaymentRequestContext` olusturulur
2. odeme ekrani acilir
3. `EnsureIngenicoReadyAsync(true, ...)` calisir
4. `paymentService.ProcessPaymentAsync(...)` cagrilir
5. basariliysa siparis kaydedilir ve basari ekranina gecilir
6. basarisizsa ayni context sakli kalir ve tekrar denenebilir

Referans:

- [ExecutePaymentAsync](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/ViewModels/MainViewModel.cs#L316-L360)
- [RetryPendingPayment](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/ViewModels/MainViewModel.cs#L362-L370)

## Tekrar Dene ve Iptal Davranisi

Bu projede onemli bir davranis farki vardir:

- odeme basarisiz olursa fis hemen otomatik iptal edilmez
- ayni acik odeme state'i ile tekrar deneme sansi korunur
- kullanici acikca iptal derse recovery/void akisi cagrilir

Bu mantik `activePaymentState` ile tutulur.

Odeme hata verirse:

- eger tekrar denenebilir durumdaysa `SaveActivePayment(...)` ile state saklanir
- bir sonraki denemede `TryResumeActivePayment(...)` ile ayni handle reuse edilir

Kullanici iptal ederse:

- `MainViewModel.CancelPendingPaymentAsync()`
- `IsolatedIngenicoPaymentService.CancelActivePaymentAsync()`
- `IsolatedIngenicoDiagnosticsService.CancelActivePaymentAsync()`
- `NativeIngenicoPaymentService.CancelActivePaymentAsync()`

Kod referanslari:

- [MainViewModel cancel](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/ViewModels/MainViewModel.cs#L372-L388)
- [IsolatedIngenicoPaymentService cancel](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/IsolatedIngenicoPaymentService.cs#L53-L63)
- [IsolatedIngenicoDiagnosticsService cancel](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/IsolatedIngenicoDiagnosticsService.cs#L73-L80)
- [NativeIngenicoPaymentService cancel](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L86-L117)

## Recovery ve Temizleme

Acik transaction temizligi icin `TryRecoverTransaction(...)` kullanilir.

Bu metodun amaci:

- yari kalmis transaction'i kapatmak
- acik handle birakmamak
- iptal edilen odemede cihazi tekrar temiz hale getirmek

Kod:

- [TryRecoverTransaction](file:///Users/selcukyilmaz/github/proje/kiosk/Kiosk.App/Services/NativeIngenicoPaymentService.cs#L1004-L1090)

Pairing sonrasinda ayrica `FP3_GetCurrentHandle` ile dangling handle aranir.

## Loglama

Tum onemli asamalar `IngenicoLogService` ile loglanir:

- baglanti ozeti
- interface olusturma
- echo sonucu
- pairing request ve response
- item sale request ve response
- payment request ve response
- error retcode'lari

Bu loglar hem hata ayiklamada hem de diger calisan uygulamalarin loglariyla karsilastirmada kullanilir.

## Ornek Uc Uctan Akis

### Senaryo 1: Uygulama Acildi

1. kiosk acilir
2. precheck calisir
3. cihaz hazirsa odeme butonu kullanilabilir
4. pairing gerekiyorsa pairing ekran akisi baslatilir

### Senaryo 2: Basarili Odeme

1. kullanici urunleri sepete ekler
2. `PaymentRequestContext` olusur
3. transaction baslar
4. item sale satirlari gider
5. `Json_FP3_Payment` calisir
6. kart cihaza yonlenir
7. mali fis kapanir
8. siparis kaydi olusur

### Senaryo 3: Odeme Basarisiz, Tekrar Dene

1. fis acilmistir
2. kart odemesi hata verir
3. transaction hemen iptal edilmez
4. active state saklanir
5. kullanici `tekrar dene` yapar
6. ayni bekleyen transaction yeniden kullanilir

### Senaryo 4: Kullanici Iptal Etti

1. acik odeme vardir
2. kullanici iptal eder
3. cancel akisi native servise iner
4. recover/temizleme yapilir
5. kiosk ana ekrana doner

## Dikkat Edilmesi Gerekenler

- `GMPSmartDLL.dll` ve `GMP.XML` ayni runtime klasorunde bulunmalidir
- entegrasyon sadece Windows tarafinda gercek modda calisir
- timeout degerleri cok agresif olursa sahada kopmalar artabilir
- pairing sonrasi warm-up adimlari atlanmamali
- transaction baslatmada `FP3_Start` kullanimi korunmali
- tutarlar minor unit mantigiyla gonderildigi icin `TL` ve `kurus` donusumlerine dikkat edilmelidir

## Gelistirme Onerileri

Ileride iyilestirme olarak dusunulebilir:

1. pairing request icindeki cihaz seri alanlarini ayarlardan okunur hale getirmek
2. native request/response icin ayri DTO siniflari ve log formatter eklemek
3. retcode bazli daha detayli operatör mesaji uretmek
4. test ortaminda replay edilebilir payment/pairing loglari eklemek

## Kisa Kod Ornekleri

### Precheck

```csharp
var precheck = await ingenicoDiagnosticsService.RunPrecheckAsync();
if (!precheck.IsReady && precheck.IsPairingRequired)
{
    var message = await ingenicoDiagnosticsService.StartPairingAsync();
}
```

### Odeme Baslatma

```csharp
var result = await paymentService.ProcessPaymentAsync(paymentContext, progress, CancellationToken.None);
if (!result.IsSuccess)
{
    // UI tarafinda tekrar dene veya iptal secenekleri acilir
}
```

### Iptal

```csharp
await paymentService.CancelActivePaymentAsync(new Progress<string>(msg =>
{
    PaymentProcessingViewModel.StatusMessage = msg;
}));
```

Bu proje icindeki gercek davranis yukaridaki katmanlarin birlikte calismasiyla saglanir.
