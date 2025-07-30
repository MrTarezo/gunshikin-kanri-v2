#!/bin/bash

# PWAアイコンのリサイズスクリプト
cd "$(dirname "$0")/../public/icons"

if [ ! -f "gunshikin-icon.png" ]; then
    echo "gunshikin-icon.png not found!"
    exit 1
fi

# 各サイズにリサイズ
convert gunshikin-icon.png -resize 72x72 icon-72x72.png
convert gunshikin-icon.png -resize 96x96 icon-96x96.png
convert gunshikin-icon.png -resize 128x128 icon-128x128.png
convert gunshikin-icon.png -resize 144x144 icon-144x144.png
convert gunshikin-icon.png -resize 152x152 icon-152x152.png
convert gunshikin-icon.png -resize 192x192 icon-192x192.png
convert gunshikin-icon.png -resize 384x384 icon-384x384.png
convert gunshikin-icon.png -resize 512x512 icon-512x512.png

echo "Icons resized successfully!"