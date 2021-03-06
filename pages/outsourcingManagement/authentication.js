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
    app.getSession().then(function (res) {
      that.getHfWxUser(res, e.detail.code)
    })
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
          if (res.data.wx_username) {
            let hfWxUser = res.data.wx_username
            app.globalData.hfWxUser = hfWxUser
            app.globalData.canWxUserAdd= res.data.can_add
            // wx.setStorageSync("tdform-hfwxuser", hfWxUser)
            uniStorage.uniSetStorageSync("tdform-hfwxuser", session,app.globalData.expiries)
            uniStorage.uniSetStorageSync("tdform-canWxUserAdd", session,app.globalData.expiries)
            wx.navigateBack({
              delta: 1,
            })
          }
        }
        wx.showToast({
          title: "您未被授权进入！",
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
  onCancel() {
    wx.reLaunch({
      url: '/pages/index/index',
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