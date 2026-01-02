cat dist/service/commonjs/src/lib/data.service.js > tmp.js
cat dist/service/commonjs/src/lib/activepermits.data.service.js >> tmp.js
cat dist/service/commonjs/src/lib/download.service.js >> tmp.js
cat dist/service/commonjs/src/lib/reward.data.service.js >> tmp.js
cat dist/service/commonjs/src/lib/chain.performance.data.service.js >> tmp.js
cat dist/service/commonjs/src/lib/download.status.indexeddb.service.js >> tmp.js
cat dist/service/commonjs/src/lib/rosen-db-worker.js >> tmp.js
cat dist/service/commonjs/src/lib/chain.service.js >> tmp.js
cat dist/service/commonjs/src/lib/i-db-databasestorage.service.js >> tmp.js
cat dist/service/commonjs/src/lib/rosen-download-worker.js >> tmp.js
cat dist/service/commonjs/src/lib/chart.service.js >> tmp.js
cat dist/service/commonjs/src/lib/memory.storage.service.js >> tmp.js
cat dist/service/commonjs/src/lib/constants.js >> tmp.js
cat dist/service/commonjs/src/lib/mywatcher.data.service.js  >> tmp.js            
cat dist/service/commonjs/src/lib/process.event.service.js >> tmp.js  
cat dist/apps/server/watcherstats/main.js >> tmp.js  
mv tmp.js dist/apps/server/watcherstats/main.js

