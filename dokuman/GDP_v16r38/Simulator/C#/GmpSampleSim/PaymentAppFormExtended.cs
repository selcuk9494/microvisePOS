using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows.Forms;

namespace GmpSampleSim
{

    public partial class PaymentAppFormExtended : Form
    {
        public PaymentAppFormExtended()
        {
            InitializeComponent();
        }

        public Boolean GetMecrhantSlipSoftCopy()
        {
            return m_chkBoxMecrhantSlipSoftCopy.Checked;
        }

        public byte numberOfTotalRecords;
      
        public byte m_AllowedIputs = 0;

        public ST_PAYMENT_APPLICATION_INFO[] stPaymentApplicationInfo2;
        public ST_PAYMENT_APPLICATION_INFO pstPaymentApplicationInfoSelected;

        public ST_LOYALTY_SERVICE_INFO[] m_stLoyaltyServiceInfo;

        private int[] AppArrayIndex = new int[24];
        private int AppIndex = 0;

        string getAppTypeName(ushort m_typeOfPayment)
        {

            if (m_typeOfPayment == 0)
                return "";


            EVasType typeOfPayment = (EVasType)m_typeOfPayment;

            switch (typeOfPayment)
            {
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_ADISYON:
                    return "TYPE_ADISYON";
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_IN_FLIGHT:
                    return ("TYPE_IN_FLIGHT");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_WORLDLINE:
                    return ("TYPE_WORLDLINE");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_OTHER:
                    return ("TYPE_OTHER");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_AKTIFNOKTA:
                    return ("TYPE_AKTIF.");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_MOBIL_ODEME:
                    return ("TYPE_MOBIL_ODEME");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_OTOPARK:
                    return ("TYPE_OTOPARK");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_YEMEKCEKI:
                    return ("TYPE_YEMEKCEKI");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_LOYALTY:
                    return ("TYPE_LOYALTY");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_PAYMENT:
                    return ("TYPE_ODEME");
                case EVasType.TLV_OKC_ASSIST_VAS_TYPE_ALL:
                    return "";
                default:
                    return ("TYPE_UNKNOWN");
            }
        }

        public PaymentAppFormExtended(byte numberOfTotalRecordsReceived, ST_PAYMENT_APPLICATION_INFO[] stPaymentApplicationInfo, UInt64 PaymentType)
        {
            InitializeComponent();

            m_chkBoxMecrhantSlipSoftCopy.Checked = false;

            stPaymentApplicationInfo2 = new ST_PAYMENT_APPLICATION_INFO[24];

            AppIndex = 0;
            Array.Copy(stPaymentApplicationInfo, stPaymentApplicationInfo2, stPaymentApplicationInfo.Length);
            for (int i = 0; i < numberOfTotalRecordsReceived; i++)
            {
                if(PaymentType != EPaymentTypes.PAYMENT_BANK_CARD)
                {
                    if ((stPaymentApplicationInfo[i].SupportedPayments & PaymentType) == 0)
                    {
                        continue;
                    }        
                }

                string str = "";
                str += GMP_Tools.GetStringFromBytes(stPaymentApplicationInfo[i].name) +
                    " [" + stPaymentApplicationInfo[i].u16BKMId.ToString() + "] " +
                    " [" + stPaymentApplicationInfo[i].u16AppId.ToString("X2") + "] " +
                    " [" + stPaymentApplicationInfo[i].Status.ToString() + "] " +
                    " [" + stPaymentApplicationInfo[i].Priority.ToString() + "]" +
                    " [" + stPaymentApplicationInfo[i].SupportedPayments.ToString("X8") + "]" +
                    " [" + getAppTypeName(stPaymentApplicationInfo[i].AppType) + "]" +
                    " [" + stPaymentApplicationInfo[i].Version + "]";

                m_listPaymentApplications.Items.Add(str);
                AppArrayIndex[AppIndex] = i;
                AppIndex++;
            }
            if (numberOfTotalRecordsReceived > 0)
                pstPaymentApplicationInfoSelected = null;
        }

        UInt64 GetPaymentType(string Text)
        {
            switch (Text)
            {
                case ("PAYMENT_CASH"):
                    return EPaymentTypes.PAYMENT_CASH_TL;
                case ("PAYMENT_BANK_CARD"):
                    return EPaymentTypes.PAYMENT_BANK_CARD;
                case ("PAYMENT_YEMEKCEKI"):
                    return EPaymentTypes.PAYMENT_YEMEKCEKI;
                case ("PAYMENT_MOBILE"):
                    return EPaymentTypes.PAYMENT_MOBILE;
                case ("PAYMENT_HEDIYE_CEKI"):
                    return EPaymentTypes.PAYMENT_HEDIYE_CEKI;
                case ("PAYMENT_IKRAM"):
                    return EPaymentTypes.PAYMENT_IKRAM;
                case ("PAYMENT_ODEMESIZ"):
                    return EPaymentTypes.PAYMENT_ODEMESIZ;
                case ("PAYMENT_KAPORA"):
                    return EPaymentTypes.PAYMENT_KAPORA;
                case ("PAYMENT_PUAN"):
                    return EPaymentTypes.PAYMENT_PUAN;
                case ("PAYMENT_GIDER_PUSULASI"):
                    return EPaymentTypes.PAYMENT_GIDER_PUSULASI;
                case ("PAYMENT_BANKA_TRANSFERI"):
                    return EPaymentTypes.PAYMENT_BANKA_TRANSFERI;
                case ("PAYMENT_CEK"):
                    return EPaymentTypes.PAYMENT_CEK;
                case ("PAYMENT_ACIK_HESAP"):
                    return EPaymentTypes.PAYMENT_ACIK_HESAP;
                case ("PAYMENT_DIGER"):
                    return EPaymentTypes.PAYMENT_DIGER;
                case ("PAYMENT_EXTERNAL_BANK"):
                    return EPaymentTypes.PAYMENT_EXTERNAL_BANK;
                case ("PAYMENT_SANAL_POS"):
                    return EPaymentTypes.PAYMENT_SANAL_POS;
                case ("PAYMENT_EPARA_HIZLI_PARA"):
                    return EPaymentTypes.PAYMENT_EPARA_HIZLI_PARA;
                case ("PAYMENT_ULASIM_KARTI"):
                    return EPaymentTypes.PAYMENT_ULASIM_KARTI;
                case ("PAYMENT_COMBINED"):
                    return EPaymentTypes.PAYMENT_COMBINED;

                case ("PAYMENT_TR_KAREKOD_CARD"):
                    return EPaymentTypes.PAYMENT_TR_KAREKOD_CARD;
                case ("PAYMENT_TR_KAREKOD_FAST"):
                    return EPaymentTypes.PAYMENT_TR_KAREKOD_FAST;
                case ("PAYMENT_TR_KAREKOD_MOBIL"):
                    return EPaymentTypes.PAYMENT_TR_KAREKOD_MOBIL;
                case ("PAYMENT_TR_KAREKOD_DIGER"):
                    return EPaymentTypes.PAYMENT_TR_KAREKOD_DIGER;
                default:
                    return EPaymentTypes.PAYMENT_BANK_CARD;
            }
        }

        private string GetPaymentTypeName(UInt64 SupportedPayment)
        {
            switch (SupportedPayment)
            {
                case EPaymentTypes.PAYMENT_CASH_TL:
                    return ("PAYMENT_CASH");
                case EPaymentTypes.PAYMENT_BANK_CARD:
                    return ("PAYMENT_BANK_CARD");
                case EPaymentTypes.PAYMENT_YEMEKCEKI:
                    return ("PAYMENT_YEMEKCEKI");
                case EPaymentTypes.PAYMENT_MOBILE:
                    return ("PAYMENT_MOBILE");
                case EPaymentTypes.PAYMENT_HEDIYE_CEKI:
                    return ("PAYMENT_HEDIYE_CEKI");
                case EPaymentTypes.PAYMENT_IKRAM:
                    return ("PAYMENT_IKRAM");
                case EPaymentTypes.PAYMENT_ODEMESIZ:
                    return ("PAYMENT_ODEMESIZ");
                case EPaymentTypes.PAYMENT_KAPORA:
                    return ("PAYMENT_KAPORA");
                case EPaymentTypes.PAYMENT_PUAN:
                    return ("PAYMENT_PUAN");
                case EPaymentTypes.PAYMENT_GIDER_PUSULASI:
                    return ("PAYMENT_GIDER_PUSULASI");
                case EPaymentTypes.PAYMENT_BANKA_TRANSFERI:
                    return ("PAYMENT_BANKA_TRANSFERI");
                case EPaymentTypes.PAYMENT_CEK:
                    return ("PAYMENT_CEK");
                case EPaymentTypes.PAYMENT_ACIK_HESAP:
                    return ("PAYMENT_ACIK_HESAP");
                case EPaymentTypes.PAYMENT_DIGER:
                    return ("PAYMENT_DIGER");
                case EPaymentTypes.PAYMENT_EXTERNAL_BANK:
                    return ("PAYMENT_EXTERNAL_BANK");
                case EPaymentTypes.PAYMENT_SANAL_POS:
                    return ("PAYMENT_SANAL_POS");
                case EPaymentTypes.PAYMENT_EPARA_HIZLI_PARA:
                    return ("PAYMENT_EPARA_HIZLI_PARA");
                case EPaymentTypes.PAYMENT_ULASIM_KARTI:
                    return ("PAYMENT_ULASIM_KARTI");
                case EPaymentTypes.PAYMENT_COMBINED:
                    return ("PAYMENT_COMBINED");
                case EPaymentTypes.PAYMENT_TR_KAREKOD_CARD:
                    return ("PAYMENT_TR_KAREKOD_CARD");
                case EPaymentTypes.PAYMENT_TR_KAREKOD_FAST:
                    return ("PAYMENT_TR_KAREKOD_FAST");
                case EPaymentTypes.PAYMENT_TR_KAREKOD_MOBIL:
                    return ("PAYMENT_TR_KAREKOD_MOBIL");
                case EPaymentTypes.PAYMENT_TR_KAREKOD_DIGER:
                    return ("PAYMENT_TR_KAREKOD_DIGER");
                default:
                    return ("UNDEFINED_PAYMENT");
            }
        }

        private byte GetPaymentInput(string text)
        {
            switch (text)
            {
                case ("CHIP"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_CHIP;
                case ("SWIPE"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_SWIPE;
                case ("MANUEL"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_MANUAL;
                case ("CLESS"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_CLESS;
                case ("QR_POS"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_QR_POS_PRESENT;
                default:
                case ("ALL_TYPES"):
                    return Defines.GMP3_CARD_SUPPORT_TYPE_ALL;
            }
        }

        private void m_listPaymentApplications_SelectedIndexChanged(object sender, EventArgs e)
        {
            int i = m_listPaymentApplications.SelectedIndex;

            if (i >= 0)
            {
                pstPaymentApplicationInfoSelected = stPaymentApplicationInfo2[AppArrayIndex[i]];
                if ((pstPaymentApplicationInfoSelected.AppOpt2 & Defines.APP_OPT2_SUPPORT_GET_MERCHANT_SLIP) == Defines.APP_OPT2_SUPPORT_GET_MERCHANT_SLIP)
                    m_chkBoxMecrhantSlipSoftCopy.Enabled = true;
                else
                {
                    m_chkBoxMecrhantSlipSoftCopy.Enabled = false;
                    m_chkBoxMecrhantSlipSoftCopy.Checked = false;
                }
            }
            else
                return;

            UInt64 SupportedPayments = stPaymentApplicationInfo2[AppArrayIndex[i]].SupportedPayments;

            FieldInfo[] fieldInfos = typeof(EPaymentTypes).GetFields(BindingFlags.Public | BindingFlags.Static);
            
            m_listAllowedInputs.ClearSelected();
            m_listAllowedInputs.Items.Add("ALL_TYPES");
            m_listAllowedInputs.Items.Add("CHIP");
            m_listAllowedInputs.Items.Add("SWIPE");
            m_listAllowedInputs.Items.Add("MANUEL");
            m_listAllowedInputs.Items.Add("CLESS");
            m_listAllowedInputs.Items.Add("QR_POS");
        }

        private void m_listAllowedInputs_SelectedIndexChanged(object sender, EventArgs e)
        {
            int Count = m_listAllowedInputs.SelectedItems.Count;

            m_AllowedIputs = 0;
            for (int i = 0; i < Count; ++i)
                m_AllowedIputs += GetPaymentInput(m_listAllowedInputs.SelectedItems[i].ToString());
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.OK;
            Close();
        }

        private void m_listPaymentApplications_DoubleClick(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.OK;
            Close();
        }

        private void m_listAllowedInputs_DoubleClick(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.OK;
            Close();
        }

        private void PaymentAppFormExtended_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                this.DialogResult = DialogResult.OK;
                Close();
            }
        }
    }

}
