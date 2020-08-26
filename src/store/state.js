let adminToken = ''
try {
    if(localStorage.getItem('adminToken')) {
        adminToken = localStorage.getItem('adminToken')
    }
} catch(e) {
    window.console.log(e)
}

let adminUsername = ''
try {
    if(localStorage.getItem('adminUsername')) {
        adminUsername = localStorage.getItem('adminUsername')
    }
} catch(e) {
    window.console.log(e)
}

export default {
    adminToken: adminToken,
    adminUsername: adminUsername
}