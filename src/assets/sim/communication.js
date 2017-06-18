/**
 * Created by ruiaohu on 27/05/2017.
 */

;(function(root) {

    var socket = undefined;

    function initGraphics(canvasID){
        initDraw(canvasID);
    }

  function init(id) {
    socket = io({ forceNew: true });
    socket.on('connected', function () {
        console.log(`join ${id}`);
        socket.emit('join', {
            simId : id
        });
        serverCallBack();
    });
  };

    function initChallenge(userLevel) {
        initChallenge2(userLevel);
    }

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
        my.namespace.updateMsg(info.winner);
    });
    socket.on('updateGraph', function(info){
        my.namespace.updateStats(info.point);
    })
  }



  function syncServerWithMovement() {
    if (socket != null) {
      socket.emit('movement', {
        '37': keys[68],
        '38': keys[87],
        '39': keys[65],
        '40': keys[83]
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

    function playAgainstAI(scriptId) {
        socket.emit('clientPlayAI', {
            id:180,
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

    function attemptChallenge(scriptId, level) {
        socket.emit('challenge', {
            id:1338,
            level: level,
            scriptId : scriptId
        });
    }

    function runTutorial(code, tutorialNumber) {
        socket.emit('tutorial', {
            code: code,
            tutorialNumber: tutorialNumber
        });
    }

  var communication = {
      'initGraphics':initGraphics,
      'init':init,
      'syncServerWithMovement':syncServerWithMovement,
      'disconnectOnSwap':disconnectOnSwap,
      'zoomIn':zoomIn,
      'zoomOut':zoomOut,
      'switchCar':switchCar,
      'train':train,
      'initChallenge':initChallenge,
      'attemptChallenge': attemptChallenge,
      'runTutorial': runTutorial,
      'playAgainstAI': playAgainstAI
  };

  root.communication = communication;

}(this));

