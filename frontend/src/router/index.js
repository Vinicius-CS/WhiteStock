import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '@/views/Index.vue';
import HomePanel from '@/views/panel/Home.vue';
import CollaboratorPanel from '@/views/panel/Collaborator.vue';
import ProductPanel from '@/views/panel/Product.vue';
import CategoryPanel from '@/views/panel/Category.vue';
import CompanyPanel from '@/views/panel/Company.vue';

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
  {
    path: '/panel/product',
    name: 'product',
    component: ProductPanel
  },
  {
    path: '/panel/product-category',
    name: 'category',
    component: CategoryPanel
  },
  {
    path: '/panel/company',
    name: 'company',
    component: CompanyPanel
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
