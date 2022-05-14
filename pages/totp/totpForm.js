// pages/form/form.js
let util = require('../../utils/util')
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
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  formInputChange(e) {
    const {
        field
    } = e.currentTarget.dataset
    this.setData({
        [`token.${field}`]: e.detail.value
    })
},

  /**
   * 提交数据
   */
  keySubmit: function (e) {
    util.addToken(this.data.token, "man")
  }
})