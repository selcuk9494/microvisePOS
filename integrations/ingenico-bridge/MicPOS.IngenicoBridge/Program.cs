using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Newtonsoft.Json;

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
NativeDllGuard.PinProcessDllSearchPathToAppBase();

var builder = WebApplication.CreateBuilder(args);
var skipOptionFlagsInSpeedMode = builder.Configuration.GetValue("Bridge:SkipOptionFlags", true);
var useMultipleCommandFinalize = builder.Configuration.GetValue("Bridge:UseMultipleCommandFinalize", false);
var enableCashFastPath = builder.Configuration.GetValue("Bridge:EnableCashFastPath", false);
GmpPaymentRuntime.Configure(skipOptionFlagsInSpeedMode, useMultipleCommandFinalize, enableCashFastPath);
var configuredUrls = builder.Configuration["ASPNETCORE_URLS"];
if (string.IsNullOrWhiteSpace(configuredUrls))
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new
{
    ok = true,
    service = "MicPOS Ingenico Bridge",
    dll = "GMPSmartDLL.dll",
    dllPath = NativeDllGuard.GetDllPath("GmpSmartDLL.dll"),
    dllVersion = NativeDllGuard.GetDllFileVersion("GmpSmartDLL.dll"),
    dllSha256 = NativeDllGuard.GetDllSha256("GmpSmartDLL.dll"),
    skipOptionFlagsInSpeedMode,
    useMultipleCommandFinalize,
    enableCashFastPath,
    timestamp = DateTimeOffset.UtcNow
}));

app.MapPost("/precheck", (PrecheckRequest request) =>
{
    var logs = new List<string>();

    try
    {
        using var session = IngenicoSession.Open(request.Terminal, logs);

        var echo = GmpRuntime.RunEcho(session.Handle, request.Terminal.DefaultTimeoutMs);
        var pairingCode = GmpNative.FP3_IsGmpPairingDone(session.Handle);
        logs.Add($"Json_FP3_Echo retcode={echo.Retcode}");
        logs.Add($"FP3_IsGmpPairingDone retcode={pairingCode}");

        return Results.Ok(new BridgeEnvelope<object>(true, new
        {
            ready = echo.Retcode == 0,
            pairingRequired = pairingCode != 1,
            connectionSummary = session.ConnectionSummary,
            message = echo.Retcode == 0
                ? "Terminal echo cevabi verdi."
                : $"Echo basarisiz. retcode={echo.Retcode}",
            logs
        }));
    }
    catch (Exception exception)
    {
        var message = GmpRuntime.FormatException(exception);
        logs.Add(message);
        return Results.Json(new BridgeEnvelope<object>(false, null, message), statusCode: 400);
    }
});

app.MapPost("/pairing", (PairingRequest request) =>
{
    var logs = new List<string>();

    try
    {
        using var session = IngenicoSession.Open(request.Terminal, logs);
        var pairingDoneCode = GmpNative.FP3_IsGmpPairingDone(session.Handle);
        logs.Add($"FP3_IsGmpPairingDone retcode before pairing={pairingDoneCode}");
        if (pairingDoneCode == 1)
        {
            return Results.Ok(new BridgeEnvelope<object>(true, new
            {
                ok = true,
                message = "Terminal zaten pairli, pairing cagrisi atlandi.",
                responseSummary = "already-paired",
                logs
            }));
        }

        var pairingPayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            szProcOrderNumber = "000001",
            szProcDate = DateTime.Now.ToString("yyMMdd"),
            szProcTime = DateTime.Now.ToString("HHmmss"),
            szExternalDeviceBrand = request.Terminal.ExternalDeviceBrand,
            szExternalDeviceModel = request.Terminal.ExternalDeviceModel,
            szExternalDeviceSerialNumber = request.Terminal.SerialNumber,
            szEcrSerialNumber = request.Terminal.EcrSerialNumber
        });

        var responseBuffer = new byte[4096];
        var result = GmpNative.Json_FP3_StartPairingInit(
            session.Handle,
            GmpRuntime.ToNativeBytes(pairingPayload),
            responseBuffer,
            responseBuffer.Length);

        var responseText = GmpRuntime.FromNativeBytes(responseBuffer);
        logs.Add($"Json_FP3_StartPairingInit retcode={result}");

        if (result == 0)
        {
            GmpPaymentRuntime.CleanupDanglingTransactionAfterPairing(session.Handle, request.Terminal.DefaultTimeoutMs, logs);
        }

        return Results.Ok(new BridgeEnvelope<object>(true, new
        {
            ok = result == 0,
            message = result == 0 ? "Pairing komutu gonderildi." : $"Pairing retcode={result}",
            responseSummary = responseText,
            logs
        }));
    }
    catch (Exception exception)
    {
        var message = GmpRuntime.FormatException(exception);
        logs.Add(message);
        return Results.Json(new BridgeEnvelope<object>(false, null, message), statusCode: 400);
    }
});

app.MapPost("/payment", (PaymentBridgeRequest request) =>
{
    var logs = new List<string>();
    var requestStopwatch = Stopwatch.StartNew();

    if (request.Terminal.UseMock || builder.Configuration.GetValue("Bridge:UseMockPayments", false))
    {
        logs.Add("Bridge mock payment onayi dondu.");
        return Results.Ok(new BridgeEnvelope<object>(true, new
        {
            status = "approved",
            approvalCode = "BRG001",
            referenceNumber = $"RRN{DateTime.UtcNow:HHmmss}",
            maskedPan = "5549********1122",
            batchNumber = "BRIDGE",
            responsePayload = new { state = "mock-approved", paymentId = request.Payment.PaymentId },
            logs
        }));
    }

    try
    {
        using var session = IngenicoSession.Open(request.Terminal, logs);
        var result = GmpPaymentRuntime.RunPayment(session.Handle, request.Terminal, request.Payment, logs);
        requestStopwatch.Stop();
        logs.Add($"/payment toplam sure={requestStopwatch.ElapsedMilliseconds}ms");
        BridgeConsole.Write(logs);

        return Results.Ok(new BridgeEnvelope<object>(true, new
        {
            status = result.Status,
            approvalCode = result.ApprovalCode,
            referenceNumber = result.ReferenceNumber,
            maskedPan = result.MaskedPan,
            batchNumber = result.BatchNumber,
            errorCode = result.ErrorCode,
            errorMessage = result.ErrorMessage,
            responsePayload = result.ResponsePayload,
            logs
        }));
    }
    catch (Exception exception)
    {
        var message = GmpRuntime.FormatException(exception);
        logs.Add(message);
        requestStopwatch.Stop();
        logs.Add($"/payment toplam sure={requestStopwatch.ElapsedMilliseconds}ms");
        BridgeConsole.Write(logs);
        return Results.Json(new BridgeEnvelope<object>(false, null, message), statusCode: 400);
    }
});

app.MapPost("/cancel", (CancelBridgeRequest request) =>
{
    var logs = new List<string>();

    try
    {
        var cancelled = GmpPaymentRuntime.CancelStoredActivePayment(request.Payment.PaymentId, logs);

        return Results.Ok(new BridgeEnvelope<object>(true, new
        {
            ok = cancelled,
            errorCode = cancelled ? "" : "2420",
            errorMessage = cancelled ? "" : "Bekleyen Ingenico islemi bulunamadi.",
            responsePayload = new
            {
                state = cancelled ? "cancelled-active-payment" : "cancel-noop",
                paymentId = request.Payment.PaymentId
            },
            logs
        }));
    }
    catch (Exception exception)
    {
        var message = GmpRuntime.FormatException(exception);
        logs.Add(message);
        BridgeConsole.Write(logs);
        return Results.Json(new BridgeEnvelope<object>(false, null, message), statusCode: 400);
    }
});

app.Run();

sealed record BridgeEnvelope<T>(bool Ok, T? Data, string? Message = null);

sealed class PrecheckRequest
{
    public required BridgeTerminal Terminal { get; init; }
}

sealed class PairingRequest
{
    public required BridgeTerminal Terminal { get; init; }
}

sealed class PaymentBridgeRequest
{
    public required BridgeTerminal Terminal { get; init; }
    public required BridgePayment Payment { get; init; }
}

sealed class CancelBridgeRequest
{
    public required BridgeTerminal Terminal { get; init; }
    public required CancelPayment Payment { get; init; }
}

sealed class BridgeTerminal
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Brand { get; init; }
    public required string Model { get; init; }
    public required string InterfaceId { get; init; }
    public required string ConnectionMode { get; init; }
    public required string IpAddress { get; init; }
    public required int Port { get; init; }
    public required string PortName { get; init; }
    public required int BaudRate { get; init; }
    public required int DefaultTimeoutMs { get; init; }
    public required int CardTimeoutMs { get; init; }
    public required string SerialNumber { get; init; }
    public required string EcrSerialNumber { get; init; }
    public required string ExternalDeviceBrand { get; init; }
    public required string ExternalDeviceModel { get; init; }
    public bool UseMock { get; init; }
}

sealed class BridgePayment
{
    public required string PaymentId { get; init; }
    public required string OrderId { get; init; }
    public required int Amount { get; init; }
    public string Method { get; init; } = "kart";
    public List<BridgePaymentItem> Items { get; init; } = [];
    public required string PaymentName { get; init; }
    public required string PaymentInfo { get; init; }
}

sealed class BridgePaymentItem
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public int Qty { get; init; }
    public int Price { get; init; }
    public string? Note { get; init; }
}

sealed class CancelPayment
{
    public required string PaymentId { get; init; }
    public required string OrderId { get; init; }
    public required int Amount { get; init; }
    public string ReferenceNumber { get; init; } = "";
    public string ApprovalCode { get; init; } = "";
}

sealed class NativePromotion
{
    public byte type { get; set; }
    public int amount { get; set; }
    public string ticketMsg { get; set; } = string.Empty;
}

sealed class NativeItem
{
    public byte type { get; set; }
    public byte subType { get; set; }
    public byte deptIndex { get; set; }
    public byte unitType { get; set; }
    public uint amount { get; set; }
    public ushort currency { get; set; }
    public uint count { get; set; }
    public uint flag { get; set; }
    public byte countPrecition { get; set; }
    public byte pluPriceIndex { get; set; }
    public string name { get; set; } = string.Empty;
    public string barcode { get; set; } = string.Empty;
    public string firm { get; set; } = string.Empty;
    public string invoiceNo { get; set; } = string.Empty;
    public string subscriberId { get; set; } = string.Empty;
    public string tckno { get; set; } = string.Empty;
    public uint Reserved { get; set; }
    public string szDate { get; set; } = string.Empty;
    public NativePromotion promotion { get; set; } = new();
    public ushort OnlineInvoiceItemExceptionCode { get; set; }
}

sealed class NativeOriginalPaymentData
{
    public uint TransactionAmount { get; set; }
    public uint LoyaltyAmount { get; set; }
    public ushort NumberOfinstallments { get; set; }
    public byte[] AuthorizationCode { get; set; } = new byte[6];
    public byte[] rrn { get; set; } = new byte[12];
    public byte[] TransactionDate { get; set; } = new byte[5];
    public byte[] MerchantId { get; set; } = new byte[15];
    public byte TransactionType { get; set; }
    public byte[] referenceCodeOfTransaction { get; set; } = new byte[16];
}

sealed class NativePaymentRequest
{
    public ulong typeOfPayment { get; set; }
    public uint subtypeOfPayment { get; set; }
    public uint payAmount { get; set; }
    public uint payAmountBonus { get; set; }
    public ushort payAmountCurrencyCode { get; set; }
    public ushort bankBkmId { get; set; }
    public ushort numberOfinstallments { get; set; }
    public byte[] terminalId { get; set; } = new byte[8];
    public string BankPaymentUniqueId { get; set; } = string.Empty;
    public NativeOriginalPaymentData OrgTransData { get; set; } = new();
    public uint batchNo { get; set; }
    public uint stanNo { get; set; }
    public ushort rawDataLen { get; set; }
    public byte[] rawData { get; set; } = new byte[512];
    public string paymentName { get; set; } = string.Empty;
    public string paymentInfo { get; set; } = string.Empty;
    public uint transactionFlag { get; set; }
    public uint flags { get; set; }
    public string LoyaltyCustomerId { get; set; } = string.Empty;
    public string PaymentProvisionId { get; set; } = string.Empty;
    public ushort LoyaltyServiceId { get; set; }
    public byte AllowedInput { get; set; }
}

sealed class IngenicoSession : IDisposable
{
    private static readonly Dictionary<string, string> LastInterfacePayloadById = new();
    private static readonly object InterfacePayloadSync = new();

    public uint Handle { get; }
    public string ConnectionSummary { get; }

    private IngenicoSession(uint handle, string connectionSummary)
    {
        Handle = handle;
        ConnectionSummary = connectionSummary;
    }

    public static IngenicoSession Open(BridgeTerminal terminal, IList<string> logs)
    {
        return OpenInternal(terminal, logs, forceRecreate: false, previousHandle: 0);
    }

    public static IngenicoSession Reopen(BridgeTerminal terminal, uint previousHandle, IList<string> logs)
    {
        return OpenInternal(terminal, logs, forceRecreate: true, previousHandle);
    }

    private static IngenicoSession OpenInternal(BridgeTerminal terminal, IList<string> logs, bool forceRecreate, uint previousHandle)
    {
        var interfaceId = string.IsNullOrWhiteSpace(terminal.InterfaceId) ? "COM1" : terminal.InterfaceId.Trim();
        var interfacePayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            // Kiosk profiline yakin, daha hizli baglanti denemesi.
            RetryCounter = 1,
            IpRetryCount = 1,
            AckTimeOut = 300,
            CommTimeOut = terminal.DefaultTimeoutMs,
            InterCharacterTimeOut = 100,
            PortName = terminal.PortName,
            BaudRate = terminal.BaudRate,
            ByteSize = 8,
            fParity = 0,
            Parity = 0,
            StopBit = 0,
            IsTcpConnection = terminal.ConnectionMode == "ethernet" ? 1 : 0,
            IP = terminal.IpAddress,
            Port = terminal.Port,
            IsTcpKeepAlive = terminal.ConnectionMode == "ethernet" ? 1 : 0
        });

        var interfaceBytes = GmpRuntime.ToNativeBytes(interfacePayload);
        var idBytes = GmpRuntime.ToNativeBytes(interfaceId);

        uint handle = 0;
        if (forceRecreate)
        {
            if (previousHandle != 0)
            {
                try
                {
                    var removeRetcode = GmpNative.FP3_RemoveInterfaceByHandle(previousHandle);
                    logs.Add($"FP3_RemoveInterfaceByHandle retcode={removeRetcode}");
                }
                catch (Exception exception)
                {
                    logs.Add($"FP3_RemoveInterfaceByHandle hatasi: {exception.Message}");
                }
            }

            try
            {
                var closeByIdRetcode = GmpNative.FP3_CloseInterfaceByID(idBytes);
                logs.Add($"FP3_CloseInterfaceByID retcode={closeByIdRetcode}");
            }
            catch (Exception exception)
            {
                logs.Add($"FP3_CloseInterfaceByID hatasi: {exception.Message}");
            }
        }

        var handleResult = GmpNative.FP3_GetInterfaceHandleByID(ref handle, idBytes);
        logs.Add($"FP3_GetInterfaceHandleByID retcode={handleResult}");

        if (handle == 0)
        {
            try
            {
                var closeByIdRetcode = GmpNative.FP3_CloseInterfaceByID(idBytes);
                logs.Add($"FP3_CloseInterfaceByID retcode before create={closeByIdRetcode}");
            }
            catch (Exception exception)
            {
                logs.Add($"FP3_CloseInterfaceByID hatasi before create={exception.Message}");
            }

            var createResult = GmpNative.Json_FP3_CreateInterface(ref handle, idBytes, 1, interfaceBytes);
            logs.Add($"Json_FP3_CreateInterface retcode={createResult}");
            GmpRuntime.ThrowIfError(createResult, "Interface olusturulamadi", logs);
        }

        bool shouldUpdateInterface;
        lock (InterfacePayloadSync)
        {
            shouldUpdateInterface = !LastInterfacePayloadById.TryGetValue(interfaceId, out var lastPayload) || lastPayload != interfacePayload;
        }

        if (shouldUpdateInterface)
        {
            var updateResult = GmpNative.Json_FP3_UpdateInterfaceXmlDataByID(idBytes, interfaceBytes);
            logs.Add($"Json_FP3_UpdateInterfaceXmlDataByID retcode={updateResult}");
            GmpRuntime.ThrowIfError(updateResult, "Interface guncellenemedi", logs);
            lock (InterfacePayloadSync)
            {
                LastInterfacePayloadById[interfaceId] = interfacePayload;
            }
        }
        else
        {
            logs.Add("Json_FP3_UpdateInterfaceXmlDataByID atlandi (ayni payload).");
        }

        if (handle == 0)
        {
            throw new InvalidOperationException("Interface handle olusmadi.");
        }

        return new IngenicoSession(handle, terminal.ConnectionMode == "ethernet"
            ? $"TCP {terminal.IpAddress}:{terminal.Port}"
            : $"SERIAL {terminal.PortName} @ {terminal.BaudRate}");
    }

    public void Dispose()
    {
        // Interface'i istek sonunda dusurmuyoruz; pairing durumu ayni bridge prosesi
        // boyunca korunabilsin ve odeme istegi yeni bir handle ile baslamasin.
    }
}

sealed class BridgeNativePaymentResult
{
    public string Status { get; init; } = "approved";
    public string ApprovalCode { get; init; } = "";
    public string ReferenceNumber { get; init; } = "";
    public string MaskedPan { get; init; } = "";
    public string BatchNumber { get; init; } = "";
    public string ErrorCode { get; init; } = "";
    public string ErrorMessage { get; init; } = "";
    public object ResponsePayload { get; init; } = new { };
}

sealed class ActiveBridgePaymentState
{
    public required uint InterfaceHandle { get; init; }
    public required ulong TransactionHandle { get; init; }
    public required string PaymentId { get; init; }
    public required string OrderId { get; init; }
    public required int Amount { get; init; }
    public required string Method { get; init; }
}

static class GmpPaymentRuntime
{
    private static readonly object TransactionSync = new();
    private static readonly object PairingCheckSync = new();
    private static readonly object CashFastPathSync = new();
    private static readonly SemaphoreSlim PaymentExecutionLock = new(1, 1);
    private static readonly Dictionary<string, DateTimeOffset> PairingCheckCacheByInterface = new();
    private static readonly Dictionary<string, DateTimeOffset> CashFastPathBlockedUntilByInterface = new();
    private static ActiveBridgePaymentState? ActivePaymentState;
    private static volatile bool SkipOptionFlagsInSpeedMode;
    private static volatile bool UseMultipleCommandFinalize;
    private static volatile bool EnableCashFastPath;
    private const uint AppErrAlreadyDone = 2080;
    private const uint AppErrNotAllowed = 2064;
    private const uint DllRetcodePairingRequired = 61472;
    private const int TicketTypeProcessSale = 1;
    private const ulong EchoOptions = 0x00000007;
    private const ulong PaymentCashTl = 0x0000000000000001;
    private const ulong PaymentBankCard = 0x0000000000000004;
    private const uint PaymentSubtypeSale = 0x00000001;
    private const uint PaymentTransactionFlagKiosk = 2148007936;
    private const byte ItemTypeSaleInfo = 2;
    private const byte ItemUnitNumber = 1;
    private const uint ItemFlagSaleInfo = 8192;
    private const ushort CurrencyCodeTry = 949;
    private const byte TransactionStatusReserved = 2;
    private const int StandardBufferSize = 50000;
    private const int TicketBufferSize = 200000;
    private static readonly TimeSpan PairingCheckCacheTtl = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan CashFastPathBlockTtl = TimeSpan.FromMinutes(10);

    public static void Configure(bool skipOptionFlagsInSpeedMode, bool useMultipleCommandFinalize, bool enableCashFastPath)
    {
        SkipOptionFlagsInSpeedMode = skipOptionFlagsInSpeedMode;
        UseMultipleCommandFinalize = useMultipleCommandFinalize;
        EnableCashFastPath = enableCashFastPath;
    }

    public static BridgeNativePaymentResult RunPayment(uint interfaceHandle, BridgeTerminal terminal, BridgePayment payment, IList<string> logs)
    {
        PaymentExecutionLock.Wait();
        try
        {
        var runStopwatch = Stopwatch.StartNew();
        var resumedState = TryResumeActivePayment(payment, logs);
        ulong transactionHandle = resumedState?.TransactionHandle ?? 0;
        var canResumePaymentAfterFailure = resumedState is not null;
        var isCashPayment = string.Equals(payment.Method, "nakit", StringComparison.OrdinalIgnoreCase);
        var usedCashFastPath = false;
        var cashFastPathFailed = false;
        var cashFastPathKey = string.IsNullOrWhiteSpace(terminal.InterfaceId)
            ? interfaceHandle.ToString()
            : terminal.InterfaceId.Trim().ToUpperInvariant();

        try
        {
            if (resumedState is not null)
            {
                logs.Add($"Bekleyen Ingenico odemesi yeniden kullaniliyor. PaymentId={payment.PaymentId} Handle={transactionHandle}");
                interfaceHandle = resumedState.InterfaceHandle;
                logs.Add("Bekleyen odeme bulundu, pairing kontrolu bu denemede atlandi.");
            }
            else
            {
                var pairingStopwatch = Stopwatch.StartNew();
                EnsurePairingFast(interfaceHandle, terminal.InterfaceId, logs);
                pairingStopwatch.Stop();
                logs.Add($"Pairing kontrol sure={pairingStopwatch.ElapsedMilliseconds}ms");
                if (HasStoredActivePayment())
                {
                    logs.Add("Bekleyen bir Ingenico islemi bulundu. Otomatik iptal yapilmadi.");
                    throw new InvalidOperationException("Bekleyen Ingenico islemi var. Fis Iptal butonunu kullanin.");
                }
                WarmupDeviceRuntime(interfaceHandle, logs);
                var startStopwatch = Stopwatch.StartNew();
                interfaceHandle = StartTransaction(interfaceHandle, terminal, ref transactionHandle, terminal.DefaultTimeoutMs, logs);
                startStopwatch.Stop();
                logs.Add($"FP3_Start+handle sure={startStopwatch.ElapsedMilliseconds}ms");

                var cashFastPathEnabled = isCashPayment && EnableCashFastPath;
                lock (CashFastPathSync)
                {
                    if (CashFastPathBlockedUntilByInterface.TryGetValue(cashFastPathKey, out var blockedUntil))
                    {
                        if (DateTimeOffset.UtcNow < blockedUntil)
                        {
                            cashFastPathEnabled = false;
                            var remainingSeconds = (int)Math.Ceiling((blockedUntil - DateTimeOffset.UtcNow).TotalSeconds);
                            logs.Add($"Nakit hizli akis bu interface icin gecici devre disi (kalan {remainingSeconds}s).");
                        }
                        else
                        {
                            CashFastPathBlockedUntilByInterface.Remove(cashFastPathKey);
                        }
                    }
                }

                if (cashFastPathEnabled)
                {
                    usedCashFastPath = true;
                    logs.Add("Nakit hizli akis aktif: TicketHeader+ItemSale ilk adimda atlandi.");
                }
                else
                {
                    if (isCashPayment)
                    {
                        if (!EnableCashFastPath)
                        {
                            logs.Add("Nakit hizli akis konfigurasyonda devre disi.");
                        }
                        else
                        {
                            logs.Add("Nakit hizli akis bu denemede devre disi.");
                        }
                    }
                    var items = GetItems(payment).ToArray();
                    var itemsStopwatch = Stopwatch.StartNew();
                    SendItemsWithLazyTicketSetup(interfaceHandle, transactionHandle, items, terminal.DefaultTimeoutMs, logs);
                    itemsStopwatch.Stop();
                    logs.Add($"ItemSale toplam sure={itemsStopwatch.ElapsedMilliseconds}ms");
                }

                canResumePaymentAfterFailure = true;
            }

            var paymentStopwatch = Stopwatch.StartNew();
            string paymentResponseText;
            try
            {
                paymentResponseText = SendPayment(interfaceHandle, transactionHandle, terminal, payment, logs);
            }
            catch (Exception paymentException) when (usedCashFastPath)
            {
                cashFastPathFailed = true;
                lock (CashFastPathSync)
                {
                    CashFastPathBlockedUntilByInterface[cashFastPathKey] = DateTimeOffset.UtcNow.Add(CashFastPathBlockTtl);
                }
                logs.Add($"Nakit hizli akis odeme adiminda basarisiz: {paymentException.Message}");
                logs.Add("Klasik TicketHeader+ItemSale akisina fallback yapiliyor.");
                var items = GetItems(payment).ToArray();
                var fallbackItemsStopwatch = Stopwatch.StartNew();
                SendItemsWithLazyTicketSetup(interfaceHandle, transactionHandle, items, terminal.DefaultTimeoutMs, logs);
                fallbackItemsStopwatch.Stop();
                logs.Add($"ItemSale fallback sure={fallbackItemsStopwatch.ElapsedMilliseconds}ms");
                paymentResponseText = SendPayment(interfaceHandle, transactionHandle, terminal, payment, logs);
            }
            if (usedCashFastPath)
            {
                if (cashFastPathFailed)
                {
                    logs.Add($"Nakit hizli akis bu interface icin {CashFastPathBlockTtl.TotalMinutes} dakika bloklandi.");
                }
                else
                {
                    lock (CashFastPathSync)
                    {
                        CashFastPathBlockedUntilByInterface.Remove(cashFastPathKey);
                    }
                    logs.Add("Nakit hizli akis basarili tamamlandi.");
                }
            }
            paymentStopwatch.Stop();
            logs.Add($"Json_FP3_Payment sure={paymentStopwatch.ElapsedMilliseconds}ms");
            NativeClose closeResult = new();
            var finalizeStopwatch = Stopwatch.StartNew();
            var finalizedWithPrintChain = TryFinalizeWithMultipleCommand(interfaceHandle, ref transactionHandle, terminal.DefaultTimeoutMs, logs)
                || TryFinalizeWithPrintChain(interfaceHandle, transactionHandle, terminal.DefaultTimeoutMs, logs);
            finalizeStopwatch.Stop();
            logs.Add($"Finalize toplam sure={finalizeStopwatch.ElapsedMilliseconds}ms");
            if (!finalizedWithPrintChain)
            {
                try
                {
                    closeResult = CloseTransaction(interfaceHandle, transactionHandle, terminal.DefaultTimeoutMs, logs);
                }
                catch (Exception closeException)
                {
                    // Payment success alindiktan sonra close hatasi alinabilir.
                    // Bu durumda islemi pending'e dusurmek yerine approved don.
                    logs.Add($"Close hatasi non-fatal kabul edildi: {closeException.Message}");
                    _ = TryClose(interfaceHandle, transactionHandle, terminal.DefaultTimeoutMs, logs);
                }
            }
            else
            {
                logs.Add("Print+MF finalize adimi tamamlandi.");
                var postFinalizeCloseRetcode = TryClose(interfaceHandle, transactionHandle, terminal.DefaultTimeoutMs, logs);
                logs.Add($"Post-finalize TryClose retcode={postFinalizeCloseRetcode}");
            }
            ClearActivePayment();
            runStopwatch.Stop();
            logs.Add($"RunPayment toplam sure={runStopwatch.ElapsedMilliseconds}ms");

            return new BridgeNativePaymentResult
            {
                Status = "approved",
                ApprovalCode = "",
                ReferenceNumber = closeResult.FisNo > 0 ? $"FIS-{closeResult.FisNo}" : payment.OrderId,
                MaskedPan = "",
                BatchNumber = closeResult.ZNo > 0 ? closeResult.ZNo.ToString() : "",
                ResponsePayload = new
                {
                    state = "native-approved",
                    paymentId = payment.PaymentId,
                    method = payment.Method,
                    paymentResponse = paymentResponseText,
                    close = closeResult
                }
            };
        }
        catch (Exception exception)
        {
            if (transactionHandle != 0 && canResumePaymentAfterFailure)
            {
                SaveActivePayment(interfaceHandle, transactionHandle, payment, logs);
                runStopwatch.Stop();
                logs.Add($"RunPayment toplam sure={runStopwatch.ElapsedMilliseconds}ms");
                return new BridgeNativePaymentResult
                {
                    Status = "pending",
                    ErrorCode = "PENDING_RETRY",
                    ErrorMessage = exception.Message,
                    ResponsePayload = new
                    {
                        state = "native-pending",
                        paymentId = payment.PaymentId,
                        orderId = payment.OrderId,
                        transactionHandle,
                        message = exception.Message
                    }
                };
            }

            TryRecoverTransaction(interfaceHandle, transactionHandle, terminal.DefaultTimeoutMs, logs);
            ClearActivePayment();
            runStopwatch.Stop();
            logs.Add($"RunPayment toplam sure={runStopwatch.ElapsedMilliseconds}ms");
            throw;
        }
        }
        finally
        {
            PaymentExecutionLock.Release();
        }
    }

    private static ActiveBridgePaymentState? TryResumeActivePayment(BridgePayment payment, IList<string> logs)
    {
        lock (TransactionSync)
        {
            if (ActivePaymentState is null)
            {
                return null;
            }

            if (ActivePaymentState.Amount != payment.Amount)
            {
                logs.Add("Bekleyen odeme baska isleme ait oldugu icin yeniden kullanilmadi.");
                return null;
            }

            if (!string.Equals(ActivePaymentState.OrderId, payment.OrderId, StringComparison.Ordinal))
            {
                logs.Add($"Bekleyen odeme ayni tutar ile yeniden kullaniliyor. OncekiOrderId={ActivePaymentState.OrderId} YeniOrderId={payment.OrderId}");
            }

            return ActivePaymentState;
        }
    }

    private static void EnsurePairingFast(uint interfaceHandle, string interfaceId, IList<string> logs)
    {
        var pairingKey = string.IsNullOrWhiteSpace(interfaceId) ? interfaceHandle.ToString() : interfaceId.Trim().ToUpperInvariant();
        var now = DateTimeOffset.UtcNow;
        lock (PairingCheckSync)
        {
            if (PairingCheckCacheByInterface.TryGetValue(pairingKey, out var checkedAt) &&
                now - checkedAt < PairingCheckCacheTtl)
            {
                logs.Add("FP3_IsGmpPairingDone atlandi (cache hit).");
                return;
            }
        }

        var pairingCode = GmpNative.FP3_IsGmpPairingDone(interfaceHandle);
        logs.Add($"FP3_IsGmpPairingDone retcode before payment={pairingCode}");
        if (pairingCode != 1)
        {
            lock (PairingCheckSync)
            {
                PairingCheckCacheByInterface.Remove(pairingKey);
            }
            throw new InvalidOperationException($"Terminal pairing gerekli. retcode={pairingCode}");
        }

        lock (PairingCheckSync)
        {
            PairingCheckCacheByInterface[pairingKey] = now;
        }
    }

    private static void SaveActivePayment(uint interfaceHandle, ulong transactionHandle, BridgePayment payment, IList<string> logs)
    {
        lock (TransactionSync)
        {
            ActivePaymentState = new ActiveBridgePaymentState
            {
                InterfaceHandle = interfaceHandle,
                TransactionHandle = transactionHandle,
                PaymentId = payment.PaymentId,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                Method = payment.Method
            };
        }

        logs.Add($"Bekleyen Ingenico odemesi saklandi. PaymentId={payment.PaymentId} Handle={transactionHandle}");
    }

    private static void ClearActivePayment()
    {
        lock (TransactionSync)
        {
            ActivePaymentState = null;
        }
    }

    private static bool HasStoredActivePayment()
    {
        lock (TransactionSync)
        {
            return ActivePaymentState is not null;
        }
    }

    public static bool CancelStoredActivePayment(string paymentId, IList<string> logs)
    {
        ActiveBridgePaymentState? state;

        lock (TransactionSync)
        {
            state = ActivePaymentState;
            if (state is null)
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(paymentId) && !string.Equals(state.PaymentId, paymentId, StringComparison.Ordinal))
            {
                logs.Add($"Bekleyen odeme bulundu ama paymentId uyusmadi. Beklenen={state.PaymentId} Gelen={paymentId}");
                return false;
            }

            ActivePaymentState = null;
        }

        logs.Add($"Bekleyen Ingenico islemi iptal ediliyor. PaymentId={state.PaymentId} Handle={state.TransactionHandle}");
        TryRecoverTransaction(state.InterfaceHandle, state.TransactionHandle, 60000, logs);
        return true;
    }

    public static void CancelStoredActivePaymentIfAny(IList<string> logs)
    {
        lock (TransactionSync)
        {
            if (ActivePaymentState is null)
            {
                return;
            }
        }

        _ = CancelStoredActivePayment("", logs);
    }

    private static IEnumerable<BridgePaymentItem> GetItems(BridgePayment payment)
    {
        // Hiz icin urun satirlarini tek bir toplam satira indiriyoruz.
        // Cok satirli ItemSale akisi terminale gonderim suresini hissedilir sekilde uzatiyor.
        int totalAmount = Convert.ToInt32(payment.Amount);
        if (totalAmount <= 0 && payment.Items.Count > 0)
        {
            totalAmount = Convert.ToInt32(payment.Items.Sum(item => item.Price * item.Qty));
        }

        return
        [
            new BridgePaymentItem
            {
                Id = 0,
                Name = string.IsNullOrWhiteSpace(payment.PaymentName) ? "Adisyon" : payment.PaymentName,
                Qty = 1,
                Price = totalAmount
            }
        ];
    }

    private static System.Collections.Concurrent.ConcurrentDictionary<uint, byte[]> transactionUniqueIds = new();

    private static byte[] GetTransactionUniqueId(uint interfaceHandle)
    {
        var uniqueId = transactionUniqueIds.GetOrAdd(interfaceHandle, _ => new byte[24]);
        var copy = new byte[24];
        Buffer.BlockCopy(uniqueId, 0, copy, 0, copy.Length);
        return copy;
    }

    private static uint StartTransaction(uint interfaceHandle, BridgeTerminal terminal, ref ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        var uniqueId = GetTransactionUniqueId(interfaceHandle);
        var retcode = GmpNative.FP3_Start(
            interfaceHandle,
            ref transactionHandle,
            0,
            uniqueId,
            uniqueId.Length,
            Array.Empty<byte>(),
            0,
            Array.Empty<byte>(),
            0,
            timeoutMs);
        logs.Add($"FP3_Start retcode={retcode}");
        if (retcode == AppErrAlreadyDone)
        {
            logs.Add("APP_ERR_ALREADY_DONE algilandi, acik islemler temizlenip tekrar denenecek.");
            CancelStoredActivePaymentIfAny(logs);
            CleanupDanglingTransactionAfterPairing(interfaceHandle, timeoutMs, logs);
            CleanupReservedTransactions(interfaceHandle, timeoutMs, logs);
            retcode = GmpNative.FP3_Start(
                interfaceHandle,
                ref transactionHandle,
                0,
                uniqueId,
                uniqueId.Length,
                Array.Empty<byte>(),
                0,
                Array.Empty<byte>(),
                0,
                timeoutMs);
            logs.Add($"FP3_Start ikinci deneme (ayni interface) retcode={retcode}");
        }

        if (retcode == AppErrAlreadyDone)
        {
            throw new InvalidOperationException("Cihazda bekleyen islem var (2080). Mevcut bekleyen odeme ayni adisyon/tutar/yontem ile tekrar denenmeli.");
        }

        if (retcode == DllRetcodePairingRequired)
        {
            throw new InvalidOperationException("Pairing gerekli (61472). Otomatik recovery devre disi birakildi; /pairing endpoint'i ile eslesme yenileyin.");
        }

        GmpRuntime.ThrowIfError(retcode, "Fis islemi baslatilamadi", logs);
        return interfaceHandle;
    }

    private static void TryPairingRecovery(uint interfaceHandle, BridgeTerminal terminal, int timeoutMs, IList<string> logs)
    {
        try
        {
            var pairingPayload = System.Text.Json.JsonSerializer.Serialize(new
            {
                szProcOrderNumber = "000001",
                szProcDate = DateTime.Now.ToString("yyMMdd"),
                szProcTime = DateTime.Now.ToString("HHmmss"),
                szExternalDeviceBrand = terminal.ExternalDeviceBrand,
                szExternalDeviceModel = terminal.ExternalDeviceModel,
                szExternalDeviceSerialNumber = terminal.SerialNumber,
                szEcrSerialNumber = terminal.EcrSerialNumber
            });

            var responseBuffer = new byte[4096];
            var pairingRetcode = GmpNative.Json_FP3_StartPairingInit(
                interfaceHandle,
                GmpRuntime.ToNativeBytes(pairingPayload),
                responseBuffer,
                responseBuffer.Length);
            logs.Add($"Json_FP3_StartPairingInit (recovery) retcode={pairingRetcode}");
            logs.Add($"Json_FP3_StartPairingInit (recovery) response={GmpRuntime.FromNativeBytes(responseBuffer)}");
            if (pairingRetcode == 0)
            {
                CleanupDanglingTransactionAfterPairing(interfaceHandle, timeoutMs, logs);
                CleanupReservedTransactions(interfaceHandle, timeoutMs, logs);
            }

            var pairingDoneCode = GmpNative.FP3_IsGmpPairingDone(interfaceHandle);
            logs.Add($"FP3_IsGmpPairingDone retcode after recovery={pairingDoneCode}");
        }
        catch (Exception exception)
        {
            logs.Add($"Pairing recovery hatasi: {exception.Message}");
        }
    }

    private static void OpenTicket(uint interfaceHandle, ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        var retcode = GmpNative.FP3_TicketHeader(interfaceHandle, transactionHandle, TicketTypeProcessSale, timeoutMs);
        logs.Add($"FP3_TicketHeader retcode={retcode}");
        GmpRuntime.ThrowIfError(retcode, "Fis basligi acilamadi", logs);
        if (SkipOptionFlagsInSpeedMode)
        {
            logs.Add("FP3_OptionFlags hiz modu nedeniyle atlandi.");
            return;
        }

        ulong activeFlags = 0;
        var optionFlagsTimeoutMs = Math.Min(timeoutMs, 700);
        retcode = GmpNative.FP3_OptionFlags(interfaceHandle, transactionHandle, ref activeFlags, EchoOptions, 0, optionFlagsTimeoutMs);
        logs.Add($"FP3_OptionFlags retcode={retcode} activeFlags={activeFlags} timeout={optionFlagsTimeoutMs}ms");
        if (retcode != 0 && retcode != AppErrNotAllowed)
        {
            logs.Add("FP3_OptionFlags non-fatal gecildi (hiz modu).");
        }
    }

    private static void WarmupDeviceRuntime(uint interfaceHandle, IList<string> logs)
    {
        logs.Add("Warm-up adimi devre disi birakildi.");
    }

    private static void CleanupReservedTransactions(uint interfaceHandle, int timeoutMs, IList<string> logs)
    {
        var cleanedHandles = new HashSet<ulong>();
        CleanupTransactions(interfaceHandle, timeoutMs, logs, 0, cleanedHandles, "tum");
        CleanupTransactions(interfaceHandle, timeoutMs, logs, TransactionStatusReserved, cleanedHandles, "reserved");
    }

    private static void CleanupTransactions(uint interfaceHandle, int timeoutMs, IList<string> logs, byte statusFilter, HashSet<ulong> cleanedHandles, string filterLabel)
    {
        try
        {
            ushort totalHandles = 0;
            ushort receivedHandles = 0;
            var handles = new GmpSampleSim.ST_HANDLE_LIST[0];
            var retcode = GmpSampleSim.Json_GMPSmartDLL.FP3_FunctionGetHandleList(
                interfaceHandle,
                ref handles,
                statusFilter,
                0,
                32,
                ref totalHandles,
                ref receivedHandles,
                timeoutMs);
            logs.Add($"Json_GMPSmartDLL.FP3_FunctionGetHandleList retcode={retcode} filter={filterLabel}");

            if (retcode != 0 || receivedHandles == 0 || handles == null)
            {
                return;
            }

            foreach (var handle in handles)
            {
                if (handle.Handle == 0 || cleanedHandles.Contains(handle.Handle))
                {
                    continue;
                }

                cleanedHandles.Add(handle.Handle);
                logs.Add($"Acik Ingenico islemi temizleniyor. Handle={handle.Handle}");
                TryRecoverTransaction(interfaceHandle, handle.Handle, timeoutMs, logs);
            }
        }
        catch (Exception exception)
        {
            logs.Add($"Acik Ingenico islemleri temizlenemedi ({filterLabel}): {exception.Message}");
        }
    }

    public static void CleanupDanglingTransactionAfterPairing(uint interfaceHandle, int timeoutMs, IList<string> logs)
    {
        try
        {
            ulong transactionHandle = 0;
            var uniqueId = new byte[24];
            var retcode = GmpNative.FP3_GetCurrentHandle(interfaceHandle, ref transactionHandle, uniqueId, uniqueId.Length, timeoutMs);
            logs.Add($"FP3_GetCurrentHandle retcode={retcode}");

            if (retcode == 0 && transactionHandle != 0)
            {
                logs.Add($"Current handle temizleniyor. Handle={transactionHandle}");
                TryClose(interfaceHandle, transactionHandle, timeoutMs);
            }
        }
        catch (EntryPointNotFoundException)
        {
            logs.Add("FP3_GetCurrentHandle bu DLL surumunde yok, current handle temizligi atlandi.");
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static void SendItem(uint interfaceHandle, ulong transactionHandle, BridgePaymentItem item, int timeoutMs, IList<string> logs)
    {
        var stItem = new GmpSampleSim.ST_ITEM
        {
            type = ItemTypeSaleInfo,
            subType = 0,
            deptIndex = 0,
            unitType = ItemUnitNumber,
            amount = (uint)GmpRuntime.ToMinorUnit(item.Price),
            currency = CurrencyCodeTry,
            count = (uint)Math.Max(1, item.Qty),
            flag = ItemFlagSaleInfo,
            countPrecition = 0,
            pluPriceIndex = 0,
            name = GmpRuntime.Trim(item.Name, 32),
            barcode = string.Empty,
            firm = string.Empty,
            invoiceNo = string.Empty,
            subscriberId = string.Empty,
            tckno = string.Empty,
            Reserved = 0,
            szDate = string.Empty,
            promotion = new GmpSampleSim.promotion(),
            OnlineInvoiceItemExceptionCode = 0
        };

        var stTicket = new GmpSampleSim.ST_TICKET();
        var retcode = GmpSampleSim.Json_GMPSmartDLL.FP3_ItemSale(
            interfaceHandle,
            transactionHandle,
            ref stItem,
            ref stTicket,
            timeoutMs);

        logs.Add($"Json_GMPSmartDLL.FP3_ItemSale retcode={retcode} item={item.Name} (wrapper)");
        GmpRuntime.ThrowIfError(retcode, $"{item.Name} urunu cihaza gonderilemedi", logs);
    }

    private static void SendItemsWithLazyTicketSetup(
        uint interfaceHandle,
        ulong transactionHandle,
        IReadOnlyList<BridgePaymentItem> items,
        int timeoutMs,
        IList<string> logs)
    {
        var openTicketStopwatch = Stopwatch.StartNew();
        OpenTicket(interfaceHandle, transactionHandle, timeoutMs, logs);
        openTicketStopwatch.Stop();
        logs.Add($"FP3_TicketHeader+OptionFlags sure={openTicketStopwatch.ElapsedMilliseconds}ms");

        foreach (var item in items)
        {
            SendItem(interfaceHandle, transactionHandle, item, timeoutMs, logs);
        }
    }

    private static string SendPayment(uint interfaceHandle, ulong transactionHandle, BridgeTerminal terminal, BridgePayment payment, IList<string> logs)
    {
        var isCash = string.Equals(payment.Method, "nakit", StringComparison.OrdinalIgnoreCase);
        var paymentRequest = new NativePaymentRequest
        {
            typeOfPayment = isCash ? PaymentCashTl : PaymentBankCard,
            subtypeOfPayment = isCash ? 0u : PaymentSubtypeSale,
            payAmount = (uint)GmpRuntime.ToMinorUnit(payment.Amount),
            payAmountBonus = 0,
            payAmountCurrencyCode = CurrencyCodeTry,
            bankBkmId = 0,
            numberOfinstallments = 0,
            BankPaymentUniqueId = DateTime.Now.ToString("yyyyMMddHHmmss"),
            batchNo = 0,
            stanNo = 0,
            rawDataLen = 0,
            paymentName = GmpRuntime.Trim(payment.PaymentName, 32),
            paymentInfo = GmpRuntime.Trim(payment.PaymentInfo, 32),
            transactionFlag = isCash ? 0u : PaymentTransactionFlagKiosk,
            flags = 0,
            LoyaltyCustomerId = payment.OrderId,
            LoyaltyServiceId = 0,
            AllowedInput = 0
        };

        var jsonString = JsonConvert.SerializeObject(paymentRequest);
        var jsonBytes = GmpRuntime.ToNativeBytes(jsonString);
        logs.Add($"Json_FP3_Payment request: {jsonString}");

        var paymentOut = new byte[200000];
        var ticketOut = new byte[200000];
        var retcode = GmpNative.Json_FP3_Payment(
            interfaceHandle,
            transactionHandle,
            jsonBytes,
            paymentOut,
            paymentOut.Length,
            ticketOut,
            ticketOut.Length,
            isCash ? terminal.DefaultTimeoutMs : Math.Max(terminal.CardTimeoutMs, 60000));
            
        logs.Add($"Json_FP3_Payment retcode={retcode}");
        GmpRuntime.ThrowIfError(retcode, "Odeme Ingenico tarafina gonderilemedi", logs);
        return jsonString;
    }

    private static NativeClose CloseTransaction(uint interfaceHandle, ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        var jsonOptions = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            var closeOut = new byte[200000];
            var retcode = GmpNative.Json_FP3_Close(
                interfaceHandle,
                transactionHandle,
                closeOut,
                closeOut.Length,
                timeoutMs);

            logs.Add($"Json_FP3_Close retcode={retcode}");
            if (retcode == AppErrNotAllowed)
            {
                logs.Add("Json_FP3_Close retcode=2064 (NOT_ALLOWED) firmware davranisi olarak kabul edildi.");
                return new NativeClose();
            }
            GmpRuntime.ThrowIfError(retcode, "Fis kapatilamadi", logs);

            var jsonResponse = GmpRuntime.FromNativeBytes(closeOut);
            if (!string.IsNullOrEmpty(jsonResponse))
            {
                try
                {
                    var responseObj = System.Text.Json.JsonSerializer.Deserialize<NativeClose>(jsonResponse, jsonOptions);
                    if (responseObj != null)
                    {
                        return responseObj;
                    }
                }
                catch (Exception ex)
                {
                    logs.Add($"Close parse error: {ex.Message}");
                }
            }

            return new NativeClose();
        }
        catch (EntryPointNotFoundException)
        {
            var retcode = GmpNative.FP3_Close(interfaceHandle, transactionHandle, timeoutMs);
            logs.Add($"FP3_Close (fallback) retcode={retcode}");
            if (retcode == AppErrNotAllowed)
            {
                logs.Add("FP3_Close retcode=2064 (NOT_ALLOWED) firmware davranisi olarak kabul edildi.");
                return new NativeClose();
            }
            GmpRuntime.ThrowIfError(retcode, "Fis kapatilamadi", logs);
            return new NativeClose();
        }
    }

    private static uint TryClose(uint interfaceHandle, ulong transactionHandle, int timeoutMs, IList<string>? logs = null)
    {
        if (transactionHandle == 0)
        {
            return 0;
        }

        try
        {
            try
            {
                var closeOut = new byte[200000];
                var retcode = GmpNative.Json_FP3_Close(
                    interfaceHandle,
                    transactionHandle,
                    closeOut,
                    closeOut.Length,
                    timeoutMs);

                logs?.Add($"TryClose Json_FP3_Close retcode={retcode}");
                if (retcode == AppErrNotAllowed)
                {
                    logs?.Add("TryClose Json_FP3_Close retcode=2064 (NOT_ALLOWED) ignore edildi.");
                    return 0;
                }
                return retcode;
            }
            catch (EntryPointNotFoundException)
            {
                var retcode = GmpNative.FP3_Close(interfaceHandle, transactionHandle, timeoutMs);
                logs?.Add($"TryClose FP3_Close (fallback) retcode={retcode}");
                if (retcode == AppErrNotAllowed)
                {
                    logs?.Add("TryClose FP3_Close retcode=2064 (NOT_ALLOWED) ignore edildi.");
                    return 0;
                }
                return retcode;
            }
        }
        catch
        {
            logs?.Add("TryClose Json_FP3_Close exception olustu.");
            return uint.MaxValue;
        }
    }

    private static bool TryFinalizeWithPrintChain(uint interfaceHandle, ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        try
        {
            var fastMfStopwatch = Stopwatch.StartNew();
            var fastMfRetcode = GmpNative.FP3_PrintMF(interfaceHandle, transactionHandle, timeoutMs);
            fastMfStopwatch.Stop();
            logs.Add($"FP3_PrintMF (fast-path) retcode={fastMfRetcode} sure={fastMfStopwatch.ElapsedMilliseconds}ms");
            if (fastMfRetcode == 0 || fastMfRetcode == AppErrNotAllowed)
            {
                return true;
            }

            logs.Add("FP3_PrintMF fast-path basarisiz, klasik finalize zinciri denenecek.");

            var retTotals = GmpNative.FP3_PrintTotalsAndPayments(interfaceHandle, transactionHandle, timeoutMs);
            logs.Add($"FP3_PrintTotalsAndPayments retcode={retTotals}");
            if (retTotals != 0 && retTotals != AppErrNotAllowed)
            {
                GmpRuntime.ThrowIfError(retTotals, "PrintTotalsAndPayments basarisiz", logs);
                return false;
            }

            var retBeforeMf = GmpNative.FP3_PrintBeforeMF(interfaceHandle, transactionHandle, timeoutMs);
            logs.Add($"FP3_PrintBeforeMF retcode={retBeforeMf}");
            if (retBeforeMf != 0 && retBeforeMf != AppErrNotAllowed)
            {
                GmpRuntime.ThrowIfError(retBeforeMf, "PrintBeforeMF basarisiz", logs);
                return false;
            }

            var retMf = GmpNative.FP3_PrintMF(interfaceHandle, transactionHandle, timeoutMs);
            logs.Add($"FP3_PrintMF retcode={retMf}");
            if (retMf == 0 || retMf == AppErrNotAllowed)
            {
                return true;
            }

            GmpRuntime.ThrowIfError(retMf, "PrintMF basarisiz", logs);
            return false;
        }
        catch (Exception ex)
        {
            logs.Add($"Print chain finalize exception: {ex.Message}");
            return false;
        }
    }

    private static bool TryFinalizeWithMultipleCommand(uint interfaceHandle, ref ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        if (!UseMultipleCommandFinalize)
        {
            logs.Add("MultipleCommand finalize devre disi.");
            return false;
        }

        try
        {
            var messageBuffer = new byte[16 * 1024];
            var messageBufferLen = 0;
            if (!TryAppendPreparedCommand(
                    messageBuffer,
                    ref messageBufferLen,
                    GmpSampleSim.GMPSmartDLL.prepare_PrintTotalsAndPayments,
                    "prepare_PrintTotalsAndPayments",
                    logs))
            {
                return false;
            }

            if (!TryAppendPreparedCommand(
                    messageBuffer,
                    ref messageBufferLen,
                    GmpSampleSim.GMPSmartDLL.prepare_PrintBeforeMF,
                    "prepare_PrintBeforeMF",
                    logs))
            {
                return false;
            }

            if (!TryAppendPreparedCommand(
                    messageBuffer,
                    ref messageBufferLen,
                    GmpSampleSim.GMPSmartDLL.prepare_PrintMF,
                    "prepare_PrintMF",
                    logs))
            {
                return false;
            }

            if (!TryAppendPreparedCommand(
                    messageBuffer,
                    ref messageBufferLen,
                    GmpSampleSim.GMPSmartDLL.prepare_Close,
                    "prepare_Close",
                    logs))
            {
                return false;
            }

            if (messageBufferLen <= 0)
            {
                logs.Add("MultipleCommand finalize mesaji olusturulamadi.");
                return false;
            }

            var numberOfReturnCodes = (ushort)64;
            var returnCodes = new GmpSampleSim.ST_MULTIPLE_RETURN_CODE[numberOfReturnCodes];
            var ticket = new GmpSampleSim.ST_TICKET();
            var multipleCommandStopwatch = Stopwatch.StartNew();
            var retcode = GmpSampleSim.Json_GMPSmartDLL.FP3_MultipleCommand(
                interfaceHandle,
                ref transactionHandle,
                ref returnCodes,
                ref numberOfReturnCodes,
                messageBuffer,
                (ushort)Math.Min(messageBufferLen, ushort.MaxValue),
                ref ticket,
                timeoutMs);
            multipleCommandStopwatch.Stop();
            logs.Add($"FP3_MultipleCommand finalize retcode={retcode} sure={multipleCommandStopwatch.ElapsedMilliseconds}ms");
            for (int i = 0; i < Math.Min(numberOfReturnCodes, returnCodes.Length); i++)
            {
                var entry = returnCodes[i];
                if (entry is null || entry.indexOfSubCommand == 0 || entry.subCommand == 0)
                {
                    continue;
                }

                logs.Add($"FP3_MultipleCommand sub#{entry.indexOfSubCommand} cmd={entry.subCommand} retcode={entry.retcode}");
            }

            if (retcode == 0 || retcode == AppErrNotAllowed)
            {
                return true;
            }

            logs.Add("MultipleCommand finalize basarisiz, klasik zincire donuluyor.");
            return false;
        }
        catch (Exception exception)
        {
            logs.Add($"MultipleCommand finalize exception: {exception.Message}");
            return false;
        }
    }

    private static bool TryAppendPreparedCommand(
        byte[] targetBuffer,
        ref int targetLength,
        Func<byte[], int, int> prepareFunction,
        string stepName,
        IList<string> logs)
    {
        var commandBuffer = new byte[4 * 1024];
        var commandLength = prepareFunction(commandBuffer, commandBuffer.Length);
        logs.Add($"{stepName} len={commandLength}");
        if (commandLength <= 0)
        {
            logs.Add($"{stepName} hazirlama basarisiz.");
            return false;
        }

        if (targetLength + commandLength > targetBuffer.Length)
        {
            logs.Add($"{stepName} komutu batch buffer sinirini asti.");
            return false;
        }

        Buffer.BlockCopy(commandBuffer, 0, targetBuffer, targetLength, commandLength);
        targetLength += commandLength;
        return true;
    }

    private static void TryRecoverTransaction(uint interfaceHandle, ulong transactionHandle, int timeoutMs, IList<string> logs)
    {
        if (transactionHandle == 0)
        {
            return;
        }

        try
        {
            var voidOut = new byte[200000];
            var voidRetcode = GmpNative.Json_FP3_VoidAll(interfaceHandle, transactionHandle, voidOut, voidOut.Length, timeoutMs);
            logs.Add($"Json_FP3_VoidAll retcode={voidRetcode}");
            _ = TryClose(interfaceHandle, transactionHandle, timeoutMs, logs);
            return;
        }
        catch (Exception exception)
        {
            logs.Add($"Ingenico islem iptali basarisiz: {exception.Message}");
        }

        _ = TryClose(interfaceHandle, transactionHandle, timeoutMs, logs);
    }
}

static class BridgeConsole
{
    public static void Write(IEnumerable<string> logs)
    {
        foreach (var line in logs)
        {
            Console.WriteLine($"[MicPOSBridge] {line}");
        }
    }
}

static class GmpRuntime
{
    public static byte[] ToNativeBytes(string value)
    {
        if (string.IsNullOrEmpty(value)) return new byte[] { 0 };
        byte[] Result = new byte[value.Length + 1];
        int Index = 0;
        foreach (var i in value)
        {
            if (i == 'Ğ') Result[Index] = 0xD0;
            else if (i == 'Ü') Result[Index] = 0xDC;
            else if (i == 'Ş') Result[Index] = 0xDE;
            else if (i == 'İ') Result[Index] = 0xDD;
            else if (i == 'Ö') Result[Index] = 0xD6;
            else if (i == 'Ç') Result[Index] = 0xC7;
            else if (i == 'I') Result[Index] = 0x49;
            else if (i == 'ğ') Result[Index] = 0xF0;
            else if (i == 'ü') Result[Index] = 0xFC;
            else if (i == 'ş') Result[Index] = 0xFE;
            else if (i == 'ı') Result[Index] = 0xFD;
            else if (i == '€') Result[Index] = 0x80;
            else if (i == 'ö') Result[Index] = 0xF6;
            else if (i == 'ç') Result[Index] = 0xE7;
            else if (i == 'i') Result[Index] = 0x69;
            else Result[Index] = (byte)i;
            Index++;
        }
        return Result;
    }

    public static string FromNativeBytes(byte[] bytes)
    {
        var length = Array.IndexOf(bytes, (byte)0);
        if (length < 0)
        {
            length = bytes.Length;
        }

        return Encoding.UTF8.GetString(bytes, 0, length).Trim();
    }

    public static (uint Retcode, string Payload) RunEcho(uint handle, int timeoutMs)
    {
        var buffer = new byte[2048];
        var result = GmpNative.Json_FP3_Echo(handle, buffer, buffer.Length, timeoutMs);
        return (result, FromNativeBytes(buffer));
    }

    public static void ThrowIfError(uint retcode, string message, IList<string>? logs = null)
    {
        if (retcode != 0)
        {
            var detail = ResolveRetcode(retcode);
            if (!string.IsNullOrWhiteSpace(detail))
            {
                logs?.Add($"Native hata mesaji: {detail}");
            }
            throw new InvalidOperationException(
                string.IsNullOrWhiteSpace(detail)
                    ? $"{message}. retcode={retcode}"
                    : $"{message}. retcode={retcode}. {detail}");
        }
    }

    public static string ResolveRetcode(uint retcode)
    {
        var buffer = new byte[512];

        try
        {
            GmpNative.GetErrorMessage(retcode, buffer);
            return FromNativeBytes(buffer);
        }
        catch
        {
            return "";
        }
    }

    public static uint ToMinorUnit(int amount)
    {
        return (uint)Math.Max(0, amount) * 100u;
    }

    public static string Trim(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return value.Length <= maxLength ? value : value[..maxLength];
    }

    public static string FormatException(Exception exception)
    {
        if (exception is DllNotFoundException)
        {
            return
                $"{exception.Message} | Cozum: GMPSmartDLL.dll ve vendor bagimli DLL dosyalarini uygulama klasorune koyun. " +
                "Windows ARM cihazda DLL x64 ise bridge'i x64 .NET ile calistirin veya x64 Windows makine kullanin. " +
                "Gerekirse Microsoft Visual C++ Redistributable paketlerini kurun.";
        }

        if (exception is BadImageFormatException)
        {
            return
                $"{exception.Message} | Cozum: Bridge proses mimarisi ile DLL mimarisi ayni olmali. " +
                "Ornek: DLL x64 ise uygulamayi x64 olarak calistirin.";
        }

        return exception.Message;
    }
}

sealed class NativeClose
{
    public ushort EkuNo { get; init; }
    public ushort ZNo { get; init; }
    public ushort FisNo { get; init; }
}

static class GmpNative
{
    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_CreateInterface", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_CreateInterface(ref uint phInt, byte[] szID, byte isDefault, byte[] szJsonXmlData);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_UpdateInterfaceXmlDataByID", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_UpdateInterfaceXmlDataByID(byte[] szID, byte[] szInterfaceXmlData);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_Echo", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_Echo(uint hInt, byte[] szEchoOut, int echoLenOut, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_GetTaxRates_Ex", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_GetTaxRates_Ex(uint hInt, byte indexOfTaxRates, ref byte pNumberOfTotalRecords, ref byte pNumberOfTotalRecordsReceived, byte[] szJsonTaxRates, byte[] szJsonTaxRate_Out, int JsonTaxRateLen_Out, byte NumberOfRecordsRequested);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_GetDepartments_Ex", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_GetDepartments_Ex(uint hInt, byte indexOfDepartments, ref byte pNumberOfTotalDepartments, ref byte pNumberOfTotalDepartmentsReceived, byte[] szJsonDepartments, byte[] szJsonDepartments_Out, int JsonDepartmentsLen_Out, byte NumberOfDepartmentRequested);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_GetCurrencyProfile", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_GetCurrencyProfile(uint hInt, byte[] szJsonExchangeProfileTable_In, byte[] szJsonExchangeProfileTable_Out, int JsonExchangeProfileLen_Out);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_StartPairingInit", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_StartPairingInit(uint hInt, byte[] szPairing, byte[] szPairingResp, int pairingRespLen);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_IsGmpPairingDone", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_IsGmpPairingDone(uint hInt);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_Start", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_Start(uint hInt, ref ulong hTrx, byte isBackground, byte[] uniqueId, int uniqueIdLen, byte[] uniqueIdSign, int uniqueIdSignLen, byte[] userData, int userDataLen, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_ItemSale", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_ItemSale(uint hInt, ulong hTrx, byte[] itemRequest, byte[] itemOut, int itemOutLen, byte[] ticketOut, int ticketOutLen, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_Payment", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_Payment(uint hInt, ulong hTrx, byte[] paymentRequest, byte[] paymentRequestOut, int paymentRequestOutLength, byte[] jsonTicketOut, int jsonTicketOutLength, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_Close", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_Close(uint hInt, ulong hTrx, byte[] closeOut, int closeOutLen, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_Close", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_Close(uint hInt, ulong hTrx, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_TicketHeader", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_TicketHeader(uint interfaceHandle, ulong transactionHandle, int ticketType, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_OptionFlags", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_OptionFlags(uint interfaceHandle, ulong transactionHandle, ref ulong activeFlags, ulong flagsToSet, ulong flagsToClear, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_GetCurrentHandle", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_GetCurrentHandle(uint interfaceHandle, ref ulong transactionHandle, byte[] uniqueId, int maxLengthOfUniqueId, int timeoutInMiliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_VoidAll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_VoidAll(uint hInt, ulong hTrx, byte[] ticketOut, int ticketOutLen, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_PrintTotalsAndPayments", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_PrintTotalsAndPayments(uint hInt, ulong hTrx, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_PrintBeforeMF", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_PrintBeforeMF(uint hInt, ulong hTrx, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_PrintMF", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_PrintMF(uint hInt, ulong hTrx, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "Json_FP3_FunctionGetHandleList", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint Json_FP3_FunctionGetHandleList(uint hInt, byte[] handleListOut, int handleListOutLen, byte statusFilter, ushort startIndexOfHandle, ushort handleListSize, ref ushort totalNumberOfHandlesInEcr, ref ushort receivedNumberOfHandleInList, int timeoutInMilliseconds);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_GetInterfaceHandleByID", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_GetInterfaceHandleByID(ref uint phInt, byte[] szID);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_CloseInterfaceByID", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_CloseInterfaceByID(byte[] szID);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "FP3_RemoveInterfaceByHandle", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern uint FP3_RemoveInterfaceByHandle(uint phInt);

    [DllImport("GmpSmartDLL.dll", EntryPoint = "GetErrorMessage", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern void GetErrorMessage(uint errorCode, byte[] buffer);
}

static class NativeDllGuard
{
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool SetDllDirectory(string lpPathName);

    public static void PinProcessDllSearchPathToAppBase()
    {
        if (!OperatingSystem.IsWindows())
        {
            return;
        }

        try
        {
            _ = SetDllDirectory(AppContext.BaseDirectory);
        }
        catch
        {
            // Best-effort; runtime load will still report a clear DllNotFoundException if missing.
        }
    }

    public static string GetDllPath(string dllName)
    {
        var candidate = Path.Combine(AppContext.BaseDirectory, dllName);
        return File.Exists(candidate) ? candidate : "not-found-in-app-base";
    }

    public static string GetDllFileVersion(string dllName)
    {
        var path = Path.Combine(AppContext.BaseDirectory, dllName);
        if (!File.Exists(path))
        {
            return "not-found";
        }

        try
        {
            var info = System.Diagnostics.FileVersionInfo.GetVersionInfo(path);
            return string.IsNullOrWhiteSpace(info.FileVersion) ? "unknown" : info.FileVersion!;
        }
        catch
        {
            return "unknown";
        }
    }

    public static string GetDllSha256(string dllName)
    {
        var path = Path.Combine(AppContext.BaseDirectory, dllName);
        if (!File.Exists(path))
        {
            return "not-found";
        }

        using var stream = File.OpenRead(path);
        var hash = SHA256.HashData(stream);
        return Convert.ToHexString(hash);
    }
}
