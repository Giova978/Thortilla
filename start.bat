cd Lavalink
start powershell.exe .\lava.ps1
ping 192.0.2.2 -n 1 -w 5000 > nul
cd ..
start powershell.exe .\bot.ps1
exit

