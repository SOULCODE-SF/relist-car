const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getBrandNameById,
  getModelNameById,
  getGenerationNameById,
} = require('./carHelpers');

// Set up storage for images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { brandId, modelId, generationId } = req.body;

      const brand_name = await getBrandNameById(brandId);
      const model_name = await getModelNameById(modelId);
      const generation_name = await getGenerationNameById(generationId);
      const engine = req.body.engine;

      let pathimage = `${brand_name}/${model_name}/${generation_name}/${
        generation_name + engine
      }`;
      pathimage = pathimage.toLowerCase().replace(/ /g, '-');

      console.log(pathimage);

      const folderPath = path.join(
        __dirname,
        '../../public/assets/images/brands',
        pathimage,
      );

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = '.webp';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const uploadCarImages = multer({ storage: storage });

module.exports = uploadCarImages;
