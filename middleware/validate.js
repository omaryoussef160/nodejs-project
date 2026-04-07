const validate = (schema, source = "body") => (req, res, next) => {
  const data = source === "params" ? req.params : source === "query" ? req.query : req.body;
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(". ");
    return res.status(400).json({ status: "error", message });
  }
  if (source === "body") req.body = value;
  else if (source === "query") Object.assign(req.query, value);
  else Object.assign(req.params, value);
  next();
};

module.exports = validate;
