@echo off
echo Starting Webflix server...
taskkill /F /IM node.exe
node server.js 