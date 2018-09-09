const network = require('../../utils/network.js');

Page({
  data: {
    files:[],
    fileUrl:[],
    albumID:"",
    familyID:"",
    userSession:""
  },
  onLoad(options){
    // 页面加载的时候就执行文件上传
    // console.log(options);
    // 过来的文件是视频
    if (options.videoSrc){
      let files = options.videoSrc.split();
      console.log(files);
      this.setData({
        videoSrc: options.videoSrc,
        uploadShow: true,
        albumID: options.albumID,
        familyID: options.familyID,
        userSession: options.userSession,
        genre: options.genre,
        files: files,
        width: options.width,
        height:options.height
      });
      this.uploadFileHandle();
    };
    // 从过来的文件是照片
    if(options.url) {
      // 处理传入过来的字符串 
      let files = options.url.split(",");
      this.setData({
        uploadShow:false,
        files: files,
        albumID: options.albumID,
        familyID: options.familyID,
        genre: options.genre,
        userSession: options.userSession
      })
      this.uploadFileHandle();
    }
  },
  // 上传文件和视频
  uploadFileHandle(){
    let array = this.data.files,
        albumID = this.data.albumID,
        familyID = this.data.familyID,
        genre = this.data.genre,
        userSession = this.data.userSession;
    //  遍历数组将其一个一个上传
    // console.log(array);
    array.forEach((value)=>{
      wx.uploadFile({
        url: network.URL_UPLOAD,
        filePath: value,//本地的文件路径
        name: 'file',
        header: { 'Content-Type': 'multipart/form-data', "threerdSession": userSession },
        formData: {
          'albumID': albumID,
          'familyID': familyID,
          'userSession': userSession,
          "type": genre
        },
        success: (res) => {
          let data = JSON.parse(res.data);
          // console.log(res);
          if (data.code === 200) {
            // console.log("上传文件成功");
            // console.log(data)
            if (genre==="video") {
              let fileArray = [data.data.coverUrl,data.data.url];
              this.setData({
                fileUrl: this.data.fileUrl.concat(fileArray),
              });
            } else {
              this.setData({
                fileUrl: this.data.fileUrl.concat(data.data.url)
              });
            }
            // console.log(this.data.fileUrl.length);
            this.setData({
              fileLength: this.data.fileUrl.length
            });
        
            // console.log(this.data.fileUrl,"111111111111111111111111");
          }
        },
        fail:(res) => {
          console.log(res, "上传失败")
        }
      })
    })
   
   
  },
  // 点击加号选择图片 
  chooseImage: function (e) {
  
    let albumID = this.data.albumID,
        familyID = this.data.familyID,
        genre = "photo",
        filesLength = null,
        userSession = this.data.userSession;
    if ( this.data.files.length >= 9) {
      wx.showToast({
        title: '已经选了9张了，不能再选了',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      filesLength = 9 - this.data.files.length;
    }
    wx.chooseImage({
      count: filesLength,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success:  (res)=> {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          files: this.data.files.concat(res.tempFilePaths)
        });
        // console.log(this.data.files);
        // console.log(res.tempFilePaths);
        res.tempFilePaths.forEach((value) => {
          wx.uploadFile({
              url: network.URL_UPLOAD,
            filePath: value,//本地的文件路径
            header: { 'Content-Type': 'multipart/form-data', "threerdSession": userSession },
            name: 'file',
            formData: {
              'albumID': albumID,
              'familyID': familyID,
              'userSession': userSession,
              'type': genre
            },
            success: (res) => {
              let data = JSON.parse(res.data);
              if (data.code === 200) {
                // console.log("上传文件成功");
                this.setData({
                  fileUrl: this.data.fileUrl.concat(data.data.url),
                });
                // console.log(this.data.fileUrl.length);
                this.setData({
                  fileLength: this.data.fileUrl.length
                });
                // console.log(res,"111111111111111");
              }
            },
            fail: (res) => {
              console.log(res,"上传失败")
            }
          })
        })
       
   
      }
    })
  },
  // 预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  // 发布动态
  releaseBtn(e){
    let fileLength = this.data.fileLength,
        albumID = this.data.albumID,
        familyID = this.data.familyID,
        userSession = this.data.userSession,
        genre = this.data.genre,
        width = this.data.width,
        height = this.data.height,
        content = '',
        coverUrl = '',
        duration = null,
        fileUrl = [];
    wx.showLoading({
      title: '正在提交...',
      mask: true
    });
    if (genre === "video") {
      console.log("上传视频");
       coverUrl = this.data.fileUrl[0],
       fileUrl[0] = this.data.fileUrl[1];
      //  console.log("上传之前的封面", coverUrl);
      //  console.log("上传之前的视频地址", fileUrl);
       if (fileUrl.length > 0  && typeof (coverUrl) !== "undefined") {
         network.POST(
           network.URL_RELEASE_MOOD,
           { "familyID": familyID, "userSession": userSession, "albumID": albumID, "fileUrl": fileUrl, "content": content, "coverUrl": coverUrl, "duration": duration, "high": height, "width" :width},
           (res) => {
             console.log(res)
             if (res.data.code === 200) {
               wx.hideLoading();
               wx.showToast({
                 title: '发布成功',
                 icon: 'success',
                 duration: 2000,
                 success: () => {
                   wx.switchTab({
                     url: '/pages/index/index'
                   })
                 }
               });
             }
           },
           (rej) => {
             console.log("请求失败", rej);
             wx.showToast({
               title: '发布失败',
               icon: 'none',
               duration: 2000
             })
           },
           (e) => {
           }
         )
       } else {
         wx.showToast({
           title: '网速较差，请稍等一下发布',
           icon: 'none',
           duration: 2000
         })
       }
    } else {
      // console.log("上传照片");
      coverUrl = '',
      fileUrl = this.data.fileUrl;
      if (fileUrl.length === fileLength && typeof (fileUrl[0]) !=="undefined") {
        network.POST(
          network.URL_RELEASE_MOOD,
          { "familyID": familyID, "userSession": userSession, "albumID": albumID, "fileUrl": fileUrl, "content": content, "coverUrl": coverUrl, "duration": duration },
          (res) => {
            console.log(res)
            if (res.data.code === 200) {
              wx.hideLoading();
              wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 2000,
                success: () => {
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                }
              });
            }
          },
          (rej) => {
            console.log("请求失败", rej);
            wx.showToast({
              title: '发布失败',
              icon: 'none',
              duration: 2000
            })
          },
          (e) => {
          }
        )
      } else {
        wx.showToast({
          title: '网速较差，请稍等一下发布',
          icon: 'none',
          duration: 2000
        })
      }

    }
  }
});