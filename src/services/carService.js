const { DBquery } = require("../utils/database")

var querystr = '', queryvalue =[];

const apiGetBrands = async(req, res) => {
    try {
        const brands = await DBquery("SELECT id, name FROM brands");

        return res.json(brands)
    } catch (error) {
        next(error)
    }
}

const apiGetModelByBrand = async(req, res) => {
    try {
        const brandId = req.params.brandId;

        const models = await DBquery("SELECT id, name FROM models WHERE brand_id = ?", [brandId]);

        return res.json(models)
    } catch (error) {
        next(error)
    }
}

const apiGetGenerationByModel = async(req, res, next) => {
    try {
        const modelId = req.params.modelId;

        const generations = await DBquery("SELECT id, title as name FROM generations WHERE model_id = ?", [modelId]);

        return res.json(generations)
    } catch (error) {
        next(error)
    }
}

const apiSearchCar = async(req, res, next) => {
    try {
        const {
            brand_id,
            model_id,
            generation_id,
            engine
        } = req.body;

        console.log(req.body)

        if(!brand_id){
            return res.redirect('/')
        }

        if(!engine){
            return res.redirect(`/generation-list/${generation_id}`)
        }else{
            let hasAlert = false;

            querystr = 'SELECT c.id, gi.`engine` FROM cars c JOIN general_information gi ON gi.id = c.gi_id WHERE c.b_id = ? AND c.m_id = ? AND c.g_id = ? AND gi.engine = ?';
            queryvalue = [brand_id, model_id, generation_id, engine];
            const car = await DBquery(querystr, queryvalue);

            if (car.length === 0) {
                req.session.alert = {
                    type: 'alert-danger',
                    message: 'Car Not Found!',
                };
                hasAlert = true;
            }else{
                return res.redirect(`/specs/${car[0].id}`);
            }
            if (hasAlert) {
                return res.redirect('/');
            }
        }

    } catch (error) {
        next(error)
    }
}


module.exports = {
    apiGetBrands,
    apiGetModelByBrand,
    apiGetGenerationByModel,
    apiSearchCar
}