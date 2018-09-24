var socketopen = false

function sendmess(tag, data) {
  var output = {
    'tag': tag,
    'data': data
  }
  output = JSON.stringify(output)
  console.log(output)
  wx.sendSocketMessage({
    data: output
  })
  return true
}

function connSocket() {
  wx.connectSocket({
    url: 'wss://wx.shoppingzone.com.cn',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      var socketopen = true
    //  sendmess('setConn',setConn)
    },
    fail: function (res) { },
    complete: function (res) {
      console.log("wss conn complete")
    },
  })
  wx.onSocketMessage(function (res) {
    console.log(res.data)
  })
}

module.exports = {
  sendmess: sendmess,
  connSocket: connSocket
}