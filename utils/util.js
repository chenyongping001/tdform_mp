let TOTP = require('totp')

// 获取当前时间秒
function getSeconds() {
  let now = new Date()
  return now.getSeconds()
}

// 解析url 
function parseURL(uri) {
  if (typeof uri !== 'string' || uri.length < 7) return null;
  let source = decodeURIComponent(uri);
  let data = source.split("otpauth://totp/")[1];
  if (data == null) return null;
  /**
   * 数据截断
   */
  let isHaveIssuer = data.split("?")[0].indexOf(":") != -1 && data.split("?")[0].indexOf(":") != 0;
  let remark = "";
  let issuer = "";
  if (isHaveIssuer) {
    remark = data.split("?")[0].split(":")[1];
  } else {
    issuer = data.split("?")[0];
  }
  let secret = data.split("?")[1].split("&")[0].split("=")[1]
  if (secret == null) return null;
  return {
    remark,
    issuer,
    secret
  };
}

// 添加token
function addToken(token, path) {
  if ("" === token.secret) {
    wx.showModal({
      content: '忘记KEY了？',
      showCancel: false,
      confirmText: '返回',
      confirmColor: '#ff9c10',
    })
  } else if (null === TOTP.now(token.secret)) {
    wx.showModal({
      content: 'KEY不合法',
      showCancel: false,
      confirmText: '返回',
      confirmColor: '#ff9c10',
    })
  } else {
    let tokens = []
    let existTokens = wx.getStorageSync("dlgf-totps")
    if (existTokens) 
      tokens = [...existTokens] //数组复制 
    tokens.push(token)
    wx.setStorageSync("dlgf-totps", tokens)

    if ("man" == path) {
      wx.navigateBack({
        delta: 1,
      })
    } else if ("scan" == path) {
      wx.navigateTo({
        url: 'totpIndex',
      })
    }
  }
}

// 删除token
function removeToken(token_id) {
  let token = []
  wx.showModal({
    content: '确定删除吗?',
    showCancel: true,
    cancelText: '取消',
    cancelColor: '#929292',
    confirmText: '确定',
    confirmColor: '#ff9c10',
    success: function (res) {
      if (res.confirm) {
        // 确定删除
        let totps=[]
        totps = wx.getStorageSync("dlgf-totps")
        if(totps){
          totps.splice(token_id, 1)
          wx.setStorageSync("dlgf-totps",totps)
        }
        wx.navigateTo({
          url: 'totpIndex',
        })
      } else if (res.cancel) {
        console.log("cancelled")
      }
    }
  })
}

module.exports = {
  getSeconds: getSeconds,
  addToken: addToken,
  removeToken: removeToken,
  parseURL: parseURL,
}