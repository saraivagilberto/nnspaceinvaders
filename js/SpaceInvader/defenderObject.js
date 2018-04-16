class defenderObject extends stageObject {
    constructor (stage, life, width, height, bulletMax) {
        super(stage);

        this.life = life;
        this.w = width;
        this.h = height;

        this.baseColor = color(
            random(255),
            random(255),
            random(255)
        );

        this.bulletMax = bulletMax;
        this.bullets = [];
        this.bulletsShoot = 0;
        this.bulletsHits = 0;

        this.ic = new clickSystem(stage.game, 20);
    }

    draw () {
        super.draw();

        noStroke();
        textAlign(CENTER);
        fill(this.baseColor);
        textFont(this.stage.game.siFont);
        textSize(16);
        text('-', this.x + (this.w / 2), this.y + this.h - 2);
    }

    processKey (keyCode) {
        if (keyCode == 32) {
            this.shoot();
        }

        if (keyCode == 37) {
            this.moveHorizantal(-5);
        }

        if (keyCode == 39) {
            this.moveHorizantal(5);
        }
    }

    process () {
        if (this.stage.game.keys[32]) {
            this.processKey(32);
        }

        if (this.stage.game.keys[37]) {
            this.processKey(37);
        }

        if (this.stage.game.keys[39]) {
            this.processKey(39);
        }
    }

    moveHorizantal (stepX) {
        if (((stepX < 0) && (this.x - (this.w / 2) - stepX >= 0)) ||
            ((stepX > 0) && (this.x + this.w + stepX <= this.stage.game.width())))
        this.move(stepX, 0);
    }

    shoot () {
        if (this.ic.canRun() && (this.bullets.length < this.bulletMax)){
            let theBullet = this.stage.createBullet(this, 1, {x: 0, y: -5});
            theBullet.baseColor = this.baseColor;
            theBullet.move(this.x + 7, this.y - 18, true);

            this.bullets.push(theBullet);
            this.bulletsShoot++;
        }
    }

    kill () {
        super.destroy();

        this.stage.defenderDie(this);
    }

    hit (points) {
        super.hit(points);
        //console.log("DEFENDER HIT");
    }

    bulletHit(bullet) {
        this.hit(bullet.damage);
        this.addScore(-bullet.damage);

        bullet.destroy();
    }

    life () {
        return this.life;
    }

    bulletOver (bullet) {
        if (bullet.hitObject != null)
            this.bulletsHits++;

        for (let i = this.bullets.length - 1; i >= 0; i--)
            if (this.bullets[i].uuid == bullet.uuid) {
                this.bullets.splice(i, 1);
                break;
            }
    }

    addScore (points) {
        this.stage.addScore(points);
    }
}
