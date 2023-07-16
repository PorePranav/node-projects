const asyncWrapper = require("../middleware/async");
const Products = require("../models/product");

const getAllProductsStatic = asyncWrapper(async (req, res) => {
    const products = await Products.find({ price: { $gt: 30 } });
    res.status(200).json({ nbHits: products.length, products });
});

const getAllProducts = asyncWrapper(async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query;
    queryObject = {};
    if (featured) queryObject.featured = featured === "true" ? true : false;
    if (company) queryObject.company = company;
    if (name) queryObject.name = { $regex: name, $options: "i" };
    if (numericFilters) {
        const operatorMap = {
            ">": "$gt",
            ">=": "$gte",
            "=": "$eq",
            "<": "$lt",
            "<=": "$lte",
        };
        const regex = /\b(<|>|<=|>=|=)\b/g;
        let filters = numericFilters.replace(
            regex,
            (match) => `-${operatorMap[match]}-`
        );
        const options = ["price", "rating"];
        filters = filters.split(",").forEach((element) => {
            const [field, operator, value] = element.split("-");
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) };
            }
        });
    }
    let result = Products.find(queryObject);
    if (sort) {
        const sortList = sort.split(",").join(" ");
        result = result.sort(sortList);
    } else {
        result = result.sort("createdAt");
    }
    if (fields) {
        const fieldList = fields.split(",").join(" ");
        result = result.select(fieldList);
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    const products = await result;

    res.status(200).json({ nbHits: products.length, products });
});

module.exports = { getAllProductsStatic, getAllProducts };
