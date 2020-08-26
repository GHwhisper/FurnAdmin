<template>
    <frame-layout>
        <template #main>
            <div class="container">
                <div class="top">
                    <div class="srch">
                        <div class="srch-product-id">
                            <el-input clearable v-model.trim="srchProductId" placeholder="搜索商品编号(SPU)" @keyup.enter.native="srchByProductId"></el-input>
                            <el-button type="primary" @click="srchByProductId">搜索编号</el-button>
                        </div>
                        <div class="srch-product-name">
                            <el-input clearable v-model.trim="srchProductName" placeholder="搜索商品名称" @keyup.enter.native="srchByProductName"></el-input>
                            <el-button type="primary" @click="srchByProductName">搜索名称</el-button>
                        </div>
                    </div>
                </div>
                <div class="list">
                    <el-table v-loading="loading" :data="productList" height="500px" @selection-change="handleSelectionChange" tooltip-effect="light">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column prop="productId" label="商品编号(SPU)"></el-table-column>
                        <el-table-column prop="name" label="商品名" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="praise" label="称赞" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button @click="handleDetailEdit(scope.row.productId)" type="text" size="small">详情/编辑</el-button>
                                <el-button @click="handleDel(scope.row.productId)" type="text" size="small">删除</el-button>
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
        name: 'ProductList',
        components: {
            FrameLayout
        },
        data() {
            return {
                srchProductId: '',     // 商品id搜索
                srchProductName: '',    // 商品名称搜索
                productList: [],
                total: 0,
                currentPage: 1,
                pageSize: 10,
                pageSizeValue: 10,
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
                inputPage: 1,
                idList: [],  // 复选改变时，选中的id数组
                loading: false
            }
        },
        methods: {
            async getProductList() {
                try{
                    this.loading = true
                    let res = await this.axios.get('/api/myProductList', {
                        params: {
                            page: this.currentPage,
                            pageSize: this.pageSize,
                            productId: this.srchProductId,
                            name: this.srchProductName
                        }
                    })
                    console.log(res)
                    let data = res.data
                    this.productList = data.productList
                    this.total = data.total
                    this.loading = false
                } catch(e) {
                    this.loading = false
                    this.$message({message: '获取商品列表失败', type: 'error'})
                    console.log(e)
                }
            },
            srchByProductId() {
                this.srchProductName = ''
                this.currentPage = 1
                this.getProductList()
            },
            srchByProductName() {
                this.srchProductId = ''
                this.currentPage = 1
                this.getProductList()
            },
            handleDetailEdit(id) {
                this.$router.push({name: 'ProductDetail', params: { productid: id }})
            },
            handleDel(id) {
                this.deleteProduct([id])
            },
            batchDel() {
                this.deleteProduct(this.idList)
            },
            deleteProduct(list) {
                if(list.length === 0) {
                    this.$message({showClose: true,message: '没有选中的商品',type: 'info'})
                    return
                }
                this.$confirm('此操作将永久删除该所选id下的所有商品，是否继续', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.loading = true
                        this.axios.post('/api/deleteProductList', {
                            productList: list
                        }).then(res => {
                            this.loading = false
                            let data = res.data
                            if(data.deleteStatus === 200) {
                                this.$message({showClose: true,message: '删除成功',type: 'success'})
                                this.$router.go(0)
                            } else if(data.deleteStatus === 405) {
                                this.$message({showClose: true,message: '删除失败',type: 'error'})
                            }
                        }).catch(() => {
                            this.loading = false
                            this.$message({showClose: true,message: '删除失败',type: 'error'})
                        })
                    }).catch(() => {
                        this.$message({showClose: true,message: '已取消',type: 'info'})
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
            handleSelectionChange(value) {
                this.idList = []
                value.forEach(item => {
                    this.idList.push(item.productId)
                })
            }
        },
        mounted() {
            this.getProductList()
        },
        watch: {
            currentPage() {
                this.getProductList()
            },
            pageSize() {
                this.getProductList()
            },
            pageSizeValue() {
                this.currentPage = 1
                this.pageSize = this.pageSizeValue
            },
        }
    }
</script>

<style lang="stylus" scoped>
    .top
        .srch
            display flex
            .el-input
                width 220px
                margin-right 10px
            .srch-product-id
                margin-right 30px
    .list
        min-height 500px
        margin 20px 0
        background-color lightblue
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