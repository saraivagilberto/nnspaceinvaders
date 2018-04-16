class bulletObject extends particleObject {
    constructor (stage, owner, speed, direction) {
        super(stage);

        this.owner = owner;
        this.speed = speed;
        this.direction = direction;
        this.damage = 1;
        this.hitObject = null;

        this.w = 5;
        this.h = 10;
    }

    process () {
        this.move(this.direction.x, this.direction.y);
    }

    destroy () {
        super.destroy();
        this.owner.bulletOver(this);
    }

    draw () {
        super.draw();

        if (this.destroyed)
            return;

        if (this.y <= 0 || (this.y + this.h) >= height)
            this.destroy();

        noStroke();
        fill(this.baseColor);
        rect(this.x, this.y, 5, 10);
    }
}
