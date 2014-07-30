

var MinionsLayer = function () {
    cc.log("MinionsLayer")

    this.throwPower = 0;
    this.minion = null;
    this.banana = null;
    this.enemy = null;
    this.isEnemyHit = false;
    this.shit = null;

    this.windPower = 0;
    this.windPowerProgressLeft = null;
    this.windPowerProgressRight = null;
    this.windPowerProgressTimerLeft = null;
    this.windPowerProgressTimerRight = null;

    this.powerProgress = null;
    this.powerProgressTimer = null;
};

MinionsLayer.prototype.onDidLoadFromCCB = function () {
    cc.log("onDidLoadFromCCB");
    if (sys.platform == 'browser') {
        this.onEnter();
    }
    else {
        this.rootNode.onEnter = function () {
            this.controller.onEnter();
        };
    }

//    this.rootNode.schedule(function (dt)
//    {
//        this.controller.onUpdate(dt);
//    });

    this.rootNode.onTouchesBegan = function (touches, event)
    {
        this.controller.onTouchesBegan(touches, event);
        return true;
    };

    this.rootNode.onTouchesEnded = function (touches, event)
    {
        this.controller.onTouchesEnded(touches, event);
        return true;
    };

    this.rootNode.setTouchEnabled(true);

    this.rootNode.onExit = function () {
        this.controller.onExit();
    };
};

MinionsLayer.prototype.onEnter = function () {
    cc.log("onEnter");
    cc.AudioEngine.getInstance().playEffect("res/sounds/background.mp3", true);

    this.windPowerProgressTimerRight = cc.ProgressTimer.create(this.windPowerProgressRight);
    this.windPowerProgressTimerRight.setType(cc.PROGRESS_TIMER_TYPE_BAR);
    this.windPowerProgressTimerRight.setMidpoint(cc.p(0, 0.5));
    this.windPowerProgressTimerRight.setBarChangeRate(cc.p(1, 0));
    this.windPowerProgressTimerRight.setPercentage(0);
    this.windPowerProgressTimerRight.setPosition(this.windPowerProgressRight.getPositionX(), this.windPowerProgressRight.getPositionY());
    this.rootNode.addChild(this.windPowerProgressTimerRight);

    this.windPowerProgressTimerLeft = cc.ProgressTimer.create(this.windPowerProgressLeft);
    this.windPowerProgressTimerLeft.setType(cc.PROGRESS_TIMER_TYPE_BAR);
    this.windPowerProgressTimerLeft.setMidpoint(cc.p(1, 0.5));
    this.windPowerProgressTimerLeft.setBarChangeRate(cc.p(1, 0));
    this.windPowerProgressTimerLeft.setPercentage(0);
    this.windPowerProgressTimerLeft.setPosition(this.windPowerProgressLeft.getPositionX(), this.windPowerProgressLeft.getPositionY());
    this.rootNode.addChild(this.windPowerProgressTimerLeft);
}

MinionsLayer.prototype.onUpdate = function () {
    cc.log("onUpdate");
}

MinionsLayer.prototype.onTouchesBegan = function (touches, event){
    this.rootNode.schedule(this.increasePower, 0.1);
    this.powerProgressTimer = cc.ProgressTimer.create(this.powerProgress);
    this.powerProgressTimer.setType(cc.PROGRESS_TIMER_TYPE_BAR);
    this.powerProgressTimer.setMidpoint(cc.p(0, 0.1));
    this.powerProgressTimer.setBarChangeRate(cc.p(1, 0));
    this.powerProgressTimer.setPercentage(0);
    this.powerProgressTimer.setPosition(this.powerProgress.getPositionX(), this.powerProgress.getPositionY());
    this.rootNode.addChild(this.powerProgressTimer);
}

MinionsLayer.prototype.onTouchesEnded = function (touches, event){
    this.rootNode.unschedule(this.increasePower);
    this.throwBanana();
    this.rootNode.removeChild(this.powerProgressTimer);
    this.powerProgressTimer.cleanuped = true;
}

MinionsLayer.prototype.increasePower = function (){
    if(this.controller.throwPower<1000){
        this.controller.throwPower += 100;
        cc.log("power="+this.controller.throwPower);
    }
    this.controller.increasePowerProgressTimer();
}

MinionsLayer.prototype.increasePowerProgressTimer = function (){
    this.powerProgressTimer.setPercentage(this.throwPower/10);
}

MinionsLayer.prototype.throwBanana = function (){
    cc.log("throwBanana with power="+this.throwPower);
    cc.AnimationCache.getInstance().addAnimations("res/minion_throw.plist");//添加帧动画文件
    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("minion_throw"));   //获取帧动画
    var action1 = cc.Repeat.create(actionFrame, 1);
    var finish = cc.CallFunc.create(this.bananaFly, this);
    this.minion.runAction(cc.Sequence.create(action1, finish));
}

MinionsLayer.prototype.bananaFly = function () {
    cc.log("bananaFly " + this.throwPower);
    var fruit = cc.Sprite.create("res/banana.png");
    this.banana = fruit;

    var startX = this.minion.getPosition().x;
    var startY = this.minion.getPosition().y;
    var endX = startX-this.throwPower;
    var endY = 0;
    var topY = 900 + getRandom(100);

    fruit.setPosition(cc.p(startX, startY));
    fruit.setAnchorPoint(cc.p(0.5, 0.5));
    fruit.cleanuped = false;

    var controlPoints = [
        cc.p(startX, startY),
        cc.p(endX + (startX-endX)/2, topY),
        cc.p(endX + this.windPower, endY)
    ];

    var fruitTime = 1.5;
    var bezierAction = cc.BezierTo.create(fruitTime, controlPoints);
    var rotateAction = cc.RepeatForever.create(cc.RotateBy.create(0.4, -360));
    var finish = cc.CallFunc.create(this.bananaFinish, this);
    var upActions = cc.Sequence.create(bezierAction, cc.CleanUp.create(fruit), finish);
    fruit.runAction(upActions);
    fruit.runAction(rotateAction);
    this.rootNode.addChild(fruit);

    this.throwPower = 0;
    this.rootNode.schedule(this.checkIsCollide);
}

MinionsLayer.prototype.bananaFinish = function () {
    this.rootNode.unschedule(this.checkIsCollide);
    this.rootNode.removeChild(this.banana);
    if(!this.isEnemyHit){
        this.throwShit();
    }
    this.isEnemyHit = false;
}

MinionsLayer.prototype.minionHit = function (){
    cc.log("minionHit");
    cc.AnimationCache.getInstance().addAnimations("res/minion_hit.plist");//添加帧动画文件
    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("minion_hit"));   //获取帧动画
    var action1 = cc.Repeat.create(actionFrame, 1);
    this.minion.runAction(action1);
}

MinionsLayer.prototype.checkIsCollide = function () {
    var bananaRect = this.controller.banana.getBoundingBox();
    var enemyRect = this.controller.enemy.getBoundingBox();
    if(cc.rectIntersectsRect(bananaRect, enemyRect)){
        this.controller.enemyHit();
        this.controller.bananaFinish();
    }
}

MinionsLayer.prototype.enemyHit = function (){
    cc.log("enemyHit");
    this.isEnemyHit = true;
    cc.AnimationCache.getInstance().addAnimations("res/enemy_hit.plist");//添加帧动画文件
    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("enemy_hit"));   //获取帧动画
    var action1 = cc.Repeat.create(actionFrame, 1);
    var finish = cc.CallFunc.create(this.throwShit, this);
    this.enemy.runAction(cc.Sequence.create(action1, finish));
    var num = getRandom(3)+1;
    cc.AudioEngine.getInstance().playEffect("res/sounds/minion_laugh"+num+".mp3", false);
}

MinionsLayer.prototype.throwShit = function (){
    cc.log("throwShit");
    cc.AnimationCache.getInstance().addAnimations("res/enemy_throw.plist");//添加帧动画文件
    var actionFrame = cc.Animate.create(cc.AnimationCache.getInstance().getAnimation("enemy_throw"));   //获取帧动画
    var action1 = cc.Repeat.create(actionFrame, 1);
    var finish = cc.CallFunc.create(this.shitFly, this);
    this.enemy.runAction(cc.Sequence.create(action1, finish));
}

MinionsLayer.prototype.shitFly = function () {
    cc.log("shitFly " + this.throwPower);
    var fruit = cc.Sprite.create("res/banana.png");
    this.shit = fruit;

    var startX = this.enemy.getPosition().x;
    var startY = this.enemy.getPosition().y;
    var endX = this.minion.getPositionX()-this.throwPower;
    var endY = 0;
    var topY = 900 + getRandom(100);

    fruit.setPosition(cc.p(startX, startY));
    fruit.setAnchorPoint(cc.p(0.5, 0.5));
    fruit.cleanuped = false;

    var controlPoints = [
        cc.p(startX, startY),
        cc.p(endX + (startX-endX)/2, topY),
        cc.p(endX + this.windPower, endY)
    ];

    var fruitTime = 1.5;
    var bezierAction = cc.BezierTo.create(fruitTime, controlPoints);
    var rotateAction = cc.RepeatForever.create(cc.RotateBy.create(0.4, 360));
    var finish = cc.CallFunc.create(this.shitFinish, this);
    var upActions = cc.Sequence.create(bezierAction, cc.CleanUp.create(fruit), finish);
    fruit.runAction(upActions);
    fruit.runAction(rotateAction);
    this.rootNode.addChild(fruit);

    this.throwPower = 0;
    this.rootNode.schedule(this.checkMinionCollide);
}

MinionsLayer.prototype.shitFinish = function () {
    this.rootNode.unschedule(this.checkMinionCollide);
    this.rootNode.removeChild(this.shit);

    var randomNum = getRandom(600);
    var negative = Math.random()>0.5?1:-1;
    this.windPower = randomNum*negative;
    if(negative==1){
        this.windPowerProgressTimerLeft.setPercentage(0);
        this.windPowerProgressTimerRight.setPercentage(randomNum/6);
    }else{
        this.windPowerProgressTimerRight.setPercentage(0);
        this.windPowerProgressTimerLeft.setPercentage(randomNum/6);
    }
}

MinionsLayer.prototype.checkMinionCollide = function () {
    var shitRect = this.controller.shit.getBoundingBox();
    var minionRect = this.controller.minion.getBoundingBox();
    if(cc.rectIntersectsRect(shitRect, minionRect)){
        this.controller.shitFinish();
        this.controller.minionHit();
    }
}