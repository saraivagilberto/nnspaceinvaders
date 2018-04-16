class gameObject {
    constructor () {
        this.uuid = uuidGen();
        this.x = -1;
        this.y = -1;
        this.w = -1;
        this.h = -1;
        this.destroyed = false;
        this.baseColor = color(127);
    }

    move (stepX, stepY, absolute = false) {
        if (absolute) {
            this.x = int(stepX);
            this.y = int(stepY);
        } else {
            this.x += int(stepX);
            this.y += int(stepY);
        }
    }

    resize (scaleX, scaleY, absolute = false) {
        if (absolute) {
            this.w = int(scaleX);
            this.h = int(scaleY);
        } else {
            this.w += int(scaleX);
            this.h += int(scaleY);
        }
    }

    process () {

    }

    draw () {
        if (this.destroyed)
            return;

        // noFill();
        // stroke(this.baseColor);
        // rect(this.x, this.y, this.w - 1, this.h - 1);
    }

    destroy () {
        //console.log("Object " + this.uuid + " destroyed");
        this.destroyed = true;
    }
}
