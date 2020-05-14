export enum GameState {
    BEGINING = 0x00,
    PLAYING = 0x01,
    WIN = 0x02,
    LOST = 0x03,
}

export interface IMineBlock {
    readonly isMine: boolean;
    readonly nearestMinesCount: number;
    readonly isFound: boolean;
}