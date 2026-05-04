package com.worldline.gmp;

import java.util.Arrays;
import java.util.List;

import com.sun.jna.Library;
import com.sun.jna.Structure; 
import com.sun.jna.ptr.ByteByReference;
import com.sun.jna.ptr.ShortByReference;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.LongByReference;

/*
 * Bu interface ile gmpdlle ait fonksiyonlari ve yapilari tanimliyoruz.
 * testDll icin en asagidaki ornek kodu inceleyebilirsiniz 
 * 
 * AUTHOR : serhat cagdas
 * 
 * */

public interface GmpDll extends Library 
{	
	public final int TIMEOUT_ECHO = 1000;
	public final int MAX_SALE_INFO = 512;
	public final int MAX_PAYMENT = 24;
	public final int MAX_TAX_DETAIL = 8; 
	public final int MAX_PRINTER_COPY = 1024;
	
	public static class MyMutable<T>
	{
		private T t;
		
		public MyMutable(T t) {
			this.t = t;
		}
		
		public T get() {
			return t;
		}

		public void set(T t) {
			this.t = t;
		}
	}
	
	////////////////////////////////////////////////
	//        STRUCT TANIMLARI                    //
	////////////////////////////////////////////////
	
	//ST_PAYMENT_APPLICATION_INFO
	public static class ST_PAYMENT_APPLICATION_INFO 
	{  
		public byte[]	name;								/**< Name of the payment application */
		public byte		index;								/**< index of the payment application */
		public short	u16BKMId;							/**< BKM Id of the payment application */
		public short	Status;								/**< Status of the payment application */
		public short	Priority;							/**< Priority of the payment application */
		public short	u16AppId;							/**< Telium Id of the payment application */
		public short	AppType;							/**< Application Type */
		public short	AppFlag;							/**< Application Flag */
		public int		AppOpt1;							/**< Application Option 1 */
		public int		AppOpt2;							/**< Application Option 2 */
		public long		SupportedPayments;					/**< bitwise value for supported payments*/
		
        public ST_PAYMENT_APPLICATION_INFO()
        {  
    		name = new byte[20];
    		index = 0;
    		u16BKMId = 0;
    		Status = 0;
    		Priority = 0;
    		u16AppId = 0;
    		AppType = 0;
    		AppFlag = 0;
    		AppOpt1 = 0;
    		AppOpt2 = 0;
    		SupportedPayments = 0;
        } 
        
        public void set(ST_PAYMENT_APPLICATION_INFO inStAppliInfo)
        {
    		name = inStAppliInfo.name;
    		index = inStAppliInfo.index;
    		u16BKMId = inStAppliInfo.u16BKMId;
    		Status = inStAppliInfo.Status;
    		Priority = inStAppliInfo.Priority;
    		u16AppId = inStAppliInfo.u16AppId;
    		AppType = inStAppliInfo.AppType;
    		AppFlag = inStAppliInfo.AppFlag;
    		AppOpt1 = inStAppliInfo.AppOpt1;
    		AppOpt2 = inStAppliInfo.AppOpt2;
    		SupportedPayments = inStAppliInfo.SupportedPayments;
        }
	} 

	//ST_EXCHANGE
	public static class ST_EXCHANGE
	{ 
		public int 	code;
		public String 	prefix;
		public String     sign; 
		public byte  	locationOfSign; 
		public byte			tousandSeperator;
		public byte			centSeperator;
		public byte			numberOfCentDigit;		 
		public long			rate;
		
        public ST_EXCHANGE()
        { 
        	code       = 0;
        	prefix             = "";
        	sign               = "";
        	locationOfSign     = 0 ;
        	tousandSeperator   = 0; 
        	centSeperator      = 0;   
        	numberOfCentDigit  = 0;
        	rate 	  = 0;
        }
        
        public void set(ST_EXCHANGE inStExchange)
        {
        	code       			= inStExchange.code       		;			
        	prefix				= inStExchange.prefix			;			
        	sign 				= inStExchange.sign 			;			
        	locationOfSign    	= inStExchange.locationOfSign   ; 			
        	tousandSeperator 	= inStExchange.tousandSeperator ;			
        	centSeperator     	= inStExchange.centSeperator    ; 			
        	numberOfCentDigit 	= inStExchange.numberOfCentDigit; 			
        	rate 	  			= inStExchange.rate 	  		;	
        }
	}

	// ST_EXCHANGE_PROFILE
	public static class ST_EXCHANGE_PROFILE
	{
		String ProfileName;
		byte NumberOfCurrency;
		ST_EXCHANGE[] ExchangeRecords;
		
		public ST_EXCHANGE_PROFILE()
		{
			ProfileName = "";
			NumberOfCurrency = 0;
			ExchangeRecords = new ST_EXCHANGE[6];
		}

		public void set(ST_EXCHANGE_PROFILE fromJson) {
			ProfileName = fromJson.ProfileName;
			NumberOfCurrency = fromJson.NumberOfCurrency;
			for (int i = 0; i < ExchangeRecords.length; ++i)
				ExchangeRecords[i] = fromJson.ExchangeRecords[i];
		}
	}
	
	//ST_Department
	public static class ST_Department
	{ 
		  
		public String	szDeptName;
		public byte 	u8TaxIndex;
		public long     iCurrencyType;//GmpDriver.ECurrency
		public long  	iUnitType;//GmpDriver.EItemUnitTypes
		public long			u64Limit;
		public long			u64Price;
		 
        
        public ST_Department()
        { 
        	szDeptName = "";
        	u8TaxIndex    = 0 ;
        	iCurrencyType = 0;//iCurrencyType = GmpDriver.ECurrency.CURRENCY_DOLAR;
        	iUnitType     = 0;//iUnitType     = GmpDriver.EItemUnitTypes.ITEM_NONE;  
        	u64Limit 	  = 0;
        	u64Price 	  = 0;
        }
        
        public void set(ST_Department inStDepartment)
        {
        	szDeptName 	  = inStDepartment.szDeptName 	  ;
        	u8TaxIndex    = inStDepartment.u8TaxIndex     ;
        	iCurrencyType = inStDepartment.iCurrencyType  ;
        	iUnitType     = inStDepartment.iUnitType      ;
        	u64Limit 	  = inStDepartment.u64Limit 	  ;
        	u64Price 	  = inStDepartment.u64Price 	  ;
        }
	} 
	
	//ST_TaxRate
	public static class ST_TaxRate
	{ 
        public int taxRate;  
		 
        
        public ST_TaxRate()
        { 
        	taxRate   = 0;  
        }
        
        public void set(ST_TaxRate inStTaxRate)
        {
        	taxRate = inStTaxRate.taxRate;
        }
	}  
	
	
	//ST_USER_MESSAGE
	public static class ST_USER_MESSAGE
	{   
        public long flag; 
        public byte len; 
        public byte[] message;
		 
        
        public ST_USER_MESSAGE()
        { 
        	flag   = 0;
        	len   = 0;
        	message    = new byte[48+1];
        			
        }
        
        public void set (ST_USER_MESSAGE inStUserMsg)
        {
        	flag   		= inStUserMsg.flag;
        	len   		= inStUserMsg.len;
        	message   	= inStUserMsg.message;
        }       
        
	}  
	
	//ST_Cashier
	public static class ST_Cashier
	{  
        public int index; 
        public long flags; 
        public String ticketMsg;
		 
        
        public ST_Cashier()
        { 
        	index   = 0;
        	flags   = 0;
        	ticketMsg    = "";
        } 
		 
	} 
	
	
	
	//ST_Echo
	public static class ST_Echo
	{
		public long retcode;
		public long status;
		public byte[] kvc; 
        public byte ecrMode;
        public int mtuSize;
        public byte[] ecrVersion;
        public ST_Cashier activeCashier;
		 
        
        public ST_Echo()
        {
        	retcode = 0;
        	status  = 0;
        	kvc     = new byte[8];
        	ecrMode = 0;
        	mtuSize = 1024;
        	ecrVersion 		=new byte[16];
        	activeCashier   = new ST_Cashier(); 
        			
        }
        
        public void set(ST_Echo inStEcho)
        {
        	retcode 	  = inStEcho.retcode 	    ;
        	status  	  = inStEcho.status  	    ;
        	kvc     	  = inStEcho.kvc     	    ;
        	ecrMode 	  = inStEcho.ecrMode 	    ;
        	mtuSize 	  = inStEcho.mtuSize 	    ;
        	ecrVersion 	  = inStEcho.ecrVersion 	;
        	activeCashier = inStEcho.activeCashier	; 
        }
		 
	} 
	
	 
	
	//stGMPPair
	public static class ST_GMPPair 
	{ 
		public byte[] In_ProcOrderNum;
		public byte[] In_ProcDate;
		public byte[] In_ProcTime; 
        public byte[] In_DeviceBrand; 
        public byte[] In_DeviceModel; 
        public byte[] In_DeviceSerialNum; 
        public byte[] In_DeviceEcrRegisterNo;
		
		public ST_GMPPair()
		{
			In_ProcOrderNum     = new byte[]{0x00,0x00,0x01};
			In_ProcDate         = new byte[3];
			In_ProcTime         = new byte[3];
	        In_DeviceBrand      = new byte[]{'W','O','R','L','D','L','I','N','E',0x00,0x00,0x00,0x00,0x00,0x00,0x00};//GmpDriver.getNulTerminatedBytes("WORLDLINE");
	        In_DeviceModel      = new byte[]{'I','D','E','2','8','0',0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00};//GmpDriver.getNulTerminatedBytes("IWE280");
	        In_DeviceEcrRegisterNo = new byte[]{'1','2','3','4','5','6','7',0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00};//GmpDriver.getNulTerminatedBytes("12344567"); 
            In_DeviceSerialNum  =  new byte[]{'J','I','D','E','0','0','0','0','0','0','1','6',0x00,0x00,0x00,0x00,0x00};//GmpDriver.getNulTerminatedBytes("JHWE20000079");
		} 
	} 
	 
	
	
	//stGMPPairResp
	public static class ST_GMPPairResp
	{ 
		public byte[] Out_ProcOrderNum;
		public byte[] Out_ProcDate;
		public byte[] Out_ProcTime; 
	    public byte[] Out_DeviceBrand;  
	    public byte[] Out_DeviceModel;
	    public byte[] Out_DeviceSerialNum;
	    public byte[] Out_OKCCert;			/**< To be defined */
	    public byte[] Out_DHp;				/**< To be defined */
	    public byte[] Out_DHg;				/**< To be defined */
	    public byte[] Out_ErrorRespCode;
	    public byte[] Out_StatusCode;
	    public byte[] Out_VersionNumber;
		 
	    
	    public ST_GMPPairResp()
	    {
	    	Out_ProcOrderNum = new byte[6];
	    	Out_ProcDate     = new byte[6]; 
	    	Out_ProcTime     = new byte[6];
	    	Out_DeviceBrand  = new byte[16]; 
	    	Out_DeviceModel	 = new byte[16];
	    	Out_DeviceSerialNum	 = new byte[16];
	    	Out_OKCCert 		 = new byte[256];			/**< To be defined */
	    	Out_DHp 			 = new byte[256];			/**< To be defined */
	    	Out_DHg 			 = new byte[2];				/**< To be defined */
	    	Out_ErrorRespCode	 = new byte[4];
	    	Out_StatusCode		 = new byte[4];
	    	Out_VersionNumber	 = new byte[16]; 
	    }
	    
	    public void set(ST_GMPPairResp inStGMPPairResp)
	    {
	    	Out_ProcOrderNum 	= inStGMPPairResp.Out_ProcOrderNum 	   ;
	    	Out_ProcDate    	= inStGMPPairResp.Out_ProcDate    	   ;
	    	Out_ProcTime     	= inStGMPPairResp.Out_ProcTime     	   ;
	    	Out_DeviceBrand  	= inStGMPPairResp.Out_DeviceBrand  	   ;
	    	Out_DeviceModel		= inStGMPPairResp.Out_DeviceModel		;
	    	Out_DeviceSerialNum	= inStGMPPairResp.Out_DeviceSerialNum	;
	    	Out_OKCCert 		= inStGMPPairResp.Out_OKCCert 		   ;
	    	Out_DHp 			= inStGMPPairResp.Out_DHp 			   ;
	    	Out_DHg 			= inStGMPPairResp.Out_DHg 			   ;
	    	Out_ErrorRespCode	= inStGMPPairResp.Out_ErrorRespCode	   ;
	    	Out_StatusCode		= inStGMPPairResp.Out_StatusCode		;
	    	Out_VersionNumber	= inStGMPPairResp.Out_VersionNumber	   ;  
	    }
	}
	
	
	
	
 
    
  //ST_CARD_INFO
  	public static class ST_CARD_INFO
  	{ 
  		
  		public byte   inputType;
  		public String pan; 
  	    public String holderName;  
  	    public byte[] type;		// Local, international ..
  	    public String expireDate; 
  		 
  	    
  	    public ST_CARD_INFO()
  	    { 
  	    	inputType        = 0; 
  	    	pan			     = "";
  	    	holderName	     = ""; 
  	    	type             = new byte[3];
  	    	expireDate		 = ""; 
  	    } 
  	}
	
  	
	
	//ST_PAYMENT_REQUEST
	public static class ST_PAYMENT_REQUEST_ORGINAL_DATA
	{
		public int		TransactionAmount;				/**< tag 21 OrgTransAmount[6] bcd */
		public int		LoyaltyAmount;					/**< tag 25 OrgLoyaltyAmount[6] bcd */
		public short	NumberOfinstallments;			/**< tag 22 Number of installments, Zero if not used */
		public String 	AuthorizationCode;				/**< tag 45 ascii */
		public String 	rrn; 							/**< tag 46 ascii */
		public String 	TransactionDate;				/**< tag 47 OrgTransDate[5] bcd YY- YYMMDDHHMM */
		public String	MerchantId;						/**< tag 67 ascii */
		public String   TransactionType; 				/**< tag 70 byte */
		public String  	referenceCodeOfTransaction;		/**< tag 75 ascii */
		
		public ST_PAYMENT_REQUEST_ORGINAL_DATA() {
			TransactionAmount = 0;
			LoyaltyAmount = 0;
			NumberOfinstallments = 0;
			AuthorizationCode = "";
			rrn = "";
			TransactionDate = "";
			MerchantId = "";
			TransactionType = "";
			referenceCodeOfTransaction = "";
		}

		public void set(ST_PAYMENT_REQUEST_ORGINAL_DATA paymentRequestOrginalData) {
			TransactionAmount = paymentRequestOrginalData.TransactionAmount;
			LoyaltyAmount = paymentRequestOrginalData.LoyaltyAmount;
			NumberOfinstallments = paymentRequestOrginalData.NumberOfinstallments;
			AuthorizationCode = paymentRequestOrginalData.AuthorizationCode;
			rrn = paymentRequestOrginalData.rrn;
			TransactionDate = paymentRequestOrginalData.TransactionDate;
			MerchantId = paymentRequestOrginalData.MerchantId;
			TransactionType = paymentRequestOrginalData.TransactionType;
			referenceCodeOfTransaction = paymentRequestOrginalData.referenceCodeOfTransaction;
		}
    }

  	public static class ST_PAYMENT_REQUEST
  	{
  		public long		typeOfPayment;					/**< One of EPaymentTypes */
  		public int		subtypeOfPayment;				/**< One of EPaymentSubtypes */
  		public int		payAmount;						/**< Payment amount */
  		public int		payAmountBonus;					/**< Payment bonus amount */
  		public short	payAmountCurrencyCode;			/**< Payment amount currency Code */
  		public short	bankBkmId;						/**< BKM Id of the payment application, Zero if not used */
  		public short	numberOfinstallments;			/**< Number of installments, Zero if not used */

  		// Refund
  		public String	terminalId; 					/**< ascii for multimerchant */

		ST_PAYMENT_REQUEST_ORGINAL_DATA OrgTransData;

  		public int		batchNo;						/**< Batch number */
  		public int		stanNo;							/**< Stan number */
  		public short	rawDataLen;                     /**< raw data length for payment application */
  		public byte[]	rawData;                		/**< rawData exchange between two application */
  		public String	paymentName;					/**< Payment name written on the ticket */
  		public String 	paymentInfo;					/**< Payment sub message acording to the payment type */
  		public int		transactionFlag;				/**< External Device Transaction Flags - 1 */
  		public int		flags;							/**< Payment request process flags */
  		public String	LoyaltyCustomerId;				/**< Payment request process for Loyalty Customer ID*/
  		public String   PaymentProvisionId;  			/**< Payment Provision ID used by VAS application */
  		public short	LoyaltyServiceId;				/**< Payment request process for Service registered application as loyalty */
  		public String	BankPaymentUniqueId;			/**< Payment Unique ID for checking transaction. */
  		public byte		AllowedInput;
	    
	    public ST_PAYMENT_REQUEST()
	    {
	  		typeOfPayment = 0;
	  		subtypeOfPayment = 0;
	  		payAmount = 0;
	  		payAmountBonus = 0;
	  		payAmountCurrencyCode = 0;
	  		bankBkmId = 0;
	  		numberOfinstallments = 0;

	  		terminalId = "";

			OrgTransData = new ST_PAYMENT_REQUEST_ORGINAL_DATA();

	  		batchNo = 0;
	  		stanNo = 0;
	  		rawDataLen = 0;
	  		rawData = new byte[512];
	  		paymentName = "";
	  		paymentInfo = "";
	  		transactionFlag = 0;
	  		flags = 0;
	  		LoyaltyCustomerId = "";
	  		PaymentProvisionId = "";
	  		LoyaltyServiceId = 0;
	  		BankPaymentUniqueId = "";
	  		AllowedInput = 0;
	    } 
	    
	    public void set(ST_PAYMENT_REQUEST paymentRequest)
	    {
	  		typeOfPayment = paymentRequest.typeOfPayment;
	  		subtypeOfPayment = paymentRequest.subtypeOfPayment;
	  		payAmount = paymentRequest.payAmount;
	  		payAmountBonus = paymentRequest.payAmountBonus;
	  		payAmountCurrencyCode = paymentRequest.payAmountCurrencyCode;
	  		bankBkmId = paymentRequest.bankBkmId;
	  		numberOfinstallments = paymentRequest.numberOfinstallments;

	  		terminalId = paymentRequest.terminalId;

			OrgTransData.set(paymentRequest.OrgTransData);

	  		batchNo = paymentRequest.batchNo;
	  		stanNo = paymentRequest.stanNo;
	  		rawDataLen = paymentRequest.rawDataLen;
	  		rawData = paymentRequest.rawData;
	  		paymentName = paymentRequest.paymentName;
	  		paymentInfo = paymentRequest.paymentInfo;
	  		transactionFlag = paymentRequest.transactionFlag;
	  		flags = paymentRequest.flags;
	  		LoyaltyCustomerId = paymentRequest.LoyaltyCustomerId;
	  		PaymentProvisionId = paymentRequest.PaymentProvisionId;
	  		LoyaltyServiceId = paymentRequest.LoyaltyServiceId;
	  		BankPaymentUniqueId = paymentRequest.BankPaymentUniqueId;
	  		AllowedInput = paymentRequest.AllowedInput;
	    }
	}
	 
	
	//ST_PaymentErrMessage
	public static class ST_PaymentErrMessage 
	{ 
        public String ErrorCode; // bank error code 
        public String ErrorMsg; 
        public String AppErrorCode; // payment application specific error code 
        public String AppErrorMsg;
		 
	    
	    public ST_PaymentErrMessage()
	    {
	    	ErrorCode	     = "";
	    	ErrorMsg		 = "";
	    	AppErrorCode	 = "";
	    	AppErrorMsg		 = "";
	    	  
	    } 
	}

	
	
	//ST_BANK_PAYMENT_INFO
	public static class ST_BANK_PAYMENT_INFO
	{ 

        public long 	 batchNo; 
        public long	 stan; 
        public int bankBkmId;
        public byte  numberOfdiscount; 
        public byte  numberOfbonus; 
        public String authorizeCode; 
        public byte[] transFlag; 
        public String terminalId; 
        public String merchantId;
        public String bankName;
        public ST_CARD_INFO stCard;	
        public ST_PaymentErrMessage stPaymentErrMessage;
		 
	    
	    public ST_BANK_PAYMENT_INFO()
	    {
	    	batchNo	   = 0;
	    	stan       = 0; 
	    	bankBkmId  = 0;
	    	numberOfdiscount    = 0; 
	    	numberOfbonus       = 0;
	    	authorizeCode	    = "";
	    	transFlag		    = new byte[2];
	    	terminalId		    = "";
	    	merchantId		    = "";
	    	bankName		    = "";
	    	stCard	 			= new ST_CARD_INFO();
	    	stPaymentErrMessage = new ST_PaymentErrMessage();
	    }  
	}
		

	
	//ST_PAYMENT
	public static class ST_PAYMENT
	{  
		public byte flags;
		public long  dateOfPayment;
		public long  typeOfPayment; 			// EPaymentTypes
		public byte subtypeOfPayment;		// EPaymentSubtypes
		public long  orgAmount;				// Exp; Currency Amount
		public int orgAmountCurrencyCode;	// as defined in currecyTable from GIB 
		public long  payAmount;					// always TL with precision 2
		public int payAmountCurrencyCode;		// always TL
		public long   cashBackAmountInTL;		// Para ustu, her zaman TL with precision 2
		public long   cashBackAmountInDoviz;		// Para Ustu, doviz satis ise doviz karsiligi
        public ST_BANK_PAYMENT_INFO stBankPayment;	// Keeps all payment info related with bank
		
	    
	    public ST_PAYMENT()
	    {
	    	flags			 = 0;
	    	dateOfPayment	 = 0; 
	    	typeOfPayment    = 0;
	    	subtypeOfPayment = 0; 
	    	orgAmount        = 0;
	    	orgAmountCurrencyCode	 = 0; 
	    	payAmount        = 0;
	    	payAmountCurrencyCode = 0;
	    	cashBackAmountInTL= 0;
	    	cashBackAmountInDoviz=0;
	    	stBankPayment = new ST_BANK_PAYMENT_INFO();
	    }  
	}

	
	
	//ST_PAYMENT_REQUEST
	public static class SALEINFO
	{ 
		public byte   ItemType;
		public long   ItemPrice;
		public long   IncAmount;
		public long   DecAmount;
		public long 	  OrigialItemAmount; // Eger kisim bilgisi TL olarak tanimlanmamissa, kisim tutari buraya kaydedilir ve diger amout yeniden kur bilgisi ile hesaplanilarak ezilir
		public int  OriginalItemAmountCurrency; 
		public int  ItemVatRate;
		public int  ItemCurrencyType;
		public byte	  ItemVatIndex;
		public byte   ItemCountPrecision;
		public long 	  ItemCount;
		public byte  ItemUnitType;
		public byte  DeptIndex;
		public long 	  Flag;
		public String Name;
		public String Barcode;
		
	    
	    public SALEINFO()
	    {
	    	ItemType         = 0;
	    	ItemPrice		 = 0;
	    	IncAmount		 = 0;
	    	DecAmount		 = 0;
	    	OrigialItemAmount= 0; 
	    	OriginalItemAmountCurrency= 0;
	    	ItemVatRate	     = 0; 
	    	ItemCurrencyType = 0;
	    	ItemVatIndex	 = 0;
	    	ItemCountPrecision= 0;
	    	ItemCount		 = 0;
	    	ItemUnitType	 = 0;
	    	DeptIndex	 	 = 0;
	    	Flag		 	 = 0;
	    	Name			 = "";
	    	Barcode			 = "";
	    } 
		 
	}
	
	//ST_VATDetail
	public static class ST_VATDetail
	{ 
		public long u32VAT;				/**< Total Tax in TL with precition 2 */
		public long u32Amount; 			/**< Total Amount in TL with precition 2 */
		public int u16VATPercentage;	/**< Tax rate, it is 1800 for %18 */
		  
	    public ST_VATDetail()
	    {
	    	u32VAT	     			 = 0;
	    	u32Amount		 		 = 0;
	    	u16VATPercentage		 = 0;  
	    }  
	}
	

	//ST_printerDataForOneLine
	public static class ST_printerDataForOneLine
	{ 
		public long    Flag; 
		public byte   lineLen; 
		public String line; 
		 
	    
	    public ST_printerDataForOneLine()
	    {
	    	Flag	     = 0;
	    	lineLen		 = 0;
	    	line		 = "";  
	    } 
		 
	}
  	
	
	//ST_printerDataForOneLine
	public static class promotion 
	{
		
			public byte   type; 
			public long    amount; 
			public String ticketMsg; 
		 
	    
	    public promotion()
	    {
	    	type	     = 0;
	    	amount		 = 0;
	    	ticketMsg	 = "";
	    }   
	    
	}
	
	//ST_printerDataForOneLine
	public static class ST_ITEM
	{ 
        public byte type;
        public byte subType;
        public byte deptIndex;
        public byte unitType; 
        public long amount; 
        public int currency; 
        public long count; 
        public long flag;
        public byte countPrecition; 
        public byte pluPriceIndex;		// PLU may have multiple prices in Database. This is the index of price to be used 
        public String name; 
        public String barcode;
        public String firm;					
        public String invoiceNo;		
        public String subscriberId;		
        public String tckno;			
    	public long  date;							 
    	public promotion promotion;
		 
	    
	    public ST_ITEM()
	    {
	    	type	     = 0;
	    	subType		 = 0;
	    	deptIndex	 = 0;
	    	unitType	 = 0;
	    	amount		 = 0;
	    	currency	 = 0;
	    	count		 = 0;
	    	flag 		 =0;
	    	countPrecition= 0;
	    	pluPriceIndex = 0;
	    	name		 = "";
	    	barcode		 = "";
	    	firm		 = "";
	    	invoiceNo	 = "";
	    	subscriberId = "";
	    	tckno		 = "";
	    	promotion 	 = new promotion();
	    }
	    
	    public void set(ST_ITEM inStItem)
	    {
	    	type	     	= inStItem.type	     	    ;
	    	subType		 	= inStItem.subType		    ;
	    	deptIndex	 	= inStItem.deptIndex	    ;
	    	unitType	 	= inStItem.unitType	 	    ;
	    	amount		 	= inStItem.amount		    ;
	    	currency	 	= inStItem.currency	 	    ;
	    	count		 	= inStItem.count		    ;
	    	flag 			= inStItem.flag			    ;
	    	countPrecition	= inStItem.countPrecition 	; 	
	    	pluPriceIndex 	= inStItem.pluPriceIndex  	; 	
	    	name		 	= inStItem.name		 		;  
	    	barcode		 	= inStItem.barcode		  	; 
	    	firm		 	= inStItem.firm		 		;  
	    	invoiceNo	 	= inStItem.invoiceNo	  	; 
	    	subscriberId 	= inStItem.subscriberId 	;  	
	    	tckno		 	= inStItem.tckno		  	; 
	    	promotion 	 	= inStItem.promotion 	  	; 	    	
	    }
	}
  	 
	
	//ST_TICKET
	public static class ST_TICKET
	{ 
		public long   TransactionFlags;
		public long   OptionFlags;
		public int ZNo;
		public int FNo; 
		public int EJNo;
		public long   TotalReceiptAmount;
		public long   TotalReceiptTax;
		public long   TotalReceiptDiscount;
		public long   TotalReceiptIncrement;
		public long   CashBackAmount;
		public long   TotalReceiptItemCancel;
		public long   TotalReceiptPayment; 
        public long 	 TotalReceiptReversedPayment; 
        public long 	 KasaAvansAmount; 
        public long 	 KasaPaymentAmount;
		public long   invoiceAmount;
		public long   invoiceAmountCurrency;
		public long   KatkiPayiAmount;
		public long   TaxFreeRefund;
		public long   TaxFreeCalculated;
		public byte[]bcdTicketDate;
		public byte[]bcdTicketTime;
		public byte  ticketType;	
		public int totalNumberOfItems;		// butun itemlarin toplam sayisi (henuz buradaki buffer'a kopyalanmamislar dahil)
		public int numberOfItemsInThis;		// itemlarin toplam sayisi (sadece buradaki buffera kopyalananlar)
		public int totalNumberOfPayments;
		public int numberOfPaymentsInThis;		// odemelerin toplam sayisi (sadece buradaki buffera kopyalananlar)
		public String TckNo;
		public String invoiceNo;
		public long   invoiceDate;
		public byte invoiceType;
		public long   totalNumberOfPrinterLines;  // butun printer satirlarinin toplam sayisi (henuz buradaki buffer'a kopyalanmamislar dahil)
		public long   numberOfPrinterLinesInThis; // printer satirlarinin toplam sayisi (sadece buradaki buffera kopyalananlar)
		public byte[]   uniqueId;
		public SALEINFO[] SaleInfo;
		public ST_PAYMENT[] stPayment;
        public ST_VATDetail[]    stTaxDetails;
		public ST_printerDataForOneLine[] stPrinterCopy; 
		
	    public ST_TICKET()
	    {
	    	TransactionFlags	 = 0;
	    	OptionFlags =0;
	    	ZNo 	 = 0; 
	    	FNo	     = 0;
	    	EJNo     = 0; 
	    	TotalReceiptAmount  	= 0;
	    	TotalReceiptTax	 		= 0;
	    	TotalReceiptDiscount	= 0;
	    	TotalReceiptIncrement	= 0;
	    	CashBackAmount	 		= 0;
	    	TotalReceiptItemCancel	= 0;
	    	TotalReceiptPayment 	= 0;
	    	TotalReceiptReversedPayment = 0;
	    	KasaAvansAmount 			= 0;
	    	KasaPaymentAmount			= 0;
	    	invoiceAmount	 		= 0;
	    	KatkiPayiAmount	 		= 0;
	    	invoiceAmountCurrency   = 0;
	    	TaxFreeRefund	 		= 0;
	    	TaxFreeCalculated		= 0;
	    	bcdTicketDate	 		= new byte[3];
	    	bcdTicketTime	 		= new byte[3];
	    	ticketType				= 0;	
	    	totalNumberOfItems	 	= 0;
	    	numberOfItemsInThis     = 0;
	    	totalNumberOfPayments	= 0;
	    	numberOfPaymentsInThis	= 0;
	    	TckNo 					= "";
	    	invoiceNo 				= "";
	    	invoiceDate				= 0;
	    	invoiceType				= 0;
	    	totalNumberOfPrinterLines = 0;
	    	numberOfPrinterLinesInThis= 0;
	    	uniqueId				  = new byte[24];
	    	SaleInfo  = new SALEINFO [MAX_SALE_INFO]; 
	    	stPayment = new ST_PAYMENT [MAX_PAYMENT];  
	    	stTaxDetails = new  ST_VATDetail[MAX_TAX_DETAIL];
	    	stPrinterCopy = new ST_printerDataForOneLine[MAX_PRINTER_COPY];
	    	
	    }
	    
	    public void set(ST_TICKET inStTicket)
	    {
	    	TransactionFlags			  =  inStTicket.TransactionFlags	 		;
	    	OptionFlags 				  =  inStTicket.OptionFlags 				;
	    	ZNo 	 					  =  inStTicket.ZNo 	 					;
	    	FNo	     					  =  inStTicket.FNo	     					;
	    	EJNo     					  =  inStTicket.EJNo     					;
	    	TotalReceiptAmount  		  =  inStTicket.TotalReceiptAmount  		;
	    	TotalReceiptTax	 			  =  inStTicket.TotalReceiptTax	 			;
	    	TotalReceiptDiscount		  =  inStTicket.TotalReceiptDiscount		;
	    	TotalReceiptIncrement		  =  inStTicket.TotalReceiptIncrement		;
	    	CashBackAmount	 			  =  inStTicket.CashBackAmount	 			;
	    	TotalReceiptItemCancel		  =  inStTicket.TotalReceiptItemCancel		;
	    	TotalReceiptPayment 		  =  inStTicket.TotalReceiptPayment 		;
	    	TotalReceiptReversedPayment   =  inStTicket.TotalReceiptReversedPayment ;
	    	KasaAvansAmount 			  =  inStTicket.KasaAvansAmount 			;
	    	KasaPaymentAmount			  =  inStTicket.KasaPaymentAmount			;
	    	invoiceAmount	 			  =  inStTicket.invoiceAmount	 			;
	    	invoiceAmountCurrency		  =  inStTicket.invoiceAmountCurrency	    ;
	    	KatkiPayiAmount	 			  =  inStTicket.KatkiPayiAmount	 			;
	    	TaxFreeRefund	 			  =  inStTicket.TaxFreeRefund	 			;
	    	TaxFreeCalculated			  =  inStTicket.TaxFreeCalculated	 		;
	    	bcdTicketDate	 			  =  inStTicket.bcdTicketDate	 			;
	    	bcdTicketTime	 			  =  inStTicket.bcdTicketTime	 			;
	    	ticketType					  =  inStTicket.ticketType					;
	    	totalNumberOfItems	 		  =  inStTicket.totalNumberOfItems	 		;
	    	numberOfItemsInThis     	  =  inStTicket.numberOfItemsInThis     	;
	    	totalNumberOfPayments		  =  inStTicket.totalNumberOfPayments		;
	    	numberOfPaymentsInThis		  =  inStTicket.numberOfPaymentsInThis		;
	    	TckNo 						  =  inStTicket.TckNo 						;
	    	invoiceNo 					  =  inStTicket.invoiceNo 					;
	    	invoiceDate					  =  inStTicket.invoiceDate					;
	    	invoiceType					  =  inStTicket.invoiceType					;
	    	totalNumberOfPrinterLines     =  inStTicket.totalNumberOfPrinterLines   ;
	    	numberOfPrinterLinesInThis    =  inStTicket.numberOfPrinterLinesInThis  ;
	    	uniqueId				      =  inStTicket.uniqueId				    ;
	    	SaleInfo  					  =  inStTicket.SaleInfo  					;
	    	stPayment 					  =  inStTicket.stPayment 					;
	    	stTaxDetails 				  =  inStTicket.stTaxDetails 				;
	    	stPrinterCopy 				  =  inStTicket.stPrinterCopy 				;	    	
	    }
	    
	}

	// ST_INTERFACE_XML_DATA
	public static class ST_INTERFACE_XML_DATA
	{
		public byte			RetryCounter;
		public byte			IpRetryCount;
		public int			AckTimeOut;
		public int			CommTimeOut;
		public int			InterCharacterTimeOut;

		public String		PortName;
		public int			BaudRate;
		public int			ByteSize;
		public int			fParity;
		public int			Parity;
		public int			StopBit;
		public byte			IsTcpConnection;
		public String		IP;
		public int			Port;
		
		public ST_INTERFACE_XML_DATA() {
			PortName = "";
			IP = "";
		}

		public void set(ST_INTERFACE_XML_DATA fromJson) {
			RetryCounter = fromJson.RetryCounter;
			IpRetryCount = fromJson.IpRetryCount;
			AckTimeOut = fromJson.AckTimeOut;
			CommTimeOut = fromJson.CommTimeOut;
			InterCharacterTimeOut = fromJson.InterCharacterTimeOut;
			PortName = fromJson.PortName;
			BaudRate = fromJson.BaudRate;
			ByteSize = fromJson.ByteSize;
			fParity = fromJson.fParity;
			Parity = fromJson.Parity;
			StopBit = fromJson.StopBit;
			IsTcpConnection = fromJson.IsTcpConnection;
			IP = fromJson.IP;
			Port = fromJson.Port;
		}
	};

	
	//ST_date
	public static class ST_date extends Structure 
	{
		public static class ByReference extends ST_date implements Structure.ByReference {}
	 
		public byte day;			// 1-31
		public byte month;		// 1-12
		public int year;		// 0-99
		 
	    
	    public ST_date()
	    { 
	    	day	 = 0x00;
	    	month= 0x00;
	    	year = 0;
	    }
		protected List<String> getFieldOrder() {
			
			return Arrays.asList(new String[] {"day","month","year"}); 
			
		}
		 
	}
	
	//ST_time
	public static class ST_time extends Structure 
	{
		public static class ByReference extends ST_time implements Structure.ByReference {}
	 
		public byte hour;			// 1-31
		public byte minute;		// 1-12
		public byte second;		// 0-99
		 
	    
	    public ST_time()
	    { 
	    	hour	= 0x00;
	    	minute	= 0x00;
	    	second  = 0;
	    }
		protected List<String> getFieldOrder() {
			
			return Arrays.asList(new String[] {"hour","minute","second"}); 
			
		}
		 
	}
	
    //ST_password
	public static class ST_password extends Structure 
	{
		public static class ByReference extends ST_password implements Structure.ByReference {}
	 
			public byte[] supervisor; 
			public byte[] cashier; 
		 
	    
	    public ST_password()
	    { 
	    	supervisor	 = new byte[12+1];
	    	cashier		 = new byte[12+1];  
	    }
		protected List<String> getFieldOrder() {
			
			return Arrays.asList(new String[] {"supervisor","cashier"}); 
			
		}
		 
	}
	
	//ST_funcLimits
	public static class ST_funcLimits extends Structure 
	{
		public static class ByReference extends ST_funcLimits implements Structure.ByReference {}
	 
			public long ZNo;
			public long FNo;
			public ST_date date;
			public ST_time time; 
		 
	    
	    public ST_funcLimits()
	    { 
	    	ZNo	 = 0;
	    	FNo	 = 0;
	    	date = new ST_date.ByReference();
	    	time = new ST_time.ByReference();
	    	
	    }
		protected List<String> getFieldOrder() {
			
			return Arrays.asList(new String[] {"ZNo","FNo","date","time"}); 
			
		}
	}
	
	public static class ST_FunctionParameters
	{
		public long EKUNo;
		public ST_password password;
		public ST_funcLimits start; 
		public ST_funcLimits finish;  
	    
	    public ST_FunctionParameters()
	    {
	    	EKUNo        = 0;
	    	password     = new ST_password();
	    	start		 = new ST_funcLimits();
	    	finish		 = new ST_funcLimits();   
	    }

	    public void set(ST_FunctionParameters fromJson) {
			EKUNo = fromJson.EKUNo;
			password = fromJson.password;
			start = fromJson.start; 
			finish = fromJson.finish;  
		}
	}
	
	public int Json_FP3_CreateInterface(IntByReference phInt, byte[] szID, byte IsDefault, byte[] szJsonXmlData);
	public int Json_FP3_GetInterfaceXmlDataByID(byte[] szID, byte[] pstInterfaceXmlData, int JsonMaxLen);
	public int Json_FP3_GetInterfaceXmlDataByHandle(int hInt, byte[] pstInterfaceXmlData, int JsonMaxLen);
	public int Json_FP3_UpdateInterfaceXmlDataByID(byte[] szID, byte[] pstInterfaceXmlData);
	public int Json_FP3_UpdateInterfaceXmlDataByHandle(int hInt, byte[] pstInterfaceXmlData);
	public int Json_FP3_GetGlobalXmlData(byte[] pstGlobalXmlData, int JsonMaxLen);
	public int Json_FP3_UpdateGlobalXmlData(byte[] pstGlobalXmlData);
	
	public int Json_FP3_Echo(int hInt, byte[] szJsonEcho_Out, int szJsonEchoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_GetPLU(int hInt, byte[] szBarcode, byte[] szJsonPluRecord, byte[] szJsonPluRecord_Out, int JsonPluRecordLen_Out,  byte[] szPluGroupRecord, byte[] szPluGroupRecord_Out, int PluGroupRecordLen_Out, int MaxNumberOfGroupRecords, int TimeoutInMiliseconds);
	public int Json_FP3_GetTaxRates(int hInt, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonTaxRates, byte[] szJsonTaxRate_Out, int JsonTaxRateLen_Out, byte NumberOfRecordsRequested);
	public int Json_FP3_GetTaxRates_Ex(int hInt, byte indexOfTaxRates, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonTaxRates, byte[] szJsonTaxRate_Out, int JsonTaxRateLen_Out, byte NumberOfRecordsRequested);
	public int Json_FP3_SetDepartments(int hInt, byte[] szJsonDepartments, byte[] szJsonDepartments_Out, int JsonDepartmentsLen_Out, byte NumberOfDepartmentRequested, byte[] szPassword);
	public int Json_FP3_GetDepartments(int hInt, ByteByReference pNumberOfTotalDepartments, ByteByReference pNumberOfTotalDepartmentsReceived, byte[] szJsonDepartments, byte[] szJsonDepartments_Out, int JsonDepartmentsLen_Out, byte NumberOfDepartmentRequested);
	public int Json_FP3_GetDepartments_Ex(int hInt, byte indexOfDepartments, ByteByReference pNumberOfTotalDepartments, ByteByReference pNumberOfTotalDepartmentsReceived, byte[] szJsonDepartments, byte[] szJsonDepartments_Out, int JsonDepartmentsLen_Out, byte NumberOfDepartmentRequested);
	public int Json_FP3_FunctionEkuSeek(int hInt, byte[] szJsonEKUAppInfo, byte[] szJsonEKUAppInfo_Out, int JsonEKUAppInfoLen_Out,  int TimeoutInMiliseconds);
	public int Json_FP3_GetCashierTable(int hInt, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonCashier, byte[]  szJsonCashier_Out, int JsonCashierLen_Out, byte NumberOfRecordsRequested, ShortByReference pActiveCashier);
	public int Json_FP3_GetTicketHeader(int hInt, short IndexOfHeader, byte[] szJsonTicketHeader,  byte[]  szJsonTicketHeader_Out, int JsonTicketHeaderLen_Out, ShortByReference pNumberOfSpaceTotal, int TimeoutInMiliseconds);
	public int Json_FP3_GetOnlineInvoiceInfo(int hInt, byte[] szInvoiceId, short InvoiceIdLen, byte[]  szJsonOnlineInvoiceInfo_Out, int JsonOnlineInvoiceInfoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionReports(int hInt, int FunctionFlags, byte[] szJsonFunctionParameters, byte[]  szJsonFunctionParameters_Out, int JsonFunctionParametersLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionReadCard(int hInt, int CardReaderTypes, byte[] szJsonCardInfo, byte[] szJsonCardInfo_Out, int JsonCardInfoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_GetCurrencyProfile(int hInt, byte[] szJsonExchangeProfileTable_In, byte[]  szJsonExchangeProfileTable_Out, int JsonExchangeProfileLen_Out);
	public int Json_FP3_SetCurrencyProfile(int hInt, byte[] supervisorPassword, byte profileIndex, byte ProfileProcessType, byte[] szJsonExchangeProfileTable_In);
	public int Json_FP3_SetCurrencyProfileIndex(int hInt, long hTrx, byte profileIndex, byte[]  pstTicket, int timeoutInMiliseconds);
	public int Json_FP3_StartPairingInit(int hInt, byte[] szJsonPair, byte[]  szJsonPairResp_Out, int JsonPairRespLen_Out);
	public int Json_FP3_Database_Execute(int hInt, byte[] sqlWord, byte[] szJsonDatabaseResult_Out, int JsonDatabaseResult_Out);
	public int Json_FP3_FunctionReadZReport(int hInt, byte[] szJsonFunctionParameters, byte[] szJsonZReport_Out, int JsonZReportLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionReadDM_Report(int hInt, byte[] szJsonFunctionParameters, byte[] szJsonDM_Report_Out, int JsonDM_ReportLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionPaymentCheck(int hInt, byte[]  uniqueId, byte[]  szJsonCheckResponse_Out, int szJsonCheckResponseLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionEkuReadInfo(int hInt, short ekuAccessFunction, byte[] szJsonEkuModuleInfo, byte[] szJsonEkuModuleInfo_Out, int JsonEkuModuleInfoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionEkuReadData(int hInt, ShortByReference pEkuDataBufferReceivedLen, byte[] szJsonEKUAppInfo, byte[] szJsonEKUAppInfo_Out, int JsonEKUAppInfoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionModuleReadInfo(int hInt, int AccessFunction, byte[] szJsonModuleInfo, byte[] szJsonModuleInfo_Out, int JsonModuleInfoLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionBankingBatch(int hInt, short bkmId, ShortByReference pnumberOfBankResponse, byte[] JsonMultipleBankResponse_Out, int JsonMultipleBankResponseLen_Out, int timeoutInMiliseconds);
	public int Json_FP3_FunctionBankingRefund(int hInt, byte[] szJsonPaymentRequest, byte[] JsonPaymentRequest_Out, int JsonPaymentRequestLen_Out, int timeoutInMiliseconds);
	public int Json_FP3_FunctionBankingRefundExt(int hInt, byte[] szJsonPaymentRequest, byte[] JsonPaymentRequest_Out, int JsonPaymentRequestLen_Out, byte[] JsonRefundResponse, int timeoutInMiliseconds);
	public int Json_FP3_GetVasApplicationInfo(int hInt, ByteByReference pnumberOfTotalRecords, ByteByReference pnumberOfTotalRecordsReceived, byte[] szJsonPaymentApplicationInfo_Out, int JsonPaymentApplicationInfoLen_Out, short vasType);
	public int Json_FP3_GetVasPaymentServiceInfo(int hInt, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonVASPaymentServiceInfo_Out, int JsonVASPaymentServiceInfoLen_Out, short vasAppID);
	public int Json_FP3_GetVasLoyaltyServiceInfo(int hInt, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonPaymentApplicationInfo_Out, int JsonPaymentApplicationInfoLen_Out, short vasType);
	public int Json_FP3_FunctionEkuReadHeader(int hInt, short index, byte[] szJsonEkuHeader, byte[] szJsonEkuHeader_Out, int JsonEkuHeaderLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Database_FreeStructure(int hInt, byte[] szJsonDatabaseResult, byte[] szJsonDatabaseResult_Out, int JsonDatabaseResult_Out);
	public int Json_FP3_Database_QueryReadLine(int hInt, short NumberOfLinesRequested, short NumberOfColomnsRequested, byte[] szJsonDatabaseResult_Out, int JsonDatabaseResult_Out);
	public int Json_FP3_FunctionGetUniqueIdList(int hInt, byte[] szJsonUniqueIdList, byte[] szJsonUniqueIdList_Out, int JsonUniqueIdListLen_Out, short MaxNumberOfitems, short IndexOfitemsToStart, ShortByReference pTotalNumberOfItems, ShortByReference pNumberOfItemsInThis,  int TimeoutInMiliseconds);
	public int Json_FP3_FileSystem_DirListFiles(int hInt, byte[] szDirName, byte[] szJsonStFile, byte[] szJsonStFile_Out, int JsonStFileLen_Out, short MaxNumberOfFiles, ShortByReference pNumberOfFiles);
	public int Json_FP3_GetPaymentApplicationInfo(int hInt, ByteByReference pNumberOfTotalRecords, ByteByReference pNumberOfTotalRecordsReceived, byte[] szJsonPaymentApplicationInfo, byte[] szJsonPaymentApplicationInfo_Out, int JsonPaymentApplicationInfoLen_Out, byte NumberOfRecordsRequested);
	public int Json_FP3_FunctionChangeTicketHeader(int hInt, byte[] szSupervisorPassword, ShortByReference pNumberOfSpaceTotal, ShortByReference pNumberOfSpaceUsed, byte[] szJsonTicketHeader,  byte[] szJsonTicketHeader_Out, int szJsonTicketHeaderLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Database_QueryColomnCaptions(int hInt, byte[] szJsonDatabaseResult_Out, int JsonDatabaseResult_Out);
	public int Json_FP3_LoyaltyCustomerQuery(int hInt, long hTrx, byte[] szJsonLoyaltyServiceReq, byte[] szJsonLoyaltyServiceReq_Out, int JsonLoyaltyServiceReqLen_Out, byte[]  szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_LoyaltyDiscount(int hInt, long hTrx, byte isRate, int Amount, byte Rate, byte[] szLoyaltyCustomerId, byte[] szText, short indexOfItem, IntByReference pchangedAmount, byte[]  szJsonTicket_Out, int JsonTicketLen_Out, int timeoutInMiliseconds);
	public int Json_FP3_FunctionVasPaymentRefund(int hInt, byte[] szJsonPaymentRequest, byte[] szJsonPaymentRequest_Out, int JsonPaymentRequestLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_FunctionTransactionInquiry(int hInt, byte[] szJsonTransInquiry, byte[] szJsonTransInquiry_Out, int JsonTransInquiryLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Get24HResetTime(int hInt, byte[] szJsonPCI24HResetInfo, byte[] szJsonPCI24HResetInfo_Out, int JsonPCI24HResetInfoLen_Out, int timeoutInMiliseconds);
	public int Json_FP3_Set24HResetTime(int hInt, byte[] szJsonPCI24HResetInfo, byte[] szJsonPCI24HResetInfo_Out, int JsonPCI24HResetInfoLen_Out, int timeoutInMiliseconds);
    
	public int Json_FP3_Plus(int hInt, long hTrx, int Amount, byte[] szText, byte[] szJsonTicket_Out, int JsonTicketLen_Out, short IndexOfItem , int TimeoutInMiliseconds);
	public int Json_FP3_Minus(int hInt, long hTrx, int Amount, byte[] szText, byte[] szJsonTicket_Out, int JsonTicketLen_Out, short IndexOfItem, int TimeoutInMiliseconds);
	public int Json_FP3_Dec(int hInt, long hTrx, byte Rate, byte[] szText, byte[] szJsonTicket_Out, int JsonTicketLen_Out, short IndexOfItem, IntByReference pChangedAmount, int TimeoutInMiliseconds);
	public int Json_FP3_Inc(int hInt, long hTrx, byte Rate, byte[] szText, byte[] szJsonTicket_Out, int JsonTicketLen_Out, short IndexOfItem, IntByReference pChangedAmount, int TimeoutInMiliseconds);
	public int Json_FP3_VoidAll(int hInt, long hTrx, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Payment(int hInt, long hTrx, byte[] szJsonPaymentRequest, byte[] JsonPaymentRequest_Out, int JsonPaymentRequestLen_Out, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_VoidItem(int hInt, long hTrx, short Index, long ItemCount, byte ItemCountPrecision, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_ItemSale(int hInt, long hTrx, byte[] szJsonItem, byte[] szJsonItem_Out, int szJsonItemLen_Out, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Pretotal(int hInt, long hTrx, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_JumpToECR(int hInt, long hTrx, long JumpFlags, byte[] szJsonTicket_Out, int szJsonTicketLen_Out,  int TimeoutInMiliseconds);
	public int Json_FP3_KasaAvans(int hInt, long hTrx, int Amount, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_GetTicket(int hInt, long hTrx, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_Matrahsiz(int hInt, long hTrx, byte[] szTck, short SubtypeOfTaxException, int MatrahsizAmount, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetTaxFree(int hInt, long hTrx, int Flag, byte[] szName, byte[] szSurname, byte[] szIdentificationNo, byte[] szCity, byte[] szCountry, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetInvoice(int hInt, long hTrx, byte[] szJsonInvoiceInfo, byte[] szJsonInvoiceInfo_Out, int szJsonInvoiceInfoLen_Out, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SendSMMData(int hInt, long hTrx, byte[] szJsonSMMData, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SendGiderPusulasi(int hInt, long hTrx, byte[] szJsonGiderPusulasi, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetOnlineInvoice(int hInt, long hTrx, byte[]  szJsonOnlineInvoiceInfo, byte[]  szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_KasaPayment(int hInt, long hTrx, int Amount, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_VoidPayment(int hInt, long hTrx, short Index, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_CustomerAvans(int hInt, long hTrx, int Amount, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, byte[] szCustomerName, byte[] szTckn, byte[] szVkn, int TimeoutInMiliseconds);
	public int Json_FP3_CariHesap(int hInt, long hTrx, int Amount, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, byte[] szCustomerName, byte[] szTckn, byte[] szVkn, byte[] szBelgeNo, byte[] szBelgeDate, int TimeoutInMiliseconds);
	public int Json_FP3_ReversePayment(int hInt, long hTrx, byte[] szJsonPaymentRequest, byte[]  szJsonPaymentRequest_Out, int JsonPaymentRequestLen_Out, short NumberOfPaymentRequests, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_MultipleCommand(int hInt, LongByReference phTrx, byte[] szJsonReturnCodes_Out, int JsonReturnCodesLen_Out, ShortByReference pNumberOfreturnCodes, byte[] pSendBuffer, short SendBufferLen,  byte[]  szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetParkingTicket(int hInt, long hTrx, byte[] szCarIdentification, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_PrintPaymentTicket(int hInt, long hTrx, byte[] szJsonPaymentPrint, int timeoutInMiliseconds);
	public int Json_FP3_PrintUserMessage(int hInt, long hTrx, byte[] szJsonUserMessage, byte[] szJsonUserMessage_Out, int JsonUserMessageLen_Out, short NumberOfMessage, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_PrintUserMessage_Ex(int hInt, long hTrx, byte[] szJsonUserMessage, byte[] szJsonUserMessage_Out, int JsonUserMessageLen_Out, short NumberOfMessage, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetTaxFreeRefundAmount(int hInt, long hTrx, int RefundAmount, short RefundAmountCurrency, byte[] szJsonTicket_Out, int szJsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_FP3_SetTaxFreeInfo(int hInt, long hTrx, byte[] szJsonTaxFreeInfo, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int TimeoutInMiliseconds);
	public int Json_parse_FP3(long hTrx, byte[] szJsonReturnCodes_Out, int JsonReturnCodesLen_Out, ShortByReference pNumberOfreturnCodes, int RecvMsgId, byte[] RecvFullBuffer, short RecvFullLen, byte[] szJsonTicket_Out, int JsonTicketLen_Out, int MaxNumberOfReturnCode, int MaxReturnCodeDataLen);
            
	public int Json_FP3_FunctionGetHandleList(int hInt, byte[] szJsonHandleList_Out, int JsonHandleListLen_Out, byte StatusFilter, short StartIndexOfHandle, short HandleListSize, ShortByReference pTotalNumberOfHandlesInEcr, ShortByReference pReceivedNumberOfHandleInList, int TimeoutInMiliseconds);

	public int FP3_Start(int hInt, LongByReference phTrx, byte IsBackground, byte[] uniqueId, int lengthOfUniqueId, byte[] uniqueIdSign, int lengthOfUniqueIdSign, byte[] userData, int lengthOfUserData, int timeoutInMiliseconds);
	public int FP3_TicketHeader(int hInt, long hTrx, int ticketType, int timeoutInMiliseconds);
	public int FP3_Close(int hInt, long hTrx, int timeoutInMiliseconds);
	public int FP3_PrintTotalsAndPayments(int hInt, long hTrx, int timeoutInMiliseconds);
	public int FP3_PrintBeforeMF(int hInt, long hTrx, int timeoutInMiliseconds);
	public int FP3_PrintMF(int hInt, long hTrx, int timeoutInMiliseconds);
    
	public int FP3_FunctionOpenDrawer(int hInt);
	public int FP3_FunctionBankingParameter(int hInt, int timeoutInMiliseconds);
	public int FP3_FunctionEcrParameter(int hInt, int timeoutInMiliseconds);
	public int FP3_OptionFlags(int hInt, long hTrx, LongByReference pflagsActive, long flagsToBeSet, long flagsToBeClear, int timeoutInMiliseconds);
    
	public int prepare_Start(byte[] Buffer, int MaxSize, byte[] uniqueId, int lengthOfUniqueId, byte[] uniqueIdSign, int lengthOfUniqueIdSign, byte[] userData, int lengthOfUserData);
    
	public void GetErrorMessage(int ErrorCode, byte[] Buffer);
	public void SetJavaClassPath(byte[] Path);

	public int FP3_GetInterfaceHandleList(int[] phInt, int Max);
	public int FP3_GetInterfaceID(int hInt, byte[] szID, int Max);
}


/* testDll icin
public interface GmpDll extends Library 
{	
	public static class multStruct extends Structure 
	{
		public static class ByReference extends multStruct implements Structure.ByReference {}
	
		public int a;
		public int b;
		public int res;
		
		
		protected List getFieldOrder() {
			
			return Arrays.asList(new String[] {"a","b","res"}); 
			
		}
		 
	} 
    
    void multTest(multStruct.ByReference mult); 
}
*/