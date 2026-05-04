# Cengiz Başaran
# WorldLine.TR
# 2015/11/26

.SILENT:

ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
CPPC=gcc
CC=gcc
LD=echo
else
CPPC=g++
CC=gcc
LD=g++
endif

BASE_DIR=../..

PLATFORMS=X86 X64 #DEBUG_X86 DEBUG_X64

INC_DIR=$(BASE_DIR)/Inc

SRC_DIR=$(BASE_DIR)/Simulator/Console

HEADER_FILES  = $(INC_DIR)/GMPSmartDLL.h

SOURCE_FILES  = $(SRC_DIR)/main.c

OBJS=$(sort $(patsubst %.c,%.o,$(notdir $(SOURCE_FILES))))

INCLUDE_DIRS=-I$(INC_DIR) -I$(LINUX_CLASS_DIR)
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
	INCLUDE_DIRS+=-I$(INC_DIR)/Fortify
	INCLUDE_DIRS+=-IC:\MinGw_50_32\include\c++\5.0.0
	INCLUDE_DIRS+=-IC:\MinGw_50_32\include\c++\5.0.0\parallel
endif

NEEDED=
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
	NEEDED=$(addprefix $(OBJ_DIR_X86)/,$(OBJS))
else
	NEEDED=$(foreach platform, $(PLATFORMS), $(BASE_DIR)/DLL$(if $(findstring DEBUG,$(platform)),_DEBUG,)/Linux/$(if $(findstring X86,$(platform)),x86,x64)/ConsoleApp)
endif


DEFINITIONS = -DLINUX
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
DEFINITIONS += -D_COMPILE_FOR_FORTIFY
endif

LIBS = 

CFLAGS =  -Wall -W -Wdeclaration-after-statement -O2 -DLINUX -Wno-unused-result
LFLAGS = -ldl

CFLAGS_X64= -m64 -fPIC -fpack-struct=8 -DING_LINUX_64
LFLAGS_X64= -m64

CFLAGS_X86= -m32 -fpack-struct=8 -DING_LINUX_32
LFLAGS_X86= -m32

CFLAGS_NON_DEBUG = -Werror
CFLAGS_DEBUG = -g3 -D_DEBUG

DEPENDANCY_FILES=makefile $(HEADER_FILES)

define compile_rule
$(1): $(2) $(DEPENDANCY_FILES)
	@echo compiling $(if $(findstring DEBUG,$(1)),DEBUG,) $(if $(findstring x86,$(1)),X86,X64) : $(notdir $(2)) - $(notdir $(1))
ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
	@if not exist $(subst /,\,$(dir $(1))) (@mkdir $(subst /,\,$(dir $(1))))
else
	if [ ! -d "$(dir $(1))" ]; then mkdir $(dir $(1)); fi
endif
	$(CC) $(INCLUDE_DIRS) $(DEFINITIONS) $(CFLAGS) $(CFLAGS_$(if $(findstring x86,$(1)),X86,X64)) $(if $(findstring DEBUG,$(1)),$(CFLAGS_DEBUG),$(CFLAGS_NON_DEBUG)) -c $(2) -o $(1)
endef


$(foreach platform, $(PLATFORMS), $(foreach source, $(SOURCE_FILES), $(eval $(call compile_rule,$(BASE_DIR)/DLL$(if $(findstring DEBUG,$(platform)),_DEBUG,)/Linux/$(if $(findstring X86,$(platform)),x86,x64)/Obj/$(basename $(notdir $(source))).o,$(source)))))


define link_rule
$(1): $(addprefix $(2)/,$(OBJS))
	@echo Linking ConsoleApp $(1) ...
	$(LD) $(LFLAGS_$(if $(findstring x86,$(1)),X86,X64)) $(addprefix $(2)/,$(OBJS)) $(LIBS) -o $(1) $(LFLAGS)
	echo --------------- $(1) Created. ---------------
endef

$(foreach need, $(NEEDED), $(eval $(call link_rule,$(need),$(dir $(need))Obj)))

.PHONY: all clean
all: $(NEEDED)
	@echo Compile and link done..
	@echo ======================== T H E = E N D ========================

ifeq ("$(IS_BUILD_FOR_FORTIFY)", "TRUE")
clean:
	@echo cleaning...
	@if exist $(OBJ_DIR_X86) (@del /f /s /q $(OBJ_DIR_X86)\*.o)
	@if exist $(OBJ_DIR_DEBUG_X86) (@del /f /s /q $(OBJ_DIR_DEBUG_X86)\*.o)
	@if exist $(OBJ_DIR_X86) (@rmdir /s /q $(OBJ_DIR_X86))
	@if exist $(OBJ_DIR_DEBUG_X86) (@rmdir /s /q $(OBJ_DIR_DEBUG_X86))
	@echo clean done...
else
clean:
	@echo cleaning...
	rm -f $(BASE_DIR)/DLL/Linux/x86/Obj/*.o
	rm -f $(BASE_DIR)/DLL/Linux/x64/Obj/*.o
	rm -f $(BASE_DIR)/DLL_DEBUG/Linux/x86/Obj/*.o
	rm -f $(BASE_DIR)/DLL_DEBUG/Linux/x64/Obj/*.o
	rm -f $(BASE_DIR)/DLL/Linux/x86/ConsoleApp
	rm -f $(BASE_DIR)/DLL/Linux/x64/ConsoleApp
	rm -f $(BASE_DIR)/DLL_DEBUG/Linux/x86/ConsoleApp
	rm -f $(BASE_DIR)/DLL_DEBUG/Linux/x64/ConsoleApp
	@echo clean done...
endif

