module.exports = {
  paths: {
    "/users-permissions": {
      get: {
        stuff: "override get from user-permission plugin",
      },
      put: {
        stuff: "override put from user-permission plugin",
      },
    },
  },
  components: {
    schemas: {
      UsersPermissionsListResponse: {
        stuff:
          "override UsersPermissionsListResponse from users-permissions plugin",
      },
    },
  },
};
