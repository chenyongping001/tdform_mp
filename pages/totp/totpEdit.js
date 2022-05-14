// pages/edit/edit.js
let util = require('../../utils/util')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        token: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let token = JSON.parse(options.token)
        this.setData({
            token: token
        })
    },

    formInputChange(e) {
        const {
            field
        } = e.currentTarget.dataset
        this.setData({
            [`token.${field}`]: e.detail.value
        })
    },
    // 修改并提交数据
    keySubmit: function (e) {
        wx.request({
            url: `${app.globalData.BASEURL}/wxauth/useful_totp/`,
            header: {
                'Authorization': app.globalData.AUTH,
                'content-type': 'application/json'
            },
            data: {
                id: this.data.token.id,
                isuser: this.data.token.isuser,
                remark: this.data.token.remark,
            },
            method: "POST",
            success(res) {
                if (res.statusCode === 200) {
                    wx.redirectTo({
                        url: 'totpIndex',
                      })
                }
            },
        })
    }

})