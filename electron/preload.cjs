(function () {
  "use strict";

  if (typeof require !== "undefined") {
    window.require = require;
  }

  if (typeof process !== "undefined") {
    window.process = process;
  }

  try {
    const electron = require("electron");
    if (electron) {
      window.electron = electron;
    }
  } catch (error) {
    console.error("[PRELOAD] Ошибка загрузки electron модуля:", error);
  }
})();
