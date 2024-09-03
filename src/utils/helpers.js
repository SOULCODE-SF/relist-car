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

const handleImages = async (props) => {
  try {
    const oldImagePath = props.oldpath;
    const fileExtension = `${props.ext}`;
    const formattedFileName = formatFileName(
      `${props.fileName}`,
      fileExtension
    );
    const newDir = path.join(__dirname, `../../public/${props.newDir}`);
    const newFilePath = path.join(newDir, formattedFileName);

    const temp = `${props.path}/${formattedFileName}`;
    const oldPath = props.uploadPath;

    fs.mkdir(newDir, { recursive: true }, async (err) => {
      if (err) throw new Error('Error creating directory');
      moveFile(oldPath, newFilePath, async (err) => {
        if (err) throw new Error('Error moving file');

        if (oldImagePath && oldImagePath !== temp) {
          const oldImageFullPath = path.join(
            __dirname,
            '../../public',
            oldImagePath
          );

          try {
            await unlinkFile(oldImageFullPath);
          } catch (unlinkError) {
            console.error('Error deleting old image:', unlinkError);
          }
        }
      });
    });

    return { success: true, path: temp, message: 'sukses' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  moveFile,
  formatFileName,
  unlinkFile,
  handleImages,
};
