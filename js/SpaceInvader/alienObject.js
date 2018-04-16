class alienObject extends stageObject {
    constructor (stage, level, width, height) {
        super(stage);

        this.level = level;
        this.w = width;
        this.h = height;

        this.life = level;

        this.bullets = [];
        this.bulletMax = 1;

        this.ic = new clickSystem(stage.game, 200);
        this.displayIC = new clickSystem(stage.game, 200);
        this.displayAt = 0;
    }

    draw () {
        super.draw();

        let alienChar = ['a', 'b'];
        if (this.level == 1) {
            this.baseColor = color(0, 250, 0);
            alienChar = ['a', 'b'];
        }

        if (this.level == 2){
            this.baseColor = color(250, 250, 0);
            alienChar = ['c', 'd'];
        }

        if (this.level == 3) {
            this.baseColor = color(250, 0, 0);
            alienChar = ['e', 'f'];
        }

        if (this.displayIC.canRun()) {
            this.displayAt = (this.displayAt == 1)
                ? 0
                : 1;
        }

        noStroke();
        textAlign(CENTER);
        fill(this.baseColor);
        textFont(this.stage.game.siFont);
        textSize(this.w - 4);
        text(alienChar[this.displayAt], this.x + (this.w / 2), this.y + this.h - 2);
    }

    shoot () {
        if (this.ic.canRun() && (this.bullets.length < this.bulletMax)){
            let theBullet = this.stage.createBullet(this, 1, {x: 0, y: 3});
            theBullet.baseColor = this.baseColor;
            theBullet.move(this.x + 11, this.y + 18, true);

            this.bullets.push(theBullet);
        }
    }

    hit (points) {
        super.hit(points);
        //console.log("ALIEN HIT");
    }

    bulletHit(bullet) {
        this.hit(bullet.damage);
        bullet.owner.addScore(bullet.damage);
        bullet.hitObject = this;

        bullet.destroy();
    }


    bulletOver (bullet) {
        for (let i = this.bullets.length - 1; i >= 0; i--)
            if (this.bullets[i].uuid == bullet.uuid) {
                this.bullets.splice(i, 1);
                break;
            }
    }
}
