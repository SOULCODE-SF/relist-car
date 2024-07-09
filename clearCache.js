// clean-cache.js

const NodeCache = require('node-cache');
const myCache = new NodeCache();

// Membersihkan seluruh cache
function cleanCache() {
  myCache.flushAll();
  console.log('Cache berhasil dibersihkan.');
}

cleanCache();
