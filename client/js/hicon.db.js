var hicon = hicon || {};

hicon.db = (function() {
  var self = {};

  self.createDatabase = function() {
    alert('createDatabase');
    var HICONDB = window.sqlitePlugin.openDatabase({ name: 'hicon.db', location: 'default' });

    HICONDB.transaction(function(tx) {

      var tables = [
        'CREATE TABLE IF NOT EXISTS Bluetooth (id, name, PRIMARY KEY ([id]))',
        'CREATE TABLE IF NOT EXISTS Pond (id, name, PRIMARY KEY ([id]))',
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

  try {
    self.createDatabase();
  } catch (e) {
    alert('您的手机不支持sqlite数据库')
  }

  return self;
}());
