//
// CleanerScoreScene class
//
var MinionsLayer = function () {
    cc.log("MinionsLayer")
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

    this.rootNode.onExit = function () {
        this.controller.onExit();
    };
};

MinionsLayer.prototype.onEnter = function () {
}

MinionsLayer.prototype.onUpdate = function () {

}

MinionsLayer.prototype.onExitClicked = function () {
    cc.log("onExitClicked");
}


MinionsLayer.prototype.onExit = function () {
    cc.log("onExit");
}

