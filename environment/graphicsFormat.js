/**
 * Created by ruiaohu on 27/05/2017.
 */

// Abstract information required for car drawing
function RaceCarGraphic (position, angle, width, height) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.angle = angle;
}
module.exports.RaceCarGraphic = RaceCarGraphic;
