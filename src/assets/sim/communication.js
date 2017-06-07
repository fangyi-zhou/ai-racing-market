/**
 * Created by ruiaohu on 27/05/2017.
 */

;(function(root) {

    var socket = undefined;

    function initGraphics(){
        initDraw();
    }

  function init(id) {
    socket = io({ forceNew: true });
    socket.on('connected', function () {
        console.log(`join ${id}`);
        socket.emit('join', {
            simId : id
        })
        serverCallBack();
    })
      renderer.view.focus();
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
  }

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

  function disconnectOnSwap(){
      if (socket != undefined){
          socket.disconnect();
      }
      while(container.children[0]){
          container.removeChild(container.children[0]);
      }
  }

  var communication = {
      'initGraphics':initGraphics,
      'init':init,
      'syncServerWithMovement':syncServerWithMovement,
      'disconnectOnSwap':disconnectOnSwap
  }

  root.communication = communication;

}(this));

