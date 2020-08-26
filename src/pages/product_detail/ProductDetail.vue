<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <div class="info-form">
                <el-form ref="productForm" :model="productForm" :rules="pRules" label-width="120px" :disabled="pdcInfoFormDisabled">
                    <h3 class="title">基本信息</h3>
                    <el-form-item label="商品编号(SPU)"><div>{{productForm.productId}}</div></el-form-item>
                    <el-form-item label="商品名称" prop="name"><el-input v-model="productForm.name"></el-input></el-form-item>
                    <el-form-item label="称赞" prop="praise"><el-input v-model="productForm.praise"></el-input></el-form-item>
                    <el-form-item label="描述" prop="description"><el-input v-model="productForm.description"></el-input></el-form-item>
                    <el-form-item label="简介" prop="summary">
                        <el-input
                                v-model="productForm.summary"
                                resize="none"
                                :rows="8"
                                type="textarea"
                                minlength="10"
                                maxlength="300"
                                show-word-limit>
                        </el-input>
                    </el-form-item>
                    <el-form-item><el-button class="save-info-btn" @click="handleSaveInfo">保存</el-button></el-form-item>
                </el-form>
                <el-button class="modify-btn" type="text" @click="pdcInfoFormDisabled = !pdcInfoFormDisabled">修改</el-button>
            </div>
            <div class="products">
                <div class="title">颜色尺寸价格</div>
                <template v-for="(item, index) in productInfo.products">
                    <product-item
                            :product="item"
                            :key="index"
                            :count="existCount"
                            :index="index"
                            @removeColorItem="handleRemoveColorItem"
                            @updateProduct="getProductInfo"
                    />
                </template>
                <el-button @click="addProduct">添加</el-button>
            </div>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    import ProductItem from "../../common/product_item/ProductItem";
    export default {
        name: 'ProductDetail',
        components: {
            FrameLayout,
            ProductItem
        },
        data() {
            return {
                productId: '',
                productInfo: {},    // producId商品的信息
                productForm: {      // 用于提交修改的商品基本信息
                    productId: '',
                    name: '',
                    praise: '',
                    description: '',
                    summary: ''
                },
                pRules: {     // 校验规则
                    name: [
                        { required: true, message: '请输入商品名称', trigger: 'blur' },
                        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                    ],
                    praise: [
                        { required: true, message: '请输入商品类别', trigger: 'blur' },
                        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '请输入商品描述', trigger: 'blur' },
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    summary: [
                        { required: true, message: '请输入商品描述', trigger: 'blur' },
                        { min: 10, max: 300, message: '长度在 10 到 300 个字符', trigger: 'blur' }
                    ],
                },
                pdcInfoFormDisabled: true,  // 商品基本信息表单是否可用
                fullscreenLoading: false
            }
        },
        methods: {
            async getProductInfo() {    // 获取商品详情
                try {
                    this.fullscreenLoading = true
                    let res = await this.axios.get('/api/myProductDetail', {
                        params: {
                            productId: this.$route.params.productid
                        }
                    })
                    console.log(res)
                    this.productInfo = res.data
                    this.fullscreenLoading = false
                } catch (e) {
                    this.fullscreenLoading = true
                }
            },
            handleSaveInfo() {  // 保存商品基本信息
                if(!this.vForm('productForm')) {
                    return
                }
                this.$confirm('确定要保存对基本信息的修改吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.fullscreenLoading = true
                    this.axios.post('/api/updateProductAdmin', {
                        productForm: this.productForm
                    }).then(res => {
                        this.fullscreenLoading = false
                        let data = res.data
                        if(data.updateStatus === 200) {
                            this.$message({message: '保存成功', type: 'success'})
                            this.getProductInfo()
                        } else if(data.updateStatus === 405) {
                            this.$message({message: '保存失败', type: 'error'})
                        }
                    }).catch(e => {
                        this.fullscreenLoading = false
                        this.$message({message: '保存失败', type: 'error'})
                        console.log(e)
                    })
                }).catch(() => {this.$message({message: '已取消', type: 'info'})})
            },
            addProduct() {
                const product = {
                    productId: this.productInfo.productId,
                    id: '',
                    color: '',
                    size: '',
                    price: '',
                    imgs: []
                }
                this.productInfo.products.push(product)
            },   // 添加商品（颜色尺寸价格图片）
            vForm(formName) {
                let flag
                this.$refs[formName].validate(valid => {
                    flag = valid
                })
                return flag
            },
            handleRemoveColorItem(value) {  // id（sku）不存在时，product-item触发事件执行此方法；反之product-item组件发起删除请求
                this.productInfo.products.splice(value, 1)
            }
        },
        mounted() {
            this.getProductInfo()
        },
        watch: {
            productInfo() {
                this.productForm.productId = this.productInfo.productId
                this.productForm.name = this.productInfo.name
                this.productForm.praise = this.productInfo.praise
                this.productForm.description = this.productInfo.description
                this.productForm.summary = this.productInfo.summary
            },
            '$route'() {
                if(this.$route.params.productid) {
                    this.productId = this.$route.params.productid
                    this.getProductInfo()
                }
            }
        },
        computed: {
            existCount() {  // 当前productId下已存在的不同颜色/尺寸的商品数量
                let arr = []
                if(this.productInfo.products) {
                    arr  = this.productInfo.products.filter(item => {
                        return item.id
                    })
                }
                return arr.length
            }
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .title
        height 30px
        line-height 30px
        font-size .4rem
        text-align center
        margin-bottom 20px
    .info-form
        width 80%
        margin 0 auto
        .el-form
            .save-info-btn
                float right
        .modify-btn
            position relative
            top -60px
            left 35px
    .products
        width 80%
        margin 0 auto
</style>