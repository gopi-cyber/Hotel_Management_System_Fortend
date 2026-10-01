#!/bin/bash
# LuxeStay Hotel Management System Launcher

echo "========================================================"
echo "  🏨 LUXESTAY HOTEL MANAGEMENT SYSTEM"
echo "========================================================"
echo ""
echo "  [1] Start Next.js Frontend (Port 3000)"
echo "  [2] Exit"
echo ""
echo "========================================================"
read -p "Select an option (1-2): " choice

case $choice in
    1)
        echo "Starting Frontend..."
        npm run dev
        ;;
    2)
        exit 0
        ;;
    *)
        echo "Invalid option."
        ;;
esac
