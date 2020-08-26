<template>
    <div class="bg-con" v-loading.fullscreen.lock="fullscreenLoading">
        <div class="login-con">
            <div class="text">悦家管理员登录</div>
            <div class="form">
                <el-input placeholder="用户名" v-model.trim="form.username" clearable>
                    <template slot="prepend">用户名</template>
                </el-input>
                <el-input placeholder="用户名" v-model.trim="form.password" type="password" show-password clearable>
                    <template slot="prepend">密码</template>
                </el-input>
                <el-button @click="login">登录</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import { mapMutations } from 'vuex'
    export default {
        name: 'Login',
        data() {
            return {
                form: {
                    username: '',
                    password: ''
                },
                fullscreenLoading: false
            }
        },
        methods: {
            login() {
                if(this.form.username === '' || this.form.password === '') {
                    this.$message({message: '请输入用户名和密码',type: 'warning'})
                    return
                }
                this.fullscreenLoading = true
                axios.post('/api/loginAdmin', {
                    username: this.form.username,
                    password: this.form.password
                }).then(res => {
                    this.fullscreenLoading = false
                    let data = res.data
                    if(data.status === 200) {
                        this.setAdminToken(data.token)
                        this.setAdminUsername(data.adminUsername)
                        this.$router.replace('/admin/home')
                    } else if(data.status === 406) {
                        this.$message({message: '用户名或密码错误',type: 'error'})
                    } else if(data.status === 408) {
                        this.$message({message: '您已登录', type: 'success'})
                        this.$router.replace('/admin/home')
                    }
                }).catch(() => {
                    this.fullscreenLoading = false
                    this.$message({message: '服务器异常，登录失败', type: 'error'})
                })
            },
            ...mapMutations(['setAdminToken', 'setAdminUsername'])
        }
    }
</script>

<style lang="stylus" scoped>
    .el-input >>> .el-input-group__prepend
        width 60px
        padding 15px
        text-align center
    .el-input >>> input
        height 60px
    .bg-con
        width 100%
        height 100%
        background-image url("../../assets/images/bg.jpg")
        background-repeat no-repeat
        background-size cover
        .login-con
            width 400px
            height 500px
            background-color rgba(255, 255, 255, .4)
            margin 0 auto
            position relative
            top 50%
            transform translateY(-50%)
            border-radius 8px
            .text
                font-size 20px
                height 60px
                line-height 60px
                padding 0 20px
                color #ffffff
                font-weight 600
                border-bottom 1px solid #ffffff
            .form
                padding 50px 20px
                box-sizing border-box
                .el-input
                    margin-bottom 50px
                .el-button
                    width 100%
                    height 60px
                    font-size .3rem
                    font-weight 600
</style>