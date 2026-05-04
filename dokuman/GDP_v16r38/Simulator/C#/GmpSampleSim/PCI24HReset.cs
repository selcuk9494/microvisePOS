using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace GmpSampleSim
{
    public partial class PCI24HReset : Form
    {
        public UInt32 hInt;

        public PCI24HReset()
        {
            InitializeComponent();
        }

        private void setResetTime_Click(object sender, EventArgs e)
        {
            try
            {
                ST_PCI_24H_RESET_INFO pci24HReset = new ST_PCI_24H_RESET_INFO();
                pci24HReset.szStartTime = startTime.Text.Substring(0, 2) + startTime.Text.Substring(3, 2);
                pci24HReset.szEndTime = endTime.Text.Substring(0, 2) + endTime.Text.Substring(3, 2);
                int.TryParse(beforeManager.Text, out int temp);
                pci24HReset.BeforeManager = (byte)temp;

                int start = Environment.TickCount;
                UInt32 errorCode = Json_GMPSmartDLL.FP3_Set24HResetTime(hInt, ref pci24HReset, 3000);
                GMPForm.SetFunctionCallLog("FP3_Set24HResetTime", errorCode, start);

                byte[] TempErrorBuffer = new byte[256];
                GMPSmartDLL.GetErrorMessage(errorCode, TempErrorBuffer);
                result.Text = "Hata Kodu = 0x" + errorCode.ToString("X2").PadLeft(4, '0') + " : " + GMP_Tools.SetEncoding(TempErrorBuffer);
            }
            catch (Exception ex)
            {
                result.Text = ex.Message;
            }
        }

        private void beforeManager_TextChanged(object sender, EventArgs e)
        {
            int number;
            if (int.TryParse(beforeManager.Text, out number))
            {
                if ((number >= 20) & (number <= 250))
                    setResetTime.Enabled = true;
                else
                    setResetTime.Enabled = false;
            }
            else
                setResetTime.Enabled = false;
        }

        private void beforeManager_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (!char.IsControl(e.KeyChar) && !char.IsDigit(e.KeyChar))
                e.Handled = true;
        }

        private void getResetTime_Click(object sender, EventArgs e)
        {
            try
            {
                ST_PCI_24H_RESET_INFO pci24HReset = new ST_PCI_24H_RESET_INFO();
                int start = Environment.TickCount;
                UInt32 errorCode = Json_GMPSmartDLL.FP3_Get24HResetTime(hInt, ref pci24HReset, 3000);
                GMPForm.SetFunctionCallLog("FP3_Get24HResetTime", errorCode, start);

                byte[] TempErrorBuffer = new byte[256];
                GMPSmartDLL.GetErrorMessage(errorCode, TempErrorBuffer);
                result.Text = "Hata Kodu = 0x" + errorCode.ToString("X2").PadLeft(4, '0') + " : " + GMP_Tools.SetEncoding(TempErrorBuffer);

                if (errorCode == ErrorCodes.TRAN_RESULT_OK)
                {
                    startTime.Text = pci24HReset.szStartTime.Substring(0, 2) + ":" + pci24HReset.szStartTime.Substring(2, 2);
                    endTime.Text = pci24HReset.szEndTime.Substring(0, 2) + ":" + pci24HReset.szEndTime.Substring(2, 2);
                    beforeManager.Text = pci24HReset.BeforeManager.ToString();
                }
            }
            catch (Exception ex)
            {
                result.Text = ex.Message;
            }
        }
    }
}
