<template>
  <div id="app">
    <keep-alive exclude="Login,OrderDetail,OrderEdit">
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: 'App',
  }
</script>

<style lang="stylus">
  #app
    height 100%
    min-width 1300px
</style>
