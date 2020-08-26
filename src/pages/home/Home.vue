<template>
    <frame-layout v-loading.fullscreen.lock="fullscreenLoading">
        <template #main>
            <div class="cards">
                <div class="box-card">
                    <i class="el-icon-money money-icon" />
                    <div class="right">
                        <div class="num"><animated-number :value="total" :formatValue="formatToPrice" :duration="2000" /></div>
                        <div class="text">营业额</div>
                    </div>
                </div>
                <div class="box-card">
                    <i class="el-icon-shopping-cart-full cart-icon" />
                    <div class="right">
                        <div class="num"><animated-number :value="sold" :formatValue="formatToCount" :duration="2000" /></div>
                        <div class="text">售出</div>
                    </div>
                </div>
                <div class="box-card">
                    <i class="el-icon-tickets order-icon" />
                    <div class="right">
                        <div class="num"><animated-number :value="order" :formatValue="formatToCount" :duration="2000" />
                        </div><div class="text">订单</div></div>
                </div>
                <div class="box-card">
                    <i class="el-icon-user user-icon" />
                    <div class="right">
                        <div class="num"><animated-number :value="user" :formatValue="formatToCount" :duration="2000" />
                        </div><div class="text">用户</div></div>
                </div>
            </div>
            <div class="charts">
                <!--订单饼状图-->
                <div ref="pieChart" class="l-col chart-item"></div>
                <!--营销额折线图-->
                <div ref="lineChart" class="r-col chart-item"></div>
            </div>
            <div class="charts">
                <!--订单、销量折线图-->
                <div ref="orderLineChart" class="order-chart chart-item"></div>
            </div>
        </template>
    </frame-layout>
</template>

<script>
    import FrameLayout from "../../common/frame/FrameLayout";
    import AnimatedNumber from "animated-number-vue";
    const echarts = require('echarts')
    export default {
        name: 'Home',
        components: {
            FrameLayout,
            AnimatedNumber
        },
        data() {
            return {
                total: 0,   // 销售额
                sold: 0,    // 销售量
                order: 0,   // 订单数
                user: 0,    // 用户数
                orderChart: [],
                lineChart: {},
                fullscreenLoading: false
            }
        },
        methods: {
            async getHomeInfo() {
                try {
                    this.fullscreenLoading = true
                    let res = await this.axios.get('/api/home')
                    this.total = res.data.total
                    this.sold = res.data.sold
                    this.order = res.data.order
                    this.user = res.data.user
                    this.orderChart = res.data.orderChart
                    this.lineChart = res.data.lineChart
                    this.drawCharts()
                    this.fullscreenLoading = false
                }
                catch (e) {
                    this.fullscreenLoading = false
                }
            },
            formatToPrice(value) {
                return `￥${value.toFixed(2)}`
            },
            formatToCount(value) {
                return `${value.toFixed(0)}`
            },
            initPieChart() {    // 饼状图（订单）
                let pieChart = echarts.init(this.$refs.pieChart)
                pieChart.setOption({
                    title: {text: '订单', subtext: '完成情况', left: 'center'},
                    tooltip: {trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)'},
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['已取消', '待付款', '待发货', '已发货', '已完成']
                    },
                    series: [
                        {
                            name: '订单',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: this.orderChart,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                })
            },
            initLineChart() {   // 折线图（营销额）
                let lineChart = echarts.init(this.$refs.lineChart)
                lineChart.setOption({
                    title: {text: '营业额'},
                    tooltip: {trigger: 'axis'},
                    legend: {data: ['营业额']},
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: this.lineChart.date
                    },
                    yAxis: {type: 'value'},
                    series: [
                        {
                            name: '营业额',
                            type: 'line',
                            data: this.lineChart.total
                        }
                    ]
                })
            },
            initOrderLineChart() {  // 订单数、销量折线图
                let orderLineChart = echarts.init(this.$refs.orderLineChart)
                orderLineChart.setOption({
                    title: {text: '订单及销量'},
                    tooltip: {trigger: 'axis'},
                    legend: {data: ['销售量', '订单数']},
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: this.lineChart.date
                    },
                    yAxis: {type: 'value'},
                    series: [
                        {
                            name: '销售量',
                            type: 'line',
                            data: this.lineChart.sold
                        },
                        {
                            name: '订单数',
                            type: 'line',
                            data: this.lineChart.order
                        }
                    ]
                })
            },
            drawCharts() {
                this.initPieChart()
                this.initLineChart()
                this.initOrderLineChart()
            }
        },
        mounted() {
            this.getHomeInfo()
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~styles/varibles.styl"
    .cards
        display flex
        .box-card
            width 25%
            height 100px
            display flex
            flex-direction row
            background-color #ffffff
            box-shadow $shadow_3
            border-radius 5px
            align-items center
            padding 20px
            margin 15px
            i
                width 30%
                font-size .9rem
                margin-right 20px
                text-align center
            .right
                flex 1
                display flex
                flex-direction column
                justify-content center
                .num
                    font-size .5rem
                .text
                    font-size .32rem
                    margin-top 10px
                    color $fontColor_intro
            .money-icon
                color $success
            .cart-icon
                color #ff6b31
            .order-icon
                color #4fa9ff
            .user-icon
                color #bf93ff
    .charts
        border-radius 5px
        display flex
        .chart-item
            height 410px
            display inline-block
            margin 15px
            border-radius 5px
            box-shadow $shadow_3
            padding 10px
        .l-col
            width 30%
        .r-col
            width 70%
        .order-chart
            width 100%
</style>