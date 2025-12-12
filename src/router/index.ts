import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Role } from '@/types/role.types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    
    // Rutas para Super Admin
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['super_admin', 'admin'] },
      children: [
        {
          path: 'companies',
          name: 'AdminCompanies',
          component: () => import('@/views/admin/CompaniesView.vue'),
          meta: { roles: ['super_admin'] }
        },
        {
          path: 'companies/:id',
          name: 'AdminCompanyDetail',
          component: () => import('@/views/admin/CompanyDetailView.vue'),
          meta: { roles: ['super_admin'] }
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UsersView.vue')
        },
        {
          path: 'buildings',
          name: 'AdminBuildings',
          component: () => import('@/views/admin/BuildingsView.vue')
        },
        {
          path: 'buildings/:id',
          name: 'AdminBuildingDetail',
          component: () => import('@/views/admin/BuildingDetailView.vue')
        },
        {
          path: 'rooms',
          name: 'AdminRooms',
          component: () => import('@/views/admin/RoomsView.vue')
        },
        {
          path: 'tasks',
          name: 'AdminTasks',
          component: () => import('@/views/admin/TasksView.vue')
        }
      ]
    },
    
    // Rutas para Limpieza
    {
      path: '/cleaner',
      component: () => import('@/layouts/CleanerLayout.vue'),
      meta: { requiresAuth: true, roles: [Role.CLEANER] },
      children: [
        {
          path: 'tasks',
          name: 'CleanerTasks',
          component: () => import('@/views/cleaner/TasksView.vue')
        },
        {
          path: 'tasks/:id',
          name: 'CleanerTaskDetail',
          component: () => import('@/views/cleaner/TaskDetailView.vue')
        },
        {
          path: 'profile',
          name: 'CleanerProfile',
          component: () => import('@/views/cleaner/ProfileView.vue')
        }
      ]
    },
    
    // Ruta 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Guards de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Cargar usuario desde localStorage si no está cargado
  if (!authStore.user && authStore.token) {
    authStore.loadUserFromStorage()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiredRoles = to.meta.roles as string[]

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // Verificar roles si están especificados
    if (requiredRoles && authStore.user) {
      if (!requiredRoles.includes(authStore.user.role)) {
        // Redirigir según el rol del usuario
        if (authStore.user.role === Role.CLEANER) {
          next('/cleaner/tasks')
        } else {
          next('/admin/dashboard')
        }
        return
      }
    }
  }

  if (requiresGuest && authStore.isAuthenticated) {
    // Si ya está autenticado, redirigir según su rol
    if (authStore.user?.role === Role.CLEANER) {
      next('/cleaner/tasks')
    } else {
      next('/admin/dashboard')
    }
    return
  }

  next()
})

export default router