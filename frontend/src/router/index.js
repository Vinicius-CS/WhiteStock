import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '@/views/Index.vue'
import HomePanel from '@/views/panel/Home.vue'
import CollaboratorPanel from '@/views/panel/Collaborator.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexPage
  },
  {
    path: '/panel',
    name: 'panel',
    component: HomePanel
  },
  {
    path: '/panel/collaborator',
    name: 'collaborator',
    component: CollaboratorPanel
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
