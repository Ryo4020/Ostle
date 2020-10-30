export function judgeDestination(id, target, destination, last, key) {
    const edge = [
        id < 6,
        id % 5 === 0,
        id > 20,
        id % 5 === 1
    ];
    let lastdirection = null;
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

    if (edge[key]) {
        return false;
    } else if (destination === "hole") {
        return false;
    } else if (target === "hole" && destination !== "") {
        return false;
    } else if (id === last.square && key === lastdirection) {
        return false;
    } else {
        return true;
    }
}