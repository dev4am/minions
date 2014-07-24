

var MinionsLayer = function () {
    cc.log("MinionsLayer")
    this.fruitList = [];
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
}

MinionsLayer.prototype.onUpdate = function () {
    cc.log("onUpdate");
}

MinionsLayer.prototype.onTouchesBegan = function (touches, event){

}

MinionsLayer.prototype.onTouchesEnded = function (touches, event){
    this.throwBanana();
}

MinionsLayer.prototype.throwBanana = function ()
{
    cc.log("throwBanana");
    //create new fruit per 0.5s
    var fruit = cc.Sprite.createWithSpriteFrameName("banana.png");
    var x = 300 + getRandomOffset(200);
    fruit.setPosition(cc.p(x, -100));
    fruit.setAnchorPoint(cc.p(0.5, 0.5));
    this.fruitZOrder -= 1;
    fruit.setZOrder(this.fruitZOrder);
    fruit.cleanuped = false;
    fruit.num = data.num;
    var offSetX = getRandomOffset(100);
    var topY = 900 + getRandom(100);
    var controlPoints = [
        cc.p(x, -100),
        cc.p(x - offSetX, topY),
        cc.p(x - offSetX * 2, -100)
    ];
    var fruitTime = 3;
    var bezier = cc.BezierTo.create(fruitTime, controlPoints);
    var action2 = cc.RotateBy.create(fruitTime, getRandom(360));
    var upActions = cc.Spawn.create(cc.Sequence.create(bezier, cc.CleanUp.create(fruit)), action2);
    fruit.runAction(upActions);
    this.rootNode.addChild(fruit);
    this.fruitList.push(fruit);
};

