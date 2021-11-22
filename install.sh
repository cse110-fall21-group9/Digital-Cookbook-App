#!/bin/sh
pip install html5validator
bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)

npm install --save-dev htmlhint 
npm install --save-dev eslint@6.8.0 eslint-config-google  
npm install --save-dev jscpd  
npm install --save-dev stylelint stylelint-config-standard 

touch .eslintrc.json
mv .eslintrc.json .esintrc1.json
npx eslint --init
mv .esintrc1.json .eslintrc.json
