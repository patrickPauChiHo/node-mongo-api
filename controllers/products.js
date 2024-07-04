const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({}).select("name price");
  res.status(200).json({ products });
};

const getAllProducts = async (req, res) => {
  //console.log(req);
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  //numeric filters
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };

    const regEx = /\b(<|<=|=|>=|>)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    console.log(numericFilters);
    console.log(filters);

    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      //console.log(item);
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  console.log(queryObject);
  let result = Product.find(queryObject);

  //sort
  if (sort) {
    //console.log(sort);
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("craetedAt");
  }

  //fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  //pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;
  //console.log(req.query);
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
