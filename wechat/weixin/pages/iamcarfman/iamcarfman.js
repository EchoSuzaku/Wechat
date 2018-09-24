// pages/iamcarfman/iamcarfman.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getStorage({
      key: 'token',
      success: function (res) {
        that.setData({
          token: res.data
        })
      }
    })
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/getMajor',
      success: function (res) {
        that.setData({
          Majors: res.data
        })
      }
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

  getMajor: function (e) {
    var that = this
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/setMajor',
      data: {
        'id': e.currentTarget.dataset.id,
        'token': that.data.token
      },
      success: function (res) {
        if (res.data == "ok") {
          wx.navigateTo({
            url: '../becarfman/becarfman'
          })
        } else {
          wx.navigateTo({
            url: '../index/index'
          })
        }
      }
    })
  },

  addmajor: function (e) {
    var that = this
    that.setData({
      newmajor: e.detail.value
    })
  },

  comformadd: function () {
    var that = this
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/addMajor',
      data: {
        token: that.data.token,
        major: that.data.newmajor
      },
      success: function (res) {
        if (res.data == "ok") {
          wx.navigateTo({
            url: '../becarfman/becarfman'
          })
        } else {
          wx.navigateTo({
            url: '../index/index'
          })
        }
      }
    })
  }
})