import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'styles/reset.css'
import axios from 'axios'
import qs from 'qs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.config.productionTip = false

// 全局路由构造函数，判断是否登录和要跳转到页面
router.beforeEach((to, from, next) => {
  if(to.matched.some(m => m.meta.requireAuth)) {  // 需要登录
    if(window.localStorage.adminToken !== '') {
      next()
    } else if(to.path !== '/admin/login') {
      let adminToken = window.localStorage.adminToken
      if(adminToken === 'null' || adminToken === '' || adminToken === undefined) {
        next({path: '/admin/login'})
        this.$message({showClose: true,message: '检测到您还未登录，请登录后继续操作',duration: 1500})
      }
    } else {  // 不需要登录
      next()
    }
  } else {
    next()
  }
})

Vue.prototype.axios = axios

// 配置公共url
axios.default.baseURL = '/api/'
//添加请求拦截器
axios.interceptors.request.use(
    config =>{
      if (config.method === 'get') {
        config.paramsSerializer = function(params) {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        };
      }
      if(store.state.adminToken){
        config.headers.common['token'] = store.state.adminToken
      }
      return config;
    },
    error =>{
      //对请求错误做什么
      return Promise.reject(error);
    })


//http reponse响应拦截器
axios.interceptors.response.use(
    response =>{
        return response;
    },
    error=>{
      if(error.response){
        switch(error.response.status){
          case 401:
            localStorage.removeItem('adminToken');
            router.replace({
              path: '/admin/login',
              query: {redirect: router.currentRoute.fullPath}//登录成功后跳入浏览的当前页面
            })
        }
      }
    }
)


new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
