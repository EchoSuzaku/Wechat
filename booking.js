// pages/booking/booking.js
var util = require('../../utils/util.js')
const wssc = require('../../utils/wss.js')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    'calendar': [],
    'today': {
      'day': (function () {
        var day = new Date();
        var cday = day.getFullYear() + '/' + (day.getMonth() + 1) + "/" + (day.getDate())
        return cday
      })(),
      'cday': (function () {
        var day = new Date();
        var cday = day.getFullYear() + '年' + (day.getMonth() + 1) + "月" + (day.getDate()) + "日"
        return cday
      })()
    },
   // bookingResoult: util.bookingResoult({}),
    roomcount: 1,
    resText: "",
    dayIdx: 0,
    ctrl_bookingtime: false,
    bookingtp_idx:0,
    bookingcheck:{
      status:0,
      s:{},
      e:{}
    }
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
        wx.request({
          url: 'https://uncleek.shoppingzone.com.cn/getMyCarfmans',
          data: {
            token: res.data
          },
          success: function (res) {
            for (var idx in res.data.myCarfmans) {
              //  console.log(idx);
              res.data.myCarfmans[idx].calendar = that.countCalendar(res.data.myCarfmans[idx].info.BookingPlan.week, res.data.myCarfmans[idx].countDays)
            }
            util.bookingResoult({
              start: util.c2d(res.data.myCarfmans[0].info.BookingPlan.starttime),
              end:util.c2d(res.data.myCarfmans[0].info.BookingPlan.endtime),
              date: res.data.myCarfmans[0].calendar[0].day,
              roomid: res.data.myCarfmans[0].carfman_id + "-" + res.data.myCarfmans[0].calendar[0].cday,
              token:that.data.token,
              e:that
            })
            that.setData({
              'today': res.data.myCarfmans[0].calendar[0],
              'carfmans': res.data.myCarfmans,
              'calendar': res.data.myCarfmans[0].calendar,
            //  'bookingResoult': util.bookingResoult(brp),
              'carfmanIdx': 0,
              'roomid': res.data.myCarfmans[0].carfman_id + "-" + res.data.myCarfmans[0].calendar[0].cday
            })  
          }
        })
        app.getUserInfo(function (userInfo) {
          //更新数据
          that.setData({
            userInfo: userInfo
          })
        })
        wssc.connSocket()
        wx.onSocketOpen(() => {
          wssc.sendmess('setConn', {
            'token': that.data.token,
            'nickname': that.data.userInfo.nickName,
            'roomid': that.data.roomid
          })
        })
        wx.onSocketMessage(function (res) {
          var cp = JSON.parse(res.data)
          console.log(cp)
          if (cp.tag == 'roomcount') {
            that.setData({
              roomcount: cp.data,
              resText: cp.text
            })
          }
          if (cp.tag == 'resetbookinginfomation'){
            util.bookingResoult({
              start: util.c2d(that.data.carfmans[that.data.carfmanIdx].info.BookingPlan.starttime),
              end: util.c2d(that.data.carfmans[that.data.carfmanIdx].info.BookingPlan.endtime),
              date: that.data.calendar[that.data.dayIdx].day,
              bookings:cp.data,
              token: that.data.token,
              e:that
            })
            that.setData({
              bookingcheck: {
                status: 0,
                s: {},
                e: {}
              },
              'ctrl_bookingtime': false,
            //  'bookingResoult': util.bookingResoult(brp)
            })
          }
          if (cp.tag == 'reservers') {
            var t = cp.data
            console.log(t)
            var n = that.data.bookingResoult
            for (var idx in n) {
              if (n[idx].guest == "no") {
                if ("undefined" != typeof t["s_" + idx]) {
                  n[idx].haveC = t["s_" + idx]
                } else {
                  delete n[idx].haveC
                }
              }
            }
            that.setData({
              bookingResoult: n
            })
          }
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
    wx.closeSocket()
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
  toMC: function () {
    wx.navigateTo({
      url: '../ihavecarfman/ihavecarfman',
    })
  },
  setbooking: function (e) {
    var that = this
    var idx = Number(e.currentTarget.dataset.id)
    util.bookingResoult({
      start: util.c2d(that.data.carfmans[idx].info.BookingPlan.starttime),
      end: util.c2d(that.data.carfmans[idx].info.BookingPlan.endtime),
      date: that.data.carfmans[idx].calendar[0].day,
      roomid: that.data.carfmans[idx].carfman_id + "-" + that.data.carfmans[idx].calendar[that.data.dayIdx].cday,
      token: that.data.token,
      e:that
    })
    that.setData({
      'calendar': that.data.carfmans[idx].calendar,
      'today': that.data.carfmans[idx].calendar[that.data.dayIdx],
     // 'bookingResoult': util.bookingResoult(brp),
      'carfmanIdx': idx,
      'roomid': that.data.carfmans[idx].carfman_id + "-" + that.data.carfmans[idx].calendar[that.data.dayIdx].cday,
      'ctrl_bookingtime': false,
      bookingtp_idx:0,
      'bookingcheck.status': 0,
      bookingrp:[]
    })
    delete that.data.sid
    var cdata = that.data.carfmans[idx].carfman_id + "-" + that.data.today.cday
    wssc.sendmess('setRoom', cdata)
  },
  countCalendar: function (week, countdays) {
    var alowWeek = []
    var alowAllDays = []
    for (var item in week) {
      switch (week[item]) {
        case "Sunday":
          alowWeek.push(0)
          break
        case "Monday":
          alowWeek.push(1)
          break
        case "Tuesday":
          alowWeek.push(2)
          break
        case "Wednesday":
          alowWeek.push(3)
          break
        case "Thursday":
          alowWeek.push(4)
          break
        case "Friday":
          alowWeek.push(5)
          break
        case "Saturday":
          alowWeek.push(6)
          break
      }
    }
    for (var i = 0; i < countdays; i++) {
      var day = new Date((new Date()).valueOf() + i * 1000 * 60 * 60 * 24)
      var w = day.getDay()
      var nn = []
      for (var n in alowWeek) {
        if (w == alowWeek[n]) {
          switch (w) {
            case 0:
              nn = ["周日", "Sunday"]
              break
            case 1:
              nn = ["周一", "Monday"]
              break
            case 2:
              nn = ["周二", "Tuesday"]
              break
            case 3:
              nn = ["周三", "Wednesday"]
              break
            case 4:
              nn = ["周四", "Thursday"]
              break
            case 5:
              nn = ["周五", "Friday"]
              break
            case 6:
              nn = ["周六", "Saturday"]
              break
          }
          var eday = day.getFullYear() + '/' + (day.getMonth() + 1) + "/" + day.getDate()
          var cday = day.getFullYear() + '年' + (day.getMonth() + 1) + "月" + day.getDate() + "日"
          alowAllDays.push({
            'day': eday,
            'cday': cday,
            'week1': nn[0],
            'week2': nn[1]
          })
        }
      }
    }
    return alowAllDays
  },
  setDay: function (e) {
    var that = this
    var dayIdx = Number(e.detail.value)
    var cdata = that.data.carfmans[that.data.carfmanIdx].carfman_id + "-" + that.data.calendar[dayIdx].cday
    util.bookingResoult({
      start: util.c2d(that.data.carfmans[that.data.carfmanIdx].info.BookingPlan.starttime),
      end: util.c2d(that.data.carfmans[that.data.carfmanIdx].info.BookingPlan.endtime),
      date: that.data.calendar[dayIdx].day,
      roomid: cdata,
      token: that.data.token,
      e:that
    })
    that.setData({
      'today': that.data.calendar[dayIdx],
     // 'bookingResoult': util.bookingResoult(brp),
      'roomid': cdata,
      'dayIdx': dayIdx,
      bookingtp_idx:0,
      'bookingcheck.status': 0,
      bookingrp:[]
    })
    delete that.data.sid
    wssc.sendmess('setRoom', cdata)
  },
  reserve: function (e) {
    var that = this
    // console.log(util.c2d(e.currentTarget.dataset.starttime))
    //  console.log(e.currentTarget.dataset.rangetime)
    var bookingtp = util.bookingtime(util.c2d(e.currentTarget.dataset.starttime), Number(e.currentTarget.dataset.rangetime))
    var sid = Number(e.currentTarget.dataset.id)
    var roomid = that.data.carfmans[that.data.carfmanIdx].carfman_id + "-" + that.data.today.cday
    if (sid != that.data.sid) {
      that.setData({
        sid: sid,
        ctrl_bookingtime: true,
        bookingtp: bookingtp
      })
      wssc.sendmess('toReserve', { name: that.data.userInfo.nickName, roomid: roomid, sid: sid })
    }
  },
  esc_bookingtime: function () {
    var that = this
    that.setData({
      ctrl_bookingtime: false,
      bookingtp_idx:0,
      'bookingcheck.status':0,
      bookingrp:[]
    })
  },
  bookingtps:function(e){
    var that = this
    var output = []
    for (var i = e.detail.value; i < that.data.bookingtp.r.length; i++) {
      output.push(that.data.bookingtp.r[i])
    }
    that.setData({
      bookingtp_idx:e.detail.value,
      bookingrp: output,
      'bookingcheck.status': 1,
      'bookingcheck.s': that.data.bookingtp.s[e.detail.value]
    })
  },
  bookingstep2:function(e){
    var that = this
    var output =[]
    for (var i = Number(e.currentTarget.dataset.idx);i<that.data.bookingtp.r.length;i++){
      output.push(that.data.bookingtp.r[i])
    }
    that.setData({
      bookingrp:output,
      'bookingcheck.status': 1,
      'bookingcheck.s': that.data.bookingtp.s[Number(e.currentTarget.dataset.idx)]
    })
  },
  bookingrps: function (e) {
    var that = this
    that.setData({
      bookingrp_idx: e.detail.value,
      'bookingcheck.status': 2,
      'bookingcheck.e': that.data.bookingrp[e.detail.value]
    })
  },
  bookingstep3:function(e){
    var that = this
    that.setData({
      'bookingcheck.status': 2,
      'bookingcheck.e': that.data.bookingrp[Number(e.currentTarget.dataset.idx)]
    })
  },
  bookingsubmit:function(){
    var that = this
    var range = that.data.bookingcheck.e.d - that.data.bookingcheck.s.d
   // var bookingTS = that.data.today.day.replace(/\//g,'-') + "T" + that.data.bookingcheck.s.c+":00Z"
   // console.log(bookingTS)
    var output = {
      bookingDate:that.data.today,
     // bookingTimeStamp: new Date(bookingTS),
      startTime:that.data.bookingcheck.s,
      endTime:that.data.bookingcheck.e,
      timeRange:range,
      bookingGuest:that.data.userInfo.nickName,
      roomId:that.data.roomid,
      carfman:{
        major:that.data.carfmans[that.data.carfmanIdx].major,
        name: that.data.carfmans[that.data.carfmanIdx].name,
        carfman_id: that.data.carfmans[that.data.carfmanIdx].carfman_id
      },
      token:that.data.token,
      active:true
    }
    if (that.data.bookingcheck.status == 2){
      wssc.sendmess('bookingsubmit', output)
    }
  }
})
