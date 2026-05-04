
namespace GmpSampleSim
{
    partial class TransactionRestrictionForm
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
            this.getParamsButton = new System.Windows.Forms.Button();
            this.setParamsButton = new System.Windows.Forms.Button();
            this.paramsCheckedList = new System.Windows.Forms.CheckedListBox();
            this.paramsGroup = new System.Windows.Forms.GroupBox();
            this.paramsGroup.SuspendLayout();
            this.SuspendLayout();
            // 
            // getParamsButton
            // 
            this.getParamsButton.Location = new System.Drawing.Point(93, 275);
            this.getParamsButton.Name = "getParamsButton";
            this.getParamsButton.Size = new System.Drawing.Size(75, 23);
            this.getParamsButton.TabIndex = 0;
            this.getParamsButton.Text = "Getir";
            this.getParamsButton.UseVisualStyleBackColor = true;
            this.getParamsButton.Click += new System.EventHandler(this.getParamsButton_Click);
            // 
            // setParamsButton
            // 
            this.setParamsButton.Location = new System.Drawing.Point(241, 275);
            this.setParamsButton.Name = "setParamsButton";
            this.setParamsButton.Size = new System.Drawing.Size(75, 23);
            this.setParamsButton.TabIndex = 1;
            this.setParamsButton.Text = "Gönder";
            this.setParamsButton.UseVisualStyleBackColor = true;
            this.setParamsButton.Click += new System.EventHandler(this.setParamsButton_Click);
            // 
            // paramsCheckedList
            // 
            this.paramsCheckedList.BackColor = System.Drawing.SystemColors.Control;
            this.paramsCheckedList.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.paramsCheckedList.CheckOnClick = true;
            this.paramsCheckedList.FormattingEnabled = true;
            this.paramsCheckedList.Items.AddRange(new object[] {
            "FLAG_ING_PARAM_DISABLE_PLU_GIRISLI_SATIS",
            "FLAG_ING_PARAM_DISABLE_DEPT_GIRISLI_SATIS",
            "FLAG_ING_PARAM_DISABLE_SERB_GIRISLI_SATIS",
            "FLAG_ING_PARAM_DISABLE_INDIRIM_ARTTIRIM",
            "FLAG_ING_PARAM_DISABLE_MANUAL_SATIS",
            "FLAG_ING_PARAM_DISABLE_KREDILI_AVANS_ODEME",
            "FLAG_ING_PARAM_DISABLE_TAXLESS ",
            "FLAG_ING_PARAM_ENABLE_F_MENU_PASSWORD",
            "FLAG_ING_PARAM_DISABLE_KREDILI_CARI_HESAP_ODEME",
            "FLAG_ING_PARAM_DISABLE_ECR_RECEIPT",
            "FLAG_ING_PARAM_DISABLE_INVOICE_INFO_RECEIPT",
            "FLAG_ING_PARAM_DISABLE_FOOCARD_INFO_RECEIPT",
            "FLAG_ING_PARAM_DISABLE_BANKA_MENU",
            "FLAG_ING_PARAM_DISABLE_SEKTOREL_MENU"});
            this.paramsCheckedList.Location = new System.Drawing.Point(3, 16);
            this.paramsCheckedList.Name = "paramsCheckedList";
            this.paramsCheckedList.Size = new System.Drawing.Size(346, 225);
            this.paramsCheckedList.TabIndex = 2;
            this.paramsCheckedList.SelectedIndexChanged += new System.EventHandler(this.paramsCheckedList_SelectedIndexChanged);
            // 
            // paramsGroup
            // 
            this.paramsGroup.Controls.Add(this.paramsCheckedList);
            this.paramsGroup.Location = new System.Drawing.Point(37, 12);
            this.paramsGroup.Name = "paramsGroup";
            this.paramsGroup.Size = new System.Drawing.Size(348, 257);
            this.paramsGroup.TabIndex = 4;
            this.paramsGroup.TabStop = false;
            this.paramsGroup.Text = "Params [0x00000000]";
            // 
            // TransactionRestrictionForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(419, 310);
            this.Controls.Add(this.paramsGroup);
            this.Controls.Add(this.setParamsButton);
            this.Controls.Add(this.getParamsButton);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "TransactionRestrictionForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "İşlem Kısıtlama";
            this.paramsGroup.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button getParamsButton;
        private System.Windows.Forms.Button setParamsButton;
        private System.Windows.Forms.CheckedListBox paramsCheckedList;
        private System.Windows.Forms.GroupBox paramsGroup;
    }
}