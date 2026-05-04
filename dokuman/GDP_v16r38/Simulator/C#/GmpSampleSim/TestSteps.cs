using GmpSampleSim.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GmpSampleSim
{
    public enum StepId
    {
        None = 0,
        Start = 1,
        PrintTicketHeader,
        SetOptions,
        Item,
        VoidItem,
        Kredi,
        Nakit,
        Yemek,
        DigerOdeme,
        PrintTotal,
        PrintTotalAndPayments,
        PrintBeforMF,
        UserMessage,
        PrintMF,
        Close,
        Batch,
        Plus,
        Minus,
        Inc,
        Dec,
        SetInvoice,
        ZRaporu,
        XRaporu,
        DelayMS,
        GiderPusulasi,
        ReversPayment,
        GetTicket,
        PreTotal,
        GetMerchantSlip
    }

    public class Step
    {
        public StepId id;
        public string data;

        public Step(StepId id, string data)
        {
            this.id = id;
            this.data = data;
        }
    }

    public class BatchModeCommand
    {
        public string name;
        public string data;

        public BatchModeCommand(string name, string data)
        {
            this.name = name;
            this.data = data;
        }
    }

    class ParamData
    {
        public Dictionary<string, string> data;

        public ParamData(string data)
        {
            this.data = new Dictionary<string, string>();
            SetData(data);
        }

        public ParamData()
        {
            this.data = new Dictionary<string, string>();
        }

        public string GetData()
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.Append("{");
            Boolean isFirst = true;
            foreach (KeyValuePair<String, String> param in data)
            {
                if (isFirst)
                    isFirst = false;
                else
                    stringBuilder.Append(",");
                stringBuilder.Append(param.Key);
                stringBuilder.Append(":");
                stringBuilder.Append(param.Value);
            }
            stringBuilder.Append("}");

            return stringBuilder.ToString();
        }

        public void SetData(string data)
        {
            this.data.Clear();
            string[] tokens = data.Split(new char[] { '{', ',', '}' });
            foreach (string token in tokens)
            {
                if (token.Length == 0)
                    continue;
                string[] values = token.Split(new char[] { ':' });
                if (values.Length == 2)
                    this.data.Add(values[0].Trim(), values[1].Trim());
            }
        }
    
        public void Add(string key, string value)
        {
            data.Add(key, value);
        }

        public void Clear() { data.Clear(); }

        public UInt64 getUInt64Value(string key, UInt64 defaultValue)
        {
            UInt64 result = defaultValue;

            data.TryGetValue(key, out string value);
            if (value != null)
                UInt64.TryParse(value, out result);

            return result;
        }

        public UInt32 getUInt32Value(string key, UInt32 defaultValue) 
        {
            UInt32 result = defaultValue;

            data.TryGetValue(key, out string value);
            if (value != null)
                UInt32.TryParse(value, out result);

            return result;
        }

        internal ushort getUInt16Value(string key, UInt16 defaultValue)
        {
            UInt16 result = defaultValue;

            data.TryGetValue(key, out string value);
            if (value != null)
                UInt16.TryParse(value, out result);

            return result;
        }

        public string getStringValue(string key, string defaultValue)
        {
            data.TryGetValue(key, out string value);
            if (value == null)
                value = defaultValue;

            return value;
        }

        public byte getByteValue(string key, byte defaultValue)
        {
            Byte result = defaultValue;

            data.TryGetValue(key, out string value);
            if (value != null)
                Byte.TryParse(value, out result);

            return result;
        }

        public Boolean getBoolValue(string key, Boolean defaultValue)
        {
            Boolean result = defaultValue;

            data.TryGetValue(key, out string value);
            if (value != null)
            {
                if (value.Equals("true"))
                    result = true;
                else
                    result = false;
            }

            return result;
        }

        internal void setValue(string key, string value)
        {
            data[key] = value;
        }
    }

    public enum TestParamStructType
    {
        str,
        selection,
        multipleSelection,
        batchFile,
        uint8,
        uint16,
        uint32,
        uint64,
        boolean,
    }

    public class TestParamStruct
    {
        public string name;
        public TestParamStructType type;
        public string strValue;
        public byte uint8Value;
        public UInt16 uint16Value;
        public UInt32 uint32Value;
        public UInt64 uint64Value;
        public Boolean boolValue;
        public List<string> selectionOptions;

        public TestParamStruct()
        {
            strValue = "";
            uint8Value = 0;
            uint16Value = 0;
            uint32Value = 0;
            uint64Value = 0;
            selectionOptions = null;
            boolValue = false;
        }
    }

    public class TestParam
    {
        internal static void EditParams(ref Step step)
        {
            TestParamForm form = new TestParamForm();

            List<TestParamStruct> list = GetParamList(step);

            if ((list != null) && (list.Count > 0))
            {
                form.SetParams(list);

                form.ShowDialog();

                form.GetData(list, ref step);
            }
        }

        private static List<TestParamStruct> GetParamList(Step step)
        {
            List<TestParamStruct> list = new List<TestParamStruct>();

            ParamData paramData = new ParamData(step.data);

            switch (step.id)
            {
                case StepId.None:
                    break;
                case StepId.Start:
                    break;
                case StepId.PrintTicketHeader:
                    List<string> selectionOptions = new List<string>();
                    foreach (TTicketType ticketType in (TTicketType[]) Enum.GetValues(typeof(TTicketType)))
                        selectionOptions.Add(ticketType.ToString());
                    list.Add(new TestParamStruct {
                        name = "TicketType",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("TicketType", TTicketType.TProcessSale.ToString()),
                        selectionOptions = selectionOptions
                    });
                    break;
                case StepId.SetOptions:
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_ECHO_PRINTER));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_ECHO_PAYMENT_DETAILS));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_ECHO_ITEM_DETAILS));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_NO_RECEIPT_LIMIT_CONTROL_FOR_ITEMS));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_DONOT_CONTROL_PAYMENTS_FOR_RECEIPT_CANCEL));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_GET_CONFIRMATION_FOR_PAYMENT_CANCEL));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_ECHO_LOYALTY_DETAILS));
                    selectionOptions.Add(nameof(Defines.GMP3_OPTION_SAVE_LAST_TRANS));
                    list.Add(new TestParamStruct
                    {
                        name = "Options",
                        type = TestParamStructType.multipleSelection,
                        strValue = paramData.getStringValue("Options", nameof(Defines.GMP3_OPTION_ECHO_PRINTER) + " | " + nameof(Defines.GMP3_OPTION_ECHO_ITEM_DETAILS) + " | " + nameof(Defines.GMP3_OPTION_ECHO_PAYMENT_DETAILS)),
                        selectionOptions = selectionOptions
                    });
                    break;
                case StepId.Item:
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(Defines.ITEM_TYPE_DEPARTMENT));
                    selectionOptions.Add(nameof(Defines.ITEM_TYPE_MONEYCOLLECTION));
                    list.Add(new TestParamStruct
                    {
                        name = "Type",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("Type", nameof(Defines.ITEM_TYPE_DEPARTMENT)),
                        selectionOptions = selectionOptions
                    });
                    selectionOptions = new List<string>();
                    foreach (ETypeOfMatrahsiz ticketType in (ETypeOfMatrahsiz[])Enum.GetValues(typeof(ETypeOfMatrahsiz)))
                        selectionOptions.Add(ticketType.ToString());
                    list.Add(new TestParamStruct
                    {
                        name = "TypeOfMatrahsız",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("TypeOfMatrahsız", ETypeOfMatrahsiz.MATRAHSIZ_TYPE_INVOICE_COLLECTION.ToString()),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "DepartmanIndex",
                        type = TestParamStructType.uint8,
                        uint8Value = paramData.getByteValue("DepartmanIndex", 0),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Count",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getByteValue("Count", 1),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "CountPrecition",
                        type = TestParamStructType.uint8,
                        uint32Value = paramData.getByteValue("CountPrecition", 0),
                    });
                    selectionOptions = new List<string>();
                    foreach (EItemUnitTypes eItemUnitTypes in (EItemUnitTypes[])Enum.GetValues(typeof(EItemUnitTypes)))
                        selectionOptions.Add(eItemUnitTypes.ToString());
                    list.Add(new TestParamStruct
                    {
                        name = "UnitType",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("UnitType", EItemUnitTypes.ITEM_NONE.ToString()),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Name",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Name", "")
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Firm",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Firm", "TÜRK TELEKOM A.Ş.")
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "invoiceNo",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("invoiceNo", "A-12345678")
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "subscriberId",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("subscriberId", "02124440333")
                    });
                    break;
                case StepId.VoidItem:
                    list.Add(new TestParamStruct
                    {
                        name = "ItemIndex",
                        type = TestParamStructType.uint16,
                        uint16Value = paramData.getByteValue("ItemIndex", 0),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemCount",
                        type = TestParamStructType.uint64,
                        uint64Value = paramData.getByteValue("ItemCount", 1),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemCountPrecision",
                        type = TestParamStructType.uint8,
                        uint8Value = paramData.getByteValue("ItemCountPrecision", 0),
                    });
                    break;
                case StepId.Kredi:
                    //selectionOptions = new List<string>();
                    //selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_BANK_CARD));
                    //list.Add(new TestParamStruct
                    //{
                    //    name = "PaymentType",
                    //    type = TestParamStructType.selection,
                    //    strValue = paramData.getStringValue("PaymentType", nameof(EPaymentTypes.PAYMENT_BANK_CARD)),
                    //    selectionOptions = selectionOptions
                    //});

                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(Defines.PAYMENT_SUBTYPE_PROCESS_ON_POS));
                    selectionOptions.Add(nameof(Defines.PAYMENT_SUBTYPE_SALE));
                    selectionOptions.Add(nameof(Defines.PAYMENT_SUBTYPE_INSTALMENT_SALE));
                    selectionOptions.Add(nameof(Defines.PAYMENT_SUBTYPE_LOYALTY_PUAN));
                    list.Add(new TestParamStruct
                    {
                        name = "SubPaymentType",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("SubPaymentType", nameof(Defines.PAYMENT_SUBTYPE_SALE)),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_DO_NOT_ASK_FOR_MISSING_LOYALTY_POINT));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_ALL_INPUT_FROM_EXTERNAL_SYSTEM));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_ASK_FOR_MISSING_REFUND_INPUTS));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_LOYALTY_POINT_NOT_SUPPORTED_FOR_TRANS));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_ONLINE_FORCED_TRANSACTION));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_MANUAL_PAN_ENTRY_NOT_ALLOWED));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_AUTHORISATION_FOR_INVOICE_PAYMENT));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_SALE_WITHOUT_CAMPAIGN));
                    selectionOptions.Add(nameof(Defines.BANK_TRAN_FLAG_SOFT_COPY_SUPPORT_FOR_MERCHANT_COPY));
                    list.Add(new TestParamStruct
                    {
                        name = "TransactionFlag",
                        type = TestParamStructType.multipleSelection,
                        strValue = paramData.getStringValue("TransactionFlag", ""),
                        selectionOptions = selectionOptions
                    });
                    break;
                case StepId.Nakit:
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    break;
                case StepId.Yemek:
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "AppID",
                        type = TestParamStructType.uint16,
                        uint16Value = paramData.getByteValue("AppID", 0),
                    });
                    break;
                case StepId.DigerOdeme:
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_MOBILE));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_HEDIYE_CEKI));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_IKRAM));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_ODEMESIZ));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_KAPORA));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_PUAN));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_BANKA_TRANSFERI));
                    selectionOptions.Add(nameof(EPaymentTypes.PAYMENT_CEK));
                    list.Add(new TestParamStruct
                    {
                        name = "PaymentType",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("PaymentType", nameof(EPaymentTypes.PAYMENT_BANKA_TRANSFERI)),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    break;
                case StepId.PrintTotal:
                    break;
                case StepId.PrintTotalAndPayments:
                    break;
                case StepId.PrintBeforMF:
                    break;
                case StepId.UserMessage:
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(Defines.PS_16));
                    selectionOptions.Add(nameof(Defines.PS_24));
                    selectionOptions.Add(nameof(Defines.PS_38));
                    selectionOptions.Add(nameof(Defines.PS_CENTER));
                    selectionOptions.Add(nameof(Defines.PS_BOLD));
                    selectionOptions.Add(nameof(Defines.PS_RIGHT));
                    list.Add(new TestParamStruct
                    {
                        name = "Flags",
                        type = TestParamStructType.multipleSelection,
                        strValue = paramData.getStringValue("Flags", nameof(Defines.PS_38) + " | " + nameof(Defines.PS_CENTER)),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Message",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Message", "Hello World!"),
                        selectionOptions = null
                    });
                    break;
                case StepId.PrintMF:
                    break;
                case StepId.Close:
                    break;
                case StepId.Batch:
                    list.Add(new TestParamStruct
                    {
                        name = "BatchCommands",
                        type = TestParamStructType.batchFile,
                        strValue = paramData.getStringValue("BatchCommands", ""),
                    });
                    break;
                case StepId.Plus:
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Text",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Text", "Test"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemNo",
                        type = TestParamStructType.uint8,
                        uint32Value = paramData.getByteValue("ItemNo", 0),
                    });
                    break;
                case StepId.Minus:
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Text",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Text", "Test"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemNo",
                        type = TestParamStructType.uint8,
                        uint32Value = paramData.getByteValue("ItemNo", 0),
                    });
                    break;
                case StepId.Inc:
                    list.Add(new TestParamStruct
                    {
                        name = "Rate",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getByteValue("Rate", 10),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Text",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Text", "Test"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemNo",
                        type = TestParamStructType.uint8,
                        uint32Value = paramData.getByteValue("ItemNo", 0),
                    });
                    break;
                case StepId.Dec:
                    list.Add(new TestParamStruct
                    {
                        name = "Rate",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getByteValue("Rate", 10),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Text",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Text", "Test"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "ItemNo",
                        type = TestParamStructType.uint8,
                        uint32Value = paramData.getByteValue("ItemNo", 0),
                    });
                    break;
                case StepId.SetInvoice:
                    list.Add(new TestParamStruct
                    {
                        name = "FaturaNo",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("FaturaNo", "123456789"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "TCKN",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("TCKN", "987987897"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "VKN",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("VKN", "12345678"),
                    });
                    selectionOptions = new List<string>();
                    foreach (EInvoiceFlags eInvoiceFlags in (EInvoiceFlags[])Enum.GetValues(typeof(EInvoiceFlags)))
                        selectionOptions.Add(eInvoiceFlags.ToString());
                    list.Add(new TestParamStruct
                    {
                        name = "flags",
                        type = TestParamStructType.multipleSelection,
                        strValue = paramData.getStringValue("flags", ""),
                        selectionOptions = selectionOptions
                    });
                    break;
                case StepId.ZRaporu:
                    list.Add(new TestParamStruct
                    {
                        name = "SupervisorPasword",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("SupervisorPasword", "0000"),
                    });
                    break;
                case StepId.XRaporu:
                    list.Add(new TestParamStruct
                    {
                        name = "SupervisorPasword",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("SupervisorPasword", "0000"),
                    });
                    break;
                case StepId.DelayMS:
                    list.Add(new TestParamStruct
                    {
                        name = "MiliSecond",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("MiliSecond", 1000),
                    });
                    break;
                case StepId.GiderPusulasi:
                    list.Add(new TestParamStruct
                    {
                        name = "AliciAdiSoyadi",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("AliciAdiSoyadi", "Ali Veli"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "AliciAdres",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("AliciAdres", "Maslak"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "AliciUnvan",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("AliciUnvan", "Hiçbirşeyci"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "SaticiAdiSoyadi",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("SaticiAdiSoyadi", "Abuzer Kadayıf"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "FaturaSeri",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("FaturaSeri", "12345"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "FaturaSira",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("FaturaSira", "678"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "StopajOrani",
                        type = TestParamStructType.uint16,
                        uint16Value = paramData.getUInt16Value("StopajOrani", 2000),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "KDVDahil",
                        type = TestParamStructType.boolean,
                        boolValue = paramData.getBoolValue("KDVDahil", false),
                    });
                    break;
                case StepId.ReversPayment:
                    selectionOptions = new List<string>();
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_MOBILE));
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_HEDIYE_CEKI));
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_PUAN));
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_BANK_CARD_REFUND));
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_TR_KAREKOD_CARD));
                    selectionOptions.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_CASH));
                    list.Add(new TestParamStruct
                    {
                        name = "PaymentType",
                        type = TestParamStructType.selection,
                        strValue = paramData.getStringValue("PaymentType", nameof(EPaymentTypes.REVERSE_PAYMENT_CASH)),
                        selectionOptions = selectionOptions
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Name",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("Name", "İade"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "PaymentInfo",
                        type = TestParamStructType.str,
                        strValue = paramData.getStringValue("PaymentInfo", "TsmTest"),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Amount",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Amount", 100),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "BkmID",
                        type = TestParamStructType.uint16,
                        uint16Value = paramData.getUInt16Value("BkmID", 62),
                    });
                    break;
                case StepId.GetTicket:
                    break;
                case StepId.PreTotal:
                    break;
                case StepId.GetMerchantSlip:
                    list.Add(new TestParamStruct
                    {
                        name = "PaymentIndex",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("PaymentIndex", 0),
                    });
                    list.Add(new TestParamStruct
                    {
                        name = "Font (HMS)",
                        type = TestParamStructType.uint32,
                        uint32Value = paramData.getUInt32Value("Font (HMS)", 263245), //HMS
                    });
                    break;
            }

            return list;
        }

        public static TTicketType GetTicketTypeParam(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            string ticketType = paramData.getStringValue("TicketType", "TProcessSale");

            return (TTicketType)Enum.Parse(typeof(TTicketType), ticketType);
        }

        public static List<BatchModeCommand> GetBatchModeCommands(Step step)
        {
            List<BatchModeCommand> batchModeCommands = new List<BatchModeCommand>();

            ParamData paramData = new ParamData(step.data);
            string batchText = paramData.getStringValue("BatchCommands", "").Trim();

            string[] lines = batchText.Split(';');

            foreach (string line in lines)
            {
                if (line.Length > 0)
                {
                    string[] pairs = line.Split('-');
                    if (pairs.Length > 1)
                    {
                        BatchModeCommand batchModeCommand = new BatchModeCommand(pairs[0].Trim(), pairs[1].Trim());
                        batchModeCommands.Add(batchModeCommand);
                    }
                }
            }

            return batchModeCommands;
        }

        public static ST_ITEM GetItemParam(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            ST_ITEM stItem = new ST_ITEM();

            if (paramData.getStringValue("Type", nameof(Defines.ITEM_TYPE_DEPARTMENT)).Equals(nameof(Defines.ITEM_TYPE_DEPARTMENT)))
            {
                stItem.type = Defines.ITEM_TYPE_DEPARTMENT;
                stItem.subType = 0;
            }
            else
            {
                stItem.type = Defines.ITEM_TYPE_MONEYCOLLECTION;
                string TypeOfMatrahsiz = paramData.getStringValue("TypeOfMatrahsız", ETypeOfMatrahsiz.MATRAHSIZ_TYPE_INVOICE_COLLECTION.ToString());
                stItem.subType = (byte)(ETypeOfMatrahsiz)Enum.Parse(typeof(ETypeOfMatrahsiz), TypeOfMatrahsiz);
                stItem.firm = paramData.getStringValue("Firm", "TÜRK TELEKOM A.Ş.");
                stItem.invoiceNo = paramData.getStringValue("invoiceNo", "A-12345678");
                stItem.subscriberId = paramData.getStringValue("subscriberId", "02124440333");
            }
            stItem.deptIndex = paramData.getByteValue("DepartmanIndex", 0);
            stItem.amount = paramData.getUInt32Value("Amount", 0);
            stItem.currency = (ushort)ECurrency.CURRENCY_TL;
            stItem.count = paramData.getUInt32Value("Count", 1);
            stItem.unitType = (byte)(EItemUnitTypes)Enum.Parse(typeof(EItemUnitTypes), paramData.getStringValue("UnitType", EItemUnitTypes.ITEM_NONE.ToString()));
            stItem.pluPriceIndex = 0;
            stItem.countPrecition = paramData.getByteValue("CountPrecition", 0);
            stItem.name = paramData.getStringValue("Name", "");
            stItem.barcode = "";

            return stItem;
        }

        public static ST_USER_MESSAGE GetUserMessageParam(Step step)
        {
            ST_USER_MESSAGE stUserMessage = new ST_USER_MESSAGE();

            ParamData paramData = new ParamData(step.data);

            Dictionary<string, UInt32> flagList = new Dictionary<string, UInt32>();
            flagList.Add(nameof(Defines.PS_16), Defines.PS_16);
            flagList.Add(nameof(Defines.PS_24), Defines.PS_24);
            flagList.Add(nameof(Defines.PS_38), Defines.PS_38);
            flagList.Add(nameof(Defines.PS_CENTER), Defines.PS_CENTER);
            flagList.Add(nameof(Defines.PS_BOLD), Defines.PS_BOLD);
            flagList.Add(nameof(Defines.PS_RIGHT), Defines.PS_RIGHT);
            string strValue = paramData.getStringValue("Flags", nameof(Defines.PS_38) + " | " + nameof(Defines.PS_CENTER));
            UInt32 flags = 0;
            foreach (string str in strValue.Split('|'))
            {
                if (str.Trim().Length > 0)
                    flags |= flagList[str.Trim()];
            }
            stUserMessage.flag = flags;

            stUserMessage.message = paramData.getStringValue("Message", "Hello World!");
            stUserMessage.len = (byte)stUserMessage.message.Length;

            return stUserMessage;
        }

        internal static ST_PAYMENT_REQUEST GetKrediParam(Step step)
        {
            ST_PAYMENT_REQUEST stPaymentRequest = new ST_PAYMENT_REQUEST();

            ParamData paramData = new ParamData(step.data);

            byte[] szUniqueID = new byte[17];
            GMPSmartDLL.GenerateUniqueID(szUniqueID);
            stPaymentRequest.BankPaymentUniqueId = GMP_Tools.GetStringFromBytes(szUniqueID);

            Dictionary<string, UInt32> subtypeOfPayments = new Dictionary<string, UInt32>();
            subtypeOfPayments.Add(nameof(Defines.PAYMENT_SUBTYPE_PROCESS_ON_POS), Defines.PAYMENT_SUBTYPE_PROCESS_ON_POS);
            subtypeOfPayments.Add(nameof(Defines.PAYMENT_SUBTYPE_SALE), Defines.PAYMENT_SUBTYPE_SALE);
            subtypeOfPayments.Add(nameof(Defines.PAYMENT_SUBTYPE_INSTALMENT_SALE), Defines.PAYMENT_SUBTYPE_INSTALMENT_SALE);
            subtypeOfPayments.Add(nameof(Defines.PAYMENT_SUBTYPE_LOYALTY_PUAN), Defines.PAYMENT_SUBTYPE_LOYALTY_PUAN);
            stPaymentRequest.subtypeOfPayment = subtypeOfPayments[paramData.getStringValue("SubPaymentType", nameof(Defines.PAYMENT_SUBTYPE_SALE))];

            stPaymentRequest.typeOfPayment = EPaymentTypes.PAYMENT_BANK_CARD;
            stPaymentRequest.AllowedInput = Defines.GMP3_CARD_SUPPORT_TYPE_ALL;
            stPaymentRequest.payAmount = paramData.getUInt32Value("Amount", 0);
            stPaymentRequest.payAmountCurrencyCode = (UInt16)ECurrency.CURRENCY_TL;
            stPaymentRequest.bankBkmId = 0;

            UInt32 transactionFlag = 0;

            Dictionary<string, UInt32> options = new Dictionary<string, UInt32>();
            options.Add(nameof(Defines.BANK_TRAN_FLAG_DO_NOT_ASK_FOR_MISSING_LOYALTY_POINT), Defines.BANK_TRAN_FLAG_DO_NOT_ASK_FOR_MISSING_LOYALTY_POINT);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_ALL_INPUT_FROM_EXTERNAL_SYSTEM), Defines.BANK_TRAN_FLAG_ALL_INPUT_FROM_EXTERNAL_SYSTEM);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_ASK_FOR_MISSING_REFUND_INPUTS), Defines.BANK_TRAN_FLAG_ASK_FOR_MISSING_REFUND_INPUTS);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_LOYALTY_POINT_NOT_SUPPORTED_FOR_TRANS), Defines.BANK_TRAN_FLAG_LOYALTY_POINT_NOT_SUPPORTED_FOR_TRANS);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_ONLINE_FORCED_TRANSACTION), Defines.BANK_TRAN_FLAG_ONLINE_FORCED_TRANSACTION);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_MANUAL_PAN_ENTRY_NOT_ALLOWED), Defines.BANK_TRAN_FLAG_MANUAL_PAN_ENTRY_NOT_ALLOWED);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_AUTHORISATION_FOR_INVOICE_PAYMENT), Defines.BANK_TRAN_FLAG_AUTHORISATION_FOR_INVOICE_PAYMENT);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_SALE_WITHOUT_CAMPAIGN), Defines.BANK_TRAN_FLAG_SALE_WITHOUT_CAMPAIGN);
            options.Add(nameof(Defines.BANK_TRAN_FLAG_SOFT_COPY_SUPPORT_FOR_MERCHANT_COPY), Defines.BANK_TRAN_FLAG_SOFT_COPY_SUPPORT_FOR_MERCHANT_COPY);
            string strValue = paramData.getStringValue("TransactionFlag", "");
            foreach (string str in strValue.Split('|'))
            {
                if (str.Trim().Length > 0)
                    transactionFlag |= options[str.Trim()];
            }
            stPaymentRequest.transactionFlag = transactionFlag; // 0x00000000;

            return stPaymentRequest;
        }
        internal static ST_PAYMENT_REQUEST GetYemekParam(Step step)
        {
            ST_PAYMENT_REQUEST stPaymentRequest = new ST_PAYMENT_REQUEST();

            ParamData paramData = new ParamData(step.data);

            byte[] szUniqueID = new byte[17];
            GMPSmartDLL.GenerateUniqueID(szUniqueID);
            stPaymentRequest.BankPaymentUniqueId = GMP_Tools.GetStringFromBytes(szUniqueID);
            stPaymentRequest.subtypeOfPayment = Defines.PAYMENT_SUBTYPE_SALE;
            stPaymentRequest.typeOfPayment = EPaymentTypes.PAYMENT_YEMEKCEKI;
            stPaymentRequest.AllowedInput = Defines.GMP3_CARD_SUPPORT_TYPE_ALL;
            stPaymentRequest.payAmount = paramData.getUInt32Value("Amount", 0);
            stPaymentRequest.payAmountCurrencyCode = (UInt16)ECurrency.CURRENCY_TL;
            stPaymentRequest.bankBkmId = paramData.getUInt16Value("AppID", 0);
            stPaymentRequest.transactionFlag = 0x00000000;

            return stPaymentRequest;
        }
        public static ST_PAYMENT_REQUEST GetNakitParam(Step step)
        {
            ST_PAYMENT_REQUEST stPaymentRequest = new ST_PAYMENT_REQUEST();

            ParamData paramData = new ParamData(step.data);

            stPaymentRequest.payAmount = paramData.getUInt32Value("Amount", 0);
            stPaymentRequest.typeOfPayment = EPaymentTypes.PAYMENT_CASH_TL;

            stPaymentRequest.payAmountCurrencyCode = (ushort)ECurrency.CURRENCY_TL;

            return stPaymentRequest;
        }

        public static ST_PAYMENT_REQUEST GetDigerOdemeParam(Step step)
        {
            ST_PAYMENT_REQUEST stPaymentRequest = new ST_PAYMENT_REQUEST();

            ParamData paramData = new ParamData(step.data);

            stPaymentRequest.payAmount = paramData.getUInt32Value("Amount", 0);
            Dictionary<string, UInt64> ePaymentTypes = new Dictionary<string, UInt64>();
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_MOBILE), EPaymentTypes.PAYMENT_MOBILE);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_HEDIYE_CEKI), EPaymentTypes.PAYMENT_HEDIYE_CEKI);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_IKRAM), EPaymentTypes.PAYMENT_IKRAM);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_ODEMESIZ), EPaymentTypes.PAYMENT_ODEMESIZ);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_KAPORA), EPaymentTypes.PAYMENT_KAPORA);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_PUAN), EPaymentTypes.PAYMENT_PUAN);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_BANKA_TRANSFERI), EPaymentTypes.PAYMENT_BANKA_TRANSFERI);
            ePaymentTypes.Add(nameof(EPaymentTypes.PAYMENT_CEK), EPaymentTypes.PAYMENT_CEK);

            stPaymentRequest.typeOfPayment = ePaymentTypes[paramData.getStringValue("PaymentType", nameof(EPaymentTypes.PAYMENT_BANKA_TRANSFERI))];

            stPaymentRequest.payAmountCurrencyCode = (ushort)ECurrency.CURRENCY_TL;

            return stPaymentRequest;
        }

        internal static void GetItemPlusAmount(Step step, ref uint changedAmount, ref string text, ref ushort itemNo)
        {
            ParamData paramData = new ParamData(step.data);

            changedAmount = paramData.getUInt32Value("Amount", 0);
            text = paramData.getStringValue("Text", "");
            itemNo = (ushort)paramData.getUInt32Value("ItemNo", 0); // 0xFFFF tüm fişe uygulanıyor.
        }

        internal static void GetItemMinusAmount(Step step, ref uint changedAmount, ref string text, ref ushort itemNo)
        {
            ParamData paramData = new ParamData(step.data);

            changedAmount = paramData.getUInt32Value("Amount", 0);
            text = paramData.getStringValue("Text", "");
            itemNo = (ushort)paramData.getUInt32Value("ItemNo", 0); // 0xFFFF tüm fişe uygulanıyor.
        }

        internal static void GetItemIncAmount(Step step, ref byte rate, ref string text, ref ushort itemNo)
        {
            ParamData paramData = new ParamData(step.data);

            rate = (byte)paramData.getUInt32Value("Rate", 0);
            text = paramData.getStringValue("Text", "");
            itemNo = (ushort)paramData.getUInt32Value("ItemNo", 0); // 0xFFFF tüm fişe uygulanıyor.
        }

        internal static void GetItemDecAmount(Step step, ref byte rate, ref string text, ref ushort itemNo)
        {
            ParamData paramData = new ParamData(step.data);

            rate = (byte)paramData.getUInt32Value("Rate", 0);
            text = paramData.getStringValue("Text", "");
            itemNo = (ushort)paramData.getUInt32Value("ItemNo", 0); // 0xFFFF tüm fişe uygulanıyor.
        }

        internal static ST_FUNCTION_PARAMETERS GetZReport(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            ST_FUNCTION_PARAMETERS stFunctionParameters = new ST_FUNCTION_PARAMETERS();

            stFunctionParameters.Password.supervisor = paramData.getStringValue("SupervisorPasword", "0000");

            return stFunctionParameters;
        }

        internal static ST_FUNCTION_PARAMETERS GetXReport(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            ST_FUNCTION_PARAMETERS stFunctionParameters = new ST_FUNCTION_PARAMETERS();

            stFunctionParameters.Password.supervisor = paramData.getStringValue("SupervisorPasword", "0000");

            return stFunctionParameters;
        }

        internal static ST_INVIOCE_INFO GetInvoiceInfo(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            ST_INVIOCE_INFO stInvoiceInfo = new ST_INVIOCE_INFO();

            stInvoiceInfo.source = 0;

            stInvoiceInfo.no = new byte[25];
            GMPForm.ConvertAscToBcdArray(paramData.getStringValue("FaturaNo", "123456789"), ref stInvoiceInfo.no, stInvoiceInfo.no.Length);
            stInvoiceInfo.tck_no = new byte[12];
            GMPForm.ConvertAscToBcdArray(paramData.getStringValue("TCKN", "987987897"), ref stInvoiceInfo.tck_no, stInvoiceInfo.tck_no.Length);
            stInvoiceInfo.vk_no = new byte[12];
            GMPForm.ConvertAscToBcdArray(paramData.getStringValue("VKN", "12345678"), ref stInvoiceInfo.vk_no, stInvoiceInfo.vk_no.Length);

            stInvoiceInfo.date = new byte[3];

            string dateStr = DateTime.Today.ToString("ddMMyy");
            GMPForm.ConvertStringToHexArray(dateStr, ref stInvoiceInfo.date, 3);
            Array.Reverse(stInvoiceInfo.date);

            Dictionary<string, EInvoiceFlags> flagList = new Dictionary<string, EInvoiceFlags>();
            foreach (EInvoiceFlags eInvoiceFlags in (EInvoiceFlags[])Enum.GetValues(typeof(EInvoiceFlags)))
                flagList.Add(eInvoiceFlags.ToString(), eInvoiceFlags);
            string strValue = paramData.getStringValue("flags", "");
            UInt32 flags = 0;
            foreach (string str in strValue.Split('|'))
            {
                if (str.Trim().Length > 0)
                    flags |= (uint)flagList[str.Trim()];
            }
            stInvoiceInfo.flag = flags;

            return stInvoiceInfo;
        }

        internal static UInt64 GetSetOptionParam(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            UInt64 param = 0;

            Dictionary<string, UInt64> options = new Dictionary<string, UInt64>();
            options.Add(nameof(Defines.GMP3_OPTION_ECHO_PRINTER), Defines.GMP3_OPTION_ECHO_PRINTER);
            options.Add(nameof(Defines.GMP3_OPTION_ECHO_PAYMENT_DETAILS), Defines.GMP3_OPTION_ECHO_PAYMENT_DETAILS);
            options.Add(nameof(Defines.GMP3_OPTION_ECHO_ITEM_DETAILS), Defines.GMP3_OPTION_ECHO_ITEM_DETAILS);
            options.Add(nameof(Defines.GMP3_OPTION_NO_RECEIPT_LIMIT_CONTROL_FOR_ITEMS), Defines.GMP3_OPTION_NO_RECEIPT_LIMIT_CONTROL_FOR_ITEMS);
            options.Add(nameof(Defines.GMP3_OPTION_DONOT_CONTROL_PAYMENTS_FOR_RECEIPT_CANCEL), Defines.GMP3_OPTION_DONOT_CONTROL_PAYMENTS_FOR_RECEIPT_CANCEL);
            options.Add(nameof(Defines.GMP3_OPTION_GET_CONFIRMATION_FOR_PAYMENT_CANCEL), Defines.GMP3_OPTION_GET_CONFIRMATION_FOR_PAYMENT_CANCEL);
            options.Add(nameof(Defines.GMP3_OPTION_ECHO_LOYALTY_DETAILS), Defines.GMP3_OPTION_ECHO_LOYALTY_DETAILS);
            options.Add(nameof(Defines.GMP3_OPTION_SAVE_LAST_TRANS), Defines.GMP3_OPTION_SAVE_LAST_TRANS);
            string strValue = paramData.getStringValue("Options", nameof(Defines.GMP3_OPTION_ECHO_PRINTER) + " | " + nameof(Defines.GMP3_OPTION_ECHO_ITEM_DETAILS) + " | " + nameof(Defines.GMP3_OPTION_ECHO_PAYMENT_DETAILS));
            foreach (string str in strValue.Split('|'))
            {
                if (str.Trim().Length > 0)
                    param |= options[str.Trim()];
            }

            return param;
        }

        internal static void GetVoidItemParams(Step step, ref ushort itemIdex, ref ulong itemCount, ref byte itemCountPrecision)
        {
            ParamData paramData = new ParamData(step.data);

            itemIdex = paramData.getUInt16Value("ItemIndex", 0);
            itemCount = paramData.getUInt64Value("ItemCount", 1);
            itemCountPrecision = paramData.getByteValue("ItemCountPrecision", 0);
        }

        internal static int GetDelayMS(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            return (int)paramData.getUInt32Value("MiliSecond", 1000);
        }

        internal static ST_GIDER_PUSULASI GetGiderPusulasi(Step step)
        {
            ST_GIDER_PUSULASI result = new ST_GIDER_PUSULASI();

            ParamData paramData = new ParamData(step.data);

            result.AliciAdiSoyadi = paramData.getStringValue("AliciAdiSoyadi", "Ali Veli");
            result.AliciAdres = paramData.getStringValue("AliciAdres", "Maslak");
            result.AliciUnvan = paramData.getStringValue("AliciUnvan", "Hiçbirşeyci");
            result.SaticiAdiSoyadi = paramData.getStringValue("SaticiAdiSoyadi", "Abuzer Kadayıf");
            result.FaturaSeri = paramData.getStringValue("FaturaSeri", "12345");
            result.FaturaSira = paramData.getStringValue("FaturaSira", "678");
            result.FaturaTarih = DateTime.Now.ToString("MM.dd.yyyy");
            result.StopajOrani = paramData.getUInt16Value("StopajOrani", 2000);
            result.KDVDahil = paramData.getBoolValue("KDVDahil", false);

            return result;
        }

        internal static ST_PAYMENT_REQUEST GetReversPayment(Step step)
        {
            ST_PAYMENT_REQUEST result = new ST_PAYMENT_REQUEST();

            ParamData paramData = new ParamData(step.data);

            Dictionary<string, UInt64> paymentTypes = new Dictionary<string, UInt64>();
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_MOBILE), EPaymentTypes.REVERSE_PAYMENT_MOBILE);
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_HEDIYE_CEKI), EPaymentTypes.REVERSE_PAYMENT_HEDIYE_CEKI);
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_PUAN), EPaymentTypes.REVERSE_PAYMENT_PUAN);
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_BANK_CARD_REFUND), EPaymentTypes.REVERSE_PAYMENT_BANK_CARD_REFUND);
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_TR_KAREKOD_CARD), EPaymentTypes.REVERSE_TR_KAREKOD_CARD);
            paymentTypes.Add(nameof(EPaymentTypes.REVERSE_PAYMENT_CASH), EPaymentTypes.REVERSE_PAYMENT_CASH);
            string strValue = paramData.getStringValue("PaymentType", nameof(EPaymentTypes.REVERSE_PAYMENT_CASH));
            result.typeOfPayment = (ulong)paymentTypes[strValue];

            result.paymentName = paramData.getStringValue("Name", "İade");
            result.paymentInfo = paramData.getStringValue("PaymentInfo", "TsmTest");
            result.subtypeOfPayment = 0;
            result.payAmount = paramData.getUInt32Value("Amount", 100);
            result.payAmountCurrencyCode = (ushort)ECurrency.CURRENCY_TL;
            result.payAmountBonus = 0;
            result.bankBkmId = paramData.getUInt16Value("BkmID", 62);
            result.numberOfinstallments = 0;

            //result.terminalId = ;
            //result.BankPaymentUniqueId;
            //result.OrgTransData;
            //result.batchNo;
            //result.stanNo;
            result.rawDataLen = 0;
            //result.rawData;
            result.transactionFlag = 0;
            result.flags = 0;
            //result.LoyaltyCustomerId;
            //result.PaymentProvisionId;
            //result.LoyaltyServiceId;
            //result.AllowedInput;

            return result;
        }

        internal static int GetMerchantSlipOdemeIndex(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            return (int)paramData.getUInt32Value("PaymentIndex", 0);
        }

        internal static uint GetMerchantSlipFont(Step step)
        {
            ParamData paramData = new ParamData(step.data);

            return paramData.getUInt32Value("Font (HMS)", 263245); // HMS
        }
    }
}
