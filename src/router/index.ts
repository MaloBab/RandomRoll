import { createRouter, createWebHistory } from 'vue-router'


import Home from './../views/Home.vue'
import Roll from './../views/Tirage.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/roll',
    name: 'Roll',
    component: Roll
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router