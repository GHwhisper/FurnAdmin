<template>
    <el-form :model="product" :rules="rules" ref="pdtForm" class="product-item" label-width="120px" v-loading.fullscreen.lock="fullscreenLoading">
        <el-form-item label="商品编号(SPU)">{{product.productId}}</el-form-item>
        <el-form-item label="详情编号(SKU)">{{product.id}}</el-form-item>
        <el-form-item label="颜色" prop="color"><el-input v-model.trim="product.color"></el-input></el-form-item>
        <el-form-item label="尺寸" prop="size"><el-input v-model.trim="product.size"></el-input></el-form-item>
        <el-form-item label="价格" prop="price"><el-input-number :min="0.1" :precision="2" v-model="product.price"></el-input-number></el-form-item>
        <el-form-item label="图片" prop="imgs">
            <div class="img-item-con" v-for="(item, index) in product.imgs" :key="index">
                <el-image :src="item.img" :preview-src-list="previewImgList"></el-image>
                <el-button v-if="product.imgs.length > 1" class="img-del-btn" type="info" icon="el-icon-delete" circle plain size="mini" @click="handleImgDel(item.imgId)"></el-button>
            </div>
            <el-upload
                    action="/api/imgUpload"
                    :headers="{ token: adminToken }"
                    :class="{'hide-plus': hidePlus}"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :on-remove="handleRemove"
                    :on-exceed="handleExceed"
                    :on-success="uploadSucc"
                    multiple
                    :limit="limit"
                    :data="{ type: 'product' }"
            >
                <i class="el-icon-plus"></i>
            </el-upload>
        </el-form-item>
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
        <div class="opts">
            <!--该商品不止一种已存在的颜色/尺寸，才可删除-->
            <el-button v-show="count > 1" type="text" @click="handleColorDel">删除</el-button>
            <el-button class="save-btn" @click="handleSaveColor">保存</el-button>
        </div>
    </el-form>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name: 'ProductItem',
        props: {
            product: {
                type: Object,
                default() {
                    return {
                        productId: '',
                        id: '',
                        color: '',
                        size: '',
                        price: '',
                        imgs: []
                    }
                }
            },
            count: Number,   // 总共有几种商品
            index: Number   // 当前第几项
        },
        data() {
            let validateImgs = (rule, value, callback) => {
                if(this.product.imgs.length === 0 && this.addImgs.length === 0) {
                    callback(new Error('请上传图片'))
                } else {
                    callback()
                }
            }
            return {
                rules: {
                    color: [
                        { required: true, message: '请输入商品颜色', trigger: 'blur' },
                    ],
                    size: [
                        { required: true, message: '请输入商品尺寸', trigger: 'blur' }
                    ],
                    price: [
                        { required: true, message: '请输入商品价格', trigger: 'blur' }
                    ],
                    imgs: [
                        { validator: validateImgs }
                    ]
                },
                dialogVisible: false,
                dialogImageUrl: '',
                addImgs: [],    // 新增的图片
                fullscreenLoading: false
            }
        },
        methods: {
            handleColorDel() {  // 删除当前颜色尺寸的商品
                this.$confirm('确定删除该颜色尺寸的商品吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if(this.product.id) {   // 如果是已存在的商品，则发起删除请求
                        this.colorDelRequest()
                    } else {    // 若为新填写的商品，则触发事件，删除对应dom
                        this.$emit('removeColorItem', this.index)
                    }
                }).catch(() => {this.$message({ message: '已取消删除', type: 'info' })})
            },
            colorDelRequest() { // 删除当前颜色尺寸的请求
                this.fullscreenLoading = true
                this.axios.post('/api/deleteById', {
                    id: this.product.id
                }).then(res => {
                    this.fullscreenLoading = false
                    let data = res.data
                    if(data.deleteStatus === 200) {
                        this.$message({ message: '删除成功', type: 'success' })
                        this.$emit('updateProduct')
                    } else if(data.deleteStatus === 405) {
                        this.$message({ message: '删除失败', type: 'error' })
                    }
                }).catch(e => {
                    this.fullscreenLoading = false
                    this.$message({ message: '删除失败', type: 'error' })
                    console.log(e)
                })
            },
            handleSaveColor() {
                if(!this.vForm('pdtForm')) {
                    return
                }
                this.$confirm('确认保存商品信息吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.fullscreenLoading = true
                    this.axios.post('/api/productForm', {
                        productForm: this.product,
                        addImgs: this.addImgs
                    }).then(res => {
                        this.fullscreenLoading = false
                        let data = res.data
                        if(data.addStatus === 200) {
                            this.$message({ message: '保存成功', type: 'success' })
                            this.$router.go(0)
                        } else if(data.addStatus === 405) {
                            this.$message({message: '保存失败', type: 'error'})
                        }
                    }).catch(e => {
                        this.fullscreenLoading = false
                        this.$message({message: '保存失败', type: 'error'})
                        console.log(e)
                    })
                }).catch(() => { this.$message({ message: '已取消保存', type: 'info' }) })
            },
            handleImgDel(imgId) {
                this.$confirm('确定要删除该图片吗？删除后将无法找回', '提示', {
                    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
                }).then(() => {
                    this.imgDelRequest(imgId)
                }).catch(() => {this.$message({message: '已取消删除', type: 'info'})})
            },
            imgDelRequest(imgId) {  // 删除商品该颜色的单张图片
                this.fullscreenLoading = true
                this.axios.post('/api/deleteProductPictureAdmin', {
                    imgId: imgId
                }).then(res => {
                    this.fullscreenLoading = false
                    let data = res.data
                    if(data.deleteStatus === 200) {
                        this.$message({message: '图片删除成功', type: 'success'})
                        this.$emit('updateProduct')
                    } else if(data.deleteStatus === 405) {
                        this.$message({message: '图片删除失败', type: 'error'})
                    }
                }).catch(e => {
                    this.fullscreenLoading = false
                    console.log(e)
                })
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url
                this.dialogVisible = true
            },
            handleRemove(file, fileList) {
                let arr = []
                fileList.forEach(item => arr.push(item.response.imgUrl))
                this.addImgs = arr
            },
            handleExceed() {        // 超出数量限制
                this.$message({message: '每种颜色最多可有6张图片', type: 'warning'})
            },
            uploadSucc(res) {   // 上传成功
                if(res.status === 200) {
                    this.addImgs.push(res.imgUrl)
                }
            },
            vForm(formName) {   // 验证表单
                let flag
                this.$refs[formName].validate(valid => {
                    flag = valid
                })
                return flag
            },
        },
        computed: {
            previewImgList() {      // 预览图片数组
                let arr = []
                this.product.imgs.forEach(item => {
                    arr.push(item.img)
                })
                return arr
            },
            limit() {   // el-upload上传数量限制，每种颜色最多上传6张图
                return 6 - this.product.imgs.length
            },
            hidePlus() {    // limit 小于1 说明，已有六张图片,不可继续添加图片; 商品原有图片数量与新增图片数量之和达到6张，也不能继续添加图片
                return this.limit < 1  || this.product.imgs.length + this.addImgs.length >= 6
            },
            ...mapState(['adminToken'])
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .hide-plus >>> .el-upload--picture-card
        display none
    .product-item
        margin-bottom 50px
        box-shadow $shadow_3
        padding 20px
        box-sizing border-box
        border-radius 5px
    .img-item-con
        width 100px
        height 100px
        display inline-block
        position relative
        padding-right 10px
        padding-top 10px
        margin-right 10px
        margin-bottom 20px
        .img-del-btn
            position absolute
            top 0
            right 0
            /*top 0*/
        .el-image
            width 100px
            height 100px
            margin-right 10px
            margin-bottom 10px
    .opts
        &::before, &::after
            display table
            content ''
        &::after
            clear both
        .save-btn
            float right
</style>