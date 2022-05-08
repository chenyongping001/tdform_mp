
// 存
function uniSetStorageSync(key, data, expires) {
    if (!expires) return
    if (typeof expires !== 'number') {
        console.error('expires is not a number')
        return
    }
    wx.setStorageSync(key, { data, expires: +new Date() + expires })
}

// 取
function uniGetStorageSync(key) {
    const data = wx.getStorageSync(key)
    // 如果data不是个对象就说明是没加有效期的，直接返回
    if (typeof data === 'object' && data.expires) {
        const now = +new Date()
        if (now < data.expires) {//用当前时间和存储的时间对比
            return data.data // 未过期返回data
        }
    }
    wx.removeStorageSync(key)
    return null
}
module.exports = {
    uniGetStorageSync: uniGetStorageSync,
    uniSetStorageSync: uniSetStorageSync,
}
