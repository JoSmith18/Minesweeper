const $ = require('jquery');
const other = require('../../lib/other');
const R = require('ramda');
const WIDTH = 10;
const HEIGHT = 10;
const BOMBS = 20;
const MINEFIELD = { grid: makeMineField(), moves: 0, flags: BOMBS };

function makeMineField() {
    var data = [];
    for (var i = 0; i < HEIGHT; i++) {
        data.push([]);
        for (var j = 0; j < WIDTH; j++) {
            data[i][j] = {
                bomb: false,
                clicked: false,
                touch: 0,
                flagged: false
            };
        }
    }
    var locations = [];
    while (locations.length < BOMBS) {
        var c = Math.floor(Math.random() * WIDTH);
        var r = Math.floor(Math.random() * HEIGHT);
        if (!R.contains([r, c], locations)) {
            locations.push([r, c]);
            data[r][c].bomb = true;
            for (
                var i = Math.max(0, r - 1);
                i <= Math.min(r + 1, HEIGHT - 1);
                i++
            ) {
                for (
                    var j = Math.max(0, c - 1);
                    j <= Math.min(c + 1, WIDTH - 1);
                    j++
                ) {
                    data[i][j].touch += 1;
                }
            }
        }
    }

    return data.slice();
}

function randint(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo));
}

function randBlock() {
    return { BlockType: randint(0, 7), touched: false };
}

function randGrid() {
    grid = [];
    for (var c = 0; c < HEIGHT; c++) {
        grid.push([]);
        for (var i = 0; i < WIDTH; i++) {
            grid[grid.length - 1].push(randBlock());
        }
    }
    return grid;
}

function clump_from(x, y) {
    var history = [];
    var clumps = [];
    var to_check = [[x, y]];
    while (to_check.length > 0) {
        var pos = to_check.pop();
        var i = Math.max(0, Math.min(pos[0], HEIGHT - 1));
        var j = Math.max(0, Math.min(pos[1], WIDTH - 1));
        if (R.contains([i, j], history)) {
        } else {
            history.push([i, j]);
            clumps.push([i, j]);
            if (MINEFIELD.grid[i][j].touch == 0) {
                for (var n = -1; n <= 1; n++) {
                    for (var m = -1; m <= 1; m++) {
                        var a = Math.max(0, Math.min(i + n, HEIGHT - 1));
                        var b = Math.max(0, Math.min(j + m, WIDTH - 1));
                        console.log(a + '' + b);
                        MINEFIELD.grid[a][b];
                        if (
                            !R.contains([a, b], history) &&
                            MINEFIELD.grid[a][b].touch == 0
                        ) {
                            to_check.push([a, b]);
                        }
                        if (!R.contains([a, b], clumps)) {
                            clumps.push([a, b]);
                        }
                    }
                }
            }
        }
    }
    return clumps;
}
function setClick(x, y) {
    var clump = clump_from(x, y);
    console.log(clump);
    clump.forEach(pair => (MINEFIELD.grid[pair[0]][pair[1]].clicked = true));

    draw();
    if (!isBomb(x, y)) {
        winner();
    }
}

function attachHandlers() {
    for (var x = 0; x < HEIGHT; x++) {
        for (var y = 0; y < WIDTH; y++) {
            $('#' + x + '-' + y).on(
                'click',
                (function(x, y) {
                    return function() {
                        MINEFIELD.moves += 1;
                        setClick(x, y);
                    };
                })(x, y)
            );
            $('#' + x + '-' + y).on(
                'contextmenu',
                (function(x, y) {
                    return function(event) {
                        event.preventDefault();

                        if (MINEFIELD.grid[x][y].flagged === true) {
                            MINEFIELD.moves += 1;
                            MINEFIELD.grid[x][y].flagged = false;
                            MINEFIELD.flags++;
                        } else {
                            MINEFIELD.moves += 1;
                            MINEFIELD.grid[x][y].flagged = true;
                            MINEFIELD.flags--;
                        }
                        draw();
                    };
                })(x, y)
            );
        }
    }
}

function showGrid(grid) {
    return (
        '<center><button class="btn-md btn-info">' +
        'Moves:' +
        MINEFIELD.moves +
        '</button><button class="btn-md btn-success">' +
        MINEFIELD.flags +
        '</button><table>' +
        grid.map((r, ri) => showRow(r, ri)).join('\n') +
        '</table><div class="well well-sm">' +
        '</div></center>'
    );
}

function showRow(r, ri) {
    return '<tr>' + r.map((c, ci) => showBlock(c, ri, ci)).join('\n') + '</tr>';
}

function showBlock(c, ri, ci) {
    if (c.clicked && c.bomb) {
        return (
            '<td class="square"><button id="' +
            ri +
            '-' +
            ci +
            '" class="' +
            '" style="color:red" disabled>' +
            '<i class="fa fa-bomb defaultBox" aria-hidden="true"></i>' +
            '</button> </td>'
        );
    } else if (c.clicked) {
        return (
            '<td class="square"><button id="' +
            ri +
            '-' +
            ci +
            '" class="' +
            '" disabled>' +
            c.touch +
            '</button> </td>'
        );
    } else if (c.flagged) {
        return (
            '<td class="square"><button id="' +
            ri +
            '-' +
            ci +
            '" class="' +
            '">' +
            '<i class="fa fa-flag-checkered defaultBox" aria-hidden="true"></i>' +
            '</button> </td>'
        );
    } else {
        return (
            '<td class="square"><button id="' +
            ri +
            '-' +
            ci +
            '" class="' +
            '">' +
            '<i class="fa fa-plus-square defaultBox" aria-hidden="true"></i>' +
            '</button> </td>'
        );
    }
}

function congrats() {
    $('#postgame')
        .hide()
        .html('<div class="jumbotron"><h1>Good-Job</h1></div>')
        .show(500);
    $('#board').hide(2000);
}
function winner() {
    for (var i = 0; i < HEIGHT; i++) {
        for (var j = 0; j < WIDTH; j++) {
            if (!(MINEFIELD.grid[i][j].bomb || MINEFIELD.grid[i][j].clicked)) {
                return false;
            }
        }
    }
    congrats();
}
function isBomb(x, y) {
    if (MINEFIELD.grid[x][y].bomb && MINEFIELD.grid[x][y].clicked) {
        for (var i = 0; i < HEIGHT; i++) {
            for (var j = 0; j < WIDTH; j++) {
                MINEFIELD.grid[i][j].clicked = true;

                draw();
            }
        }
        $('#postgame')
            .hide()
            .html('<div class="jumbotron"><h1>u ded boom</h1></div>')
            .show(500);
        $('#board').hide(2000);
        return true;
    }
    return false;
}
function draw() {
    $('#board').html(showGrid(MINEFIELD.grid));
    attachHandlers();
}

function main() {
    draw();
}

$(main);
