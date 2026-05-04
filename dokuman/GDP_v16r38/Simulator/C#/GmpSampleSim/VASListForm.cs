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
    public partial class VASListForm : Form
    {
        public int VASIndex { get; set; }
       
        public VASListForm(List<String> vasList)
        {
            InitializeComponent();
            foreach (var item in vasList)
            {
                listBoxVAS.Items.Add(item);
            }
        }

        private void buttonOK_Click(object sender, EventArgs e)
        {
            VASIndex = listBoxVAS.SelectedIndex;
            this.DialogResult = DialogResult.OK;
            this.Close();
        }

        private void buttonCancel_Click(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.Cancel;
            this.Close();
        }
    }
}
