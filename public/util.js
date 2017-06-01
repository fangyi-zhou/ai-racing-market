// Prepare map format for drawing
function flatten_map(map) {
    let flattened_map = []
    for (let i = 0; i < map.length; i++) {
        flattened_map.push(map[i][0]);
        flattened_map.push(map[i][1]);
    }
    return flattened_map;
}
