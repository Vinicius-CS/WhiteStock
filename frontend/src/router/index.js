import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '@/views/Index.vue'
import LoginPage from '@/views/Login.vue'
import HomePanel from '@/views/panel/Home.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexPage,
    meta: { title: 'White Stock' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: 'White Stock - Entrar' }
  },
  {
    path: '/panel',
    name: 'panel',
    component: HomePanel,
    meta: { title: 'White Stock - Painel' }
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
