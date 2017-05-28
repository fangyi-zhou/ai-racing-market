/**
 * Created by ruiaohu on 27/05/2017.
 */
var socket = io();
serverCallBack();

function serverCallBack(){
    socket.on('updateClient', function(info){
        updateAllGraphics(info);
    });

    socket.on('carNumber', function (info) {
        initCars(info);
    });
};

// Key controls
var keys = {
    '37': 0, // left
    '39': 0, // right
    '38': 0, // up
    '40': 0 // down
};

document.addEventListener('keydown', onKeyPress);
function onKeyPress(evt){
    keys[evt.keyCode] = 1;
    syncServerWithMovement();
}
document.addEventListener('keydown', onKeyRelease);
function onKeyRelease(evt){
    keys[evt.keyCode] = 0;
    syncServerWithMovement();
}

function syncServerWithMovement(){
    if(socket != null){
        socket.emit('movement', {
            '37':keys[37],
            '38':keys[38],
            '39':keys[39],
            '40':keys[40]
        })
    }
}
