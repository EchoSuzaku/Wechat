function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function c2d(time) {
  var temp = time.split(":")
  var h = Number(temp[0])
  var m = Number(temp[1])
  if (m < 30) {
    m = 0
  } else {
    m = 0.5
  }
  return h + m
}

function d2c(digitel) {
  var h = parseInt(digitel)
  var m = digitel - h
  if (m == 0) {
    var output = h + ":00"
  } else {
    var output = h + ":30"
  }
  return output
}


function bookingtime(start, range) {
  var timeblock = (range - 1) / 0.5
  var output = [{ d: start, c: d2c(start) }]
  var timebrange = [{ d: start + 1, c: d2c(start + 1) }]
  for (var i = 0; i < timeblock; i++) {
    var vp = {
      d: output[i].d + 0.5,
      c: d2c(output[i].d + 0.5)
    }
    var rp = {
      d: output[i].d + 1.5,
      c: d2c(output[i].d + 1.5)
    }
    output.push(vp)
    timebrange.push(rp)
  }
  output = {
    s: output,
    r: timebrange
  }
  return output
}


function bookingResoult(brp) {
  //  console.log("brp", brp)
  var day = new Date()
  var today = day.getFullYear() + '/' + (day.getMonth() + 1) + "/" + (day.getDate())
  var starttime = brp.start || 8.5
  var endtime = brp.end || 21.0
  var date = brp.date || today
  //var bookings = brp.bookings
  var roomid = brp.roomid
  var token = brp.token
  var that = brp.e
  var p = promisefn(wx.request)
  p({
    url: 'https://uncleek.shoppingzone.com.cn/getBookings',
    data: {
      token: token,
      roomId: roomid
    }
  }).then(function (res) {
    //  console.log(res.data)
    var bookings = brp.bookings || res.data
    //  console.log("bookings",bookings)
    var output = []
    if (bookings.length > 0) {
      for (var i = 0; i < bookings.length; i++) {
        var cp = { 'time': d2c(bookings[i].time), 'range': bookings[i].range, 'guest': bookings[i].guest, 'active': bookings[i].active }
        if (i == 0) {
          if (bookings[i].time == starttime) {
            output.push(cp)
          }
          if (bookings[i].time > starttime) {
            output.push({ 'time': d2c(starttime), 'range': bookings[i].time - starttime, 'guest': 'no', 'active': true })
            output.push(cp)
          }
        } else if (i <= bookings.length - 1) {
          if (bookings[i].time - bookings[i - 1].time - bookings[i - 1].range > 0) {
            output.push({ 'time': d2c(bookings[i - 1].time + bookings[i - 1].range), 'range': bookings[i].time - bookings[i - 1].time - bookings[i - 1].range, 'guest': 'no', 'active': true })
          }
          output.push(cp)
        }
        if (i == bookings.length - 1) {
          if (bookings[i].time + bookings[i].range < endtime) {
            output.push({ 'time': d2c(bookings[i].time + bookings[i].range), 'range': endtime - bookings[i].time, 'guest': 'no', 'active': true })
          }
        }
      }
    } else {
      output.push({ 'time': d2c(starttime), 'range': endtime - starttime, 'guest': 'no', 'active': true })
    }
    return output
  }).then(function (res) {
    that.setData({
      'bookingResoult': res
    })
    //  console.log(res)
  }).catch(function (err) {
    console.error("failed", err)
  })
}

function promisefn(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}

function inArray(item, array) {
  var length = array.length;
  while (length--) {
    if (array[length] == item) {
      return true;
    }
  }
  return false;
}

function getb(t, i) {
  var test = []
  wx.request({
    url: 'https://uncleek.shoppingzone.com.cn/getBookings',
    data: {
      token: t,
      roomId: i
    },
    success: function (res) {
      console.log(res.data)
      test = res.data
    }
  })
  return test
}

module.exports = {
  formatTime: formatTime,
  c2d: c2d,
  d2c: d2c,
  bookingResoult: bookingResoult,
  inArray: inArray,
  bookingtime: bookingtime
}
