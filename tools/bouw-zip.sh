#!/usr/bin/env bash
# Bouwt dist/polderbanden-voorloop-<versie>.zip, klaar om in WordPress te uploaden.
set -euo pipefail
cd "$(dirname "$0")/.."
versie=$(grep -m1 "Version:" plugin/polderbanden-voorloop/polderbanden-voorloop.php | awk '{print $NF}')
mkdir -p dist
rm -f "dist/polderbanden-voorloop-${versie}.zip"
(cd plugin && zip -qr "../dist/polderbanden-voorloop-${versie}.zip" polderbanden-voorloop -x '*.DS_Store')
echo "dist/polderbanden-voorloop-${versie}.zip"
