// pages/index/index.js
const totp = require('../../utils/totp');
let TOTP = require('../../utils/totp')
let util = require('../../utils/util')
let percentage = 0
let timer = null;
const app = getApp()
Page({
    data: {
        totps: [],
        tokens: [],
        animationData: {},
        warn: false
    },

    onShareAppMessage: function (res) {
    },
    onLoad: function () {
    },
    onShow: function (options) {
        let self = this
        let hasTotpAtServer = wx.getStorageSync('dlgf-totps-at-server')
        if (hasTotpAtServer) {
            let totps = wx.getStorageSync('dlgf-totps')
            self.saveToStorageAndUpdate(totps)
            self.getTotpsFromServer().then(totpsServer => {
                self.saveToStorageAndUpdate(totpsServer)
            }).catch(err => { })
        }
        else {
            self.getTotpsFromServer().then(totps => {
                if (totps.length > 0) {
                    self.saveToStorageAndUpdate(totps)
                }
                else {
                    let totps = wx.getStorageSync('dlgf-totps')
                    if (totps && totps.length > 0) {
                        let totp = totps[0]
                        app.getSession().then(function (session) {
                            wx.request({
                                url: `${app.globalData.BASEURL}/wxauth/totps/`,
                                header: {
                                    'Authorization': app.globalData.AUTH,
                                    'content-type': 'application/json'
                                },
                                data: {
                                    session: session,
                                    // 这里之前有个命名错误，用了issuer,所以之前本地用totp.issuer
                                    isuser: totp.issuer,
                                    remark: totp.remark,
                                    secret: totp.secret,
                                },
                                method: "POST",
                                success(res) {
                                    if (res.statusCode === 201) {
                                        console.log(res.data)
                                        console.log("回写成功！")
                                        self.saveToStorageAndUpdate([res.data])
                                    }
                                },
                            })
                        })

                    }
                }
            }).catch(err => {})
        }
    },

    getTotpsFromServer() {
        const that = this
        return new Promise(function (resolve, reject) {
            app.getSession().then(function (res) {
                wx.request({
                    url: `${app.globalData.BASEURL}/wxauth/totps/?session=${res}`,
                    header: {
                        'Authorization': app.globalData.AUTH,
                        'content-type': 'application/json'
                    },
                    success: function (res2) {
                        if (res2.statusCode === 200) {
                            if (res2.data) {
                                resolve(res2.data)
                            }
                            else {
                                reject("None")
                            }
                        }
                    }
                })
            })

        })
    },

    saveToStorageAndUpdate(totps) {
        let self = this
        wx.setStorageSync('dlgf-totps', totps)
        wx.setStorageSync('dlgf-totps-at-server', totps.length>0?'yes':null)
        this.setData({
            totps: totps
        })
        let sc_width = 0
        // 获取屏幕宽度
        wx.getSystemInfo({
            success: function (res) {
                sc_width = res.windowWidth
            },
        })

        // 定义动画
        let animation = wx.createAnimation({
            duration: 1000,
            timingFunction: "linear",
            delay: 0,
        })
        // 每秒更新百分比
        timer = setInterval(function () {
            // 更新动画
            let i = util.getSeconds() % 30 + 1
            animation.width((sc_width / 30 * i)).step()
            self.setData({
                animationData: animation.export()
            })
            if (1 == i) {
                self.updateDigits(self)
            }
            self.updateWarnStyle(i);
        }, 1000)

        self.updateDigits(self);
        self.updateWarnStyle(0);
    },

    /**
     * 编辑或删除token
     */
    tokenOperation: function (e) {
        const that = this

        wx.showActionSheet({
            itemList: ["复制", "编辑", "删除"],
            itemColor: '#000000',
            success: function (res) {
                if (0 == res.tapIndex) {
                    wx.setClipboardData({
                        data: that.data.tokens.find(m => m.id === e.currentTarget.dataset.id).secret
                    });
                }
                else if (1 == res.tapIndex) {
                    let token = that.data.tokens.find(token => token.id === e.currentTarget.dataset.id)
                    let token_str = JSON.stringify(token)
                    wx.redirectTo({
                        url: `/pages/totp/totpEdit?token=${token_str}`,
                    })
                } else if (2 == res.tapIndex) {
                    util.removeToken(e.currentTarget.dataset.id)
                }
            }
        })
    },


    /**
     * 显示操作菜单
     */
    showActionSheet: function () {
        wx.showActionSheet({
            itemList: ["扫描二维码", "手动输入"],
            itemColor: '#000000',
            success: function (res) {
                if (0 == res.tapIndex) {
                    wx.scanCode({
                        onlyFromCamera: false,
                        success: function (res) {
                            let url_params = util.parseURL(res.result)
                            if (null === url_params) {
                                console.log("invalid secret")
                                wx.showModal({
                                    content: '无效二维码',
                                    showCancel: false,
                                    confirmText: '返回',
                                    confirmColor: '#ff9c10',
                                })
                            } else {
                                let values = {
                                    isuser: url_params.isuser == null ? "UNKNOWN" : url_params.isuser,
                                    remark: url_params.remark == null ? "UNKNOWN" : url_params.remark,
                                    secret: url_params.secret,
                                }
                                util.addToken(values, "scan")
                            }
                        },
                        fail: function (res) { },
                        complete: function (res) { },
                    })
                } else if (1 == res.tapIndex) {
                    wx.navigateTo({
                        url: '../totp/totpForm',
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { },
                    })
                }
            },
            fail: function (res) {
                console.log("显示操作菜单错误")
            },
            complete: function (res) { },
        })
    },


    updateDigits: function (self) {
        let digits = []
        let totps = this.data.totps
        if (totps.length > 0)
            digits = totps.map(totp => {
                const digit = { ...totp }
                digit.secret = TOTP.now(totp.secret)
                return digit
            })
        this.setData({
            tokens: digits
        })
    },
    updateWarnStyle(i) {
        this.setData({ warn: (i > 24 && i % 2 == 1) ? true : false })
    },
    onHide() {
        if (timer) {
            clearInterval(timer);
        }
    },
    onBackTap(e) {
        wx.reLaunch({
            url: '/pages/index/index',
        })
    },
})