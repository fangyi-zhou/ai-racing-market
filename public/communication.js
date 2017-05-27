/**
 * Created by ruiaohu on 27/05/2017.
 */
var socket;
function serverCallBack(){
    socket.on('updateClient', function (info) {
        console.log(info);
    });
};