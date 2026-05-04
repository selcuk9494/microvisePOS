using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO.Ports;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GmpSampleSim
{
    public partial class InterfaceEditForm : Form
    {
        private int currentInterface = 0;
        private UInt32[] InterfaceList = new UInt32[20];

        public UInt32 CurrentInterface
        { 
            get { return (uint)currentInterface; } 
            set { currentInterface = (int)value; }
        }

        public InterfaceEditForm()
        {
            InitializeComponent();
        }

        private void InterfaceEditForm_Load(object sender, EventArgs e)
        {
            LoadData();
        }

        private void LoadData()
        {
            interfaceList.Items.Clear();

            int start = Environment.TickCount;
            UInt32 InterfaceCount = GMPSmartDLL.FP3_GetInterfaceHandleList(InterfaceList, (UInt32)InterfaceList.Length);
            GMPForm.SetFunctionCallLog("FP3_GetInterfaceHandleList", InterfaceCount, start);

            for (UInt32 Index = 0; Index < InterfaceCount; ++Index)
            {
                byte[] ID = new byte[64];
                start = Environment.TickCount;
                UInt32 retcode = GMPSmartDLL.FP3_GetInterfaceID(InterfaceList[Index], ID, (UInt32)ID.Length);
                GMPForm.SetFunctionCallLog("FP3_GetInterfaceID", retcode, start);
                string Handle = InterfaceList[Index].ToString("X8") + "-" + GMP_Tools.SetEncoding(ID);

                interfaceList.Items.Add(Handle);
            }

            for (UInt32 Index = 0; Index < InterfaceCount; ++Index)
            {
                if (InterfaceList[Index] == currentInterface)
                {
                    interfaceList.SelectedIndex = (int)Index;
                    break;
                }
            }
        }

        private void interfaceList_SelectedIndexChanged(object sender, EventArgs e)
        {
            ST_INTERFACE_XML_DATA stXmlData = new ST_INTERFACE_XML_DATA();
            byte[] ID = new byte[64];

            int start = Environment.TickCount;
            UInt32 retcode = GMPSmartDLL.FP3_GetInterfaceID(InterfaceList[interfaceList.SelectedIndex], ID, (UInt32)ID.Length);
            GMPForm.SetFunctionCallLog("FP3_GetInterfaceID", retcode, start);
            start = Environment.TickCount;
            retcode = Json_GMPSmartDLL.FP3_GetInterfaceXmlDataByHandle(InterfaceList[interfaceList.SelectedIndex], ref stXmlData);
            GMPForm.SetFunctionCallLog("FP3_GetInterfaceXmlDataByHandle", retcode, start);

            SetXmlDataToField(GMP_Tools.SetEncoding(ID), stXmlData);
            cancel.Enabled = false;
            save.Enabled = false;
            deleteInterface.Enabled = true;
            addInterface.Enabled = true;
        }

        private void SetXmlDataToField(string Id, ST_INTERFACE_XML_DATA stXmlData)
        {
            id.Text = Id;
            isTcpConnection.Checked = stXmlData.IsTcpConnection != 0;
            isTcpKeepAlive.Checked = stXmlData.IsTcpKeepAlive != 0;
            retryCounter.Text = stXmlData.RetryCounter.ToString();
            ipRetryCount.Text = stXmlData.IpRetryCount.ToString();
            ackTimeOut.Text = stXmlData.AckTimeOut.ToString();
            commTimeOut.Text = stXmlData.CommTimeOut.ToString();
            interCharacterTimeOut.Text = stXmlData.InterCharacterTimeOut.ToString();
            portName.Text = stXmlData.PortName;
            baudRate.Text = stXmlData.BaudRate.ToString();
            byteSize.Text = stXmlData.ByteSize.ToString();
            fParity.Text = stXmlData.fParity.ToString();
            parity.Text = stXmlData.Parity.ToString();
            stopBit.Text = stXmlData.StopBit.ToString();
            ip.Text = stXmlData.IP;
            port.Text = stXmlData.Port.ToString();

            SetFieldEnable();
        }

        private void SetFieldEnable()
        {
            if (isTcpConnection.Checked)
            {
                portName.Enabled = false;
                baudRate.Enabled = false;
                byteSize.Enabled = false;
                fParity.Enabled = false;
                parity.Enabled = false;
                stopBit.Enabled = false;
                ip.Enabled = true;
                port.Enabled = true;
                isTcpKeepAlive.Enabled = true;
            }
            else
            {
                portName.Enabled = true;
                baudRate.Enabled = true;
                byteSize.Enabled = true;
                fParity.Enabled = true;
                parity.Enabled = true;
                stopBit.Enabled = true;
                ip.Enabled = false;
                port.Enabled = false;
                isTcpKeepAlive.Enabled = false;
            }
        }

        private void cancel_Click(object sender, EventArgs e)
        {
            interfaceList_SelectedIndexChanged(sender, e);
        }

        private void save_Click(object sender, EventArgs e)
        {
            ST_INTERFACE_XML_DATA stXmlData = new ST_INTERFACE_XML_DATA();

            stXmlData.IsTcpConnection = (byte)(isTcpConnection.Checked ? 1 : 0);
            stXmlData.IsTcpKeepAlive = (byte)(isTcpKeepAlive.Checked ? 1 : 0);
            Byte.TryParse(retryCounter.Text, out stXmlData.RetryCounter);
            Byte.TryParse(ipRetryCount.Text, out stXmlData.IpRetryCount);
            UInt32.TryParse(ackTimeOut.Text, out stXmlData.AckTimeOut);
            UInt32.TryParse(commTimeOut.Text, out stXmlData.CommTimeOut);
            UInt32.TryParse(interCharacterTimeOut.Text, out stXmlData.InterCharacterTimeOut);
            stXmlData.PortName = portName.Text;
            Int32.TryParse(baudRate.Text, out stXmlData.BaudRate);
            Int32.TryParse(byteSize.Text, out stXmlData.ByteSize);
            Int32.TryParse(fParity.Text, out stXmlData.fParity);
            Int32.TryParse(parity.Text, out stXmlData.Parity);
            Int32.TryParse(stopBit.Text, out stXmlData.StopBit);
            stXmlData.IP = ip.Text;
            Int32.TryParse(port.Text, out stXmlData.Port);
            int start = Environment.TickCount;
            UInt32 retcode = Json_GMPSmartDLL.FP3_UpdateInterfaceXmlDataByHandle(InterfaceList[interfaceList.SelectedIndex], ref stXmlData);
            GMPForm.SetFunctionCallLog("FP3_UpdateInterfaceXmlDataByHandle", retcode, start);
            cancel.Enabled = false;
            save.Enabled = false;
            deleteInterface.Enabled = true;
            addInterface.Enabled = true;
        }

        private void FieldChanged(object sender, EventArgs e)
        {
            SetFieldEnable();
            cancel.Enabled = true;
            save.Enabled = true;
            deleteInterface.Enabled = false;
            addInterface.Enabled = false;
        }

        private void deleteInterface_Click(object sender, EventArgs e)
        {
            int start = Environment.TickCount;
            UInt32 RetCode = GMPSmartDLL.FP3_RemoveInterfaceByHandle(InterfaceList[interfaceList.SelectedIndex]);
            GMPForm.SetFunctionCallLog("FP3_RemoveInterfaceByHandle", RetCode, start);

            if (RetCode != ErrorCodes.TRAN_RESULT_OK)
            {
                byte[] TempErrorBuffer = new byte[256];

                GMPSmartDLL.GetErrorMessage(RetCode, TempErrorBuffer);
                string Str = GMP_Tools.SetEncoding(TempErrorBuffer);
                MessageBox.Show("Update function returned err: " + RetCode.ToString("X4") + " (" + RetCode + ") - " + Str, "Error");
            }

            LoadData();
        }

        private void addInterface_Click(object sender, EventArgs e)
        {
            ST_INTERFACE_XML_DATA stXmlData = new ST_INTERFACE_XML_DATA();

            GetInputForm gif = new GetInputForm("New Interface ID?", "Interface", 2);
            DialogResult dr = gif.ShowDialog(this);
            if (dr == System.Windows.Forms.DialogResult.OK)
            {
                String ID = gif.textBox1.Text;
                int start;
                if (ID.Length > 0)
                {
                    if (interfaceList.SelectedIndex >= 0)
                    {
                        start = Environment.TickCount;
                        UInt32 retcode = Json_GMPSmartDLL.FP3_GetInterfaceXmlDataByHandle(InterfaceList[interfaceList.SelectedIndex], ref stXmlData);
                        GMPForm.SetFunctionCallLog("FP3_GetInterfaceXmlDataByHandle", retcode, start);
                    }

                    UInt32 newHInt = 0;
                    start = Environment.TickCount;
                    UInt32 RetCode = Json_GMPSmartDLL.FP3_CreateInterface(ref newHInt, ID, 0, stXmlData);
                    GMPForm.SetFunctionCallLog("FP3_CreateInterface", RetCode, start);

                    if (RetCode != ErrorCodes.TRAN_RESULT_OK)
                    {
                        byte[] TempErrorBuffer = new byte[256];

                        GMPSmartDLL.GetErrorMessage(RetCode, TempErrorBuffer);
                        string Str = GMP_Tools.SetEncoding(TempErrorBuffer);
                        MessageBox.Show("Update function returned err: " + RetCode.ToString("X4") + " (" + RetCode + ") - " + Str, "Error");
                    }
                }
                else
                    MessageBox.Show("Interface ID can not be empty!");
            }

            LoadData();
        }

        private void isTcpKeepAlive_CheckedChanged(object sender, EventArgs e)
        {
            SetFieldEnable();
            cancel.Enabled = true;
            save.Enabled = true;
            deleteInterface.Enabled = false;
            addInterface.Enabled = false;
        }
    }
}
