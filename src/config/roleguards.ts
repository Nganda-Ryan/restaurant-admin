// Types de base
type Role = 'OWNER' |'ADMIN'| 'MANAGER' | 'HEAD_CHEF' | 'CASHIER' | 'INVENTORY_MGR';
/* type Permission = 
  | 'view_all'
  | 'manage_all'
  | 'manage_menu'
  | 'manage_orders'
  | 'manage_reservations'
  | 'manage_inventory'
  | 'manage_staff'
  | 'view_reports'
  | 'process_payments'
  | 'take_orders'
  | 'manage_deliveries'; */

interface MenuAccess {
  allowedMenus: string[];
  //allowedSubMenus: Record<string, string[]>;
 // permissions: Permission[];
}

// Hiérarchie des rôles (index plus bas = priorité plus haute)
export const ROLE_HIERARCHY: Record<Role, number> = {
  'OWNER': 0,
  'ADMIN': 1, // ADMIN est considéré comme le rôle le plus élevé après OWNER
  'MANAGER': 2,
  'HEAD_CHEF': 3,
  'CASHIER': 4,
  'INVENTORY_MGR': 5,
};

// Routes par défaut pour chaque rôle
export const DEFAULT_ROUTES: Record<Role, string> = {
  'OWNER': '/',
  'ADMIN': '/',
  'MANAGER': '/menus',
  'HEAD_CHEF': '/ardoise',
  'CASHIER': '/commande-list',
  'INVENTORY_MGR': '/Stocks-entree',
};

// Configuration des accès par menu selon les rôles
export const ROLE_MENU_ACCESS: Record<Role, MenuAccess> = { 
  'OWNER': {
    allowedMenus: [
      'Dashboard',
      'Menu',
      'Orders',
      'Reservations',
      'Inventory',
      'Staff',
      'Reports',
      'Finances',
      'Settings'
    ],
  },
    'ADMIN': {
    allowedMenus: [
      'Dashboard',
      'Menu',
      'Orders',
      'Reservations',
      'Inventory',
      'Staff',
      'Reports',
      'Finances',
      'Settings'
    ],
  },
  'MANAGER': {
    allowedMenus: [
      'Dashboard',
      'Menu',
      'Plates',
      'Produits',
      'Stocks',
    ],
  },
  'HEAD_CHEF': {
    allowedMenus: [
      'Ardoise',
      'Dashboard',
    ],
  },
  'CASHIER': {
    allowedMenus: [
      'Commandes'
    ],
  },
  'INVENTORY_MGR': {
    allowedMenus: [
      'Stocks',
    ]
  }
};

// Fonction utilitaire pour vérifier les permissions
/* export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_MENU_ACCESS[role].permissions.includes(permission);
} */

// Fonction pour vérifier si un rôle peut accéder à un menu
export function canAccessMenu(role: Role, menu: string): boolean {
  return ROLE_MENU_ACCESS[role].allowedMenus.includes(menu);
}