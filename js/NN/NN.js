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

            this.who = new NNx(this.ons, this.hns, true);
            this.wih = new NNx(this.hns, this.ins, true);

            this.bo =  new NNx(this.ons, 1, true);
            this.bh =  new NNx(this.hns, 1, true);

            this.lr = 0.1;
            this.afid = NNa_SIGMOID;
            this.af = NNa.get(this.afid);

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

    train (iarr, oarr) {
        if (iarr == null)
            return;

        let is = NNx.createFrom(iarr);
        let t = NNx.createFrom(oarr);

        let h = NNx.act(this.wih, is, this.bh, this.af);
        let o = NNx.act(this.who, h, this.bo, this.af);

        let oerrs = NNx.subtract(t, o);

        let grad = NNx.grad(o, this.af, oerrs, this.lr);

        let ht = NNx.transpose(h);
        let who_d = NNx.multiply(grad, ht);

        this.who.add(who_d);
        this.bo.add(grad);

        let whot = NNx.transpose(this.who);
        let herrs = NNx.multiply(whot, oerrs);

        let hgrad = NNx.grad(h, this.af, herrs, this.lr);

        let it = NNx.transpose(is);
        let wis_d = NNx.multiply(hgrad, it);

        this.wih.add(wis_d);
        this.bh.add(hgrad);

        this.tc++;
    }

    mutate () {
        let m = (v) => (Math.random() < 0.5) ? (Math.random() * 2 - 1) : v;

        this.wih.map(m);
        this.who.map(m);
        this.bh.map(m);
        this.bo.map(m);

        this.mc++;
    }

    predict (iarr, bout = false) {
        let is = NNx.createFrom(iarr);

        let h = NNx.act(this.wih, is, this.bh, this.af);
        let o = NNx.act(this.who, h, this.bo, this.af);

        let oarr = o.toArray();

        this.cp.is = iarr;
        this.cp.ot = oarr;

        if (bout)
            oarr = oarr.map(e => (e >= 0.5));

        return oarr;
    }

    fitness (fit) {
        if (fit > this.fit) {
            this.train(this.cp.is, this.cp.ot);
        } else {
            this.mutate();
        }

        this.fit = fit;
        this.avgf = ((this.avgf * this.fc) + this.fit) / (this.fc + 1);
        this.fc++;
    }

    serialize () {
        return JSON.stringify(this);
    }
}
