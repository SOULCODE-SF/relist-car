const path = require('path');
const fs = require('fs');

const moveFile = (oldPath, newPath, callback) => {
  // Gunakan fs.rename untuk memindahkan file
  fs.rename(oldPath, newPath, (err) => {
    if (err) return callback(err);
    callback(null);
  });
};

const formatFileName = (name, extension) => {
  const formattedName = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .concat(extension);
  return formattedName;
};

const unlinkFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.warn(
            `Old image file not found, skipping deletion: ${filePath}`
          );
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  moveFile,
  formatFileName,
  unlinkFile,
};
