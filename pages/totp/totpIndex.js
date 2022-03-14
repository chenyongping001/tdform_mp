// pages/index/index.js
let TOTP = require('../../utils/totp')
let util = require('../../utils/util')
let percentage = 0
let timer = null;
Page({
  data: {
    totps: [],
    tokens: [],
    animationData: {},
    warn:false
  },

  onShareAppMessage: function (res) {
  },
  onLoad:function(){
  },
  onShow: function (options) {
    this.setData({
      totps:wx.getStorageSync('dlgf-totps')
    })
    let self = this
    let sc_width = 0
    // 获取屏幕宽度
    wx.getSystemInfo({
      success: function(res) {
        sc_width = res.windowWidth
      },
    })

    // 定义动画
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "linear",
      delay: 0,
    })
    // 每秒更新百分比
    timer = setInterval(function () {
      // 更新动画
      let i = util.getSeconds() % 30 + 1
      animation.width((sc_width/30 * i)).step()
      self.setData({
        animationData: animation.export()
      })
      if (1 == i) {
        self.updateDigits(self)
      }
      self.updateWarnStyle(i);
    }, 1000)

    self.updateDigits(self);
    self.updateWarnStyle(0);
  },

  /**
   * 编辑或删除token
   */
  tokenOperation: function (e) {
    const that = this

    wx.showActionSheet({
      itemList: ["复制","编辑", "删除"],
      itemColor: '#000000',
      success: function(res) {
        if(0 == res.tapIndex){
          wx.setClipboardData({data: that.data.tokens[e.currentTarget.id].secret});
        }
        else if (1 == res.tapIndex) {
          wx.navigateTo({
            url: '../totp/totpEdit?token_id='+e.currentTarget.id
          })
        } else if (2 == res.tapIndex) {
          util.removeToken(e.currentTarget.id)
        }
      }
    })
  },
  

  /**
   * 显示操作菜单
   */
  showActionSheet: function () {
    wx.showActionSheet({
      itemList: ["扫描二维码", "手动输入"],
      itemColor: '#000000',
      success: function(res) {
        if (0 == res.tapIndex) {
          wx.scanCode({
            onlyFromCamera: false,
            success: function(res) {
              let url_params = util.parseURL(res.result)
              if (null === url_params) {
                console.log("invalid secret")
                wx.showModal({
                  content: '无效二维码',
                  showCancel: false,
                  confirmText: '返回',
                  confirmColor: '#ff9c10',
                })
              } else {
                let values = {
                  issuer: url_params.issuer==null?"UNKNOWN":url_params.issuer,
                  remark: url_params.remark==null?"UNKNOWN":url_params.remark,
                  secret: url_params.secret,
                }
                util.addToken(values, "scan")
              }
            },
            fail: function(res) {},
            complete: function(res) {},
          })
        } else if (1 == res.tapIndex) {
          wx.navigateTo({
            url: '../totp/totpForm',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
        }
      },
      fail: function(res) {
        console.log("显示操作菜单错误")
      },
      complete: function(res) {},
    })
  },


  updateDigits: function (self) {
    let digits = []
    let totps = this.data.totps
    if(totps.length>0)
      digits = totps.map(totp=>{
        const digit = {...totp}
        digit.secret = TOTP.now(totp.secret)
        return digit
      })
      this.setData({
        tokens:digits
      }) 
  },
  updateWarnStyle(i){
    this.setData({warn:(i>24&&i%2==1)?true:false})
  },
  onHide(){
    if(timer){
      clearInterval(timer);
    }
  },
  onBackTap(e){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
})