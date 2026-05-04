using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Forms;

namespace GmpSampleSim
{
    class ErrorClass
    {
        public static GMPForm errCls;

        public static void DisplayErrorMessage(String functionName, UInt32 errorCode)
        {
            byte[] TempErrorBuffer = new byte[256];

            GMPSmartDLL.GetErrorMessage(errorCode, TempErrorBuffer);

            string str = "";
            if (functionName != null)
                str = "Functin =" + functionName + " - ";
            str += "Hata Kodu = " + errorCode.ToString() + " (0x" + errorCode.ToString("X4") + ") : " + GMP_Tools.SetEncoding(TempErrorBuffer);
            errCls.m_lblErrorCode.Text = str;
        }
    }
}
