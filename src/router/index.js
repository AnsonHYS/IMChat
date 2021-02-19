import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

const router = new Router({

  routes: [{
      path: '/',
      name: 'Home',
      redirect: '/404' //默认404页面
    },
    { //医生-咨询聊天页
      path: '/404',
      name: '404',
      component: () => import('@/view/404.vue')

    },
    { //医生-咨询聊天页
      path: '/doc/consult',
      name: 'docConsult',
      component: () => import('@/view/docConsultPage.vue')

    },
    { //医生-张榜聊天页
      path: '/doc/notice',
      name: 'docNonsult',
      component: () => import('@/view/docNoticePage.vue')
    },
    { //患者-咨询聊天页
      path: '/user/consult',
      name: 'userConsult',
      component: () => import('@/view/userConsultPage.vue')
    },
    { //患者-张榜聊天页
      path: '/user/notice',
      name: 'userNotice',
      component: () => import('@/view/userNoticePage.vue')
    }
  ]
})

export default router
