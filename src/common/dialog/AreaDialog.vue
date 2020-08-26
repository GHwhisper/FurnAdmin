<template>
    <el-dialog
            class="form-dialog"
            :title="title"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            :destroy-on-close="true"
            @close="closeDialog"
            :fullscreen="fullscreen"
            v-loading.fullscreen.lock="fullscreenLoading"
    >
        <el-form :model="form" label-position="top" :rules="rules" ref="ruleForm">
            <el-form-item label="发货人" prop="sender"><el-input v-model.trim="form.sender" /></el-form-item>
            <el-form-item label="所在地区" v-if="form.area" prop="area">
                <v-distpicker class="dist-picker"
                              :province="form.area.province"
                              :city="form.area.city"
                              :area="form.area.area"
                              @selected="handleSelect"
                />
            </el-form-item>
            <el-form-item label="详细地址" prop="addr"><el-input v-model.trim="form.addr" /></el-form-item>
            <el-form-item label="手机号" prop="phone"><el-input v-model.trim="form.phone" /></el-form-item>
            <el-form-item label="邮箱地址" prop="email"><el-input v-model.trim="form.email" /></el-form-item>
            <el-form-item label="地址别名" prop="title"><el-input v-model.trim="form.title" /></el-form-item>
            <el-form-item><el-button type="warning" @click="submitForm('ruleForm')">保存发货地址</el-button></el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
    import VDistpicker from 'v-distpicker'
    import { isvalidPhone } from 'js/validate'
    import { deepClone } from 'js/utils'
    import axios from 'axios'
    export default {
        name: 'AreaDialog',
        components: {
            VDistpicker
        },
        props: {
            fullscreen: {
                type: Boolean,
                default() {
                    return false
                }
            },
            title: {
                type: String,
                default() {
                    return '编辑发货地址'
                }
            },
            visible: {
                type: Boolean,
                required: true
            },
            addr: {
                type: Object,
                default: function () {
                    return {
                        addressId: "",
                        title: "",
                        sender: "",
                        area: {
                            province: "",
                            city: "",
                            area: ""
                        },
                        addr: "",
                        phone: "",
                        email: "",
                        addressDefault: false
                    }
                }
            },   // 完整地址信息
        },
        data() {
            let validArea = (rule, value, callback) => {
                if(!this.form.area.province || !this.form.area.city || !this.form.area.area) {
                    callback(new Error('请选择所在地区'))
                }
                if(this.form.area.province === '省' || this.form.area.province === '市' || this.form.area.city === '区') {
                    callback(new Error('请选择省、市、区'))
                } else {
                    callback()
                }
            }
            let validPhone = (rule, value, callback) => {
                if(!value) {
                    callback(new Error('请输入手机号码'))
                } else if(!isvalidPhone(value)) {
                    callback(new Error('请输入正确的11位手机号码'))
                } else {
                    callback()
                }
            }
            return {
                dialogVisible: false,   // 对话框显隐
                form: {},   // 编辑的地址信息
                rules: {
                    sender: [
                        { required: true, message: '请输入发货人姓名', trigger: 'blur' },
                        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
                    ],
                    area: [
                        { required: true, validator: validArea, trigger: 'blur' }
                    ],
                    addr: [
                        { required: true, message: '请输入详细发货地址', trigger: 'blur' },
                        { min: 1, max: 50, message: '发货人详细地址过长', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, validator: validPhone, trigger: 'blur' }
                    ],
                    email: [
                        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                    ],
                    title: [
                        { min: 0, max: 20, message: '地址别名过长', trigger: 'blur' }
                    ]
                },  // 校验规则
                fullscreenLoading: false
            }
        },
        mounted() {
            if(this.addr) {
                this.form = deepClone(this.addr)
            }
        },
        methods: {
            submitForm(formName) {  // 提交表单
                this.$refs[formName].validate(valid => {
                    if(valid) {
                        this.form.title = (this.form.title === '') ? this.form.sender : this.form.title
                        this.fullscreenLoading = true
                        axios.post('/api/updateSender', {
                            addrForm: this.form
                        }).then(res => {
                            console.log(res)
                            let data = res.data
                            if(data.updateStatus === 200) {
                                this.$message({showClose: true,message: '保存成功',type: 'success',duration: 1500})
                                this.dialogVisible = false
                                this.$router.go(0)
                            } else {
                                this.$message({showClose: true,message: '保存失败',type: 'error',duration: 1500})
                            }
                            this.fullscreenLoading = false
                        }).catch(() => {this.fullscreenLoading = false})
                    } else {
                        return false
                    }
                })
            },
            handleSelect(data) {    // 地区选择
                this.form.area.province = data.province.value
                this.form.area.city = data.city.value
                this.form.area.area = data.area.value
            },
            closeDialog() {
                if(this.addr) {
                    this.form = deepClone(this.addr)
                }
            }
        },
        watch: {
            addr() {
                this.form = deepClone(this.addr)
            },
            visible(value) {
                this.dialogVisible = value
            },
            dialogVisible(value) {
                this.$emit('closeDialog', value)
            }
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .el-input >>> .el-input__inner:focus
        border-color $activeColor
    .dist-picker >>> select
        font-size inherit
        padding 0
        border-radius 4px
        min-width 80px
        &:focus
            border-color $activeColor
    .form-dialog >>> .el-dialog__close:hover
        color $activeColor
    .form-dialog::-webkit-scrollbar
        width 0 !important
        display none
</style>