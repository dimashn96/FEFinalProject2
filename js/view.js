function View() {

    var updateMenu = new Event('updateMenu');
    var updateGame = new Event('updateGame');
    var updateScores = new Event('updateScores');
    var self = this;
    var main = document.getElementById('main');

    self.update = function (currentState) {

        if (location.hash !== currentState.page.hash) {
            location.hash = currentState.page.hash;
        }

        switch (currentState.page.type) {
            case 'menu':
                loadMenu(currentState.page.menu);
                document.dispatchEvent(updateMenu);
                break;
            case 'game':
                loadGame(currentState.field);
                document.dispatchEvent(updateGame);
                break;
            case 'highscores':
                var menu = document.querySelector('ul');
                if (menu) {
                    menu.parentNode.removeChild(menu);
                }
                var scores = currentState.page.highscores;
                if (Object.keys(scores).length !== 0) {

                    var menu = document.createElement('ul');
                    menu.id = 'menu';

                    for (var key in scores) {
                        var elem = document.createElement('li');
                        elem.innerHTML = key + ' : ' + scores[key];
                        elem.className = 'elem';
                        menu.appendChild(elem);
                    }

                    elem = document.createElement('li');
                    elem.innerHTML = 'BACK';
                    elem.id = 'back';
                    elem.className = 'elem';
                    menu.appendChild(elem);
                    main.appendChild(menu);
                    document.dispatchEvent(updateScores);
                }
                break;
        }

    };

    function loadMenu(hash) {
        if (document.getElementById('controls') && document.getElementById('game') && document.getElementById('info')) {
            document.body.style.backgroundColor = 'black';
            document.getElementById('main').innerHTML = '';
            // console.log('main cleaned');
        }

        if (!document.getElementById('logo')) {
            var mainLogo = document.createElement("div");
            mainLogo.id = 'logo';
            main.appendChild(mainLogo);
            // console.log('Logo load');
        }
        var menu = document.querySelector('ul');
        if (menu) {
            menu.parentNode.removeChild(menu);
        }
        menu = document.createElement('ul');
        menu.id = 'menu';
        for (var i = 0; i < hash.items.length; i++) {
            var elem = document.createElement('li');
            elem.innerHTML = hash.items[i].name;
            elem.className = 'elem';
            elem.id = hash.items[i].id;
            menu.appendChild(elem);
        }
        main.appendChild(menu);
    }
    
    function loadGame(hash) {
        // document.getElementById('main').innerHTML = '';
        if (!document.getElementById('controls') && !document.getElementById('game') && !document.getElementById('info')) {
            ShootSound2();
            ClickSound2();

            document.querySelector('body').style.backgroundColor = 'gray';
            main.innerHTML = '';

            var controls = document.createElement('div');
            controls.id = 'controls';
            main.appendChild(controls);

            var game = document.createElement('div');
            game.id = 'game';
            main.appendChild(game);

            var info = document.createElement('div');
            info.id = 'info';
            info.innerHTML = '<div id="scores">\n' +
                '                    <img src="images/skin11.png">\n' +
                '                    <span id="n1" class="score">0</span>\n' +
                '                    <img src="images/skin21.png">\n' +
                '                    <span id="n2" class="score">0</span>\n' +
                '                </div>';
            main.appendChild(info);

            for (var key in hash.panzers) {
                var elem = document.createElement('div');
                elem.className = 'panzer';
                elem.id = hash.panzers[key].id;
                elem.style.backgroundImage = 'url(' + hash.panzers[key].skin + ')';
                document.getElementById('game').appendChild(elem);
            }

            document.dispatchEvent(updateGame);

        }

        for (var key in hash.panzers) {
            if (document.querySelector('#scores #n1').innerHTML != hash.panzers.panzer1.score) {
                document.querySelector('#scores #n1').innerHTML = hash.panzers.panzer1.score;
            }
            if (document.querySelector('#scores #n2').innerHTML != hash.panzers.panzer2.score) {
                document.querySelector('#scores #n2').innerHTML = hash.panzers.panzer2.score;
            }
            var elem = document.getElementById(hash.panzers[key].id);
            elem.style.left = hash.panzers[key].posX + 'vw';
            elem.style.top = hash.panzers[key].posY + 'vw';
            elem.style.backgroundImage = 'url(' + hash.panzers[key].skin + ')';
            // console.log(hash.panzers[key].boom);
            if (hash.panzers[key].boom) {
                // console.log('boom from view');
                ShootSound1();
                ClickSound1();
                // console.log('shootsound1');
                window.navigator.vibrate(1000);
                if (elem.style.animation === 'twinkle 0.5s 10') {
                    elem.parentNode.removeChild(elem);
                    elem = document.createElement('div');
                    elem.className = 'panzer';
                    elem.id = hash.panzers[key].id;
                    elem.style.backgroundImage = 'url(' + hash.panzers[key].skin + ')';
                    elem.style.animation = 'twinkle 0.5s 10';
                    document.getElementById('game').appendChild(elem);
                } else {
                    elem.style.animation = 'twinkle 0.5s 10';
                }
            }
            switch (hash.panzers[key].route) {
                case 'u':
                    elem.style.transform = 'rotate(0deg)';
                    break;
                case 'r':
                    elem.style.transform = 'rotate(90deg)';
                    break;
                case 'd':
                    elem.style.transform = 'rotate(180deg)';
                    break;
                case 'l':
                    elem.style.transform = 'rotate(270deg)';
                    break;
            }
            // console.log(hash.panzers[key].bullets);
            for (var i = 0; i < hash.panzers[key].bullets.length; i++) {
                // console.log(hash.panzers[key].bullets[i]);
                if ((!document.getElementById('panzer' + hash.panzers[key].id + 'bullet' + i)) && (hash.panzers[key].bullets[i] !== undefined)) {
                    ShootSound();
                    ClickSound();
                     var bullet = document.createElement('div');
                     bullet.id = 'panzer' + hash.panzers[key].id + 'bullet' + i;
                     bullet.className = 'bullet';
                     // console.log(hash.panzers[key].bullets[i]);
                    switch (hash.panzers[key].bullets[i].route) {
                        case 'u':
                            bullet.style.transform = 'rotate(0deg)';
                            break;
                        case 'r':
                            bullet.style.transform = 'rotate(90deg)';
                            break;
                        case 'd':
                            bullet.style.transform = 'rotate(180deg)';
                            break;
                        case 'l':
                            bullet.style.transform = 'rotate(270deg)';
                            break;
                    }
                     document.getElementById('game').appendChild(bullet);
                }
                if (hash.panzers[key].bullets[i] !== undefined) {
                    if (hash.panzers[key].bullets[i].boom) {
                        window.navigator.vibrate(1000);
                        document.getElementById('panzer' + hash.panzers[key].id + 'bullet' + i).parentNode.removeChild(document.getElementById('panzer' + hash.panzers[key].id + 'bullet' + i));
                    } else {
                        var bullet = document.getElementById('panzer' + hash.panzers[key].id + 'bullet' + i);
                        bullet.style.left = hash.panzers[key].bullets[i].posX + 'vw';
                        bullet.style.top = hash.panzers[key].bullets[i].posY + 'vw';
                    }
                }
            }
        }



    }

}