// pages/tempIntoAdd/tempIntoAdd.js
import WxValidate from "../../utils/wxValidate"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSending: false,
    ////////////////////////////////////////////
    name: "",
    idcard: "",
    outCompany: "",
    project: "",
    reason: "",
    note: "",
    contact: "",
    contactPhone: "",
    files: [],
    isHealth: ['否', '是'],
    days: ['一天', '二天','三天'],
    isOutProvince: ['否', '是'],
    healthValue: 1,
    daysValue: 0,
    outProvinceValue: 0,
    files2: [],
    filename:'',
  },
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },
  onIdcardInput(e) {
    this.setData({
      idcard: e.detail.value
    })
  },
  onOutcompanyInput(e) {
    this.setData({
      outCompany: e.detail.value
    })
  },
  onProjectInput(e) {
    this.setData({
      project: e.detail.value
    })
  },
  onReasonInput(e) {
    this.setData({
      reason: e.detail.value
    })
  },
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },
  onContactphoneInput(e) {
    this.setData({
      contactPhone: e.detail.value
    })
  },
  onAddFiles(e){
    const that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension:['doc','docx','xls','xlsx'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles
        that.setData({
          filename:tempFilePaths[0].name,
          files2: [tempFilePaths[0].path]
        })
      }
    })
  },
  onTemplateTap(e){
    wx.downloadFile({
      url: `${app.globalData.BASEURL}/uploads/example.doc`,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          showMenu:true,
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      count:6,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const files = res.tempFilePaths.map(n=>({isUploading:false,path:n}))
        // 添加一个属性isUploading,用来表示是否在上传过程中
        that.setData({
          files: that.data.files.concat(files)
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files.map(n=>n.path) // 需要预览的图片http链接列表
    })
  },
  deleteImage: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除图片吗？',
      success(res) {
        if (res.confirm) {
          var files = that.data.files;
          var index = e.currentTarget.dataset.index;
          files.splice(index, 1);
          that.setData({
            files: files,
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  bindHealthChange: function (e) {
    this.setData({
      healthValue: e.detail.value
    })
  },
  bindDaysChange: function (e) {
    this.setData({
      daysValue: e.detail.value
    })
  },
  
  bindOutProvinceChange: function (e) {
    this.setData({
      outProvinceValue: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initValidate()
  },
  initValidate() {
    const rules = {
      name: {
        required: true,
        maxlength: 10
      },
      idcard: {
        required: true,
        idcard: true
      },
      outCompany: {
        required: true,
      },
      reason: {
        required: true,
      },
      contact: {
        required: true,
        maxlength: 10
      },
      contactPhone: {
        required: true,
        tel: true
      }
    }
    const messages = {
      name: {
        required: "请输入入厂人员姓名",
        maxlength: "请输入正确的姓名"
      },
      idcard: {
        required: "请输入身份证号",
      },
      outCompany: {
        required: "请输入外包单位名称",
      },
      reason: {
        required: "请输入入厂理由",
      },
      contact: {
        required: "请输入电厂联系人姓名",
        maxlength: "请输入正确的电厂联系人姓名"
      },
      contactPhone: {
        required: "请输入电厂联系人手机号码",
      }
    }
    this.wxValidate = new WxValidate(rules, messages)
  },
  formValidate(e) {
    const params = e.detail.value
    // 传入表单数据，调用验证方法
    if (!this.wxValidate.checkForm(params)) {
      const error = this.wxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
      return false
    }
    const count = this.data.files.length
    let msg = ""
    if (count < 3) {
      msg = '必须上传包含身份证|健康码|行程轨迹截图的附件资料,14天内有外省经历人员还需提供核酸检测报告!'
    } else if (count > 6) {
      msg = '不要上传过多图片!'
    }
    if (msg) {
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 5000
      })
      return false
    }
    return true
  },

  formSubmit(e) {
    const that = this
    if (!this.formValidate(e))
      return false
    this.setData({
      isSending: true
    })
    if (app.globalData.session) {
      that.submit(app.globalData.session)
    }
    else{
      app.getSession().then(function(res){
        that.submit(res)
      })
    }
  },
  submit(session){
    const that =this
    wx.request({
      url: `${app.globalData.BASEURL}/covidform/tempintos/`,
      header:{
        'Authorization':app.globalData.AUTH,
        'content-type': 'application/json'
      },
      data: {
        weixinID: session,
        name: this.data.name,
        iccard: this.data.idcard,
        healthValue: this.data.healthValue,
        daysValue: parseInt(this.data.daysValue)+1,//前景需要对应,注意要用prseInt转换str
        outProvinceValue: this.data.outProvinceValue,
        outCompany: this.data.outCompany,
        project: this.data.project,
        reason: this.data.reason,
        note: this.data.note,
        contact: this.data.contact,
        contactPhone: this.data.contactPhone,
      },
      method: "POST",
      success(res) {
        if (res.statusCode === 201) {
          const id = res.data.id
          //上传登记表
          if(that.data.files2.length>0){
            wx.uploadFile({
              filePath: that.data.files2[0],
              name: 'file',
              url: `${app.globalData.BASEURL}/covidform/tempintos/${id}/files/`,
              header:{
                'Authorization':app.globalData.AUTH,
                'content-type':'multipart/form-data'
              },
            })
          }

          //上传图片截图
          const length = that.data.files.length
          for (let i = 0; i < length; i++) {
            const files = that.data.files
            files[i].isUploading=true
            that.setData({
              files:files
            })
            wx.uploadFile({
              filePath: that.data.files[i].path,
              name: 'file',
              url: `${app.globalData.BASEURL}/covidform/tempintos/${id}/files/`,
              header:{
                'Authorization':app.globalData.AUTH,
                'content-type':'multipart/form-data'
              },
              complete(res) {
                files[i].isUploading=false
                that.setData({
                  files:files
                })
                if (i === (length - 1)) {
                  that.setData({
                    isSending: false
                  })
                  wx.reLaunch({
                    url: '/pages/myTempInto/myTempInto',
                  })
                }
              }
            })
          }
        } else {
          wx.hideLoading()
          that.setData({
            isSending: false
          })
          wx.showToast({
            title: "出错了，请稍后！",
            icon:"error",
            duration: 5000
          })
        }
      },
    })
  },

  onBackTap(e){
    wx.reLaunch({
      url: '/pages/index/index',
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
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

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