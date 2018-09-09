
//获取应用实例
const app = getApp();
const network = require('../../utils/network.js');
var  format  = require('../../utils/util.js'); 

//微信小程序新录音接口，录出来的是aac或者mp3，这里要录成mp3
// const recorderManager = wx.getRecorderManager()
// const mp3RecoderOptions = {
//   duration: 60000,
//   sampleRate: 16000,
//   numberOfChannels: 1,
//   encodeBitRate: 48000,
//   format: 'mp3',
//   //frameSize: 50
// };
// 创建全局的音频播放器
// const innerAudioContext = wx.createInnerAudioContext();
Page({
  data: {
    familyInfo: null,
    albumName: '',
    albumID:'',
    albumPicList: [],
    showFamilyList:false,
    showShareBtn:true,
    familyList:[],
    moodPageList:[],
    // 发布按钮和盒子的隐藏和显示
    showReleaseBox: false,
    userInfo: {},
    hasUserInfo: false,
    // mask 遮罩层
    showMask: false,
    // 创建相册模态框
    showAlbum: false,
    // 显示相册列表
    showAlbumList:false,
    page:1,
    hasMore: true,
    isSpeaking:false,
    release:false,
    showVoiceGifId:''
  },
  onLoad: function () {
    console.log("onLoad");
    // 获取用户信息
    this.getUserInfo();
    // 如果授权了那就肯定能拿到，否则会跳转到login页面
    let userSession = wx.getStorageSync("threerdSession");
    // console.log(userSession);
    // 加载家庭列表 
    this.getFamilyList();
    // onshow 的标识
    this.setData({
      onLoad:true,
      preview: true
    })
  },
  //  获取用户信息
  getUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }  else {
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
  onShow: function (options) {
    console.log("show页面")
    // 发布动态之后重新架加载动态列表
   if (this.data.release && this.data.refreshFlag) {
     console.log("加载页面")
      this.setData({
        moodPageList: [],
        page: 1,
        release: false
      })
      this.getMoodList();
    };
    this.setData({
      refreshFlag: false
    });

    let currentFamilyId = wx.getStorageSync("familyID");
    // 第一次onload之后不会加载这两个，之后每次onshow的时候都会加载
    console.log(this.data.onLoad);
    if (!this.data.onLoad) {
      // 加载家庭列表
      // 判断家庭是否已经内被删除或者创建了最新的家庭
      network.POST(
        network.URL_FAMILY_GETLIST,
        {},
        (res) => {
          if (res.data.code === 200) {
            // 如果没有家庭直接跳转到创建页面
            if (res.data.data.length === 0) {
              wx.redirectTo({
                url: '/pages/login/login',
              })
              return
            } else {
              // 如果不相同的话，直接替换掉原来的家庭列表
              if (JSON.stringify(this.data.familyList) !== JSON.stringify(res.data.data)) {
                this.setData({
                  familyList: res.data.data
                });
                // 再判断当前的 familyID 是否存在于新的家庭列表中
                if (res.data.data.some((item) => {
                  if (item.id === currentFamilyId) {
                    return true;
                  }
                })) {
                  if (currentFamilyId === this.data.familyList[0].id && currentFamilyId !== res.data.data[0].id) {
                    wx.setStorageSync("familyID", res.data.data[0].id);
                    this.setData({
                      familyInfo: res.data.data[0],
                      albumPicList: [],
                      moodPageList: []
                    });
                    // 加载相册列表
                    this.albumList();
                    // 加载动态列表
                    this.getMoodList();
                  } else if (currentFamilyId !== this.data.familyList[0].id && this.data.familyList[0] !== res.data.data[0].id) {
                    wx.setStorageSync("familyID", res.data.data[0].id);
                    this.setData({
                      familyInfo: res.data.data[0],
                      albumPicList: [],
                      moodPageList: []
                    });
                    // 加载相册列表
                    this.albumList();
                    // 加载动态列表
                    this.getMoodList();
                  }
                } else {
                  // 如果没有相同的则重新修改家庭信息
                  wx.setStorageSync("familyID", res.data.data[0].id);
                  this.setData({
                    familyInfo: res.data.data[0],
                    albumPicList: [],
                    moodPageList: []
                  });
                  // 加载相册列表
                  this.albumList();
                  // 加载动态列表
                  this.getMoodList();
                }

              }

            }
           
          }
        },
        (rej) => {
        },
        (e) => {
        }
      );
      console.log(wx.getStorageSync("familyID"));
      // 获取相册列表 判断相册是否被删除
      network.POST(
        network.URL_ALBUM_LIST,
        { familyid: wx.getStorageSync("familyID"), type: 0 },
        (res) => {
          if (res.data.code === 200) {
            if (JSON.stringify(this.data.familyList) !== JSON.stringify(res.data.data)) {
              this.setData({
                albumPicList: res.data.data
              })
            }
          }


        },
        (rej) => {
          console.log("请求失败", rej)
        },
        (e) => {
        }
      )
      // 刷新页面加载
      this.refresh();
    }
    this.setData({
      onLoad: false
    })
  },

  // 获取家庭列表信息
  getFamilyList() {
    network.POST(
      network.URL_FAMILY_GETLIST,
      {},
      (res) => {
        // console.log(res.data.data,333333333333)
        if (res.data.code === 200) {
          if (res.data.data.length === 0 ) {
            wx.redirectTo({
              url: '/pages/login/login',
            })
          } else {
            if (wx.getStorageSync("familyID")) {
              res.data.data.forEach((value) => {
                // console.log(value.id)
                // console.log(wx.getStorageSync("familyID"))
                if (value.id === wx.getStorageSync("familyID")) {
                  console.log("设置家庭信息")
                  this.setData({
                    familyInfo: value
                  })
                }
              }) 
              this.setData({
                familyList: res.data.data
              });

            } else {
              wx.setStorageSync("familyID", res.data.data[0].id);
              this.setData({
                familyList: res.data.data,
                familyInfo: res.data.data[0]
              });
            }
            isFirstLogin: res.data.data[0].login_count;

            // 加载相册列表
            this.albumList();
            // 加载动态列表
            this.getMoodList();
            // 刷新页面加载
            this.refresh();
          }
        }
      },
      (rej) => {
        console.log(rej,"33333333333333333")
      },
      (e) => {
      }
    )
  },
  // 切换选择家庭  重新给 familyID 赋值切换家庭内容
  toggleFamily(e){
    let familyID = e.currentTarget.dataset.familyId,
        familyList = this.data.familyList;
    wx.setStorageSync("familyID", familyID);
    // 根据新的家庭ID 渲染页面
    familyList.forEach((item, index) => {
      if (item.id === familyID) {
        this.setData({
          familyInfo: item,
          albumPicList: [],
          moodPageList: [],
          showFamilyList: !this.data.showFamilyList
        })
      }
    });
    // 切换家庭后 显示新的家庭相册 和 新的动态列表
    // 加载相册列表
    this.albumList();
    // 加载动态列表
    this.getMoodList();
  },
  // 显示家庭列表 
  showFamilyListHandle() {
    this.setData({
      showFamilyList: !this.data.showFamilyList
    });
  },
  
  // 显示分享按钮
  shareHandle(e) {
    this.setData({
      showShareBtn: !this.data.showShareBtn
    });

  },
  //获取相册列表
  albumList() {
    network.POST(
      network.URL_ALBUM_LIST,
      { familyid: wx.getStorageSync("familyID"),type:0 },
      (res) => {
        if (res.data.code === 200) {
          this.setData({
            albumPicList: res.data.data
          })
        }
   
        
      },
      (rej) => {
        console.log("请求失败", rej)
      },
      (e) => {
      }
    )
  },
  // 获取动态列表
  getMoodList(){
    this.setData({ hasMore: true });
    let page = this.data.page;
    network.POST(
      network.URL_MOOD_LIST,
      { "familyID": wx.getStorageSync("familyID"), "pageNo": page },
      (res) => {
        if (res.data.code === 200 ) {
          if (res.data.data.length) {
            let moodPageList = this.data.moodPageList;
            moodPageList.push({ id:page ,moodList: res.data.data});
              this.setData({
                moodPageList: moodPageList
              })
              this.setData({ hasMore: false });
          } else {
              this.setData({ hasMore: false });
          }
          wx.stopPullDownRefresh();
        }
      },
      (rej) => {
        this.setData({ hasMore: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
      },
      (e) => {
      }
    )
  },
  // 刷新页面 
  refresh(){
    let nowTime = new Date();
    let formatNowTime = format.formatTime(nowTime);
    network.POST(
      network.URL_INDEX_REFRESH,
      { familyid: wx.getStorageSync("familyID"), "createtime": formatNowTime},
      (res) => {
        // console.log("请求成功")
      },
      (rej) => {
        // console.log("请求失败", rej)
      },
      (e) => {
        // console.log('请求结束');
      }
    )
  },
  // 预览图片
  previewImage(e) {
    this.setData({
      preview:true
    })
    let current = e.currentTarget.dataset.src,
        page = e.currentTarget.dataset.page,
        id = e.currentTarget.dataset.id;
    let urls = [];
    this.data.moodPageList.forEach((item) => {
      if (item.id === page) {
        let newMoodList = item.moodList;
        // 拿到当前page上的 moodList
        newMoodList.forEach((value) => {
          // 拿到每个 modeList 中的每条动态，对应 id 查询动态
          if (value.id === id) {
            // 遍历每条动态中的 图片，拿到图片地址 push 到数组中
            value.storageUrlList.forEach((moodUrlItem) => {
              urls.push(moodUrlItem.fileUrl);
            })
          }
        });
      }
    });
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls // 当前显示图片的http链接
    })
  },
  // 删除动态
  deleteMood(e){
    let id = e.currentTarget.dataset.id,
      page = e.currentTarget.dataset.page;
    wx.showModal({
      title: '提示',
      content: '确定删除这条动态吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          network.POST(
            network.URL_DELETE_MOOD,
            { "moodID": id },
            (res) => {
              if (res.data.code === 200) {
                let oldMoodPageList = this.data.moodPageList;
                let newMoodPageList = oldMoodPageList.map((item, i) => {
                  if (item.id === page) {
                    let newMoodList = item.moodList;
                    newMoodList.forEach((value, j) => {
                      if (value.id === id) {
                        newMoodList.splice(j, 1);
                      }
                    });
                    oldMoodPageList[i].moodList = newMoodList;
                    return oldMoodPageList[i];
                  } else {
                    return oldMoodPageList[i] = item;
                  }
                });
                this.setData({
                  moodPageList: newMoodPageList
                })
              }
            },
            (rej) => {
              console.log("请求失败", rej)
            },
            (e) => {
            }
          )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  
  
  },
  // 点赞功能
  admireHandle(e) {
    let id = e.currentTarget.dataset.id,
    page = e.currentTarget.dataset.page;
    network.POST(
      network.URL_TOOGLE_ADMIRE,
      { "moodId": id , "pageNo": page, "familyID": wx.getStorageSync("familyID")},
      (res) => {
        if (res.data.code === 200) {
          let oldMoodPageList = this.data.moodPageList;
          let newMoodPageList = oldMoodPageList.map((item, index) => {
            if (item.id === page) {
              oldMoodPageList[index].moodList = res.data.data;
              return oldMoodPageList[index];
            } else {
              return oldMoodPageList[index] = item;
            }
          });
          this.setData({
            moodPageList: newMoodPageList,
          })
        }
      },
      (rej) => {
        console.log("请求失败", rej)
      },
      (e) => {
      }
    )
  },
  onReachBottom(){
      let page = this.data.page;
      page++;
      this.setData({ page: page });
      if (!this.data.hasMore) return;
      this.getMoodList();
  },
  onPullDownRefresh: function () {
    // console.log("触发了下拉刷新事件,清空当前数据重新加载");
    this.setData({
      showFamilyList: false,
      showShareBtn: true,
      albumPicList: [],
      moodPageList: [],
      page: 1
    });
    // 刷新页面加载
    this.refresh();
    // 加载家庭信息
    network.POST(
      network.URL_FAMILY_GETLIST,
      {},
      (res) => {
        if (res.data.code === 200) {
          this.setData({
            familyList: res.data.data
          });
        }
      },
      (rej) => {
      },
      (e) => {
      }
    );
    // 加载相册列表
    this.albumList();
    // 加载动态列表
    this.getMoodList();

  },
  // 转发小程序
  onShareAppMessage(res) {
    let self = this;
    console.log(res)
    if (res.from === 'button') {
      let shareBtnType = res.target.dataset.shareType;
      console.log(shareBtnType);
      let currentFamilyName = self.data.familyInfo.familyName,
        currentFamilyId = self.data.familyInfo.id,
        currentUserName = self.data.userInfo.nickName,
        userSession = wx.getStorageSync("threerdSession");
      if (shareBtnType==1){
        return {
          title: `${currentUserName}邀请你加入${currentFamilyName}养老院`,
          path: `/pages/share/share?currentUserSession=${userSession}&currentFamilyId=${currentFamilyId}&currentUserName=${currentUserName}&currentFamilyName=${currentFamilyName}`,
          imageUrl: '',
          success: function (res) {

          },
          fail: function (res) {
        
          }
        }
      }else{
        return {
          title: '创建家人专属相册，永久保存',
          path: '/pages/login/login',
          imageUrl: '',
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            // 分享失败
            console.log(res)
          }
        }
      }
    } else {
      return {
        title: '创建家人专属相册，永久保存',
        path: '/pages/login/login',
        imageUrl: '',
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          // 分享失败
          console.log(res)
        }
      }
    }

  },
  // 点击弹出发布框 显示拍照视频相册
  showReleaseBoxHandle() {
    wx.hideTabBar({
      success: (res) => {
        // console.log(res);
      }
    });
    // 显示发布框
    this.setData({
      showReleaseBox: true
    })
    // console.log("显示框")
  },

  // 点击关闭发布框 
  closeReleaseBoxHandle() {
    wx.showTabBar({
      success: (res) => {
        console.log(res)
      }
    });
    // 隐藏发布框
    this.setData({
      showReleaseBox: false
    })
  },
  // 弹出相册列表 让用户选择
  showAlbumListHandle(){
    this.setData({
      showAlbumList:true
    }); 
  },
  chooseAlbumItemHandle(e) {
    let albumID = e.currentTarget.dataset.id;
    this.setData({
      albumID: albumID,
      showAlbumList: false
    });
    let familyID = wx.getStorageSync("familyID"),
      userSession = wx.getStorageSync("threerdSession"),
      btnType = this.data.btnType;
    if (btnType === "choosePhoto") {
          wx.chooseImage({
              count: 9, 
              sizeType: ['original', 'compressed'],
              sourceType: ['album'],
              success: (res) => {
                let url = res.tempFilePaths.join(),
                   genre = 'photo';
              wx.navigateTo({
                url: `/pages/show/show?url=${url}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}`,
              });
               this.setData({
                  release: true,
                  btnType:''
                });
            }
          })
         
    } else if (btnType === "takePhoto"){
          wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: (res) => {
              // 这个res.tempFilePaths 是一个数组 
              let url = res.tempFilePaths.join(),
                genre = 'photo';
              console.log(url);
              wx.navigateTo({
                url: `/pages/show/show?url=${url}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}`,
              });
              this.setData({
                release: true,
                btnType: ''
              });
            }
          });
        
    } else if (btnType === "shootVideo") {
      let genre = 'video';
        wx.showToast({
          title: '最多能拍10秒',
          icon:"none",
          duration:2000,
          success: res =>{
            wx.chooseVideo({
              sourceType: ['camera'],
              maxDuration: 10,
              compressed: true,
              camera: ['front', 'back'],
              success: (res) => {
                // console.log("拍视频的成功后的data", res);
                let { height, width, tempFilePath, size } = res;
                if (size >= 10485700) {
                  wx.showToast({
                    title: '上传视频文件过大,请重新上传',
                    icon: "none",
                    duration: 2000
                  })
                } else {
                  wx.navigateTo({
                    url: `/pages/show/show?videoSrc=${tempFilePath}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}&width=${width}&height=${height}`
                  });
                  this.setData({
                    release: true,
                    btnType: ''
                  });
                }
              }
            });
          }
        })
   
        
        
    } else if (btnType === "chooseVideo") { 
   
        let genre = 'video';
        wx.chooseVideo({
          sourceType: ['album'],
          compressed: true,
          maxDuration: 10,
          success: (res) => {
            // console.log("选择视频的成功后的data", res);
            let { height, width, tempFilePath, size } = res;
            if (size >= 10485700) {
              wx.showToast({
                title: '上传视频文件过大,请重新上传',
              })
            } else {
              wx.navigateTo({
                url: `/pages/show/show?videoSrc=${tempFilePath}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}&width=${width}&height=${height}`
              });
              this.setData({
                release: true,
                btnType: ''
              });
            }
       
          }
        });
        
      }
  },
  // 点击取消按钮 隐藏 相册列表
  hideAlbumList() {
    this.setData({
      showAlbumList: false,
      btnType:''
    });
  },
 
  // 选照片事件
  choosePhotoHandle(e) {
    this.showAlbumListHandle();
    this.setData({
      btnType: e.currentTarget.dataset.type
    })
  },
  // 拍照片事件
  takePhotoHandle(e) {
    this.showAlbumListHandle();
    this.setData({
      btnType: e.currentTarget.dataset.type
    })
  },
  // 拍视频
  shootVideoHandle(e) {
    wx.showToast({
      title: '注意：视频超过十秒将无法上传',
      icon:'none',
      duration: 3000
    })
    this.showAlbumListHandle();
    this.setData({
      btnType: e.currentTarget.dataset.type
    })
  },
  // 选视频
  chooseVideoHandle(e) {
    this.showAlbumListHandle();
    this.setData({
      btnType: e.currentTarget.dataset.type
    })
   
  },
  // 点击文字发布文字动态
  // releaseMoodHandle() {
  //   let  familyID = wx.getStorageSync("familyID"),
  //     userSession = wx.getStorageSync("threerdSession");
  //     this.setData({
  //       release:true,
  //       refreshFlag:true
  //     })
  //   wx.navigateTo({
  //     url: `/pages/moodText/moodText?familyID=${familyID}&userSession=${userSession}`,
  //   })
  // },
  // 录音开始
  // touchdown() {
  //   // 把录音动画绑定在this对象上并且执行
  //   speaking.call(this);
  //   this.setData({
  //     isSpeaking: true
  //   })
  //   recorderManager.start(mp3RecoderOptions);
  // },
  // // 录音结束
  // touchup() {
  //   console.log("录音结束");
  //   this.setData({
  //     isSpeaking: false
  //   })
  //   // 清除定时器
  //   clearInterval(this.timer);
  //   // 停止录音
  //   recorderManager.stop();
  //   let familyID = wx.getStorageSync("familyID"),
  //       userSession = wx.getStorageSync("threerdSession"),
  //       albumID="",
  //       content="",
  //       coverUrl="";
  //   recorderManager.onStop((res) => {
  //     let { tempFilePath, duration} = res;
  //     duration = Math.round(duration / 1000);
  //     // 上传录音文件
  //     wx.uploadFile({
  //       url: network.URL_UPLOAD, 
  //       filePath: tempFilePath,
  //       header: { 'Content-Type': 'multipart/form-data', "threerdSession": userSession },
  //       name: 'file',
  //       formData: {
  //         'familyID': familyID,
  //         'userSession': userSession,
  //         'type': ""
  //       },
  //       success: (res) => {
  //         let data = JSON.parse(res.data);
  //         if (data.code === 200) {
  //           let fileUrl = data.data.url;
  //           // 上传结束就发布
  //           wx.showLoading({
  //             title: '正在提交...',
  //             mask: true
  //           });
  //           network.POST(
  //             network.URL_RELEASE_MOOD,
  //             { "familyID": familyID, "userSession": userSession, "albumID": albumID, "fileUrl": fileUrl, "content": content, "coverUrl": coverUrl, "duration": duration},
  //             (res) => {
  //               if (res.data.code === 200) {
  //                 wx.hideLoading();
  //                 wx.showToast({
  //                   title: '发布成功',
  //                   icon: 'success',
  //                   duration: 2000,
  //                   success: () => {
  //                     this.closeReleaseBoxHandle();
  //                     this.setData({
  //                         moodPageList: [],
  //                         page: 1
  //                       })
  //                     this.getMoodList();
  //                   }
  //                 });
  //               }
  //             },
  //             (rej) => {
  //               console.log("请求失败", rej);
  //               wx.showToast({
  //                 title: '发布失败',
  //                 icon: 'none',
  //                 duration: 2000
  //               })
  //             },
  //             (e) => {
  //             }
  //           )
  //         }
  //       },
  //       fail: (res) => {
  //         console.log(res)
  //       }
  //     })
  //   })
  // },

  //创建新的相册
  showDialogBtn: function () {
    this.setData({
      showMask: true,
      showAlbum: true,
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },

  // 隐藏mask
  hideCover() {
    this.setData({
      showMask: false
    });
  },
  showCover() {
    this.setData({
      showMask: true
    });
  },
  /**
   * 取消按钮点击事件隐藏 mask 和 隐藏相册创建
   */
  onCancel() {
    this.hideCover();
    this.setData({
      showAlbum: false
    });
  },
  albumNameChange(e) {
    this.setData({
      albumName: e.detail.value
    })
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm() {
    //添加相册
    network.POST(
      network.URL_ALBUM_ADD,
      { familyId: wx.getStorageSync("familyID"), fileName: this.data.albumName },
      (res) => {
        if (res.data.code == 200) {
          this.setData({
            albumName: ""
          })
          this.albumList();
        }
      },
      (rej) => {
        console.log("请求失败", rej)
      },
      (e) => {
        
      }
    )
    this.hideCover();
    this.setData({
      showAlbum: false
    });
  },
  // 页面隐藏的时候
  onHide: function () {
    console.log("页面隐藏");
    this.closeReleaseBoxHandle();
    if(!this.data.btnType) {
      console.log("设置标识")
        this.setData({
          refreshFlag:true
        })
    }
  },
  // 播放录音
  playAudio(e){
    let { id , src}= e.currentTarget.dataset;
    this.setData({
      showVoiceGifId: id
    })
    innerAudioContext.src = src;
    innerAudioContext.autoplay = true;
    innerAudioContext.onStop((res) => {
      console.log(res);
      this.setData({
        showVoiceGifId: ''
      })
    });
    innerAudioContext.onEnded((res)=> {
      this.setData({
        showVoiceGifId: ''
      })
    })
 
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
      if (res.errCode === 10002) {
        wx.showToast({ 
          title: '网络错误，请检查手机网络',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 去视频页面
  showVideoHandle(e){
    let {videoSrc,width,height} = e.currentTarget.dataset;
    let currentPage = "index";
    // console.log(videoSrc, width, height);
    wx.navigateTo({
      url: `/pages/videoPage/videoPage?src=${videoSrc}&width=${width}&height=${height}&page=${currentPage}`,
    })
  },
  // closeInstructionsHandle(){
  //   this.setData({
  //     isFirstLogin:0
  //   })
  // }
});
//麦克风帧动画 
function speaking() {
  var _this = this;
  //话筒帧动画 
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}

