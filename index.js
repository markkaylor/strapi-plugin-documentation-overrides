// user-permissions
const userPermissionsPlugin = require("./plugins/users-permissions");
const defaultPluginConfig = require("./default-plugin-config");
const _ = require("lodash");

const mockRoutes = [
  { path: "/users-permissions", method: "get" },
  { path: "/users-permissions", method: "put" },
  { path: "/users-permissions", method: "delete" },
  { path: "/restaurants", method: "get" },
  { path: "/restaurants", method: "put" },
  { path: "/restaurants", method: "delete" },
];

const mockSchemaUniqueNames = [
  "RestaurantListResponse",
  "UsersPermissionsListResponse",
  "AddressListResponse",
];

// NOTE:
// The openapi field is omitted, it should not be touched
// The components and paths fields are omitted, they are handled elsewhere
const FIXED_FIELDS = ["info", "servers", "security", "tags", "externalDocs"];

// Documentation plugin
const docPlugin = {
  bootstrap() {},
  register() {},
  services: {
    documentation: {
      buildApiEndpointPath() {
        return mockRoutes.reduce(
          // The default acc value is the manual overrides
          (acc, route) => {
            // If the path already exists, return that value
            if (_.has(acc, `${route.path}.${route.method}`)) return acc;
            // Otherwise let the plugin generate a value
            _.set(acc, `${route.path}.${route.method}`, {
              stuff: "built by plugin",
            });

            return acc;
          },
          { ...docPlugin.services.override.getAllOverrides().paths }
        );
      },
      buildComponentSchema() {
        // The default value of schemas is the manual overrides
        let schemas =
          docPlugin.services.override.getAllOverrides().components.schemas;

        for (const mockUniqueName of mockSchemaUniqueNames) {
          // If the schema already exists, return that value
          if (_.has(schemas, mockUniqueName)) continue;
          // Otherwise let the plugin generate a value
          schemas = {
            ...schemas,
            [mockUniqueName]: {
              stuff: "built by plugin",
            },
          };
        }

        return schemas;
      },
      buildDefaultFullDoc() {
        const fullDoc = {};
        const overrides = docPlugin.services.override.getAllOverrides();
        const setDefaultsOnFullDoc = (keys) => {
          const source = _.has(overrides, keys)
            ? overrides // Return overrides if they exist
            : defaultPluginConfig; // Otherwise return the default config value

          const valueToSet = _.get(source, keys);

          _.set(fullDoc, keys, valueToSet);
        };

        // Build the default fullDoc values
        for (const fixedField of FIXED_FIELDS) {
          setDefaultsOnFullDoc(fixedField)
        }
        setDefaultsOnFullDoc("x-strapi-config");
        setDefaultsOnFullDoc("components.securitySchemes");

        return fullDoc;
      },
      generateFullDoc() {
        const fullDoc = this.buildDefaultFullDoc();
        const paths = this.buildApiEndpointPath();
        const schemas = this.buildComponentSchema();

        _.merge(fullDoc, { paths, components: { schemas } });
        console.log(JSON.stringify(fullDoc, null, 2));
      },
    },
    override: {
      _allOverrides: {},
      getAllOverrides() {
        return this._allOverrides;
      },
      register(override) {
        _.merge(this._allOverrides, override);
      },
    },
  },
};

// User code
const userCode = {
  register(strapi) {
    strapi.plugins.documentation.services.override.register({
      paths: {
        "/restaurants": {
          get: {
            stuff: "override get from user code",
          },
          put: {
            stuff: "override put from user code",
          },
        },
      },
      servers: ['override-server'],
      components: {
        securitySchemes: {
          stuff: "override from user",
        },
        schemas: {
          RestaurantListResponse: {
            stuff: "override from user",
          },
        },
      },
    });
  },
};

// Strapi
const strapi = {
  plugins: {
    documentation: docPlugin,
    "user-permissions": userPermissionsPlugin,
  },
};

for (const api in strapi.plugins) {
  strapi.plugins[api].register(strapi);
}
userCode.register(strapi);
strapi.plugins.documentation.services.documentation.generateFullDoc();
