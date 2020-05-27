import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { IMineBlock, GameState } from './model';


class MineSweeperState {

    mineBlocks: IMineBlock[] = [];

    side: number = 10;

    state: GameState = GameState.PLAYING;

    mineCount = 0;
}

@Injectable({
    providedIn: 'root'
})
export class MineSweeperService {

    private readonly _mineBlocks = new BehaviorSubject<IMineBlock[]>([]);

    private readonly _side = new BehaviorSubject(10);

    private readonly _state = new BehaviorSubject<GameState>(GameState.PLAYING);

    private readonly _mineCount = new BehaviorSubject<number>(10);

    readonly side$ = this._side.asObservable();

    readonly mineBlocks$ = this._mineBlocks.asObservable();

    readonly state$ = this._state.asObservable();

    readonly mineCount$ = this._mineCount.asObservable();

    get side() { return this._side.value; }

    set side(value: number) { this._side.next(value); }

    get mineBlocks() { return this._mineBlocks.value; }

    get state() { return this._state.value; }

    get mineCount() { return this._mineCount.value; }

    constructor() {
        this._side.subscribe((value) => {
            this._mineBlocks.next(this.createMineBlocks(value));
        });
    }

    start() {
        this._mineBlocks.next(this.createMineBlocks(this.side));
        this._state.next(GameState.BEGINING);
    }

    doNext(index: number) {
        switch (this.state) {
            case GameState.BEGINING:
                this.prepare(index);
                this._state.next(GameState.PLAYING);
                break;

            case GameState.PLAYING:
                if (this.testIsMine(index)) {
                    this._state.next(GameState.LOST);
                }
                break;

            case GameState.LOST:
            case GameState.WIN:
            default:
                this._state.next(this.state);
                break;
        }
        if (this.vitoryVerify()) {
            this._state.next(GameState.WIN);
        }
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

        for (let i = 0; i < side; i++) {
            for (let j = 0; j < side; j++) {
                const innerIndex = this.transformToIndex(i, j);
                const block = blocks[innerIndex];
                if (block.isMine) {
                    continue;
                }

                let nearestMinesCount = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        nearestMinesCount += this.getMineCount(blocks[this.transformToIndex(i + x, j + y)]);
                    }
                }
                blocks[innerIndex] = { ...block, nearestMinesCount };
            }
        }
        if (blocks[index].nearestMinesCount === 0) {
            this.cleanZeroCountBlock(blocks, index);
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
            this.cleanZeroCountBlock(blocks, index);
        }

        this._mineBlocks.next(blocks);

        return theBlock.isMine;
    }

    // clean all block which 'nearestMinesCount' is zero
    private cleanZeroCountBlock(blocks: IMineBlock[], index: number) {
        const i = index % this.side;
        const j = Math.floor(index / this.side);
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const currentIndex = this.transformToIndex(i + x, j + y);
                const block = blocks[currentIndex];
                if (currentIndex === index || !block || block.isFound || block.isMine) {
                    continue;
                }
                blocks[currentIndex] = { ...block, isFound: true };
                if (blocks[currentIndex].nearestMinesCount === 0) {
                    this.cleanZeroCountBlock(blocks, currentIndex);
                }
            }
        }
    }


    // verify if the player is vitory by caculating if count of remaining mine blocks is equal to the mines count.
    private vitoryVerify() {
        return this.mineBlocks.reduce((prev, current) => {
            return !current.isMine && current.isFound ? prev + 1 : prev;
        }, 0) === this.mineBlocks.length - this.mineCount;

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

    private transformToIndex(x: number, y: number) {
        const count = this.side;
        if (x < 0 || x >= count || y < 0 || y >= count) {
            return -1;
        }
        return y * count + x;
    }

    private getMineCount(block: IMineBlock | undefined) {
        return block?.isMine ? 1 : 0;
    }
}


