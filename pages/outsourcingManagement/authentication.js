// pages/ourtsourcingManagement/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getPhoneNumber(e) {
    var that = this
    if (app.globalData.session) {
      that.getHfWxUser(app.globalData.session, e.detail.code)
    } else {
      app.getSession().then(function (res) {
        that.getHfWxUser(res, e.detail.code)
      })
    }
  },
  getHfWxUser(session, code) {
    wx.request({
      url: `${app.globalData.BASEURL}/wxauth/wx_getHfWxUser/${code}/${session}`,
      header: {
        'Authorization': app.globalData.AUTH,
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)
          if (res.data.wx_username) {
            let hfWxUser = res.data.wx_username
            console.log(hfWxUser)
            app.globalData.hfWxUser=hfWxUser
            wx.navigateBack({
              delta: 1,
            })
          }
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})