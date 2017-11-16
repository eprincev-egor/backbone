"use strict";

import View from "./View";
let view = new View();

view.render();
document.body.appendChild( view.el );
window.view = view;
