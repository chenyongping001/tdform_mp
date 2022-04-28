// app.js
App({
  onLaunch() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight
      }
    })
  },

  getSession: function () {
    const that = this
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          if (res.code) {
            wx.request({
              url: `${that.globalData.BASEURL}/wxauth/${res.code}`,
              header:{
                'Authorization':that.globalData.AUTH,
                'content-type': 'application/json'
              },
              success: function (res) {
                if (res.statusCode === 200) {
                  let session = res.data.session
                  that.globalData.session=session
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

  globalData: {
    session: null,
    // BASEURL: 'https://www.td.masterpeak.cn/tdform',
    BASEURL: 'https://www1.td.masterpeak.cn',
    AUTH:'Basic b3V0c2lkZXI6YWJjZDEyMzQs',///outsider用户
    statusBarHeight:0,
    // 20220427 添加
    hfWxUser: null,
  },
})