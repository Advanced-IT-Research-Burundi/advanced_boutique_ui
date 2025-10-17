export const routesConfig = [
  {
    path: '/dashboard',
    icon: 'pi pi-home',
    labelKey: 'sidebar.dashboard',
    component: 'DashboardScreen',
    policy: ['admin']
  },
  {
    path: '/sales',
    icon: 'pi pi-dollar',
    labelKey: 'sidebar.sales',
    component: 'SalesScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/localsales',
    icon: 'pi pi-dollar',
    labelKey: 'sidebar.localSales',
    component: 'SalesScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/proforma',
    icon: 'pi pi-file',
    labelKey: 'sidebar.proforma',
    component: 'SalesScreen',
    policy: ['admin'] 
  },
  {
    path: '/stocks',
    icon: 'pi pi-box',
    labelKey: 'sidebar.stocks',
    component: 'StocksScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/products',
    icon: 'pi pi-shopping-bag',
    labelKey: 'sidebar.products',
    component: 'ProductsScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/categories',
    icon: 'pi pi-tags',
    labelKey: 'sidebar.categories',
    component: 'CategoriesScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/clients',
    icon: 'pi pi-user',
    labelKey: 'sidebar.clients',
    component: 'ClientsScreen',
    policy: ['admin', 'editor', 'viewer', 'salesperson']
  },
  {
    path: '/suppliers',
    icon: 'pi pi-truck',
    labelKey: 'sidebar.suppliers',
    component: 'SuppliersScreen',
    policy: ['admin']
  },
  {
    path: '/commandes',
    icon: 'pi pi-upload',
    labelKey: 'sidebar.imports',
    component: 'ImportsScreen',
    policy: ['admin']
  },
  // {
  //   path: '/purchases',
  //   icon: 'pi pi-shopping-cart',
  //   labelKey: 'sidebar.purchases',
  //   component: 'PurchasesScreen'
  // },
  {
    path: '/users',
    icon: 'pi pi-users',
    labelKey: 'sidebar.users',
    component: 'UsersScreen',
    policy: ['admin']
  },
  {
    path: '/vehicles',
    icon: 'pi pi-car',
    labelKey: 'sidebar.vehicles',
    component: 'VehiclesScreen',
    policy: ['admin']
  },
  {
    path: '/cash-registers',
    icon: 'pi pi-wallet',
    labelKey: 'sidebar.cashRegisters',
    component: 'CashRegistersScreen',
    policy: ['admin']
  },
  {
    path: '/transactions',
    icon: 'pi pi-refresh',
    labelKey: 'sidebar.transactions',
    component: 'TransactionsScreen',
    policy: ['admin']
  },
  {
    path: '/expenses',
    icon: 'pi pi-money-bill',
    labelKey: 'sidebar.expenses',
    component: 'ExpensesScreen',
    policy: ['admin']
  },
  {
    path: '/expense-types',
    icon: 'pi pi-cog',
    labelKey: 'sidebar.expenseTypes',
    component: 'ExpenseTypesScreen',
    policy: ['admin']
  },
  {
    path: '/reports',
    icon: 'pi pi-chart-bar',
    labelKey: 'sidebar.reports',
    component: 'ReportsScreen',
    policy: ['admin']
  }
];

export const getMenuItems = () => {
  return routesConfig.map(({ path, icon, labelKey, policy }) => ({
    path,
    icon,
    labelKey,
    policy
  }));
};

export const getRoutes = () => {
  return routesConfig.map(({ path, component }) => ({
    path,
    component
  }));
};