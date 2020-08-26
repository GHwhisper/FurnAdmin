<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <div>订单编号：{{orderDetail.orderId}}</div>
            <div class="order-status">
                <div class="status cancel" v-if="orderDetail.orderStatus === 0">已取消</div>
                <div class="status unpaid" v-if="orderDetail.orderStatus === 1">待付款</div>
                <div class="status paid" v-if="orderDetail.orderStatus === 2">待发货（已付款）</div>
                <div class="status sent" v-if="orderDetail.orderStatus === 3">已发货</div>
                <div class="status finish" v-if="orderDetail.orderStatus === 4">已完成</div>
            </div>
            <div v-if="orderDetail.orderStatus === 0 || orderDetail.orderStatus === 3 || orderDetail.orderStatus === 4"
                 class="container tips">当前订单状态无法进行其他操作
            </div>
            <div class="container cancel" v-if="orderDetail.orderStatus === 1"><el-button @click="cancelOrder">取消订单</el-button></div>
            <!--收收收件人信息start-->
            <div v-if="orderDetail.orderStatus === 2" >
                <el-form :disabled="recDisable" ref="receiverForm" :rules="rules" :model="receiverForm" label-width="100px">
                    <div class="person-text">收货人信息</div>
                    <el-form-item label="收货人：" prop="name"><el-input v-model.trim="receiverForm.name"></el-input></el-form-item>
                    <el-form-item label="收货地区：" prop="receiverArea">
                        <v-distpicker :class="['dist-picker', {'dist-disabled' : recDisable}]"
                                      :province="receiverForm.area.province"
                                      :city="receiverForm.area.city"
                                      :area="receiverForm.area.area"
                                      @selected="handleReceiverDistSelect"
                                      :disabled="recDisable"
                        ></v-distpicker>
                    </el-form-item>
                    <el-form-item label="详细地址：" prop="addr"><el-input v-model.trim="receiverForm.addr"></el-input></el-form-item>
                    <el-form-item label="联系电话：" prop="phone"><el-input v-model.trim="receiverForm.phone"></el-input></el-form-item>
                    <el-form-item label="邮箱：" prop="email"><el-input v-model.trim="receiverForm.email"></el-input></el-form-item>
                    <el-button @click="submitReceiver">保存收件人信息</el-button>
                </el-form>
                <el-button class="modify-btn" type="text" @click="modifyReceiver">修改</el-button>
                <!--收件人信息end-->
                <!--发发发件人信息start-->
                <el-form ref="senderForm" :rules="rules" :model="senderForm" label-width="100px">
                    <div class="person-text">发货人信息</div>
                    <div class="radio-con">
                        <el-radio :disabled="addrSelectDisable" v-model="addrRadio" label="1">从已有发货地址选择</el-radio>
                        <el-select :disabled="addrSelectDisable" v-model="addressId" :placeholder="addrSelectPlaceholder">
                            <el-option
                                    v-for="item in addrOptions"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                            ></el-option>
                        </el-select>
                    </div>
                    <div class="radio-con">
                        <el-radio v-model="addrRadio" label="2">自定义发货地址</el-radio>
                        <el-form-item label="发货人：" prop="name"><el-input v-model.trim="senderForm.name"></el-input></el-form-item>
                        <el-form-item label="发货地区：" prop="senderArea">
                            <v-distpicker class="dist-picker"
                                          :province="senderForm.area.province"
                                          :city="senderForm.area.city"
                                          :area="senderForm.area.area"
                                          @selected="handleSenderDistSelect"
                            ></v-distpicker>
                        </el-form-item>
                        <el-form-item label="详细地址：" prop="addr"><el-input v-model.trim="senderForm.addr"></el-input></el-form-item>
                        <el-form-item label="联系电话：" prop="phone"><el-input v-model.trim="senderForm.phone"></el-input></el-form-item>
                        <el-form-item label="邮箱：" prop="email"><el-input v-model.trim="senderForm.email"></el-input></el-form-item>
                    </div>
                    <el-form-item label="配送方式：">普通快递</el-form-item>
                    <el-form-item label="运费：">￥0.00</el-form-item>
                    <el-button type="warning" @click="submitSenderAndSend">保存并发货</el-button>
                </el-form>
                <!--发件人信息end-->
            </div>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    import { deepClone } from "../../assets/js/utils";
    import { isvalidPhone } from "../../assets/js/validate";
    import VDistpicker from "v-distpicker"
    export default {
        name: 'OrderEdit',
        components: {
            FrameLayout,
            VDistpicker
        },
        data() {
            let validReceiverArea = (rule, value, callback) => {    // 收获人地区验证
                if(!this.receiverForm.area.province || !this.receiverForm.area.city || !this.receiverForm.area.area) {
                    callback(new Error('请选择所在地区'))
                } else if(this.receiverForm.area.province === '省' || this.receiverForm.area.province === '市' || this.receiverForm.area.city === '区') {
                    callback(new Error('请选择所在地区'))
                } else {
                    callback()
                }
            }
            let validSenderArea = (rule, value, callback) => {  // 发货人地区验证
                if(!this.senderForm.area.province || !this.senderForm.area.city || !this.senderForm.area.area) {
                    callback(new Error('请选择所在地区'))
                }
                if(this.senderForm.area.province === '省' || this.senderForm.area.province === '市' || this.senderForm.area.city === '区') {
                    callback(new Error('请选择所在地区'))
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
                orderDetail: {},
                orderId: '',
                receiverForm: {},
                senderForm: {},
                rules: {
                    name: [
                        { required: true, message: '请输入收货人姓名', trigger: 'blur' },
                        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
                    ],
                    receiverArea: [
                        { required: true, validator: validReceiverArea, trigger: 'blur' }
                    ],
                    senderArea: [
                        { required: true, validator: validSenderArea, trigger: 'blur' }
                    ],
                    addr: [
                        { required: true, message: '请输入详细收货地址', trigger: 'blur' },
                        { min: 1, max: 50, message: '收货人详细地址过长', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, validator: validPhone, trigger: 'blur' }
                    ],
                    email: [
                        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                    ]
                },  // 校验规则
                recDisable: true,    // 是否禁用收货人表单
                addrList: [],   // 发货地址列表
                addrRadio: '1',
                addrOptions: [],
                addressId: '',  // 选择的发货人地址id
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
                    this.receiverForm = deepClone(this.orderDetail.receiver)
                    this.senderForm = deepClone(this.orderDetail.sender)
                    if(this.orderDetail.orderStatus === 2) {    // 订单为待发货状态才请求发货地址，供管理员选择
                        this.getAdminAddress()
                    }
                    this.fullscreenLoading = false
                } catch (e) {
                    this.fullscreenLoading = false
                }
            },
            async getAdminAddress() {
                this.fullscreenLoading = true
                let res = await this.axios.get('/api/sender')
                this.addrList = res.data
                console.log(res)
                this.fullscreenLoading = false
            },
            cancelOrder() {
                this.$confirm('确认要取消订单吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.fullscreenLoading = true
                    this.axios.post('/api/cancelOrderAdmin', {
                        orderId: this.orderId
                    }).then(res => {
                        let data = res.data
                        if(data.updateStatus  === 200) {
                            this.$message({message: '取消订单成功',type: 'success'})
                            this.$router.go(0)
                        } else if(data.updateStatus === 405) {
                            this.$message({message: '取消订单失败',type: 'error'})
                        }
                        this.fullscreenLoading = false
                    }).catch(() => {
                        this.fullscreenLoading = false
                        this.$message({message: '取消订单失败',type: 'error'})
                    })
                }).catch(() => {})
            },
            handleReceiverDistSelect(data) {
                this.receiverForm.area.province = data.province.value
                this.receiverForm.area.city = data.city.value
                this.receiverForm.area.area = data.area.value
            },
            handleSenderDistSelect(data) {
                this.senderForm.area.province = data.province.value
                this.senderForm.area.city = data.city.value
                this.senderForm.area.area = data.area.value
            },
            submitReceiver() {  // 提交  收收收货人  信息
                if(this.vForm('receiverForm')) {
                    this.$confirm('确定要修改收货人信息吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.fullscreenLoading = true
                        this.axios.post('/api/receiverAddressAdmin',{
                            orderId: parseInt(this.orderId),
                            receiverForm: this.receiverForm
                        }).then(res => {
                            this.fullscreenLoading = false
                            console.log(res)
                            let data = res.data
                            if(data.updateStatus === 200) {
                                this.$message({message: '保存成功',type: 'success'})
                            } else if(data.updateStatus === 405) {
                                this.$message({message: '保存失败', type: 'error'})
                            }
                        }).catch(() => {
                            this.fullscreenLoading = false
                            this.$message({message: '保存失败', type: 'error'})
                        })
                    }).catch(() => {})
                }
            },
            submitSenderAndSend() { // 提交  发发发货人信息  并发货
                if(this.addrRadio === '1') {    // 若选中了“从已有发货地址选择”，就不必验证“自定义发货地址”表单
                    this.submitSenderAndSendReq(true)
                }
                if(this.addrRadio === '2') {
                    if(this.vForm('senderForm')) {    // 首先验证 发发发货人 表单
                        this.$confirm('确定要保存发件人信息并发货吗？发货后将无法修改', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.submitSenderAndSendReq(false)
                        }).catch(() => {this.$message({message: '已取消',type: 'info'})})
                    }
                }
            },
            submitSenderAndSendReq(type) {
                this.fullscreenLoading = true
                this.axios.post('/api/senderAddressAdmin',{
                    orderId: parseInt(this.orderId),
                    addressId: this.addressId,
                    senderForm: this.senderForm,
                    type: type  // boolean, true: 根据直接该将订单发货地址id改为addressId, false: 将senderForm存进数据库，并拿到它的addressId存进订单发货地
                }).then(res => {
                    this.fullscreenLoading = false
                    let data = res.data
                    if(data.addStatus === 200) {
                        this.$message({message: '保存并发货成功',type: 'success'})
                        this.$router.go(0)
                    } else if(data.addStatus === 405) {
                        this.$message({message: '保存失败',type: 'error'})
                    }
                }).catch(() => {
                    this.fullscreenLoading = false
                    this.$message({message: '保存失败',type: 'error'})
                })
            },
            vForm(formName) {    // 验证整个表单
                let flag
                this.$refs[formName].validate((valid) => {
                    flag = valid
                })
                return flag
            },
            modifyReceiver() {
                this.recDisable = !this.recDisable
            }
        },
        computed: {
            addrSelectPlaceholder() {   // 发货地址下拉选框placeholder
                return this.addrOptions.length > 0 ? '请选择' : '暂发货地址选项，可在地址管理中添加'
            },
            addrSelectDisable() {   // 当发货地址无可选项时，禁用发货地选择
                return this.addressId === -1
            }
        },
        watch: {
            addrList(list) {
                if(list.length <= 0) {
                    this.addrOptions = [{ value: -1, label: '暂发货地址选项，可在地址管理中添加' }]
                } else {
                    let arr = []
                    this.addrList.forEach(item => {
                        arr.push({
                            value: item.addressId,
                            label: `${item.sender} ${item.area.province} ${item.area.city} ${item.area.area} ${item.addr} ${item.phone} ${item.email}`
                        })
                    })
                    this.addrOptions = arr
                }
            },
            addrOptions() { // 默认选中地址选项第一项
                this.addressId = this.addrOptions[0].value
            },
            addrSelectDisable(value) {
                this.addrRadio = value ? '2' : '1'
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
    .dist-picker >>> select
        font-size inherit
        padding 0
        border-radius 4px
        min-width 80px
    .dist-disabled >>> select
        background-color #F5F7FA
        border-color #E4E7ED
        color #C0C4CC
        cursor not-allowed
    .order-status
        .status
            height 200px
            font-size 1rem
            font-weight 600
            line-height 200px
            text-align center
        .cancel
            color $danger
        .unpaid
            color $blue
        .paid
            color $warning
        .sent
            color #91e998
        .finish
            color $success
    .container
        height 100px
        line-height 100px
        text-align center
    .tips
        color $info
    .el-form
        width 60%
        margin 0 auto
        margin-bottom 100px
        .person-text
            margin-bottom 30px
            font-size .4rem
            text-align center
        .radio-con
            margin-bottom 50px
            .el-radio
                margin-bottom 30px
            .el-select
                display block
        .el-button
            float right
    .modify-btn
        position relative
        top -75px
        left 300px
</style>