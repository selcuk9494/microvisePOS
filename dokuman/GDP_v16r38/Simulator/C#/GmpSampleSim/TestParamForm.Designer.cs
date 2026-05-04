namespace GmpSampleSim
{
    partial class TestParamForm
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
            this.tamam = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // tamam
            // 
            this.tamam.Location = new System.Drawing.Point(251, 375);
            this.tamam.Name = "tamam";
            this.tamam.Size = new System.Drawing.Size(131, 23);
            this.tamam.TabIndex = 0;
            this.tamam.Text = "Tamam";
            this.tamam.UseVisualStyleBackColor = true;
            this.tamam.Click += new System.EventHandler(this.tamam_Click);
            // 
            // TestParamForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(744, 498);
            this.ControlBox = false;
            this.Controls.Add(this.tamam);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Fixed3D;
            this.Name = "TestParamForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Test Params";
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button tamam;
    }
}