
using Microsoft.Office.Interop.Excel;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Excel = Microsoft.Office.Interop.Excel;

namespace GmpSampleSim
{
    public partial class TestForm : Form
    {
        private static TestForm instance = null;
        public delegate void AddLogFunctionDelegate(string functionName, UInt32 retCode, Int64 Tick);
        public AddLogFunctionDelegate addLogFunctionDelegate;
        public delegate void AddLogTextDelegate(string text, Int64 Tick);
        public AddLogTextDelegate addLogTextDelegate;
        public delegate void SetComponentEnablesDelegate();
        public SetComponentEnablesDelegate setComponentEnablesDelegate;

        private void addLogValue(string value, Color color)
        {
            logs.SelectionStart = logs.TextLength;
            logs.SelectionLength = 0;
            logs.SelectionColor = color;
            logs.AppendText(value);
        }

        private void addLogFunction(string functionName, UInt32 retCode, Int64 Tick)
        {
            try
            {
                addLogValue(functionName + "(...);", Color.Blue);

                addLogValue(" ==> ", Color.Green);
                addLogValue(retCode.ToString() + " (0x" + retCode.ToString("X4") + ")", Color.Red);

                if (Tick != 0)
                {
                    addLogValue(" ==> ", Color.Green);
                    addLogValue("Time = " + Tick / 10000 + "ms.\n", Color.Brown);
                }
                else
                    addLogValue("\n", Color.Brown);

                logs.SelectionColor = logs.ForeColor;

                int count = logs.Lines.Length;
                if (count > 1000)
                {
                    logs.SelectionStart = 0;
                    int length = 0;
                    int deleteCount = count - 1000;
                    for (int i = 0; i < deleteCount; ++i)
                        length += logs.Lines[i].Length;
                    logs.SelectionLength = length + 1;
                    logs.SelectedText = "";
                }
                logs.SelectionStart = logs.Text.Length;
                logs.ScrollToCaret();
            }
            catch (Exception ex)
            {
                MessageBox.Show("exeption on setFunctionCallLog: " + ex.Message);
            }
        }

        private void addLogText(string text, Int64 Tick)
        {
            try
            {
                addLogValue(text, Color.Blue);

                if (Tick != 0)
                {
                    addLogValue(" ==> ", Color.Green);
                    addLogValue("Time = " + Tick / 10000 + "ms.\n", Color.Brown);
                }
                else
                    addLogValue("\n", Color.Brown);

                logs.SelectionColor = logs.ForeColor;

                int count = logs.Lines.Length;
                if (count > 1000)
                {
                    logs.SelectionStart = 0;
                    int length = 0;
                    int deleteCount = count - 1000;
                    for (int i = 0; i < deleteCount; ++i)
                        length += logs.Lines[i].Length;
                    logs.SelectionLength = length + 1;
                    logs.SelectedText = "";
                }
                logs.SelectionStart = logs.Text.Length;
                logs.ScrollToCaret();
            }
            catch (Exception ex)
            {
                MessageBox.Show("exeption on setFunctionCallLog: " + ex.Message);
            }
        }

        private static void AddLogText(string text, Int64 Tick)
        {
            instance?.addLogTextDelegate.Invoke(text, Tick);
        }

        private static void AddLogFunction(string functionName, UInt32 retCode, Int64 Tick)
        {
            instance?.addLogFunctionDelegate.Invoke(functionName, retCode, Tick);
        }

        private void setComponentEnables(int type, Boolean Eneble)
        {
            if (type == 0)
            {
                WbfFileData.Enabled = Eneble;
                WbfOpenFile.Enabled = Eneble;
                SenarioTabs.Controls[1].Enabled = Eneble;
            }
            else if (type == 1)
            {
                Source.Enabled = Eneble;
                Dest.Enabled = Eneble;
                Up.Enabled = Eneble;
                Down.Enabled = Eneble;
                Add.Enabled = Eneble;
                Delete.Enabled = Eneble;
                Clear.Enabled = Eneble;
                SenarioTabs.Controls[0].Enabled = Eneble;
            }
            else if (type == 2)
            {
                RunCount.Enabled = Eneble;
                RunZReportCount.Enabled = Eneble;
                load.Enabled = Eneble;
                save.Enabled = Eneble;
                run.Enabled = Eneble;
                stop.Enabled = !Eneble;
                excelFileName.Enabled = Eneble;
            }
        }

        private List<Step> steps;
        private List<BatchModeCommand> batchModeCommands;

        private void TestForm_Leave(object sender, EventArgs e)
        {
            instance = null;
        }

        public TestForm()
        {
            steps = new List<Step>();
            batchModeCommands = new List<BatchModeCommand>();
            instance = this;
            addLogFunctionDelegate = new AddLogFunctionDelegate(addLogFunction);
            addLogTextDelegate = new AddLogTextDelegate(addLogText);
            setComponentEnablesDelegate = new SetComponentEnablesDelegate(SetComponentEnables);
            InitializeComponent();
            SetComponentEnables();
        }

        private void Clear_Click(object sender, EventArgs e)
        {
            steps.Clear();
            updateDestt();
        }

        private void Delete_Click(object sender, EventArgs e)
        {
            if (Dest.SelectedItem != null)
            {
                steps.Remove(steps[Dest.SelectedIndex]);
                updateDestt();
            }
        }

        private void AddItemToDest(StepId id)
        {
            //string param = TestParam.GetDefaultParam(id);
            Step newStep = new Step(id, "{}");
            TestParam.EditParams(ref newStep);
            steps.Add(newStep);
            updateDestt();
        }

        private void Add_Click(object sender, EventArgs e)
        {
            StepId id = (StepId)Enum.Parse(typeof(StepId), (String)Source.SelectedItem);
            AddItemToDest(id);
        }

        private void Source_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            int index = this.Source.IndexFromPoint(e.Location);
            if (index != System.Windows.Forms.ListBox.NoMatches)
            {
                StepId id = (StepId)Enum.Parse(typeof(StepId), Source.Items[index].ToString());
                AddItemToDest(id);
            }
        }

        private void Dest_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            int index = this.Dest.IndexFromPoint(e.Location);
            if (index != System.Windows.Forms.ListBox.NoMatches)
            {
                Step step = steps[index];
                TestParam.EditParams(ref step);
                steps[index] = step;
                updateDestt();
            }
        }

        private void updateDestt()
        {
            Dest.Items.Clear();
            foreach (Step step in steps)
            {
                Dest.Items.Add(step.id.ToString() + " : " + step.data);
            }
        }

        private void updateBatchModeCommands()
        {
            WbfFileData.Text = string.Empty;
            foreach (BatchModeCommand cmd in batchModeCommands)
                WbfFileData.Text += cmd.name.Trim() + " ==> " + cmd.data.Trim() + "\r\n";
        }

        private void Down_Click(object sender, EventArgs e)
        {
            if (Dest.SelectedItem != null)
            {
                if (Dest.SelectedIndex < (Dest.Items.Count - 1))
                {
                    int index = Dest.SelectedIndex;
                    Step temp = steps[Dest.SelectedIndex];
                    steps[Dest.SelectedIndex] = steps[Dest.SelectedIndex + 1];
                    steps[Dest.SelectedIndex + 1] = temp;
                    updateDestt();
                    Dest.SelectedIndex = index + 1;
                }
            }
        }

        private void Up_Click(object sender, EventArgs e)
        {
            if (Dest.SelectedItem != null)
            {
                if (Dest.SelectedIndex > 0)
                {
                    int index = Dest.SelectedIndex;
                    Step temp = steps[Dest.SelectedIndex];
                    steps[Dest.SelectedIndex] = steps[Dest.SelectedIndex - 1];
                    steps[Dest.SelectedIndex - 1] = temp;
                    updateDestt();
                    Dest.SelectedIndex = index - 1;
                }
            }
        }

        private void SenarioTabs_SelectedIndexChanged(object sender, EventArgs e)
        {
            SetComponentEnables();
        }

        private void SetComponentEnables()
        {
            if (SenarioTabs.SelectedIndex == 1)
            {
                setComponentEnables(0, true);
                setComponentEnables(1, false);
                setComponentEnables(2, true);
            }
            else
            {
                setComponentEnables(0, false);
                setComponentEnables(1, true);
                setComponentEnables(2, true);
            }
        }

        private void WbfOpenFile_Click(object sender, EventArgs e)
        {
            OpenFileDialog openDialog = new OpenFileDialog();
            openDialog.Filter = "WorldLine Batch File (*.wbf)|*.wbf";
            openDialog.Title = "Open a file";

            if (openDialog.ShowDialog() == DialogResult.OK)
            {
                WbfFileData.Text = "";

                using (var reader = new StreamReader(openDialog.FileName))
                {
                    string line;
                    string[] values;
                    while ((line = reader.ReadLine()) != null)
                    {
                        values = line.Split(',');

                        if (values.Length >= 4)
                        {
                            ListViewItem item1 = new ListViewItem(values[0].Trim());
                            item1.SubItems.Add(values[1].Trim());
                            item1.SubItems.Add(values[2].Trim());
                            item1.SubItems.Add(values[3].Trim());

                            BatchModeCommand batchModeCommand = new BatchModeCommand(values[1].Trim(), values[2].Trim());
                            batchModeCommands.Add(batchModeCommand);
                        }
                    }
                }
                updateBatchModeCommands();
            }
        }

        private void Load_Click(object sender, EventArgs e)
        {
            OpenFileDialog openDialog = new OpenFileDialog();
            openDialog.Filter = "WorldLine Test File (*.wtf)|*.wtf";
            openDialog.Title = "Open a file";

            if (openDialog.ShowDialog() == DialogResult.OK)
            {
                steps.Clear();
                batchModeCommands.Clear();
                Dest.Items.Clear();
                WbfFileData.Text = "";

                using (var reader = new StreamReader(openDialog.FileName))
                {
                    string line;
                    string[] values;
                    Boolean isInBatch = false;
                    Step lastBatchStep = null;

                    while ((line = reader.ReadLine()) != null)
                    {
                        if ((isInBatch == true) && (lastBatchStep != null))
                        {
                            if (line.Trim().Equals("{"))
                                lastBatchStep.data = "{";
                            else if (line.Trim().Equals("}"))
                            {
                                lastBatchStep.data += "}";
                                isInBatch = false;
                                lastBatchStep = null;
                                updateDestt();
                            }
                            else
                            {
                                values = line.Split(':');
                                if (values.Length > 1)
                                {
                                    if (values[0].Trim().Equals("WbfLine"))
                                    {
                                        string value = line.Trim().Substring(7, line.Trim().Length - 7).Trim().TrimStart(':').Trim();
                                        string[] pairs = value.Split('-');
                                        if (pairs.Length > 1)
                                        {
                                            if (lastBatchStep.data.Length > 1)
                                                lastBatchStep.data += "; ";
                                            else
                                                lastBatchStep.data += "BatchCommands: ";
                                            lastBatchStep.data += pairs[0].Trim() + " - " + pairs[1].Trim();
                                        }
                                        else
                                        {
                                            // Bu şekilde , ile ayrılmış eski dosyalar olabilir.
                                            pairs = value.Split(',');
                                            if (pairs.Length > 1)
                                            {
                                                if (lastBatchStep.data.Length > 1)
                                                    lastBatchStep.data += "; ";
                                                else
                                                    lastBatchStep.data += "BatchCommands: ";
                                                lastBatchStep.data += pairs[0].Trim() + " - " + pairs[1].Trim();
                                            }
                                        }

                                    }
                                }
                            }

                            continue;
                        }

                        values = line.Split(':');

                        if (values.Length > 1)
                        {
                            if (values[0].Trim().Equals("RunCount"))
                                RunCount.Value = int.Parse(values[1]);
                            else if (values[0].Trim().Equals("RunZReportCount"))
                                RunZReportCount.Value = int.Parse(values[1]);
                            else if (values[0].Trim().Equals("IsWorldLineBatchFile"))
                            {
                                if (values[1].Trim().Equals("TRUE"))
                                    SenarioTabs.SelectedIndex = 1;
                                else
                                    SenarioTabs.SelectedIndex = 0;
                                SetComponentEnables();
                            }
                            else if (SenarioTabs.SelectedIndex == 1)
                            {
                                if (values[0].Trim().Equals("WbfLine"))
                                {
                                    string[] values2 = values[1].Trim().Split(',');
                                    BatchModeCommand batchModeCommand = new BatchModeCommand(values2[0].Trim(), values2[1].Trim());
                                    batchModeCommands.Add(batchModeCommand);
                                    updateBatchModeCommands();
                                }
                            }
                            else
                            {
                                if (values[0].Trim().Equals("Step"))
                                {
                                    string value = line.Trim().Substring(4, line.Trim().Length - 4).Trim().TrimStart(':').Trim();
                                    string[] values2 = value.Split(',');
                                    if (values2.Length > 0)
                                    {
                                        if ((values2.Length > 1) && values2[1].Trim().Length > 0)
                                        {
                                            string value2 = value.Trim().Substring(values2[0].Length, value.Trim().Length - values2[0].Length).Trim().TrimStart(',').Trim();
                                            Step newStep = new Step((StepId)Enum.Parse(typeof(StepId), values2[0].Trim()), value2);
                                            steps.Add(newStep);
                                            updateDestt();
                                        }
                                        else if (values2[0].Trim().Equals("Batch"))
                                        {
                                            lastBatchStep = new Step((StepId)Enum.Parse(typeof(StepId), values2[0].Trim()), "{}");
                                            steps.Add(lastBatchStep);
                                            isInBatch = true;
                                            updateDestt();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        private void Save_Click(object sender, EventArgs e)
        {
            SaveFileDialog saveDialog = new SaveFileDialog();
            saveDialog.Filter = "WorldLine Test File (*.wtf)|*.wtf";
            saveDialog.Title = "Save a file";
            DialogResult result = saveDialog.ShowDialog();
            if (result == DialogResult.OK)
            {
                FileStream fParameter = new FileStream(saveDialog.FileName, FileMode.Create, FileAccess.Write);
                StreamWriter WriterParameter = new StreamWriter(fParameter);
                WriterParameter.BaseStream.Seek(0, SeekOrigin.End);

                WriterParameter.WriteLine("RunCount : " + RunCount.Value);
                WriterParameter.WriteLine("RunZReportCount : " + RunZReportCount.Value);

                if (SenarioTabs.SelectedIndex == 1)
                {
                    WriterParameter.WriteLine("IsWorldLineBatchFile : TRUE");
                    foreach (BatchModeCommand cmd in batchModeCommands)
                        WriterParameter.WriteLine("WbfLine : " + cmd.name + ", " + cmd.data);
                }
                else
                {
                    WriterParameter.WriteLine("IsWorldLineBatchFile : FALSE");
                    foreach (Step s in steps)
                    {
                        if (s.id == StepId.Batch)
                        {
                            WriterParameter.WriteLine("Step : " + s.id.ToString() + ", ");
                            WriterParameter.WriteLine("\t{");
                            ParamData paramData = new ParamData(s.data);
                            foreach (KeyValuePair<string, string> key in paramData.data)
                            {
                                if (key.Key.Equals("BatchCommands"))
                                {
                                    string[] parcalar = key.Value.Split(';');
                                    foreach (string parca in parcalar)
                                        WriterParameter.WriteLine("\t\t" + "WbfLine" + " : " + parca.Trim());
                                }
                            }
                            WriterParameter.WriteLine("\t}");
                        }
                        else
                            WriterParameter.WriteLine("Step : " + s.id.ToString() + ", " + s.data);

                    }
                }

                WriterParameter.Flush();
                WriterParameter.Close();
            }
        }

        private static int getBatchCommand(byte[] sendBuffer, List<BatchModeCommand> batchModeCommands)
        {
            UInt32 MessageCommandType = 0;
            int sendBufferLen = 0;
            byte[] MessageBuffer = new byte[1024 * 16];	// this is buffer for just one msg type (exp: GMP_FISCAL_PRINTER_REQ or GMP_EXT_DEVICE_GET ...
            UInt16 MessageBufferLen = 0;

            foreach (BatchModeCommand cmd in batchModeCommands)
            {
                byte[] Data = new byte[1024];
                int DataLen = 0;
                UInt16 Len = 0;
                UInt32 CommandType;
                string RowData = cmd.data;
                GMPForm.StringToByteArray(RowData, Data, ref DataLen);

                if (DataLen == 0) // There is no data to send
                    continue;

                // This is the data to be sent to ECR.
                string TempStr = "";
                for (int j = DataLen - 4; j < DataLen; j++)
                {
                    TempStr += Data[j].ToString("X2");
                }
                CommandType = UInt32.Parse(TempStr, System.Globalization.NumberStyles.HexNumber);

                TempStr = "";
                for (int j = DataLen - 6; j < DataLen - 4; j++)
                {
                    TempStr += Data[j].ToString("X2");
                }
                Len = UInt16.Parse(TempStr, System.Globalization.NumberStyles.HexNumber);

                if (MessageCommandType == 0)
                    MessageCommandType = CommandType;

                if (MessageCommandType != CommandType)
                {

                    // this means that the msgCommandType is changing in the list, so close the previous package..
                    sendBufferLen += GMPSmartDLL.gmpSetTLV_HLEx(sendBuffer, sendBufferLen, sendBuffer.Length - sendBufferLen, MessageCommandType, MessageBuffer, MessageBufferLen);
                    MessageBufferLen = 0;
                    MessageCommandType = CommandType;
                }

                GMPForm.StringToByteArray_Rev(RowData, Data, ref DataLen);

                Buffer.BlockCopy(Data, 6, MessageBuffer, MessageBufferLen, Len);
                MessageBufferLen += Len;
            }
            if (MessageBufferLen != 0)
            {
                // this means that the msgCommandType is changing in the list, so close the privous package..
                sendBufferLen += GMPSmartDLL.gmpSetTLV_HLEx(sendBuffer, sendBufferLen, sendBuffer.Length - sendBufferLen, MessageCommandType, MessageBuffer, MessageBufferLen);
                MessageBufferLen = 0;
            }
            return sendBufferLen;
        }

        private static UInt32 runBatchFile(UInt32 Interface, ref UInt64 TranHandle, List<BatchModeCommand> batchModeCommands)
        {
            UInt32 result = ErrorCodes.TRAN_RESULT_OK;
            byte[] sendBuffer = new byte[1024 * 16];
            UInt16 sendBufferLen = 0;
            ST_MULTIPLE_RETURN_CODE[] stReturnCodes = new ST_MULTIPLE_RETURN_CODE[1024]; // will return return codes of each subcommand
            ST_TICKET stTicket = new ST_TICKET();
            UInt32 msgCommandType = 0;
            byte[] msgBuffer = new byte[1024 * 16];	// this is buffer for just one msg type (exp: GMP_FISCAL_PRINTER_REQ or GMP_EXT_DEVICE_GET ...
            UInt16 msgBufferLen = 0;
            UInt16 numberOfreturnCodes = 512;

            // Prepare Data To Send
            sendBufferLen = (UInt16)getBatchCommand(sendBuffer, batchModeCommands);
            if (sendBufferLen == 0)
                // Nothing to send...
                return result;

            UInt16 Len = 0;

            while ((Len < sendBufferLen) && (result == ErrorCodes.TRAN_RESULT_OK))
            {
                Len += GMPSmartDLL.gmpReadTLVtag(ref msgCommandType, sendBuffer, Len);
                Len += GMPSmartDLL.gmpReadTLVlen_HL(ref msgBufferLen, sendBuffer, Len);
                Buffer.BlockCopy(sendBuffer, Len, msgBuffer, 0, msgBufferLen);
                Len += msgBufferLen;

                // Preceed received message
                switch (msgCommandType)
                {
                    case Defines.GMP3_FISCAL_PRINTER_MODE_REQ:
                    case Defines.GMP3_FISCAL_PRINTER_MODE_REQ_E:

                        // Send to ECR and wait for the response (one error code for each sub command until one of them is failed !!)
                        //int start = Environment.TickCount;
                        result = Json_GMPSmartDLL.FP3_MultipleCommand(Interface, ref TranHandle, ref stReturnCodes, ref numberOfreturnCodes, msgBuffer, msgBufferLen, ref stTicket, 1000 * 100);
                        //setFunctionCallLog("FP3_MultipleCommand", retcode, start);

                        //ACTIVE_TRX_HANDLE = TransactionHandle;
                        break;

                    case Defines.GMP3_EXT_DEVICE_GET_DATA_REQ:
                    case Defines.GMP3_EXT_DEVICE_GET_DATA_REQ_E:
                        // Send to ECR and wait for the response (one error code for each sub command until one of them is failed !!)
                        result = 0xFFFF;//GMPSmartDLL.GetDialogInput_MultipleCommand_HL(stReturnCodes, numberOfreturnCodes, ref tempNumberOfreturnCodes, msgBuffer, msgBufferLen, ref m_stTicket, 1000 * 100);
                        //numberOfreturnCodes += tempNumberOfreturnCodes;
                        break;
                }
            }

            if (result == ErrorCodes.TRAN_RESULT_OK)
            {
                numberOfreturnCodes = Convert.ToUInt16(batchModeCommands.Count);

                for (int t = 0; (t < numberOfreturnCodes) && (t < stReturnCodes.Length); t++)
                {
                    byte[] returnCodeString = new byte[256];

                    if (stReturnCodes[t] != null)
                    {
                        // This is not a result of subCommand (it is a tag value in Get Response )
                        if (stReturnCodes[t].indexOfSubCommand == 0)
                            continue;

                        // This is not a result of subCommand (it is a tag value in Get Response )
                        if (stReturnCodes[t].subCommand == 0)
                            continue;

                        AddLogFunction("Cmd ==> " + batchModeCommands[t].name, stReturnCodes[t].retcode, 0);
                    }
                }
            }

            return result;
        }

        private static UInt32 runStep(UInt32 Interface, Step step, ref UInt64 TranHandle, ref ST_TICKET stTicket)
        {
            UInt32 result = ErrorCodes.TRAN_RESULT_OK;

            if (step != null)
            {
                switch (step.id)
                {
                    case StepId.None:
                        break;
                    case StepId.Start:
                        byte[] UniqueId = new byte[24] { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };
                        result = GMPSmartDLL.FP3_Start(Interface, ref TranHandle, 0, UniqueId, UniqueId.Length, null, 0, null, 0, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.PrintTicketHeader:
                        result = GMPSmartDLL.FP3_TicketHeader(Interface, TranHandle, TestParam.GetTicketTypeParam(step), Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.SetOptions:
                        UInt64 FlagsActive = 0;
                        result = GMPSmartDLL.FP3_OptionFlags(Interface, TranHandle, ref FlagsActive, TestParam.GetSetOptionParam(step), 0, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Item:
                        ST_ITEM stItem = TestParam.GetItemParam(step);
                        result = Json_GMPSmartDLL.FP3_ItemSale(Interface, TranHandle, ref stItem, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.VoidItem:
                        UInt16 itemIdex = 0;
                        UInt64 itemCount = 0;
                        byte itemCountPrecision = 0;
                        TestParam.GetVoidItemParams(step, ref itemIdex, ref itemCount, ref itemCountPrecision);
                        result = Json_GMPSmartDLL.FP3_VoidItem(Interface, TranHandle, itemIdex, itemCount, itemCountPrecision, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Kredi:
                        ST_PAYMENT_REQUEST stPaymentRequestKredi = TestParam.GetKrediParam(step);
                        result = Json_GMPSmartDLL.FP3_Payment(Interface, TranHandle, ref stPaymentRequestKredi, ref stTicket, 90000);
                        break;
                    case StepId.Nakit:
                        ST_PAYMENT_REQUEST stPaymentRequestNakit = TestParam.GetNakitParam(step);
                        result = Json_GMPSmartDLL.FP3_Payment(Interface, TranHandle, ref stPaymentRequestNakit, ref stTicket, 90000);
                        break;
                    case StepId.Yemek:
                        ST_PAYMENT_REQUEST stPaymentRequestYemek = TestParam.GetYemekParam(step);
                        result = Json_GMPSmartDLL.FP3_Payment(Interface, TranHandle, ref stPaymentRequestYemek, ref stTicket, 90000);
                        break;
                    case StepId.DigerOdeme:
                        ST_PAYMENT_REQUEST stPaymentRequestDiger= TestParam.GetDigerOdemeParam(step);
                        result = Json_GMPSmartDLL.FP3_Payment(Interface, TranHandle, ref stPaymentRequestDiger, ref stTicket, 90000);
                        break;
                    case StepId.PrintTotal:
                        result = GMPSmartDLL.FP3_PrintTotalsAndPayments(Interface, TranHandle, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.PrintTotalAndPayments:
                        result = GMPSmartDLL.FP3_PrintTotalsAndPayments(Interface, TranHandle, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.PrintBeforMF:
                        result = GMPSmartDLL.FP3_PrintBeforeMF(Interface, TranHandle, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.UserMessage:
                        ST_USER_MESSAGE[] stUserMessage = new ST_USER_MESSAGE[1];
                        stUserMessage[0] = TestParam.GetUserMessageParam(step);
                        result = Json_GMPSmartDLL.FP3_PrintUserMessage(Interface, TranHandle, ref stUserMessage, 1, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.PrintMF:
                        result = GMPSmartDLL.FP3_PrintMF(Interface, TranHandle, Defines.TIMEOUT_CARD_TRANSACTIONS);
                        break;
                    case StepId.Close:
                        ST_CLOSE stClose = new ST_CLOSE();
                        result = Json_GMPSmartDLL.FP3_Close(Interface, TranHandle, ref stClose, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Batch:
                        List<BatchModeCommand> batchModeCommands = TestParam.GetBatchModeCommands(step);
                        result = runBatchFile(Interface, ref TranHandle, batchModeCommands);
                        break;
                    case StepId.Plus:
                        UInt32 changedAmount = 0;
                        String text = "";
                        UInt16 itemNo = 0;
                        TestParam.GetItemPlusAmount(step, ref changedAmount, ref text, ref itemNo);
                        result = Json_GMPSmartDLL.FP3_Plus(Interface, TranHandle, changedAmount, text, ref stTicket, itemNo, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Minus:
                        changedAmount = 0;
                        text = "";
                        itemNo = 0;
                        TestParam.GetItemMinusAmount(step, ref changedAmount, ref text, ref itemNo);
                        result = Json_GMPSmartDLL.FP3_Minus(Interface, TranHandle, changedAmount, text, ref stTicket, itemNo, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Inc:
                        Byte rate = 0;
                        changedAmount = 0;
                        text = "";
                        itemNo = 0;
                        TestParam.GetItemIncAmount(step, ref rate, ref text, ref itemNo);
                        result = Json_GMPSmartDLL.FP3_Inc(Interface, TranHandle, rate, text, ref stTicket, itemNo, ref changedAmount, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.Dec:
                        rate = 0;
                        changedAmount = 0;
                        text = "";
                        itemNo = 0;
                        changedAmount = 0;
                        TestParam.GetItemDecAmount(step, ref rate, ref text, ref itemNo);
                        result = Json_GMPSmartDLL.FP3_Dec(Interface, TranHandle, rate, text, ref stTicket, itemNo, ref changedAmount, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.SetInvoice:
                        ST_INVIOCE_INFO stInvoiceInfo = TestParam.GetInvoiceInfo(step);
                        result = Json_GMPSmartDLL.FP3_SetInvoice(Interface, TranHandle, ref stInvoiceInfo, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.ZRaporu:
                        ST_FUNCTION_PARAMETERS stFunctionParameters = TestParam.GetZReport(step);
                        result = Json_GMPSmartDLL.FP3_FunctionReports(Interface, (int)FunctionFlags.GMP_EXT_DEVICE_FUNC_BIT_Z_RAPOR, ref stFunctionParameters, 120 * 1000);
                        break;
                    case StepId.XRaporu:
                        stFunctionParameters = TestParam.GetXReport(step);
                        result = Json_GMPSmartDLL.FP3_FunctionReports(Interface, (int)FunctionFlags.GMP_EXT_DEVICE_FUNC_BIT_X_RAPOR, ref stFunctionParameters, 120 * 1000);
                        break;
                    case StepId.DelayMS:
                        Thread.Sleep(TestParam.GetDelayMS(step));
                        result = 0;
                        break;
                    case StepId.GiderPusulasi:
                        ST_GIDER_PUSULASI stGiderPusulasi = TestParam.GetGiderPusulasi(step);
                        result = Json_GMPSmartDLL.FP3_SendGiderPusulasi(Interface, TranHandle, ref stGiderPusulasi, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.ReversPayment:
                        ST_PAYMENT_REQUEST pstPaymentRequest = TestParam.GetReversPayment(step);
                        result = Json_GMPSmartDLL.FP3_ReversePayment(Interface, TranHandle, ref pstPaymentRequest, 1, ref stTicket, Defines.TIMEOUT_CARD_TRANSACTIONS);
                        break;
                    case StepId.GetTicket:
                        result = Json_GMPSmartDLL.FP3_GetTicket(Interface, TranHandle, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.PreTotal:
                        result = Json_GMPSmartDLL.FP3_Pretotal(Interface, TranHandle, ref stTicket, Defines.TIMEOUT_DEFAULT);
                        break;
                    case StepId.GetMerchantSlip:
                        int odemeIndex = TestParam.GetMerchantSlipOdemeIndex(step);
                        uint fontSize1 = TestParam.GetMerchantSlipFont(step); //263245 HMS
                        byte[] slip = new byte[4 * 1024];
                        int slipLen = 0;
                        result = GMPSmartDLL.FP3_GetMerchantSlip(Interface, TranHandle, odemeIndex, fontSize1, slip, ref slipLen, Defines.TIMEOUT_DEFAULT);
                        break;
                }
            }

            return result;
        }

        private Boolean stopLoop = true;

        private static void runTest(UInt32 Interface, int runZReportCount, int runCount, Boolean isWorldLineBatchFile, List<BatchModeCommand> batchModeCommands, List<Step> steps, string supervisorPassword, string excelFileName)
        {
            try
            {
                Excel.Application excel = null;
                Excel.Workbook book = null;
                Excel.Worksheet sheet = null;
                int totalCollumns = 0;

                if (excelFileName.Length != 0)
                {
                    excel = new Excel.Application();
                    book = excel.Workbooks.Add();
                    sheet = (Excel.Worksheet)book.Sheets[1];
                    sheet.Name = "TestResult";

                    int index;
                    if (runZReportCount == 0)
                    {
                        index = 2;
                        sheet.Cells[1, 1] = "Index";
                    }
                    else
                    {
                        sheet.Cells[1, 1] = "Z Index";
                        sheet.Cells[1, 2] = "Index";
                        index = 3;
                    }
                    if (isWorldLineBatchFile)
                    {
                        sheet.Cells[1, index] = "Batch Mode";
                        ++index;
                    }
                    else
                    {
                        foreach (Step s in steps)
                        {
                            sheet.Cells[1, index] = s.id.ToString();
                            index += 2;
                        }
                    }
                    sheet.Cells[1, index] = "Step Totals";
                    ++index;
                    if (runZReportCount != 0)
                    {
                        sheet.Cells[1, index] = "Z result";
                        ++index;
                        sheet.Cells[1, index] = "Z Time";
                        ++index;
                        sheet.Cells[1, index] = "Total Time with Z";
                        ++index;
                    }
                    sheet.Cells[1, index] = "TotalTime";
                    ++index;
                    totalCollumns = index;
                }

                int zReportCount = runZReportCount;

                if (zReportCount == 0)
                    zReportCount = 1;
                AddLogText("running test ...", 0);
                Int64 startTotal = DateTime.Now.Ticks;
                int excelRow = 2;
                for (int j = 0; j < zReportCount; j++)
                {
                    if (sheet != null)
                    {
                        if (runZReportCount != 0)
                            sheet.Cells[excelRow, 1] = j;
                    }

                    Int64 startIndex = DateTime.Now.Ticks;

                    if (instance == null)
                        break;
                    if (instance.stopLoop == true)
                        break;

                    for (int i = 0; i < runCount; i++)
                    {
                        UInt64 TranHandle = 0;
                        ST_TICKET stTicket = new ST_TICKET();
                        Int64 stepTotals = 0;

                        if (sheet != null)
                        {
                            if (runZReportCount == 0)
                                sheet.Cells[excelRow, 1] = i;
                            else
                                sheet.Cells[excelRow, 2] = i;
                        }
                        if (instance == null)
                            break;
                        if (instance.stopLoop == true)
                            break;

                        if (isWorldLineBatchFile)
                        {
                            AddLogText("Batch Mode starting...", 0);
                            Int64 start = DateTime.Now.Ticks;
                            runBatchFile(Interface, ref TranHandle, batchModeCommands);
                            Int64 end = DateTime.Now.Ticks;
                            AddLogText("Batch Mode end:", end - start);
                            setCellValue(sheet, "Batch Mode", excelRow, end - start, totalCollumns);
                            stepTotals += end - start;
                        }
                        else
                        {
                            foreach (Step s in steps)
                            {
                                if (instance == null)
                                    break;
                                if (instance.stopLoop == true)
                                    break;

                                if (runZReportCount == 0)
                                    AddLogText("count : " + i + " Step : " + s.id.ToString(), 0);
                                else
                                    AddLogText("z index : " + j + " count : " + i + " Step : " + s.id.ToString(), 0);
                                Int64 start = DateTime.Now.Ticks;
                                UInt32 result = runStep(Interface, s, ref TranHandle, ref stTicket);
                                Int64 end = DateTime.Now.Ticks;
                                AddLogFunction(s.id.ToString(), result, end - start);
                                setCellValue(sheet, s.id.ToString(), excelRow, result, end - start, totalCollumns);
                                //if (result != 0)
                                //    break;
                                stepTotals += end - start;
                            }
                        }
                        AddLogText("Step Totals : ", stepTotals);
                        setCellValue(sheet, "Step Totals", excelRow, stepTotals, totalCollumns);
                        ++excelRow;
                    }
                    if (runZReportCount == 0)
                        break;

                    //ZReport
                    ST_FUNCTION_PARAMETERS stFunctionParameters = new ST_FUNCTION_PARAMETERS();
                    Int64 startZ = DateTime.Now.Ticks;
                    stFunctionParameters.Password.supervisor = supervisorPassword;
                    UInt32 resultZ = Json_GMPSmartDLL.FP3_FunctionReports(Interface, (int)FunctionFlags.GMP_EXT_DEVICE_FUNC_BIT_Z_RAPOR, ref stFunctionParameters, 120 * 1000);
                    Int64 endZ = DateTime.Now.Ticks;
                    AddLogFunction("Z Report", resultZ, endZ - startZ);
                    setCellValue(sheet, "Z result", excelRow - 1, resultZ, endZ - startZ, totalCollumns);

                    Int64 endIndex = DateTime.Now.Ticks;
                    AddLogText("z index : " + j, endIndex - startIndex);
                    setCellValue(sheet, "Total Time with Z", excelRow - 1, endIndex - startIndex, totalCollumns);
                }
                Int64 endTotal = DateTime.Now.Ticks;
                AddLogText("Total Time", endTotal - startTotal);
                setCellValue(sheet, "TotalTime", excelRow - 1, endTotal - startTotal, totalCollumns);

                if (excel != null)
                {
                    book.SaveAs(Directory.GetCurrentDirectory() + "\\" + excelFileName + ".xlsx");
                    book.Close();
                    excel.Quit();

                    DialogResult result;
                    if (instance == null)
                        result = MessageBox.Show("Excel file created: " + Directory.GetCurrentDirectory() + "\\" + excelFileName + ".xlsx\n Do you want to open it?", "Do you want to open it?", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                    else
                        result = MessageBox.Show(instance, "Excel file created: " + Directory.GetCurrentDirectory() + "\\" + excelFileName + ".xlsx\n Do you want to open it?", "Do you want to open it?", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                    if (result == DialogResult.Yes)
                        System.Diagnostics.Process.Start(Directory.GetCurrentDirectory() + "\\" + excelFileName + ".xlsx");
                }
            }
            catch (Exception ex)
            {
                AddLogText("Exception: " + ex.Message, 0);
            }
        }

        private static void setCellValue(Worksheet sheet, string capiton, int excelRow, uint result, long time, int totalCollumns)
        {
            if (sheet != null)
            {
                for (int k = 1; k < totalCollumns; ++k)
                {
                    var cell = sheet.Cells[1, k];
                    var value = cell.value;
                    string cellString = value?.ToString() ?? "";
                    if (cellString == capiton)
                    {
                        sheet.Cells[excelRow, k] = result.ToString() + " - 0x" +result.ToString("X4");
                        sheet.Cells[excelRow, k + 1] = time / 10000 + " ms";
                        break;
                    }
                }
            }
        }
        private static void setCellValue(Worksheet sheet, string capiton, int excelRow, Int64 time, int totalCollumns)
        {
            if (sheet != null)
            {
                for (int k = 1; k < totalCollumns; ++k)
                {
                    var cell = sheet.Cells[1, k];
                    var value = cell.value;
                    string cellString = value?.ToString() ?? "";
                    if (cellString == capiton)
                    {
                        sheet.Cells[excelRow, k] = time / 10000 + " ms";
                        break;
                    }
                }
            }
        }

        private void run_Click(object sender, EventArgs e)
        {
            setComponentEnables(0, false);
            setComponentEnables(1, false);
            setComponentEnables(2, false);
            stopLoop = false;

            Thread thread = new Thread(() =>
            {
                runTest(GMPForm.CurrentInterface,
                    Convert.ToInt32(RunZReportCount.Value), 
                    Convert.ToInt32(RunCount.Value),
                    SenarioTabs.SelectedIndex == 1,
                    batchModeCommands,
                    steps,
                    SupervisorPassword.Text,
                    excelFileName.Text);
                if (instance != null)
                    instance.setComponentEnablesDelegate.Invoke();
            });
            thread.Start();
        }

        private void stop_Click(object sender, EventArgs e)
        {
            stopLoop = true;
        }

        private void logClear_Click(object sender, EventArgs e)
        {
            logs.Text = "";
        }
    }
}
