function Controller() {

    var self = this;
    var myModel;
    var game;

    self.setModel = function (model) {
        myModel = model;
        window.addEventListener('hashchange',myModel.switchToStateFromURLHash);
        window.addEventListener('beforeunload',myModel.beforeUnload);
    };

    function updateMenuControls() {
        var elems = document.getElementsByClassName('elem');
        for (var i = 0; i < elems.length; i++) {
            elems[i].addEventListener('click',myModel.buttonClick);
        }
    }
    
    function updateGameControls() {
        window.addEventListener('keydown',myModel.keyDown);
        window.addEventListener('keyup',myModel.keyUp);
        game = document.getElementById('game');
        game.addEventListener('touchstart',myModel.touchStart);
        game.addEventListener('touchend',myModel.touchEnd);
        game.addEventListener('mousedown',myModel.mouseDown);
        game.addEventListener('mouseup',myModel.mouseUp);
    }

    function updateScoresControls() {
        document.getElementById('back').addEventListener('click',myModel.buttonClick);
    }

    document.addEventListener('updateMenu',updateMenuControls);
    document.addEventListener('updateGame',updateGameControls);
    document.addEventListener('updateScores',updateScoresControls);

}