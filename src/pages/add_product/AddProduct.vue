<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <h2 class="title">新增商品</h2>
            <el-form ref="newProduct" :model="newProduct" label-width="80px" :rules="rules">
                <el-form-item label="商品名称" prop="name"><el-input v-model="newProduct.name" /></el-form-item>
                <el-form-item label="称赞" prop="praise"><el-input v-model="newProduct.praise" /></el-form-item>
                <el-form-item label="描述" prop="description"><el-input v-model="newProduct.description" /></el-form-item>
                <el-form-item label="简介" prop="summary">
                    <el-input
                        v-model="newProduct.summary"
                        resize="none"
                        :rows="8"
                        type="textarea"
                        minlength="10"
                        maxlength="300"
                        show-word-limit>
                    </el-input>
                </el-form-item>
                <div class="attrs-con">
                    <h3 class="title">设置颜色尺寸价格</h3>
                    <div class="pro-item" v-for="(item, index) in newProduct.styles" :key="index">
                        <el-form-item label="颜色" :prop="'styles.' + index + '.color'" :rules="rules.color">
                            <el-input v-model="item.color" />
                        </el-form-item>
                        <el-form-item label="尺寸" :prop="'styles.' + index + '.size'" :rules="rules.size">
                            <el-input v-model="item.size" />
                        </el-form-item>
                        <el-form-item label="价格" :prop="'styles.' + index + '.price'" :rules="rules.price">
                            <el-input-number v-model="item.price" :min="0.1" /> 元
                        </el-form-item>
                        <el-form-item label="图片" :prop="'styles.' + index + '.imgs'" :rules="rules.imgs">
                            <el-upload
                                    :ref="'upload' + index"
                                    action="/api/imgUpload"
                                    :headers="{ token: adminToken }"
                                    :class="{'hide-plus': hidePlus}"
                                    list-type="picture-card"
                                    :on-preview="handlePictureCardPreview"
                                    :on-remove="function(file, fileList) { return handleRemove(file, fileList, index) }"
                                    :on-change="handlePictureChange"
                                    :on-success="function(res, file, fileList) { return uploadSucc(res, file, fileList, index) }"
                                    :on-exceed="handleExceed"
                                    multiple
                                    :limit="6"
                                    :data="{ type: 'product' }"
                            >
                                <i class="el-icon-plus"></i>
                            </el-upload>
                        </el-form-item>
                        <el-button v-if="index !== 0" type="text" class="del-color-btn" icon="el-icon-delete" @click="handleDelColor(index)">删除</el-button>
                    </div>
                    <el-button type="text" class="new-color-btn" icon="el-icon-circle-plus-outline" @click="handleNewColor">新增商品颜色</el-button>
                    <el-button class="submit-btn" type="primary" @click="submitForm">保存并提交商品</el-button>
                </div>
            </el-form>
            <el-dialog :visible.sync="dialogVisible"><img width="100%" :src="dialogImageUrl" alt=""></el-dialog>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    import { mapState } from 'vuex'
    export default {
        name: 'AddProduct',
        components: {
            FrameLayout
        },
        data() {
            return {
                newProduct: {
                    name: '',
                    praise: '',
                    description: '',
                    summary: '',
                    styles: [
                        {
                            color: '',
                            size: '',
                            price: '',
                            imgs: []
                        }
                    ]
                },
                rules: {
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
                        { required: true, message: '请上传商品图片', trigger: 'blur' },
                    ]
                },
                dialogImageUrl: '',
                dialogVisible: false,
                hidePlus: false,
                fullscreenLoading: false
            }
        },
        methods: {
            uploadSucc(res, file, fileList, index) {       // 上传成功
                if(res.status) {
                    this.newProduct.styles[index].imgs.push(res.imgUrl)
                }
            },
            handleRemove(file, fileList, index) {      // 删除
                let arr = []
                fileList.forEach(item => arr.push(item.response.imgUrl))
                this.newProduct.styles[index].imgs = arr
                this.hidePlus = fileList.length >= 6
            },
            handlePictureChange(file, fileList) {   // 文件状态改变
                this.hidePlus = fileList.length >= 6
            },
            handlePictureCardPreview(file) {    // 预览
                this.dialogImageUrl = file.url;
                this.dialogVisible = true
            },
            handleExceed() {        // 超出数量限制
                this.$message({message: '最多上传6张图片', type: 'warning'})
            },
            submitForm() {      // 提交商品表单
                if(this.vForm('newProduct')) {
                    console.log(this.newProduct)
                    this.fullscreenLoading = true
                    this.axios.post('/api/addAdminProduct', {
                        newProduct: this.newProduct
                    }).then(res => {
                        console.log(res)
                        this.fullscreenLoading = false
                        let data = res.data
                        if(data.addStatus === 200) {
                            this.$message({message: '提交成功', type: 'success'})
                            this.clearForm()    // 提交成功后，清空整个表单及el-upload中的图片
                            let productId = data.productId  // 获取返回的productId
                            this.$router.push({ name: 'ProductDetail', params: { productid: productId } })  // 跳转添加的该商品详情
                        } else if(data.addStatus === 405) {
                            this.$message({message: '提交失败', type: 'error'})
                        }
                    }).catch(e => {
                        this.fullscreenLoading = false
                        this.$message({message: '提交失败', type: 'error'})
                        console.log(e)
                    })
                } else {
                    this.$alert('请正确填写商品信息')
                }
            },
            handleDelColor(index) {
                this.$confirm('确定删除该项吗', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.newProduct.styles.splice(index, 1)
                    this.$message({message: '删除成功', type: 'success'})
                }).catch(() => {this.$message({message: '已取消删除', type: 'info'})})
            },
            handleNewColor() {
                this.newProduct.styles.push({
                    color: '',
                    size: '',
                    price: '',
                    imgs: []
                })
            },
            vForm(formName) {   // 验证表单
                let flag
                this.$refs[formName].validate(valid => {
                    flag = valid
                })
                return flag
            },
            clearForm() {   // 清空表单
                this.$refs['newProduct'].resetFields()
                this.clearUpload()  // 虽然数据被清除了，但是el-upload上传的图片还残留在组件中
            },
            clearUpload() { // 清除upload中的图片
                for(let i = 0; i < this.newProduct.styles.length; i ++) {
                    this.$refs[`upload${i}`][0].uploadFiles = []
                    // console.log(this.$refs[`upload${i}`])
                }
            }
        },
        computed: {
            ...mapState(['adminToken'])
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .hide-plus >>> .el-upload--picture-card
        display none
    .title
        height 30px
        line-height 30px
        font-size .4rem
        text-align center
        margin-bottom 20px
    .el-form
        width 80%
        margin 0 auto
        .attrs-con
            margin-top 50px
            margin-bottom 100px
            .pro-item
                padding 30px 30px 30px 0
                box-shadow $shadow_3
                margin-bottom 30px
                .del-color-btn
                    float right
                    position relative
                    bottom 10px
            .submit-btn
                float right
</style>