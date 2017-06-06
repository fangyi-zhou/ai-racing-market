/**
 * Created by Robert on 06/06/2017.
 */
function arrayCopy(array) {
    return JSON.parse(JSON.stringify(array));
}

module.exports.arrayCopy = arrayCopy;
