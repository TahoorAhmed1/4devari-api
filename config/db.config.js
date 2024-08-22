module.exports = {
  connstring:
    process.env.NODE_ENV === "dev"
      ? process.env.MONDO_URI_LOCAL
      : process.env.MONDO_URI_PROD,
};
