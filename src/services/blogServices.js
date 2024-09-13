const { DBquery } = require("../utils/database")

var querystr = '', queryvalue =[]

const getCategoriesBlog = async(req, res, next) => {
    try {
        querystr = 'SELECT * FROM post_categories'
        const datas = await DBquery(querystr)

        return res.status(200).json({datas})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getCategoriesBlog
}