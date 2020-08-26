<template>
    <frame-layout>
        <template #main>
            <div class="container">
                <div class="top">
                    <div class="srch">
                        <div class="srch-order-id">
                            <el-input v-model.trim="srchOrderId" placeholder="搜索订单编号" clearable @keyup.enter.native="srchByOrderId"></el-input>
                            <el-button type="primary" @click="srchByOrderId">搜索编号</el-button>
                        </div>
                        <div>
                            <el-input v-model.trim="srchUsername" placeholder="搜索用户名" clearable @keyup.enter.native="srchByUsername"></el-input>
                            <el-button type="primary" @click="srchByUsername">搜索用户名</el-button>
                        </div>
                    </div>
                    <el-select v-model="statusValue">
                        <el-option
                                v-for="item in sortOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="list">
                    <el-table v-loading="loading" :data="orderList" height="500" @selection-change="handleSelectionChange">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column prop="orderId" label="订单编号"></el-table-column>
                        <el-table-column prop="username" label="下单用户"></el-table-column>
                        <el-table-column prop="time" label="订单时间"></el-table-column>
                        <el-table-column prop="money" label="订单金额"></el-table-column>
                        <el-table-column prop="count" label="商品数量"></el-table-column>
                        <el-table-column prop="orderStatusName" label="订单状态"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="handleLookDetail(scope.row.orderId)" type="text" size="small">详情</el-button>
                                <el-button @click="handleEditOrder(scope.row.orderId)" type="text" size="small">编辑</el-button>
                                <el-button @click="handleDeleteOrder(scope.row.orderId)" type="text" size="small">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="bottom">
                    <el-button size="small" @click="batchDel">删除选中</el-button>
                    <div class="right">
                        <div class="total">共 {{total}} 条</div>
                        <el-pagination
                                background
                                layout="prev, pager, next"
                                :total="total"
                                :current-page="currentPage"
                                :page-size="pageSize"
                                @current-change="setCurrentPage"
                        >
                        </el-pagination>
                        <el-select v-model="pageSizeValue" size="small">
                            <el-option
                                    v-for="item in pageOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                        <div class="to-page">
                            到第<el-input size="small" v-model="inputPage" onkeyup="value=value.replace(/[^\d]/g,'')" @keyup.enter.native="setInputPage" />页
                            <el-button size="small" @click="setInputPage">确定</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    export default {
        name: 'OrderList',
        components: {
            FrameLayout
        },
        data() {
            return {
                loading: false,
                srchOrderId: '',
                srchUsername: '',
                statusValue: 100,    // 订单状态筛选
                pageSizeValue: 10,  // 下拉框分页大小
                pageSize: 10,       // 分页组件分页大小
                currentPage: 1,     // 分页组件第几页
                inputPage: 1,       // input框第几页
                sortOptions: [
                    {
                        value: 100,
                        label: '全部'
                    }, {
                        value: 0,
                        label: '已取消'
                    }, {
                        value: 1,
                        label: '待付款'
                    }, {
                        value: 2,
                        label: '待发货'
                    }, {
                        value: 3,
                        label: '已发货'
                    }, {
                        value: 4,
                        label: '已完成'
                    }
                ],
                pageOptions: [
                    {
                        value: 10,
                        label: '10条/页'
                    },{
                        value: 20,
                        label: '20条/页'
                    }, {
                        value: 30,
                        label: '30条/页'
                    }, {
                        value: 40,
                        label: '40条/页'
                    }, {
                        value: 50,
                        label: '50条/页'
                    }
                ],
                orderList: [],  // 订单列表
                total: 0,       // 订单总数
                idList: [],     // 复选变化时，将orderId存入数组
            }
        },
        methods: {
            async getOrderList() {      // 请求订单列表
                try {
                    this.loading = true
                    let res = await this.axios.get('/api/orderList', {
                        params: {
                            page: this.currentPage,
                            pageSize: this.pageSize,
                            orderStatus: this.statusValue,
                            orderId: this.srchOrderId,
                            username: this.srchUsername
                        }
                    })
                    let data = res.data
                    this.orderList = data.orderList
                    this.total = data.total
                    this.loading = false
                } catch(e) {
                    this.loading = false
                    console.log(e)
                }
            },
            srchByOrderId() {   // 按订单id搜索
                this.srchUsername = ''
                this.currentPage = 1
                this.getOrderList()
            },
            srchByUsername() {    // 按用户名搜索
                this.srchOrderId = ''
                this.currentPage = 1
                this.getOrderList()
            },
            handleLookDetail(id) {    // 查看订单详情
                this.$router.push({ name: 'OrderDetail', params: { id: id } })
            },
            handleEditOrder(id) {   // 编辑订单
                this.$router.push({name: 'OrderEdit', params: { id: id }})
            },
            handleDeleteOrder(id) { // 删除订单，单项删除
                this.deleteOrder([id])
            },
            handleSelectionChange(value) {
                this.idList = []
                value.forEach(item => {
                    this.idList.push(item.orderId)
                })
            },
            setCurrentPage(value){
                this.currentPage = value
            },
            setInputPage() { // 设置当前第几页
                let page = Math.ceil(this.total / this.pageSize)    // 向上取整
                if(this.inputPage > page) {
                    this.inputPage = page
                }
                if(this.inputPage < 1) {
                    this.inputPage = 1
                }
                this.currentPage = parseInt(this.inputPage)
            },
            batchDel() {    // 批量删除
                this.deleteOrder(this.idList)
            },
            deleteOrder(list) {
                if(list.length === 0) {
                    this.$message({showClose: true,message: '没有选中的订单',type: 'info'})
                    return
                }
                this.$confirm(
                    '此操作将永久删除该订单，是否继续', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.loading = true
                        this.axios.post('/api/deleteOrderList', {
                            orderList: list
                        }).then(res => {
                            this.loading = false
                            let data = res.data
                            if(data.deleteStatus === 200) {
                                this.$message({showClose: true,message: '订单删除成功',type: 'success'})
                                this.getOrderList()
                            } else if(data.deleteStatus === 405) {
                                this.$message({showClose: true,message: '订单删除失败',type: 'error'})
                            }
                        }).catch(() => {
                            this.loading = false
                            this.$message({showClose: true,message: '订单删除失败',type: 'error'})
                        })
                }).catch(() => {
                    this.$message({showClose: true,message: '已取消',type: 'info'})
                })
            }
        },
        watch: {
            currentPage() {
                this.getOrderList()
            },
            pageSize() {
                this.getOrderList()
            },
            pageSizeValue() {
                this.currentPage = 1
                this.pageSize = this.pageSizeValue
            },
            statusValue() {
                this.currentPage = 1
                this.getOrderList()
            }
        },
        created() {
            this.statusValue = this.sortOptions[0].value
            this.pageSizeValue = this.pageOptions[0].value
        },
        mounted() {
            this.getOrderList()
        }
    }
</script>

<style lang="stylus" scoped>
    .top
        display flex
        justify-content space-between
        .srch
            display flex
            .srch-order-id
                margin-right 30px
            .el-input
                width 220px
                margin-right 10px
        .el-select
            width 150px
    .list
        min-height 500px
        margin 20px 0
    .bottom
        display flex
        justify-content space-between
        align-items center
        .right
            display flex
            align-items center
            justify-content flex-end
            .total
                margin-right 20px
            .el-select
                width 100px
                margin 0 20px
            .to-page
                .el-input
                    width 60px
                    margin 0 10px
                    & >>> input
                        text-align center
                        padding 0 10px
                .el-button
                    margin-left 10px
</style>