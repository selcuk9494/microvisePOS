namespace GmpSampleSim
{
    partial class PCI24HReset
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
            this.label1 = new System.Windows.Forms.Label();
            this.startTime = new System.Windows.Forms.DateTimePicker();
            this.endTime = new System.Windows.Forms.DateTimePicker();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.setResetTime = new System.Windows.Forms.Button();
            this.beforeManager = new System.Windows.Forms.TextBox();
            this.getResetTime = new System.Windows.Forms.Button();
            this.result = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(29, 34);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(81, 17);
            this.label1.TabIndex = 0;
            this.label1.Text = "Start Time :";
            // 
            // startTime
            // 
            this.startTime.CustomFormat = "HH:mm";
            this.startTime.Format = System.Windows.Forms.DateTimePickerFormat.Custom;
            this.startTime.Location = new System.Drawing.Point(152, 34);
            this.startTime.Name = "startTime";
            this.startTime.ShowUpDown = true;
            this.startTime.Size = new System.Drawing.Size(81, 22);
            this.startTime.TabIndex = 1;
            this.startTime.Value = new System.DateTime(2021, 9, 9, 1, 0, 0, 0);
            // 
            // endTime
            // 
            this.endTime.CustomFormat = "HH:mm";
            this.endTime.Format = System.Windows.Forms.DateTimePickerFormat.Custom;
            this.endTime.Location = new System.Drawing.Point(152, 71);
            this.endTime.Name = "endTime";
            this.endTime.ShowUpDown = true;
            this.endTime.Size = new System.Drawing.Size(81, 22);
            this.endTime.TabIndex = 3;
            this.endTime.Value = new System.DateTime(2021, 9, 9, 5, 0, 0, 0);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(29, 71);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(76, 17);
            this.label2.TabIndex = 2;
            this.label2.Text = "End Time :";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(29, 108);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(118, 17);
            this.label3.TabIndex = 4;
            this.label3.Text = "Before Manager :";
            // 
            // setResetTime
            // 
            this.setResetTime.Location = new System.Drawing.Point(278, 42);
            this.setResetTime.Name = "setResetTime";
            this.setResetTime.Size = new System.Drawing.Size(170, 32);
            this.setResetTime.TabIndex = 6;
            this.setResetTime.Text = "Set Reset Time";
            this.setResetTime.UseVisualStyleBackColor = true;
            this.setResetTime.Click += new System.EventHandler(this.setResetTime_Click);
            // 
            // beforeManager
            // 
            this.beforeManager.Location = new System.Drawing.Point(153, 106);
            this.beforeManager.Name = "beforeManager";
            this.beforeManager.Size = new System.Drawing.Size(79, 22);
            this.beforeManager.TabIndex = 7;
            this.beforeManager.Text = "30";
            this.beforeManager.TextChanged += new System.EventHandler(this.beforeManager_TextChanged);
            this.beforeManager.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.beforeManager_KeyPress);
            // 
            // getResetTime
            // 
            this.getResetTime.Location = new System.Drawing.Point(278, 80);
            this.getResetTime.Name = "getResetTime";
            this.getResetTime.Size = new System.Drawing.Size(170, 32);
            this.getResetTime.TabIndex = 8;
            this.getResetTime.Text = "Get Reset Time";
            this.getResetTime.UseVisualStyleBackColor = true;
            this.getResetTime.Click += new System.EventHandler(this.getResetTime_Click);
            // 
            // result
            // 
            this.result.Location = new System.Drawing.Point(12, 153);
            this.result.Multiline = true;
            this.result.Name = "result";
            this.result.Size = new System.Drawing.Size(452, 115);
            this.result.TabIndex = 9;
            // 
            // PCI24HReset
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(476, 280);
            this.Controls.Add(this.result);
            this.Controls.Add(this.getResetTime);
            this.Controls.Add(this.beforeManager);
            this.Controls.Add(this.setResetTime);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.endTime);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.startTime);
            this.Controls.Add(this.label1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "PCI24HReset";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "PCI24HReset";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.DateTimePicker startTime;
        private System.Windows.Forms.DateTimePicker endTime;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button setResetTime;
        private System.Windows.Forms.TextBox beforeManager;
        private System.Windows.Forms.Button getResetTime;
        private System.Windows.Forms.TextBox result;
    }
}