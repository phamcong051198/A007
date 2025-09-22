!define APP_NAME "SpeedWin"

!define DEFAULT_INSTALL_PATH "C:\${APP_NAME}"
!define INSTALL_REGISTRY_KEY "Software\${APP_NAME}"

!macro WriteInstallLocation
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INSTALL_PATH}"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INSTALL_PATH}"
!macroend

!macro preInit
  SetRegView 64
  !insertmacro WriteInstallLocation

  SetRegView 32
  !insertmacro WriteInstallLocation
!macroend

!macro customInstall
  CreateDirectory "$SMPROGRAMS\${SHORTCUT_NAME}"
  CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${SHORTCUT_NAME}.exe"
  CreateShortCut "$SMPROGRAMS\${SHORTCUT_NAME}\${SHORTCUT_NAME}.lnk" "$INSTDIR\${SHORTCUT_NAME}.exe"

  ; Xóa thư mục -data trong AppData\Roaming của đúng user
  ReadEnvStr $R3 "USERPROFILE"
  RMDir /r "$R3\AppData\Roaming\${APP_NAME}-data"

  WriteUninstaller "$INSTDIR\uninstall.exe"
!macroend

!macro myUnInstall
  nsExec::Exec 'taskkill /F /IM "${APP_NAME}.exe"'
  Sleep 2000

  ; Delete registry entries
  SetRegView 64
  DeleteRegKey HKLM "${INSTALL_REGISTRY_KEY}"
  DeleteRegKey HKCU "${INSTALL_REGISTRY_KEY}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

  ; Remove shortcuts
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"

  ; Remove AppData folders (from actual user profile)
  ReadEnvStr $R4 "USERNAME"
  RMDir /r "C:\Users\$R4\AppData\Roaming\${APP_NAME}"
  RMDir /r "C:\Users\$R4\AppData\Local\${APP_NAME}"
  RMDir /r "C:\Users\$R4\AppData\Local\${APP_NAME}-updater"

  ; Clean install directory with fallback bat
  RMDir /r "$INSTDIR\.cache"
  Delete "$INSTDIR\*.*"

  SetOutPath "$TEMP"
  StrCpy $R0 "$INSTDIR"
  StrCpy $R1 "$TEMP\del_${APP_NAME}.bat"
  FileOpen $R2 $R1 w
  FileWrite $R2 "@echo off$\n"
  FileWrite $R2 "ping 127.0.0.1 -n 5 > nul$\n"
  FileWrite $R2 'takeown /F "$R0" /R /D Y$\n'
  FileWrite $R2 'icacls "$R0" /grant administrators:F /T$\n'
  FileWrite $R2 'rmdir /s /q "$R0"$\n'
  FileWrite $R2 'if exist "$R0" goto retry$\n'
  FileWrite $R2 "del %0$\n"
  FileClose $R2
  ExecShell "open" "$R1" "" SW_HIDE
!macroend

Section "Uninstall"
  !insertmacro myUnInstall
SectionEnd