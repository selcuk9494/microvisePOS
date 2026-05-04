@echo off

@echo Compiling...

@set PRJ_DIR=%CD%
@set OUT_DIR_PROD_1=%CD%\..\..\DLL\Windows\x64
@set OUT_DIR_PROD_2=%CD%\..\..\DLL\Windows\x86
@set OUT_DIR_PROD_3=%CD%\..\..\DLL\Linux\x64
@set OUT_DIR_PROD_4=%CD%\..\..\DLL\Linux\x86

@set OUT_DIR_DEBUG_1=%CD%\..\..\DLL_DEBUG\Windows\x64
@set OUT_DIR_DEBUG_2=%CD%\..\..\DLL_DEBUG\Windows\x86
@set OUT_DIR_DEBUG_3=%CD%\..\..\DLL_DEBUG\Linux\x64
@set OUT_DIR_DEBUG_4=%CD%\..\..\DLL_DEBUG\Linux\x86


if exist "C:\Program Files\Java\jdk1.8.0_221" set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_221
if exist "D:\Program Files\Java\jdk1.8.0_221" set JAVA_HOME=D:\Program Files\Java\jdk1.8.0_221
if exist "D:\Ingenico\Jdk18" set JAVA_HOME=D:\Ingenico\Jdk18
echo JAVA_HOME=%JAVA_HOME%

if "%JAVA_HOME%"=="" (
	@echo invalid Java Home
	pause
	@exit /b -1
)


ANT_HOME=
if exist "C:\Program Files\apache-ant-1.10.7" set ANT_HOME=C:\Program Files\apache-ant-1.10.7
if exist "D:\Program Files\apache-ant-1.10.7" set ANT_HOME=D:\Program Files\apache-ant-1.10.7
if exist "D:\Ingenico\apache-ant-1.10.7" set ANT_HOME=D:\Ingenico\apache-ant-1.10.7
if exist "C:\Program Files\apache-ant-1.10.12\bin" set ANT_HOME=C:\Program Files\apache-ant-1.10.12
if exist "C:\Program Files\apache-ant-1.10.13" set ANT_HOME=C:\Program Files\apache-ant-1.10.13
echo ANT_HOME=%ANT_HOME%

if "%ANT_HOME%"=="" (
	@echo invalid Ant folder
	pause
	@exit /b -1
)


@echo %path%|find "%JAVA_HOME%\bin" > nul || @set path=%path%%JAVA_HOME%\bin;
@echo %path%|find "%ANT_HOME%\bin" > nul || @set path=%path%%ANT_HOME%\bin;


rem aşağıdakiler her sistemde birkez yapılması gerekebilir.
if "%1"=="INSTALL" (
	@cd %ANT_HOME%
	@bin\ant -f fetch.xml -Ddest=system
	@cd %PRJ_DIR%
)


@call "%ANT_HOME%\bin\ant" -f %PRJ_DIR%\build.xml
@echo Ant Result = %errorlevel%
if NOT "%errorlevel%"=="0" (
	@echo Compile error
	pause
	@exit /b -1
)

call :CreateOutFolder %OUT_DIR_PROD_1%
call :CreateOutFolder %OUT_DIR_PROD_2%
call :CreateOutFolder %OUT_DIR_PROD_3%
call :CreateOutFolder %OUT_DIR_PROD_4%

call :CreateOutFolder %OUT_DIR_DEBUG_1%
call :CreateOutFolder %OUT_DIR_DEBUG_2%
call :CreateOutFolder %OUT_DIR_DEBUG_3%
call :CreateOutFolder %OUT_DIR_DEBUG_4%

if "%1"=="run" (
	cd %OUT_DIR_DEBUG_1%
	RunJava.bat
	cd %PRJ_DIR%
	rem @exit /b 0
)

goto :Exit


:CreateOutFolder
@echo preparing: %1
@copy %PRJ_DIR%\dist\*.* %1
@echo Java -jar GMP3Sim.jar> %1\RunJava.bat
@echo. >> %1\RunJava.bat
goto :eof


:Exit
rem pause
