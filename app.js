
const wechat = require('./utils/wechat.js'); 
import wxValidate from '/utils/WxValidate.js';
var network = require('./utils/network.js');
App({
  wxValidate: (rules, messages) => new wxValidate(rules, messages),
  wechat: wechat,
  globalData: {
    userInfo: null
  },
  onLaunch: function (options) {
    console.log("applaunch");
    console.log(options);
    // 在 小程序启动的时候判断用户是否授权，如果授权则获取用户信息和家庭列表信息，保存用户信息
    // 如果有家庭则直接跳转到首页
    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting);
        console.log(res.authSetting['scope.userInfo']);
      
        // 获取用户设置，如果已经允许获取用户信息，则判断用户是否有家庭，有的话直接进入首页
        if (res.authSetting['scope.userInfo']) {
          wx.setStorageSync("authorize",true);
          wx.getUserInfo({
            success: (res) => {
              // 存储全局用户信息
              this.globalData.userInfo = res.userInfo;
              // 发送用户信息
              this.userSave(res.userInfo);
              // 用户登录后发送 code ，拿到 userSession，才能进行接口请求，否则会报错
            }
          })
        } else {
          console.log("跳转到首页");
          wx.setStorageSync("authorize", false);
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    });
  },
  onError: function (){

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
  }
})