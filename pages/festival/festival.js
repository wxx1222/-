var sliderWidth = 99; // 需要设置slider的宽度，用于计算中间位置
var network = require('../../utils/network.js')
var { formatDate } = require('../../utils/util.js')
Page({
  data: {
    tabs: ["节日", "生日", "纪念日"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    param: { type: 0, familyId: wx.getStorageSync("familyID") },
    festivalList: [],
    birthdayList: [],
    memorialDaysList: []
  },
  onLoad: function (options) {

    // 设置导航条
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          sliderLeft: (res.windowWidth / this.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / this.data.tabs.length * this.data.activeIndex
        });
      }
    });
    this.getHolidayList(this.data.param.type);

  },
  onShow(options) {
    this.getHolidayList(this.data.param.type);
  },
  getHolidayList: function (type) {
    network.POST(network.URL_HOLIDAY_LIST, this.data.param
      , (e) => {
        // console.log("e=====>", e.data);
        var data = e.data;
        if (e.data.code=200) {
          // console.log("type--------------->", type);
          if (type == 0) {
            this.setData({
              festivalList: data.data
            });
          } else if (type == 1) {
            this.setData({
              birthdayList: data.data
            });
          } else {
            this.setData({
              memorialDaysList: data.data
            });
          }
        } else {
          // this.showSuccessToast("添加失败", 'none');
        }
      }
      , (e) => {
        // console.log("失败=====>" + e);
      }
      , () => {

      }
    );
  },
  deleteBirthday: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success: (res) => {
        if (res.confirm) {
          let id = e.target.dataset.id;
          network.GET(network.URL_HOLIDAY_DELETE, { holidayId: id }
            , (e) => {
              //删除成功之后
              this.getHolidayList(this.data.param.type);
            }
            , (e) => {
              // console.log("失败=====>" + e);

            }
            , () => {

            }
          );

        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })

  },
  tabClick: function (e) {
    let activeIndex = e.currentTarget.id;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: activeIndex,
      param: { type: activeIndex, familyId: wx.getStorageSync("familyID") }
    });
    this.getHolidayList(activeIndex);
  },
  createFestival() {
    wx.navigateTo({
      url: '/pages/festival/createFestival?type=' + this.data.activeIndex + ''
    })
  },
});