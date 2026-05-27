#!/usr/bin/env bash
# OnePersonAI Demo Recording Script

cd /home/a/OnePersonAI

echo "=== OnePersonAI v1.0.0 ==="
echo "AI-Powered Solo Builder Toolkit"
echo ""
sleep 1

echo "$ onepersonai --help"
node bin/onepersonai.js --help
echo ""
sleep 1

echo ""
echo "========================================"
echo "Command 1: analyze --demo"
echo "========================================"
echo "$ onepersonai analyze --demo"
node bin/onepersonai.js analyze --demo
echo ""
sleep 1

echo ""
echo "========================================"
echo "Command 2: review (self-review)"
echo "========================================"
echo "$ onepersonai review ."
node bin/onepersonai.js review . 2>&1 | head -30
echo "..."
echo ""
sleep 1

echo ""
echo "========================================"
echo "Done! OnePersonAI is ready to ship."
echo "https://github.com/shijiezhichang/OnePersonAI"
echo "========================================"
