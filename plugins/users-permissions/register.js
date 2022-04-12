module.exports = (strapi) => {
  if (strapi.plugins.documentation) {
    require("./documentation")(strapi);
  }
};
