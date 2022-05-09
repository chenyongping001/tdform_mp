import { uniGetStorageSync } from "../../../utils/uniStorage"

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        workbookList: [],
        pagesize: 10,
        nextPage: 1,

        // 检测是否到底加载，避免多次加载
        isReachBottom:false,

        // 是否可添加
        canWxUserAdd:false,

        // 搜索框使用
        inputShowed: false,
        inputVal: '',
        isNewSearch:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.addPageToList()
    },

    addPageToList() {
        const that = this
        app.getSession().then(function (session) {
            wx.request({
                url: `${app.globalData.BASEURL}/outsourcingManagement/workbooks/?search=${that.data.inputVal}&pagesize=${that.data.pagesize}&page=${that.data.nextPage}`,
                header: {
                    'Authorization': app.globalData.AUTH,
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.statusCode === 200) {
                        let list_pre = that.data.workbookList ? that.data.workbookList : []
                        if(that.data.isNewSearch){
                            list_pre = []
                            that.setData({
                                isNewSearch:false
                            })
                        }
                        let list_new = res.data
                        if (list_new.length > 0) {
                            let list = list_pre.concat(list_new)
                            that.setData({
                                workbookList: list,
                            })
                        }
                        else {
                            that.setData({
                                isReachBottom:true
                            })
                        }
                    }
                }
            })
        })

    },

    onWorkbookTap(e) {
        let workbook = this.data.workbookList.find(item => item.id === e.currentTarget.dataset.workbook_id)
        let workbook_str = JSON.stringify(workbook)
        wx.navigateTo({
            url: `/pages/outsourcingManagement/workbook/workbookView?workbook=${workbook_str}`,
        })
    },
    onAddTap(e){
        wx.navigateTo({
          url: '/pages/outsourcingManagement/workbook/workbookAdd',
        })
    },
    onBackTap(e) {
        wx.reLaunch({
          url: '/pages/outsourcingManagement/outsourcingIndex',
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
        getApp().getUserFromSession().then(res => {
            this.setData({
                canWxUserAdd:app.globalData.canWxUserAdd,
            })
        }).catch(function (err) {
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
        let that = this
        if(that.data.isReachBottom){
            return
        }
        wx.request({
            url: `${app.globalData.BASEURL}/outsourcingManagement/get_max_page/?search=${that.data.inputVal}&pagesize=${that.data.pagesize}`,
            header: {
                'Authorization': app.globalData.AUTH,
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.statusCode === 200) {
                    let max_page = res.data.max_page
                    if (max_page > that.data.nextPage) {
                        that.setData({
                            nextPage: that.data.nextPage + 1
                        })
                        that.addPageToList()
                    }
                    else{
                        that.setData({
                            isReachBottom:true
                        }) 
                        wx.showToast({
                            title: "没有更多数据了",
                            icon: 'none',
                            duration: 1000
                        })                
                    }
                }
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    },

    // 搜索框使用
    showInput() {
        this.setData({
            inputShowed: true,
        });
    },
    hideInput() {
        this.setData({
            inputVal: '',
            inputShowed: false,
            isNewSearch:true,
            nextPage:1,
            isReachBottom:false,
        });
        this.addPageToList()
    },
    clearInput() {
        this.setData({
            inputVal: '',
        });
    },
    inputTyping(e) {
        this.setData({
            inputVal: e.detail.value,
        });
    },
    searchConfirm(){
        this.setData({
            isNewSearch:true,
            nextPage:1,
            isReachBottom:false,
        })
        this.addPageToList()
    }
})