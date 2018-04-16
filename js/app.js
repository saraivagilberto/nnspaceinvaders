var game = new gameSystem(800, 600);

var _DB = null;
var _NNSI = null;

class NNSI {
    constructor (db, game) {
        this.db = db;
        this.game = game;

        this.pause = false;
        this.saveDB = false;
        this.loadDB = false;

        this.inputsCount = 11;
        this.hiddenLyr = 20;
        this.outputCount = 4;

        this.nn = new NN(this.inputsCount, this.hiddenLyr, this.outputCount);

        this.saveAI = function () {
            let nnsi = this;
            nnsi.pause = true;

            this.db.saveNNSI(this, function(saved){
                if (saved)
                    console.log("Saved");

                nnsi.pause = false;
            });
        }

        this.loadAI = function () {
            let nnsi = this;
            nnsi.pause = true;

            let chkTrain = nnsi.controls.chkTrain.checked();
            nnsi.controls.chkTrain.value(false);
            nnsi.db.loadNNSI(function (nn) {
                 nnsi.nn = nn;
                 nnsi.controls.chkTrain.value(chkTrain);

                 nnsi.pause = false;
            });
        }

        this.game.onStageEnd = function () {
            //if (!_NNSI.controls.chkLockEvolce.checked())
                //_NNSI.nn.envolveGen();

            if (_NNSI.saveDB) {
                _NNSI.saveDB = false;
                _NNSI.saveAI();
            }

            if (_NNSI.loadDB) {
                _NNSI.loadDB = false;
                _NNSI.loadAI();
            }
        }

        this.controls = {
            chkTrain      : createCheckbox('Train AI', false),
            btnSave       : createButton('Save AI'),
            btnLoad       : createButton('Load AI'),
            chkDisplay    : createCheckbox('Display Game', true),
            sldSpeed      : createSlider(1, 500, 1),
            chkFullDebug  : createCheckbox('Full Debug', false),
            chkLockEvolce : createCheckbox('Lock evolution', false),
            divDebug      : createDiv('...'),
        }

        this.startAt = 0;
        this.trainDuration = 0;

        this.controls.chkTrain.changed(function(e) {
            if (e.target.checked) {
                _NNSI.startAt = new Date().getTime();
                console.log("Starting AI training");
            } else {
                _NNSI.trainDuration = new Date().getTime() - _NNSI.startAt;
                console.log("Ended AI training at ", new Date());
            }
        });

        this.controls.chkDisplay.changed(function(e) {
            _NNSI.controls.sldSpeed.value(Math.min(50, _NNSI.controls.sldSpeed.value()));
            if (_NNSI.game.speed != _NNSI.controls.sldSpeed.value()) {
                _NNSI.game.speed = _NNSI.controls.sldSpeed.value();
                console.log("Setting game speed to " + _NNSI.game.speed);
            }
            _NNSI.game.noDisplay = !e.target.checked;
        });

        this.controls.sldSpeed.changed(function(e) {
            if (_NNSI.controls.chkDisplay.checked()) {
                _NNSI.game.speed = Math.min(50, int(e.target.value));
                _NNSI.controls.sldSpeed.value(_NNSI.game.speed);
            } else {
                _NNSI.game.speed = int(e.target.value);
            }
            console.log("Setting game speed to " + _NNSI.game.speed);
        });


        this.controls.btnSave.mousePressed(function() {
            _NNSI.saveDB = true;
        });

        this.controls.btnLoad.mousePressed(function() {
            _NNSI.loadDB = true;
            if (!_NNSI.controls.chkTrain.checked())
                _NNSI.loadAI();
        });

        this.controls.divDebug.html('<canvas id="debugCanvas" width="300px" height="400px"></canvas></div>');
        this.controls.debugCanvas = document.getElementById('debugCanvas');
        this.controls.debugCtx = (this.controls.debugCanvas.getContext)
            ? this.controls.debugCanvas.getContext('2d')
            : null;

        this.debugData = [];
        this.keys = [];
    }

    process () {
        if (!this.controls.chkTrain.checked())
            return;

        this.trainDuration = (new Date().getTime() - this.startAt) * this.game.speed;

        let input = [];
        let debugData = [];

        // Current Duration of the Training mode
        //debugData.push(int(this.trainDuration / 1000));

        let hitCoef = 0;
        let timeCoef = 0;
        let stageDurationCoef = 0;
        let averAliensPos = { x: 0, y: 0 };
        let aliensCount = 0;
        let elapseFactor = 8000;

        let isStage = (this.game.screenAt == SCREEN_STAGE);
        if (isStage) {

            // AI Inputs
            // Current Game Screen
            input.push(this.game.screenAt);

            debugData.push(this.game.screenAt);

            // Aliens Position [|  c  |]
            let minXPos = this.game.w;
            let maxXPos = 0;
            if (this.game.stage != null) {
                for(let object of this.game.stage.objects)
                    if (object instanceof alienObject) {
                        averAliensPos.x += object.x;
                        averAliensPos.y += object.y;

                        minXPos = Math.min(minXPos, object.x);
                        maxXPos = Math.max(maxXPos, object.x);

                        aliensCount++;
                    }

                // c = Center point of Aliens block
                averAliensPos.x /= aliensCount;
                averAliensPos.y /= aliensCount;
            }
            input.push(averAliensPos.x);
            input.push(averAliensPos.y);
            input.push(minXPos);
            input.push(maxXPos);

            debugData.push(averAliensPos.x);
            debugData.push(averAliensPos.y);
            debugData.push(minXPos);
            debugData.push(maxXPos);            

            // Stage Number
            input.push(this.game.stage.num);

            debugData.push(this.game.stage.num);

            // Current Score
            input.push(this.game.stage.score);

            debugData.push(this.game.stage.score);

            // Stage duration
            stageDurationCoef = float((elapseFactor - ((this.game.clicks - this.game.stage.startClicks))) / elapseFactor);
            input.push(stageDurationCoef);

            debugData.push(stageDurationCoef);

            // Defender Horizontal Position
            input.push(this.game.stage.defenders[0].x);

            debugData.push(this.game.stage.defenders[0].x);

            // Defender Bullets dropped on target
            input.push(this.game.stage.defenders[0].bulletsHits);

            debugData.push(this.game.stage.defenders[0].bulletsHits);

            // Defender Bullets dropped on target / missed coefficient
            hitCoef = float(this.game.stage.defenders[0].bulletsHits / (this.game.stage.defenders[0].bulletsShoot + 1));
            input.push(hitCoef);

            debugData.push(hitCoef);
        } else {
            input.push(this.game.screenAt);

            debugData.push(this.game.screenAt);

            // Average Aliens Position
            input.push(0);
            input.push(0);
            input.push(0);
            input.push(0);

            debugData.push(0);
            debugData.push(0);
            debugData.push(0);
            debugData.push(0);

            // Stage Number
            input.push(0);

            debugData.push(0);

            // Current Score
            input.push(0);

            debugData.push(0);

            // Stage duration
            input.push(stageDurationCoef);

            debugData.push(stageDurationCoef);

            // Defender Horizontal Position
            input.push(0);

            debugData.push(0);

            // Defender Bullets dropped on target
            input.push(0);

            debugData.push(0);

            // Defender Bullets dropped on target / missed coefficient
            input.push(hitCoef);

            debugData.push(hitCoef);
        }

        let keys = this.nn.predict(input, true);

        let fitness = 0;
        if (isStage) {
            fitness =
                ((keys[2] && keys[3]) ? -1 : 0) +
                (
                    (
                        (
                            (0.4 * (this.game.stage.defenders[0].life / this.game.stage.data.objects.defenders.lifes)) +
                            (0.05 * ((this.game.stage.defenders[0].y - averAliensPos.y) / this.game.stage.defenders[0].y)) +
                            (0.05 * stageDurationCoef) +
                            (0.5 * hitCoef)
                        ) *
                        (
                            (
                                ((this.game.stage.data.objects.aliens.types.length - aliensCount) / this.game.stage.data.objects.aliens.types.length) +
                                (1 - (Math.abs(this.game.stage.defenders[0].x - averAliensPos.x) / this.game.w))
                            ) * 0.5
                        )
                    )

                )
        }

        if (!isStage) {
            if (keys[0]) fitness = 0.1;
        } else {
            if (this.game.stage.score < 0) fitness = 0;
            if (keys[0] || (keys[2] && keys[3])) fitness = 0;
        }

        this.nn.fitness(fitness);

        this.debugData = debugData;
        this.keys = keys;

        if (isStage) {
            if (keys[0]) this.game.processKey(ENTER);
            if (keys[1]) this.game.stage.processKey(32);
            if (keys[2]) this.game.stage.processKey(37);
            if (keys[3]) this.game.stage.processKey(39);
        } else {
            if (keys[0])
                this.game.processKey(ENTER);
            else if (this.game.clicks > 100)
                if (!this.controls.chkLockEvolce.checked())
                    this.nn.mutate();
        }
    }
}

function setup() {
    game.setup();
    processAI();
}

function preload() {
    _DB = new DB(function (db) {
        _NNSI = new NNSI(db, game);
    });
    game.preload();
}

let avoidOverlap = false;

function processAI() {
    let fpsEnhanced = 1;

    let timeFactor = 16 / game.speed;
    if (timeFactor < 1)
        fpsEnhanced = int((1 - timeFactor) * 100);

    while (avoidOverlap) { }

    avoidOverlap = true;
    for (let fps = 1; fps <= fpsEnhanced; fps++) {
        if (_NNSI != null) {
            if(!_NNSI.pause) {
                _NNSI.process();
                game.process();
            }
        } else {
            game.process();
        }
    }
    avoidOverlap = false;

    setTimeout(processAI, Math.max(0, int(16 / game.speed)));
}

function draw() {
    if (avoidOverlap)
        return;
    avoidOverlap = true;
    if (_NNSI != null) {
        let ctx = _NNSI.controls.debugCtx;
        let ctxY = 15;

        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect (0, 0, 300, 400);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = "9px Arial";
        ctx.fillText('FPS: ' + (Number(game.clicksPerSecond).toFixed(6)), 5, ctxY);
        ctxY += 20;

        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = "bold 12px Arial";
        ctx.fillText('Fitness', 5, ctxY);
        ctxY += 20;

        let maxFv = Math.max(Math.max(Math.max(_NNSI.nn.fit), _NNSI.nn.avgf), _NNSI.nn.avgfm);

        ctx.font = "9px Arial";
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText('Fitness', 8, ctxY);
        ctx.fillText(Number(_NNSI.nn.fit).toFixed(6), 100, ctxY);
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillRect (300 - (100 * (_NNSI.nn.fit / maxFv)), ctxY - 5, 100, 5);
        ctxY += 10;

        ctx.font = "9px Arial";
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText('Aver. Fitness', 8, ctxY);
        ctx.fillText(Number(_NNSI.nn.avgf).toFixed(6), 100, ctxY);
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillRect (300 - (100 * (_NNSI.nn.avgf / maxFv)), ctxY - 5, 100, 5);
        ctxY += 10;

        ctx.font = "9px Arial";
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText('Mutates', 8, ctxY);
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillText(Number(_NNSI.nn.mc).toFixed(0), 100, ctxY);
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillRect (300 - (100 * _NNSI.nn.mf), ctxY - 5, 100, 5);
        ctxY += 10;

        ctx.font = "9px Arial";
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText('Trains', 8, ctxY);
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillText(Number(_NNSI.nn.tc).toFixed(0), 100, ctxY);
        ctxY += 10;

        if (_NNSI.controls.chkFullDebug.checked()) {
            ctxY += 10;
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.font = "bold 12px Arial";
            ctx.fillText('Inputs', 5, ctxY);
            ctxY += 20;

            let debugData = _NNSI.debugData;

            let maxWidth = 0;
            for (let v of debugData)
                maxWidth = Math.max(maxWidth, v);

            ctx.font = "9px Arial";
            for (let v of debugData) {
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.fillText(Number(v).toFixed(6), 8, ctxY);
                ctx.fillStyle = 'rgb(0,255,0)';
                ctx.fillRect (300 - (100 * (v / maxWidth)), ctxY - 5, 100, 5);
                ctxY += 10;
            }
            ctxY += 10;

            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.font = "bold 12px Arial";
            ctx.fillText('Predict', 5, ctxY);
            ctxY += 20;

            let keys = _NNSI.keys;
            ctx.font = "9px Arial";
            for (let id in keys) {
                ctx.fillStyle = ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(100,100,255)', 'rgb(255,255,0)'][id];
                ctx.fillText(['ENTER', 'SPACE', 'LEFT', 'RIGHT'][id], 8, ctxY);
                ctx.fillStyle = ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(100,100,255)', 'rgb(255,255,0)'][id];
                ctx.fillRect (300 - (100 * ((keys[id])? 1 : 0)), ctxY - 5, 100, 5);
                ctxY += 10;
            }

            /*
            for(let v of _NNSI.nn.wih.toArray())
                _NNSI.wihd.push('<div><div style="width:' + (int(v * 10 + 10)) + 'px"></div></div>');

            for(let v of _NNSI.nn.who.toArray())
                _NNSI.whod.push('<div><div style="width:' + (int(v * 10 + 10)) + 'px"></div></div>');

            for(let v of _NNSI.nn.bh.toArray())
                _NNSI.bhd.push('<div><div style="width:' + (int(v * 10 + 10)) + 'px"></div></div>');

            for(let v of _NNSI.nn.bo.toArray())
                _NNSI.bod.push('<div><div style="width:' + (int(v * 10 + 10)) + 'px"></div></div>');
            */
        }
    }

    game.draw();
    avoidOverlap = false;
}
