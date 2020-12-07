
export class Timer {
    private static readonly NOT_STARTED = -1;
    
    private _startTime: number;
    private _accumulatedTime: number;

    public constructor() {
        this._startTime = Timer.NOT_STARTED;
        this._accumulatedTime = 0;
    }

    private static _getNow(): number {
        return new Date().getTime();
    }

    public start(): void {
        this._startTime = Timer._getNow();
    }

    public stop(): void {
        const elapsed = Timer._getNow() - this._startTime;
        this._accumulatedTime += elapsed;
        this._startTime = Timer.NOT_STARTED;
    }

    public reset(): void {
        this._startTime = Timer.NOT_STARTED;
        this._accumulatedTime = 0;
    }

    public getTimeElapsed(): number {
        if (this._startTime === Timer.NOT_STARTED) {
            return this._accumulatedTime;
        } else {
            const now = Timer._getNow();
            const elapsed = now - this._startTime;
            return elapsed + this._accumulatedTime;
        }
    }
}