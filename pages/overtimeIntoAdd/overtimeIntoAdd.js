import WxValidate from "../../utils/wxValidate"
// pages/overtimeIntoAdd/overtimeIntoAdd.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSending: false,
    form: {
      name: '',
      idcard: '',
      reason: '',
      note: '',
      contact: "",
      contactPhone: "",
      gateValue: 0,
    },
    files: [],
    files2: [],
    filename: '',
    gateItems: [{
        name: '一号门',
        value: 0,
        checked: true
      },
      {
        name: '厂前区',
        value: 1
      }
    ],
    errorMsg: '', // 验证表单显示错误信息
    rules: [{
        name: 'name',
        rules: [{
          required: true,
          message: '请填写再入厂人员姓名'
        }, {
          maxlength: 10,
          message: '请输入正确的入厂人员姓名'
        }]
      },
      {
        name: 'idcard',
        rules: {
          required: true,
          message: '请填写再入厂人员身份证号码'
        },
      },

      {
        name: 'reason',
        rules: {
          required: true,
          message: '请填写入厂说明'
        }
      },
      {
        name: "note",
        rules: {}
      },
      {
        name: "gateValue",
        rules: {
          range: [0, 1],
          message: '出入门点选择不正确'
        }
      },
      {
        name: 'contact',
        rules: [{
          required: true,
          message: '请填写电厂联系人姓名'
        }, {
          maxlength: 10,
          message: '请输入正确的联系人姓名'
        }]
      },
      {
        name: 'contactPhone',
        rules: [{
          required: true,
          message: '请填写电厂联系人手机号码'
        }, {
          mobile: true,
          message: '电厂联系人手机号码格式不对'
        }]
      },
    ],
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: 6,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const files = res.tempFilePaths.map(n => ({
          isUploading: false,
          path: n
        }))
        // 添加一个属性isUploading,用来表示是否在上传过程中
        that.setData({
          files: that.data.files.concat(files)
        });
      }
    })
  },
  onAddFiles(e) {
    const that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['doc', 'docx', 'xls', 'xlsx'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles
        that.setData({
          filename: tempFilePaths[0].name,
          files2: [tempFilePaths[0].path]
        })
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files.map(n => n.path) // 需要预览的图片http链接列表
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
  gateChange(e) {
    var gateItems = this.data.gateItems;
    for (var i = 0, len = gateItems.length; i < len; ++i) {
      gateItems[i].checked = gateItems[i].value == e.detail.value;
    }
    this.setData({
      gateItems: gateItems,
      [`form.gateValue`]: e.detail.value
    });
  },
  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },
  // 用第三方工具验证身份证格式
  validateIdcard(idcard) {
    const rules = {
      idcard: {
        required: true,
        idcard: true
      },
    }
    const messages = {
      idcard: {
        required: "请输入身份证号",
      },
    }
    const wxValidate = new WxValidate(rules, messages)
    if (!wxValidate.checkForm(idcard)) {
      const error = wxValidate.errorList[0].msg
      return error
    }
    return null
  },
  weSubmitForm() {
    const that = this
    const idcard = {
      idcard: this.data.form.idcard
    }
    const error = this.validateIdcard(idcard)
    if (error) {
      this.setData({
        errorMsg: error
      })
      return
    }

    const count = this.data.files.length
    let msg = ""
    if (count < 2) {
      msg = '必须上传包含健康码|行程轨迹截图的附件资料,14天内有外省经历人员还需提供核酸检测报告!'
    } else if (count > 6) {
      msg = '不要上传过多图片!'
    }
    if (msg) {
      this.setData({
        errorMsg: msg
      })
      return
    }
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            errorMsg: errors[firstError[0]].message
          })
        }
      } else {
        this.setData({
          isSending: true
        })
        if (app.globalData.session) {
          that.submit(app.globalData.session)
        } else {
          app.getSession().then(function (res) {
            that.submit(res)
          })
        }
      }
    })
  },

  submit(session) {
    const that = this
    wx.request({
      url: `${app.globalData.BASEURL}/covidform/overtimeintos/`,
      header: {
        'Authorization': app.globalData.AUTH,
        'content-type': 'application/json'
      },
      data: {
        weixinID: session,
        name: this.data.form.name,
        iccard: this.data.form.idcard,
        reason: this.data.form.reason,
        note: this.data.form.note,
        gateValue: parseInt(this.data.form.gateValue) + 1,
        contact: this.data.form.contact,
        contactPhone: this.data.form.contactPhone,
      },
      method: "POST",
      success(res) {
        if (res.statusCode === 201) {
          const id = res.data.id
          //上传登记表
          if (that.data.files2.length > 0) {
            wx.uploadFile({
              filePath: that.data.files2[0],
              name: 'file',
              url: `${app.globalData.BASEURL}/covidform/overtimeintos/${id}/files/`,
              header: {
                'Authorization': app.globalData.AUTH,
                'content-type': 'multipart/form-data'
              },
            })
          }

          //上传图片截图
          const length = that.data.files.length
          for (let i = 0; i < length; i++) {
            const files = that.data.files
            files[i].isUploading = true
            that.setData({
              files: files
            })
            wx.uploadFile({
              filePath: that.data.files[i].path,
              name: 'file',
              url: `${app.globalData.BASEURL}/covidform/overtimeintos/${id}/files/`,
              header: {
                'Authorization': app.globalData.AUTH,
                'content-type': 'multipart/form-data'
              },
              complete(res) {
                files[i].isUploading = false
                that.setData({
                  files: files
                })
                if (i === (length - 1)) {
                  that.setData({
                    isSending: false
                  })
                  wx.reLaunch({
                    url: '/pages/myOvertimeInto/myOvertimeInto',
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
            icon: "error",
            duration: 5000
          })
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  onTemplateTap(e) {
    wx.downloadFile({
      url: `${app.globalData.BASEURL}/uploads/example.doc`,
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