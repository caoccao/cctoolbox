cargo b -r
cd target\release
del touch-0.1.0.zip
7z a -tzip -mx9 touch-0.1.0.zip touch.exe
cd ..\..\