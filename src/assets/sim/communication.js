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
        });
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
    });
    socket.on('raceFinish', function (info) {
        my.namespace.publicFunc();
    });
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
      cars = {};
  }

  function zoomIn(){
      if (zoom != undefined){
          zoom = zoom+5 > 0 ? zoom+5:0;
          container.scale.x = zoom;
          container.scale.y = -zoom;
      }
  }

  function zoomOut(){
      if (zoom != undefined){
          zoom = zoom-5>0 ? zoom-5:1;
          container.scale.x = zoom;
          container.scale.y = -zoom;
      }
  }

  function train(scriptId) {
      socket.emit('train', {
          id:1337,
          scriptId : scriptId
      })
  }

  function switchCar(){
      //TODO switch car views
      carIDs = getCars();
      if (carIDs.length === 0) {
          return;
      }
      carViewCount = (carViewCount + 1) % carIDs.length;
      viewingCarID = carIDs[carViewCount];
  }

  var communication = {
      'initGraphics':initGraphics,
      'init':init,
      'syncServerWithMovement':syncServerWithMovement,
      'disconnectOnSwap':disconnectOnSwap,
      'zoomIn':zoomIn,
      'zoomOut':zoomOut,
      'switchCar':switchCar,
      'train':train
  };

  root.communication = communication;

}(this));

