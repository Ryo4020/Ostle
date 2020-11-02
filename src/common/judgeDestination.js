export function judgeDestination(id, target, destination, last, key) {
    const edge = [ //端かどうかの条件式
        id < 6,
        id % 5 === 0,
        id > 20,
        id % 5 === 1
    ];
    let lastdirection = null; //前回の方向の真逆の向き
    switch (last.direction) {
        case 0:
            lastdirection = 2;
            break;
        case 1:
            lastdirection = 3;
            break;
        case 2:
            lastdirection = 0;
            break;
        case 3:
            lastdirection = 1;
            break;
    }

    if (edge[key]) { //行き先が盤外かどうか
        return false;
    } else if (destination === "hole") { //行き先が穴かどうか
        return false;
    } else if (target === "hole" && destination !== "") { //穴の行き先にコマがあるかどうか
        return false;
    } else if (id === last.square && key === lastdirection) { //前回と同じ盤面になるかどうか
        return false;
    } else {
        return true;
    }
}