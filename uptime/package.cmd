cargo b -r
cd target\release
del uptime-0.1.0.zip
7z a -tzip -mx9 uptime-0.1.0.zip uptime.exe
cd ..\..\