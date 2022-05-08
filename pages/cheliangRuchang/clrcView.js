// pages/myOvertimeInto/myOvertimeInto.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        recordItem: null,
        canDelete: false,
        filePath: '',
        baseurl: app.globalData.BASEURL,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let recordItem = JSON.parse(options.recordItem)
        this.setData({
            canDelete: [0, 1, 5].includes(recordItem.status)
        })
        let filePath = recordItem.files.find(
            m => ['doc', 'docx', 'xls', 'xlsx'].includes(m.substring(m.lastIndexOf('.') + 1))
        )
        if (filePath) {
            this.setData({
                filePath: filePath,
            })
        }
        recordItem.files = recordItem.files.filter(
            m => ['doc', 'docx', 'xls', 'xlsx'].includes(m.substring(m.lastIndexOf('.') + 1)) === false
        )
        this.setData({
            recordItem: recordItem,
        })

    },

    onFileTap(e) {
        var that = this
        wx.downloadFile({
            url: `${app.globalData.BASEURL}${that.data.filePath}`,
            success: function (res) {
                const filePath = res.tempFilePath
                wx.openDocument({
                    showMenu: true,
                    filePath: filePath,
                    success: function (res) {
                        console.log('打开文档成功')
                    }
                })
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.recordItem.files.map(m => this.data.baseurl + m) // 需要预览的图片http链接列表
        })
    },

    onBackTap() {
        wx.navigateBack({
            delta: 1,
        })
    },
    onDeleteTap(e) {
        const that = this
        wx.showModal({
            title: '警告',
            content: '您确定要删除这条申报记录吗？',
            success(res) {
                if (res.confirm) {
                    let id = e.currentTarget.dataset.id
                    wx.request({
                        url: `${app.globalData.BASEURL}/covidform/clrcs/${id}`,
                        header: {
                            'Authorization': app.globalData.AUTH,
                            'content-type': 'application/json'
                        },
                        method: 'DELETE',
                        success(res) {
                            wx.redirectTo({
                              url: '/pages/cheliangRuchang/myClrc',
                            })
                        }
                    })
                } else if (res.cancel) { }
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