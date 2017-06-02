/**
 * Created by ruiaohu on 27/05/2017.
 */
var socket = io();

// ************** TODO: Change this to POST ************* //
function saveMap(map) {
  if(socket != null){
      socket.emit('saveMap', {
          'map': map
      })
  }
}
