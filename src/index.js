/**
 * @desc this server delivers the frontend's static files
 *       for the webgis & generator of taktische zeichen
 */

'use strict';

/* electron settings */
const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const windowManager = require('electron-window-manager');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let secondWindow;
function createWindow() {
    windowManager.createNew('mainWindow', 'LAGEplan', 'file://' + __dirname + '/public/index.html', null, {
        'width': 1920,
        'height': 1080,
        'icon': __dirname + '/public/images/logo128.png',
        'showDevTools': false,
        'resizable': true
    });
    windowManager.createNew('secondWindow', 'Menü', 'file://' + __dirname + '/public/secondWindow.html', null, {
        'width': 1920,
        'height': 1080,
        'icon': __dirname + '/public/images/logo128.png',
        'showDevTools': false,
        'resizable': true
    });
    windowManager.open('infoWindow', 'Information', 'file://' + __dirname + '/public/info.html', null, {
        'width': 1920,
        'height': 1080,
        'icon': __dirname + '/public/images/logo128.png',
        'showDevTools': false,
        'resizable': true
    });
    // Create the browser window.
    /*
    // Hide the menu bar, but allow it to be brought up by pressing `alt`.
    //mainWindow.setMenuBarVisibility(false);
    //mainWindow.setAutoHideMenuBar(true);

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/public/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
    */
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
/*
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});
*/
/* client code */
// JSON database for Node and the browser powered by lodash API
var low = require('lowdb');
// Parse incoming request bodies in a middleware before your handlers, availabe under the req.body property.
var bodyParser = require('body-parser');
// The Express philosophy is to provide small, robust tooling for HTTP servers, making it a great solution for single page applications, web sites, hybrids, or public HTTP APIs.
var express = require('express'),
    ex = express(),
    server;

const db = low(__dirname + '/fireDatabase.json');
db.defaults({ fireDoc: [] }).value();

//use the extended request body
ex.use(bodyParser.urlencoded({
    extended: true
}));
ex.use(bodyParser.json());

ex.use('/zeichengenerator', express.static(__dirname + '/zeichengenerator/'));
ex.use('/', express.static(__dirname + '/public'));

server = ex.listen(1337, function(err) {
    if (!err) console.log('server listening on port %s', server.address().port);
});

// A new entry is added to the database
ex.post('/api/addEntry', function (req, res) {
    var resAdd = db.get('fireDoc')
        .push(req.body)
        .value();
    if (resAdd) res.send({result: true, metadata: resAdd});
    else res.send({result: false, metadata: resAdd});
});
// An entry is removed.
ex.delete('/api/deleteEntry/:entryId', function (req, res) {
    var entryId = parseInt(req.params.entryId);
    var resDelete = db.get('fireDoc')
        .remove({ id: entryId})
        .value();
    if (resDelete) res.send({result: true, metadata: resDelete});
    else res.send({result: false, metadata: resDelete});
});
// The ID is used to check whether an entry exists
ex.get('/api/getEntry/:entryId', function (req, res) {
    var entryId = parseInt(req.params.entryId);
    var resSearch = db.get('fireDoc')
        .find({ id: entryId})
        .value();
    if (resSearch) res.send({result: true, metadata: resSearch});
    else res.send({result: false, metadata: resSearch});
});
// All entries are returned.
ex.get('/api/getAllEntries', function (req, res) {
    res.send(db.get('fireDoc').value());
});

ex.use(function(req, res, next) {
    console.log('FAILED REQUEST TO %s %s FROM %s', req.method, req.originalUrl, req.ip);
    next();
});