const override = require("./override");

module.exports = (strapi) => {
  strapi.plugins.documentation.services.override.add(override);
};
