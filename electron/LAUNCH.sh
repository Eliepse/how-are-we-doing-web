#!/bin/bash

cd ..
npm install
npm run build
&npm run prod

cd electron
npm install
npm run start