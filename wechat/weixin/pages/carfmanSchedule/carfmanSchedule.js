// pages/carfmanSchedule/carfmanSchedule.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mySchedule:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function (resg) {
        wx.request({
          url: 'https://uncleek.shoppingzone.com.cn/getMySchedules/'+resg.data,
          success:function(res){
            that.setData({
              token: resg.data,
              mySchedule:res.data
            })
          }
        })
      }
    })
    wx.getStorage({
      key: 'Sysinfo',
      success: function(res) {
        that.setData({
          sysInfo:res.data,
          height:res.data.screenHeight
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  settting:function(){
    wx.navigateTo({
      url: '../becarfman/becarfman',
    })
  }
})