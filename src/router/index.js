import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/pages/login_admin/Login'
import Home from '@/pages/home/Home'
import ProductList from '@/pages/products/ProductList'
import OrderList from '@/pages/orders/OrderList'
import AddProduct from '@/pages/add_product/AddProduct'
import OrderDetail from '@/pages/order_detail/OrderDetail'
import OrderEdit from '@/pages/order_edit/OrderEdit'
import ProductDetail from "@/pages/product_detail/ProductDetail";
import Address from "@/pages/address/Address";

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

export default new Router({
    mode: 'history',
    linkActiveClass:'active',
    scrollBehavior(to,from,savePosition){ // 在点击浏览器的“前进/后退”，或者切换导航的时候触发。
        if(to.hash){ //先判断目标路由有没有hash值
            return {selector:to.hash}
        }
        if(savePosition) {
            return savePosition;
        }else{
            return {x:0,y:0}
        }
    },
    routes: [
        {
            path: '/',
            redirect: '/admin/login'
        },
        {
            path: '/admin/login',
            name: 'Login',
            component: Login
        },{
            path: '/admin/home',
            name: 'Home',
            component: Home
        },{
            path: '/admin/products',
            name: 'ProductList',
            component: ProductList
        },{
            path: '/admin/orders',
            name: 'OrderList',
            component: OrderList
        },{
            path: '/admin/addproduct',
            name: 'AddProduct',
            component: AddProduct
        },{
            path: '/admin/orderdetail/:id',
            name: 'OrderDetail',
            component: OrderDetail
        },{
            path: '/admin/orderedit/:id',
            name: 'OrderEdit',
            component: OrderEdit
        },{
            path: '/admin/product/detail/:productid',
            name: 'ProductDetail',
            component: ProductDetail
        },{
            path: '/admin/address',
            name: 'Address',
            component: Address
        }
    ]
})
