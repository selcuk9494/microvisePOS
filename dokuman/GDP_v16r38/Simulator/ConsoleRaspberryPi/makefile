# Cengiz Başaran
# WorldLine.TR
# 2015/11/26

.SILENT:

ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
CXX_ARMv6=gcc
CXX_ARMv7=gcc
CXX_ARMv8=gcc
CC_ARMv6=gcc
CC_ARMv7=gcc
CC_ARMv8=gcc
LD_ARMv6=echo
LD_ARMv7=echo
LD_ARMv8=echo
else
CXX_ARMv6=arm-linux-gnueabi-g++
CXX_ARMv7=arm-linux-gnueabihf-g++
CXX_ARMv8=aarch64-linux-gnu-g++
CC_ARMv6=arm-linux-gnueabi-gcc
CC_ARMv7=arm-linux-gnueabihf-gcc
CC_ARMv8=aarch64-linux-gnu-gcc
LD_ARMv6=arm-linux-gnueabi-g++
LD_ARMv7=arm-linux-gnueabihf-g++
LD_ARMv8=aarch64-linux-gnu-g++
endif

BASE_DIR=../..

PLATFORMS=ARMv6 ARMv7 ARMv8 #DEBUG_ARMv6 DEBUG_ARMv7 DEBUG_ARMv8

INC_DIR=$(BASE_DIR)/Inc

SRC_DIR=$(BASE_DIR)/Simulator/ConsoleRaspberryPi

HEADER_FILES  = $(INC_DIR)/GMPSmartDLL.h

SOURCE_FILES = $(SRC_DIR)/main.c

OBJS=$(sort $(patsubst %.c,%.o,$(notdir $(SOURCE_FILES))))

INCLUDE_DIRS=-I$(INC_DIR)

NEEDED=
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
	NEEDED=$(addprefix $(OBJ_DIR)/,$(OBJS))
else
	NEEDED=$(foreach platform, $(PLATFORMS), $(BASE_DIR)/DLL$(if $(findstring DEBUG,$(platform)),_DEBUG,)/RaspberryPi/$(subst DEBUG_,,$(platform))/ConsoleApp)
endif

LIBS = 

CFLAGS =  -Wall -W -Wdeclaration-after-statement -O2 -Wno-unused-result -fPIC
CPPFLAGS = -Wall -W -O2 -Wno-format-overflow -Wno-unused-result -fPIC
LFLAGS = -Wl,--no-as-needed -ldl


CFLAGS_RPI= -fpack-struct=8 -DING_RASPBERRY_PI
CPPFLAGS_RPI= -fpack-struct=8 -DING_RASPBERRY_PI
LFLAGS_RPI= -ldl

CFLAGS_NON_DEBUG = -Werror
CPPFLAGS_NON_DEBUG = -Werror
CFLAGS_DEBUG = -g3 -D_DEBUG
CPPFLAGS_DEBUG = -g3 -D_DEBUG

DEPENDANCY_FILES=makefile $(HEADER_FILES)

define compile_rule
$(1): $(2) $(DEPENDANCY_FILES)
	@echo compiling $(if $(findstring DEBUG,$(1)),DEBUG,) $(3) : $(notdir $(2)) - $(notdir $(1))
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
	@if not exist $(subst /,\,$(dir $(1))) (@mkdir $(subst /,\,$(dir $(1))))
else
	if [ ! -d "$(dir $(1))" ]; then mkdir $(dir $(1)); fi
endif
	$(CC_$(3)) $(INCLUDE_DIRS) $(DEFINITIONS) $(CFLAGS) $(CFLAGS_RPI) $(if $(findstring DEBUG,$(1)),$(CFLAGS_DEBUG),$(CFLAGS_NON_DEBUG)) -c $(2) -o $(1)
endef


$(foreach platform, $(PLATFORMS), $(foreach source, $(SOURCE_FILES), $(eval $(call compile_rule,$(BASE_DIR)/DLL$(if $(findstring DEBUG,$(platform)),_DEBUG,)/RaspberryPi/$(subst DEBUG_,,$(platform))/Obj/$(basename $(notdir $(source))).o,$(source),$(subst DEBUG_,,$(platform))))))


define link_rule
$(1): $(addprefix $(2)/,$(OBJS))
	@echo Linking ConsoleApp $(1) ...
	$(LD_$(3)) $(LFLAGS) $(addprefix $(2)/,$(OBJS)) $(LIBS) -o $(1) $(LFLAGS_RPI)
	echo --------------- $(1) Created. ---------------
endef

$(foreach need, $(NEEDED), $(eval $(call link_rule,$(need),$(dir $(need))Obj,$(subst /,,$(subst ../../DLL_DEBUG/,,$(subst ../../DLL/,,$(subst RaspberryPi/,,$(dir $(need)))))))))

.PHONY: all clean
all: $(NEEDED)
	@echo Compile and link done..
	@echo ======================== T H E = E N D ========================

ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
clean:
	@echo cleaning...
	@if exist $(OBJ_DIR_ARM6) (@del /f /s /q $(OBJ_DIR_ARM6)\*.o)
	@if exist $(OBJ_DIR_ARM7) (@del /f /s /q $(OBJ_DIR_ARM7)\*.o)
	@if exist $(OBJ_DIR_ARM8) (@del /f /s /q $(OBJ_DIR_ARM8)\*.o)
	@if exist $(OBJ_DIR_ARM6_DEBUG) (@del /f /s /q $(OBJ_DIR_ARM6_DEBUG)\*.o)
	@if exist $(OBJ_DIR_ARM7_DEBUG) (@del /f /s /q $(OBJ_DIR_ARM7_DEBUG)\*.o)
	@if exist $(OBJ_DIR_ARM8_DEBUG) (@del /f /s /q $(OBJ_DIR_ARM8_DEBUG)\*.o)
	@if exist $(OBJ_DIR_ARM6) (@rmdir /s /q $(OBJ_DIR_ARM6))
	@if exist $(OBJ_DIR_ARM7) (@rmdir /s /q $(OBJ_DIR_ARM7))
	@if exist $(OBJ_DIR_ARM8) (@rmdir /s /q $(OBJ_DIR_ARM8))
	@if exist $(OBJ_DIR_ARM6_DEBUG) (@rmdir /s /q $(OBJ_DIR_ARM6_DEBUG))
	@if exist $(OBJ_DIR_ARM7_DEBUG) (@rmdir /s /q $(OBJ_DIR_ARM7_DEBUG))
	@if exist $(OBJ_DIR_ARM8_DEBUG) (@rmdir /s /q $(OBJ_DIR_ARM8_DEBUG))
	@echo clean done...
else
clean:
	@echo cleaning...
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv6/Obj/*.o
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv7/Obj/*.o
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv8/Obj/*.o
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv6/Obj/*.o
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv7/Obj/*.o
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv8/Obj/*.o
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv6/ConsoleApp
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv7/ConsoleApp
	rm -f $(BASE_DIR)/DLL/RaspberryPi/ARMv8/ConsoleApp
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv6/ConsoleApp
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv7/ConsoleApp
	rm -f $(BASE_DIR)/DLL_DEBUG/RaspberryPi/ARMv8/ConsoleApp
	@echo clean done...
endif

