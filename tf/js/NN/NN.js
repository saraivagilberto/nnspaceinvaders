class NN {
    constructor (ins, hns = null, ons = null) {
        if (ins instanceof NN || ins instanceof Object || (typeof ins == "string")) {
            if (typeof ins == "string")
                ins = JSON.parse(ins);

            if (!ins.td)
                ins.td = [];
            this.assign(ins);
        } else {
            this.ins = ins;
            this.hns = hns;
            this.ons = ons;

            this.h = tf.layers.dense({
                units: this.hns,
                inputShape: [this.ins],
                activation: 'sigmoid'
            });
            this.o = tf.layers.dense({
                units: this.ons,
                activation: 'sigmoid'
            });

            this.m = tf.sequential({
                layers: [
                    this.h,
                    this.o
                ]
            });

            this.m.compile({
                optimizer: tf.train.adam(0.5),
                loss: tf.losses.meanSquaredError
            });

            this.tc = 0;

            this.fit = 0;
            this.avgf = 0;
            this.fc = 0;

            this.cp = {
                is: null,
                ot: null
            };

            this.mc = 0;
        }
    }

    assign (bnn) {
        this.ins = bnn.ins;
        this.hns = bnn.hns;
        this.ons = bnn.ons;

        this.who = new NNx(bnn.who);
        this.wih = new NNx(bnn.wih);

        this.bo =  new NNx(bnn.bo);
        this.bh =  new NNx(bnn.bh);

        this.lr = bnn.lr;
        this.afid = bnn.afid;
        this.af = NNa.get(int(this.afid));

        this.tc = bnn.tc;

        this.fit = bnn.fit;
        this.avgf = bnn.avgf;
        this.fc = bnn.fc;

        this.cp = {
            is: bnn.cp.is.splice(),
            ot: bnn.cp.ot.splice()
        };

        this.mc = bnn.mc;
    }

    async train (iarr, oarr) {
        if (iarr == null)
            return;

        let x = tf.tensor2d([iarr]);
        let y = tf.tensor(oarr, [1,4]);

        let rfit = await this.m.fit(x, y, { });

        x.dispose();
        y.dispose();

        this.tc++;

        return rfit;
    }

    mutate () {
        tf.tidy(() => {
            let ws = this.h.getWeights();
            ws[0] = ws[0].add(tf.tensor1d(Array.from({length: this.hns}, () => (Math.random() < 0.5) ? (Math.random() * 2 - 1) : 0))).clipByValue(-1, 1);
            ws[1] = ws[1].add(tf.tensor1d(Array.from({length: this.hns}, () => (Math.random() < 0.5) ? (Math.random() * 2 - 1) : 0))).clipByValue(-1, 1);
            this.h.setWeights(ws);

            ws = this.o.getWeights();
            ws[0] = ws[0].add(tf.tensor1d(Array.from({length: this.ons}, () => (Math.random() < 0.5) ? (Math.random() * 2 - 1) : 0))).clipByValue(-1, 1);
            ws[1] = ws[1].add(tf.tensor1d(Array.from({length: this.ons}, () => (Math.random() < 0.5) ? (Math.random() * 2 - 1) : 0))).clipByValue(-1, 1);
            this.o.setWeights(ws);
        });

        // Memory LEAK with fast processing
        // Exception on : this.history[t[u]][r[u]].dispose is not a function
        console.log(tf.memory().numTensors);

        this.mc++;
    }

    predict (iarr, bout = false) {

        const x = tf.tensor2d([iarr]);

        let pred = this.m.predict(x);
        let oarr = pred.dataSync();

        this.cp.is = iarr;
        this.cp.ot = oarr;

        if (bout)
            oarr = oarr.map(e => (e >= 0.5));

        x.dispose();
        pred.dispose();

        return oarr;
    }

    fitness (fit, cb) {
        if (fit > this.fit) {
            this.train(this.cp.is, this.cp.ot).then(() => { cb(); });
        } else {
            this.mutate();
            cb();
        }

        this.fit = fit;
        this.avgf = ((this.avgf * this.fc) + this.fit) / (this.fc + 1);
        this.fc++;
    }

    serialize () {
        return JSON.stringify(this);
    }
}
