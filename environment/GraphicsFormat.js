/**
 * Created by ruiaohu on 27/05/2017.
 */

// Abstract information required for car drawing
class RaceCarGraphic {
    constructor(position, angle, width, height, colour) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.colour = colour;
    }
}
module.exports.RaceCarGraphic = RaceCarGraphic;
