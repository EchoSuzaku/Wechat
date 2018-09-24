// pages/becarfman/becarfman.js
const date = new Date()
const year = date.getFullYear()
const month = date.getMonth() + 1
const day = date.getDate()
const today = year + "-" + month + "-" + day
const endday = year + 1 + "-" + month + "-" + day

Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: today,
    endday: endday,
    targetday: today,
    starttime:"00:00",
    endtime:"24:00",
    forever:true
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

  settargetday: function (e) {
    var that = this
    that.setData({
      targetday: e.detail.value
    })
  },
  changeforever: function (e) {
    var that = this
    that.setData({
      forever: eval(e.detail.value)
    })
  },
  setweek: function (e) {
    var that = this
    that.setData({
      week: e.detail.value
    })
  },
  setStartTime:function(e){
    var that = this
    that.setData({
      starttime: e.detail.value
    })
  },
  setEndTime:function(e){
    var that = this
    that.setData({
      endtime: e.detail.value
    })
  },
  submit:function(e){
    var that = this
    var week = that.data.week || []
    var targetday = that.data.forever || that.data.targetday
    wx.request({
      url: 'https://uncleek.shoppingzone.com.cn/setBookingPlan',
      data:{
        token:that.data.token,
        week:week,
        forever:that.data.forever,
        targetday: targetday,
        starttime:that.data.starttime,
        endtime:that.data.endtime
      },
      success:function(res){
        if(res.data == "ok"){
          wx.navigateTo({
            url: '../carfmanSchedule/carfmanSchedule',
          })
        }else{
          wx.navigateTo({
            url: '../index/index',
          })         
        }
      }
    })
  },
  close:function(){
    wx.navigateBack({
      delta:1
    })
  }
})