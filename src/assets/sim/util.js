// Prepare segment format for drawing
function flatten_map(map) {
    let flattened_map = []
    for (let i = 0; i < map.length; i++) {
        flattened_map.push(map[i][0]);
        flattened_map.push(map[i][1]);
    }
    return flattened_map;
}

// Draw a grid on the container
function drawGrid(container, w, h, cell_size, lineColour) {
    for (let x = -w; x < w; x += cell_size) {
        let line = new PIXI.Graphics();
        line.lineStyle(0.01, lineColour, 1);
        line.moveTo(x, -h);
        line.lineTo(x, h);
        container.addChild(line);
    }

    for (let y = -h; y < h; y += cell_size) {
        let line = new PIXI.Graphics();
        line.lineStyle(0.01, lineColour, 1);
        line.moveTo(-w, y);
        line.lineTo(w, y);
        container.addChild(line);
    }
}

// Updates end point of PIXI line
function setStartLine(line, point) {
    line.currentPath.shape.points[0] = point[0];
    line.currentPath.shape.points[1] = point[1];
}

function setEndLine(line, point) {
    line.currentPath.shape.points[2] = point[0];
    line.currentPath.shape.points[3] = point[1];
}

// Vector operations
function vectorfy(vec) {
    return [vec.x, vec.y];
}

function add(vec1, vec2) {
    return [vec1[0] + vec2[0], vec1[1] + vec2[1]]
}

function mul(vec, m) {
    return [vec[0] * m, vec[1] * m];
}
