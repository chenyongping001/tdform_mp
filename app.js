// app.js
let uniStorage = require('./utils/uniStorage')
App({
    onLaunch() {
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.statusBarHeight = res.statusBarHeight
            }
        })
        // this.globalData.session = uniStorage.uniGetStorageSync('tdform-session')
        // this.globalData.hfWxUser = uniStorage.uniGetStorageSync('tdform-hfwxuser')
        // this.globalData.canWxUserAdd = uniStorage.uniGetStorageSync('tdform-canWxUserAdd')
    },

    getSession: function () {
        const that = this
        return new Promise(function (resolve, reject) {
            if (that.globalData.session) {
                resolve(that.globalData.session)
                return
            }
            else {
                that.globalData.session = uniStorage.uniGetStorageSync('tdform-session')
                if (that.globalData.session) {
                    resolve(that.globalData.session)
                    return
                }
            }
            wx.login({
                success: res => {
                    if (res.code) {
                        wx.request({
                            url: `${that.globalData.BASEURL}/wxauth/${res.code}`,
                            header: {
                                'Authorization': that.globalData.AUTH,
                                'content-type': 'application/json'
                            },
                            success: function (res) {
                                if (res.statusCode === 200) {
                                    let session = res.data.session
                                    that.globalData.session = session
                                    uniStorage.uniSetStorageSync("tdform-session", session, that.globalData.expiries)
                                    resolve(session) //Promise成功的数据传递
                                }
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                    }
                },
            })
        })
    },

    getUserFromSession: function () {
        const that = this
        return new Promise(function (resolve, reject) {
            that.getSession().then(function (res) {
                if (that.globalData.hfWxUser) {
                    resolve(that.globalData.hfWxUser)
                    return
                }
                else {
                    that.globalData.hfWxUser = uniStorage.uniGetStorageSync('tdform-hfwxuser')
                    that.globalData.canWxUserAdd = uniStorage.uniGetStorageSync('tdform-canWxUserAdd')
                    if (that.globalData.hfWxUser) {
                        resolve(that.globalData.hfWxUser)
                        return
                    }
                }
                wx.request({
                    url: `${that.globalData.BASEURL}/wxauth/wx_getUserFromSession/${res}`,
                    header: {
                        'Authorization': that.globalData.AUTH,
                        'content-type': 'application/json'
                    },
                    success: function (res2) {
                        if (res2.statusCode === 200) {
                            if (res2.data.wx_username) {
                                let hfWxUser = res2.data.wx_username
                                let canWxUserAdd = res2.data.can_add
                                that.globalData.hfWxUser = hfWxUser
                                that.globalData.canWxUserAdd = canWxUserAdd
                                uniStorage.uniSetStorageSync("tdform-hfwxuser", hfWxUser, that.globalData.expiries)
                                uniStorage.uniSetStorageSync("tdform-canWxUserAdd", canWxUserAdd, that.globalData.expiries)

                                resolve(hfWxUser)
                            }
                            else {
                                reject("unauthorized")
                            }
                        }
                    }
                })
            })

        })
    },

    globalData: {
        session: null,
        BASEURL: 'https://www.td.masterpeak.cn/tdform',
        // BASEURL: 'https://www1.td.masterpeak.cn',
        AUTH: 'Basic b3V0c2lkZXI6YWJjZDEyMzQs',///outsider用户
        statusBarHeight: 0,
        // 20220427 添加
        hfWxUser: null,
        canWxUserAdd: false,
        // 20220508添加,本地Storage有效期，以毫秒为单位
        // 86400000为1天
        expiries: 86400000,
    },
})