var format = require('../../utils/util.js')
var network = require('../../utils/network.js')
var nowTime = new Date();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:'',
    type:null
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      type:options.type
    })
    var formatNowTime = format.formatTime(nowTime);
    let date = formatNowTime.split(' ')[0];
    // console.log(date);
    this.setData({
      date: date
    })
    //数据进行校验  
    const rules = {
      holidayName: {
        required: true,
        minlength: 2,
        maxlength: 15,
        whitespace: true
      },
      holidayDesc:{
        maxlength: 20,
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息  
    const messages = {
      holidayName: {
        required: '请输入节日名称',
        minlength: "节日名称最少输入两个字符",
        maxlength: "节日名称最多输入十五个字符"
      },
      holidayDesc:{
        maxlength: "节日描述最多输入二十个字符"
      }

    };
    this.WxValidate = app.wxValidate(rules, messages);
    // 自定义验证规则
    this.WxValidate.addMethod('whitespace', (value, param) => {
      var reg = /\s/;
      return !reg.test(value)
    }, '节日名称中不能有空格')



  },
  showSuccessToast: (title, icon) => {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    })
  },
  formSubmit: function (e) {
    let formId = e.detail.formId,
       formData = e.detail.value;
    formData["holidayEndTime"] = formData.holidayStartTime;
    formData["type"] = this.data.type;
    formData["familyId"] = wx.getStorageSync("familyID");
    // console.log('form发生了submit事件，携带数据为：', formData)
    //校验表单
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList;
      wx.showToast({
        title: `${error[0].msg} `,
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.showLoading({
      title: '正在保存...',
      mask: true
    });
    network.POST(network.URL_HOLIDAY_SAVE +"?formId="+formId, formData
      , (e) => {
        // console.log("111111111111 e=====>", e.data);
        if (e.data.code==200) {
          let type = this.data.type;
          wx.hideLoading();
          wx.showToast({
            title: '创建成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              wx.switchTab({
                url: '/pages/festival/festival'
              })
            }
          })
        } else {
          this.showSuccessToast("添加失败", 'none');
        }
      }
      , (e) => {
        // console.log("失败=====>" + e);
        this.showSuccessToast("添加失败", 'none');
      }
      , () => {

      }
    );

  },
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  }
})