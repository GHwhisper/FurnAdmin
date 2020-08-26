<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <el-button v-if="addrList.length > 10" class="new-btn" type="primary">添加新地址</el-button>
            <el-table :data="addrList">
                <el-table-column property="addressId" label="编号" width="80"></el-table-column>
                <el-table-column property="title" label="别名" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column property="sender" label="发货人" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column property="area.province" label="省份" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column property="area.city" label="市区" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column property="area.area" label="区域" width="100" show-overflow-tooltip></el-table-column>
                <el-table-column property="addr" label="详细地址" show-overflow-tooltip></el-table-column>
                <el-table-column property="phone" label="电话" width="120" show-overflow-tooltip></el-table-column>
                <el-table-column property="email" label="邮箱" width="150" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleEidt(scope.row.addressId, scope.$index)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row.addressId)">删除</el-button>
                        <el-button size="mini" v-if="!scope.row.addressDefault" type="text" @click="handleSetDefault(scope.row.addressId)">设为默认</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-button class="new-btn" type="primary" @click="handleNewAddr">添加新地址</el-button>
            <area-dialog :addr="currentAddr" :visible="dialogVisible" @closeDialog="closeDialog"/>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    import AreaDialog from "../../common/dialog/AreaDialog";
    export default {
        name: 'Address',
        components: {
            FrameLayout,
            AreaDialog
        },
        data() {
            return {
                addrList: [],
                dialogVisible: false,
                currentAddr: {},    // 当前编辑的地址信息
                fullscreenLoading: false,
                newAddr: {
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
        },
        methods: {
            async getAddress() {    // 获取地址
                try {
                    this.fullscreenLoading = true
                    let res = await this.axios.get('/api/sender')
                    this.addrList = res.data
                    this.fullscreenLoading = false
                } catch (e) {
                    this.fullscreenLoading = false
                }
            },
            handleEidt(id, index) {    // 编辑地址
                this.dialogVisible = true
                this.currentAddr = this.addrList[index]
            },
            handleDelete(addressId) {  // 删除地址
                this.$confirm('此操作将永久删除该地址，是否继续？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    customClass: 'delete-confirm'
                }).then(() => {
                    this.fullscreenLoading = true
                    this.axios.post('/api/deleteSender', {
                        addressId: addressId
                    }).then((res) => {
                        let data = res.data
                        if(data.deleteStatus === 200) {
                            this.$message({showClose: true,message: '删除成功',type: 'success',duration: 1500})
                            this.getAddress()
                        } else if(data.deleteStatus === 405) {
                            this.$message({showClose: true,message: '删除失败',type: 'error',duration: 1500})
                        }
                        this.fullscreenLoading = false
                    }).catch(() =>{
                        this.fullscreenLoading = false
                        this.$message({showClose: true,message: '删除失败',type: 'error',duration: 1500})
                    })
                }).catch(() => {})
            },
            handleSetDefault(addressId) {    // 设为默认
                this.fullscreenLoading = true
                this.axios.post('/api/setSenderIsDefault', {
                    addressId: addressId
                }).then(res => {
                    let data = res.data
                    if(data.updateStatus === 200) {
                        this.$message({showClose: true,message: '设为默认成功',type: 'success',duration: 1500})
                        this.getAddress()
                    } else if(data.updateStatus === 405) {
                        this.$message({showClose: true,message: '设置默认失败',type: 'error',duration: 1500})
                    }
                    this.fullscreenLoading = false
                }).catch(() => {
                    this.fullscreenLoading = false
                    this.$message({showClose: true,message: '设置默认失败',type: 'success',duration: 1500})
                })
            },
            handleNewAddr() {
                this.dialogVisible = true
                this.currentAddr = this.newAddr
            },
            closeDialog(value) {
                this.dialogVisible = value
            }
        },
        mounted() {
            this.getAddress()
        }
    }
</script>

<style lang="stylus" scoped>
    .new-btn
        margin 20px 30px
        float right
</style>