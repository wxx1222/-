//服务器访问域名

var API_DOMAIN_URL = "https://www.zyailao.com/family";
//  var API_DOMAIN_URL = "http://192.168.0.119:8081";
var URL_CODELOGIN = API_DOMAIN_URL + "/weChatUser/login?js_code="


function showErrorToast(title) {
  wx.showToast({
    title: title,
    icon:'none',
    duration: 2000
  });
};

function showLoding() {
  wx.showLoading({
    title: '加载中'
  });
}

function baseRequest(method, url, params, success, fail, complete) {
  wx.request({
    url: url,
    data: params,
    method: method,// OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT    
    header: {
      "accept": "application/json"
      , "threerdSession": wx.getStorageSync("threerdSession")
    },
    success: success,
    fail: fail,
    complete: function () {
      complete();
    }
  })
}


function request(method, url, params, success, fail, complete) {
  wx.checkSession({
    success: function (e) {
      sessionCheckSuccessRequest(method, url, params, success, fail, complete);
    },
    fail: function (e) {
      sessionCheckFailRequest(method, url, params, success, fail, complete);
    }
  });
}

function sessionCheckSuccessRequest(method, url, params, success, fail, complete) {
  baseRequest(method, url, params,
    //ajax成功
    function (e) {
      if (e.data.code==200) {
        // wx.hideLoading();
        success(e);
      }
      else if (e.data.msg == "请先wx.login登录") {
        sessionCheckFailRequest(method, url, params, success, fail, complete);
      }
      else if (e.data.msg == "不能操作，相册下面有照片！！") {
        showErrorToast("不能操作，相册下面有照片！！");
      }else{
        showErrorToast("服务异常");
      }
    }
    //ajax失败
    , function (e) {
      // wx.hideLoading();
      showErrorToast("服务异常");
      console.log(e);
      fail();

    }
    , function () {
      complete();
    }
  )
}

function sessionCheckFailRequest(method, url, params, success, fail, complete) {
  if (wx.getStorageSync("authorize")) {
    wx.login({
      success: function (e) {
        console.log("登录成功", e);
        baseRequest(method, URL_CODELOGIN + e.code, {},
          function (e1) {
            if (e1.data.code == 200) {
              wx.setStorageSync("threerdSession", e1.data.data.ThreerdSession);
              baseRequest(method, url, params, success, fail, complete);
            }
            else {
              // wx.hideLoading();
              showErrorToast('向服务器提交code失败！' + e1.data.statusCode);
            }
          },
          function (rej) {
            console.log(rej);
            showErrorToast('登录成功后，发送code失败！');
          },
          function () {
            complete();
          }
        );
      }
      //登录失败
      , fail: function (e) {
        // wx.hideLoading();
        showErrorToast('登陆失败');
      }
    });
  } else {
    
  }

}

module.exports = {
  //保存微信用户信息
  URL_WECHATUSER_SAVE: API_DOMAIN_URL + "/weChatUser/save", 
  //获取所有身份
  URL_SYSDICT: API_DOMAIN_URL + "/sysDict/getSysDictListFamilyRole", 
  //新增家庭
  URL_SYSFAMILY_SAVE: API_DOMAIN_URL + "/family/save", 
  //查询节日
  URL_HOLIDAY_LIST: API_DOMAIN_URL + "/holiday/holidayList",
  //新增节日
  URL_HOLIDAY_SAVE: API_DOMAIN_URL + "/holiday/inserteHoliday", 
  //删除节日
  URL_HOLIDAY_DELETE: API_DOMAIN_URL + "/holiday/deleteHoliday",
  //删除家庭成员
  URL_MEMBER_DELETE: API_DOMAIN_URL + "/member/deleteMember",
  //查看家庭成员
  URL_MEMBER_GETLIST: API_DOMAIN_URL + "/member/getMembersByFamilyID",
  //更新家庭信息
  URL_FAMILY_UPDATE: API_DOMAIN_URL + "/family/updateFamily",
  //获取家庭列表
  URL_FAMILY_GETLIST: API_DOMAIN_URL + "/family/getSysFamiliesByUserSession",
  //根据家庭ID删除家庭
  URL_FAMILY_DELETE: API_DOMAIN_URL + "/family/deleteFamily",

  //获取相册列表
  URL_ALBUM_LIST: API_DOMAIN_URL + "/album/albumList",
  //添加或修改相册
  URL_ALBUM_ADD: API_DOMAIN_URL + "/album/newAlbum",
  //删除相册
  URL_ALBUM_DELETE: API_DOMAIN_URL + "/album/delAlbum",
  //查看相册资源
  URL_ALBUM_INFO: API_DOMAIN_URL + "/album/albumInfo",
  //删除文件
  URL_ALBUM_DELSTO: API_DOMAIN_URL + "/album/deleteStorageUrl",
  //添加分享关系
  URL_USER_ADDRECORD: API_DOMAIN_URL + "/weChatUser/addRecord",
  //查询当前用户是否存在于分享人所分享的家庭内
  URL_USER_QUERYGROUP: API_DOMAIN_URL + "/weChatUser/queryGroup",
  // 根据家庭 ID 查询动态列表
  URL_MOOD_LIST: API_DOMAIN_URL + "/mood/getFamilyMoodList",
  // 根据动态 ID 移除点赞信息
  URL_TOOGLE_ADMIRE: API_DOMAIN_URL + "/mood/likes", 
  // 根据动态的ID 删除 动态
  URL_DELETE_MOOD: API_DOMAIN_URL + "/mood/deleteMoodByID", 
  // 发布动态 /mood/releaseMood
  URL_RELEASE_MOOD: API_DOMAIN_URL + "/mood/releaseMood", 
  // 刷新index页面 
  URL_INDEX_REFRESH: API_DOMAIN_URL + "/refresh/add", 
  // 上传文件
  URL_UPLOAD: API_DOMAIN_URL + "/weChat/upload", 
  // 获得我的信息
  URL_GETUSERINFO: API_DOMAIN_URL + "/user/getUserInfo", 
  // 修改我的信息
  URL_UPDATEUSERINFO: API_DOMAIN_URL + "/user/updateUserInfo",
  GET(url, params, success, fail, complete) {
    request('GET', url, params, success, fail, complete);
  },
  POST(url, params, success, fail, complete) { request('POST', url, params, success, fail, complete) }

}
