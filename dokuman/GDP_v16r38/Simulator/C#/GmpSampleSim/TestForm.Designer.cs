namespace GmpSampleSim
{
    partial class TestForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.logClear = new System.Windows.Forms.Button();
            this.SupervisorPassword = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.stop = new System.Windows.Forms.Button();
            this.RunZReportCount = new System.Windows.Forms.NumericUpDown();
            this.label3 = new System.Windows.Forms.Label();
            this.RunCount = new System.Windows.Forms.NumericUpDown();
            this.label2 = new System.Windows.Forms.Label();
            this.load = new System.Windows.Forms.Button();
            this.save = new System.Windows.Forms.Button();
            this.run = new System.Windows.Forms.Button();
            this.SenarioTabs = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.Down = new System.Windows.Forms.Button();
            this.Up = new System.Windows.Forms.Button();
            this.Clear = new System.Windows.Forms.Button();
            this.Delete = new System.Windows.Forms.Button();
            this.Add = new System.Windows.Forms.Button();
            this.Source = new System.Windows.Forms.ListBox();
            this.Dest = new System.Windows.Forms.ListBox();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.WbfOpenFile = new System.Windows.Forms.Button();
            this.WbfFileData = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.logs = new System.Windows.Forms.RichTextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.excelFileName = new System.Windows.Forms.TextBox();
            this.groupBox2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.RunZReportCount)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.RunCount)).BeginInit();
            this.SenarioTabs.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.excelFileName);
            this.groupBox2.Controls.Add(this.label5);
            this.groupBox2.Controls.Add(this.logClear);
            this.groupBox2.Controls.Add(this.SupervisorPassword);
            this.groupBox2.Controls.Add(this.label4);
            this.groupBox2.Controls.Add(this.stop);
            this.groupBox2.Controls.Add(this.RunZReportCount);
            this.groupBox2.Controls.Add(this.label3);
            this.groupBox2.Controls.Add(this.RunCount);
            this.groupBox2.Controls.Add(this.label2);
            this.groupBox2.Controls.Add(this.load);
            this.groupBox2.Controls.Add(this.save);
            this.groupBox2.Controls.Add(this.run);
            this.groupBox2.Location = new System.Drawing.Point(520, 12);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(566, 100);
            this.groupBox2.TabIndex = 20;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Run Params";
            // 
            // logClear
            // 
            this.logClear.Location = new System.Drawing.Point(260, 70);
            this.logClear.Name = "logClear";
            this.logClear.Size = new System.Drawing.Size(96, 23);
            this.logClear.TabIndex = 28;
            this.logClear.Text = "Clear";
            this.logClear.UseVisualStyleBackColor = true;
            this.logClear.Click += new System.EventHandler(this.logClear_Click);
            // 
            // SupervisorPassword
            // 
            this.SupervisorPassword.Location = new System.Drawing.Point(120, 73);
            this.SupervisorPassword.Name = "SupervisorPassword";
            this.SupervisorPassword.Size = new System.Drawing.Size(46, 20);
            this.SupervisorPassword.TabIndex = 27;
            this.SupervisorPassword.Text = "0000";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(10, 76);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(101, 13);
            this.label4.TabIndex = 26;
            this.label4.Text = "SüpervisorPasword:";
            // 
            // stop
            // 
            this.stop.Enabled = false;
            this.stop.Location = new System.Drawing.Point(362, 70);
            this.stop.Name = "stop";
            this.stop.Size = new System.Drawing.Size(96, 23);
            this.stop.TabIndex = 25;
            this.stop.Text = "Stop";
            this.stop.UseVisualStyleBackColor = true;
            this.stop.Click += new System.EventHandler(this.stop_Click);
            // 
            // RunZReportCount
            // 
            this.RunZReportCount.Location = new System.Drawing.Point(120, 47);
            this.RunZReportCount.Name = "RunZReportCount";
            this.RunZReportCount.Size = new System.Drawing.Size(65, 20);
            this.RunZReportCount.TabIndex = 24;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(10, 49);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(104, 13);
            this.label3.TabIndex = 23;
            this.label3.Text = "Run Z report Count :";
            // 
            // RunCount
            // 
            this.RunCount.Location = new System.Drawing.Point(120, 22);
            this.RunCount.Name = "RunCount";
            this.RunCount.Size = new System.Drawing.Size(65, 20);
            this.RunCount.TabIndex = 22;
            this.RunCount.Value = new decimal(new int[] {
            1,
            0,
            0,
            0});
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(10, 22);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(64, 13);
            this.label2.TabIndex = 21;
            this.label2.Text = "Run Count :";
            // 
            // load
            // 
            this.load.Location = new System.Drawing.Point(464, 12);
            this.load.Name = "load";
            this.load.Size = new System.Drawing.Size(96, 23);
            this.load.TabIndex = 20;
            this.load.Text = "Load";
            this.load.UseVisualStyleBackColor = true;
            this.load.Click += new System.EventHandler(this.Load_Click);
            // 
            // save
            // 
            this.save.Location = new System.Drawing.Point(464, 41);
            this.save.Name = "save";
            this.save.Size = new System.Drawing.Size(96, 23);
            this.save.TabIndex = 19;
            this.save.Text = "Save";
            this.save.UseVisualStyleBackColor = true;
            this.save.Click += new System.EventHandler(this.Save_Click);
            // 
            // run
            // 
            this.run.Location = new System.Drawing.Point(464, 70);
            this.run.Name = "run";
            this.run.Size = new System.Drawing.Size(96, 23);
            this.run.TabIndex = 18;
            this.run.Text = "Run";
            this.run.UseVisualStyleBackColor = true;
            this.run.Click += new System.EventHandler(this.run_Click);
            // 
            // SenarioTabs
            // 
            this.SenarioTabs.Controls.Add(this.tabPage1);
            this.SenarioTabs.Controls.Add(this.tabPage2);
            this.SenarioTabs.Location = new System.Drawing.Point(12, 12);
            this.SenarioTabs.Name = "SenarioTabs";
            this.SenarioTabs.SelectedIndex = 0;
            this.SenarioTabs.Size = new System.Drawing.Size(502, 690);
            this.SenarioTabs.TabIndex = 22;
            this.SenarioTabs.SelectedIndexChanged += new System.EventHandler(this.SenarioTabs_SelectedIndexChanged);
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.Down);
            this.tabPage1.Controls.Add(this.Up);
            this.tabPage1.Controls.Add(this.Clear);
            this.tabPage1.Controls.Add(this.Delete);
            this.tabPage1.Controls.Add(this.Add);
            this.tabPage1.Controls.Add(this.Source);
            this.tabPage1.Controls.Add(this.Dest);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(494, 664);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Saved Senario Test";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // Down
            // 
            this.Down.BackgroundImage = global::GmpSampleSim.Resource1.down_arrow;
            this.Down.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.Down.Location = new System.Drawing.Point(198, 157);
            this.Down.Name = "Down";
            this.Down.Size = new System.Drawing.Size(46, 56);
            this.Down.TabIndex = 20;
            this.Down.UseVisualStyleBackColor = true;
            this.Down.Click += new System.EventHandler(this.Down_Click);
            // 
            // Up
            // 
            this.Up.BackgroundImage = global::GmpSampleSim.Resource1.up_arrow;
            this.Up.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.Up.Location = new System.Drawing.Point(198, 84);
            this.Up.Name = "Up";
            this.Up.Size = new System.Drawing.Size(46, 56);
            this.Up.TabIndex = 19;
            this.Up.UseVisualStyleBackColor = true;
            this.Up.Click += new System.EventHandler(this.Up_Click);
            // 
            // Clear
            // 
            this.Clear.Location = new System.Drawing.Point(198, 458);
            this.Clear.Name = "Clear";
            this.Clear.Size = new System.Drawing.Size(46, 22);
            this.Clear.TabIndex = 18;
            this.Clear.Text = "Clear";
            this.Clear.UseVisualStyleBackColor = true;
            this.Clear.Click += new System.EventHandler(this.Clear_Click);
            // 
            // Delete
            // 
            this.Delete.Location = new System.Drawing.Point(198, 357);
            this.Delete.Name = "Delete";
            this.Delete.Size = new System.Drawing.Size(46, 32);
            this.Delete.TabIndex = 17;
            this.Delete.Text = "<<<";
            this.Delete.UseVisualStyleBackColor = true;
            this.Delete.Click += new System.EventHandler(this.Delete_Click);
            // 
            // Add
            // 
            this.Add.Location = new System.Drawing.Point(198, 307);
            this.Add.Name = "Add";
            this.Add.Size = new System.Drawing.Size(46, 31);
            this.Add.TabIndex = 16;
            this.Add.Text = ">>>";
            this.Add.UseVisualStyleBackColor = true;
            this.Add.Click += new System.EventHandler(this.Add_Click);
            // 
            // Source
            // 
            this.Source.FormattingEnabled = true;
            this.Source.Items.AddRange(new object[] {
            "Start",
            "PrintTicketHeader",
            "SetOptions",
            "Item",
            "VoidItem",
            "Kredi",
            "Nakit",
            "Yemek",
            "DigerOdeme",
            "PrintTotal",
            "PrintTotalAndPayments",
            "PrintBeforMF",
            "UserMessage",
            "PrintMF",
            "Close",
            "Batch",
            "Plus",
            "Minus",
            "Inc",
            "Dec",
            "SetInvoice",
            "ZRaporu",
            "XRaporu",
            "DelayMS",
            "GiderPusulasi",
            "ReversPayment",
            "GetTicket",
            "PreTotal",
            "GetMerchantSlip"});
            this.Source.Location = new System.Drawing.Point(6, 6);
            this.Source.Name = "Source";
            this.Source.Size = new System.Drawing.Size(164, 654);
            this.Source.TabIndex = 15;
            this.Source.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.Source_MouseDoubleClick);
            // 
            // Dest
            // 
            this.Dest.FormattingEnabled = true;
            this.Dest.Location = new System.Drawing.Point(266, 6);
            this.Dest.Name = "Dest";
            this.Dest.Size = new System.Drawing.Size(207, 654);
            this.Dest.TabIndex = 14;
            this.Dest.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.Dest_MouseDoubleClick);
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.WbfOpenFile);
            this.tabPage2.Controls.Add(this.WbfFileData);
            this.tabPage2.Controls.Add(this.label1);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(494, 664);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "World Line Batch File (*.wbf) Test";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // WbfOpenFile
            // 
            this.WbfOpenFile.Location = new System.Drawing.Point(413, 6);
            this.WbfOpenFile.Name = "WbfOpenFile";
            this.WbfOpenFile.Size = new System.Drawing.Size(75, 23);
            this.WbfOpenFile.TabIndex = 16;
            this.WbfOpenFile.Text = "Open File";
            this.WbfOpenFile.UseVisualStyleBackColor = true;
            this.WbfOpenFile.Click += new System.EventHandler(this.WbfOpenFile_Click);
            // 
            // WbfFileData
            // 
            this.WbfFileData.Enabled = false;
            this.WbfFileData.Location = new System.Drawing.Point(6, 35);
            this.WbfFileData.Multiline = true;
            this.WbfFileData.Name = "WbfFileData";
            this.WbfFileData.ReadOnly = true;
            this.WbfFileData.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.WbfFileData.Size = new System.Drawing.Size(478, 623);
            this.WbfFileData.TabIndex = 15;
            this.WbfFileData.WordWrap = false;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(3, 11);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(147, 13);
            this.label1.TabIndex = 14;
            this.label1.Text = "World Line Batch File (*.wbf) :";
            // 
            // logs
            // 
            this.logs.Location = new System.Drawing.Point(520, 118);
            this.logs.Name = "logs";
            this.logs.ReadOnly = true;
            this.logs.Size = new System.Drawing.Size(566, 584);
            this.logs.TabIndex = 23;
            this.logs.Text = "";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(191, 19);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(55, 13);
            this.label5.TabIndex = 29;
            this.label5.Text = "Excel File:";
            // 
            // excelFileName
            // 
            this.excelFileName.Location = new System.Drawing.Point(252, 16);
            this.excelFileName.Name = "excelFileName";
            this.excelFileName.Size = new System.Drawing.Size(191, 20);
            this.excelFileName.TabIndex = 30;
            // 
            // TestForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1099, 714);
            this.Controls.Add(this.logs);
            this.Controls.Add(this.SenarioTabs);
            this.Controls.Add(this.groupBox2);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D;
            this.MinimizeBox = false;
            this.Name = "TestForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Test";
            this.Leave += new System.EventHandler(this.TestForm_Leave);
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.RunZReportCount)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.RunCount)).EndInit();
            this.SenarioTabs.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.tabPage2.ResumeLayout(false);
            this.tabPage2.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.NumericUpDown RunZReportCount;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.NumericUpDown RunCount;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button load;
        private System.Windows.Forms.Button save;
        private System.Windows.Forms.Button run;
        private System.Windows.Forms.Button stop;
        private System.Windows.Forms.TabControl SenarioTabs;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
        private System.Windows.Forms.Button WbfOpenFile;
        private System.Windows.Forms.TextBox WbfFileData;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button Down;
        private System.Windows.Forms.Button Up;
        private System.Windows.Forms.Button Clear;
        private System.Windows.Forms.Button Delete;
        private System.Windows.Forms.Button Add;
        private System.Windows.Forms.ListBox Source;
        private System.Windows.Forms.ListBox Dest;
        private System.Windows.Forms.RichTextBox logs;
        private System.Windows.Forms.TextBox SupervisorPassword;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Button logClear;
        private System.Windows.Forms.TextBox excelFileName;
        private System.Windows.Forms.Label label5;
    }
}