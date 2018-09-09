// pages/album/album.js
const network = require('../../utils/network.js');
Page({
  data: {
    albumName:"",
    ablumList: [],
    albumID:'',
    page:1,
    hasMore: true,
    type:0,
    hidTips:false,
    noPhoto:true,
    showReleaseBox:false
  },
  // 预览图片
  previewImage(e) {
    let current = e.currentTarget.dataset.src,
        id = e.currentTarget.dataset.id;
    console.log(current)
    let urls = [];
      this.data.ablumList.forEach((item) => {
        if (item.id === id) {
          item.photoList.forEach((item) => {
              if (!item.cover_url){
                urls.push(item.url);
              }
          })
        }
      })
      wx.previewImage({
        current: current, // 当前显示图片的http链接
        urls: urls// 当前显示图片的http链接
      })
    
 
  },
  showReleaseBoxHandle() {
    wx.hideTabBar({
      success: (res) => {
        console.log(res);
      }
    });
    this.setData({
      showReleaseBox: true
    })
  },
  closeReleaseBoxHandle() {
    this.setData({
      showReleaseBox: false
    })
  },
  // 获取相册中的数组
  getAlbumList(albumID,status){
    if (!status){
      this.setData({
        page:1
      })
    }
    let page = this.data.page;
    network.POST(
      network.URL_ALBUM_INFO,
      { "pageNo": page, "fileId": albumID, "type": 0, "familyid": wx.getStorageSync("familyID")},
      (res) => {
        if (res.data.code === 200) {
            let data = res.data.data;
            if (status){
              if (data.length) {
                this.setData({
                  ablumList: this.data.ablumList.concat(data),
                  hasMore: true,
                  hidTips: true
                })
              } else {
                this.setData({ hidTips: false, hasMore: false, noPhoto: true });
              }
            }else{
              this.setData({
                ablumList: data,
              })
              if (data.length) {
                this.setData({
                  hidTips: true,
                  hasMore: true
                })
              } else {
                this.setData({ hidTips: true, noPhoto: false });
              }
            }
            wx.stopPullDownRefresh();
        }
      },
      (rej) => {
      },
      (e) => {

      }
    )
  },


  choosePhotoHandle(e) {
    let albumID = this.data.albumID,
      familyID = wx.getStorageSync("familyID"),
      userSession = wx.getStorageSync("threerdSession");
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], 
      sourceType: ['album'], 
      success: (res) => {
        let url = res.tempFilePaths.join(),
          genre = 'photo';
        wx.navigateTo({
          url: `/pages/show/show?url=${url}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}`,
        });
      }
    })
  },
  // 拍照片事件
  takePhotoHandle(e) {
    let albumID = this.data.albumID,
      familyID = wx.getStorageSync("familyID"),
      userSession = wx.getStorageSync("threerdSession");
    wx.chooseImage({
      sizeType: ['original', 'compressed'], 
      sourceType: ['camera'], 
      success: (res) => {
        let url = res.tempFilePaths.join(),  
          genre = 'photo';
        wx.navigateTo({
          url: `/pages/show/show?url=${url}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}`,
        });
      }
    })
  },
  // 拍视频
  shootVideoHandle(){
    wx.showToast({
      title: '注意：视频超过十秒将无法上传',
      icon: 'none',
      duration:3000
    })
    let albumID = this.data.albumID,
        familyID = wx.getStorageSync("familyID"),
        userSession = wx.getStorageSync("threerdSession"),
        genre = 'video';
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 10,
      compressed: true,
      camera: 'back',
      success:  (res) => {
        let { height, width, tempFilePath, size } = res;
        if (size >= 10485700) {
          wx.showToast({
            title: '上传视频文件过大,请重新上传',
          })
        } else {
          wx.navigateTo({
            url: `/pages/show/show?videoSrc=${tempFilePath}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}&width=${width}&height=${height}`
          });

        }
      }
    })
  },
  // 选视频
  chooseVideoHandle(){
    let albumID = this.data.albumID,
        familyID = wx.getStorageSync("familyID"),
        userSession = wx.getStorageSync("threerdSession"),
        genre = 'video';
    wx.chooseVideo({
      sourceType: ['album'],
      maxDuration: 10,
      compressed: true,
      camera: 'back',
      success:  (res)=> {
        let { height, width, tempFilePath, size } = res;
        if (size >= 10485700) {
          wx.showToast({
            title: '上传视频文件过大,请重新上传',
          })
        } else {
          wx.navigateTo({
            url: `/pages/show/show?videoSrc=${tempFilePath}&albumID=${albumID}&familyID=${familyID}&userSession=${userSession}&genre=${genre}&width=${width}&height=${height}`
          });
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let albumID =  options.albumID;
    this.setData({
      albumName: options.albumName,
      albumID: albumID
    });
    this.getAlbumList(albumID)
  },


  onPullDownRefresh: function () {
    this.setData({
      type:0,
      isEditBut: false,
      showDelete: false,
    })
    this.getAlbumList(this.data.albumID);
  },
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo');
  },
  // 去视频页面
  showVideoHandle(e) {
    let { videoSrc, width, height } = e.currentTarget.dataset;
    let currentPage = "indexPhotoList";
    // console.log(videoSrc, width, height);
    wx.navigateTo({
      url: `/pages/videoPage/videoPage?src=${videoSrc}&width=${width}&height=${height}&page=${currentPage}`,
    })
  },

  onReachBottom: function () {
    let page = this.data.page;
    page++;
    this.setData({ page: page});
    if (!this.data.hasMore) return;
    this.getAlbumList(this.data.albumID,true);
  }
})