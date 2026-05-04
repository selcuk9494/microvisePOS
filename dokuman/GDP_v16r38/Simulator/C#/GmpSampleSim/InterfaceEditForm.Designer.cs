namespace GmpSampleSim
{
    partial class InterfaceEditForm
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
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.interfaceList = new System.Windows.Forms.ListBox();
            this.addInterface = new System.Windows.Forms.Button();
            this.deleteInterface = new System.Windows.Forms.Button();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.isTcpKeepAlive = new System.Windows.Forms.CheckBox();
            this.label14 = new System.Windows.Forms.Label();
            this.port = new System.Windows.Forms.TextBox();
            this.label13 = new System.Windows.Forms.Label();
            this.ip = new System.Windows.Forms.TextBox();
            this.label12 = new System.Windows.Forms.Label();
            this.stopBit = new System.Windows.Forms.TextBox();
            this.label11 = new System.Windows.Forms.Label();
            this.parity = new System.Windows.Forms.TextBox();
            this.label10 = new System.Windows.Forms.Label();
            this.fParity = new System.Windows.Forms.TextBox();
            this.label9 = new System.Windows.Forms.Label();
            this.byteSize = new System.Windows.Forms.TextBox();
            this.label8 = new System.Windows.Forms.Label();
            this.baudRate = new System.Windows.Forms.TextBox();
            this.label7 = new System.Windows.Forms.Label();
            this.portName = new System.Windows.Forms.TextBox();
            this.label6 = new System.Windows.Forms.Label();
            this.interCharacterTimeOut = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.commTimeOut = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.ackTimeOut = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.ipRetryCount = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.retryCounter = new System.Windows.Forms.TextBox();
            this.isTcpConnection = new System.Windows.Forms.CheckBox();
            this.cancel = new System.Windows.Forms.Button();
            this.save = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.id = new System.Windows.Forms.TextBox();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.interfaceList);
            this.groupBox1.Location = new System.Drawing.Point(12, 12);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(221, 314);
            this.groupBox1.TabIndex = 0;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Interfaces";
            // 
            // interfaceList
            // 
            this.interfaceList.FormattingEnabled = true;
            this.interfaceList.Location = new System.Drawing.Point(6, 22);
            this.interfaceList.Name = "interfaceList";
            this.interfaceList.Size = new System.Drawing.Size(209, 277);
            this.interfaceList.TabIndex = 0;
            this.interfaceList.SelectedIndexChanged += new System.EventHandler(this.interfaceList_SelectedIndexChanged);
            // 
            // addInterface
            // 
            this.addInterface.Location = new System.Drawing.Point(725, 303);
            this.addInterface.Name = "addInterface";
            this.addInterface.Size = new System.Drawing.Size(128, 23);
            this.addInterface.TabIndex = 3;
            this.addInterface.Text = "Add Interface";
            this.addInterface.UseVisualStyleBackColor = true;
            this.addInterface.Click += new System.EventHandler(this.addInterface_Click);
            // 
            // deleteInterface
            // 
            this.deleteInterface.Location = new System.Drawing.Point(239, 303);
            this.deleteInterface.Name = "deleteInterface";
            this.deleteInterface.Size = new System.Drawing.Size(128, 23);
            this.deleteInterface.TabIndex = 4;
            this.deleteInterface.Text = "Delete Interface";
            this.deleteInterface.UseVisualStyleBackColor = true;
            this.deleteInterface.Click += new System.EventHandler(this.deleteInterface_Click);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.isTcpKeepAlive);
            this.groupBox2.Controls.Add(this.label14);
            this.groupBox2.Controls.Add(this.port);
            this.groupBox2.Controls.Add(this.label13);
            this.groupBox2.Controls.Add(this.ip);
            this.groupBox2.Controls.Add(this.label12);
            this.groupBox2.Controls.Add(this.stopBit);
            this.groupBox2.Controls.Add(this.label11);
            this.groupBox2.Controls.Add(this.parity);
            this.groupBox2.Controls.Add(this.label10);
            this.groupBox2.Controls.Add(this.fParity);
            this.groupBox2.Controls.Add(this.label9);
            this.groupBox2.Controls.Add(this.byteSize);
            this.groupBox2.Controls.Add(this.label8);
            this.groupBox2.Controls.Add(this.baudRate);
            this.groupBox2.Controls.Add(this.label7);
            this.groupBox2.Controls.Add(this.portName);
            this.groupBox2.Controls.Add(this.label6);
            this.groupBox2.Controls.Add(this.interCharacterTimeOut);
            this.groupBox2.Controls.Add(this.label5);
            this.groupBox2.Controls.Add(this.commTimeOut);
            this.groupBox2.Controls.Add(this.label4);
            this.groupBox2.Controls.Add(this.ackTimeOut);
            this.groupBox2.Controls.Add(this.label3);
            this.groupBox2.Controls.Add(this.ipRetryCount);
            this.groupBox2.Controls.Add(this.label2);
            this.groupBox2.Controls.Add(this.retryCounter);
            this.groupBox2.Controls.Add(this.isTcpConnection);
            this.groupBox2.Controls.Add(this.cancel);
            this.groupBox2.Controls.Add(this.save);
            this.groupBox2.Controls.Add(this.label1);
            this.groupBox2.Controls.Add(this.id);
            this.groupBox2.Location = new System.Drawing.Point(239, 12);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(614, 285);
            this.groupBox2.TabIndex = 5;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Interface";
            // 
            // isTcpKeepAlive
            // 
            this.isTcpKeepAlive.AutoSize = true;
            this.isTcpKeepAlive.CheckAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.isTcpKeepAlive.Location = new System.Drawing.Point(306, 256);
            this.isTcpKeepAlive.Name = "isTcpKeepAlive";
            this.isTcpKeepAlive.Size = new System.Drawing.Size(83, 17);
            this.isTcpKeepAlive.TabIndex = 31;
            this.isTcpKeepAlive.Text = "Keep Alive  ";
            this.isTcpKeepAlive.UseVisualStyleBackColor = true;
            this.isTcpKeepAlive.CheckedChanged += new System.EventHandler(this.isTcpKeepAlive_CheckedChanged);
            // 
            // label14
            // 
            this.label14.AutoSize = true;
            this.label14.Location = new System.Drawing.Point(307, 230);
            this.label14.Name = "label14";
            this.label14.Size = new System.Drawing.Size(32, 13);
            this.label14.TabIndex = 30;
            this.label14.Text = "Port :";
            // 
            // port
            // 
            this.port.Location = new System.Drawing.Point(373, 227);
            this.port.Name = "port";
            this.port.Size = new System.Drawing.Size(233, 20);
            this.port.TabIndex = 29;
            this.port.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label13
            // 
            this.label13.AutoSize = true;
            this.label13.Location = new System.Drawing.Point(307, 204);
            this.label13.Name = "label13";
            this.label13.Size = new System.Drawing.Size(23, 13);
            this.label13.TabIndex = 28;
            this.label13.Text = "IP :";
            // 
            // ip
            // 
            this.ip.Location = new System.Drawing.Point(373, 201);
            this.ip.Name = "ip";
            this.ip.Size = new System.Drawing.Size(233, 20);
            this.ip.TabIndex = 27;
            this.ip.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label12
            // 
            this.label12.AutoSize = true;
            this.label12.Location = new System.Drawing.Point(307, 178);
            this.label12.Name = "label12";
            this.label12.Size = new System.Drawing.Size(47, 13);
            this.label12.TabIndex = 26;
            this.label12.Text = "Stop Bit:";
            // 
            // stopBit
            // 
            this.stopBit.Location = new System.Drawing.Point(373, 175);
            this.stopBit.Name = "stopBit";
            this.stopBit.Size = new System.Drawing.Size(233, 20);
            this.stopBit.TabIndex = 25;
            this.stopBit.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label11
            // 
            this.label11.AutoSize = true;
            this.label11.Location = new System.Drawing.Point(307, 152);
            this.label11.Name = "label11";
            this.label11.Size = new System.Drawing.Size(36, 13);
            this.label11.TabIndex = 24;
            this.label11.Text = "Parity:";
            // 
            // parity
            // 
            this.parity.Location = new System.Drawing.Point(373, 149);
            this.parity.Name = "parity";
            this.parity.Size = new System.Drawing.Size(233, 20);
            this.parity.TabIndex = 23;
            this.parity.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(307, 126);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(39, 13);
            this.label10.TabIndex = 22;
            this.label10.Text = "fParity:";
            // 
            // fParity
            // 
            this.fParity.Location = new System.Drawing.Point(373, 123);
            this.fParity.Name = "fParity";
            this.fParity.Size = new System.Drawing.Size(233, 20);
            this.fParity.TabIndex = 21;
            this.fParity.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label9
            // 
            this.label9.AutoSize = true;
            this.label9.Location = new System.Drawing.Point(307, 101);
            this.label9.Name = "label9";
            this.label9.Size = new System.Drawing.Size(54, 13);
            this.label9.TabIndex = 20;
            this.label9.Text = "Byte Size:";
            // 
            // byteSize
            // 
            this.byteSize.Location = new System.Drawing.Point(373, 98);
            this.byteSize.Name = "byteSize";
            this.byteSize.Size = new System.Drawing.Size(233, 20);
            this.byteSize.TabIndex = 19;
            this.byteSize.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(307, 75);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(61, 13);
            this.label8.TabIndex = 18;
            this.label8.Text = "Baud Rate:";
            // 
            // baudRate
            // 
            this.baudRate.Location = new System.Drawing.Point(373, 72);
            this.baudRate.Name = "baudRate";
            this.baudRate.Size = new System.Drawing.Size(233, 20);
            this.baudRate.TabIndex = 17;
            this.baudRate.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(307, 49);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(60, 13);
            this.label7.TabIndex = 16;
            this.label7.Text = "Port Name:";
            // 
            // portName
            // 
            this.portName.Location = new System.Drawing.Point(373, 46);
            this.portName.Name = "portName";
            this.portName.Size = new System.Drawing.Size(233, 20);
            this.portName.TabIndex = 15;
            this.portName.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(6, 153);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(38, 13);
            this.label6.TabIndex = 14;
            this.label6.Text = "ICTO :";
            // 
            // interCharacterTimeOut
            // 
            this.interCharacterTimeOut.Location = new System.Drawing.Point(91, 150);
            this.interCharacterTimeOut.Name = "interCharacterTimeOut";
            this.interCharacterTimeOut.Size = new System.Drawing.Size(184, 20);
            this.interCharacterTimeOut.TabIndex = 13;
            this.interCharacterTimeOut.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(6, 127);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(85, 13);
            this.label5.TabIndex = 12;
            this.label5.Text = "Comm Time Out:";
            // 
            // commTimeOut
            // 
            this.commTimeOut.Location = new System.Drawing.Point(91, 124);
            this.commTimeOut.Name = "commTimeOut";
            this.commTimeOut.Size = new System.Drawing.Size(184, 20);
            this.commTimeOut.TabIndex = 11;
            this.commTimeOut.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(6, 101);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(75, 13);
            this.label4.TabIndex = 10;
            this.label4.Text = "Ack Time Out:";
            // 
            // ackTimeOut
            // 
            this.ackTimeOut.Location = new System.Drawing.Point(91, 98);
            this.ackTimeOut.Name = "ackTimeOut";
            this.ackTimeOut.Size = new System.Drawing.Size(184, 20);
            this.ackTimeOut.TabIndex = 9;
            this.ackTimeOut.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(6, 75);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(78, 13);
            this.label3.TabIndex = 8;
            this.label3.Text = "Ip Retry Count:";
            // 
            // ipRetryCount
            // 
            this.ipRetryCount.Location = new System.Drawing.Point(91, 72);
            this.ipRetryCount.Name = "ipRetryCount";
            this.ipRetryCount.Size = new System.Drawing.Size(184, 20);
            this.ipRetryCount.TabIndex = 7;
            this.ipRetryCount.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 48);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(75, 13);
            this.label2.TabIndex = 6;
            this.label2.Text = "Retry Counter:";
            // 
            // retryCounter
            // 
            this.retryCounter.Location = new System.Drawing.Point(91, 45);
            this.retryCounter.Name = "retryCounter";
            this.retryCounter.Size = new System.Drawing.Size(184, 20);
            this.retryCounter.TabIndex = 5;
            this.retryCounter.TextChanged += new System.EventHandler(this.FieldChanged);
            // 
            // isTcpConnection
            // 
            this.isTcpConnection.AutoSize = true;
            this.isTcpConnection.Location = new System.Drawing.Point(373, 21);
            this.isTcpConnection.Name = "isTcpConnection";
            this.isTcpConnection.Size = new System.Drawing.Size(113, 17);
            this.isTcpConnection.TabIndex = 4;
            this.isTcpConnection.Text = "Is Tcp Connection";
            this.isTcpConnection.UseVisualStyleBackColor = true;
            this.isTcpConnection.CheckedChanged += new System.EventHandler(this.FieldChanged);
            // 
            // cancel
            // 
            this.cancel.Enabled = false;
            this.cancel.Location = new System.Drawing.Point(6, 256);
            this.cancel.Name = "cancel";
            this.cancel.Size = new System.Drawing.Size(75, 23);
            this.cancel.TabIndex = 3;
            this.cancel.Text = "Cancel";
            this.cancel.UseVisualStyleBackColor = true;
            this.cancel.Click += new System.EventHandler(this.cancel_Click);
            // 
            // save
            // 
            this.save.Enabled = false;
            this.save.Location = new System.Drawing.Point(531, 256);
            this.save.Name = "save";
            this.save.Size = new System.Drawing.Size(75, 23);
            this.save.TabIndex = 2;
            this.save.Text = "Save";
            this.save.UseVisualStyleBackColor = true;
            this.save.Click += new System.EventHandler(this.save_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 22);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(24, 13);
            this.label1.TabIndex = 1;
            this.label1.Text = "ID :";
            // 
            // id
            // 
            this.id.Location = new System.Drawing.Point(91, 19);
            this.id.Name = "id";
            this.id.ReadOnly = true;
            this.id.Size = new System.Drawing.Size(184, 20);
            this.id.TabIndex = 0;
            // 
            // InterfaceEditForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(857, 330);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.deleteInterface);
            this.Controls.Add(this.addInterface);
            this.Controls.Add(this.groupBox1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "InterfaceEditForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "InterfaceEditForm";
            this.Load += new System.EventHandler(this.InterfaceEditForm_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.Button addInterface;
        private System.Windows.Forms.Button deleteInterface;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox id;
        private System.Windows.Forms.ListBox interfaceList;
        private System.Windows.Forms.Button cancel;
        private System.Windows.Forms.Button save;
        private System.Windows.Forms.CheckBox isTcpConnection;
        private System.Windows.Forms.TextBox retryCounter;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox ipRetryCount;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox ackTimeOut;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TextBox commTimeOut;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.TextBox interCharacterTimeOut;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.TextBox portName;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.TextBox baudRate;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.TextBox byteSize;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.TextBox fParity;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.TextBox parity;
        private System.Windows.Forms.Label label12;
        private System.Windows.Forms.TextBox stopBit;
        private System.Windows.Forms.Label label14;
        private System.Windows.Forms.TextBox port;
        private System.Windows.Forms.Label label13;
        private System.Windows.Forms.TextBox ip;
        private System.Windows.Forms.CheckBox isTcpKeepAlive;
    }
}