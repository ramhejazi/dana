const path = require('path');
const mitra = require('mitra');

mitra.addValidators(path.join(__dirname, 'validators'));
mitra.addAlias('sql_comment', 'type:string,undefined|max_length:64');
mitra.addAlias('sql_fsp', 'number|integer|range:0,6');
mitra.addAlias('sql_precision', 'number|integer|range:0,65');
mitra.addAlias('sql_scale', 'number|integer|range:0,30|max:$precision');
mitra.addAlias('sql_int_display_width', 'number|integer|range:0,255');
