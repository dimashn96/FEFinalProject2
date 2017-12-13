var ClickAudio=new Audio("sounds/Shoot.mp3");
var ClickAudio1= new Audio("sounds/Hit.mp3");
var ClickAudio2= new Audio("sounds/loop.mp3");
function ShootSound() {
    ClickAudio.play();
    ClickAudio.pause();
}

function ClickSound() {
    ClickAudio.currentTime=0;
    ClickAudio.play();
}

function ShootSound1() {
    ClickAudio1.play();
    ClickAudio1.pause();
}

function ClickSound1() {
    ClickAudio1.currentTime=0;
    ClickAudio1.play();
}
function ShootSound2() {
    ClickAudio2.play();
    ClickAudio2.pause();
}

function ClickSound2() {
    ClickAudio2.currentTime=0;
    ClickAudio2.play();
}