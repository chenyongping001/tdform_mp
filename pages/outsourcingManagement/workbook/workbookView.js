// pages/myOvertimeInto/myOvertimeInto.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
       workbook:null,
       baseurl:app.globalData.BASEURL,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let workbook = JSON.parse(options.workbook)
        this.setData({
            workbook:workbook,
        })

    },
    previewImage: function (e) {
        wx.previewImage({
          current: e.currentTarget.id, // 当前显示图片的http链接
          urls: this.data.workbook.files.map(m=>this.data.baseurl+m) // 需要预览的图片http链接列表
        })
      },

    weSubmitForm() {
        wx.navigateBack({
          delta: 1,
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
        getApp().getUserFromSession().then(res=>{}).catch(function (err) {
            wx.navigateTo({
              url: '/pages/outsourcingManagement/authentication',
            })
          })
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