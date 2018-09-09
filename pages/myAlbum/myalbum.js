const network = require('../../utils/network.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    albumPicList:[],
    showMask:false,
    showAlbum:false,
    oldFileName:'',
    albumName:'',
    currentID:''
  },
  showToast: (title, icon) => {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.albumList();
  },
  //获取相册列表
  albumList() {
    network.POST(
      network.URL_ALBUM_LIST,
      { familyid: wx.getStorageSync("familyID"),type:1 },
      (res) => {
        let itemList = [];
        res.data.data.map(function (value, index) {
          // console.info(value)
          itemList.push(value.file_name);
        })
        this.setData({
          albumPicList: res.data.data,
          itemList: itemList
        })

      },
      (rej) => {
        // console.log("请求失败", rej)
      },
      (e) => {
        // console.log(33333333333);
      }
    )
  },
  operateHandle(e){
    if (this.data.editId) {
      this.setData({
        editId: ''
      })
    } else {
      this.setData({
        editId: e.currentTarget.dataset.id
      })
    }
    // console.log(this.data.editId);
  },
  editAlbumHandle(e){
    let albumId = e.currentTarget.dataset.id;
    let fileName = e.currentTarget.dataset.name;
    
    this.showCover();
    this.setData({
      currentID: albumId,
      showAlbum:true,
      oldFileName:fileName
    })



  },
  deleteAlbumHandle(e) {
    let albumID = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '您确认要删除这个相册吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          network.POST(
            network.URL_ALBUM_DELETE,
            { "id": albumID},
            (res) => {
              if (res.data.code == 200) {
                this.albumList();
                this.showToast("删除成功", "success");
              } else {
                this.showToast("删除失败", "none");
              }
            },
            (rej) => {
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
  // * 弹出框蒙层截断touchmove事件
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
   * 取消按钮点击事件隐藏 mask 和 隐藏相册修改
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
    let self = this.data;
    let currentID = self.currentID;
    let albumName = self.albumName;
    let oldFileName = self.oldFileName;
    console.log(this.data.currentID);
    console.log(this.data.albumName);
    if (!albumName){
      albumName = oldFileName;
    }
    if (oldFileName != albumName){
      network.POST(
        network.URL_ALBUM_ADD,
        { "id": currentID, "fileName": albumName },
        (res) => {
          if (res.data.code == 200) {
            this.albumList();
            this.showToast("修改成功", "success");
          } else {
            this.showToast("修改失败", "none");
          }
        },
        (rej) => {
          this.showToast("修改失败", "none");
        },
        (e) => {
        }
      )
    }
    this.hideCover();
    this.setData({
      showAlbum: false,
      albumName:''
    });
  },

  onShow: function () {
      this.setData({
        editId: ''
      })
  }
})