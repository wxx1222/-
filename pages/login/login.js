// pages/login/login.js
const app = getApp();
const network = require('../../utils/network.js');
Page({
  data: {
    showMask:false,
    invitationInfo: {
      currentUserName: "",
      currentFamilyName: '',
      currentFamilyId: '',
      currentUserSession: ''
    }
  },
  onLoad(options){
    console.log(options);
    this.setData({
      invitationInfo: {
        currentFamilyId: options.currentFamilyId,
        currentFamilyName: options.currentFamilyName,
        currentUserName: options.currentUserName,
        currentUserSession: options.currentUserSession
      }
    });
 
    console.log(app.globalData.userInfo);
    // 如果用户没有授权则弹出授权按钮
    if (!wx.getStorageSync("authorize")) {
      this.setData({
        showMask: true
      });
    } else {
      // 如果授权了则根据用户查询当前家庭的ID则查询
      this.queryFamily();
    }
  },
  getUserInfo(e){
    console.log(e);
    console.log("分享信息", this.data.invitationInfo);
    if (e.detail.userInfo) {
      wx.setStorageSync("authorize", true);
      // 存储全局变量
      console.log(e.detail.userInfo);
      // 授权之后才可请求家庭列表
      this.getFamilyList(e.detail.userInfo);
    } else {
      wx.openSetting({
      success: (res) => {
        console.log(res.authSetting['scope.userInfo']);
        if (res.authSetting['scope.userInfo']) {
          wx.setStorageSync("authorize", true);
          // 授权之后才可请求家庭列表
          wx.getUserInfo({
            success: (res) => {
              console.log(res.userInfo);
              this.getFamilyList(res.userInfo);
            }
          });
        
        } else {
          console.log("用户拒绝授权");
          wx.showModal({
            title: '提示',
            content: '请您授权，否则无法使用该小程序',
            success:  (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
       
      }
    })
    }
  },
  doindex(data){
    // 存储用户信息
    app.globalData.userInfo =data;
    console.log(app.globalData);
    let { currentUserName, currentFamilyName, currentUserSession, currentFamilyId }= this.data.invitationInfo;
    wx.setStorageSync("familyID", currentFamilyId);
    // 发送用户信息
    this.userSave(data);
    if (currentFamilyId != undefined && currentUserSession != undefined) {     
      wx.redirectTo({
        url: `/pages/share/share?currentUserSession=${currentUserSession}&currentFamilyId=${currentFamilyId}&currentUserName=${currentUserName}&currentFamilyName=${currentFamilyName}`
      })

    } else {
      console.log(this.data.familyList);
      if (this.data.familyList.length>0) {
        wx.switchTab({
          url: "/pages/index/index",
          success: () => {
            console.log("进入index page");
          }
        })
      }
    }
    this.setData({
      showMask: false
    });
  },
  // 保存用户信息
  userSave(weChatUser) {
    network.POST(network.URL_WECHATUSER_SAVE, weChatUser
      , (e) => {
      }
      , (e) => {
      }
      , () => {
      }
    );
  },
  // 获取家庭列表，若有家庭授权后直接进入首页
  getFamilyList(userInfo) {
    network.POST(
      network.URL_FAMILY_GETLIST,
      {},
      (res) => {
        if (res.data.code === 200) {
          // console.log(res.data.data)
            this.setData({
              familyList: res.data.data
            });
            this.doindex(userInfo);
        } 
      },
      (rej) => {
      },
      (e) => {
      }
    )
  },
  // 查看当前点击的人是否存在当前分享的家庭
  queryFamily(){
    let { currentUserName, currentFamilyName, currentUserSession, currentFamilyId }=this.data.invitationInfo;
    let sysMember = { "familyID": currentFamilyId, "threeSession1": currentUserSession };
    network.POST(network.URL_USER_QUERYGROUP, sysMember
      , (e) => {
        console.log("e=====>", e);
        if (e.code == 200) {
          if (e.data.current_person) {
            wx.setStorageSync("familyID", currentFamilyId);
            // 如果这个人有家庭则直接进入
            wx.switchTab({
              url: "/pages/index/index",
              success: () => {
                console.log("进入index page");
              }
            })
          } else {
            // 如果没有则去分享页面选择类型加入
            wx.redirectTo({
              url: `/pages/share/share?currentUserSession=${currentUserSession}&currentFamilyId=${currentFamilyId}&currentUserName=${currentUserName}&currentFamilyName=${currentFamilyName}`
            })
          }
        } 
      }
      , function (e) {
        console.log("失败=====>" + e);
      }
      , function () {
      }
    );
  }
})