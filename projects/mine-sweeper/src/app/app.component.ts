import { Component, OnInit, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { MineSweeperService } from './mine-sweeper.service';
import { GameState, IMineBlock } from './model';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    isDebugMode = true;

    readonly blockClassMap: { readonly [key in number]: string } = {
        [0x00]: 'mine-block-is-unknown',
        [0x01]: 'mine-block-is-found',
        [0x03]: 'mine-block-is-mine'
    };

    readonly destroy$ = new Subject<boolean>();

    readonly containerStyle = {
        'grid-template-columns': '',
        'grid-template-rows': ''
    };

    get state$() { return this.gameService.state$; }

    get blocks$() { return this.gameService.mineBlocks$; }

    get side() { return this.gameService.side; }

    set side(value: number) { this.gameService.side = value; }

    constructor(private gameService: MineSweeperService) {
    }

    ngOnInit() {

        this.gameService.state$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            if (value === GameState.LOST) {
                alert('Game Over, please restart.');
            } else if (value === GameState.WIN) {
                alert('You win');
            }
        });

        this.gameService.side$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            this.containerStyle['grid-template-columns'] = `repeat(${value}, 60px)`;
            this.containerStyle['grid-template-rows'] = `repeat(${value}, 60px)`;
        });

        this.gameService.start();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    mineClicked(index: number) {
        this.gameService.doNext(index);
    }

    resetClicked() {
        this.gameService.start();
    }


    getMineBlockCssClass(block: IMineBlock) {
        // 0001
        const isFoundTag = block.isFound ? 1 : 0;
        // 0010
        const isMineTag = block.isMine ? 2 : 0;
        return this.blockClassMap[isFoundTag | isMineTag];
    }
}
