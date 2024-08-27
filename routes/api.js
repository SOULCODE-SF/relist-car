const express = require('express');

const router = express.Router();

const carservice = require("../src/services/carService")

router.get('/brands', carservice.apiGetBrands);
router.get('/models/:brandId', carservice.apiGetModelByBrand);
router.get('/generations/:modelId', carservice.apiGetGenerationByModel)
router.post('/search-car', carservice.apiSearchCar)

module.exports = router;