export const paths = {
  app: {
    dashboards: {
      path: "/",
    },
    supplierDashboard: {
      path: "/dashboards/:supplierId",
      build: (id: number | string) => `/dashboards/${id}`,
    },
    update: {
      path: "/update",
    },
    data: {
      path: "/data",
    },
  },
};
