class stageObject extends gameObject {
    constructor (stage) {
        super();

        this.stage = stage;
        this.life = 1;
    }

    isHit (object) {
        return !object.destroyed && !(object.x > this.x + this.w ||
                 object.x + object.w < this.x ||
                 object.y > this.y + this.h ||
                 object.y + object.h < this.y);
    }

    kill () {
        this.destroy();
    }

    hit (points = 1) {
        this.life -= points;
        if (this.life <= 0)
            this.kill();
    }

    bulletHit (bullet) {
        this.hit(1);
        bullet.destroy();
    }

    draw () {
        if (this.destroyed)
            return;

        super.draw();

        noStroke();
        fill(0, 255, 0);
        rect(this.x + this.w - (2 * this.life), this.y, (2 * this.life), 4);
    }
}
