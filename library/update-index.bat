@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "out=index.json"
set "tmp=index.tmp"

echo { > "%tmp%"
echo   "files": [ >> "%tmp%"

set first=1
for %%f in (*.json) do (
  if /i not "%%f"=="index.json" (
    set "fname=%%~nf"
    if !first!==1 (
      echo     { "name": "!fname!", "file": "%%f" } >> "%tmp%"
      set first=0
    ) else (
      echo     ,{ "name": "!fname!", "file": "%%f" } >> "%tmp%"
    )
  )
)

echo   ] >> "%tmp%"
echo } >> "%tmp%"

move /y "%tmp%" "%out%" >nul
echo index.json mis a jour.
pause
