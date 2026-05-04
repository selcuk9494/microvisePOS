package com.worldline.gmp;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.BorderFactory;
import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JComboBox;

import java.awt.Font;

import javax.swing.ImageIcon;
import javax.swing.JTextField;
import javax.swing.border.TitledBorder;

import com.worldline.gmp.GmpDll.MyMutable;
import com.worldline.gmp.GmpDll.ST_Department;
import com.worldline.gmp.GmpDll.ST_EXCHANGE_PROFILE;
import com.worldline.gmp.GmpDll.ST_INTERFACE_XML_DATA;
import com.worldline.gmp.GmpDll.ST_TaxRate;

import javax.swing.JSeparator;
import javax.swing.JTextArea;

public class MainFrame implements ActionListener {
	private static final String GMP_SIM_VERSION = "v16r38";
	
	private JFrame frame;
	private JTextField txtTempPane; 
	private JComboBox<String> cmbCurrency;
	private JLabel    lblInfo;
	private JLabel lblIconPair;
	private JButton btnK1;
	private JButton btnK2;
	private JButton btnK3;
	private JButton btnK4;
	private JButton btnK5;
	private JButton btnK6;
	private JButton btnK7;
	private JButton btnK8;
	private JButton btnKalan;
	private JButton btnToplam;
	private JLabel handleLabel;
	
	private int currentInt = 0;
	private long currentTrx = 0;
	
	private int[] interfaceList;
	private int interfaceCount = 0;
	private JRadioButton[] interfaceButtons;
	private JTextArea interfaceDetail;
	
	public GmpDriver gmpDriver;
	private static MainFrame instance = null;
	
	public static int getCurrentInt() {
		return instance.currentInt;
	}

	public static long getCurrentTrx() {
		return instance.currentTrx;
	}
	public static void setCurrentTrx(Long pTrx) {
		instance.currentTrx = pTrx;
		instance.handleLabel.setText("HANDLE: " + pTrx);
	}     

	public static JButton[] GetDepartmenButtons() {
		JButton[] result = { instance.btnK1 , instance.btnK2, instance.btnK3, instance.btnK4, instance.btnK5, instance.btnK6, instance.btnK7, instance.btnK8 };
		return result;
	}
	
	/**
	 * Launch the application.
	 */
	public static void main(String args[]) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				try {
					instance = new MainFrame();
					instance.frame.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the application.
	 */
	public MainFrame() {
		initialize();
	}

	/**
	 * Initialize the contents of the frame.
	 */
	private void initialize() {
		gmpDriver = new GmpDriver();
		
		try
		{ 
			gmpDriver.initDll();
		}
		catch (Error e)
		{
			JOptionPane.showMessageDialog(null,e.getMessage());			
		}
		
		//init Interface
		frame = new JFrame();
		frame.setBounds(100, 100, 1070, 712);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		
		txtTempPane = new JTextField();
		txtTempPane.setBounds(296, 121, 648, 51);
		
		JButton btnEcho = new JButton("Echo");
		btnEcho.setBounds(761, 278, 183, 51);
		btnEcho.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent arg0) {
				try
				{
					int ret = gmpDriver.FP3_Echo(currentInt, gmpDriver.gst_echo, GmpDll.TIMEOUT_ECHO);
					ErrorClass.HandleErrorCode(ret);
				}
				catch(Throwable e)
				{
					Utility.setLblTxt(lblInfo, Utility.colorNOK, "DLL HATASI");
					JOptionPane.showMessageDialog(null,e);
				} 
			}
		});

		JButton btnPair = new JButton("Eslesme Baslat");
		btnPair.setBounds(761, 338, 183, 51);
		btnPair.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent arg0) { 
				Thread t = new Thread(new Runnable() {
			        @Override
			        public void run() {
			        	Utility.setLblTxt(lblInfo, Color.BLACK, "ESLESME YAPILIYOR. BEKLEYIN.");
			            //Do the job
			        	int ret;
			        	try
						{
							lblIconPair.setIcon(new ImageIcon(this.getClass().getResource("/com/worldline/images/connect_creating.png")));
			                ST_EXCHANGE_PROFILE[] stExchangeProfile = new ST_EXCHANGE_PROFILE[4];
			                ST_TaxRate[] stTaxRates = new ST_TaxRate[8];
			                for (int i = 0 ; i < 8; i++) 
			                	stTaxRates[i] = new ST_TaxRate();
			                ST_Department[] stDepartments = new ST_Department[12];
			                for (int i = 0 ; i < 12; i++) 
			                	stDepartments[i] = new ST_Department();
			                MyMutable<Byte> numberOfTotalTaxRates = new MyMutable<Byte>((byte)0);
			                MyMutable<Byte> numberOfTotalDepartments = new MyMutable<Byte>((byte)0);
			                
			                MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			                ret = gmpDriver.PairingTransaction(currentInt, phTrx, stTaxRates, numberOfTotalTaxRates, stDepartments, numberOfTotalDepartments, stExchangeProfile);
			                setCurrentTrx(phTrx.get());
			                
			                JButton[] idDepartmenButtons = GetDepartmenButtons();
			                for (int i = 0; i < numberOfTotalDepartments.get(); i++)  //daha fazla gelebilir biz 8 adet K degeri aliyoruz
			                {
			                    if ((stDepartments[i].u8TaxIndex >= numberOfTotalTaxRates.get()) || (i > 7))
			                        break;
			                    idDepartmenButtons[i].setText(new String(stDepartments[i].szDeptName).trim() + "  %"+ Integer.toString((stTaxRates[stDepartments[i].u8TaxIndex].taxRate / 100))+"."+ Integer.toString(stTaxRates[stDepartments[i].u8TaxIndex].taxRate % 100)); //= String.Format("{0}" + System.Environment.NewLine + "%{1}.{2}", stDepartments[i].szDeptName, stTaxRates[stDepartments[i].u8TaxIndex].taxRate / 100, stTaxRates[stDepartments[i].u8TaxIndex].taxRate % 100);
			                }

			                cmbCurrency.addItem("949 > " + "TL 1TRL  = 1.00TL");

			                if (stExchangeProfile[0] != null)
			                {
				                for (int i = 0; i < stExchangeProfile[0].NumberOfCurrency; i++)
				                {
				            	  	String currValue = Long.toString(stExchangeProfile[0].ExchangeRecords[i].rate / 100) + "." + Long.toString(stExchangeProfile[0].ExchangeRecords[i].rate % 100) + " TL";
				                    String str = Integer.toString(stExchangeProfile[0].ExchangeRecords[i].code) + " > " + new String(stExchangeProfile[0].ExchangeRecords[i].prefix) + " 1 " + new String(stExchangeProfile[0].ExchangeRecords[i].prefix)+ " = " + currValue; 
				                    cmbCurrency.addItem(str);
				                }
			                }
			                
			        		ErrorClass.HandleErrorCode(ret);

			        		if (ret != 0)
			        		{
			        			lblIconPair.setIcon(new ImageIcon(this.getClass().getResource("/com/worldline/images/connect_no.png")));
			        			lblInfo.setForeground(Utility.colorNOK);
			        		}
							else
								lblIconPair.setIcon(new ImageIcon(this.getClass().getResource("/com/worldline/images/connect_established.png")));
						}
			        	catch(Throwable e)
						{
			        		Utility.setLblTxt(lblInfo, Utility.colorNOK, "DLL HATASI");
			        		JOptionPane.showMessageDialog(null, e);
						} 
			        }
			    });
			    t.start(); 
			}
		});
		
		JButton btn1 = new JButton("1"); 
		btn1.setBounds(409, 183, 47, 23);
		btn1.addActionListener((ActionListener) this);
		btn1.setActionCommand(btn1.getText());
		
		JButton btn2 = new JButton("2");
		btn2.setBounds(466, 183, 47, 23);
		btn2.addActionListener((ActionListener) this);
		btn2.setActionCommand(btn2.getText());
		
		JButton btn3 = new JButton("3");
		btn3.setBounds(523, 184, 47, 23);
		btn3.addActionListener((ActionListener) this);
		btn3.setActionCommand(btn3.getText());
		
		JButton btn4 = new JButton("4");
		btn4.setBounds(409, 224, 47, 23);
		btn4.addActionListener((ActionListener) this);
		btn4.setActionCommand(btn4.getText());
		
		JButton btn5 = new JButton("5");
		btn5.setBounds(466, 224, 47, 23);
		btn5.addActionListener((ActionListener) this);
		btn5.setActionCommand(btn5.getText());
		
		JButton btn6 = new JButton("6");
		btn6.setBounds(523, 224, 47, 23);
		btn6.addActionListener((ActionListener) this);
		btn6.setActionCommand(btn6.getText());
		
		JButton btn7 = new JButton("7");
		btn7.setBounds(409, 265, 47, 23);
		btn7.addActionListener((ActionListener) this);
		btn7.setActionCommand(btn7.getText());
		
		JButton btn8 = new JButton("8");
		btn8.setBounds(466, 265, 47, 23);
		btn8.addActionListener((ActionListener) this);
		btn8.setActionCommand(btn8.getText());
		
		JButton btn9 = new JButton("9");
		btn9.setBounds(523, 265, 47, 23);
		btn9.addActionListener((ActionListener) this);
		btn9.setActionCommand(btn9.getText());
		
		JButton btnx = new JButton("x");
		btnx.setBounds(409, 307, 47, 23);
		btnx.addActionListener((ActionListener) this);
		btnx.setActionCommand(btnx.getText());
		
		JButton btn0 = new JButton("0");
		btn0.setBounds(466, 307, 47, 23);
		btn0.addActionListener((ActionListener) this);
		btn0.setActionCommand(btn0.getText());
		
		JButton btnDot = new JButton(".");
		btnDot.setBounds(523, 307, 47, 23);
		btnDot.addActionListener((ActionListener) this);
		btnDot.setActionCommand(btnDot.getText());
		
		JButton btnF = new JButton("F");
		btnF.setBounds(588, 184, 47, 23);
		btnF.addActionListener((ActionListener) this);
		btnF.setActionCommand(btnF.getText());
		
		JButton btnCancel = new JButton("X");
		btnCancel.setBounds(588, 225, 47, 23);
		btnCancel.setBackground(Color.RED);
		btnCancel.setOpaque(true);
		btnCancel.addActionListener((ActionListener) this);
		btnCancel.setActionCommand(btnCancel.getText());
		
		JButton btnDelete = new JButton("<");
		btnDelete.setBounds(588, 266, 47, 23);
		btnDelete.setOpaque(true);
		btnDelete.setBackground(Color.YELLOW);
		btnDelete.addActionListener((ActionListener) this);
		btnDelete.setActionCommand(btnDelete.getText());
		
		JButton btnOK = new JButton("o");
		btnOK.setBounds(588, 308, 47, 23);
		btnOK.setOpaque(true);
		btnOK.setBackground(Color.GREEN);
		btnOK.addActionListener((ActionListener) this);
		btnOK.setActionCommand(btnOK.getText());
		
		frame.getContentPane().setLayout(null);
		frame.getContentPane().add(btnx);
		frame.getContentPane().add(btn0);
		frame.getContentPane().add(btnDot);
		frame.getContentPane().add(btn1);
		frame.getContentPane().add(btn2);
		frame.getContentPane().add(btn3);
		frame.getContentPane().add(btn4);
		frame.getContentPane().add(btn5);
		frame.getContentPane().add(btn6);
		frame.getContentPane().add(btn7);
		frame.getContentPane().add(btn8);
		frame.getContentPane().add(btn9);
		frame.getContentPane().add(btnF);
		frame.getContentPane().add(btnCancel);
		frame.getContentPane().add(btnDelete);
		frame.getContentPane().add(btnEcho);
		frame.getContentPane().add(btnPair);
		frame.getContentPane().add(btnOK);
		frame.getContentPane().add(txtTempPane);
		
		JLabel lblV = new JLabel(GMP_SIM_VERSION);
		lblV.setBounds(905, 58, 39, 23);
		frame.getContentPane().add(lblV);
		
		JButton btnNakit = new JButton("Nakit");
		btnNakit.setBounds(534, 355, 217, 35);
		frame.getContentPane().add(btnNakit);
		btnNakit.addActionListener((ActionListener) this);
		btnNakit.setActionCommand(btnNakit.getText());
		
		JButton btnKredi = new JButton("Kredi");
		btnKredi.setBounds(296, 355, 217, 35);
		frame.getContentPane().add(btnKredi);
		btnKredi.addActionListener((ActionListener) this);
		btnKredi.setActionCommand(btnKredi.getText());
		
		
		btnK1 = new JButton("K1");
		btnK1.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK1.setBackground(Color.CYAN);
		btnK1.setBounds(296, 183, 103, 23);
		frame.getContentPane().add(btnK1);
		btnK1.addActionListener((ActionListener) this);
		btnK1.setActionCommand(btnK1.getText());
		
		
		btnK2 = new JButton("K2");
		btnK2.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK2.setBackground(Color.CYAN);
		btnK2.setBounds(296, 224, 103, 23);
		frame.getContentPane().add(btnK2);
		btnK2.addActionListener((ActionListener) this);
		btnK2.setActionCommand(btnK2.getText());
		
		btnK3 = new JButton("K3");
		btnK3.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK3.setBackground(Color.CYAN);
		btnK3.setBounds(296, 265, 103, 23);
		frame.getContentPane().add(btnK3);
		btnK3.addActionListener((ActionListener) this);
		btnK3.setActionCommand(btnK3.getText());
		
		btnK4 = new JButton("K4");
		btnK4.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK4.setBackground(Color.CYAN);
		btnK4.setBounds(296, 307, 103, 23);
		frame.getContentPane().add(btnK4);
		btnK4.addActionListener((ActionListener) this);
		btnK4.setActionCommand(btnK4.getText());
		
		cmbCurrency = new JComboBox<String>();//GmpDriver.ECurrency.values());
		cmbCurrency.setBounds(761, 183, 183, 20); 
		
		frame.getContentPane().add(cmbCurrency);
		
		lblInfo = new JLabel("SIMULATOR STARTED");
		lblInfo.setFont(new Font("Arial", Font.PLAIN, 15));
		lblInfo.setBounds(296, 58, 496, 23);
		frame.getContentPane().add(lblInfo);
		ErrorClass.lblError = lblInfo;
		
		lblIconPair = new JLabel("");
		lblIconPair.setIcon(new ImageIcon(this.getClass().getResource("/com/worldline/images/connect_no.png")));
		lblIconPair.setBounds(842, 47, 53, 34);
		frame.getContentPane().add(lblIconPair);
		
		btnK5 = new JButton("K5");
		btnK5.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK5.setBackground(Color.CYAN); 
		btnK5.setBounds(645, 183, 106, 23);
		frame.getContentPane().add(btnK5);
		btnK5.addActionListener((ActionListener) this);
		btnK5.setActionCommand(btnK5.getText());
		
		btnK6 = new JButton("K6");
		btnK6.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK6.setBackground(Color.CYAN); 
		btnK6.setBounds(645, 224, 106, 23);
		frame.getContentPane().add(btnK6);
		btnK6.addActionListener((ActionListener) this);
		btnK6.setActionCommand(btnK6.getText());
		
		btnK7 = new JButton("K7");
		btnK7.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK7.setBackground(Color.CYAN); 
		btnK7.setBounds(645, 265, 106, 23);
		frame.getContentPane().add(btnK7);
		btnK7.addActionListener((ActionListener) this);
		btnK7.setActionCommand(btnK7.getText());
		
		btnK8 = new JButton("K8");
		btnK8.setFont(new Font("Tahoma", Font.PLAIN, 9));
		btnK8.setBackground(Color.CYAN); 
		btnK8.setBounds(645, 307, 106, 23);
		frame.getContentPane().add(btnK8);
		btnK8.addActionListener((ActionListener) this);
		btnK8.setActionCommand(btnK8.getText());
		
		JButton btnUrunIptal = new JButton("Urun Iptal");
		btnUrunIptal.setActionCommand("Kredi");
		btnUrunIptal.setBounds(296, 447, 150, 35);
		frame.getContentPane().add(btnUrunIptal);
		btnUrunIptal.addActionListener((ActionListener) this);
		btnUrunIptal.setActionCommand(btnUrunIptal.getText());
		
		JButton btnOdemeIptal = new JButton("Odeme Iptal");
		btnOdemeIptal.setActionCommand("Kredi");
		btnOdemeIptal.setBounds(456, 447, 150, 35);
		frame.getContentPane().add(btnOdemeIptal);
		btnOdemeIptal.addActionListener((ActionListener) this);
		btnOdemeIptal.setActionCommand(btnOdemeIptal.getText());
		
		JButton btnFisIptal = new JButton("Fis Iptal");
		btnFisIptal.setActionCommand("Kredi");
		btnFisIptal.setBounds(621, 447, 150, 35);
		frame.getContentPane().add(btnFisIptal);
		btnFisIptal.addActionListener((ActionListener) this);
		btnFisIptal.setActionCommand(btnFisIptal.getText());
		
		JButton btnIndirim = new JButton("Indirim");
		btnIndirim.setActionCommand("Kredi");
		btnIndirim.setBounds(794, 447, 150, 35);
		frame.getContentPane().add(btnIndirim);
		btnIndirim.addActionListener((ActionListener) this);
		btnIndirim.setActionCommand(btnIndirim.getText());
		
		JButton btnAkislar = new JButton("Akislar");
		btnAkislar.setActionCommand("Kredi");
		btnAkislar.setBounds(296, 493, 150, 35);
		frame.getContentPane().add(btnAkislar);
		btnAkislar.addActionListener((ActionListener) this);
		btnAkislar.setActionCommand(btnAkislar.getText());
		
		JButton btnKullaniciMsg = new JButton("Kullanici Mesaj");
		btnKullaniciMsg.setActionCommand("Kullanici Mesaj");
		btnKullaniciMsg.setBounds(456, 493, 150, 35);
		frame.getContentPane().add(btnKullaniciMsg);
		btnKullaniciMsg.addActionListener((ActionListener) this);
		btnKullaniciMsg.setActionCommand(btnKullaniciMsg.getText());
		
		JButton btnFonksiyonlar = new JButton("Fonksiyonlar");
		btnFonksiyonlar.setActionCommand("Kredi");
		btnFonksiyonlar.setBounds(621, 493, 150, 35);
		frame.getContentPane().add(btnFonksiyonlar);
		btnFonksiyonlar.addActionListener((ActionListener) this);
		btnFonksiyonlar.setActionCommand(btnFonksiyonlar.getText());
		
		JButton btnRfu_4 = new JButton("RFU5");
		btnRfu_4.setActionCommand("Kredi");
		btnRfu_4.setBounds(794, 493, 150, 35);
		frame.getContentPane().add(btnRfu_4);
		btnRfu_4.addActionListener((ActionListener) this);
		btnRfu_4.setActionCommand(btnRfu_4.getText());
		
		btnKalan = new JButton("Kalan = 0");
		btnKalan.setBackground(Color.WHITE);
		btnKalan.setBounds(616, 92, 328, 23);
		frame.getContentPane().add(btnKalan);
		btnKalan.addActionListener((ActionListener) this);
		btnKalan.setActionCommand(btnKalan.getText());
		
		btnToplam = new JButton("Toplam = 0");
		btnToplam.setBackground(Color.WHITE);
		btnToplam.setBounds(296, 92, 317, 23);
		frame.getContentPane().add(btnToplam);
		
		JSeparator separator = new JSeparator();
		separator.setBounds(296, 421, 648, 2);
		frame.getContentPane().add(separator);

		handleLabel = new JLabel();
		handleLabel.setBounds(296, 420, 300, 35);
		handleLabel.setText("HANDLE: ");
		frame.getContentPane().add(handleLabel);
		
		JPanel interfaceGroup = new JPanel();
		interfaceGroup.setBounds(58, 58, 220, 254);
		interfaceGroup.setLayout(null);
		interfaceGroup.setBorder(BorderFactory.createTitledBorder(BorderFactory.createEtchedBorder(), "Interfaces:", TitledBorder.LEFT, TitledBorder.TOP));
		frame.getContentPane().add(interfaceGroup);

		JPanel interfaceDetailGroup = new JPanel();
		interfaceDetailGroup.setBounds(58, 322, 220, 290);
		interfaceDetailGroup.setLayout(null);
		interfaceDetailGroup.setBorder(BorderFactory.createTitledBorder(BorderFactory.createEtchedBorder(), "Interfaces Detail:", TitledBorder.LEFT, TitledBorder.TOP));
		frame.getContentPane().add(interfaceDetailGroup);
		
		interfaceDetail = new JTextArea();
		interfaceDetail.setBounds(10, 20, 200, 260);
		interfaceDetail.setEditable(false);
		interfaceDetail.setAlignmentY(JTextArea.TOP_ALIGNMENT);
		interfaceDetail.setText("Interface:\n\r...");
		interfaceDetailGroup.add(interfaceDetail);
		
		interfaceButtons = new JRadioButton[20];
		ActionListener redioListener = new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				for (int i = 0; i < interfaceCount; ++i) {
                    if (interfaceButtons[i].isSelected()) {
                    	setInterfaceInfo(i);
                    	break;
                    }
                }
			}
		};
		
		interfaceList = new int[20];
		interfaceCount = gmpDriver.gmpDll.FP3_GetInterfaceHandleList(interfaceList, interfaceList.length);

		if (interfaceCount > 0)
		{
			ButtonGroup bg = new ButtonGroup();
			for (int i = 0; i < interfaceCount; ++i)
			{
				byte[] ID = new byte[64];
	            gmpDriver.gmpDll.FP3_GetInterfaceID(interfaceList[i], ID, ID.length);
	            String Handle = Integer.toHexString(interfaceList[i]).toUpperCase() + "-" + new String(ID);
	
	            interfaceButtons[i] = new JRadioButton();
	            interfaceButtons[i].setText(Handle);
	            interfaceButtons[i].setBounds(10, 20 + (i * 20), 200, 20);
	            interfaceButtons[i].addActionListener(redioListener);
	            bg.add(interfaceButtons[i]);
				interfaceGroup.add(interfaceButtons[i]);
			}
			interfaceButtons[0].setSelected(true);
			setInterfaceInfo(0);
		}
	}

    private void setInterfaceInfo(int index) {
    	currentInt = interfaceList[index];
    	
    	ST_INTERFACE_XML_DATA stXmlData = new ST_INTERFACE_XML_DATA();
        gmpDriver.FP3_GetInterfaceXmlDataByHandle(interfaceList[index], stXmlData);

        byte[] ID = new byte[64];
        String Str;

        Str = "Interface: " + Integer.toHexString(interfaceList[index]).toUpperCase() + "\n\r";
        gmpDriver.gmpDll.FP3_GetInterfaceID(interfaceList[index], ID, ID.length);

        Str += "ID : " + new String(ID) + "\n\r";
        if (stXmlData.IsTcpConnection == 0)
        {
            Str += "ConnectionState Type : Port" + "\n\r";
            Str += "Port Name :" + stXmlData.PortName + "\n\r";
            Str += "Baudrate : " + stXmlData.BaudRate + "\n\r";
            Str += "ByteSize : " + stXmlData.ByteSize + "\n\r";
            Str += "fParity : " + stXmlData.fParity + "\n\r";
            Str += "Parity : " + stXmlData.Parity + "\n\r";
            Str += "StopBit : " + stXmlData.StopBit + "\n\r";

            Str += "RetryCounter : " + stXmlData.RetryCounter + "\n\r";
        }
        else
        {
            Str += "ConnectionState Type : IP" + "\n\r";
            Str += "IP :" + stXmlData.IP + ":" + stXmlData.Port + "\n\r";
            Str += "IpRetryCount : " + stXmlData.IpRetryCount + "\n\r";
        }

        Str += "AckTimeOut : " + stXmlData.AckTimeOut + "\n\r";
        Str += "CommTimeOut : " + stXmlData.CommTimeOut + "\n\r";
        Str += "InterCharacterTimeOut : " + stXmlData.InterCharacterTimeOut + "\n\r";

        interfaceDetail.setText(Str);
    }
	
	public void actionPerformed(ActionEvent evt) 
	{
		String evtCmd = evt.getActionCommand();
		String txtPaneStr = txtTempPane.getText();
		
		if(Utility.isNumeric(evtCmd))
		{
			
			txtTempPane.setText(txtPaneStr + evtCmd);
			txtTempPane.requestFocus();
		}
		else if(evtCmd.equals("<"))
		{
			if(txtPaneStr.length() != 0)
				txtTempPane.setText(txtPaneStr.substring(0, txtPaneStr.length()-1));
		}
		else if(evtCmd.equals("X"))
		{
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K1"))
		{
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 1, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K2"))
		{ 
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 2, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K3"))
		{ 
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 3, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K4"))
		{
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 4, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K5"))
		{
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 5, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K6"))
		{ 
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(),phTrx, 6, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K7"))
		{ 
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 7, txtTempPane.getText(), cmbCurrency);
			setCurrentTrx(phTrx.get());
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("K8"))
		{
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.DepartmentSale(getCurrentInt(), phTrx, 8, txtTempPane.getText(), cmbCurrency);
			txtTempPane.setText("");
		}
		else if (evtCmd.equals("Nakit"))
		{ 
			int amount 						= 0;
			
			try
			{		
				amount = Integer.parseInt(txtPaneStr);
			}
			catch(Throwable t)
			{
				
			}
			short currencyOfPayment = Short.valueOf(((String)cmbCurrency.getSelectedItem()).substring(0, 3));
 
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			int result = gmpDriver.cashPaymentTrans(getCurrentInt(), phTrx, amount, currencyOfPayment);
			setCurrentTrx(phTrx.get());
			
			ErrorClass.HandleErrorCode(result);
		}
		else if (evtCmd.equals("Kredi"))
		{
			try { 
		        if (cmbCurrency.getSelectedItem() == null)
		        	cmbCurrency.setSelectedIndex(0);
		        short currencyOfPayment = Short.valueOf(((String)cmbCurrency.getSelectedItem()).substring(0, 3));

				MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
		        int ret = gmpDriver.creditPaymnet(getCurrentInt(), phTrx, currencyOfPayment, txtTempPane.getText());
				setCurrentTrx(phTrx.get());
				ErrorClass.HandleErrorCode(ret); 
			} catch (Exception e) {
				e.printStackTrace();
			} 
		}
		else if(evtCmd.equals("Kalan = 0"))
		{
			txtTempPane.setText(Long.toString(gmpDriver.remainingAmount));		
		}
		else if(evtCmd.equals("Urun Iptal"))
		{
			int ret = gmpDriver.itemVoid(getCurrentInt(), getCurrentTrx(), txtTempPane.getText());
			ErrorClass.HandleErrorCode(ret);
		}
		else if(evtCmd.equals("Odeme Iptal"))
		{
			int ret = gmpDriver.paymentVoid(getCurrentInt(), getCurrentTrx(), txtTempPane.getText());
			ErrorClass.HandleErrorCode(ret);
		}
		else if(evtCmd.equals("Fis Iptal"))
		{
			MyMutable<Long> phTrx = new MyMutable<Long>(getCurrentTrx());
			gmpDriver.OnBnClickedButtonVoidAll(getCurrentInt(), phTrx);
			setCurrentTrx(phTrx.get());
		}
		else if(evtCmd.equals("Indirim"))
		{
			Discount disc = new Discount(gmpDriver);
        	/*int selectedBankInd =*/ disc.start();			
		}
		else if(evtCmd.equals("Akislar"))
		{
			Flow akislar = new Flow(gmpDriver);
			akislar.start();
        	ErrorClass.lblError = lblInfo;
		}
		else if(evtCmd.equals("Kullanici Mesaj"))
		{
			UserMessage um = new UserMessage(gmpDriver);
        	um.start();
        	ErrorClass.lblError = lblInfo;
		}
		else if(evtCmd.equals("Fonksiyonlar"))
		{
			Functions func = new Functions(gmpDriver);
			func.start();
        	ErrorClass.lblError = lblInfo;
		}
		else if(evtCmd.equals("RFU5"))
		{
			
			
		}
		
		gmpDriver.remainingAmount = gmpDriver.gstTicket.TotalReceiptAmount - gmpDriver.gstTicket.TotalReceiptPayment;
		
		if(gmpDriver.remainingAmount != 0)
			btnToplam.setText("Toplam: "+ Long.toString(gmpDriver.gstTicket.TotalReceiptAmount)+ " TL");
		else
			btnToplam.setText("Toplam: "+ Integer.toString(0)+ " TL");
		btnKalan.setText("Kalan: " + Long.toString(gmpDriver.remainingAmount)+ " TL");
	}
	
	public static void setErrorLabel(Color labelColor, String text) {
		if (instance != null)
			Utility.setLblTxt(instance.lblInfo, labelColor, text);
	}
}
