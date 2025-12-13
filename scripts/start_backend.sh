#!/bin/bash
# Standard backend startup script
# Usage: ./scripts/start_backend.sh [port]

PORT=${1:-8001}
export PYTHONPATH=$PYTHONPATH:.

echo "Starting backend on port $PORT..."
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
