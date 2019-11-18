/**
 * http://usejsdoc.org/
 */

var database = {};

(function(obj) {
    var low = require('lowdb');
    var FileSync = require('lowdb/adapters/FileSync');
    
    var adapter = new FileSync('data.json');
    var db = low(adapter);
    
    obj.saveGame = function(gameInfo) {
        if(typeof db.get('saveData').value() === 'undefined') { //DB저장소가 존재하지 않을 경우 새로 저장소를 생성
            db.defaults({ saveData: [] }).write(); //db.defaults를 통해서 생성된 객체의 수정내용만 파일에 저장된다.
        }
        
        db.get('saveData').remove().write(); //기존에 저장된 세이브데이터 삭제
        for(var i=0 ; i<gameInfo.rowCnt ; i++) {
            for(var j=0 ; j<gameInfo.colCnt ; j++) {
                var cellInfo = gameInfo.cellArr[i][j];
                //var curIdx = (parseInt(i)  * gameInfo.rowCnt) + parseInt(j);
                
                db.get('saveData').push(cellInfo.getInfo()).write(); //db.defaults로 선언된 객체에 대한 조작내용은 파일에 저장된다.
            }
        }
    };
    
    obj.loadGame = function() {
        if(typeof db.get('saveData').value() === 'undefined') { //DB저장소가 존재하지 않을 경우
            return null;
        }
        
        return db.get('saveData').value();
    };
    
    obj.test = function() {
        
    };
})(database);

module.exports = database;