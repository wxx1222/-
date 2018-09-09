
//获取应用实例
const app = getApp()

Page({
  // index 页面的数据
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    myInfoList: [
      { id: 1, text: '我的信息', type: 'icon-homefooter4', url:'/pages/my/mydetail' },
      { id: 2, text: '我的机构', type: 'icon-home', url: '/pages/familyList/familyList'  },
      { id: 3, text: '我的相册', type: 'icon-ico-presetphoto-n', url: '/pages/myAlbum/myalbum' }
    ]
  },
  onLoad: function () {
    this.getUserInfo();
    // 由于 获取用户消息是网络请求,所以这边执行的时候还可能拿不到 app 中的 globalData 对象
    // 最好的方法就是等拿到数据再进行赋值操作
  },
  getUserInfo: function (e) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  }
})
