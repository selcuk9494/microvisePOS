package com.worldline.gmp;

public class Defines 
{
	public static final int GMP3_OPTION_ECHO_PRINTER = (1 << 0);
    public static final int GMP3_OPTION_ECHO_PAYMENT_DETAILS = (1 << 1);
    public static final int GMP3_OPTION_ECHO_ITEM_DETAILS = (1 << 2);

	public static final int PS_24 = 0x00000000;
	public static final int PS_12 = 0x00000001;
	public static final int PS_32 = 0x00000002;
	public static final int PS_48 = 0x00000004;
	public static final int PS_BOLD = 0x00000008;
	public static final int PS_CENTER = 0x00000010;
	public static final int PS_RIGHT = 0x00000020;
	public static final int PS_INVERTED = 0x00000040;
	public static final int PS_NO_FISCAL = 0x00000080;
	public static final int PS_BARCODE = 0x00000100;
	public static final int PS_ECR_TICKET_HEADER = 0x00000200;
	public static final int PS_GRAPHIC = 0x00000400;
	public static final int PS_QRCODE = 0x00000800;
	public static final int PS_FEED_LINE = 0x00001000;
	public static final int PS_NO_PAPER_CHECK = 0x00002000;
	public static final int PS_ECR_TICKET_ITEM = 0x00004000;
	public static final int PS_ECR_TICKET_COPY = 0x00008000;
	public static final int PS_ECR_USER_MSG_BEFORE_HEADER = 0x00010000;
	public static final int PS_ECR_USER_MSG_AFTER_TOTALS = 0x00020000;
	public static final int PS_ECR_USER_MSG_BEFORE_MF = 0x00040000;
	public static final int PS_ECR_USER_MSG_AFTER_MF = 0x00080000;

	public static final int SQLITE_OK = 0;		//!< Successful result
	public static final int SQLITE_ERR_INTERNAL = 2; // Internal logic error
	public static final int SQLITE_ERR_PERM = 3; // Access permission denied
	public static final int SQLITE_ERR_ABORT = 4; // Callback routine requested an abort
	public static final int SQLITE_ERR_BUSY = 5; // The database file is locked
	public static final int SQLITE_ERR_LOCKED = 6; // A table in the database is locked
	public static final int SQLITE_ERR_NOMEM = 7; // A malloc() failed
	public static final int SQLITE_ERR_READONLY = 8; // Attempt to write a readonly database
	public static final int SQLITE_ERR_INTERRUPT = 9; // Operation terminated by sqlite3_interrupt()
	public static final int SQLITE_ERR_IOERR = 10; // Some kind of disk I/O error occurred
	public static final int SQLITE_ERR_CORRUPT = 11; // The database disk image is malformed
	public static final int SQLITE_ERR_NOTFOUND = 12; // Unknown opcode in SQLITE_file_control()
	public static final int SQLITE_ERR_FULL = 13; // Insertion failed because database is full
	public static final int SQLITE_ERR_CANTOPEN = 14; // Unable to open the database file
	public static final int SQLITE_ERR_PROTOCOL = 15; // Database lock protocol error
	public static final int SQLITE_ERR_EMPTY = 16; // Database is empty
	public static final int SQLITE_ERR_SCHEMA = 17; // The database schema changed
	public static final int SQLITE_ERR_TOOBIG = 18; // String or BLOB exceeds size limit
	public static final int SQLITE_ERR_CONSTRAINT = 19; // Abort due to finalraint violation
	public static final int SQLITE_ERR_MISMATCH = 20; // Data type mismatch
	public static final int SQLITE_ERR_MISUSE = 21; // Library used incorrectly
	public static final int SQLITE_ERR_NOLFS = 22; // Uses OS features not supported on host
	public static final int SQLITE_ERR_AUTH = 23; // Authorization denied
	public static final int SQLITE_ERR_FORMAT = 24; // Auxiliary database format error
	public static final int SQLITE_ERR_RANGE = 25; // 2nd parameter to SQLITE_bind out of range/
	public static final int SQLITE_ERR_NOTADB = 26; // File opened that is not a database file
	public static final int SQLITE_ROW = 100;		//!< SQLITE_step() has another row ready
	public static final int SQLITE_DONE = 101;		//!< SQLITE_step() has finished executing

	public static final int ITEM_TYPE_FREE = 0;
	public static final int ITEM_TYPE_DEPARTMENT = 1;
	public static final int ITEM_TYPE_PLU = 2;
	public static final int ITEM_TYPE_TICKET = 3;

	public static final int TRAN_RESULT_OK												= 0x0000;
	public static final int TRAN_RESULT_NOT_ALLOWED										= 0x0001;
	public static final int TRAN_RESULT_TIMEOUT											= 0x0002;
	public static final int TRAN_RESULT_USER_ABORT										= 0x0004;
	public static final int TRAN_RESULT_EKU_PROBLEM										= 0x0008;
	public static final int TRAN_RESULT_CONTINUE										= 0x0010;
	public static final int TRAN_RESULT_NO_PAPER										= 0x0020;

	// FISCAL APPLICATION USER TYPE ERRORS
	public static final int APP_ERR_FISCAL_EXCHANGE_RATES_NOT_FOUND 					= 2000;
	public static final int APP_ERR_FISCAL_ALREADY_CANCELED_ITEM						= 2001;
	public static final int APP_ERR_FISCAL_INVALID_DISCOUNT_RATE 						= 2002;
	public static final int APP_ERR_FISCAL_DISCOUNT_RATE_NOT_SET						= 2003;
	public static final int APP_ERR_FISCAL_INVALID_INCREASE_RATE						= 2004;
	public static final int APP_ERR_FISCAL_INCREASE_RATE_NOT_SET						= 2005;
	public static final int APP_ERR_FISCAL_DISCOUNT_ALREADY_DONE						= 2006;
	public static final int APP_ERR_FISCAL_INCREASE_ALREADY_DONE						= 2007;
	public static final int APP_ERR_FISCAL_NO_PRETOTAL 									= 2008;
	public static final int APP_ERR_FISCAL_INVALID_ENTRY 								= 2009;
	public static final int APP_ERR_FISCAL_KDV_RATE_NOT_FOUND							= 2010;
	public static final int APP_ERR_FISCAL_TICKET_LIMIT_EXCEED							= 2011;
	public static final int APP_ERR_FISCAL_SALE_ITEM_LIMIT_EXCEED						= 2012;
	public static final int APP_ERR_FISCAL_CASH_ENTRY_LIMIT_EXCED						= 2013;
	public static final int APP_ERR_FISCAL_INVALID_CURRENCY								= 2014;
	public static final int APP_ERR_NOT_ALLOWED_BEFORE_GIB_CONNECTION					= 2015;
	public static final int APP_ERR_KISIM_FIYAT_LIMITI_ASILAMAZ							= 2016;
	public static final int APP_ERR_FISCAL_DEPARTMENT_ENTRY_INCOMPLETE					= 2017;
	public static final int APP_ERR_FISCAL_EXCHANGE_RATE_NOT_FOUND						= 2018;
	public static final int APP_ERR_APL_CRC_ERROR										= 2019;
	public static final int APP_ERR_APL_VERS_ERROR										= 2020;
	public static final int APP_ERR_APL_COMPLETE_PAYMENT								= 2021;
	public static final int APP_ERR_APL_CREDIT_CANNOT_BIGGER_THAN_REMAIN_AMOUNT			= 2022;
	public static final int APP_ERR_APL_CREDIT_PAID_AMOUNT_MISSING						= 2023;
	public static final int APP_ERR_APL_CREDIT_PAID_ONLY_ONE_TIME_ALLOWED				= 2024;
	public static final int APP_ERR_FISCAL_INVALID_DATE_TIME							= 2025;
	public static final int APP_ERR_MAX_RECEIPT_COUNTER_REACHED							= 2026;
	public static final int APP_ERR_APL_NO_PAPER										= 2027;
	public static final int APP_ERR_APL_PARAMETRE_NOT_FOUND								= 2028;
	public static final int APP_ERR_EKU_SOFTWARE_VERSION								= 2029;
	public static final int APP_ERR_FISCAL_SOFTWARE_VERSION								= 2030;
	public static final int APP_ERR_CIHAZ_GECICI_OLARAK_KAPATILDI						= 2031;
	public static final int APP_ERR_CIHAZ_ACIL_MODA_ALINMIS								= 2032;
	public static final int APP_ERR_APL_DAILY_MEMORY_DELETED							= 2033;
	public static final int APP_ERR_APL_CUMULATIVE_COUNTER_FULL							= 2034;
	public static final int APP_ERR_APL_OUT_OF_SERVICE									= 2035;
	public static final int APP_ERR_APL_OUT_OF_SERVICE_WARNING							= 2036;
	public static final int APP_ERR_APL_FONT_FILE_LOAD									= 2037;
	public static final int APP_ERR_APL_FONT_POLICY_NOT_FOUND							= 2038;
	public static final int APP_ERR_APL_CREDIT_PAY_AMOUNT_ZERO							= 2039;
	public static final int APP_ERR_APL_DB_ERROR										= 2040;
	public static final int APP_ERR_TICKET_SALE_ITEM_LIMIT_EXCEED						= 2041;
	public static final int APP_ERR_APL_PIN_ERROR										= 2042;
	public static final int APP_ERR_PAYMENT_APPL_MESSAGE								= 2043;
	public static final int APP_ERR_APL_DB_DUBLICATE_RECORD								= 2044;
	public static final int APP_ERR_APL_TRANSACTION_CORRUPTED							= 2045;
	public static final int APP_ERR_APL_PAYMENT_MUST_COMPLETE							= 2046;
	public static final int APP_ERR_INVOICE_LIMIT_EXCEED								= 2047;
	public static final int APP_ERR_TRANSACTION_NOT_SAVED								= 2048;
	public static final int APP_ERR_INVOICE_NO_ENTRY									= 2049;
	public static final int APP_ERR_INACTIVE_PERIPHERAL									= 2050;
	public static final int APP_ERR_DEVICE_CLOSED										= 2051;
	public static final int APP_ERR_TEST_REQUIRED										= 2052;
	public static final int APP_ERR_CASHIER_ENTRY_REQUIRED								= 2053;
	public static final int APP_ERR_FLIGHT_MODE											= 2054;
	public static final int APP_ERR_NO_PARAM											= 2055;
	public static final int APP_ERR_NOT_FISCAL											= 2056;
	public static final int APP_ERR_FISCAL_RECORD_NOT_AVAILABLE							= 2057;
	public static final int APP_ERR_CITIZEN_NUMBER_ENTRY								= 2058;
	public static final int APP_ERR_INVALID_USER_MODE									= 2059;
	public static final int APP_ERR_PAYMENT_NOT_ALLOWED									= 2060;
	public static final int APP_ERR_NO_CASH												= 2061;
	public static final int APP_ERR_PARAMETER_DW_ERROR_FOR_TEST							= 2062;
	public static final int APP_ERR_MAX_TRY_COUNTER_EXCEED								= 2063;
	public static final int APP_ERR_NOT_ALLOWED											= 2064;
	public static final int APP_ERR_RESOURCE_PROBLEM									= 2065;
	public static final int APP_ERR_ITEM_PRICE_NOT_EXISTS								= 2066;
	public static final int APP_ERR_FIS_LIMITI_ASILAMAZ									= 2067;
	public static final int APP_ERR_NO_ITEM												= 2068;
	public static final int APP_ERR_PAYMENT_FOUND										= 2069;
	public static final int APP_ERR_MATRAHSIZ_FOUND										= 2070;
	public static final int APP_ERR_NOT_APPROVED										= 2071;
	public static final int APP_ERR_ONLY_COUPON											= 2072;
	public static final int APP_ERR_NO_AMOUNT											= 2073;
	public static final int APP_ERR_CURRENCY_NOT_SUPPORTED								= 2074;
	public static final int APP_ERR_TICKET_TOTAL_CANNOT_BE_ZERO							= 2075;
	public static final int APP_ERR_INVOICE_NOT_ALLOWED									= 2076;
	public static final int APP_ERR_TICKET_HEADER_NOT_PRINTED							= 2077;
	public static final int APP_ERR_TICKET_HEADER_ALREADY_PRINTED						= 2078;
	public static final int APP_ERR_PLU_NOT_FOUND										= 2079;
	public static final int APP_ERR_ALREADY_DONE										= 2080;
	public static final int APP_ERR_INVALID_PARAMETER_TAXINDEX							= 2081;
	public static final int APP_ERR_INVALID_PARAMETER_TAXRATE							= 2082;
	public static final int APP_ERR_MISSING_PARAMETER									= 2083;
	public static final int APP_ERR_MISMATCH_PARAMETER									= 2084;
	public static final int APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_NO_MORE_ERROR_CODE		= 2085;
	public static final int APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_MORE_ERROR_CODE			= 2086;
	public static final int APP_ERR_INVALID_PAYMENT_TYPE								= 2087;
	public static final int APP_ERR_VAS_NOT_AVAILABLE									= 2088;
	public static final int APP_ERR_INVALID_CAR_IDENTIFICATION							= 2089;
	public static final int APP_ERR_ALLOCATION											= 2090;
	public static final int APP_ERR_MISSING_TAXFREE_PARAMETER							= 2091;
	public static final int APP_ERR_INVALID_TAXREFUND_VALUE								= 2092;
	public static final int APP_ERR_TAXFREE_NOT_STARTED									= 2093;
	public static final int APP_ERR_TAXFREE_NOT_COMPLETED								= 2094;
	public static final int APP_ERR_TAXLESS_NOT_SUPPORTED								= 2095;
	public static final int APP_ERR_INVALID_TICKET_TYPE									= 2096;
	public static final int APP_ERR_NOT_ALLOWED_AS_GMP3_TRANSACTION_IS_PENDING			= 2097;
	public static final int APP_ERR_DEVICE_REASSIGNED									= 2098;
	public static final int APP_ERR_DEPT_FOOD_RECEIPT_ITEM_NOT_ENABLE					= 2099;
	public static final int APP_ERR_CHECK_IP_ADDRES_FORMAT								= 2100;
	public static final int APP_ERR_WRONG_SERVICE_CARD_PIN								= 2101;
	public static final int APP_ERR_UNDEFINED_COM_INTERFACE								= 2102;
	public static final int APP_ERR_BASE_NOT_FOUND										= 2103;
	public static final int APP_ERR_ETHERNET_MODUL_CALISMIYOR							= 2104;
	public static final int APP_ERR_ETHERNET_NOT_PLUGGED								= 2105;
	public static final int APP_ERR_ETHERNET_BASE_NOT_READY								= 2106;
	public static final int APP_ERR_ETHERNET_OUT_OF_BASE								= 2107;
	public static final int APP_ERR_GPRS_ERROR_NO_SIM									= 2108;
	public static final int APP_ERR_GPRS_APN											= 2109;
	public static final int APP_ERR_GPRS_BAD_PIN										= 2110;
	public static final int APP_ERR_GPRS_SIM_LOCK										= 2111;
	public static final int APP_ERR_GPRS_NO_SIGNAL										= 2112;
	public static final int APP_ERR_GPRS_DISCONNCTED									= 2113;
	public static final int APP_ERR_GPRS_UNDEFINED										= 2114;
	public static final int APP_ERR_SSL_PROFILE											= 2115;
	public static final int APP_ERR_WRONG_SERVICE_CARD									= 2116;
	public static final int APP_ERR_COMMUNICATION_CHANNEL_NOT_DEFINED					= 2117;
	public static final int APP_ERR_EXCEPTION_CODE_NOT_FOUND							= 2118;
	public static final int APP_ERR_YEMEKCEKI_PAYMENT									= 2119;
	public static final int APP_ERR_VAS_VERSION_MISMATCH								= 2120;
	public static final int APP_ERR_VAS_SERVICE_NOT_AVAILABLE							= 2121;
	public static final int APP_ERR_VAS_CUSTOMER_IDENTIFICATION							= 2122;
	public static final int APP_ERR_INVALID_EXCEPTION_CODE_TYPE							= 2123;
	public static final int APP_ERR_INVALID_EXCEPTION_CODE								= 2124;
	public static final int APP_ERR_VAS_LOYALTY_PROCESS									= 2125;
	public static final int APP_ERR_DECREASE_CAN_NOT_APPLY								= 2126;
	public static final int APP_ERR_INCREASE_CAN_NOT_APPLY								= 2127;
	public static final int APP_ERR_INVALID_INVOICE_ENTRY								= 2128;
	public static final int APP_ERR_HEADER_CHANGE_NOT_SUPPORT_FOR_GIB_SUBE_CODE			= 2129;

	public static final int APP_ERR_GIB_ROOT_CERT_NOT_FOUND								= 2200;
	public static final int APP_ERR_GIB_SUB_ROOT_CERT_NOT_FOUND							= 2201;
	public static final int APP_ERR_TSM_ROOT_CERT_NOT_FOUND								= 2202;
	public static final int APP_ERR_TSM_SUB_ROOT_CERT_NOT_FOUND							= 2203;
	public static final int APP_ERR_OKTEM_CERT_NOT_FOUND								= 2204;
	public static final int APP_ERR_GIB_SIGN_CERT_NOT_FOUND								= 2205;
	public static final int APP_ERR_GIB_SIFRE_CERT_NOT_FOUND							= 2206;
	public static final int APP_ERR_TSM_SIGN_CERT_NOT_FOUND								= 2207;
	public static final int APP_ERR_PACK_GIB											= 2208;
	public static final int APP_ERR_GIB_CERT											= 2209;
	public static final int APP_ERR_DATABASE_SILINMIS									= 2210;
	public static final int APP_ERR_OKTEM_CERT_VERIFICATION								= 2211;

	public static final int APP_ERR_FILE_COPY											= 2220;
	public static final int APP_ERR_FILE_OPEN											= 2221;
	public static final int APP_ERR_FILE_READ											= 2222;
	public static final int APP_ERR_FILE_WRITE											= 2223;
	public static final int APP_ERR_BUFFER_MALLOC										= 2224;
	public static final int APP_ERR_FILE_SEEK											= 2225;
	public static final int APP_ERR_FILE_EOF											= 2226;
	public static final int APP_ERR_FILE_MOUNT											= 2227;

	public static final int APP_ERR_GMP_PROTOCOL										= 2230;
	public static final int APP_ERR_GMP_VERIFICATION									= 2231;
	public static final int APP_ERR_GMP_LRC												= 2232;
	public static final int APP_ERR_COMPONENT_ABSENT									= 2233;
	public static final int APP_ERR_SQL													= 2234;
	public static final int APP_ERR_GMP_RESPONSE_CODE_ERROR								= 2235;
	public static final int APP_ERR_FRAM_Z_REPORT_UPDATE								= 2236;
	public static final int APP_ERR_DAILY_WRITE											= 2237;
	public static final int APP_ERR_FISCAL_CUMULATIVE_WRITE								= 2238;
	public static final int APP_ERR_GMP_PROTOCOL_CANNOT_RECEIVED_FULL_MESSAGE			= 2239;
	public static final int APP_ERR_GMP_PROTOCOL_TPDU_NOT_RECEIVED						= 2240;
	public static final int APP_ERR_GMP_AUTO_FICAL_FAILED								= 2241;
	public static final int APP_ERR_GMP_EFTPOS_BAGLANTISI_BULUNAMADI					= 2242;
	public static final int APP_ERR_GMP_GIB_KEY_IMZA_VERIFICATION						= 2243;
	public static final int APP_ERR_GMP_GIB_SHA2_IDENTIFIER								= 2244;
	public static final int APP_ERR_GMP_MISSING_GROUP									= 2245;
	public static final int APP_ERR_GMP_BUFFER_ERROR									= 2246;
	public static final int APP_ERR_GMP_PADDING_ERROR									= 2247;
	public static final int APP_ERR_GMP_TREK_TRAK_MISMATCH								= 2248;
	public static final int APP_ERR_GMP_TSM_KEY_IMZA_VERIFICATION						= 2249;
	public static final int APP_ERR_GMP_NEGATIVE_TRANSACTION							= 2250;
	public static final int APP_ERR_GMP_UNEXPECTED_RESULT								= 2251;

	public static final int APP_ERR_GMP3_UNDEFINED_OKC_MODEL							= 2301;
	public static final int APP_ERR_GMP3_UNDEFINED_OKC_VENDOR							= 2302;
	public static final int APP_ERR_GMP3_UNDEFINED_OKC_SICILNO							= 2303;
	public static final int APP_ERR_GMP3_UNDEFINED_CIHAZ_MODEL							= 2304;
	public static final int APP_ERR_GMP3_UNDEFINED_CIHAZ_VENDOR							= 2305;
	public static final int APP_ERR_GMP3_UNDEFINED_CIHAZ_SERINO							= 2306;
	public static final int APP_ERR_GMP3_UNDEFINED_MSG_TYPE								= 2307;
	public static final int APP_ERR_GMP3_UNDEFINED_MISSING_PARAMETER					= 2308;
	public static final int APP_ERR_GMP3_INVALID_SEQUENCE_NUMBER						= 2309;
	public static final int APP_ERR_GMP3_INVALID_DATE_TIME								= 2310;
	public static final int APP_ERR_GMP3_MISSING_TDES_KEY								= 2311;
	public static final int APP_ERR_GMP3_INVALID_KCV									= 2312;
	public static final int APP_ERR_GMP3_UNDEFINED_STATUS								= 2313;
	public static final int APP_ERR_GMP3_TIMEOUT										= 2314;
	public static final int APP_ERR_GMP3_CERTIFICATE									= 2315;
	public static final int APP_ERR_GMP3_VERIFY											= 2316;
	public static final int APP_ERR_GMP3_INVALID_HANDLE									= 2317;
	public static final int APP_ERR_GMP3_CRC											= 2318;
	public static final int APP_ERR_GMP3_LEN											= 2319;
	public static final int APP_ERR_GMP3_STX											= 2320;
	public static final int APP_ERR_GMP3_ETX											= 2321;
	public static final int APP_ERR_GMP3_NACK											= 2322;
	public static final int APP_ERR_GMP3_ACK											= 2323;
	public static final int APP_ERR_GMP3_RECEIVE										= 2324;
	public static final int APP_ERR_GMP3_SEND											= 2325;
	public static final int APP_ERR_GMP3_PARSE											= 2326;
	public static final int APP_ERR_GMP3_USER_BREAK										= 2327;
	public static final int APP_ERR_GMP3_PROTOCOL										= 2328;
	public static final int APP_ERR_GMP3_PAIRING_REQUIRED								= 2329;
	public static final int APP_ERR_GMP3_UNKNOWN_DEVICE									= 2330;
	public static final int APP_ERR_GMP3_VERSION_MISMATCH								= 2331;
	public static final int APP_ERR_GMP3_NO_PRIME_NUMBER								= 2332;
	public static final int APP_ERR_GMP3_PERMISSION										= 2333;
	public static final int APP_ERR_GMP3_INCORRECT_DEVICE								= 2334;
	public static final int APP_ERR_GMP3_MEMORY_READ_ERROR								= 2335;
	public static final int APP_ERR_GMP3_MEMORY_WRITE_ERROR								= 2336;
	public static final int APP_ERR_GMP3_MEMORY_ERASE_ERROR								= 2337;
	public static final int APP_ERR_GMP3_APP_CHECKSUM_MISMATCH							= 2338;
	public static final int APP_ERR_GMP3_APP_DATE_EXPIRED								= 2339;
	public static final int APP_ERR_GMP3_TCP_RECEIVE_ERROR								= 2340;
	public static final int APP_ERR_GMP3_NO_HANDLE										= 2341;
	public static final int APP_ERR_GMP3_PING											= 2342;
	public static final int APP_ERR_GMP3_TCP_NO_DATA									= 2343;
	public static final int APP_ERR_GMP3_EOT											= 2344;
	public static final int APP_ERR_GMP3_TAG_NOT_AVAILABLE								= 2345;
	public static final int APP_ERR_GMP3_ENCRYPT_DECRYPT								= 2346;
	public static final int APP_ERR_GMP3_MESSAGE_TYPE									= 2347;
	public static final int APP_ERR_GMP3_DECOMPRESS										= 2348;
	public static final int APP_ERR_GMP3_INVALID_MERCHANT_UNIQUE_ID						= 2349;
	public static final int APP_ERR_GMP3_INVALID_BRANCH_UNIQUE_ID						= 2350;
	public static final int APP_ERR_GMP3_DATA_GROUP_NOT_FOUND							= 2351;
	public static final int APP_ERR_GMP3_VERIFY_GROUP_NOT_FOUND							= 2352;
	public static final int APP_ERR_GMP3_VERIFY_GROUP_MISMATCH							= 2353;
	public static final int APP_ERR_GMP3_RECEIPT_CAN_NOT_VOID							= 2354;
	public static final int APP_ERR_GMP3_BITMAP_NOT_EXIST								= 2355;
	public static final int APP_ERR_GMP3_LRC											= 2356;
	public static final int APP_ERR_GMP3_PAYMENT_CAN_NOT_VOID							= 2357;
	public static final int APP_ERR_GMP3_NO_TICKET_TO_VOID								= 2358;

	public static final int APP_ERR_GMP3_PAYMENT_KDV_NOT_AVAILABLE						= 2400;
	public static final int APP_ERR_GMP3_ITEM_NOT_AVAILABLE								= 2401;
	public static final int APP_ERR_GMP3_OKC_KISIM_UNKNOWN 								= 2402;
	public static final int APP_ERR_GMP3_DOVIZ_UNKNOWN									= 2403;
	public static final int APP_ERR_GMP3_KASIYER_UNKNOWN								= 2404;
	public static final int APP_ERR_GMP3_FUNC_OKC_PARAMETRE								= 2405;
	public static final int APP_ERR_GMP3_FATURA_ODEME_PARAMETRE							= 2406;
	public static final int APP_ERR_GMP3_Z_RAPOR										= 2407;
	public static final int APP_ERR_GMP3_X_RAPOR										= 2408;
	public static final int APP_ERR_GMP3_BATTERY_LEVEL									= 2409;
	public static final int APP_ERR_GMP3_EKU_RAPOR_TYPE									= 2410;
	public static final int APP_ERR_GMP3_EKU_STATE										= 2411;
	public static final int APP_ERR_GMP3_ECR_NOT_FISCAL									= 2412;
	public static final int APP_ERR_GMP3_NO_FUNCTION									= 2413;
	public static final int APP_ERR_GMP3_MALI_KUMULATIF_RAPOR							= 2414;
	public static final int APP_ERR_GMP3_SINEMA_BILET_DESTEGI							= 2415;
	public static final int APP_ERR_GMP3_PARAMETRE_HATASI								= 2416;
	public static final int APP_ERR_GMP3_Z_REQUIRED										= 2417;
	public static final int APP_ERR_GMP3_UNSUPPORTED									= 2418;
	public static final int APP_ERR_GMP3_SINEMA_URUN_SAYISI								= 2419;
	public static final int APP_ERR_GMP3_PAYMENT_CANCELLED								= 2420;
	public static final int APP_ERR_GMP3_ITEM_URUN_SAYISI								= 2421;
	public static final int APP_ERR_GMP3_RESOURCE_PROBLEM								= 2422;
	public static final int APP_ERR_GMP3_PLU_NOT_FOUND									= 2423;
	public static final int APP_ERR_GMP3_NOT_PROPER_DISCOUNT							= 2424;
	public static final int APP_ERR_GMP3_BIRIM_NOT_FOUND								= 2425;
	public static final int APP_ERR_GMP3_MIKTAR_NOT_FOUND								= 2426;
	public static final int APP_ERR_GMP3_URUN_ADI_NOT_FOUND								= 2427;
	public static final int APP_ERR_GMP3_TUTAR_NOT_FOUND								= 2428;
	public static final int APP_ERR_GMP3_UNKNOWN_ISLEM_TIPI								= 2429;
	public static final int APP_ERR_GMP3_VERGI_NOT_AVAILABLE							= 2430;
	public static final int APP_ERR_GMP3_ISLEM_NOT_ALLOWED								= 2431;
	public static final int APP_ERR_GMP3_CURRENCY_NOT_AVAILABLE							= 2432;
	public static final int APP_ERR_GMP3_FIS_ITEM_NOT_ALLOWED							= 2433;
	public static final int APP_ERR_GMP3_FATURA_PARAMETER_MISSING						= 2434;
	public static final int APP_ERR_GMP3_FATURA_TARIHI_MISSING							= 2435;
	public static final int APP_ERR_GMP3_TUTAR_NOT_REQUIRED								= 2436;
	public static final int APP_ERR_GMP3_TUTAR_REQUIRED									= 2437;
	public static final int APP_ERR_GMP3_INCORRECT_PASSWORD								= 2438;
	public static final int APP_ERR_GMP3_INACTIVE_CASHIER_INDEX							= 2439;
	public static final int APP_ERR_GMP3_APPLICATION_NOT_FOUND			          		= 2440;
	public static final int APP_ERR_GMP3_UNDEFINED_TAG									= 2441;
	public static final int APP_ERR_GMP3_SAVE_ECR_HEADER								= 2442;
	public static final int APP_ERR_GMP3_INVALID_RECIPT_LIMIT							= 2443;
	public static final int APP_ERR_GMP3_ADVANCE										= 2444;
	public static final int APP_ERR_GMP3_PAYMENT										= 2445;
	public static final int APP_ERR_GMP3_TRANSACTION_IS_ACTIVE							= 2446;
	public static final int APP_ERR_GMP3_FATURA_TYPE_NOT_AVAILABLE						= 2447;
	public static final int APP_ERR_GMP3_FATURA_INVALID_TCK								= 2448;
	public static final int APP_ERR_INVALID_UNIQUE_ID									= 2449;
	public static final int APP_ERR_GMP3_TICKET_TYPE									= 2450;
	public static final int APP_ERR_GMP3_SETTINGS										= 2451;
	public static final int APP_ERR_GMP3_BITMAP											= 2452;
	public static final int APP_ERR_GMP3_FILE								     		= 2453;
	public static final int APP_ERR_GMP3_ADMIN_PASSWORD_BLOCKED							= 2454;
	public static final int APP_ERR_GMP3_CASHIER_PASSWORD_BLOCKED						= 2455;
	public static final int APP_ERR_GMP3_CASHIER_PASSWORD_INCORRECT						= 2456;
	public static final int APP_ERR_GMP3_VAS_SUPPORT									= 2457;
	public static final int APP_ERR_GMP3_OTOPARK_PARAMETER 								= 2458;
	public static final int APP_ERR_GMP3_CUSTOMER_INFO									= 2459;
	public static final int APP_ERR_GMP3_FISEKU_PING_ERROR								= 2460;
	public static final int APP_ERR_GMP3_TICKET_SALE_NOT_ALLOWED						= 2461;
	public static final int APP_ERR_GMP3_INVALID_CASHIER_PASSWORD						= 2462;
	public static final int APP_ERR_GMP3_INVALID_CASHIER_NAME							= 2463;
	public static final int APP_ERR_GMP3_ITEM_NOT_ALLOWED_TO_INC_DEC					= 2464;
	public static final int APP_ERR_GMP3_NO_ZERO_TAXRATE_ON_TAX_TABLE					= 2465;
	public static final int APP_ERR_GMP3_NO_PERMISSION_OF_USER							= 2466;
	public static final int APP_ERR_GMP3_NO_PERMISSION_OF_TSM							= 2467;
	public static final int APP_ERR_GMP3_MISSING_INVOICE_PARAMETER						= 2468;
	public static final int APP_ERR_GMP3_ETTN_COULD_NOT_DOWNLOAD						= 2469;
	public static final int APP_ERR_GMP3_INTEGRATOR_COMMUNICATION						= 2470;
	public static final int APP_ERR_GMP3_INVALID_ONLINE_INVOICE_TYPE					= 2471;
	public static final int APP_ERR_GMP3_NOT_ALLOWED_PROCESS_IN_ONLINE_INVOICE			= 2472;
	public static final int APP_ERR_GMP3_EXCEPTION_CODE_REQUIRED						= 2473;
	public static final int APP_ERR_GMP3_FORCED_VOID									= 2474;
	public static final int APP_ERR_GMP3_PROFILE_INDEX_CANNOT_SELECTED					= 2475;
	public static final int APP_ERR_GMP3_PROFILE_INDEX_NOT_SELECTED						= 2476;
	public static final int APP_ERR_GMP3_PDM_APP_ACTIVE									= 2477;
	public static final int APP_ERR_GMP3_PDM_INVALID_MODE								= 2478;
	public static final int APP_ERR_GMP3_INVALID_FILE_NAME								= 2479;

	public static final int APP_ERR_GMP3_MONTHLY_REPORT									= 2480;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_WRITE_ERROR						= 2481;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_READ_ERROR						= 2482;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_SEND_ERROR						= 2483;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_FRAM_READ_ERROR					= 2484;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_FRAM_WRITE_ERROR				= 2485;
	public static final int APP_ERR_GMP3_DAILY_REPORT_FRAM_READ_ERROR					= 2486;
	public static final int APP_ERR_GMP3_DAILY_REPORT_FRAM_WRITE_ERROR					= 2487;
	public static final int APP_ERR_GMP3_MONTHLY_REPORT_FISCAL_CUMULATIVE				= 2488;
	public static final int APP_ERR_GMP3_MONTHLY_NO_RECORD								= 2489;
	public static final int APP_ERR_GMP3_TERMINAL_NOT_FISCAL							= 2490;

	public static final int APP_ERR_GMP3_PAYMENT_STATUS_NO_AVAILABLE					= 2491;
	public static final int APP_ERR_GMP3_INVALID_TCKN_VKN								= 2492;
	public static final int APP_ERR_GMP3_FOODCARD_VATRATE_MISMATCH						= 2493;
	public static final int APP_ERR_GMP3_FOODCARD_BIGGER_THAN_PAYABLE_AMOUNT			= 2494;
	public static final int APP_ERR_GMP3_STOPPAGE_RATE_NOT_FOUND						= 2495;
	public static final int APP_ERR_GMP3_CAN_NOT_ACCEPT_AFTER_HEADER_PRINTED			= 2496;
	public static final int APP_ERR_GMP3_INVALID_PAYMENT_INDEX							= 2497;
	public static final int APP_ERR_GMP3_GET_SLIP_REQUEST_FAILED						= 2498;
	public static final int APP_ERR_GMP3_GET_SLIP_RESPONSE_FAILED						= 2499;
	public static final int APP_ERR_GMP3_GET_SLIP_INVALID_INDEX							= 2500;
	public static final int APP_ERR_ECR_RECEIPT_NOT_ALLOWED								= 2501;
	public static final int APP_ERR_INVOICE_INFO_RECEIPT_NOT_ALLOWED					= 2502;
	public static final int APP_ERR_FOODCARD_INFO_RECEIPT_NOT_ALLOWED					= 2503;
	public static final int APP_ERR_PAY_AMOUNT_MISMATCH									= 2504;
	public static final int APP_ERR_INVALID_FOODCARD_VATRATE							= 2505;
	public static final int APP_ERR_GMP3_TOTAL_FOODCARD_BIGGER_THAN_PAYABLE_AMOUNT		= 2506;
	public static final int APP_ERR_E_BILET_NO_PARAMETER_ENTRY							= 2507;
	public static final int APP_ERR_E_BILET_INVALID_BILET_TYPE							= 2508;
	public static final int APP_ERR_SMM_INVALID_RATE									= 2509;
	public static final int APP_ERR_E_BILET_ITEM_CAN_NOT_HAVE_A_NAME					= 2510;
	public static final int APP_ERR_INVALID_UNIT_TYPE									= 2511;
	public static final int APP_ERR_PAYMENT_TYPE_MISMATCH								= 2512;
	public static final int APP_ERR_REVERSE_PAYMENT_CANNOT_VOID							= 2513;

	public static final int APP_ERR_TERMINAL_DATE_INVALID								= 2520;
	public static final int APP_ERR_24H_RESET_TIME_DELAY_MUST_BIGGER					= 2521;
	public static final int APP_ERR_24H_RESET_TIME_DELAY_MUST_SMALLER					= 2522;
	public static final int APP_ERR_24H_RESET_INVALID_BEFORE_MANAGER_PARAMETER			= 2523;
	public static final int APP_ERR_24H_RESET_INVALID_TIME_SET							= 2524;

	public static final int APP_ERR_PAYMENT_APP_NOT_SELECTED							= 2530;

	public static final int APP_ERR_GMP3_NOT_ALLOWED_BEFORE_HEADER						= 2531;
	public static final int APP_ERR_NOT_ALLOWED_VAT_RATE								= 2532;
	public static final int APP_ERR_EXPIRED_EXCHANGE_RATE								= 2533;

	public static final int APP_ERR_NOT_FOUND											= 2540;
	public static final int APP_ERR_NOT_MEMORY_ERROR									= 2541;

	// MasterOKC Hata
	public static final int APP_ERR_BACKGROUND_LOADING_NOT_ALLOWED						= 2550;
	public static final int APP_ERR_BACKGROUND_TICKETHEADER_NOT_FOUND					= 2551;
	public static final int APP_ERR_BACKGROUND_DB_READ_ERROR							= 2552;
	public static final int APP_ERR_BACKGROUND_DB_READ_LENGTH_ERROR						= 2553;
	public static final int APP_ERR_NOT_ALLOWED_IN_BACKGROUND_MODE						= 2554;
	public static final int APP_ERR_SIGN_NOT_VALIDATED									= 2555;
	public static final int APP_ERR_TRANSACTION_ALREADY_COMPLATED						= 2556;
	public static final int APP_ERR_INVALID_HANDLE_STATUS								= 2557;
	public static final int APP_ERR_BACKGROUND_HANDLE_NOT_FOUND							= 2558;

	public static final int APP_ERR_GMP3_NO_EMPTY_KEY_SLOT								= 3000;

	public static final int ING_PRN_RET_NO_PAPER										= 0xE001;
	public static final int ING_PRN_RET_PORT_NOT_OPENED									= 0xE002;
	public static final int ING_PRN_RET_PORT_NOT_CONNECT								= 0xE003;
	public static final int ING_PRN_RET_PORT_DATA_NOT_SENT								= 0xE004;
	public static final int ING_PRN_RET_PORT_DATA_NOT_RECEIVED							= 0xE005;
	public static final int ING_PRN_RET_DRIVER_NOT_INIT									= 0xE006;
	public static final int ING_PRN_RET_INVALID_LENGTH									= 0xE007;
	public static final int ING_PRN_RET_INVALID_SIZE									= 0xE008;
	public static final int ING_PRN_RET_LENGTH_IS_ZERO									= 0xE009;
	public static final int ING_PRN_RET_LEN_IS_ZERO										= 0xE00A;
	public static final int ING_PRN_RET_POINTER_IS_NULL									= 0xE00B;
	public static final int ING_PRN_RET_INVALID_LIMITS									= 0xE00C;
	public static final int ING_PRN_RET_IDLE_COMMINICATION_ERROR						= 0xE00D;
	public static final int ING_PRN_RET_INTERNAL_PRINTER_ACQUIRE_ERROR					= 0xE00E;
	public static final int ING_PRN_RET_UNKNOWN											= 0xE00F;
	public static final int ING_PRN_RET_FUNCTION_NOT_FOUND								= 0xE010;
	public static final int ING_PRN_RET_HANDLE_ERROR									= 0xE011;
	public static final int ING_PRN_RET_FONT_IS_NOT_IN_FONT_FILE						= 0xE012;
	public static final int ING_PRN_RET_CHAR_IS_NOT_IN_FONT								= 0xE013;
	public static final int ING_PRN_RET_MARGINS_ARE_TOO_BIG								= 0xE014;
	public static final int ING_PRN_RET_BARCODE_MESSAGE_TOO_LONG						= 0xE015;
	public static final int ING_PRN_RET_BARCODE_INVALID_CHAR							= 0xE016;
	public static final int ING_PRN_RET_BARCODE_INVALID_PARAMETER						= 0xE017;
	public static final int ING_PRN_RET_TYPE_NOT_SUPPORTED								= 0xE018;
	public static final int ING_PRN_RET_IDLE_NOT_SUPPORT_COMMAND						= 0xE019;
	public static final int ING_PRN_RET_MEMORY_ERROR									= 0xE01A;
	public static final int ING_PRN_RET_BITMAP_FORMAT_ERROR								= 0xE01B;
	public static final int ING_PRN_RET_NO_CURRENT_OUTPUT								= 0xE01C;
	public static final int ING_PRN_RET_PRINTER_CLOSED									= 0xE01D;
	public static final int ING_PRN_RET_NO_IMG_DATA										= 0xE01E;
	public static final int ING_PRN_RET_EKU_SEND_ERROR									= 0xE01F;
	public static final int ING_PRN_RET_EKU_FUNCTION_NOT_SUPPORTED						= 0xE020;
	public static final int ING_PRN_RET_QR_NOT_GENERATED								= 0xE021;
	public static final int ING_PRN_RET_QR_CONVERT_ERROR								= 0xE022;
	public static final int ING_PRN_RET_FILE_WRITE_ERROR								= 0xE023;
	public static final int ING_PRN_RET_EXTERNAL_PRINTER_NOT_RESPOND					= 0xE024;
	public static final int ING_PRN_RET_EXTERNAL_PRINTER_TO								= 0xE025;
	public static final int ING_PRN_RET_PORTABLE_TERMINAL_NOT_ON_BASE					= 0xE026;
	public static final int ING_PRN_RET_NO_TSM_AUTHORITY								= 0xE027;
	public static final int ING_PRN_RET_ECR_NOT_SUPPORT_EXTERNAL_PRINTER				= 0xE028;
	public static final int ING_PRN_RET_ECR_NOT_FOUND_PRINTER							= 0xE029;
	public static final int ING_PRN_RET_EXTERNAL_NOT_SUPPORTED_FOR_TERMINAL				= 0xE02A;
	public static final int ING_PRN_RET_PRINT_HANDLE_CANT_OPEN_FOR_CLESS				= 0xE02B;
	public static final int ING_PRN_RET_IMAGE_WIDTH_INVALID								= 0xE02C;
	public static final int ING_PRN_RET_VOLITE_WRITE_ERROR								= 0xE02D;
	public static final int ING_PRN_RET_EXTERNAL_PRINTER_CHANGED						= 0xE02E;
	public static final int ING_PRN_RET_ALREADY_USED_EXTERNAL_PRINTER					= 0xE02F;
	public static final int ING_PRN_RET_INVALID_VOLUME_NAME								= 0xE030;
	public static final int ING_PRN_RET_FILE_CAN_NOT_OPEN								= 0xE031;
	public static final int ING_PRN_RET_FILE_CAN_NOT_READ								= 0xE032;
	public static final int ING_PRN_RET_COMMAND_NOT_SUPPORTED							= 0xE033;
	public static final int ING_PRN_RET_COMMAND_NOT_FOR_FRONT_STATION					= 0xE034;

	// Gmp3SmartDll Return Codes
	public static final int DLL_RETCODE_PORT_NOT_OPEN									= 0xF000;
	public static final int DLL_RETCODE_ECR_DATA_ERR									= 0xF001;
	public static final int DLL_RETCODE_POS_DATA_ERR									= 0xF002;
	public static final int DLL_RETCODE_TIMEOUT											= 0xF003;
	public static final int DLL_RETCODE_DATA_SEND_ERR									= 0xF004;
	public static final int DLL_RETCODE_LENGHT_ERR										= 0xF005;
	public static final int DLL_RETCODE_SESSIONID_ERR									= 0xF006;
	public static final int DLL_RETCODE_DATA_RECV_ERR									= 0xF007;
	public static final int DLL_RETCODE_RETRY_ERR										= 0xF008;
	public static final int DLL_RETCODE_RECV_EOT										= 0xF009;
	public static final int DLL_RETCODE_LEN_TOO_LONG									= 0xF00A;
	public static final int DLL_RETCODE_FAIL											= 0xF00B;
	public static final int DLL_RETCODE_ERROR_STX										= 0xF00C;
	public static final int DLL_RETCODE_ERROR_ETX										= 0xF00D;
	public static final int DLL_RETCODE_ERROR_CRC										= 0xF00E;
	public static final int DLL_RETCODE_ERROR_MSGTYPE									= 0xF00F;
	public static final int DLL_RETCODE_ERROR_ERR										= 0xF010;
	public static final int DLL_RETCODE_ERROR_SID										= 0xF011;
	public static final int DLL_RETCODE_ERROR_EOT										= 0xF012;
	public static final int DLL_RETCODE_STATUS_CODE_ERR									= 0xF013;
	public static final int DLL_RETCODE_LEN_TOO_SHORT									= 0xF014;
	public static final int DLL_RETCODE_DEMO_VERSION									= 0xF015;
	public static final int DLL_RETCODE_FILE_OPEN_ERR									= 0xF016;
	public static final int DLL_RETCODE_KEY_ERROR										= 0xF017;
	public static final int DLL_RETCODE_TERMSN_ERROR									= 0xF018;
	public static final int DLL_RETCODE_ERROR_LRC										= 0xF019;
	public static final int DLL_RETCODE_REC_EOT_OK										= 0xF01A;
	public static final int DLL_RETCODE_ACK_NOT_RECEIVED								= 0xF01B;
	public static final int DLL_RETCODE_RECV_BUSY										= 0xF01C;
	public static final int DLL_RETCODE_RECV_ACK										= 0xF01D;
	public static final int DLL_RETCODE_RECV_NAK										= 0xF01E;
	public static final int DLL_RETCODE_INTERCHAR_TIMEOUT								= 0xF01F;
	public static final int DLL_RETCODE_PAIRING_REQUIRED								= 0xF020;
	public static final int DLL_RETCODE_WORG_PING_RETURN								= 0xF021;
	public static final int DLL_RETCODE_MEMORY_ERROR									= 0xF022;
	public static final int DLL_RETCODE_ECR_VALUE_ERROR									= 0xF023;
	public static final int DLL_RETCODE_PORT_OPEN_ERROR									= 0xF024;
	public static final int DLL_RETCODE_JSON_ERROR										= 0xF025;
	public static final int DLL_RETCODE_ECR_VERSION_TOO_OLD								= 0xF026;
	public static final int DLL_RETCODE_PROCESSING_NUMBER_MISMATCH						= 0xF027;
	public static final int DLL_RETCODE_DECRYPTION_ERR									= 0xF028;
	public static final int DLL_RETCODE_HASH_CALCULATE_ERROR							= 0xF029;
	public static final int DLL_RETCODE_INVALID_STRUCT_SIZE								= 0xF02A;
	public static final int DLL_RETCODE_COMPRESSION_ERR									= 0xF02B;
	public static final int DLL_RETCODE_DECOMPRESSION_ERR								= 0xF02C;
	public static final int DLL_RETCODE_PRIME_NUMBER_ERR								= 0xF02D;
	public static final int DLL_RETCODE_ENCRYPTION_ERR									= 0xF02E;
	public static final int DLL_RETCODE_PADDING_ERROR									= 0xF02F;
	public static final int DLL_RETCODE_ENC_DEC_MISTMATCH_ERROR							= 0xF030;
	public static final int DLL_RETCODE_INVALID_AMOUNT									= 0xF031;
	public static final int DLL_RETCODE_OLD_STYLE_FUNCTION_CALL_ERROR					= 0xF032;
	public static final int DLL_RETCODE_NEW_STYLE_FUNCTION_CALL_ERROR					= 0xF033;
	public static final int DLL_RETCODE_INTERFACE_HANDLE_ERROR							= 0xF034;
	public static final int DLL_RETCODE_INVALID_INTERFACE_HANDLE						= 0xF035;
	public static final int DLL_RETCODE_XML_FILE_ERROR									= 0xF036;
	public static final int DLL_RETCODE_INTERFACE_ID_ALREADY_EXIST						= 0xF037;
	public static final int DLL_RETCODE_PRINTER_FRONT_STATION_BUFFER_ERROR				= 0xF038;
	public static final int DLL_RETCODE_INVALID_CERTIFICATE_DLL							= 0xF039;
	public static final int DLL_RETCODE_INVALID_CERTIFICATE_ECR							= 0xF03A;
	public static final int DLL_RETCODE_INVALID_SIGN_DLL								= 0xF03B;
	public static final int DLL_RETCODE_INVALID_KCV										= 0xF03C;
	public static final int DLL_RETCODE_INVALID_SIGN_ECR								= 0xF03D;
	public static final int DLL_RETCODE_MAX_BUFFER_OVERFLOW								= 0xF03E;
	public static final int DLL_RETCODE_KEEP_ALIVE_TIMEOUT								= 0xF03F;
	public static final int DLL_RETCODE_NOT_SUPPORTED									= 0xF040;
}


class DescDefines
{
    public static final String TRAN_RESULT_OK = "TRAN_RESULT_OK = 0x0000";
    public static final String TRAN_RESULT_NOT_ALLOWED = "TRAN_RESULT_NOT_ALLOWED = 0x0001";
    public static final String TRAN_RESULT_TIMEOUT = "TRAN_RESULT_TIMEOUT = 0x0002";
    public static final String TRAN_RESULT_USER_ABORT = "TRAN_RESULT_USER_ABORT = 0x0004";
    public static final String TRAN_RESULT_EKU_PROBLEM = "TRAN_RESULT_EKU_PROBLEM = 0x0008";
    public static final String TRAN_RESULT_CONTINUE = "TRAN_RESULT_CONTINUE = 0x0010";
    public static final String TRAN_RESULT_NO_PAPER = "TRAN_RESULT_NO_PAPER = 0x0020";

    public static final String APP_ERR_FISCAL_EXCHANGE_RATES_NOT_FOUND = "APP_ERR_FISCAL_EXCHANGE_RATES_NOT_FOUND = 2000";
    public static final String APP_ERR_FISCAL_ALREADY_CANCELED_ITEM = "APP_ERR_FISCAL_ALREADY_CANCELED_ITEM = 2001";
    public static final String APP_ERR_FISCAL_INVALID_DISCOUNT_RATE = "APP_ERR_FISCAL_INVALID_DISCOUNT_RATE = 2002";
    public static final String APP_ERR_FISCAL_DISCOUNT_RATE_NOT_SET = "APP_ERR_FISCAL_DISCOUNT_RATE_NOT_SET = 2003";
    public static final String APP_ERR_FISCAL_INVALID_INCREASE_RATE = "APP_ERR_FISCAL_INVALID_INCREASE_RATE = 2004";
    public static final String APP_ERR_FISCAL_INCREASE_RATE_NOT_SET = "APP_ERR_FISCAL_INCREASE_RATE_NOT_SET = 2005";
    public static final String APP_ERR_FISCAL_DISCOUNT_ALREADY_DONE = "APP_ERR_FISCAL_DISCOUNT_ALREADY_DONE = 2006";
    public static final String APP_ERR_FISCAL_INCREASE_ALREADY_DONE = "APP_ERR_FISCAL_INCREASE_ALREADY_DONE = 2007";
    public static final String APP_ERR_FISCAL_NO_PRETOTAL = "APP_ERR_FISCAL_NO_PRETOTAL = 2008";
    public static final String APP_ERR_FISCAL_INVALID_ENTRY = "APP_ERR_FISCAL_INVALID_ENTRY = 2009";
    public static final String APP_ERR_FISCAL_KDV_RATE_NOT_FOUND = "APP_ERR_FISCAL_KDV_RATE_NOT_FOUND = 2010";
    public static final String APP_ERR_FISCAL_TICKET_LIMIT_EXCEED = "APP_ERR_FISCAL_TICKET_LIMIT_EXCEED = 2011";
    public static final String APP_ERR_FISCAL_SALE_ITEM_LIMIT_EXCEED = "APP_ERR_FISCAL_SALE_ITEM_LIMIT_EXCEED = 2012";
    public static final String APP_ERR_FISCAL_CASH_ENTRY_LIMIT_EXCED = "APP_ERR_FISCAL_CASH_ENTRY_LIMIT_EXCED = 2013";
    public static final String APP_ERR_FISCAL_INVALID_CURRENCY = "APP_ERR_FISCAL_INVALID_CURRENCY = 2014";
    public static final String APP_ERR_NOT_ALLOWED_BEFORE_GIB_CONNECTION = "APP_ERR_NOT_ALLOWED_BEFORE_GIB_CONNECTION = 2015";
    public static final String APP_ERR_KISIM_FIYAT_LIMITI_ASILAMAZ = "APP_ERR_KISIM_FIYAT_LIMITI_ASILAMAZ = 2016";
    public static final String APP_ERR_FISCAL_DEPARTMENT_ENTRY_INCOMPLETE = "APP_ERR_FISCAL_DEPARTMENT_ENTRY_INCOMPLETE = 2017";
    public static final String APP_ERR_FISCAL_EXCHANGE_RATE_NOT_FOUND = "APP_ERR_FISCAL_EXCHANGE_RATE_NOT_FOUND = 2018";
    public static final String APP_ERR_APL_CRC_ERROR = "APP_ERR_APL_CRC_ERROR = 2019";
    public static final String APP_ERR_APL_VERS_ERROR = "APP_ERR_APL_VERS_ERROR = 2020";
    public static final String APP_ERR_APL_COMPLETE_PAYMENT = "APP_ERR_APL_COMPLETE_PAYMENT = 2021";
    public static final String APP_ERR_APL_CREDIT_CANNOT_BIGGER_THAN_REMAIN_AMOUNT = "APP_ERR_APL_CREDIT_CANNOT_BIGGER_THAN_REMAIN_AMOUNT = 2022";
    public static final String APP_ERR_APL_CREDIT_PAID_AMOUNT_MISSING = "APP_ERR_APL_CREDIT_PAID_AMOUNT_MISSING = 2023";
    public static final String APP_ERR_APL_CREDIT_PAID_ONLY_ONE_TIME_ALLOWED = "APP_ERR_APL_CREDIT_PAID_ONLY_ONE_TIME_ALLOWED = 2024";
    public static final String APP_ERR_FISCAL_INVALID_DATE_TIME = "APP_ERR_FISCAL_INVALID_DATE_TIME = 2025";
    public static final String APP_ERR_MAX_RECEIPT_COUNTER_REACHED = "APP_ERR_MAX_RECEIPT_COUNTER_REACHED = 2026";
    public static final String APP_ERR_APL_NO_PAPER = "APP_ERR_APL_NO_PAPER = 2027";
    public static final String APP_ERR_APL_PARAMETRE_NOT_FOUND = "APP_ERR_APL_PARAMETRE_NOT_FOUND = 2028";
    public static final String APP_ERR_EKU_SOFTWARE_VERSION = "APP_ERR_EKU_SOFTWARE_VERSION = 2029";
    public static final String APP_ERR_FISCAL_SOFTWARE_VERSION = "APP_ERR_FISCAL_SOFTWARE_VERSION = 2030";
    public static final String APP_ERR_CIHAZ_GECICI_OLARAK_KAPATILDI = "APP_ERR_CIHAZ_GECICI_OLARAK_KAPATILDI = 2031";
    public static final String APP_ERR_CIHAZ_ACIL_MODA_ALINMIS = "APP_ERR_CIHAZ_ACIL_MODA_ALINMIS = 2032";
    public static final String APP_ERR_APL_DAILY_MEMORY_DELETED = "APP_ERR_APL_DAILY_MEMORY_DELETED = 2033";
    public static final String APP_ERR_APL_CUMULATIVE_COUNTER_FULL = "APP_ERR_APL_CUMULATIVE_COUNTER_FULL = 2034";
    public static final String APP_ERR_APL_OUT_OF_SERVICE = "APP_ERR_APL_OUT_OF_SERVICE = 2035";
    public static final String APP_ERR_APL_OUT_OF_SERVICE_WARNING = "APP_ERR_APL_OUT_OF_SERVICE_WARNING = 2036";
    public static final String APP_ERR_APL_FONT_FILE_LOAD = "APP_ERR_APL_FONT_FILE_LOAD = 2037";
    public static final String APP_ERR_APL_FONT_POLICY_NOT_FOUND = "APP_ERR_APL_FONT_POLICY_NOT_FOUND = 2038";
    public static final String APP_ERR_APL_CREDIT_PAY_AMOUNT_ZERO = "APP_ERR_APL_CREDIT_PAY_AMOUNT_ZERO = 2039";
    public static final String APP_ERR_APL_DB_ERROR = "APP_ERR_APL_DB_ERROR = 2040";
    public static final String APP_ERR_TICKET_SALE_ITEM_LIMIT_EXCEED = "APP_ERR_TICKET_SALE_ITEM_LIMIT_EXCEED = 2041";
    public static final String APP_ERR_APL_PIN_ERROR = "APP_ERR_APL_PIN_ERROR = 2042";
    public static final String APP_ERR_PAYMENT_APPL_MESSAGE = "APP_ERR_PAYMENT_APPL_MESSAGE = 2043";
    public static final String APP_ERR_APL_DB_DUBLICATE_RECORD = "APP_ERR_APL_DB_DUBLICATE_RECORD = 2044";
    public static final String APP_ERR_APL_TRANSACTION_CORRUPTED = "APP_ERR_APL_TRANSACTION_CORRUPTED = 2045";
    public static final String APP_ERR_APL_PAYMENT_MUST_COMPLETE = "APP_ERR_APL_PAYMENT_MUST_COMPLETE = 2046";
    public static final String APP_ERR_INVOICE_LIMIT_EXCEED = "APP_ERR_INVOICE_LIMIT_EXCEED = 2047";
    public static final String APP_ERR_TRANSACTION_NOT_SAVED = "APP_ERR_TRANSACTION_NOT_SAVED = 2048";
    public static final String APP_ERR_INVOICE_NO_ENTRY = "APP_ERR_INVOICE_NO_ENTRY = 2049";
    public static final String APP_ERR_INACTIVE_PERIPHERAL = "APP_ERR_INACTIVE_PERIPHERAL = 2050";
    public static final String APP_ERR_DEVICE_CLOSED = "APP_ERR_DEVICE_CLOSED = 2051";
    public static final String APP_ERR_TEST_REQUIRED = "APP_ERR_TEST_REQUIRED = 2052";
    public static final String APP_ERR_CASHIER_ENTRY_REQUIRED = "APP_ERR_CASHIER_ENTRY_REQUIRED = 2053";
    public static final String APP_ERR_FLIGHT_MODE = "APP_ERR_FLIGHT_MODE = 2054";
    public static final String APP_ERR_NO_PARAM = "APP_ERR_NO_PARAM = 2055";
    public static final String APP_ERR_NOT_FISCAL = "APP_ERR_NOT_FISCAL = 2056";
    public static final String APP_ERR_FISCAL_RECORD_NOT_AVAILABLE = "APP_ERR_FISCAL_RECORD_NOT_AVAILABLE = 2057";
    public static final String APP_ERR_CITIZEN_NUMBER_ENTRY = "APP_ERR_CITIZEN_NUMBER_ENTRY = 2058";
    public static final String APP_ERR_INVALID_USER_MODE = "APP_ERR_INVALID_USER_MODE = 2059";
    public static final String APP_ERR_PAYMENT_NOT_ALLOWED = "APP_ERR_PAYMENT_NOT_ALLOWED = 2060";
    public static final String APP_ERR_NO_CASH = "APP_ERR_NO_CASH = 2061";
    public static final String APP_ERR_PARAMETER_DW_ERROR_FOR_TEST = "APP_ERR_PARAMETER_DW_ERROR_FOR_TEST = 2062";
    public static final String APP_ERR_MAX_TRY_COUNTER_EXCEED = "APP_ERR_MAX_TRY_COUNTER_EXCEED = 2063";
    public static final String APP_ERR_NOT_ALLOWED = "APP_ERR_NOT_ALLOWED = 2064";
    public static final String APP_ERR_RESOURCE_PROBLEM = "APP_ERR_RESOURCE_PROBLEM = 2065";
    public static final String APP_ERR_ITEM_PRICE_NOT_EXISTS = "APP_ERR_ITEM_PRICE_NOT_EXISTS = 2066";
    public static final String APP_ERR_FIS_LIMITI_ASILAMAZ = "APP_ERR_FIS_LIMITI_ASILAMAZ = 2067";
    public static final String APP_ERR_NO_ITEM = "APP_ERR_NO_ITEM = 2068";
    public static final String APP_ERR_PAYMENT_FOUND = "APP_ERR_PAYMENT_FOUND = 2069";
    public static final String APP_ERR_MATRAHSIZ_FOUND = "APP_ERR_MATRAHSIZ_FOUND = 2070";
    public static final String APP_ERR_NOT_APPROVED = "APP_ERR_NOT_APPROVED = 2071";
    public static final String APP_ERR_ONLY_COUPON = "APP_ERR_ONLY_COUPON = 2072";
    public static final String APP_ERR_NO_AMOUNT = "APP_ERR_NO_AMOUNT = 2073";
    public static final String APP_ERR_CURRENCY_NOT_SUPPORTED = "APP_ERR_CURRENCY_NOT_SUPPORTED = 2074";
    public static final String APP_ERR_TICKET_TOTAL_CANNOT_BE_ZERO = "APP_ERR_TICKET_TOTAL_CANNOT_BE_ZERO = 2075";
    public static final String APP_ERR_INVOICE_NOT_ALLOWED = "APP_ERR_INVOICE_NOT_ALLOWED = 2076";
    public static final String APP_ERR_TICKET_HEADER_NOT_PRINTED = "APP_ERR_TICKET_HEADER_NOT_PRINTED = 2077";
    public static final String APP_ERR_TICKET_HEADER_ALREADY_PRINTED = "APP_ERR_TICKET_HEADER_ALREADY_PRINTED = 2078";
    public static final String APP_ERR_PLU_NOT_FOUND = "APP_ERR_PLU_NOT_FOUND = 2079";
    public static final String APP_ERR_ALREADY_DONE = "APP_ERR_ALREADY_DONE = 2080";
    public static final String APP_ERR_INVALID_PARAMETER_TAXINDEX = "APP_ERR_INVALID_PARAMETER_TAXINDEX = 2081";
    public static final String APP_ERR_INVALID_PARAMETER_TAXRATE = "APP_ERR_INVALID_PARAMETER_TAXRATE = 2082";
    public static final String APP_ERR_MISSING_PARAMETER = "APP_ERR_MISSING_PARAMETER = 2083";
    public static final String APP_ERR_MISMATCH_PARAMETER = "APP_ERR_MISMATCH_PARAMETER = 2084";
    public static final String APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_NO_MORE_ERROR_CODE = "APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_NO_MORE_ERROR_CODE = 2085";
    public static final String APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_MORE_ERROR_CODE = "APP_ERR_PAYMENT_NOT_SUCCESSFUL_AND_MORE_ERROR_CODE = 2086";
    public static final String APP_ERR_INVALID_PAYMENT_TYPE = "APP_ERR_INVALID_PAYMENT_TYPE = 2087";
    public static final String APP_ERR_VAS_NOT_AVAILABLE = "APP_ERR_VAS_NOT_AVAILABLE = 2088";
    public static final String APP_ERR_INVALID_CAR_IDENTIFICATION = "APP_ERR_INVALID_CAR_IDENTIFICATION = 2089";
    public static final String APP_ERR_CHECK_IP_ADDRES_FORMAT = "APP_ERR_CHECK_IP_ADDRES_FORMAT = 2100";
    public static final String APP_ERR_WRONG_SERVICE_CARD_PIN = "APP_ERR_WRONG_SERVICE_CARD_PIN = 2101";
    public static final String APP_ERR_UNDEFINED_COM_INTERFACE = "APP_ERR_UNDEFINED_COM_INTERFACE = 2102";
    public static final String APP_ERR_BASE_NOT_FOUND = "APP_ERR_BASE_NOT_FOUND = 2103";
    public static final String APP_ERR_ETHERNET_MODUL_CALISMIYOR = "APP_ERR_ETHERNET_MODUL_CALISMIYOR = 2104";
    public static final String APP_ERR_ETHERNET_NOT_PLUGGED = "APP_ERR_ETHERNET_NOT_PLUGGED = 2105";
    public static final String APP_ERR_ETHERNET_BASE_NOT_READY = "APP_ERR_ETHERNET_BASE_NOT_READY = 2106";
    public static final String APP_ERR_ETHERNET_OUT_OF_BASE = "APP_ERR_ETHERNET_OUT_OF_BASE = 2107";
    public static final String APP_ERR_GPRS_ERROR_NO_SIM = "APP_ERR_GPRS_ERROR_NO_SIM = 2108";
    public static final String APP_ERR_GPRS_APN = "APP_ERR_GPRS_APN = 2109";
    public static final String APP_ERR_GPRS_BAD_PIN = "APP_ERR_GPRS_BAD_PIN = 2110";
    public static final String APP_ERR_GPRS_SIM_LOCK = "APP_ERR_GPRS_SIM_LOCK = 2111";
    public static final String APP_ERR_GPRS_NO_SIGNAL = "APP_ERR_GPRS_NO_SIGNAL = 2112";
    public static final String APP_ERR_GPRS_DISCONNCTED = "APP_ERR_GPRS_DISCONNCTED = 2113";
    public static final String APP_ERR_GPRS_UNDEFINED = "APP_ERR_GPRS_UNDEFINED = 2114";
    public static final String APP_ERR_SSL_PROFILE = "APP_ERR_SSL_PROFILE = 2115";
    public static final String APP_ERR_WRONG_SERVICE_CARD = "APP_ERR_WRONG_SERVICE_CARD = 2116";
    public static final String APP_ERR_COMMUNICATION_CHANNEL_NOT_DEFINED = "APP_ERR_COMMUNICATION_CHANNEL_NOT_DEFINED = 2117";
    public static final String APP_ERR_GIB_ROOT_CERT_NOT_FOUND = "APP_ERR_GIB_ROOT_CERT_NOT_FOUND = 2118";
    public static final String APP_ERR_GIB_SUB_ROOT_CERT_NOT_FOUND = "APP_ERR_GIB_SUB_ROOT_CERT_NOT_FOUND = 2119";
    public static final String APP_ERR_TSM_ROOT_CERT_NOT_FOUND = "APP_ERR_TSM_ROOT_CERT_NOT_FOUND = 2120";
    public static final String APP_ERR_TSM_SUB_ROOT_CERT_NOT_FOUND = "APP_ERR_TSM_SUB_ROOT_CERT_NOT_FOUND = 2121";
    public static final String APP_ERR_OKTEM_CERT_NOT_FOUND = "APP_ERR_OKTEM_CERT_NOT_FOUND = 2122";
    public static final String APP_ERR_GIB_SIGN_CERT_NOT_FOUND = "APP_ERR_GIB_SIGN_CERT_NOT_FOUND = 2123";
    public static final String APP_ERR_GIB_SIFRE_CERT_NOT_FOUND = "APP_ERR_GIB_SIFRE_CERT_NOT_FOUND = 2124";
    public static final String APP_ERR_TSM_SIGN_CERT_NOT_FOUND = "APP_ERR_TSM_SIGN_CERT_NOT_FOUND = 2125";
    public static final String APP_ERR_PACK_GIB = "APP_ERR_PACK_GIB = 2126";
    public static final String APP_ERR_GIB_CERT = "APP_ERR_GIB_CERT = 2127";
    public static final String APP_ERR_DATABASE_SILINMIS = "APP_ERR_DATABASE_SILINMIS = 2128";

    public static final String APP_ERR_FILE_COPY = "APP_ERR_FILE_COPY = 2220";
    public static final String APP_ERR_FILE_OPEN = "APP_ERR_FILE_OPEN = 2221";
    public static final String APP_ERR_FILE_READ = "APP_ERR_FILE_READ = 2222";
    public static final String APP_ERR_FILE_WRITE = "APP_ERR_FILE_WRITE = 2223";
    public static final String APP_ERR_BUFFER_MALLOC = "APP_ERR_BUFFER_MALLOC = 2224";
    public static final String APP_ERR_FILE_SEEK = "APP_ERR_FILE_SEEK = 2225";
    public static final String APP_ERR_FILE_EOF = "APP_ERR_FILE_EOF = 2226";

    public static final String APP_ERR_GMP_PROTOCOL = "APP_ERR_GMP_PROTOCOL = 2230";
    public static final String APP_ERR_GMP_VERIFICATION = "APP_ERR_GMP_VERIFICATION = 2231";
    public static final String APP_ERR_GMP_LRC = "APP_ERR_GMP_LRC = 2232";
    public static final String APP_ERR_COMPONENT_ABSENT = "APP_ERR_COMPONENT_ABSENT = 2233";
    public static final String APP_ERR_SQL = "APP_ERR_SQL = 2234";
    public static final String APP_ERR_GMP_RESPONSE_CODE_ERROR = "APP_ERR_GMP_RESPONSE_CODE_ERROR = 2235";
    public static final String APP_ERR_FRAM_Z_REPORT_UPDATE = "APP_ERR_FRAM_Z_REPORT_UPDATE = 2236";
    public static final String APP_ERR_DAILY_WRITE = "APP_ERR_DAILY_WRITE = 2237";
    public static final String APP_ERR_FISCAL_CUMULATIVE_WRITE = "APP_ERR_FISCAL_CUMULATIVE_WRITE = 2238";
    public static final String APP_ERR_GMP_PROTOCOL_CANNOT_RECEIVED_FULL_MESSAGE = "APP_ERR_GMP_PROTOCOL_CANNOT_RECEIVED_FULL_MESSAGE = 2239";
    public static final String APP_ERR_GMP_PROTOCOL_TPDU_NOT_RECEIVED = "APP_ERR_GMP_PROTOCOL_TPDU_NOT_RECEIVED = 2240";
    public static final String APP_ERR_GMP_AUTO_FICAL_FAILED = "APP_ERR_GMP_AUTO_FICAL_FAILED = 2241";
    public static final String APP_ERR_GMP_EFTPOS_BAGLANTISI_BULUNAMADI = "APP_ERR_GMP_EFTPOS_BAGLANTISI_BULUNAMADI = 2242";
    public static final String APP_ERR_GMP_GIB_KEY_IMZA_VERIFICATION = "APP_ERR_GMP_GIB_KEY_IMZA_VERIFICATION = 2243";
    public static final String APP_ERR_GMP_GIB_SHA2_IDENTIFIER = "APP_ERR_GMP_GIB_SHA2_IDENTIFIER = 2244";
    public static final String APP_ERR_GMP_MISSING_GROUP = "APP_ERR_GMP_MISSING_GROUP = 2245";
    public static final String APP_ERR_GMP_BUFFER_ERROR = "APP_ERR_GMP_BUFFER_ERROR = 2246";
    public static final String APP_ERR_GMP_PADDING_ERROR = "APP_ERR_GMP_PADDING_ERROR = 2247";
    public static final String APP_ERR_GMP_TREK_TRAK_MISMATCH = "APP_ERR_GMP_TREK_TRAK_MISMATCH = 2248";
    public static final String APP_ERR_GMP_TSM_KEY_IMZA_VERIFICATION = "APP_ERR_GMP_TSM_KEY_IMZA_VERIFICATION = 2249";
    public static final String APP_ERR_GMP_NEGATIVE_TRANSACTION = "APP_ERR_GMP_NEGATIVE_TRANSACTION = 2250";

    public static final String APP_ERR_GMP3_UNDEFINED_OKC_MODEL = "APP_ERR_GMP3_UNDEFINED_OKC_MODEL = 2301";
    public static final String APP_ERR_GMP3_UNDEFINED_OKC_VENDOR = "APP_ERR_GMP3_UNDEFINED_OKC_VENDOR = 2302";
    public static final String APP_ERR_GMP3_UNDEFINED_OKC_SICILNO = "APP_ERR_GMP3_UNDEFINED_OKC_SICILNO = 2303";
    public static final String APP_ERR_GMP3_UNDEFINED_CIHAZ_MODEL = "APP_ERR_GMP3_UNDEFINED_CIHAZ_MODEL = 2304";        //2304,
    public static final String APP_ERR_GMP3_UNDEFINED_CIHAZ_VENDOR = "APP_ERR_GMP3_UNDEFINED_CIHAZ_VENDOR = 2305";
    public static final String APP_ERR_GMP3_UNDEFINED_CIHAZ_SERINO = "APP_ERR_GMP3_UNDEFINED_CIHAZ_SERINO = 2306";
    public static final String APP_ERR_GMP3_UNDEFINED_MSG_TYPE = "APP_ERR_GMP3_UNDEFINED_MSG_TYPE = 2307";            // 2307
    public static final String APP_ERR_GMP3_UNDEFINED_MISSING_PARAMETER = "APP_ERR_GMP3_UNDEFINED_MISSING_PARAMETER = 2308";
    public static final String APP_ERR_GMP3_INVALID_SEQUENCE_NUMBER = "APP_ERR_GMP3_INVALID_SEQUENCE_NUMBER = 2309";
    public static final String APP_ERR_GMP3_INVALID_DATE_TIME = "APP_ERR_GMP3_INVALID_DATE_TIME = 2310";
    public static final String APP_ERR_GMP3_MISSING_TDES_KEY = "APP_ERR_GMP3_MISSING_TDES_KEY = 2311";
    public static final String APP_ERR_GMP3_INVALID_KCV = "APP_ERR_GMP3_INVALID_KCV = 2312";
    public static final String APP_ERR_GMP3_UNDEFINED_STATUS = "APP_ERR_GMP3_UNDEFINED_STATUS = 2313";
    public static final String APP_ERR_GMP3_TIMEOUT = "APP_ERR_GMP3_TIMEOUT = 2314";
    public static final String APP_ERR_GMP3_CERTIFICATE = "APP_ERR_GMP3_CERTIFICATE = 2315";
    public static final String APP_ERR_GMP3_VERIFY = "APP_ERR_GMP3_VERIFY = 2316";            // 2316
    public static final String APP_ERR_GMP3_INVALID_HANDLE = "APP_ERR_GMP3_INVALID_HANDLE = 2317";            // Handle var fakat yanlış
    public static final String APP_ERR_GMP3_CRC = "APP_ERR_GMP3_CRC = 2318";
    public static final String APP_ERR_GMP3_LEN = "APP_ERR_GMP3_LEN = 2319";
    public static final String APP_ERR_GMP3_STX = "APP_ERR_GMP3_STX = 2320";
    public static final String APP_ERR_GMP3_ETX = "APP_ERR_GMP3_ETX = 2321";
    public static final String APP_ERR_GMP3_NACK = "APP_ERR_GMP3_NACK = 2322";
    public static final String APP_ERR_GMP3_ACK = "APP_ERR_GMP3_ACK = 2323";
    public static final String APP_ERR_GMP3_RECEIVE = "APP_ERR_GMP3_RECEIVE = 2324";
    public static final String APP_ERR_GMP3_SEND = "APP_ERR_GMP3_SEND = 2325";
    public static final String APP_ERR_GMP3_PARSE = "APP_ERR_GMP3_PARSE = 2326";
    public static final String APP_ERR_GMP3_USER_BREAK = "APP_ERR_GMP3_USER_BREAK = 2327";
    public static final String APP_ERR_GMP3_PROTOCOL = "APP_ERR_GMP3_PROTOCOL = 2328";
    public static final String APP_ERR_GMP3_PAIRING_REQUIRED = "APP_ERR_GMP3_PAIRING_REQUIRED = 2329";
    public static final String APP_ERR_GMP3_UNKNOWN_DEVICE = "APP_ERR_GMP3_UNKNOWN_DEVICE = 2330";            //2330
    public static final String APP_ERR_GMP3_VERSION_MISMATCH = "APP_ERR_GMP3_VERSION_MISMATCH = 2331";            //2331
    public static final String APP_ERR_GMP3_NO_PRIME_NUMBER = "APP_ERR_GMP3_NO_PRIME_NUMBER = 2332";            //2332
    public static final String APP_ERR_GMP3_PERMISSION = "APP_ERR_GMP3_PERMISSION = 2333";                //2333
    public static final String APP_ERR_GMP3_INCORRECT_DEVICE = "APP_ERR_GMP3_INCORRECT_DEVICE = 2334";                //2334
    public static final String APP_ERR_GMP3_MEMORY_READ_ERROR = "APP_ERR_GMP3_MEMORY_READ_ERROR = 2335";
    public static final String APP_ERR_GMP3_MEMORY_WRITE_ERROR = "APP_ERR_GMP3_MEMORY_WRITE_ERROR = 2336";
    public static final String APP_ERR_GMP3_MEMORY_ERASE_ERROR = "APP_ERR_GMP3_MEMORY_ERASE_ERROR = 2337";
    public static final String APP_ERR_GMP3_APP_CHECKSUM_MISMATCH = "APP_ERR_GMP3_APP_CHECKSUM_MISMATCH = 2338";                // 2338
    public static final String APP_ERR_GMP3_APP_DATE_EXPIRED = "APP_ERR_GMP3_APP_DATE_EXPIRED = 2339";        // 2339
    public static final String APP_ERR_GMP3_TCP_RECEIVE_ERROR = "APP_ERR_GMP3_TCP_RECEIVE_ERROR = 2340";
    public static final String APP_ERR_GMP3_NO_HANDLE = "APP_ERR_GMP3_NO_HANDLE = 2341";   // Handle NULL veya hiç bulunamadı
    public static final String APP_ERR_GMP3_PING = "APP_ERR_GMP3_PING = 2342";
    public static final String APP_ERR_GMP3_TCP_NO_DATA = "APP_ERR_GMP3_TCP_NO_DATA= 2343";
    public static final String APP_ERR_GMP3_EOT = "APP_ERR_GMP3_EOT= 2344";
    public static final String APP_ERR_GMP3_TAG_NOT_AVAILABLE = "APP_ERR_GMP3_TAG_NOT_AVAILABLE= 2345";
    public static final String APP_ERR_GMP3_ENCRYPT_DECRYPT = "APP_ERR_GMP3_ENCRYPT_DECRYPT= 2346";
    public static final String APP_ERR_GMP3_MESSAGE_TYPE = "APP_ERR_GMP3_MESSAGE_TYPE= 2347";
    public static final String APP_ERR_GMP3_INVALID_MERCHANT_UNIQUE_ID = "APP_ERR_GMP3_INVALID_MERCHANT_UNIQUE_ID= 2349";
    public static final String APP_ERR_GMP3_INVALID_BRANCH_UNIQUE_ID = "APP_ERR_GMP3_INVALID_BRANCH_UNIQUE_ID = 2350";

    public static final String APP_ERR_GMP3_PAYMENT_KDV_NOT_AVAILABLE = "APP_ERR_GMP3_PAYMENT_KDV_NOT_AVAILABLE = 2400";
    public static final String APP_ERR_GMP3_ITEM_NOT_AVAILABLE = "APP_ERR_GMP3_ITEM_NOT_AVAILABLE = 2401";
    public static final String APP_ERR_GMP3_OKC_KISIM_UNKNOWN = "APP_ERR_GMP3_OKC_KISIM_UNKNOWN = 2402";
    public static final String APP_ERR_GMP3_DOVIZ_UNKNOWN = "APP_ERR_GMP3_DOVIZ_UNKNOWN = 2403";
    public static final String APP_ERR_GMP3_KASIYER_UNKNOWN = "APP_ERR_GMP3_KASIYER_UNKNOWN = 2404";
    public static final String APP_ERR_GMP3_FUNC_OKC_PARAMETRE = "APP_ERR_GMP3_FUNC_OKC_PARAMETRE = 2405";
    public static final String APP_ERR_GMP3_FATURA_ODEME_PARAMETRE = "APP_ERR_GMP3_FATURA_ODEME_PARAMETRE = 2406";
    public static final String APP_ERR_GMP3_Z_RAPOR = "APP_ERR_GMP3_Z_RAPOR = 2407";
    public static final String APP_ERR_GMP3_X_RAPOR = "APP_ERR_GMP3_X_RAPOR = 2408";
    public static final String APP_ERR_GMP3_BATTERY_LEVEL = "APP_ERR_GMP3_BATTERY_LEVEL = 2409";
    public static final String APP_ERR_GMP3_EKU_RAPOR_TYPE = "APP_ERR_GMP3_EKU_RAPOR_TYPE = 2410";
    public static final String APP_ERR_GMP3_EKU_STATE = "APP_ERR_GMP3_EKU_STATE = 2411";
    public static final String APP_ERR_GMP3_ECR_NOT_FISCAL = "APP_ERR_GMP3_ECR_NOT_FISCAL = 2412";
    public static final String APP_ERR_GMP3_NO_FUNCTION = "APP_ERR_GMP3_NO_FUNCTION = 2413";
    public static final String APP_ERR_GMP3_MALI_KUMULATIF_RAPOR = "APP_ERR_GMP3_MALI_KUMULATIF_RAPOR = 2414";
    public static final String APP_ERR_GMP3_SINEMA_BILET_DESTEGI = "APP_ERR_GMP3_SINEMA_BILET_DESTEGI = 2415";
    public static final String APP_ERR_GMP3_PARAMETRE_HATASI = "APP_ERR_GMP3_PARAMETRE_HATASI = 2416";
    public static final String APP_ERR_GMP3_Z_REQUIRED = "APP_ERR_GMP3_Z_REQUIRED = 2417";
    public static final String APP_ERR_GMP3_UNSUPPORTED = "APP_ERR_GMP3_UNSUPPORTED = 2418";
    public static final String APP_ERR_GMP3_SINEMA_URUN_SAYISI = "APP_ERR_GMP3_SINEMA_URUN_SAYISI = 2419";
    public static final String APP_ERR_GMP3_PAYMENT_CANCELLED = "APP_ERR_GMP3_PAYMENT_CANCELLED = 2420";
    public static final String APP_ERR_GMP3_ITEM_URUN_SAYISI = "APP_ERR_GMP3_ITEM_URUN_SAYISI = 2421";
    public static final String APP_ERR_GMP3_RESOURCE_PROBLEM = "APP_ERR_GMP3_RESOURCE_PROBLEM = 2422";
    public static final String APP_ERR_GMP3_PLU_NOT_FOUND = "APP_ERR_GMP3_PLU_NOT_FOUND = 2423";
    public static final String APP_ERR_GMP3_NOT_PROPER_DISCOUNT = "APP_ERR_GMP3_NOT_PROPER_DISCOUNT = 2424";
    public static final String APP_ERR_GMP3_BIRIM_NOT_FOUND = "APP_ERR_GMP3_BIRIM_NOT_FOUND = 2425";
    public static final String APP_ERR_GMP3_MIKTAR_NOT_FOUND = "APP_ERR_GMP3_MIKTAR_NOT_FOUND = 2426";
    public static final String APP_ERR_GMP3_URUN_ADI_NOT_FOUND = "APP_ERR_GMP3_URUN_ADI_NOT_FOUND = 2427";
    public static final String APP_ERR_GMP3_TUTAR_NOT_FOUND = "APP_ERR_GMP3_TUTAR_NOT_FOUND = 2428";
    public static final String APP_ERR_GMP3_UNKNOWN_ISLEM_TIPI = "APP_ERR_GMP3_UNKNOWN_ISLEM_TIPI = 2429";
    public static final String APP_ERR_GMP3_VERGI_NOT_AVAILABLE = "APP_ERR_GMP3_VERGI_NOT_AVAILABLE = 2430";
    public static final String APP_ERR_GMP3_ISLEM_NOT_ALLOWED = "APP_ERR_GMP3_ISLEM_NOT_ALLOWED = 2431";
    public static final String APP_ERR_GMP3_CURRENCY_NOT_AVAILABLE = "APP_ERR_GMP3_CURRENCY_NOT_AVAILABLE = 2432";
    public static final String APP_ERR_GMP3_FIS_ITEM_NOT_ALLOWED = "APP_ERR_GMP3_FIS_ITEM_NOT_ALLOWED = 2433";
    public static final String APP_ERR_GMP3_FATURA_PARAMETER_MISSING = "APP_ERR_GMP3_FATURA_PARAMETER_MISSING = 2434";
    public static final String APP_ERR_GMP3_FATURA_TARIHI_MISSING = "APP_ERR_GMP3_FATURA_TARIHI_MISSING = 2435";
    public static final String APP_ERR_GMP3_TUTAR_NOT_REQUIRED = "APP_ERR_GMP3_TUTAR_NOT_REQUIRED = 2436";
    public static final String APP_ERR_GMP3_TUTAR_REQUIRED = "APP_ERR_GMP3_TUTAR_REQUIRED = 2437";
    public static final String APP_ERR_GMP3_INCORRECT_PASSWORD = "APP_ERR_GMP3_INCORRECT_PASSWORD = 2438";
    public static final String APP_ERR_GMP3_INACTIVE_CASHIER_INDEX = "APP_ERR_GMP3_INACTIVE_CASHIER_INDEX = 2439";
    public static final String APP_ERR_GMP3_APPLICATION_NOT_FOUND = "APP_ERR_GMP3_APPLICATION_NOT_FOUND = 2440";
    public static final String APP_ERR_GMP3_UNDEFINED_TAG = "APP_ERR_GMP3_UNDEFINED_TAG = 2441";
    public static final String APP_ERR_GMP3_SAVE_ECR_HEADER = "APP_ERR_GMP3_SAVE_ECR_HEADER = 2442";
    public static final String APP_ERR_GMP3_INVALID_RECIPT_LIMIT = "APP_ERR_GMP3_INVALID_RECIPT_LIMIT = 2443";
    public static final String APP_ERR_GMP3_ADVANCE = "APP_ERR_GMP3_ADVANCE = 2444";
    public static final String APP_ERR_GMP3_PAYMENT = "APP_ERR_GMP3_PAYMENT = 2445";
    public static final String APP_ERR_GMP3_TRANSACTION_IS_ACTIVE = "APP_ERR_GMP3_TRANSACTION_IS_ACTIVE = 2446";
    public static final String APP_ERR_GMP3_FATURA_TYPE_NOT_AVAILABLE = "APP_ERR_GMP3_FATURA_TYPE_NOT_AVAILABLE = 2447";
    public static final String APP_ERR_GMP3_FATURA_INVALID_TCK = "APP_ERR_GMP3_FATURA_INVALID_TCK = 2448";
    public static final String APP_ERR_INVALID_UNIQUE_ID = "APP_ERR_INVALID_UNIQUE_ID = 2449";
    public static final String APP_ERR_GMP3_TICKET_TYPE = "APP_ERR_GMP3_TICKET_TYPE = 2450";
    public static final String APP_ERR_GMP3_SETTINGS = "APP_ERR_GMP3_SETTINGS = 2451";
    public static final String APP_ERR_GMP3_BITMAP = "APP_ERR_GMP3_BITMAP = 2452";
    public static final String APP_ERR_GMP3_FILE = "APP_ERR_GMP3_FILE = 2453";
    public static final String APP_ERR_GMP3_ADMIN_PASSWORD_BLOCKED = "APP_ERR_GMP3_ADMIN_PASSWORD_BLOCKED = 2454";
    public static final String APP_ERR_GMP3_CASHIER_PASSWORD_BLOCKED = "APP_ERR_GMP3_CASHIER_PASSWORD_BLOCKED = 2455";
    public static final String APP_ERR_GMP3_CASHIER_PASSWORD_INCORRECT = "APP_ERR_GMP3_CASHIER_PASSWORD_INCORRECT = 2456";
    public static final String APP_ERR_GMP3_VAS_SUPPORT = "APP_ERR_GMP3_VAS_SUPPORT = 2457";
    public static final String APP_ERR_GMP3_OTOPARK_PARAMETER = "APP_ERR_GMP3_OTOPARK_PARAMETER = 2458";

    public static final String APP_ERR_GMP3_NO_EMPTY_KEY_SLOT = "APP_ERR_GMP3_NO_EMPTY_KEY_SLOT = 3000";

    // Gmp3SmartDstringReturn Codes                                                                                    "       eturn Codes
    public static final String DLL_RETCODE_PORT_NOT_OPEN = "DLL_RETCODE_PORT_NOT_OPEN = F000";
    public static final String DLL_RETCODE_ECR_DATA_ERR = "DLL_RETCODE_ECR_DATA_ERR = F001";
    public static final String DLL_RETCODE_POS_DATA_ERR = "DLL_RETCODE_POS_DATA_ERR = F002";
    public static final String DLL_RETCODE_TIMEOUT = "DLL_RETCODE_TIMEOUT = F003";
    public static final String DLL_RETCODE_DATA_SEND_ERR = "DLL_RETCODE_DATA_SEND_ERR = F004";
    public static final String DLL_RETCODE_LENGHT_ERR = "DLL_RETCODE_LENGHT_ERR = F005";
    public static final String DLL_RETCODE_SESSIONID_ERR = "DLL_RETCODE_SESSIONID_ERR = F006";
    public static final String DLL_RETCODE_DATA_RECV_ERR = "DLL_RETCODE_DATA_RECV_ERR = F007";
    public static final String DLL_RETCODE_RETRY_ERR = "DLL_RETCODE_RETRY_ERR = F008";
    public static final String DLL_RETCODE_RECV_EOT = "DLL_RETCODE_RECV_EOT = F009";
    public static final String DLL_RETCODE_LEN_TOO_LONG = "DLL_RETCODE_LEN_TOO_LONG = F00A";
    public static final String DLL_RETCODE_FAIL = "DLL_RETCODE_FAIL = F00B";
    public static final String DLL_RETCODE_ERROR_STX = "DLL_RETCODE_ERROR_STX = F00C";
    public static final String DLL_RETCODE_ERROR_ETX = "DLL_RETCODE_ERROR_ETX = F00D";
    public static final String DLL_RETCODE_ERROR_CRC = "DLL_RETCODE_ERROR_CRC = F00E";
    public static final String DLL_RETCODE_ERROR_MSGTYPE = "DLL_RETCODE_ERROR_MSGTYPE = F00F";
    public static final String DLL_RETCODE_ERROR_ERR = "DLL_RETCODE_ERROR_ERR = F010";
    public static final String DLL_RETCODE_ERROR_SID = "DLL_RETCODE_ERROR_SID = F011";
    public static final String DLL_RETCODE_ERROR_EOT = "DLL_RETCODE_ERROR_EOT = F012";
    public static final String DLL_RETCODE_STATUS_CODE_ERR = "DLL_RETCODE_STATUS_CODE_ERR = F013";
    public static final String DLL_RETCODE_LEN_TOO_SHORT = "DLL_RETCODE_LEN_TOO_SHORT = F014";
    public static final String DLL_RETCODE_DEMO_VERSION = "DLL_RETCODE_DEMO_VERSION = F015";
    public static final String DLL_RETCODE_FILE_OPEN_ERR = "DLL_RETCODE_FILE_OPEN_ERR = F016";
    public static final String DLL_RETCODE_KEY_ERROR = "DLL_RETCODE_KEY_ERROR = F017";
    public static final String DLL_RETCODE_TERMSN_ERROR = "DLL_RETCODE_TERMSN_ERROR = F018";
    public static final String DLL_RETCODE_ERROR_LRC = "DLL_RETCODE_ERROR_LRC = F019";
    public static final String DLL_RETCODE_REC_EOT_OK = "DLL_RETCODE_REC_EOT_OK = F01A";
    public static final String DLL_RETCODE_ACK_NOT_RECEIVED = "DLL_RETCODE_ACK_NOT_RECEIVED = F01B";
    public static final String DLL_RETCODE_RECV_BUSY = "DLL_RETCODE_RECV_BUSY = F01C";
    public static final String DLL_RETCODE_RECV_ACK = "DLL_RETCODE_RECV_ACK = F01D";
    public static final String DLL_RETCODE_RECV_NAK = "DLL_RETCODE_RECV_NAK = F01E";
    public static final String DLL_RETCODE_INTERCHAR_TIMEOUT = "DLL_RETCODE_INTERCHAR_TIMEOUT = F01F";
    public static final String DLL_RETCODE_PAIRING_REQUIRED = "DLL_RETCODE_PAIRING_REQUIRED = F020";
    public static final String DLL_RETCODE_WORG_PING_RETURN = "DLL_RETCODE_WORG_PING_RETURN = F021";
    public static final String DLL_RETCODE_MEMORY_ERROR = "DLL_RETCODE_MEMORY_ERROR = F022";
    public static final String DLL_RETCODE_JSON_ERROR = "DLL_RETCODE_JSON_ERROR = F025";
    public static final String DLL_RETCODE_ECR_VERSION_TOO_OLD = "DLL_RETCODE_ECR_VERSION_TOO_OLD = F026";
    public static final String DLL_RETCODE_PROCESSING_NUMBER_MISMATCH = "DLL_RETCODE_PROCESSING_NUMBER_MISMATCH = F027";
    public static final String DLL_RETCODE_DECRYPTION_ERR = "DLL_RETCODE_DECRYPTION_ERR = F028";
    public static final String DLL_RETCODE_HASH_CALCULATE_ERROR = "DLL_RETCODE_HASH_CALCULATE_ERROR = F029";
    public static final String DLL_RETCODE_INVALID_STRUCT_SIZE = "DLL_RETCODE_INVALID_STRUCT_SIZE = F02A";



    public static final String SQLITE_OK = "SQLITE_OK";	//!< Successful result
    public static final String SQLITE_ERR_INTERNAL = "SQLITE_ERR_INTERNAL"; // Internal logic error
    public static final String SQLITE_ERR_PERM = "SQLITE_ERR_PERM"; // Access permission denied
    public static final String SQLITE_ERR_ABORT = "SQLITE_ERR_ABORT"; // Callback routine requested an abort
    public static final String SQLITE_ERR_BUSY = "SQLITE_ERR_BUSY"; // The database file is locked
    public static final String SQLITE_ERR_LOCKED = "SQLITE_ERR_LOCKED"; // A table in the database is locked
    public static final String SQLITE_ERR_NOMEM = "SQLITE_ERR_NOMEM"; // A malloc() failed
    public static final String SQLITE_ERR_READONLY = "SQLITE_ERR_READONLY"; // Attempt to write a readonly database
    public static final String SQLITE_ERR_INTERRUPT = "SQLITE_ERR_INTERRUPT"; // Operation terminated by sqlite3_interrupt()
    public static final String SQLITE_ERR_IOERR = "SQLITE_ERR_IOERR"; // Some kind of disk I/O error occurred
    public static final String SQLITE_ERR_CORRUPT = "SQLITE_ERR_CORRUPT"; // The database disk image is malformed
    public static final String SQLITE_ERR_NOTFOUND = "SQLITE_ERR_NOTFOUND"; // Unknown opcode in SQLITE_file_control()
    public static final String SQLITE_ERR_FULL = "SQLITE_ERR_FULL"; // Insertion failed because database is full
    public static final String SQLITE_ERR_CANTOPEN = "SQLITE_ERR_CANTOPEN"; // Unable to open the database file
    public static final String SQLITE_ERR_PROTOCOL = "SQLITE_ERR_PROTOCOL"; // Database lock protocol error
    public static final String SQLITE_ERR_EMPTY = "SQLITE_ERR_EMPTY"; // Database is empty
    public static final String SQLITE_ERR_SCHEMA = "SQLITE_ERR_SCHEMA"; // The database schema changed
    public static final String SQLITE_ERR_TOOBIG = "SQLITE_ERR_TOOBIG"; // String or BLOB exceeds size limit
    public static final String SQLITE_ERR_CONSTRAINT = "SQLITE_ERR_CONSTRAINT"; // Abort due to constraint violation
    public static final String SQLITE_ERR_MISMATCH = "SQLITE_ERR_MISMATCH"; // Data type mismatch
    public static final String SQLITE_ERR_MISUSE = "SQLITE_ERR_MISUSE"; // Library used incorrectly
    public static final String SQLITE_ERR_NOLFS = "SQLITE_ERR_NOLFS"; // Uses OS features not supported on host
    public static final String SQLITE_ERR_AUTH = "SQLITE_ERR_AUTH"; // Authorization denied
    public static final String SQLITE_ERR_FORMAT = "SQLITE_ERR_FORMAT"; // Auxiliary database format error
    public static final String SQLITE_ERR_RANGE = "SQLITE_ERR_RANGE"; // 2nd parameter to SQLITE_bind out of range/
    public static final String SQLITE_ERR_NOTADB = "SQLITE_ERR_NOTADB"; // File opened that is not a database file
    public static final String SQLITE_ROW = "SQLITE_ROW";		//!< SQLITE_step() has another row ready
    public static final String SQLITE_DONE = "SQLITE_DONE";		//!< SQLITE_step() has finished executing
}