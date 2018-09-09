
Page({

  data: {
    src:'',
    width:null,
    height:null,
    page:""
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      src: options.src,
      width: options.width,
      height:options.height,
      page: options.page
    });

  },

  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.play();
  },
  closeVideoHandle(){
    this.videoContext.pause();
    wx.navigateBack({
      delta: 1
    })
  },
  videoPlayError(e) {
    console.log(e)
  }
})