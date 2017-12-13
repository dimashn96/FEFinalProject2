function Model() {

    var self = this;
    var anim;
    var menu;
    var myView;
    var currentState = {
        'page': {
            'id':'',
            'type':'',
            'menu':{},
            'game':{},
            'highscores':{},
            'hash':''
        }
    };
    var panzer;
    var socket = new WebSocket("ws://localhost:8081");
    socket.onmessage = function(EO) {
        var receivedPanzer = JSON.parse(EO.data);
        var currentPanzer;
        if (receivedPanzer.network === 'host') {
            currentPanzer = currentState.field.panzers.panzer1;
        } else if (receivedPanzer.network === 'client') {
            currentPanzer = currentState.field.panzers.panzer2;
        }
        if ('speed' in receivedPanzer) {
            currentPanzer.speed = receivedPanzer.speed;
        }
        if ('route' in receivedPanzer) {
            currentPanzer.route = receivedPanzer.route;
        }
        if ('posX' in receivedPanzer) {
            currentPanzer.posX = receivedPanzer.posX;
        }
        if ('posY' in receivedPanzer) {
            currentPanzer.posY = receivedPanzer.posY;
        }
        if ('bullet' in receivedPanzer) {
            currentPanzer.bullets.push(receivedPanzer.bullet);
            // console.log(currentPanzer);
        }
    };

    self.switchToStateFromURLHash = function () {

        currentState.page.hash = window.location.hash;

        var stateStr = currentState.page.hash.substr(1);

        if ( stateStr !== '' )
        {
            var stateStrParts = stateStr.split('&');
            currentState.page.type = stateStrParts[0];

            if (currentState.page.type !== 'game') {
                currentState.page.id = stateStrParts[1];
            } else {
                currentState.page.id = 'game';
            }

            switch (stateStrParts[0]) {
                case 'menu':
                    switch (stateStrParts[1]) {
                        case 'back':
                            window.history.go(-2);
                            break;
                        case '1player':
                            loadGame('1player');
                            break;
                        case '1contra1':
                            loadGame('1contra1');
                            break;
                        case 'findsession':
                            loadGame('findsession');
                            break;
                        case 'highscores':
                            loadHighScores();
                            break;
                        default:
                            var id = stateStrParts[1];
                            currentState.page.menu = getSubmenuById(menu,id);
                    }
                    break;
                case 'game':

                    break;
            }
        }
        else {
            cancelAnimationFrame(anim);
            currentState.page.type = 'menu';
            currentState.page.menu = menu;
        }
        myView.update(currentState);

    };
    
    function loadHighScores() {
        currentState.page.menu = '';
        currentState.page.type = 'highscores';
        // console.log('load highscores from model');
        $.ajax(
            {
                url : 'json/highscores.json', type : 'POST', cache : false, dataType:'json',
                data : {},
                success : readReady2, error : errorHandler
            }
        );
        function readReady2(result) {
            currentState.page.highscores = result;
            myView.update(currentState);
        }
    }

    function getSubmenuById(submenu,id) {

        for (var i = 0; i < submenu.items.length; i++) {

            if (submenu.items[i].id === id) {
                // console.log(submenu.items[i].items);
                return submenu.items[i];
            } else {
                if (submenu.items[i].items !== '') {
                    return getSubmenuById(submenu.items[i],id);
                }
            }
        }
    }

    $.ajax(
        {
            url : 'json/menu.json', type : 'POST', cache : false, dataType:'json',
            data : {},
            success : readReady, error : errorHandler
        }
    );

    function readReady(result){
        menu = result;
        currentState.page.type = 'menu';
        currentState.page.menu = menu;
        myView.update(currentState);
    }

    function errorHandler() {
        console.log('Error downloading .json');
    }

    self.buttonClick = function () {
        if (location.hash === '#menu&highscores' && this.id === 'back') {
            console.log('=');
            currentState.page.type = 'menu';
            currentState.page.menu = menu;
            currentState.page.hash = '';
        } else {
            currentState.page.hash = currentState.page.type + '&' + this.id;
        }
        myView.update(currentState);
    };

    self.setView = function (view) {
        myView = view;
    };
    
    self.beforeUnload = function (EO) {
        EO = EO || window.event;
        EO.returnValue = '';
    };

    function loadGame(gameType) {

        switch (gameType) {
            case '1contra1':
                currentState.page.game.type = gameType;
                currentState.page.game.network = 'host';
                // console.log(currentState);
                break;
            case 'findsession':
                currentState.page.game.type = '1contra1';
                currentState.page.game.network = 'client';
                // console.log(currentState);
                break;
        }

        currentState.page.menu = '';
        currentState.page.type = 'game';
        currentState.page.hash = 'game';
        currentState.field = new Field();

        if (currentState.page.game.network === 'host') {
            panzer = currentState.field.panzers.panzer1;
        } else if (currentState.page.game.network === 'client') {
            panzer = currentState.field.panzers.panzer2;
        }

        var stateObj = { foo: "bar" };
        history.pushState(stateObj, "page 2", "index.html#");

        tick();

    }

    function sendScores() {
        var scores = {
            "panzer1":currentState.field.panzers.panzer1.score,
            "panzer2":currentState.field.panzers.panzer2.score
        };
        socket.send('scores'+JSON.stringify(scores));
    }

    function tick() {
        // console.log(currentState.field.panzers.panzer1.speed);
        var panzers = currentState.field.panzers;
        for (var key in panzers) {
            // console.log(key + ':' + panzers[key].score);
            var anotherPanzer = {};
            if (key === 'panzer1') {
                anotherPanzer = currentState.field.panzers.panzer2;
            } else if (key === 'panzer2') {
                anotherPanzer = currentState.field.panzers.panzer1;
            }

            if (panzers[key].boom) {
                panzers[key].posY = 35;
                panzers[key].speed = 0;
                panzers[key].route = 'u';
                if (key === 'panzer1') {
                    panzers[key].posX = 20;
                    anotherPanzer.score++;
                    sendScores();
                    boomFalse();
                } else if (key === 'panzer2') {
                    panzers[key].posX = 65;
                    anotherPanzer.score++;
                    sendScores();
                    setTimeout(boomFalse,10);
                }

                function boomFalse() {
                    panzers[key].boom = false;
                }
            }

            if (panzers[key].speed !== 0) {
            switch (panzers[key].route) {
                case 'u':
                    if (panzers[key].posX > anotherPanzer.posX - 5 && panzers[key].posX < anotherPanzer.posX + 5 && panzers[key].posY > anotherPanzer.posY - 5 && panzers[key].posY < anotherPanzer.posY + 5) {
                        panzers[key].posY = anotherPanzer.posY + 5;
                    } else
                    if (panzers[key].posY <= 0) {
                        panzers[key].posY = 0;
                    } else {
                        panzers[key].posY -= panzers[key].speed;
                    }
                    break;
                case 'r':
                    if (panzers[key].posX < anotherPanzer.posX + 5 && panzers[key].posX > anotherPanzer.posX - 5 && panzers[key].posY > anotherPanzer.posY - 5 && panzers[key].posY < anotherPanzer.posY + 5) {
                        panzers[key].posX = anotherPanzer.posX - 5;
                    } else if (panzers[key].posX >= 85) {
                        panzers[key].posX = 85;
                    } else {
                        panzers[key].posX += panzers[key].speed;
                    }
                    break;
                case 'd':
                    if (panzers[key].posX > anotherPanzer.posX - 5 && panzers[key].posX < anotherPanzer.posX + 5 && panzers[key].posY > anotherPanzer.posY - 5 && panzers[key].posY < anotherPanzer.posY) {
                        panzers[key].posY = anotherPanzer.posY - 5;
                    } else
                        if (panzers[key].posY >= 40) {
                        panzers[key].posY = 40;
                    } else {
                        panzers[key].posY += panzers[key].speed;
                    }
                    break;
                case 'l':
                    if (panzers[key].posX < anotherPanzer.posX + 5 && panzers[key].posX > anotherPanzer.posX - 5 && panzers[key].posY > anotherPanzer.posY - 5 && panzers[key].posY < anotherPanzer.posY + 5) {
                        panzers[key].posX = anotherPanzer.posX + 5;
                    } else if (panzers[key].posX <= 0) {
                        panzers[key].posX = 0;
                    } else {
                        panzers[key].posX -= panzers[key].speed;
                    }
                    break;
            }
            }
            if (panzers[key].speed !== 0) {
                if (panzers[key].frameMeter > 3) {
                    if (panzers[key].skin === 'images/skin' + panzers[key].id + '1.png') {
                        panzers[key].skin = 'images/skin' + panzers[key].id + '2.png';
                    } else if (panzers[key].skin = 'images/skin' + panzers[key].id + '2.png') {
                        panzers[key].skin = 'images/skin' + panzers[key].id + '1.png';
                    }
                    panzers[key].frameMeter = 0;
                } else {
                    panzers[key].frameMeter++;
                }
            }
            for (var i = 0; i < panzers[key].bullets.length; i++) {
                if (panzers[key].bullets[i] !== undefined) {
                    if (panzers[key].bullets[i].boom) {
                        delete panzers[key].bullets[i];
                    } else {
                        switch (panzers[key].bullets[i].route) {
                            case 'u':
                                if (panzers[key].bullets[i].posY <= anotherPanzer.posY + 5 && panzers[key].bullets[i].posY > anotherPanzer.posY && panzers[key].bullets[i].posX > anotherPanzer.posX - 5 && panzers[key].bullets[i].posX < anotherPanzer.posX + 5) {
                                    anotherPanzer.boom = true;
                                    panzers[key].bullets[i].boom = true;
                                }
                                if (panzers[key].bullets[i].posY <= 0.5) {
                                    panzers[key].bullets[i].posY = 0.5;
                                    panzers[key].bullets[i].boom = true;
                                } else {
                                    panzers[key].bullets[i].posY -= panzers[key].bullets[i].speed;
                                }
                                break;
                            case 'r':
                                if (panzers[key].bullets[i].posX >= anotherPanzer.posX && panzers[key].bullets[i].posX < anotherPanzer.posX + 5 && panzers[key].bullets[i].posY > anotherPanzer.posY && panzers[key].bullets[i].posY < anotherPanzer.posY + 5) {
                                    anotherPanzer.boom = true;
                                    panzers[key].bullets[i].boom = true;
                                }
                                    if (panzers[key].bullets[i].posX >= 88.5) {
                                    panzers[key].bullets[i].posX = 88.5;
                                    panzers[key].bullets[i].boom = true;
                                } else {
                                    panzers[key].bullets[i].posX += panzers[key].bullets[i].speed;
                                }
                                break;
                            case 'd':
                                if (panzers[key].bullets[i].posY <= anotherPanzer.posY + 5 && panzers[key].bullets[i].posY > anotherPanzer.posY && panzers[key].bullets[i].posX > anotherPanzer.posX - 5 && panzers[key].bullets[i].posX < anotherPanzer.posX + 5) {
                                    anotherPanzer.boom = true;
                                    panzers[key].bullets[i].boom = true;
                                }
                                    if (panzers[key].bullets[i].posY >= 43.5) {
                                    panzers[key].bullets[i].posY = 43.5;
                                    panzers[key].bullets[i].boom = true;
                                } else {
                                    panzers[key].bullets[i].posY += panzers[key].bullets[i].speed;
                                }
                                break;
                            case 'l':
                                if (panzers[key].bullets[i].posX <= anotherPanzer.posX + 5 && panzers[key].bullets[i].posX > anotherPanzer.posX && panzers[key].bullets[i].posY > anotherPanzer.posY - 5 && panzers[key].bullets[i].posY < anotherPanzer.posY + 5) {
                                    anotherPanzer.boom = true;
                                    panzers[key].bullets[i].boom = true;
                                }
                                    if (panzers[key].bullets[i].posX <= 0.5) {
                                    panzers[key].bullets[i].posX = 0.5;
                                    panzers[key].bullets[i].boom = true;
                                } else {
                                    panzers[key].bullets[i].posX -= panzers[key].bullets[i].speed;
                                }
                                break;
                        }
                    }
                }
            }
        }
        myView.update(currentState);
        anim = requestAnimationFrame(tick);
    }

    self.keyDown = function (EO) {
        EO = EO || window.event;
        EO.preventDefault();
        var sendPanzer = {};
        switch (EO.keyCode) {
            case 32:
                if (panzer.route !== '') {
                    sendPanzer.bullet = new Bullet();
                    switch (panzer.route) {
                        case 'u':
                            sendPanzer.bullet.posX = panzer.posX + 2;
                            sendPanzer.bullet.posY = panzer.posY;
                            break;
                        case 'r':
                            sendPanzer.bullet.posX = panzer.posX + 5;
                            sendPanzer.bullet.posY = panzer.posY + 2;
                            break;
                        case 'd':
                            sendPanzer.bullet.posX = panzer.posX + 2;
                            sendPanzer.bullet.posY = panzer.posY + 5;
                            break;
                        case 'l':
                            sendPanzer.bullet.posX = panzer.posX;
                            sendPanzer.bullet.posY = panzer.posY + 2;
                            break;
                    }
                    sendPanzer.bullet.route = panzer.route;
                }
                break;
            case 37:
                sendPanzer.speed = 0.2;
                sendPanzer.route = 'l';
                break;
            case 38:
                sendPanzer.speed = 0.2;
                sendPanzer.route = 'u';
                break;
            case 39:
                sendPanzer.speed = 0.2;
                sendPanzer.route = 'r';
                break;
            case 40:
                sendPanzer.speed = 0.2;
                sendPanzer.route = 'd';
                break;
        }
        sendPanzer.network = currentState.page.game.network;
        socket.send(JSON.stringify(sendPanzer));
    };

    self.keyUp = function (EO) {
        EO = EO || window.event;
        EO.preventDefault();
        var sendPanzer = {};
        switch (EO.keyCode) {
            case 37:
                sendPanzer.speed = 0;
                break;
            case 38:
                sendPanzer.speed = 0;
                break;
            case 39:
                sendPanzer.speed = 0;
                break;
            case 40:
                sendPanzer.speed = 0;
                break;
        }
        sendPanzer.network = currentState.page.game.network;
        socket.send(JSON.stringify(sendPanzer));
    };

    var initialPoint;
    var finalPoint;
    var ldelay;
    var betw={};

    self.touchStart = function (EO) {
        EO = EO || window.event;
        EO.preventDefault();
        EO.stopPropagation();
        initialPoint = EO.changedTouches[0];
        ldelay = new Date();
        betw.x = EO.changedTouches[0].pageX;
        betw.y = EO.changedTouches[0].pageY;

    };

    self.touchEnd = function (EO) {
        EO = EO || window.event;
        EO.preventDefault();
        EO.stopPropagation();
        var sendPanzer = {};
        finalPoint = EO.changedTouches[0];
        var xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
        var yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
        if (xAbs > 20 || yAbs > 20) {
            if (xAbs > yAbs) {
                if (finalPoint.pageX < initialPoint.pageX){
                    // console.log('left swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'l';
                }
                else{
                    // console.log('right swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'r';
                }
            }
            else {
                if (finalPoint.pageY < initialPoint.pageY){
                    // console.log('up swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'u';
                }
                else{
                    // console.log('down swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'd';
                }
            }
        } else {

        var pdelay = new Date();
        if(EO.changedTouches[0].pageX === betw.x &&
            EO.changedTouches[0].pageY === betw.y &&
            (pdelay.getTime() - ldelay.getTime()) > 1000){
            sendPanzer.speed = 0;
        } else {
            // console.log('tap');
            if (panzer.route !== '') {
                sendPanzer.bullet = new Bullet();
                switch (panzer.route) {
                    case 'u':
                        sendPanzer.bullet.posX = panzer.posX + 2;
                        sendPanzer.bullet.posY = panzer.posY;
                        break;
                    case 'r':
                        sendPanzer.bullet.posX = panzer.posX + 5;
                        sendPanzer.bullet.posY = panzer.posY + 2;
                        break;
                    case 'd':
                        sendPanzer.bullet.posX = panzer.posX + 2;
                        sendPanzer.bullet.posY = panzer.posY + 5;
                        break;
                    case 'l':
                        sendPanzer.bullet.posX = panzer.posX;
                        sendPanzer.bullet.posY = panzer.posY + 2;
                        break;
                }
                sendPanzer.bullet.route = panzer.route;
            }
        }

        }

        sendPanzer.network = currentState.page.game.network;
        socket.send(JSON.stringify(sendPanzer));

    };

    self.mouseDown = function (EO) {
        EO = EO || window.event;
        EO.preventDefault();
        EO.stopPropagation();
        initialPoint = EO;
        ldelay = new Date();
        betw.x = EO.pageX;
        betw.y = EO.pageY;

    };

    self.mouseUp = function (EO) {
        EO = EO || window.event;
        var sendPanzer = {};
        EO.preventDefault();
        EO.stopPropagation();
        finalPoint = EO;
        var xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
        var yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
        if (xAbs > 20 || yAbs > 20) {
            if (xAbs > yAbs) {
                if (finalPoint.pageX < initialPoint.pageX){
                    // console.log('left swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'l';
                }
                else{
                    // console.log('right swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'r';
                }
            }
            else {
                if (finalPoint.pageY < initialPoint.pageY){
                    // console.log('up swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'u';
                }
                else{
                    // console.log('down swipe');
                    sendPanzer.speed = 0.2;
                    sendPanzer.route = 'd';
                }
            }
        } else {

            var pdelay = new Date();
            if(EO.pageX === betw.x &&
                EO.pageY === betw.y &&
                (pdelay.getTime() - ldelay.getTime()) > 500){
                // console.log('long tap');
                sendPanzer.speed = 0;
            } else {
                // console.log('tap');
                if (panzer.route !== '') {
                    sendPanzer.bullet = new Bullet();
                    switch (panzer.route) {
                        case 'u':
                            sendPanzer.bullet.posX = panzer.posX + 2;
                            sendPanzer.bullet.posY = panzer.posY;
                            break;
                        case 'r':
                            sendPanzer.bullet.posX = panzer.posX + 5;
                            sendPanzer.bullet.posY = panzer.posY + 2;
                            break;
                        case 'd':
                            sendPanzer.bullet.posX = panzer.posX + 2;
                            sendPanzer.bullet.posY = panzer.posY + 5;
                            break;
                        case 'l':
                            sendPanzer.bullet.posX = panzer.posX;
                            sendPanzer.bullet.posY = panzer.posY + 2;
                            break;
                    }
                    sendPanzer.bullet.route = panzer.route;
                }
            }

        }
        sendPanzer.network = currentState.page.game.network;
        socket.send(JSON.stringify(sendPanzer));
    };

}

function Field() {

    var self = this;

    self.panzers = {
        panzer1:{
            id:1,
            skin:'images/skin11.png',
            route:'',
            speed:0,
            posX:20,
            posY:35,
            frameMeter:0,
            bullets: [],
            boom: false,
            score:0
        },
        panzer2:{
            id:2,
            skin:'images/skin21.png',
            route:'',
            speed:0,
            posX:65,
            posY:35,
            frameMeter:0,
            bullets: [],
            boom: false,
            score:0
        }
    }

}

function Bullet() {

        var self = this;

        self.speed = 0.5;
        self.posX = 0;
        self.posY = 0;
        self.route = '';
        self.boom = false;

}