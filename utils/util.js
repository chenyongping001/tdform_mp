let TOTP = require('totp')
const app = getApp()
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
    let isHaveIsuser = data.split("?")[0].indexOf(":") != -1 && data.split("?")[0].indexOf(":") != 0;
    let remark = "";
    let isuser = "";
    if (isHaveIsuser) {
        remark = data.split("?")[0].split(":")[1];
    } else {
        isuser = data.split("?")[0];
    }
    let secret = data.split("?")[1].split("&")[0].split("=")[1]
    if (secret == null) return null;
    return {
        remark,
        isuser,
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
        app.getSession().then(function (session) {
            wx.request({
                url: `${app.globalData.BASEURL}/wxauth/totps/`,
                header: {
                    'Authorization': app.globalData.AUTH,
                    'content-type': 'application/json'
                },
                data: {
                    session: session,
                    isuser: token.isuser,
                    remark: token.remark,
                    secret: token.secret,
                },
                method: "POST",
                success(res) {
                    if (res.statusCode === 201) {
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
                },
            })
        })

        
    }
}

// 删除token
function removeToken(token_id) {
    wx.showModal({
        content: '确定删除吗?',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#929292',
        confirmText: '确定',
        confirmColor: '#ff9c10',
        success: function (res) {
            if (res.confirm) {
                wx.request({
                    url: `${app.globalData.BASEURL}/wxauth/totps/${token_id}`,
                    header: {
                        'Authorization': app.globalData.AUTH,
                        'content-type': 'application/json'
                    },
                    method: 'DELETE',
                    success(res) {
                        wx.redirectTo({
                          url: 'totpIndex',
                        })
                    }
                })
            } else if (res.cancel) { }
        }
    })
}

module.exports = {
    getSeconds: getSeconds,
    addToken: addToken,
    removeToken: removeToken,
    parseURL: parseURL,
}