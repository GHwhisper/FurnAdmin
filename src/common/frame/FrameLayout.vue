<template>
    <div class="con">
        <div class="left">
            <side-bar class="side-bar" />
        </div>
        <div class="right">
            <header-bar />
            <div class="main-con">
                <slot name="main"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    import SideBar from "common/sidebar/SideBar"
    import HeaderBar from "../header/HeaderBar"
    export default {
        name: 'FrameLayout',
        components: {
            SideBar,
            HeaderBar
        },
        props: {
            SideBar
        }
    }
</script>

<style lang="stylus" scoped>
    .con
        width 100%
        min-height 100%
        display flex
        flex-direction row
        align-items stretch
        .left
            width 200px
            min-height 100%
            background-color #545c64
            flex-shrink 0
            .side-bar
                width 100%
        .right
            width calc(100% - 200px)
            min-height 100%
            flex-shrink 0
            .main-con
                min-height 600px
                padding 20px 15px
</style>