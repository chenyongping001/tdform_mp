const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSending: false,
    rq: '',
    clkssj: '',
    cljssj: '',
    form: {
      jlr: '',
      yh: '',
      sbhxt: '',
      tzr: '',
      gzxxhyy: '',
      clgcsm: '',
      jqfx: '',
    },
    files: [],
    files2: [],
    filename: '',
    errorMsg: '', // 验证表单显示错误信息
    rules: [{
      name: 'jlr',
      rules: [{
        required: true,
        message: '记录人不能为空'
      }, {
        maxlength: 10,
        message: '记录人信息获取有误！'
      }]
    }, {
      name: 'yh',
      rules: [{
        required: true,
        message: '用户姓名不能为空'
      }, {
        maxlength: 10,
        message: '请输入正确的用户姓名！'
      }]
    },
    {
      name: 'sbhxt',
      rules: {
        required: true,
        message: '请填写运维的设备或系统'
      },
    },

    {
      name: 'tzr',
      rules: [{
        required: true,
        message: '通知人不能为空'
      }, {
        maxlength: 10,
        message: '请填写正确的通知人！'
      }]
    },
    {
      name: 'gzxxhyy',
      rules: {
        required: true,
        message: '请填写故障现象或原因'
      },
    },
    {
      name: 'clgcsm',
      rules: {
        required: true,
        message: '请填写处理过程说明'
      },
    },
    ],
  },
  bindDateChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    console.log(e.currentTarget)
    this.setData({
      [`${field}`]: e.detail.value
    })
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

  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    console.log(field)
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  weSubmitForm() {
    const that = this

    const count = this.data.files.length
    let msg = ""
    if (count > 6) {
      msg = '不要上传过多图片!'
    }
    if (Date.parse(`01/01/2011 ${this.data.clkssj}:00`) > Date.parse(`01/01/2011 ${this.data.cljssj}:00`)) {
      msg = '处理开始时间不能晚于处理结束时间！'
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

        app.getSession().then(function (res) {
          that.submit(res)
        })
      }
    })
  },

  submit(session) {
    const that = this
    wx.request({
      url: `${app.globalData.BASEURL}/outsourcingManagement/workbooks/`,
      header: {
        'Authorization': app.globalData.AUTH,
        'content-type': 'application/json'
      },
      data: {
        wx_session: session,
        rq: this.data.rq,
        yh: this.data.form.yh,
        sbhxt: this.data.form.sbhxt,
        tzr: this.data.form.tzr,
        gzxxhyy: this.data.form.gzxxhyy,
        clkssj: this.data.clkssj,
        clgcsm: this.data.form.clgcsm,
        cljssj: this.data.cljssj,
        jqfx: this.data.form.jqfx,
      },
      method: "POST",
      success(res) {
        if (res.statusCode === 201) {
          const id = res.data.id
          //上传文档附件
          if (that.data.files2.length > 0) {
            wx.uploadFile({
              filePath: that.data.files2[0],
              name: 'file',
              url: `${app.globalData.BASEURL}/outsourcingManagement/workbooks/${id}/files/`,
              header: {
                'Authorization': app.globalData.AUTH,
                'content-type': 'multipart/form-data'
              },
            })
          }

          //上传图片截图
          const length = that.data.files.length
          if (length < 1) {
            that.setData({
              isSending: false
            })
            wx.reLaunch({
              url: '/pages/outsourcingManagement/outsourcingIndex',
            })
          }
          for (let i = 0; i < length; i++) {
            const files = that.data.files
            files[i].isUploading = true
            that.setData({
              files: files
            })
            wx.uploadFile({
              filePath: that.data.files[i].path,
              name: 'file',
              url: `${app.globalData.BASEURL}/outsourcingManagement/workbooks/${id}/files/`,
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
                    url: '/pages/outsourcingManagement/outsourcingIndex',
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
  onLoad: function (options) {
    var nowDate = new Date();
    var date = nowDate.get
    var year = nowDate.getFullYear(), month = nowDate.getMonth() + 1, day = nowDate.getDate();
    var hour = nowDate.getHours(), minute = nowDate.getMinutes();
    this.setData({
      rq: `${year}-${month}-${day}`,
      clkssj: `${hour}:${minute}`,
      cljssj: `${hour}:${minute}`,
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
    //获取本地保存的合法外协用户
    var that = this
    app.getUserFromSession().then(res=>{
      that.setData({
        ['form.jlr']: app.globalData.hfWxUser
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})