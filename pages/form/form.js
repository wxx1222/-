var network = require('../../utils/network.js')

const app = getApp();
Page({

  data: {
    isFamily: false,
    familyName: '',
    typeList: [
      { id: "1", typeName: "机构" }
    ],
    typeIndex: 0,
    roleIdList: [
      { id: "0", pCode: "FAMILY_PROLE", code: "5", fullName: "请选择身份类型", shortName: "请选择身份类型" }],
    roleIdIndex: 0,
    roleId: '',
    phone: '',
    submitHidden: true,
    show:true
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    // network.GET(network.URL_SYSDICT + '?roleType=' + 'FAMILY_PROLE', {}
    //   , function (e) {
    //     console.log("e=====>", e);
    //     if (e.data.code == 200) {
    //       var arr = e.data.data;
    //       arr.map(function (n) {
    //         self.data.roleIdList.push(n);
    //       });
    //       self.setData({
    //         roleIdList: self.data.roleIdList
    //       });

    //       // console.log("roleIdList=====>", self.data.roleIdList);
    //     } else {
    //       // self.showSuccessToast("数据加载失败", 'icon');
    //     }
    //   }
    //   , function (e) {
    //     console.log("失败=====>" + e);
    //   }
    //   , function () {
    //   }
    // );
    network.GET(network.URL_SYSDICT + '?roleType=' + 'ORG_PROLE', {}
      , (e) => {
        console.log("e=====>", e);
        if (e.data.code == 200) {
          var arr = e.data.data;
          this.setData({
            roleIdList: this.data.roleIdList.concat(arr),
            show: false
          });

          // console.log("roleIdList=====>", this.data.roleIdList);
        } else {
          // this.showSuccessToast("数据加载失败", 'icon');
        }
      }
      , (e) => {
        console.log("失败=====>" + e);
      }
      , () => {
      }
    );
    //数据进行校验  
    const rules = {

      familyName: {
        required: true,
        minlength: 2,
        maxlength: 10,
        whitespace: true
      },
      roleId: {
        isSelectRoleId: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息  
    const messages = {
      familyName: {
        required: '请输入名称',
        minlength: "名称最少输入两个字符",
        maxlength: "名称最多输入十个字符"
      }
    };
    this.WxValidate = app.wxValidate(rules, messages);
    // 自定义验证规则
    this.WxValidate.addMethod('whitespace', (value, param) => {
      var reg = /\s/;
      return !reg.test(value)
    }, '名称中不能有空格')
    this.WxValidate.addMethod('isSelectRoleId', (value, param) => {
      return value != 0
    }, '请选择类型')
  },

  showSuccessToast: (title, icon) => {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    })
  },
  bindRoleIdChange(e) {
    console.log(e.detail);
    let roleIdIndex = e.detail.value;
    this.setData({
      roleIdIndex: roleIdIndex,
      roleId: this.data.roleIdList[roleIdIndex].id
    })
  },
  bindTypeChange(e) {
  },
  // 提交表单,拿到表单中的数据
  formSubmit(e) {
    let formData = e.detail.value,
      formId = e.detail.formId;
    console.log(formData.type)
    formData.type = "ORG_PHOTO";
    formData.roleId = this.data.roleId;
    formData.formId = formId;
    console.log('form发生了submit事件，携带数据为：', formData);

    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList;
      wx.showToast({
        title: `${error[0].msg} `,
        icon: 'none',
        duration: 2000
      })
      return false
    }
    // 向后台发送请求 ， 传入 url  和 data 
    wx.showLoading({
      title: '正在提交...',
      mask: true
    })
    network.POST(network.URL_SYSFAMILY_SAVE, formData
      , (e) => {
        console.log("e=====>", e.data);
        if (e.data.code == 200) {
          wx.hideLoading();
          wx.showToast({
            title: '创建成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              wx.switchTab({
                url: '/pages/index/index'
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
  }
})