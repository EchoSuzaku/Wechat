//app.js
//小程序逻辑文件，主要用于注册小程序全局实例，编译时会和其他页面逻辑文件打包成一份 Javascript 文件
    //app.json 是小程序配置文件，json在程序加载时加载，负责对小程序的全局配置
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          wx.request({
            url: 'https://uncleek.shoppingzone.com.cn/WXOAuth',
            data: {
              'code': res.code
            },
            success: function (res0) {
              wx.setStorage({
                key: 'token',
                data: res0.data,
              })
              wx.getUserInfo({
                withCredentials: true,
                success: function (res) {
                  wx.request({
                    url: 'https://uncleek.shoppingzone.com.cn/WXgetUserInfo',
                    data: {
                      'iv': res.iv,
                      'encrypteddata': res.encryptedData,
                      'token':res0.data
                    },
                    success: function (res) {
                      
                    }
                  })
                }
              })
            }
          })
        }
      })
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null
  }
})
