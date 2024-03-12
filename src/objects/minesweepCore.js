export class GameDifficulty {
    constructor(width, height, mineCount) {
        this.width = width;
        this.height = height;
        this.mineCount = mineCount;
    }
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static get inf() {
        return new Point(2147383647, 2147383647);
    }

    add(delta) {
        return new Point(this.x + delta[0], this.y + delta[1]);
    }

    copyTo(dst) {
        dst.x = this.x;
        dst.y = this.y;
    }

    equals(p) {
        return this.x === p.x && this.y === p.y;
    }

    print() {
        console.log(`(${this.x}, ${this.y})`);
    }
}

class UserCommand {
    constructor(command, point) {
        this.command = command;
        this.point = point;
    }
}

export class FieldBlock {
    constructor() {
        this.countNearby = 0;
        this.opened = false;
        this.flagged = false;
    }

    isMine() {
        return this.countNearby === -1;
    }

    setMine() {
        this.countNearby = -1;
    }

    reset() {
        this.countNearby = 0;
        this.opened = false;
        this.flagged = false;
    }
}

class BlockOpenQueue {
    constructor() {
        this.queue = new Array(480);
        this.reset();
    }

    reset() {
        this.head = 0;
        this.tail = 0;
    }

    empty() {
        return this.head === this.tail;
    }

    enqueue(p) {
        if (this.tail >= 480) {
            console.log("Queue overflow.");
            return;
        }
        this.queue[this.tail++] = p;
    }

    dequeue() {
        return this.queue[this.head++];
    }
}

export class MineField {
    constructor(difficulty) {
        this.height = difficulty.height;
        this.width = difficulty.width;
        this.mineCount = difficulty.mineCount;
        this.openedBlockCount = 0;
        this.statusCode = 0; // Not deployed
        this.flaggedCount = 0;
        this.startTime = performance.now();

        this.field = new Array(16).fill(null).map(() => new Array(30).fill(null).map(() => new FieldBlock()));
        this.queue = new BlockOpenQueue();



        // Deploy mines
        // this.deployMine();
    }

    isOut(p) {
        return p.x < 0 || p.y < 0 || p.x >= this.width || p.y >= this.height;
    }

    getBlock(p) {
        return this.field[p.y][p.x];
    }

    deployMine(initPoint = Point.inf) {
        if (this.statusCode !== 0) return;
        this.statusCode = 1; // Playing

        const maxIndex = this.height * this.width;
        const shieldedBlocks = [];
        if (!initPoint.equals(Point.inf)) {
            for (let i = 0; i < 8; i++) {
                shieldedBlocks.push(initPoint.add(directions[i]));
            }
            shieldedBlocks.push(new Point(initPoint.x, initPoint.y));
        }

        let initedMines = 0;
        while (initedMines < this.mineCount) {
            const ind = Math.floor(Math.random() * maxIndex);
            const x = ind % this.width;
            const y = Math.floor(ind / this.width);
            const nowp = new Point(x, y);
            if (this.getBlock(nowp).isMine()) continue;
            let found = false;

            if (!initPoint.equals(Point.inf)) {
                for (let i = 0; i < 9; i++) {
                    if (shieldedBlocks[i].equals(nowp)) {
                        found = true;
                        break;
                    }
                }
                if (found) continue;
            }

            this.getBlock(nowp).setMine();
            for (let i = 0; i < 8; i++) {
                const p = nowp.add(directions[i]);
                if (this.isOut(p) || this.getBlock(p).isMine()) continue;
                this.getBlock(p).countNearby++;
            }
            initedMines++;
        }
    }

    openBlock(p) {
        if (this.statusCode !== 1) return null;

        const openingBlock = this.getBlock(p);
        if (openingBlock.isMine()) {
            this.statusCode = 2; // Lose
            openingBlock.opened = true;
            return [p];
        }
        if (openingBlock.opened || openingBlock.flagged) return null;

        let ans = this.bfsOpen(p);
        if (this.openedBlockCount === this.height * this.width - this.mineCount) {
            this.statusCode = 3; // Win
            return ans;
        }
        return ans;
    }

    bfsOpen(initPoint) {
        let openQueue = []

        this.queue.reset();
        this.queue.enqueue(initPoint);
        this.getBlock(initPoint).opened = true;
        this.openedBlockCount++;

        while (!this.queue.empty()) {
            const nowp = this.queue.dequeue();
            if (this.getBlock(nowp).countNearby > 0) continue;
            for (let i = 0; i < 8; i++) {
                const p = nowp.add(directions[i]);
                if (this.isOut(p)) continue;
                const nowBlock = this.getBlock(p);
                if (nowBlock.isMine() || nowBlock.opened || nowBlock.flagged) continue;
                nowBlock.opened = true;
                this.openedBlockCount++;
                this.queue.enqueue(p);
                openQueue.push(p)
            }
        }
        return openQueue
    }

    flagBlock(point, flaggedStatus) {
        if(this.getBlock(point).flagged === flaggedStatus)
            return

        if (flaggedStatus) { // Flag
            this.getBlock(point).flagged = true;
            this.flaggedCount++;
        } else { // Unflag
            this.getBlock(point).flagged = false;
            this.flaggedCount--;
        }
    }

    getGameTime() {
        return (performance.now() - this.startTime) / 1000;
    }

    getMineCountLeft() {
        const ans = this.mineCount - this.flaggedCount;
        return ans >= 0 ? ans : 0;
    }

    print(cheat) {
        let str = ''
        for(let i = 0; i < this.height; ++i){

            for(let j = 0; j < this.width; ++j){
                let field = this.field[i][j]
                if(!field.opened && !cheat){
                    str += " #"
                }else{
                    if(field.isMine()){
                        str += " W"
                    }else{
                        str += " " + field.countNearby
                    }
                }
            }
            str += '\n'
        }
        console.log(str)
    }
}

const directions = [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
