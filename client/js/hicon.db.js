var hicon = hicon || {};

hicon.db = (function() {
  var self = {};
  var HICONDB = window.sqlitePlugin.openDatabase({ name: 'hicon.db', location: 'default' });
  self.createDatabase = function() {

    HICONDB.transaction(function(tx) {
      var tables = [
        'CREATE TABLE IF NOT EXISTS Bluetooth (id, name, PRIMARY KEY ([id]))',
        'CREATE TABLE IF NOT EXISTS Pond (id INTEGER PRIMARY KEY AUTOINCREMENT, code, name, salt)',
        'CREATE TABLE IF NOT EXISTS History (id INTEGER PRIMARY KEY AUTOINCREMENT, code, dateCreated DATETIME, oxygen, water, ph, saturation, hpa)',
      ];

      for (var i = 0, max = tables.length; i < max; i++) {
        tx.executeSql(tables[i]);
      }
    }, function(error) {
      console.log('Transaction ERROR: ' + error.message);
    }, function() {
      console.log('Populated database OK');
    });
  }
  self.getAllPond = function(onSuccess, onFailed) {
    HICONDB.transaction(function(tx) {
      var ponds = [];
      tx.executeSql('SELECT * FROM Pond', [], function(tx, rs) {
        if (rs.rows.length) {
          for (var i = 0, max = rs.rows.length; i < max; i++) {
            var row = rs.rows.item(i);
            console.log(JSON.stringify(row))
            ponds.push(row);
          }
        }
        onSuccess(ponds);
      }, function(tx, error) {
        onFailed(ponds);
      });
    });
  }

  self.searchHistory = function(query, onSuccess, onFailed) {
    HICONDB.transaction(function(tx) {
      var results = [];
      tx.executeSql('SELECT dateCreated, ' + query.field + ' FROM History WHERE code=? AND dateCreated>=? AND dateCreated<=? ORDER BY dateCreated limit 0,300', [query.code, query.start, query.end], function(tx, rs) {
        if (rs.rows.length) {
          for (var i = 0, max = rs.rows.length; i < max; i++) {
            var row = rs.rows.item(i);
            console.log(JSON.stringify(row))
            results.push(row);
          }
        }
        onSuccess(results);
      }, function(tx, error) {
        onFailed(results);
      });
    });
  }

  self.insertPond = function(pond) {
    // console.log(pond)
    HICONDB.transaction(function(tx) {
      tx.executeSql('INSERT INTO Pond VALUES (?,?,?,?)', [null, (pond.code - 0), pond.name, pond.salt]);
    }, function(error) {
      console.log('Transaction ERROR: ' + error.message);
    }, function() {
      console.log('Populated database OK');
    });

    HICONDB.transaction(function(tx) {
      tx.executeSql('SELECT * FROM Pond', [], function(tx, rs) {
        console.log(JSON.stringify(rs.rows.item(0)))
        console.log('Record count (expected to be 2): ' + rs.rows.item(0).id);
      }, function(tx, error) {
        console.log('SELECT error: ' + error.message);
      });
    });
  }

  self.insertHistory = function(history) {
    // code, dateCreated, oxygen, water, ph, saturation, hpa
    HICONDB.transaction(function(tx) {
      tx.executeSql('INSERT INTO History VALUES (?,?,?,?,?,?,?,?)', [null,
        history.code,
        history.dateCreated,
        history.oxygen,
        history.water,
        history.ph,
        history.saturation,
        history.hpa,
      ]);
    }, function(error) {
      console.log('Transaction ERROR: ' + error.message);
    }, function() {
      console.log('Populated database OK');
    });
  }

  self.getPondByCode = function(code, onSuccess, onFailed) {
    HICONDB.transaction(function(tx) {
      var pond = null;
      tx.executeSql('SELECT * FROM Pond where code=?', [code], function(tx, rs) {
        if (rs.rows.length) {
          pond = rs.rows.item(0);
        }
        onSuccess(pond);
      }, function(tx, error) {
        onFailed(pond);
      });
    });
  }

  self.getHistoryByPondCode = function(code, onSuccess, onFailed) {
    HICONDB.transaction(function(tx) {
      var histories = [];
      tx.executeSql('SELECT * FROM History where code=? ORDER BY dateCreated DESC limit 0,200', [code], function(tx, rs) {
        if (rs.rows.length) {
          for (var i = 0, max = rs.rows.length; i < max; i++) {
            var row = rs.rows.item(i);
            histories.push(row);
          }
        }
        onSuccess(histories);
      }, function(tx, error) {
        onFailed(histories);
      });
    });
  }

  try {
    self.createDatabase();
  } catch (e) {
    alert('您的手机不支持sqlite数据库')
  }

  return self;
}());
