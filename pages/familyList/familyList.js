
var network = require('../../utils/network.js');
const app = getApp();
Page({
  data: {
	  isHaveList:2,
    userInfo: {},
    hasUserInfo: false,
    nowFamilyId: '',
    list: null,
    thisUserThreerSession: '',
    userList: null,
    isCancel:false
  },

  onLoad: function (options) {
    this.setData({
      nowFamilyId: wx.getStorageSync("familyID")
    })
    this.getFamilyList();
    
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
    };
  },
  getFamilyList:function (){
    //请求家庭列表
    network.POST(network.URL_FAMILY_GETLIST, {}
      , (e) => {
        if (e.data.code == 200) {
          var list = e.data.data
          
          if (list.length > 0) {
            var index = 0;
            for (var i = 0; i < list.length; i++) {
              console.log('---',wx.getStorageSync("familyID"));
              console.log(list[i].id);
              if (list[i].id == wx.getStorageSync("familyID")){
                list[i]["open"] = true;
                index = i;
              } else {
                list[i]["open"] = false;
              }
            }
            this.setData({
              list: list,
              thisUserThreerSession: wx.getStorageSync("threerdSession"),
              isHaveList: 0,
              // isAdmin: list[0].isAdmin
            })
            //请求家庭组员
            let paramId = list[index].id
            this.getMemberList(paramId);
            //请求家庭组员end
          }else{
            //!list.length>0
            this.setData({
              isHaveList: 1
            })
          }

        } else {
            
        }
      }
      , (e) => {

      }
      , () => {

      }
    );
  },

// 获取成员列表
  getMemberList: function (familyID) {
    network.POST(network.URL_MEMBER_GETLIST, familyID
      , (e) => {
        // console.log("URL_MEMBER_GETLIST  e=====>", e);
        if (e.data.code == 200) {
          var userList = e.data.data;
          this.setData({
            userList: userList
          })
        } else {

        }
      }
      , (e) => {

      }
      , () => {

      }
    );
  },
  // 编辑状态开启 根据用户 判断该用户是管理员还是成员
  editHandle(e) {
    let id = e.currentTarget.dataset.id;
    // 拿到当前编辑的家庭 id 
    // 开启编辑状态
    this.setData({
      editId: id,
      isCancel: true
    })
  },
  //取消按钮
  cancelHandle(){
    // 撤销编辑状态
    this.setData({
      editId: '',
      isCancel: false
    })
  },
  //删除家庭
  deleteFamily: function (familyID) {
    network.POST(network.URL_FAMILY_DELETE, familyID
      , (e) => {
        console.log("URL_FAMILY_DELETE  e=====>", e);
        if (e.data.code == 200) {
          //已成功
          this.getFamilyList();
        } else {

        }
      }
      , (e) => {

      }
      , () => {

      }
    );
  },
  // 删除按钮
  deleteHandle(e) {
    let familyID = e.currentTarget.dataset.id;
    // console.log(familyID);
    wx.showModal({
      title: '提示',
      content: '您确认要删除吗？',
      success:  (res)=> {
        if (res.confirm) {
          console.log('用户点击确定')
          this.deleteFamily(familyID);

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //删除用户按钮
  deleteUserNameHandle(e) {
    // console.log(e);
    let userName = e.currentTarget.dataset.userName,
      threerdSession = e.currentTarget.dataset.threerdsession,
      familyId = e.currentTarget.dataset.familyid;

    //分两种情况 
    if (threerdSession == this.data.thisUserThreerSession){
      //1:家主删除自己，就相当于删除这个家庭
      wx.showModal({
        title: '提示',
        content: '删除您自己（家主）就会删除整个家庭，您确定吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定');
            this.deleteFamily(familyId);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      //2:删除家庭成员
      wx.showModal({
        title: '提示',
        content: '确认要移除' + userName + '这个用户吗？',
        success: (res)=> {
          if (res.confirm) {
            // console.log("=============familyId" + familyId);
            // console.log("=============threerdSession" + threerdSession);
            network.POST(network.URL_MEMBER_DELETE, { "familyID": familyId, "threerdSession": threerdSession }
              , (e) => {
                // console.log("URL_MEMBER_GETLIST  e=====>", e);
                if (e.data.code == 200) {
                  this.getMemberList(familyId);
                } else {

                }
              }
              , (e) => {

              }
              , () => {

              }
            );

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    
  },
  outFamilyHandle:function (e){
    let familyId = e.currentTarget.dataset.id,
      familyName = e.currentTarget.dataset.familyName,
      threerdSession = this.data.thisUserThreerSession;
    // console.log("=============familyId" + familyId);
    // console.log("=============threerdSession" + threerdSession);
    wx.showModal({
      title: '提示',
      content: '您确定要退出' + familyName + '这个家庭吗？',
      success: (res) => {
        if (res.confirm) {
          network.POST(network.URL_MEMBER_DELETE, { "familyID": familyId, "threerdSession": threerdSession }
            , (e) => {
              // console.log("URL_MEMBER_GETLIST  e=====>", e);
              if (e.data.code == 200) {
                //请求家庭列表
                this.getFamilyList();
              } else {

              }
            }
            , (e) => {

            }
            , () => {

            }
          );

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 光标离开恢复正常状态
  blurHandle(e) {
    // console.log(e);
    let editedFamilyName = e.detail.value,
      familyId = e.currentTarget.dataset.familyId;
    if (editedFamilyName) {
      wx.showModal({
        title: '提示',
        content: '确认要更改名称为' + editedFamilyName + '吗？',
        success: (res)=> {
          if (res.confirm) {
            network.POST(network.URL_FAMILY_UPDATE, { "familyName": editedFamilyName, "id": familyId }
              , (e) => {
                editedFamilyName
                // console.log("URL_FAMILY_UPDATE  e=====>", e);
                if (e.data.code == 200) {
                  this.getFamilyList();
                } else {

                }
              }
              , (e) => {

              }
              , () => {

              }
            );
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      this.setData({
        editId: '',
        isCancel: false
      })}

  },
  //  切换列表
  kindToggle: function (e) {
    // 获取数据 赋值
    console.log(e);
    let id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    //  在这里赋值
    this.setData({
      list: list,
      editId: '',
      isCancel: false
    });
    if (!e.currentTarget.dataset.open) {
      this.getMemberList(id);
    }

  },
  // 分享给家人邀请家人加入
  onShareAppMessage (res) {
    // 从页面内的按钮分享
    // 拿到当前用户点击时候的家庭id 和 个人信息
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let currentUserName = res.target.dataset.userName,
        currentFamilyName = res.target.dataset.familyName,
        userSession = res.target.dataset.userSession,
        currentFamilyId = res.target.dataset.familyId;
      return {
        title: `${currentUserName}邀请你加入${currentFamilyName}机构`,
        path: `/pages/login/login?currentUserSession=${userSession}&currentFamilyId=${currentFamilyId}&currentUserName=${currentUserName}&currentFamilyName=${currentFamilyName}`,
        imageUrl: '',
        success: function (res) {
          // console.log(res)
        },
        fail: function (res) {
          // 分享失败
          // console.log(res)
        }
      }
    } else {
      // console.log("从导航点击的分享")
      return {
        title: '这款小程序很有趣,分享给你,快来创建你的家庭吧',
        path: '/pages/login/login',
        imageUrl:'',
        success: function (res) {
          // console.log(res)
        },
        fail: function (res) {
          // 分享失败
          // console.log(res)
        }
      }
    }
  
  },
  createFamilyHandle(){
    // 需要关闭首页，以便创建家庭的时候能渲染出来新的家庭信息
  }


})