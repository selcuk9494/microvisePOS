using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace GmpSampleSim
{
    public partial class TransactionRestrictionForm : Form
    {

        private UInt32 paramsValue = 0;

        public TransactionRestrictionForm()
        {
            InitializeComponent();

            Thread getParam = new Thread(startingProcess);
            getParam.IsBackground = true;
            getParam.Start();
        }

        private void startingProcess()
        {
            getParams();
            calculateFromParamValue();
        }

        private void paramsCheckedList_SelectedIndexChanged(object sender, EventArgs e)
        {
            calculateFromCheckList();
        }

        private void getParamsButton_Click(object sender, EventArgs e)
        {
            getParams();
            calculateFromParamValue();
        }

        private void setParamsButton_Click(object sender, EventArgs e)
        {
            setParams();
        }

        private void calculateFromCheckList()
        {
            UInt32 result = 0;

            for (int i = 0; i < paramsCheckedList.Items.Count; i++)
            {
                if (paramsCheckedList.GetItemChecked(i))
                    result |= ConvertIndexToParamsValue(i);
            }

            paramsGroup.Text = "Params [0x" + result.ToString("X8") + "]";
            paramsValue = result;
        }

        private void calculateFromParamValue()
        {
            paramsGroup.Text = "Params [0x" + paramsValue.ToString("X8") + "]";
            for (int i = 0; i < paramsCheckedList.Items.Count; i++)
            {
                if ((paramsValue & ConvertIndexToParamsValue(i)) != 0)
                    paramsCheckedList.SetItemChecked(i, true);
                else
                    paramsCheckedList.SetItemChecked(i, false);
            }
        }

        private void getParams()
        {
            getParamsButton.Text = "Sorgulanıyor";
            getParamsButton.Enabled = false;
            setParamsButton.Enabled = false;
            paramsCheckedList.Enabled = false;
            paramsGroup.Enabled = false;

            uint resp = 0;
            byte[] TempArr = new byte[4];
            short TempLen = 0;
            int start = Environment.TickCount;
            resp = GMPSmartDLL.FP3_GetTlvData(GMPForm.CurrentInterface, Defines.GMP_EXT_DEVICE_FUNCTION_DISABLE_FLAGS, TempArr, (short)TempArr.Length, ref TempLen);
            GMPForm.SetFunctionCallLog("FP3_GetTlvData", resp, start);
            ErrorClass.DisplayErrorMessage("FP3_GetTlvData", resp);
            if (resp == 0)
            {
                paramsValue = BitConverter.ToUInt32(TempArr, 0);
            }

            getParamsButton.Enabled = true;
            setParamsButton.Enabled = true;
            paramsCheckedList.Enabled = true;
            paramsGroup.Enabled = true;
            getParamsButton.Text = "Getir";
        }

        private void setParams()
        {
            setParamsButton.Text = "Gönderiliyor";
            getParamsButton.Enabled = false;
            setParamsButton.Enabled = false;
            paramsCheckedList.Enabled = false;
            paramsGroup.Enabled = false;
            byte[] arr = BitConverter.GetBytes(paramsValue);

            int start = Environment.TickCount;
            UInt32 RetCode = GMPSmartDLL.FP3_SetTlvData(GMPForm.CurrentInterface, Defines.GMP_EXT_DEVICE_FUNCTION_DISABLE_FLAGS, arr, (UInt16)arr.Length);
            GMPForm.SetFunctionCallLog("FP3_SetTlvData", RetCode, start);
            ErrorClass.DisplayErrorMessage("FP3_SetTlvData", RetCode);
            getParamsButton.Enabled = true;
            setParamsButton.Enabled = true;
            paramsCheckedList.Enabled = true;
            paramsGroup.Enabled = true;
            setParamsButton.Text = "Gönder";
        }

        private UInt32 ConvertIndexToParamsValue(int Index)
        {
            UInt32 Result = 0;

            switch (Index)
            {
                case 0:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_PLU_GIRISLI_SATIS;
                    break;
                case 1:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_DEPT_GIRISLI_SATIS;
                    break;
                case 2:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_SERB_GIRISLI_SATIS;
                    break;
                case 3:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_INDIRIM_ARTTIRIM;
                    break;
                case 4:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_MANUAL_SATIS;
                    break;
                case 5:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_KREDILI_AVANS_ODEME;
                    break;
                case 6:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_TAXLESS;
                    break;
                case 7:
                    Result = Defines.FLAG_ING_PARAM_ENABLE_F_MENU_PASSWORD;
                    break;
                case 8:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_KREDILI_CARI_HESAP_ODEME;
                    break;
                case 9:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_ECR_RECEIPT;
                    break;
                case 10:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_INVOICE_INFO_RECEIPT;
                    break;
                case 11:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_FOOCARD_INFO_RECEIPT;
                    break;
                case 12:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_BANKA_MENU;
                    break;
                case 13:
                    Result = Defines.FLAG_ING_PARAM_DISABLE_SEKTOREL_MENU;
                    break;
            }

            return Result;
        }

    }
}
