const SCREEN_MENU        = 1;
const SCREEN_START_STAGE = 2;
const SCREEN_STAGE       = 3;
const SCREEN_STAGE_CLEAR = 4;
const SCREEN_WINNER      = 5;

class gameSystem {
    constructor (w, h) {
        this.w = w;
        this.h = h;
        this.speed = 1;
        this.noDisplay = false;
        this.stage = null;
        this.lastStage = null;
        this.siFont = null;
        this.screenAt = SCREEN_MENU;
        this.switchIC = new clickSystem(this);
        this.keyIC = new clickSystem(this, 1);
        this.clicks = 0;

        this.clicksPerSecondCount = 0;
        this.clicksPerSecondMillis = 0;

        this.clicksPerSecond = 0;
        this.startAt = null;

        this.keys = {};

        let game = this;
        window.onkeyup = function(e) { game.keys[e.keyCode] = false; }
        window.onkeydown = function(e) { game.keys[e.keyCode] = true; }

        this.onStageEnd = null;
    }

    preload () {
        this.siFont = loadFont('./css/INVADERS.TTF');
    }

    setup () {
        createCanvas(this.w, this.h);
        rectMode(CORNER);
        frameRate(60);
        smooth(6);

        this.startAt = millis();
        this.clicksPerSecondMillis = millis();
    }

    draw () {
        if (this.noDisplay)
            return;

        this.drawGameScreen();
        this.drawScreen();
    }

    processKey (keyCode) {
        if ((keyCode == ENTER) && this.keyIC.canRun()) {
            if ((this.screenAt == SCREEN_MENU) || (this.screenAt == SCREEN_WINNER))
                this.newGame();
            else if (this.screenAt == SCREEN_STAGE_CLEAR)
                this.newStage();
        }
    }

    process () {
        this.clicks++;

        if (int(this.clicksPerSecondMillis / 1000) != int(millis() / 1000)) {
            this.clicksPerSecond = this.clicks - this.clicksPerSecondCount;
            this.clicksPerSecondCount = this.clicks;
            this.clicksPerSecondMillis = millis();
        }

        if (this.screenAt == SCREEN_STAGE)
            if (this.stage != null)
                this.stage.process();

        if (this.screenAt == SCREEN_START_STAGE) {
            this.switchIC.setInterval(100);

            if (this.switchIC.canRun()) {
                this.startStage();
            }
        }

        if (this.keys[ENTER])
            this.processKey(ENTER);
    }

    drawGameScreen () {
        background(0);

        noFill();
        stroke(127);
        rect(0, 0, width - 1, height - 1);
    }

    drawScreen() {
        textFont("sans-serif");
        if (this.screenAt == SCREEN_MENU) {
            noStroke();

            textSize(32);
            textAlign(CENTER);
            fill(153, 153, 0);
            text('NN Space Invaders', 0, height / 2, width, height / 2);

            textSize(15);
            fill(0, 102 , 153, this.fadeLerp(2, 100, 255));
            text('Press \'ENTER\' to start', 0, (height / 2) + 50, width);

            if (this.lastStage != null) {
                textSize(40);
                textAlign(CENTER);
                fill(255, 50, 0, this.fadeLerp(6, 100, 255));
                text('Game over', 0, height / 2 - 150, width, height / 2);
                textSize(32);
                fill(255, 153, 0, this.fadeLerp(6, 100, 255));
                text('You did ' + this.lastStage.score + ' points ', 0, height / 2 - 100, width, height / 2);
            }
        }

        if (this.screenAt == SCREEN_START_STAGE) {
            noStroke();
            textSize(40);
            textAlign(CENTER);
            fill(0, 250, 0,  255 - this.fadeLerp(10, 100, 255));
            text('STAGE ' + this.stage.num, 0, height / 2 - 150, width, height / 2);
        }

        if (this.screenAt == SCREEN_STAGE) {
            if (this.stage != null) {
                this.stage.draw();

                let topOffset = 0;
                for(let defender of this.stage.defenders) {
                    textAlign(RIGHT);
                    fill(255, 50, 0, this.fadeLerp(6, 100, 255));
                    textFont(this.siFont);
                    textSize(16);
                    text(Array(defender.life + 1).join('|'), width - 10, topOffset + 25);
                    topOffset += 30;
                }

                textAlign(RIGHT);
                fill(5, 250, 0, this.fadeLerp(3, 100, 255));
                textFont("Comic Sans MS");
                textSize(20);
                text("SCORE: " + ((this.stage.score < 0 ? "-" : "")) + (abs(this.stage.score) + "").padStart(5, "0"), width - 10, topOffset + 15);
            }
        }

        if (this.screenAt == SCREEN_STAGE_CLEAR) {
            noStroke();
            textSize(32);
            textAlign(CENTER);
            fill(153, 153, 0);
            text('NN Space Invaders', 0, height / 2, width, height / 2);

            textSize(15);
            fill(0, 102 , 153, this.fadeLerp(2, 100, 255));
            text('Press \'ENTER\' to next level', 0, (height / 2) + 50, width);

            textSize(40);
            textAlign(CENTER);
            fill(255, 50, 0, this.fadeLerp(6, 100, 255));
            text('Good Job!', 0, height / 2 - 150, width, height / 2);
            textSize(32);
            fill(255, 153, 0, this.fadeLerp(6, 100, 255));
            text('You did ' + this.stage.score + ' points ', 0, height / 2 - 100, width, height / 2);
        }

        if (this.screenAt == SCREEN_WINNER) {
            noStroke();

            textSize(32);
            textAlign(CENTER);
            fill(153, 153, 0);
            text('NN Space Invaders', 0, height / 2, width, height / 2);

            textSize(15);
            fill(0, 102 , 153, this.fadeLerp(2, 100, 255));
            text('Press \'ENTER\' to start again', 0, (height / 2) + 50, width);

            textSize(40);
            textAlign(CENTER);
            fill(255, 50, 0, this.fadeLerp(6, 100, 255));
            text('WINNER', 0, height / 2 - 150, width, height / 2);
            textSize(32);
            fill(255, 153, 0, this.fadeLerp(6, 100, 255));
            text('You f**k**g broke the game!', 0, height / 2 - 100, width, height / 2);
        }

        textAlign(LEFT);
        fill(127);
        textFont("Comic Sans MS");
        textSize(10);
        text(int(frameRate()) + " | " + this.speed, 5, 15);

        /*
         * Debug info
         * 
         * /
        
        // Aliens Position [|  c  |]
        let aliensCount = 0;
        let averAliensPos = { x: 0, y: 0 };        
        let minXPos = this.w;
        let maxXPos = 0;
        if (this.stage != null) {
            for(let object of this.stage.objects)
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


        noFill();
        stroke(255);
        rect(averAliensPos.x, averAliensPos.y, 10, 10);        

        noFill();
        stroke(255);
        rect(minXPos, averAliensPos.y, 10, 10);  
        
        noFill();
        stroke(255, 0, 0);
        rect(maxXPos, averAliensPos.y, 10, 10);        
        console.log(maxXPos);
        /**/
    }

    switchScreen (toScreen) {
        this.screenAt = toScreen;
        this.switchIC.reset();
    }

    fadeLerp (stepSize, minVal, maxVal) {
        return minVal + (((sin(radians(millis() / stepSize)) + 1) / 2) * (maxVal - minVal));
    }

    width () {
        return width;
    }

    height () {
        return height;
    }

    newGame () {
        this.lastStage = null;
        this.newStage();
    }

    newStage () {
        this.stage = new stageSystem(this, this.lastStage);
        this.stage.load();
        if (this.stage.data != null)
            this.switchScreen(SCREEN_START_STAGE);
        else if (this.stage.winner)
            this.winnerStage();
    }

    startStage () {
        this.switchScreen(SCREEN_STAGE);
        this.stage.init();
    }

    nextStage () {
        this.lastStage = this.stage;
        this.switchScreen(SCREEN_STAGE_CLEAR);
    }

    DoOnStageEnd () {
        if (this.onStageEnd && typeof(this.onStageEnd) === "function") {
            this.onStageEnd(this);
        }
    }

    cleanedStage () {
        this.nextStage();

        this.DoOnStageEnd();
    }

    winnerStage () {
        this.lastStage = null;
        this.switchScreen(SCREEN_WINNER);

        this.DoOnStageEnd();
    }

    gameOver () {
        this.switchScreen(SCREEN_MENU);
        this.lastStage = this.stage;
        this.stage = null;

        this.DoOnStageEnd();
    }

}
