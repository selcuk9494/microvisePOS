using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using static System.Net.Mime.MediaTypeNames;

namespace GmpSampleSim
{
    public partial class TestParamForm : Form
    {
        private List<Object> list;

        public TestParamForm()
        {
            InitializeComponent();
            list = new List<Object>();
        }

        public void SetParams(List<TestParamStruct> paramOptions)
        {
            int index = 0;
            int pos = 5;
            int formWidth = 480;

            foreach (TestParamStruct param in paramOptions)
            {
                switch (param.type)
                {
                    case TestParamStructType.str:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20)});
                        list.Add(new TextBox() { Text = param.strValue, Location = new Point(140, pos), Size = new Size(300, 20) });
                        Controls.Add((TextBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.selection:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        ComboBox combo = new ComboBox();
                        int selectedIndex = 0;
                        int ind = 0;
                        foreach (string str in param.selectionOptions)
                        {
                            combo.Items.Add(str);
                            if (str.Equals(param.strValue))
                                selectedIndex = ind;
                            ind++;
                        }
                        combo.SelectedIndex = selectedIndex;
                        //combo.SelectedText = param.strValue;
                        combo.Location = new Point(140, pos);
                        combo.Size = new Size(300, 20);
                        list.Add(combo);
                        Controls.Add((ComboBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.multipleSelection:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        ListBox listBox = new ListBox();
                        listBox.SelectionMode = SelectionMode.MultiSimple;
                        foreach (string str in param.selectionOptions)
                            listBox.Items.Add(str);
                        string[] values = param.strValue.Split(new char[] { '|' });
                        foreach (string str in values)
                            listBox.SelectedItems.Add(str.Trim());
                        //listBox.SelectedText = param.strValue;
                        listBox.Location = new Point(140, pos);
                        int listBoxWidth = 300;
                        if (param.name.Equals("TransactionFlag"))
                        {
                            listBoxWidth += 100;
                            formWidth += 100;
                        }
                        listBox.Size = new Size(listBoxWidth, param.selectionOptions.Count * 15 + 5);
                        list.Add(listBox);
                        Controls.Add((ListBox)list[index]);
                        pos += param.selectionOptions.Count * 15 + 5;
                        break;
                    case TestParamStructType.batchFile:
                        Controls.Add(new Label() { Text = param.name + " :", Location = new Point(20, pos), Size = new Size(100, 20) });
                        Button myButton = new Button() { Text = "Browse", Location = new Point(140, pos), Size = new Size(300, 20) };
                        myButton.Click += new EventHandler(this.OnBatchFileBrows);
                        Controls.Add(myButton);
                        pos += 25;
                        string[] lines = param.strValue.Split(';');
                        StringBuilder sb = new StringBuilder();
                        foreach (string line in lines)
                        {
                            if (line.Length > 0)
                            {
                                sb.Append(line.Trim());
                                sb.Append("\r\n");
                            }
                        }
                        TextBox myTextBox = new TextBox
                        {
                            Location = new Point(20, pos),
                            Size = new Size(420 + 400, 600),
                            Multiline = true,
                            ReadOnly = true,
                            WordWrap = false,
                            ScrollBars = ScrollBars.Both,
                            Text = sb.ToString()
                        };
                        list.Add(myTextBox);
                        Controls.Add((TextBox)list[index]);
                        formWidth += 400;
                        pos += 605;
                        break;
                    case TestParamStructType.uint8:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        list.Add(new TextBox() { Text = param.uint8Value.ToString(), Location = new Point(140, pos), Size = new Size(300, 20) });
                        Controls.Add((TextBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.uint16:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        list.Add(new TextBox() { Text = param.uint16Value.ToString(), Location = new Point(140, pos), Size = new Size(300, 20) });
                        Controls.Add((TextBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.uint32:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        list.Add(new TextBox() { Text = param.uint32Value.ToString(), Location = new Point(140, pos), Size = new Size(300, 20) });
                        Controls.Add((TextBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.uint64:
                        Controls.Add(new Label() { Text = param.name, Location = new Point(20, pos), Size = new Size(100, 20) });
                        list.Add(new TextBox() { Text = param.uint64Value.ToString(), Location = new Point(140, pos), Size = new Size(300, 20) });
                        Controls.Add((TextBox)list[index]);
                        pos += 25;
                        break;
                    case TestParamStructType.boolean:
                        list.Add(new CheckBox() { Text = param.name, Location = new Point(140, pos), Size = new Size(300, 20), Checked = param.boolValue });
                        Controls.Add((CheckBox)list[index]);
                        pos += 25;
                        break;
                    default:
                        list.Add(null);
                        break;
                }
                ++index;
            }

            tamam.Location = new Point(100, pos);
            tamam.Size = new Size(formWidth - 200, 20);
            pos += 25;
            Size = new Size(formWidth, pos + 25 + 25);
        }

        private void OnBatchFileBrows(object sender, EventArgs e)
        {
            OpenFileDialog openDialog = new OpenFileDialog();
            openDialog.Filter = "WorldLine Batch File (*.wbf)|*.wbf";
            openDialog.Title = "Open a file";

            if (openDialog.ShowDialog() == DialogResult.OK)
            {
                ((TextBox)list[0]).Text = "";

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

                            ((TextBox)list[0]).Text += values[1].Trim() + " - " + values[2].Trim() + "\r\n";
                        }
                    }
                }
            }
        }

        internal void GetData(List<TestParamStruct> paramOptions, ref Step step)
        {
            int index = 0;

            ParamData paramData = new ParamData(step.data);

            foreach (TestParamStruct param in paramOptions)
            {
                switch (param.type)
                {
                    case TestParamStructType.str:
                        paramData.setValue(param.name, ((TextBox)list[index]).Text);
                        break;
                    case TestParamStructType.selection:
                        paramData.setValue(param.name, ((ComboBox)list[index]).Text);
                        break;
                    case TestParamStructType.multipleSelection:
                        StringBuilder stringBuilder = new StringBuilder();
                        foreach (var item in ((ListBox)list[index]).SelectedItems)
                        {
                            if (stringBuilder.Length > 0)
                                stringBuilder.Append(" | ");
                            stringBuilder.Append(item.ToString());
                        }
                        paramData.setValue(param.name, stringBuilder.ToString());
                        break;
                    case TestParamStructType.batchFile:
                        string text = ((TextBox)list[index]).Text.Replace("\r\n", "\n");
                        string[] commands = text.Split('\n');
                        StringBuilder sb = new StringBuilder();
                        sb.Append("{");
                        foreach (string command in commands)
                        {
                            if (command.Length > 0)
                            {
                                if (sb.Length > 1)
                                    sb.Append("; ");
                                else
                                    sb.Append("BatchCommands: ");
                                sb.Append(command);
                            }
                        }
                        sb.Append("}");
                        paramData.SetData(sb.ToString());
                        break;
                    case TestParamStructType.uint8:
                        byte.TryParse(((TextBox)list[index]).Text, out byte tempByte);
                        paramData.setValue(param.name, tempByte.ToString());
                        break;
                    case TestParamStructType.uint16:
                        UInt16.TryParse(((TextBox)list[index]).Text, out ushort tempUInt16);
                        paramData.setValue(param.name, tempUInt16.ToString());
                        break;
                    case TestParamStructType.uint32:
                        UInt32.TryParse(((TextBox)list[index]).Text, out uint tempUInt32);
                        paramData.setValue(param.name, tempUInt32.ToString());
                        break;
                    case TestParamStructType.uint64:
                        UInt64.TryParse(((TextBox)list[index]).Text, out ulong tempUInt64);
                        paramData.setValue(param.name, tempUInt64.ToString());
                        break;
                    case TestParamStructType.boolean:
                        paramData.setValue(param.name, ((CheckBox)list[index]).Checked == true ? "true" : "false");
                        break;
                    default:
                        list.Add(null);
                        break;
                }
                ++index;
            }
            step.data = paramData.GetData();
        }

        private void tamam_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
