// pages/myOvertimeInto/myOvertimeInto.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    overtimeintoList: [],
    status: ['待处理', '无此持卡人', '找不到联系人', '已生成申请单', '审批中', '通过', '已删除', '施工证已过期'],
    statusColor: ['rgb(165, 82, 10', 'red', 'red', 'midnightblue', 'midnightblue', 'lightseagreen', 'red', 'red'],
    gateItems: ['一号门', '厂前区']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var list = wx.getStorageSync("OVERTIMEINTOLIST")
    if (list) { // 本地如果有缓存列表，提前渲染
      that.setData({
        overtimeintoList: list
      })
    }
    app.getSession().then(function (res) {
      that.reDraw(res)
    })

  },

  reDraw(session) {
    const that = this
    wx.request({
      url: `${app.globalData.BASEURL}/covidform/overtimeintos/?weixinid=${session}`,
      header: {
        'Authorization': app.globalData.AUTH,
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          let list = res.data
          that.setData({ // 再次渲染列表
            overtimeintoList: list
          })
          wx.setStorageSync("OVERTIMEINTOLIST", list) // 覆盖缓存数据
        }
      }
    })
  },

  onDelete: function (e) {
    const that = this
    wx.showModal({
      title: '警告',
      content: '您确定要删除这条申报单吧',
      success(res) {
        if (res.confirm) {
          let id = e.currentTarget.dataset.id
          wx.request({
            url: `${app.globalData.BASEURL}/covidform/overtimeintos/${id}`,
            header: {
              'Authorization': app.globalData.AUTH,
              'content-type': 'application/json'
            },
            method: 'DELETE',
            success(res) {
              const list = that.data.overtimeintoList.filter(item => item.id != id)
              that.setData({
                overtimeintoList: list
              })
            }
          })
        } else if (res.cancel) { }
      }
    })
  },

  onBackTap(e) {
    wx.reLaunch({
      url: '/pages/mine/mine',
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