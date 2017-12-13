window.addEventListener('DOMContentLoaded',start);

function start() {

    var model = new Model;
    var view = new View;
    var controller = new Controller();
    controller.setModel(model);
    model.setView(view);

}