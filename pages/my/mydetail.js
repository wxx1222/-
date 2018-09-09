const network = require('../../utils/network.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "",//头像
    memberNickName: "",//成员表昵称
    roleCode:"",//字典code
    mobilePhone: "",//微信表手机号
    fullName:"",//字典全称(角色全称)
    edit:false,
    roleList: [{ id: "0", pCode: "FAMILY_PROLE", code: "5", fullName: "请选择身份类型", shortName: "请选择身份类型" }],//角色列表

    roleIndex: 0//角色列表下标
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      familyID: wx.getStorageSync("familyID"),
      threerdSession: wx.getStorageSync("threerdSession")
    });
    this.getUserInfo();
    this.getLocalUserInfo();
    //数据进行校验  
    const rules = {

      memberNickName: {
        required: true,
        minlength: 2,
        maxlength: 15,
        whitespace: true
      }
    };
    // 验证字段的提示信息，若不传则调用默认的信息  
    const messages = {
      memberNickName: {
        required: '请输入昵称',
        minlength: "昵称最少输入两个字符",
        maxlength: "昵称最多输入十五个字符"
      }
    };
    this.WxValidate = app.wxValidate(rules, messages);
    // 自定义验证规则
    this.WxValidate.addMethod('whitespace', (value, param) => {
      var reg = /\s/;
      return !reg.test(value)
    }, '不能有空格');

  },
  getUserInfo: function () {
    if (app.globalData.userInfo) {
      var avatarUrl = app.globalData.userInfo.avatarUrl;
      this.setData({
        userInfo: app.globalData.userInfo,
        avatarUrl: avatarUrl
      })
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          var userInfo = res.userInfo;
          var avatarUrl = userInfo.avatarUrl;
          this.setData({
            userInfo: res.userInfo,
            avatarUrl: avatarUrl
          });
        }
      })
      wx.getUserInfo({
        success: function (res) {
          // console.log("success=====>" + JSON.stringify(res));
        
        }
        , fail: function (e) {
          // console.log("=====>" + JSON.stringify(e));
        }
      });
    }
   
  },
  //获得当前用户信息（本地库）
  getLocalUserInfo: function () {
    let params={
      "threerdSession": this.data.threerdSession,
      "familyID": this.data.familyID
    };
    network.POST(network.URL_GETUSERINFO, params, 
      (result) => {
        //console.log("result=====>", result);
        if(result.data.code===200){
          // if (result.data.data.memberNickName){
          //   this.setData({
          //     memberNickName: result.data.data.memberNickName
          //   });
          // }
          // if (result.data.data.roleCode) {
          //   this.setData({
          //     roleCode: result.data.data.roleCode
          //   });
          // }
          // if (result.data.data.mobilePhone) {
          //   this.setData({
          //     mobilePhone: result.data.data.mobilePhone
          //   });
          // }
          // if (result.data.data.fullName) {
          //   this.setData({
          //     fullName: result.data.data.fullName
          //   });
          // }
          this.setData({
            memberNickName: result.data.data.memberNickName,
            roleCode: result.data.data.roleCode,
            mobilePhone: result.data.data.mobilePhone,
            fullName: result.data.data.fullName,
            roleType: result.data.data.type
          });
        }       
      },(e) => {
        //console.log("失败=====>" + e);
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: 2000,
          success: () => {

          }
        })
      },() => {
    });
  },
  //获得所有的家庭角色
  getRoles: function () {
    network.GET(network.URL_SYSDICT + '?roleType=' + this.data.roleType ,{},
      (result) => {
        let roles = result.data.data;
        //console.log("result=====>", result);
        if (result.data.code === 200) {
          this.setData({
            roleList: roles//所有的角色信息
          });
        }

        let roleIndex_;
        //console.log("===========roles",roles)
        let roleCode = this.data.roleCode;
        //console.log("roleCode================",roleCode)
        roles.map(function (value, index, array) {
          //console.log(index)
          if (value.code === roleCode){
            //console.log("target======",index)
            roleIndex_=index;//找到目标对象的index
          }
        });

        this.setData({
          roleIndex: roleIndex_
        });

      }, (e) => {
        //console.log("失败=====>" + e);
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: 2000,
          success: () => {

          }
        })
      }, () => {
      });
  },
  //picker 触发选择
  bindRoleChange(e) {
    //console.log(e)
    let roleIndex = e.detail.value;
    //console.log(roleIndex)
    this.setData({
      roleIndex: roleIndex,
      roleCode: this.data.roleList[roleIndex].code,
      fullName: this.data.roleList[roleIndex].fullName
    });
  },

  editHandle(){
    this.getRoles();
    this.setData({
      edit:true
    });
  },
  cancelHandle() {
    this.setData({
      edit: false
    })
  },
  // 提交表单,拿到表单中的数据
  formSubmit(e) {
    //console.log("=====================form->e=====",e)
    let formData = e.detail.value,
        formId = e.detail.formId;
    formData.formId = formId;
    //console.log('form发生了submit事件，携带数据为：', formData);

    //formData.threerdSession = this.data.threerdSession;
    //formData.familyID = this.data.familyID;

    //console.log('form发生了submit事件，携带数据为：', formData);

    let roleIndex = this.data.roleIndex;
    this.setData({
      memberNickName: formData.memberNickName,
      mobilePhone: formData.mobilePhone,
      fullName: this.data.roleList[roleIndex].fullName
    })

    let params={
      "threerdSession": this.data.threerdSession,
      "familyID": this.data.familyID,
      "memberNickName": formData.memberNickName,
      "mobilePhone": formData.mobilePhone,
      "roleCode": this.data.roleCode
    };

    // formid 请求的时候记得要传
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList;
      wx.showToast({
        title: `${error[0].msg}`,
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.showLoading({
      title: '正在提交...',
    })
    network.POST(network.URL_UPDATEUSERINFO, params
      , (result) => {
        //console.log("result=====>", result);
        if (result.data.code == 200) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000,
            success: () => {
              //this.getLocalUserInfo();
              this.cancelHandle();
            }
          })
        } 
      }, (e) => {
        //console.log("失败=====>" + e);
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: 2000,
          success: () => {

          }
        })
      }, () => {

      });
  }

})