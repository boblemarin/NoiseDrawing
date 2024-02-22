@echo off
start cmd.exe /k "node index.js"

timeout /t 3

rem ==== Killing any instances of chrome
taskkill /IM "brave.exe">nul 2>&1

timeout /t 3

rem ==== Set local variables

set app_url="http://localhost:3000"

set chrome_path="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

set chrome_flags= --kiosk --disable-pinch --disable-session-crashed-bubble --disable-infobars --overscroll-history-navigation=0 --disable-feature=OutdatedBuildDetector --check-for-update-interval=604800 --disable-web-security --user-data-dir

rem ==== Launch Chrome with app

%chrome_path% %app_url% %chrome_flags%