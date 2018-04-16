class stageSystem {
    constructor (gameSystem, lastStage) {
        this.game = gameSystem;
        this.lastStage = lastStage;

        if (this.lastStage == null)
            this.num = 1;
        else
            this.num = this.lastStage.num + 1;

        this.score = 0;

        this.data = null;
        this.winner = false;

        this.objects = [];
        this.particles = [];
        this.defenders = [];
        this.reverse = false;

        this.speed = 0;
        this.aggro = 0;
        this.rage = 0;

        this.ic = new clickSystem(gameSystem);
        this.startClicks = this.game.clicks;
    }

    load () {
        if (this.num > SPACE_INVADER_STAGES.length) {
            this.winner = true;
            return;
        }

        this.data = SPACE_INVADER_STAGES[this.num - 1];

        this.speed = this.data.speed;
        this.aggro = this.data.aggro;
        this.rage = 0.0;

        this.ic.setInterval(this.speed);

        let offset = (this.game.width() - (this.data.objects.aliens.w * this.data.objects.aliens.perRow)) / 2;
        for (let alienId in this.data.objects.aliens.types)
            if (this.data.objects.aliens.types[alienId] > 0) {
                let theAlien = new alienObject(this, this.data.objects.aliens.types[alienId], this.data.objects.aliens.w, this.data.objects.aliens.h);
                theAlien.move(offset +
                    (int(alienId % this.data.objects.aliens.perRow) * this.data.objects.aliens.w),
                    int(alienId / this.data.objects.aliens.perRow) * this.data.objects.aliens.h, true);

                this.objects.push(theAlien);
            }

        for (let i = 0; i < this.data.objects.defenders.count; i++) {
            let theDefender = new defenderObject(this, this.data.objects.defenders.lifes, this.data.objects.defenders.w, this.data.objects.defenders.h, this.data.objects.defenders.bulletMax);
            theDefender.move(this.game.width() / 2, this.game.height() - 20, true);
            this.defenders.push(theDefender);
        }
    }

    init () {
        this.ic.reset();
    }

    processKey (keyCode) {
        if (this.game.screenAt == SCREEN_STAGE)
            for(let defender of this.defenders)
                if (!defender.destroyed)
                    defender.processKey(keyCode);
    }

    process () {
        if (this.num > SPACE_INVADER_STAGES.length)
            return;

        for (let i = this.objects.length - 1; i >= 0; i--)
            if (this.objects[i].destroyed)
                this.objects.splice(i, 1);

        for (let i = this.particles.length - 1; i >= 0; i--)
            if (this.particles[i].destroyed)
                this.particles.splice(i, 1);

        if (this.ic.canRun()) {
            let reachEnd = false;
            for (let object of this.objects)
                if (object instanceof alienObject) {
                    if ((!this.reverse && (object.x + object.w + this.data.objects.aliens.step) >= this.game.width() - 1) ||
                        (this.reverse && (object.x - this.data.objects.aliens.step) <= 0))
                        reachEnd = true;
                }

            if (reachEnd) {
                let gameOver = false;
                for (let object of this.objects)
                    if (object instanceof alienObject) {
                        object.move(0, this.data.objects.aliens.h);
                        if ((object.y + object.h + this.data.objects.aliens.step) >= this.game.height())
                            gameOver = true;
                    }

                if (gameOver) {
                    this.game.gameOver();
                    return;
                }

                this.reverse = !this.reverse;
            } else {
                for (let object of this.objects)
                    if (object instanceof alienObject) {
                        if (this.reverse)
                            object.move(-this.data.objects.aliens.step, 0);
                        else
                            object.move(this.data.objects.aliens.step, 0);
                    }
            }

            this.speed -= this.aggro;
            this.rage += this.aggro;

            this.ic.setInterval(this.speed);
        }

        if (random(7) >= 7.0 - (0.001 + this.rage)) {
            let waitAlienShoot = true;
            while (waitAlienShoot && (this.objects.length > 0))
                for (let object of this.objects)
                    if (object instanceof alienObject)
                        if (int(random(1)) == 0) {
                            object.shoot();
                            waitAlienShoot = false;
                            break;
                        }
        }

        let hasAliens = false;
        for(let object of this.objects)
            if (object instanceof alienObject)
                if (!object.destroyed)
                    hasAliens = true;

        if (!hasAliens) {
            this.game.cleanedStage();
        } else {
            for(let defender of this.defenders)
                defender.process();

            for(let particle of this.particles) {
                particle.process();

                if (particle instanceof bulletObject) {
                    if (particle.owner instanceof defenderObject) {
                        for (let object of this.objects)
                            if (object instanceof alienObject)
                                if (object.isHit(particle))
                                    object.bulletHit(particle);
                    } else {
                        for(let defender of this.defenders)
                            if (defender.isHit(particle))
                                defender.bulletHit(particle);
                    }
                }
            }
        }
    }

    draw () {
        for(let object of this.objects)
            object.draw();

        for(let defender of this.defenders)
            defender.draw();

        for(let particle of this.particles)
            particle.draw();
    }

    createBullet (owner, speed, direction) {
        let theBullet = new bulletObject(this, owner, speed, direction);
        this.particles.push(theBullet);
        return theBullet;
    }

    addScore (points) {
        this.score += points;
    }

    getDefendersLifes () {
        let lifes = 0;
        for(let defender of this.defenders)
            lifes += defender.life;
        return lifes;
    }

    getStageClicks () {
        return (this.game.clicks - this.startClicks);
    }

    defenderDie (defender) {
        // for (let i = this.defenders.length - 1; i >= 0; i--)
        //     if (this.defenders[i].destroyed)
        //         this.defenders.splice(i, 1);
        let hasSurvivors = false;
        for(let defender of this.defenders)
            if (!defender.destroyed)
                hasSurvivors = true;

        if (!hasSurvivors)
            this.game.gameOver();
    }
}
