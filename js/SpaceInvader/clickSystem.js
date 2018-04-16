class clickSystem {
    constructor (game, interval = 0) {
        this.game = game;
        this.interval = interval;
        this.lastRun = 0;
    }

    canRun (autoReset = true) {
        if (this.game.clicks - this.lastRun >= this.interval) {
            if (autoReset)
                this.reset();
            return true;
        }

        return false;
    }

    reset () {
        this.lastRun = this.game.clicks;
    }

    setInterval(interval) {
        this.interval = interval;
    }
}
