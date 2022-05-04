// app.js
App({
  onLaunch() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight
      }
    })
    // this.globalData.session = wx.getStorageSync('tdform-session')
    // this.globalData.hfWxUser = wx.getStorageSync('tdform-hfwxuser')
  },

  getSession: function () {
    const that = this
    return new Promise(function (resolve, reject) {
      if (that.globalData.session) {
        resolve(that.globalData.session)
        return
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
                  // wx.setStorageSync("tdform-session", session)
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
                that.globalData.hfWxUser = hfWxUser
                that.globalData.canWxUserAdd= res2.data.can_add
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
    canWxUserAdd:false,
  },
})