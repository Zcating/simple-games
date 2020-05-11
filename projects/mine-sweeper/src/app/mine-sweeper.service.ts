import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

export interface IMineBlock {
    readonly isMine: boolean;
    readonly nearestMinesCount: number;
    readonly isFound: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MineSweeperService {

    private _isStarted = new BehaviorSubject<boolean>(false);

    private _isLost = new BehaviorSubject<boolean>(false);

    private _isWon = new BehaviorSubject<boolean>(false);

    private _mineBlocks = new BehaviorSubject<IMineBlock[]>([]);

    private _side = new BehaviorSubject(10);

    mineCount = 20;



    get side() { return this._side.value; }

    set side(value: number) { this._side.next(value); }

    get side$() { return this._side.asObservable(); }

    get mineBlocks() { return this._mineBlocks.value; }

    get mineBlocks$() { return this._mineBlocks.asObservable(); }

    get isLost() { return this._isLost.value; }

    get isLost$() { return this._isLost.asObservable(); }

    get isWon() { return this._isWon.value; }

    get isWon$() { return this._isWon.asObservable(); }

    get isStarted() { return this._isStarted.value; }

    get isStarted$() { return this._isStarted.asObservable() }

    constructor() {
        this._side.subscribe((value) => {
            this._mineBlocks.next(this.createMineBlocks(value));
        });
    }

    start() {
        this._mineBlocks.next(this.createMineBlocks(this.side));
        this._isLost.next(false);
        this._isStarted.next(false);
        this._isWon.next(false);
    }

    canDoNext(index: number): boolean {
        if (this.isLost || this.isWon) {
            return false;
        }

        if (this.isStarted) {
            this._isLost.next(this.testIsMine(index))
        } else {
            this._isStarted.next(true);
            this.prepare(index);
        }

        this._isWon.next(this.vitoryVerify(this.mineBlocks, this.mineCount));

        return true;
    }

    private prepare(index: number) {
        const blocks = [...this._mineBlocks.value];
        if (!blocks[index]) {
            throw Error('Out of index.');
        }
        blocks[index] = { isMine: false, isFound: true, nearestMinesCount: 0 };

        const numbers = this.generateRandomNumbers(this.mineCount, this.mineBlocks.length, index);
        for (const num of numbers) {
            blocks[num] = { isMine: true, isFound: false, nearestMinesCount: 0 };
        }

        const side = this.side;
        const transform = this.transformToIndex(side);

        for (let i = 0; i < side; i++) {
            for (let j = 0; j < side; j++) {
                const index = transform(i, j);
                const block = blocks[index];
                if (block.isMine) {
                    continue;
                }

                let nearestMinesCount = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        nearestMinesCount += this.getMineCount(blocks[transform(i + x, j + y)]);
                    }
                }
                blocks[index] = { ...block, nearestMinesCount };
            }
        }
        if (blocks[index].nearestMinesCount === 0) {
            this.cleanZeroCountBlock(blocks, index, this.transformToIndex(this.side));
        }

        this._mineBlocks.next(blocks);
    }

    private testIsMine(index: number): boolean {
        const blocks = [...this._mineBlocks.value];
        if (!blocks[index]) {
            throw Error('Out of index.');
        }
        const theBlock = { ...blocks[index], isFound: true };
        blocks[index] = theBlock;
        if (theBlock.isMine) {
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].isMine) {
                    blocks[i] = { ...blocks[i], isFound: true };
                }
            }
        } else if (!theBlock.nearestMinesCount) {
            this.cleanZeroCountBlock(blocks, index, this.transformToIndex(this.side));
        }

        this._mineBlocks.next(blocks);

        return theBlock.isMine;
    }

    // clean all block which 'nearestMinesCount' is zero
    private cleanZeroCountBlock(blocks: IMineBlock[], index: number, transform: (x: number, y: number) => number) {
        const i = index % this.side;
        const j = Math.floor(index / this.side);
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const currentIndex = transform(i + x, j + y);
                const block = blocks[currentIndex];
                if (currentIndex === index || !block || block.isFound || block.isMine) {
                    continue;
                }
                blocks[currentIndex] = { ...block, isFound: true };
                if (block.nearestMinesCount === 0) {
                    this.cleanZeroCountBlock(blocks, currentIndex, transform);
                }
            }
        }
    }


    // verify if the player is vitory by caculating if count of remaining mine blocks is equal to the mines count.
    private vitoryVerify(blocks: IMineBlock[], mineCount: number) {
        return blocks.reduce((prev, current) => {
            return !current.isMine && current.isFound ? prev + 1 : prev;
        }, 0) === blocks.length - mineCount;

    }

    // generate unique random numbers bewteen [0, section), while ignoring the 'targetNumber'
    private generateRandomNumbers(count: number, section: number, targetNumber: number) {
        const arr = [];
        while (arr.length < count) {
            const r = Math.floor(Math.random() * 100) % section;
            if (arr.indexOf(r) === -1 && r != targetNumber) {
                arr.push(r);
            }
        }
        return arr;
    }

    private createMineBlocks(count: number) {
        return (new Array(count * count)).fill({ isMine: false, nearestMinesCount: 0, isFound: false });
    }

    private transformToIndex(count: number) {
        return (x: number, y: number) => {
            if (x < 0 || x >= count || y < 0 || y >= count) {
                return -1;
            }
            return y * count + x;
        }
    }

    private getMineCount(block: IMineBlock | undefined) {
        return block?.isMine ? 1 : 0;
    }
}


