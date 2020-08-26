export default {
    setAdminToken(state, value) {    // 存入管理员token
        state.adminToken = value
        localStorage.setItem('adminToken', value)
    },
    setAdminUsername(state, value) {     // 存入管理员用户名
        state.adminUsername = value
        localStorage.setItem('adminUsername', value)
    },
    removeAdminInfo(state) {     // 删除token和用户名
        state.adminToken = ''
        state.adminUsername = ''
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUsername')
    },
}