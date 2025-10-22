import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 修复 vue-router 在 3.0 以上版本中重复点击菜单时报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'Manager',
    component: () => import('../views/Manager.vue'),
    redirect: '/home',  // ホームにリダイレクト
    children: [
      { path: '403', name: 'NoAuth', meta: { name: '権限がありません' }, component: () => import('../views/manager/403') },
      { path: 'home', name: 'Home', meta: { name: 'ホーム' }, component: () => import('../views/manager/Home') },
      { path: 'admin', name: 'Admin', meta: { name: '管理者情報' }, component: () => import('../views/manager/Admin') },
      { path: 'adminPerson', name: 'AdminPerson', meta: { name: '個人情報' }, component: () => import('../views/manager/AdminPerson') },
      { path: 'password', name: 'Password', meta: { name: 'パスワード変更' }, component: () => import('../views/manager/Password') },
      { path: 'notice', name: 'Notice', meta: { name: 'お知らせ管理' }, component: () => import('../views/manager/Notice') },
      { path: 'user', name: 'User', meta: { name: 'ユーザー情報' }, component: () => import('../views/manager/User') },
      { path: 'userPerson', name: 'UserPerson', meta: { name: '個人情報' }, component: () => import('../views/manager/UserPerson') },
      { path: 'ac', name: 'Ac', meta: { name: 'アカウント情報' }, component: () => import('../views/manager/Ac') },
      { path: 'category', name: 'Category', meta: { name: 'カテゴリ情報' }, component: () => import('../views/manager/Category') },
      { path: 'bill', name: 'Bill', meta: { name: '帳簿管理' }, component: () => import('../views/manager/Bill') },
      { path: 'notebook', name: 'Notebook', meta: { name: '日記' }, component: () => import('../views/manager/Notebook') },
      { path: 'plan', name: 'Plan', meta: { name: '貯金計画' }, component: () => import('../views/manager/Plan') },
      { path: 'planDetail', name: 'PlanDetail', meta: { name: '貯金計画詳細' }, component: () => import('../views/manager/PlanDetail') },
    ]
  },
  { path: '/login', name: 'Login', meta: { name: 'ログイン' }, component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', meta: { name: '登録' }, component: () => import('../views/Register.vue') },
  { path: '*', name: 'NotFound', meta: { name: 'アクセス不可' }, component: () => import('../views/404.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
