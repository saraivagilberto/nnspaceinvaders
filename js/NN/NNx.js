class NNx {
    constructor (rows, cols = null, autorand = false) {
        if (rows instanceof NNx || rows instanceof Object) {
            this.r = rows.r;
            this.c = rows.c;
            this.m = (rows instanceof NNx)
                ? rows.m.map((c) => c.slice())
                : rows.m;
        } else {
            this.r = rows;
            this.c = cols;
            this.m = Array(this.r).fill().map(() => Array(this.c).fill(0));
            if (autorand)
                this.randomize();
        }
    }

    map (f, p = null) {
        this.m = (p == null)
            ? this.m.map((c, y) => c.map((e, x) => f(e, y, x)))
            : this.m.map((c, y) => c.map((e, x) => f(e, p, y, x)));

        return this;
    }

    randomize () {
        this.map(e => Math.random() * 2 - 1);
    }

    add (v) {
        if (v instanceof NNx) {
            if (this.r !== v.r || this.c !== v.c)
                return;
            return this.map((e, y, x) => e + v.m[y][x]);
        } else {
            return this.map(e => e + v);
        }
    }

    multiply (v) {
        if (v instanceof NNx) {
            if (this.r !== v.r || this.c !== v.c)
                return;
            return this.map((e, y, x) => e * v.m[y][x]);
        } else {
            return this.map(e => e * v);
        }
    }

    toArray () {
        let arr = [];
        for(let y in this.m)
            for(let x in this.m[y])
                arr.push(this.m[y][x]);
        return arr;
    }

    static createFrom (arr) {
        return new NNx(arr.length, 1).map((e, y, x) => arr[y]);
    }

    static map (m, f, p = null) {
        return (p == null)
            ? new NNx(m.r, m.c).map((e, y, x) => f(m.m[y][x], y, x))
            : new NNx(m.r, m.c).map((e, y, x) => f(m.m[y][x], p, y, x));
    }

    static act (h, i, b, af) {
        if (h.c !== i.r)
            return;

        return new NNx(h.r, i.c).map((e, y, x) => {
            let s = 0;
            for (let w = 0; w < h.c; w++)
                s += (h.m[y][w] * i.m[w][x]);
            return af(s + b.m[y][x], true);
        });
    }

    static grad (i, af, err, lr) {
        return new NNx(i.r, i.c).map((e, y, x) => af(i.m[y][x] * err.m[y][x] * lr, false));
    }

    static multiply (a, b) {
        if (a.c !== b.r)
            return;

        return new NNx(a.r, b.c).map((e, y, x) => {
            let s = 0;
            for (let w = 0; w < a.c; w++)
                s += a.m[y][w] * b.m[w][x];
            return s;
        });
    }

    static subtract (a, b) {
        if (a.r !== b.r || a.c !== b.c)
            return;

        return new NNx(a.r, a.c).map((e, y, x) => a.m[y][x] - b.m[y][x]);
    }

    static transpose (m) {
        return new NNx(m.c, m.r).map((e, y, x) => m.m[x][y]);
    }
}
