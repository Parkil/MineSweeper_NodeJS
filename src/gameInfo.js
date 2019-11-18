/*
 * 지뢰찾기의 설정 정보 및 초기화된 각 셀의 정보 저장
 */

//각셀의 정보를 저장하는 함수
function CellInfo() {
    this.surroundMineCnt = 0;
    this.isMineExists = false;
    this.isFlagged = false;
    this.isClicked = false;
    
    this.retObj = {};
    
    this.setSurroundMineCnt = function(cnt) {
        this.surroundMineCnt = cnt;
    };
    
    this.setMineExists = function(isExists) {
        this.isMineExists = isExists;
    };
    
    this.setClicked = function(flg) {
        this.isClicked = flg;
    };
    
    this.setFlaged = function(flg) {
        this.isFlagged = flg;
    };
    
    this.getInfo = function() {
        this.retObj.surroundMineCnt = this.surroundMineCnt;
        this.retObj.isMineExists = this.isMineExists;
        this.retObj.isClicked = this.isClicked;
        this.retObj.isFlagged = this.isFlagged;
        return this.retObj;
    };
}

var gameInfo = {};

gameInfo.rowCnt = -1; //지뢰찾기 가로 셀 개수
gameInfo.colCnt = -1; //지뢰찾기 세로 셀 개수 
gameInfo.cellArr = null; //지뢰찾기 각 셀의 정보
gameInfo.totMineCnt = -1; //전체 지뢰개수
gameInfo.emtpyCellInfo = {}; //gameInfo.findEmptyCells에서 사용하는 객체

//초기화
gameInfo.init = function(rowCnt, colCnt, totMineCnt) {
    gameInfo.rowCnt = rowCnt;
    gameInfo.colCnt = colCnt;
    gameInfo.totMineCnt = totMineCnt;
    
    gameInfo.createCell();
    gameInfo.setMine();
};

//셀 생성
gameInfo.createCell = function() {
    if(gameInfo.rowCnt === -1 && gameInfo.colCnt === -1) {
        throw new Error('게임정보가 초기화 되지 않았습니다.');
    }
    
    /*
     * 배열을 사용할때 주의할점은 array[i][j]의 i가 y좌표이고 j가 x좌표이니 이에 대해서 혼동하지 말것
     */
    gameInfo.cellArr = new Array(gameInfo.rowCnt);
    for(var i=0 ; i<gameInfo.cellArr.length ; i++) {
        gameInfo.cellArr[i] = new Array(gameInfo.colCnt);
        
        for(var j=0 ; j<gameInfo.cellArr[i].length ; j++) {
            gameInfo.cellArr[i][j] = new CellInfo();
        }
    }
};

//주어진 인자 범위내의 난수값을 반환
gameInfo.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //최대,최소값 전부 포함
};

//해당 좌표가 현재 정의된 배열의 범위안인지 체크(2개의 인자중 1개라도 유효하지 않으면 입력된 좌표를 유효하지 않은것으로 판단)
gameInfo.chkCoords = function(rowIdx, colIdx) {
    if(rowIdx < 0 || colIdx < 0) {
        return false;
    }
    
    if(rowIdx > gameInfo.rowCnt-1 || colIdx > gameInfo.colCnt-1) {
        return false;
    }
    
    return true;
};

//기준 셀 주변셀의 지뢰표시 개수를 1만큼 증가
gameInfo.incSurroundMineCnt = function(baseRowIdx, baseColIdx) {
    for(var row=baseRowIdx-1,rowlen=baseRowIdx+1; row <= rowlen ; row++) {
        for(var col=baseColIdx-1,collen=baseColIdx+1; col <= collen ; col++) {
            if(!gameInfo.chkCoords(row, col)) {
                continue;
            }
            
            var curCnt = gameInfo.cellArr[row][col].getInfo().surroundMineCnt;
            gameInfo.cellArr[row][col].setSurroundMineCnt(curCnt+1);
        }
    }
};

//랜덤으로 셀에 지뢰를 설정
gameInfo.setMine = function() {
    if(gameInfo.cellArr === null || gameInfo.cellArr.length === 0 || gameInfo.totMineCnt < 1) {
        throw new Error('셀 정보가 초기화되지 않았습니다.');
    }
    
    var mineSetCnt = 0;
    
    while(gameInfo.totMineCnt !== mineSetCnt ) {
        var randomRowIdx = gameInfo.getRandomInt(0, gameInfo.rowCnt-1);
        var randomColIdx = gameInfo.getRandomInt(0, gameInfo.colCnt-1);
        
        if(gameInfo.cellArr[randomRowIdx][randomColIdx].getInfo().isMineExists === false) {
            gameInfo.cellArr[randomRowIdx][randomColIdx].setMineExists(true);
            mineSetCnt++;
            
            gameInfo.incSurroundMineCnt(randomRowIdx, randomColIdx); //해당 지뢰주변 셀의 주변지뢰개수 증가
        }
    }
};

//인자로 들어온 좌표를 기준으로 주변에 지뢰가 없는 셀을 검색
gameInfo.findEmptyCells = function(x, y, isFirst) {
    if(isFirst === true) {
        gameInfo.emtpyCellInfo = {};
    }
    for(var i=x-1,lenx=x+1; i<=lenx ; i++) {
        for(var j=y-1,leny=y+1; j<=leny ;j++) {
            if(i === x && j === y) { //클릭 대상 좌표는 제외처리
                continue;
            }
            
            if(i < 0 || i > gameInfo.rowCnt-1 || j < 0 || j > gameInfo.colCnt -1) { //계산된 좌표가 허용범위를 벗어날 경우 제외처리
                continue;
            }
            
            var surroundMineCnt = gameInfo.cellArr[i][j].getInfo().surroundMineCnt;
            var mineExists = gameInfo.cellArr[i][j].getInfo().isMineExists;
            var isClicked = gameInfo.cellArr[i][j].getInfo().isClicked;
            var isFlagged = gameInfo.cellArr[i][j].getInfo().isFlagged;
            
            //해당셀이 클릭되었거나 깃발표시가 되어 있는 셀 또는 지뢰가 있는 셀의 경우 더이상 진행을 하지 않음
            if(isClicked === true || isFlagged === true || mineExists === true) {
                continue;
            }
            
            gameInfo.cellArr[i][j].setClicked(true);
            
            /*
             * 1.해당셀에 지뢰가 있을경우 -> pass
             * 2.surroundMineCnt가 0이 아닌경우 -> emtpyCellInfo에 저장하고 종료
             * 3.surroundMineCnt가 0인 경우 -> emtpyCellInfo에 저장하고 재귀호출
             */
            var cell = {};
            cell.coord = (i * gameInfo.rowCnt) + j; //2차원 배열좌표를 1차원으로 변경
            cell.surroundMineCnt = surroundMineCnt;
            cell.xCo = i;
            cell.yCo = j;
            cell.isMineExists = mineExists;
            
            gameInfo.emtpyCellInfo['cell'+i+j] = cell;
            
            if(surroundMineCnt === 0) {
                gameInfo.findEmptyCells(i, j);
            }
        }
    }
};

//전체 셀의 정보를 반환(게임오버시 사용)
gameInfo.getAllCellnfo = function() {
    var allCellInfo = {};
    for(var i=0,lenx=gameInfo.rowCnt; i<lenx ; i++) {
        for(var j=0,leny=gameInfo.colCnt; j<leny ;j++) {
            var surroundMineCnt = gameInfo.cellArr[i][j].getInfo().surroundMineCnt;
            var mineExists = gameInfo.cellArr[i][j].getInfo().isMineExists;
            var isClicked = gameInfo.cellArr[i][j].getInfo().isClicked;
            var isFlagged = gameInfo.cellArr[i][j].getInfo().isFlagged;
            
            var cell = {};
            cell.coord = (i * gameInfo.rowCnt) + j; //2차원 배열좌표를 1차원으로 변경
            cell.surroundMineCnt = surroundMineCnt;
            cell.xCo = i;
            cell.yCo = j;
            cell.isMineExists = mineExists;
            
            allCellInfo['cell'+i+j] = cell;
        }
    }
    
    return allCellInfo;
};

module.exports = gameInfo;