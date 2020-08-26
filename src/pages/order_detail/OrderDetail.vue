<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <ul class="order-detail">
                <li><div class="item-name">订单编号</div><div>{{orderDetail.orderId}}</div></li>
                <li><div class="item-name">订单状态</div><div>{{orderDetail.orderStatusName}}</div></li>
                <li><div class="item-name">下单用户</div><div>{{orderDetail.username}}</div></li>
                <li><div class="item-name">下单时间</div><div>{{orderDetail.time}}</div></li>
                <li><div class="item-name">取消时间</div><div>{{orderDetail.cancelTime}}</div></li>
                <li><div class="item-name">支付时间</div><div>{{orderDetail.payTime}}</div></li>
                <li><div class="item-name">发货时间</div><div>{{orderDetail.sendTime}}</div></li>
                <li><div class="item-name">完成时间</div><div>{{orderDetail.finishTime}}</div></li>
                <li><div class="item-name">订单金额</div><div v-if="orderDetail.orderTotal">￥{{orderDetail.orderTotal.toFixed(2)}}</div></li>
                <li><div class="item-name">快递费用</div><div v-if="orderDetail.delivery">￥{{orderDetail.delivery.fee.toFixed(2)}}</div></li>
                <li>
                    <div class="item-name">商品信息</div>
                    <el-table :data="orderDetail.products">
                        <el-table-column label="商品id">
                            <template slot-scope="scope"><router-link class="a-product" :to="'/admin/product/detail/' + scope.row.id">{{ scope.row.id }}</router-link></template>
                        </el-table-column>
                        <el-table-column prop="color" label="颜色"></el-table-column>
                        <el-table-column prop="size" label="尺寸"></el-table-column>
                        <el-table-column prop="price" label="价格"></el-table-column>
                        <el-table-column prop="count" label="数量"></el-table-column>
                        <el-table-column prop="total" label="小计"></el-table-column>
                    </el-table>
                </li>
                <li>
                    <div class="item-name">收件人信息</div>
                    <ul class="person" v-if="orderDetail.receiver">
                        <li><div class="item-name">姓名</div><div>{{orderDetail.receiver.name}}</div></li>
                        <li><div class="item-name">手机</div>{{orderDetail.receiver.phone}}</li>
                        <li><div class="item-name">收货地址</div>{{address(orderDetail.receiver)}}</li>
                    </ul>
                </li>
                <li>
                    <div class="item-name">寄件人信息</div>
                    <ul class="person" v-if="orderDetail.sender">
                        <li><div class="item-name">姓名</div><div>{{orderDetail.sender.name}}</div></li>
                        <li><div class="item-name">手机</div><div>{{orderDetail.sender.phone}}</div></li>
                        <li><div class="item-name">寄件地址</div><div>{{address(orderDetail.sender)}}</div></li>
                    </ul>
                </li>
            </ul>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    export default {
        name: 'OrderDetail',
        components: {
            FrameLayout
        },
        data() {
            return {
                orderDetail: {},
                orderId: '',
                fullscreenLoading: false
            }
        },
        methods: {
            async getOrderDetail() {
                try {
                    this.fullscreenLoading = true
                    let res = await this.axios.get('/api/myOrderDetail', {
                        params: {
                            orderId: this.orderId
                        }
                    })
                    this.orderDetail = res.data
                    this.fullscreenLoading = false
                } catch (e) {
                    this.fullscreenLoading = false
                }
            },
            address(person) {
                if (!person.area) {
                    return
                }
                return `${person.area.province} ${person.area.city} ${person.area.area} ${person.addr}`
            }
        },
        mounted() {
            this.getOrderDetail()
        },
        created() {
            this.orderId = this.$route.params.id
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    ul.order-detail
        width 90%
        margin 0 auto
        font-size 15px
        li
            display flex
            margin 20px 0
            .item-name
                width 100px
            .el-table
                .a-product
                    color unset
                    &:hover
                        color $blue
</style>