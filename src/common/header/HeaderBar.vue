<template>
    <div class="header-con">
        <div class="admin">
            {{adminUsername}}，你好！<span class="logout" @click="logout">退出</span>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex'
    export default {
        name: 'HeaderBar',
        methods: {
            async logout() {
                let res = await this.axios.get('/api/loginOutAdmin')
                let data = res.data
                console.log(res)
                if(data.status === true) {
                    this.removeAdminInfo()
                    this.$router.replace('/admin/login')
                } else {
                    this.$router.replace('/admin/login')
                }
            },
            ...mapMutations(['removeAdminInfo'])
        },
        computed: {
            ...mapState(['adminUsername'])
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .header-con
        height 80px
        background-color #ffffff
        box-shadow 0 1px 10px #bbbbbb
        padding 0 30px
        line-height 80px
        text-align right
        color $fontColor_intro
        .logout
            cursor pointer
            margin-left 10px
            &:hover
                color $activeColor
</style>