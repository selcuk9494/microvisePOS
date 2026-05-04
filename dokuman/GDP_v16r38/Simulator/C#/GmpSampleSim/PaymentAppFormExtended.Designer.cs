namespace GmpSampleSim
{
    partial class PaymentAppFormExtended
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
            this.m_listAllowedInputs = new System.Windows.Forms.ListBox();
            this.m_listPaymentApplications = new System.Windows.Forms.ListBox();
            this.button1 = new System.Windows.Forms.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.m_chkBoxMecrhantSlipSoftCopy = new System.Windows.Forms.CheckBox();
            this.SuspendLayout();
            // 
            // m_listAllowedInputs
            // 
            this.m_listAllowedInputs.Font = new System.Drawing.Font("Consolas", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(162)));
            this.m_listAllowedInputs.FormattingEnabled = true;
            this.m_listAllowedInputs.Location = new System.Drawing.Point(4, 201);
            this.m_listAllowedInputs.Name = "m_listAllowedInputs";
            this.m_listAllowedInputs.SelectionMode = System.Windows.Forms.SelectionMode.MultiSimple;
            this.m_listAllowedInputs.Size = new System.Drawing.Size(260, 82);
            this.m_listAllowedInputs.TabIndex = 135;
            this.m_listAllowedInputs.SelectedIndexChanged += new System.EventHandler(this.m_listAllowedInputs_SelectedIndexChanged);
            this.m_listAllowedInputs.DoubleClick += new System.EventHandler(this.m_listAllowedInputs_DoubleClick);
            // 
            // m_listPaymentApplications
            // 
            this.m_listPaymentApplications.Font = new System.Drawing.Font("Consolas", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(162)));
            this.m_listPaymentApplications.FormattingEnabled = true;
            this.m_listPaymentApplications.Location = new System.Drawing.Point(4, 1);
            this.m_listPaymentApplications.Name = "m_listPaymentApplications";
            this.m_listPaymentApplications.Size = new System.Drawing.Size(260, 160);
            this.m_listPaymentApplications.TabIndex = 133;
            this.m_listPaymentApplications.SelectedIndexChanged += new System.EventHandler(this.m_listPaymentApplications_SelectedIndexChanged);
            this.m_listPaymentApplications.DoubleClick += new System.EventHandler(this.m_listPaymentApplications_DoubleClick);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(189, 296);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(75, 23);
            this.button1.TabIndex = 132;
            this.button1.Text = "&Tamamla";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click_1);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 184);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(105, 13);
            this.label2.TabIndex = 137;
            this.label2.Text = "İzin verilen giriş tipleri";
            // 
            // m_chkBoxMecrhantSlipSoftCopy
            // 
            this.m_chkBoxMecrhantSlipSoftCopy.AutoSize = true;
            this.m_chkBoxMecrhantSlipSoftCopy.Enabled = false;
            this.m_chkBoxMecrhantSlipSoftCopy.Location = new System.Drawing.Point(9, 302);
            this.m_chkBoxMecrhantSlipSoftCopy.Margin = new System.Windows.Forms.Padding(2);
            this.m_chkBoxMecrhantSlipSoftCopy.Name = "m_chkBoxMecrhantSlipSoftCopy";
            this.m_chkBoxMecrhantSlipSoftCopy.Size = new System.Drawing.Size(140, 17);
            this.m_chkBoxMecrhantSlipSoftCopy.TabIndex = 138;
            this.m_chkBoxMecrhantSlipSoftCopy.Text = "Merchant Slip Soft Copy";
            this.m_chkBoxMecrhantSlipSoftCopy.UseVisualStyleBackColor = true;
            // 
            // PaymentAppFormExtended
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(278, 326);
            this.Controls.Add(this.m_chkBoxMecrhantSlipSoftCopy);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.m_listAllowedInputs);
            this.Controls.Add(this.m_listPaymentApplications);
            this.Controls.Add(this.button1);
            this.Margin = new System.Windows.Forms.Padding(2);
            this.Name = "PaymentAppFormExtended";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "PaymentAppFormExtended";
            this.KeyDown += new System.Windows.Forms.KeyEventHandler(this.PaymentAppFormExtended_KeyDown);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.ListBox m_listAllowedInputs;
        private System.Windows.Forms.ListBox m_listPaymentApplications;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.CheckBox m_chkBoxMecrhantSlipSoftCopy;
    }
}