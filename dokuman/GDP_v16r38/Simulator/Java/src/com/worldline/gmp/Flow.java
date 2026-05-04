package com.worldline.gmp;

import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JOptionPane;
import javax.swing.JLabel;

import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import com.worldline.gmp.GmpDll.*;
import com.worldline.gmp.GmpDriver.*;

import com.sun.jna.ptr.LongByReference;

public class Flow extends JDialog implements ActionListener {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	JLabel lblAkislar;
	GmpDriver gmpDriver;
	
	/**
	 * Launch the application.
	 */  
	public int start() {
		
		ErrorClass.lblError = lblAkislar;
		
		try {
			this.setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
			this.setModal(true);
			this.setVisible(true); 
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return 1;//lstBankList.getSelectedIndex();
		
	}/**/

	/**
	 * Create the dialog.
	 */
	public Flow(GmpDriver gmpDriverObj) {
		
		gmpDriver = gmpDriverObj;
		
		setBounds(100, 100, 450, 384);
		getContentPane().setLayout(null);
		{
			JButton btnHandleAc = new JButton("Handle Ac");
			btnHandleAc.setBounds(100, 45, 230, 23);
			getContentPane().add(btnHandleAc);
			btnHandleAc.addActionListener((ActionListener) this);
			btnHandleAc.setActionCommand(btnHandleAc.getText());
		}
		{
			JButton btnFisBaslikYazdir = new JButton("Fis Baslik Yazdir");
			btnFisBaslikYazdir.setBounds(100, 79, 230, 23);
			getContentPane().add(btnFisBaslikYazdir);
			btnFisBaslikYazdir.addActionListener((ActionListener) this);
			btnFisBaslikYazdir.setActionCommand(btnFisBaslikYazdir.getText());
		}
		{
			JButton btnToplamYazdir = new JButton("Toplam Yazdir");
			btnToplamYazdir.setBounds(100, 181, 230, 23);
			getContentPane().add(btnToplamYazdir);
			btnToplamYazdir.addActionListener((ActionListener) this);
			btnToplamYazdir.setActionCommand(btnToplamYazdir.getText());
		}
		{
			JButton btnMftenOnceYazdir = new JButton("MFten Once Yazdir");
			btnMftenOnceYazdir.setBounds(100, 215, 230, 23);
			getContentPane().add(btnMftenOnceYazdir);
			btnMftenOnceYazdir.addActionListener((ActionListener) this);
			btnMftenOnceYazdir.setActionCommand(btnMftenOnceYazdir.getText());
		}
		{
			JButton btnMfYazdir = new JButton("MF Yazdir");
			btnMfYazdir.setBounds(100, 249, 230, 23);
			getContentPane().add(btnMfYazdir);
			btnMfYazdir.addActionListener((ActionListener) this);
			btnMfYazdir.setActionCommand(btnMfYazdir.getText());
		}
		{
			JButton btnHandleKapat = new JButton("Handle Kapat");
			btnHandleKapat.setBounds(100, 283, 230, 23);
			getContentPane().add(btnHandleKapat);
			btnHandleKapat.addActionListener((ActionListener) this);
			btnHandleKapat.setActionCommand(btnHandleKapat.getText());
		}
		{
			lblAkislar = new JLabel("AKISLAR");
			lblAkislar.setFont(new Font("Arial", Font.PLAIN, 13));
			lblAkislar.setBounds(10, 11, 387, 23);
			getContentPane().add(lblAkislar);
		}
		{
			JButton btnItemEkle = new JButton("Item Ekle");
			btnItemEkle.setActionCommand("Toplam Yazdir");
			btnItemEkle.setBounds(100, 113, 230, 23);
			getContentPane().add(btnItemEkle);
			btnItemEkle.addActionListener((ActionListener) this);
			btnItemEkle.setActionCommand(btnItemEkle.getText());
		}
		{
			JButton btnOde = new JButton("Ode");
			btnOde.setActionCommand("Toplam Yazdir");
			btnOde.setBounds(100, 147, 230, 23);
			getContentPane().add(btnOde);
			btnOde.addActionListener((ActionListener) this);
			btnOde.setActionCommand(btnOde.getText());
		}
	}

	public int openHandle(int hInt, MyMutable<Long> phTrx, ETransactionFiscalType transactionFiscalType, TTicketType ticketType)
	{
		int retcode = Defines.TRAN_RESULT_OK;
		
//		if (false) //batch mode icin
//        {	
//			byte[] m_uniqueId   = new byte[100];
//			byte[] uniqueIdSign = new byte[100];
//			byte[] userData		= new byte[100];
//            byte[] buffer = new byte[1024];
//            int bufferLen = 0;
//
//            bufferLen = gmpDriver.gmpDll.prepare_Start(buffer, buffer.length, m_uniqueId, m_uniqueId.length, uniqueIdSign, uniqueIdSign.length, userData, userData.length);
//            //AddIntoCommandBatch("prepare_Start", Defines.GMP3_FISCAL_PRINTER_MODE_REQ, buffer, bufferLen); 
//        }
//		else
		{
			byte[] uniqueId		= new byte[100];
			byte[] uniqueIdSign = new byte[100]; //datalar alinmak istemedigi icin size dummy olarak verilmistir. 
			byte[] userData     = new byte[100];

			LongByReference refTrx = new LongByReference();
			refTrx.setValue(phTrx.get());
 			retcode = gmpDriver.gmpDll.FP3_Start(hInt, refTrx, (byte)0, uniqueId, uniqueId.length, uniqueIdSign, uniqueIdSign.length, userData, userData.length, gmpDriver.TIMEOUT_DEFAULT);
			phTrx.set(refTrx.getValue());
	        
			if (retcode == Defines.APP_ERR_ALREADY_DONE)
	        { 
	        	switch( JOptionPane.showConfirmDialog(null, "OKC'de Tamamlanmamis Islem Var. Islemi IPTAL Etmek icin Cancel, Tekrar Yuklemek icin OK'e basin", "Tamamlanmamis Islem", JOptionPane.CANCEL_OPTION) )
		        {
                    case JOptionPane.OK_OPTION:
                    	return gmpDriver.ReloadTransaction(hInt, phTrx.get());
		            case  JOptionPane.CANCEL_OPTION:
		            	gmpDriver.OnBnClickedButtonVoidAll(hInt, phTrx);
		            	return gmpDriver.START_TICKET_AGAIN;
		        }
	        } 
			
			if (retcode != Defines.TRAN_RESULT_OK)
	        {
		        ErrorClass.HandleErrorCode(retcode);
		        // Handle Acik kalmasin...
		        gmpDriver.gmpDll.FP3_Close(hInt, phTrx.get(), gmpDriver.TIMEOUT_DEFAULT);
		        phTrx.set((long)0);
	        }
		}
		
		return retcode;
	}
	
	private int printTicketHeaderMenuItem(int hInt, long hTrx)
    {
        int retcode = Defines.TRAN_RESULT_OK;

        retcode = gmpDriver.gmpDll.FP3_TicketHeader(hInt, hTrx, TTicketType.TProcessSale.getValue(), gmpDriver.TIMEOUT_DEFAULT);

        return retcode;
    }
	 
	
	@Override
	public void actionPerformed(ActionEvent arg0) {

		int retcode = 0;
		String evtCmd = arg0.getActionCommand(); 
		String data = "";
		
		if(evtCmd.equals("Handle Ac"))
		{
			if (MainFrame.getCurrentTrx() == 0)
			{
				MyMutable<Long> phTrx = new MyMutable<Long>(MainFrame.getCurrentTrx());
				for (;;) {
		        	 retcode = openHandle(MainFrame.getCurrentInt(), phTrx, ETransactionFiscalType.TRANSACTION_FISCAL_TYPE_SALE, TTicketType.TProcessSale);        	 
		        	if (retcode != gmpDriver.START_TICKET_AGAIN)
		        		break;
				}
				MainFrame.setCurrentTrx(phTrx.get());
				data = "Handle ac";
			}
		}
		else if(evtCmd.equals("Fis Baslik Yazdir"))
		{ 
			retcode = printTicketHeaderMenuItem(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx());
			data = "Fis Baslik Yazdir"; 
			
		}
		else if (evtCmd.equals("Item Ekle"))
		{
			ST_ITEM stItem = new ST_ITEM();
			stItem.type = Defines.ITEM_TYPE_DEPARTMENT;
			stItem.subType = 0;
			stItem.deptIndex = 0;
			stItem.amount = 300;
			stItem.currency = 949;
			stItem.count = 0;
			stItem.unitType = 0;
			stItem.pluPriceIndex = 0;
			stItem.countPrecition = 0;
			stItem.name="test";//stItem.name = GmpDriver.getNulTerminatedBytes(name);
			stItem.barcode = "test";//stItem.barcode = GmpDriver.getNulTerminatedBytes(barcode);

	        retcode = gmpDriver.FP3_ItemSale(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), stItem, gmpDriver.gstTicket, gmpDriver.TIMEOUT_DEFAULT);
	        data = "Item Ekle";
		}
		else if (evtCmd.equals("Ode"))
		{ 
			
			ST_PAYMENT_REQUEST[] stPaymentRequest = new ST_PAYMENT_REQUEST[1];
	        for (int i = 0; i < stPaymentRequest.length; i++)
	        {
	            stPaymentRequest[i] = new ST_PAYMENT_REQUEST();
	        }

	        stPaymentRequest[0].typeOfPayment = EPaymentTypes.PAYMENT_CASH_TL.getValue();
	        stPaymentRequest[0].subtypeOfPayment = 0;
	        stPaymentRequest[0].payAmount = 300;
	        stPaymentRequest[0].payAmountCurrencyCode = (short)949;
	        
	        retcode = gmpDriver.FP3_Payment(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), stPaymentRequest[0], gmpDriver.gstTicket, gmpDriver.TIMEOUT_DEFAULT); 
			  
			data = "Ode";
		}
		else if (evtCmd.equals("Toplam Yazdir"))
		{
			retcode = gmpDriver.gmpDll.FP3_PrintTotalsAndPayments(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), gmpDriver.TIMEOUT_DEFAULT);
			data = "Toplam Yazdir";
		}
		else if (evtCmd.equals("MFten Once Yazdir"))
		{
			retcode = gmpDriver.gmpDll.FP3_PrintBeforeMF(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), gmpDriver.TIMEOUT_DEFAULT); 
			data = "MFten Once Yazdir";
		}
		else if (evtCmd.equals("MF Yazdir"))
		{
			retcode = gmpDriver.gmpDll.FP3_PrintMF(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), gmpDriver.TIMEOUT_DEFAULT); 
			data = "MF Yazdir";
		}
		else if (evtCmd.equals("Handle Kapat"))
		{ 
			retcode = gmpDriver.gmpDll.FP3_Close(MainFrame.getCurrentInt(), MainFrame.getCurrentTrx(), gmpDriver.TIMEOUT_DEFAULT);
			MainFrame.setCurrentTrx((long)0);
			data = "Handle Kapat";
		} 
		
		ErrorClass.HandleErrorCode(retcode);
		if (retcode == 0)
			Utility.setLblTxt(lblAkislar, Utility.colorOK, data + ": " + lblAkislar.getText());
		else
			Utility.setLblTxt(lblAkislar, Utility.colorNOK, data + ": " + lblAkislar.getText());
	}

}
