// pages/album/album.js
const network = require('../../utils/network.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    albumName:"",
    ablumList: [],
    showDelete:false,
    isDeleteBtn:true,
    paramID:[],
    albumID:'',
    page:1,
    hasMore: true,
    isEditBut:true,
    hidTips:false,
    isCancel: false,
    noPhoto:true
  },
  // 预览图片
  previewImage(e) {
    let current = e.currentTarget.dataset.src,
        id = e.currentTarget.dataset.id;
    let urls = [];
      this.data.ablumList.forEach((item) => {
        if (item.id === id) {
          item.photoList.forEach((item) => {
              if (!item.cover_url) {
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
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo');
  },
  // 去视频页面
  showVideoHandle(e) {
    let { videoSrc, width, height } = e.currentTarget.dataset;
    let currentPage = "myPhotoList";
    // console.log(videoSrc, width, height);
    wx.navigateTo({
      url: `/pages/videoPage/videoPage?src=${videoSrc}&width=${width}&height=${height}&page=${currentPage}`,
    })
  },

  editHandle(){
    this.setData({
      showDelete: true,
      isEditBut:true,
      isCancel: true
    })
    this.getAlbumList(this.data.albumID);
    
  },
  showToast(title, icon, success){
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000,
      success: () => {
        success;
      }
    })
  },
  checkboxChange: function (e) {
    var values = e.detail.value;
    if (values.length>0){
        this.setData({
          isDeleteBtn:false,
          paramID: values
        })
    }else{
      this.setData({
        isDeleteBtn: true,
      })
    }
   
  },
  deleteHandle(){
    let self = this;
    var paramID = self.data.paramID;
    network.POST(network.URL_ALBUM_DELSTO, paramID,
      (res) => {
        if (res.data.code === 200) {
          self.showToast("删除成功", "success", self.getAlbumList(self.data.albumID));
        } else {
          self.showToast("删除失败", "none");
        }
      },
      (rej) => {
        
      },
      (e) => {

      }
    )
    self.setData({
      paramID:[],
      showDelete:false,
      isDeleteBtn:true,
      isEditBut: false
    })
  },
  // getUserStorageUrl(){
    
  // },
  getAlbumList(albumID,status){
    if (!status){
      this.setData({
        page:1
      })
    }
    let page = this.data.page;
    
    network.POST(
      network.URL_ALBUM_INFO,
      //type为1表示我的相册，0为首页
      { "pageNo": page, "fileId": albumID, "type": 1, "familyid": wx.getStorageSync("familyID")},
      (res) => {
        if (res.data.code === 200) {
          var data = res.data.data;
            if (status){
              if (data.length) {
                this.setData({
                  ablumList: this.data.ablumList.concat(data),
                  hasMore: true,
                  hidTips: true,
                  isEditBut:false
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
                  hasMore: true,
                  isEditBut: false
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let albumID = options.albumID;
    let albumName = options.albumName;
    this.setData({
      albumName: albumName,
      albumID: albumID
    })
    this.getAlbumList(albumID)
  },
  cancelHandle(){
    this.setData({
      isCancel:false,
      showDelete: false,
      isEditBut: false,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      type:0,
      isEditBut: false,
      showDelete: false,
    })
    this.getAlbumList(this.data.albumID);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let page = this.data.page;
    page++;
    this.setData({ page: page});
    if (!this.data.hasMore) return;
    this.getAlbumList(this.data.albumID,true);
  }
})