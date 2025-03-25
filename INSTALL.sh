#!/bin/bash

chmod +x ./LAUNCH.sh

npm install
npm run build

cd electron
npm install