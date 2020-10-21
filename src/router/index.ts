import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Loopbar from '../views/Loopbar.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Loopbar',
    component: Loopbar
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
