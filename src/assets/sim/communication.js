/**
 * Created by ruiaohu on 27/05/2017.
 */

;(function(root) {

    var socket;

  function init() {
    socket = io();
    initDraw();
    // socket.on('connected', function () {
    //   serverCallBack();
    // })
    serverCallBack();
  };

  function serverCallBack() {
    socket.on('updateClient', function (info) {
      updateAllGraphics(info);
    });

    socket.on('init', function (info) {
      initWorld(info);
    });

    socket.on('dc', function (info) {
      console.log(`dc ${info.id}`);
      removeUser(info.id);
    });
    socket.on('newMap', function (info) {
      updateMap(info);
    })
  };

// Key controls
  var keys = {
    '37': 0, // left
    '39': 0, // right
    '38': 0, // up
    '40': 0 // down
  };

  function syncServerWithMovement() {
    if (socket != null) {
      socket.emit('movement', {
        '37': keys[37],
        '38': keys[38],
        '39': keys[39],
        '40': keys[40]
      })
    }
  }

  var communication = {
      'init':init,
      'syncServerWithMovement':syncServerWithMovement
  }

  root.communication = communication;

}(this));

