var windowManager = require('electron').remote.require('electron-window-manager');

function startTool() {
     windowManager.get('mainWindow').open();
     windowManager.get('secondWindow').open();
     windowManager.get('infoWindow').close();
}
