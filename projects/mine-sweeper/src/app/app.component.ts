import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MineGameService, IMineBlock } from './mine-game.service';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    isDebugMode = false;

    colorMap: { [key in number]: string } = { 
        [0x00]: 'mine-block-is-unknown', 
        [0x01]: 'mine-block-is-found', 
        [0x03]: 'mine-block-is-mine' 
    };

    destroy$ = new Subject<boolean>();


    get blocks$() { return this.gameService.mineBlocks$; }


    constructor(private gameService: MineGameService) {
    }

    ngOnInit() {
        this.gameService.isWon$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            if (value) {
                alert('You win');
            }
        });

        this.gameService.isLost$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            if (this.gameService.isLost) {
                alert('Game Over, please restart.');
            }
        });
    }

    mineClicked(index: number) {
        if (!this.gameService.canDoNext(index)) {
            if (this.gameService.isLost) {
                alert('Game Over, please restart.');
            }
            if (this.gameService.isWon) {
                alert('You win');
            }
        }
    }

    resetClicked() {
        this.gameService.start();
    }


    getMineBlockCssClass(block: IMineBlock) {
        // 0001
        const isFoundTag = block.isFound ? 1 : 0;
        // 0010
        const isMineTag = block.isMine ? 2 : 0;
        return this.colorMap[isFoundTag | isMineTag];
    }
}


