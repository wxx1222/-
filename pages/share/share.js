var network = require('../../utils/network.js')

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:true,
    roleIdList: [
      { id: "0", pCode: "FAMILY_PROLE", code: "5", fullName: "请选择身份类型", shortName: "请选择身份类型" }
    ],
    roleIdIndex: 0,
    // 后台返回来的家庭名称和邀请人的昵称
    invitationInfo: {
      currentUserName: "",
      currentFamilyName: '',
      currentFamilyId: '',
      currentUserSession: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options------------------>", options);
    this.setData({
      invitationInfo: {
        currentFamilyId: options.currentFamilyId,
        currentFamilyName: options.currentFamilyName,
        currentUserName: options.currentUserName,
        currentUserSession: options.currentUserSession
      }
    });
    this.getSysdictList();




    //数据进行校验  
    const rules = {
      roleId: {
        isSelectRoleId: true
      }
    };
    const messages = {};
    this.WxValidate = app.wxValidate(rules, messages);
    // 自定义验证规则
    this.WxValidate.addMethod('isSelectRoleId', (value, param) => {
      return value != 0
    }, '请选择类型')
  },

  showToast: (title, icon) => {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    })
  },
  getSysdictList () {
    //获取身份类型
    let self = this;
    network.GET(network.URL_SYSDICT + '?roleType=' + 'ORG_PROLE', {}
      , function (e) {
        console.log("e=====>", e);
        if (e.data.code == 200) {
          var arr = e.data.data;
          arr.map(function (n) {
            self.data.roleIdList.push(n);
          });
          self.setData({
            roleIdList: self.data.roleIdList,
            show: false
          });
          console.log("roleIdList=====>", self.data.roleIdList);
        } else {
          self.showToast("数据加载失败", 'icon');
        }
      }
      , function (e) {
        console.log("失败=====>" + e);
      }
      , function () {
      }
    );
  },
  // 提交表单,拿到表单中的数据
  formSubmit(e) {
    let formData = e.detail.value;
    formData.roleId = this.data.roleId;
    // console.log('form发生了submit事件，携带数据为：', formData);

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
    // console.log(app.fetch);
    formData["familyId"] = this.data.invitationInfo.currentFamilyId;
    formData["inviteId"] = this.data.invitationInfo.currentUserSession;
    //界面交互 提醒用户加载中
    wx.showLoading({
      title: '正在提交...',
    })
    network.POST(network.URL_USER_ADDRECORD, formData
      , (e) => {
        console.log("e=====>", e.data);
        if (e.data.code == 200) {
          wx.setStorageSync("familyID", this.data.invitationInfo.currentFamilyId);
          wx.switchTab({
            url: "/pages/index/index",
            success: () => {
              console.log("进入index page");
            }
          })
        } else {
          this.showSuccessToast("添加失败", 'none');
        }
      }
      , (e) => {
        console.log("失败=====>" + e);
        this.showSuccessToast("添加失败", 'none');
      }
      , () => {

      }
    );
  },
  bindRoleIdChange(e) {
    let roleIdIndex = e.detail.value;
    this.setData({
      roleIdIndex: roleIdIndex,
      roleId: this.data.roleIdList[roleIdIndex].id
    })
  },
  //  用户点击取消跳转到登录页面
  cancelHandle() {
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
})