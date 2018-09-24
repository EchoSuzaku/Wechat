//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    wx.getSystemInfo({
      success: function(res) {
        wx.setStorage({
          key: 'Sysinfo',
          data: res
        })
        that.setData({
          sysInfo:res
        })
      },
    })
    wx.getStorage({
      key: 'token',
      success: function (res) {
        that.setData({
          token: res.data
        })
      }
    })
  },


  iam: function () {//我能教课
    var that = this
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/isCarfman',
      data: {
        'token': that.data.token
      },
      success: function (res) {
        if (res.data == "yes") {
          wx.navigateTo({
            url: '../becarfman/becarfman',
          })
        } else if (res.data == "have") {
          wx.navigateTo({
            url: '../carfmanSchedule/carfmanSchedule',
          })
        } else {
          wx.navigateTo({
            url: '../iamcarfman/iamcarfman',
          })
        }
      }
    })
  },
  ihave: function () {//我想学习
    var that = this
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/firstCarfman',
      data: {
        token: that.data.token
      },
      success: function (res) {
        if (res.data == "is") {
          //mongo 返回is路由到 /ihavecarfam/ihavecarfman
          wx.navigateTo({
            url: '../ihavecarfman/ihavecarfman',
          })
        } else {
          //mongo 返回 no 路由到 /ihavecarfam/ihavecarfman
          wx.navigateTo({
            url: '../booking/booking',
          })
        }
      }
    })

  }
})
