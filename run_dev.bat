@echo off
echo Installing Backend dependencies...
start cmd /k "pip install -r requirements.txt && uvicorn api.main:app --reload --port 8000"

echo Installing Frontend dependencies...
start cmd /k "npm install && npm run dev"
pause
