const datatypes = require('../datatypes');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const datatypesPath = path.join(__dirname, '../../docs/datatypes.md');
const util = require('util');

const toMdList = (items) => {
	return '\n<ul>\n' + items.map(el => {
		return `<li>
	<details>
		<summary><code>${el.__key}</code></summary>
		Defaults:<br>
		<pre>${util.inspect(el.defaults)}</pre>
		Default Generated SQL:<br>
		<pre>${el.generateSQL(el.defaults)}</pre>
	</details>
</li>`;
	}).join('\n') + '\n</ul>\n\n';
};

let desc = `Dana supports nearly all MySQL types.
Each datatype must be defined as an object or a string. \`type\` property of
object definitions should be used for specifying desired datatype.
As an example, for defining a column as \`varchar\` field you can set the column value to
\`{ type: 'varchar' }\` (a plain object) or simply as a string \`'varchar'\`.

In addition to the \`type\` property each datatype object may have several other properties
which represent the MySQL attributes of datatypes. As an example \`nullable\` property specifies
whether column should be \`NULL\` or \`NOT NULL\`.

## Data Types
`;


_(datatypes).groupBy('category').each((group, key) => {
	group = _.groupBy(group, (el) => el.sub_category || 'generic');
	desc += `### ${key} Types`;
	_.each(group, (types, sKey) => {
		if (sKey === 'generic') {
			desc += toMdList(types, 1);
		} else {
			desc += `\n#### ${_.upperFirst(sKey)} Types`;
			desc += toMdList(types, 2);
		}
	});
});

fs.outputFileSync(datatypesPath, desc);
