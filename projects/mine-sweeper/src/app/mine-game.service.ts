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
export class MineGameService {

    private _isStarted = false;

    private _isLost = new BehaviorSubject<boolean>(false);

    private _isWon = new BehaviorSubject<boolean>(false);

    private _mineBlocks = new BehaviorSubject<IMineBlock[]>([]);

    private _mineSqures = new BehaviorSubject(10);


    mineCount = 20;

    get mineSqures$() { return this._mineSqures.asObservable(); }

    get mineSqures() { return this._mineSqures.value; }

    set mineSqures(value: number) { this._mineSqures.next(value); }

    get mineBlocks() { return this._mineBlocks.value; }

    get mineBlocks$() { return this._mineBlocks.asObservable(); }

    get isLost() { return this._isLost.value; }

    get isLost$() { return this._isLost.asObservable(); }

    get isWon() { return this._isWon.value; }

    get isWon$() { return this._isWon.asObservable(); }


    get isStarted() { return this._isStarted; }

    constructor() {
        this._mineSqures.subscribe((value) => {
            this._mineBlocks.next(this.createMineBlocks(value));
        });
    }

    start() {
        this._mineBlocks.next(this.createMineBlocks(this.mineSqures));
        this._isLost.next(false);
        this._isStarted = false;
    }

    canDoNext(index: number): boolean {
        if (this.isLost || this.isWon) {
            return false;
        }

        if (this._isStarted) {
            this._isLost.next(this.testIsMine(index))
        } else {
            this._isStarted = true;
            this.prepare(index);
        }

        this._isWon.next(this.vitoryVerify(this.mineBlocks, this.mineCount));

        return true;
    }

    private prepare(index: number) {
        const blocks = [...this._mineBlocks.value];
        const targetBlock = blocks[index];
        if (!targetBlock) {
            throw Error('Out of index.');
        }
        blocks[index] = { isMine: false, isFound: true, nearestMinesCount: 0 };

        const numbers = this.generateRandomNumbers(this.mineCount, this.mineBlocks.length, index);
        for (const num of numbers) {
            blocks[num] = { isMine: true, isFound: false, nearestMinesCount: 0 };
        }

        const mineSqures = this.mineSqures;
        const transform = this.transformToIndex(mineSqures);

        for (let i = 0; i < mineSqures; i++) {
            for (let j = 0; j < mineSqures; j++) {
                const index = transform(i, j);

                if (blocks[index].isMine) {
                    continue;
                }

                let nearestMinesCount = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        nearestMinesCount += this.getMineCount(blocks[transform(i + x, j + y)]);
                    }
                }

                blocks[index] = { ...blocks[index], nearestMinesCount };
            }
        }
        if (blocks[index].nearestMinesCount === 0) {
            this.zeroCountsClean(blocks, index, this.transformToIndex(this.mineSqures));
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
            this.zeroCountsClean(blocks, index, this.transformToIndex(this.mineSqures));
        }

        this._mineBlocks.next(blocks);

        return theBlock.isMine;
    }

    private zeroCountsClean(blocks: IMineBlock[], index: number, transform: (x: number, y: number) => number) {
        const i = index % this.mineSqures;
        const j = Math.floor(index / this.mineSqures);
        console.log(i, j, index);
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const currentIndex = transform(i + x, j + y);
                const block = blocks[currentIndex];
                if (currentIndex === index || !block || block.isFound || block.isMine) {
                    continue;
                }
                blocks[currentIndex] = { ...block, isFound: true };
                if (block.nearestMinesCount === 0) {
                    this.zeroCountsClean(blocks, currentIndex, transform);
                }
            }
        }

    }


    private vitoryVerify(blocks: IMineBlock[], mineCount: number) {

        return blocks.reduce((prev, current, currentIndex) => {
            return !current.isMine && current.isFound ? prev + 1 : prev;
        }, 0) === blocks.length - mineCount;

    }

    private generateRandomNumbers(count: number, interval: number, ignoreNumber: number) {
        const arr = [];
        while (arr.length < count) {
            const r = Math.floor(Math.random() * 100) % interval;
            if (arr.indexOf(r) === -1 && r != ignoreNumber) {
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


