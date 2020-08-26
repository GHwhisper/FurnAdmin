<template>
    <div class="side-con">
        <div class="name">悦家管理系统</div>
        <el-menu
                router
                :default-active="$route.path"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                :default-openeds="opends"
        >
            <el-submenu index="1">
                <span slot="title">报表中心</span>
                <el-menu-item index="/admin/home">首页</el-menu-item>
            </el-submenu>
            <el-submenu index="2">
                <span slot="title">商品管理</span>
                <el-menu-item index="/admin/products">所有商品</el-menu-item>
                <el-menu-item index="/admin/addproduct">新增商品</el-menu-item>
            </el-submenu>
            <el-submenu index="3">
                <span slot="title">订单管理</span>
                <el-menu-item index="/admin/orders">所有订单</el-menu-item>
            </el-submenu>
            <el-submenu index="3">
                <span slot="title">地址管理</span>
                <el-menu-item index="/admin/address">发货地址</el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
    export default {
        name: 'SideBar',
        data() {
            return {
                opends: ['1', '2', '3']
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .side-con
        .name
            height 80px
            line-height 80px
            text-align center
            font-size 26px
            color #ffd04b
            background-color #3e454d
        .el-menu
            border 0
</style>