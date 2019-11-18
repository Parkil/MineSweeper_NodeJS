/*
 * web url mapping에 따른 실제 동작 정의
 */
var express = require('express');
var router = express.Router();

var gameInfo = require('./gameInfo');
var database = require('./database');

var routerInfo = {};

/*
 * index 호출시  지뢰 찾기 게임이 시작되는 만큼 지뢰찾기 정보 초기화를 여기에서 수행하여야 함 
 */
routerInfo.index = router.get('/', function(req, resp, next) {
    gameInfo.init(9, 9, 10);
    resp.render('board_vue.html', {rowCnt : gameInfo.rowCnt, colCnt : gameInfo.colCnt, mineCnt : gameInfo.totMineCnt});
});

//셀 클릭
routerInfo.clickCell = router.post('/clickCell', function(req, resp, next) {
    var rowIdx = req.body.rowIdx;
    var colIdx = req.body.colIdx;
   
    var chkCon1 = isNaN(parseInt(rowIdx)) ||  isNaN(parseInt(colIdx));
    
    if(chkCon1 === false) {
        rowIdx = parseInt(rowIdx);
        colIdx = parseInt(colIdx);
    }
    
    if(chkCon1 === true || rowIdx > gameInfo.rowCnt-1 || colIdx > gameInfo.colCnt-1) {
        throw new Error('Invalid Parameter');
    }
    
    var cellInfo = gameInfo.cellArr[rowIdx][colIdx];
    cellInfo.setClicked(true); //셀클릭여부를 true로 설정
   
    var respMsg = {};
    if(cellInfo.isMineExists) {
        respMsg.code = '00';
        respMsg.msg = '지뢰를 선택하였습니다. 게임에서 패배하였습니다.';
        respMsg.coords = gameInfo.getAllCellnfo();
    }else {
        respMsg.code = '01';
        respMsg.surMineCnt = cellInfo.surroundMineCnt;
        
        if(cellInfo.surroundMineCnt === 0) {
            gameInfo.findEmptyCells(rowIdx, colIdx, true);
            respMsg.coords = gameInfo.emtpyCellInfo;
        }
    }
    
    resp.send(respMsg);
});

//깃발 처리
routerInfo.setFlag = router.post('/setFlag', function(req, resp, next) {
    var rowIdx = req.body.rowIdx;
    var colIdx = req.body.colIdx;
   
    var chkCon1 = isNaN(parseInt(rowIdx)) ||  isNaN(parseInt(colIdx));
    
    if(chkCon1 === false) {
        rowIdx = parseInt(rowIdx);
        colIdx = parseInt(colIdx);
    }
    
    if(chkCon1 === true || rowIdx > gameInfo.rowCnt-1 || colIdx > gameInfo.colCnt-1) {
        throw new Error('Invalid Parameter');
    }
    
    var cellInfo = gameInfo.cellArr[rowIdx][colIdx];
    
    cellInfo.isFlagged = !cellInfo.isFlagged; //깃발표시여부를 toggle;
    
    var respMsg = {};
    respMsg.curFlagStatus = cellInfo.isFlagged;
    
    resp.send(respMsg);
});

//깃발 처리
routerInfo.saveGame = router.post('/saveGame', function(req, resp, next) {
    database.saveGame(gameInfo);
    
    var respMsg = {};
    respMsg.msg = '게임이 저장됨';
    
    resp.send(respMsg);
});

//깃발 처리
routerInfo.loadGame = router.post('/loadGame', function(req, resp, next) {
    var loadData = database.loadGame();
    
    if(loadData !== null) {
        var rowIdx = 0;
        var colIdx = 0;
        var colCnt = gameInfo.colCnt;
        for(var i=0 ; i<loadData.length; i++) {
            if(i !== 0 && i%colCnt === 0) {
                rowIdx++;
            }
            colIdx = (i%colCnt);
            
            gameInfo.cellArr[rowIdx][colIdx].surroundMineCnt = loadData[i].surroundMineCnt;
            gameInfo.cellArr[rowIdx][colIdx].isMineExists = loadData[i].isMineExists;
            gameInfo.cellArr[rowIdx][colIdx].isFlagged = loadData[i].isFlagged;
            gameInfo.cellArr[rowIdx][colIdx].isClicked = loadData[i].isClicked;
        }
    }

    var respMsg = {};
    respMsg.msg = '게임이 로드됨';
    respMsg.loadData = loadData;
    
    resp.send(respMsg);
});


module.exports = routerInfo;