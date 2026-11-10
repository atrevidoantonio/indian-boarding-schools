#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p data/raw

if [ ! -f data/raw/nabs_schools.geojson ]; then
  curl -sSL -o data/raw/nabs_schools.geojson \
    "https://services5.arcgis.com/JXuceyDPOWQcezHp/arcgis/rest/services/US_Indian_Boarding_Schools/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson"
fi

if [ ! -f data/raw/cb_2023_us_aiannh_500k.shp ]; then
  curl -sSL -o data/raw/aiannh.zip https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_aiannh_500k.zip
  unzip -o -q data/raw/aiannh.zip -d data/raw
fi

if [ ! -f data/raw/wapo_boarding_schools.csv ]; then
  curl -sSL -o data/raw/wapo_boarding_schools.csv \
    https://raw.githubusercontent.com/washingtonpost/data-boarding-schools/main/boarding_schools.csv
fi

npm install --silent

npx mapshaper data/raw/cb_2023_us_aiannh_500k.shp \
  -filter-fields NAME \
  -simplify 3% keep-shapes \
  -clean \
  -o format=topojson quantization=1e5 data/reservations.topo.json

python3 scripts/prepare_schools.py
python3 scripts/match_post_deaths.py
python3 scripts/build.py
