/*
 *nodejs 지뢰찾기 가동
 */
var express = require('express');
var http = require('http');
var ejs = require('ejs');

var router = express.Router();

var routerInfo = require('./routerInfo');

var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('views', __dirname);

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use('/', routerInfo.index);
app.use('/clickCell', routerInfo.clickCell);
app.use('/setFlag', routerInfo.setFlag);
app.use('/saveGame', routerInfo.saveGame);
app.use('/loadGame', routerInfo.loadGame);
app.use('/static/img', express.static(__dirname + '/img'));

http.createServer(app).listen(8081, function() {
    console.log('Server Started at http://127.0.0.1:8081');
});