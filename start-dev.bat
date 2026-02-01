@echo off
echo Starting AI Resume Platform...
echo --------------------------------
echo Starting Server (Port 5000)...
start /b cmd /c "cd server && npm run dev"
echo Starting Client (Port 5173)...
start /b cmd /c "cd client && npm run dev"
echo --------------------------------
echo Setup Complete! OPEN http://localhost:5173 in your browser.
pause
