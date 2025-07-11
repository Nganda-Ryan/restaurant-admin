import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView/HomeView.vue'
import Dashboard from '../views/HomeView/DashboardView.vue'
import login from '../views/Connexion/authentificationView.vue'
import Ardoise from '@/views/HomeView/ardoise.vue'
// @ts-ignore
import HomeSetting from '../views/SettingsView/HomeSetting.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      
    },
    {
      path: '/login',
      name: 'login',
      component:login
    },
    {
      path: '/commande-list',
      name: 'command',
      component: HomeView
    },
    {
      path: '/ardoise',
      name: 'ardoise',
      component: Ardoise
    },
    {
      path: '/tickets/:ticketcode/:action',
      name: 'ticket',
      component: () => import('../views/TicketView/TicketDetail.vue')
    },
    {
      path: '/Stocks-entree',
      name: 'EntreeStocks',
      component: () => import('../views/Stocks/StocksEntree.vue')
    },
    {
      path: '/Stocks-exit',
      name: 'ExitStocks',
      component: () => import('../views/Stocks/StocksExit.vue')
    },
    {
      path: '/menus',
      name: 'menu',
      component: () => import('../views/MenuView/MenuView.vue')
    },    
    {
      path: '/settings',
      name: 'setting',
      component: HomeSetting 
    },
    {
      path: '/menus/:menucode/:action',
      name: 'menuaction',
      component: () => import('@/views/MenuView/MenuDetails.vue'),
      meta: {
        title: 'Users',
      }
    },
    {
      path: '/plates',
      name: 'plate',
      component: () => import('../views/PlateView/PlateView.vue')
    },{
      path: '/plates/:platecode/:action',
      name: 'platetaction',
      component: () => import('../views/PlateView/PlateDetail.vue'),
      meta: {
        title: 'Users',
      }
    },
    {
      path: '/products',
      name: 'product',
      component: () => import('../views/ProductView/ProductView.vue')
    },
    {
      path: '/products/:productcode/:action',
      name: 'productaction',
      component: () => import('../views/ProductView/ProductDetails.vue'),
      meta: {
        title: 'Users',
      }
    }
  ]
})
// Garde de navigation globale
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  
  if (!publicRoutes.includes(to.path)) {
    await authStore.checkAuth(); 
  }

  // 2. Logique de redirection
  if (!publicRoutes.includes(to.path) && !authStore.isAuthenticated) {
    return { path: '/login' };
  }
  if (publicRoutes.includes(to.path) && authStore.isAuthenticated) {
    return { path: '/' }; 
  }
});

export default router
