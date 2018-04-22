## Supported Data Types

Dana supports nearly all MySQL types.
Each datatype must be defined as an object or a string. `type` property of
object definitions should be used for specifying desired datatype.
As an example, for defining a column as `varchar` field you can set the column value to
`{ type: 'varchar' }` (a plain object) or simply as a string `'varchar'`.

In addition to the `type` property each datatype object may have several other properties
which represent the MySQL attributes of datatypes. As an example `nullable` property specifies
whether column should be `NULL` or `NOT NULL`.

### String Types
<ul>
<li>
	<details>
		<summary><code>varchar</code></summary>
		Defaults:<br>
		<pre>{ type: 'varchar',
  length: 255,
  default: undefined,
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>VARCHAR(255)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>char</code></summary>
		Defaults:<br>
		<pre>{ type: 'char',
  length: 1,
  default: undefined,
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>CHAR(1)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>varbinary</code></summary>
		Defaults:<br>
		<pre>{ type: 'varbinary',
  length: 1,
  default: undefined,
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>VARBINARY(1)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>binary</code></summary>
		Defaults:<br>
		<pre>{ type: 'binary',
  length: 1,
  default: undefined,
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>BINARY(1)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>text</code></summary>
		Defaults:<br>
		<pre>{ type: 'text',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TEXT</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>tinytext</code></summary>
		Defaults:<br>
		<pre>{ type: 'tinytext',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TINYTEXT</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>mediumtext</code></summary>
		Defaults:<br>
		<pre>{ type: 'mediumtext',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>MEDIUMTEXT</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>longtext</code></summary>
		Defaults:<br>
		<pre>{ type: 'longtext',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>LONGTEXT</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>blob</code></summary>
		Defaults:<br>
		<pre>{ type: 'blob',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>BLOB</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>tinyblob</code></summary>
		Defaults:<br>
		<pre>{ type: 'tinyblob',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TINYBLOB</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>mediumblob</code></summary>
		Defaults:<br>
		<pre>{ type: 'mediumblob',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>MEDIUMBLOB</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>longblob</code></summary>
		Defaults:<br>
		<pre>{ type: 'longblob',
  nullable: true,
  collate: undefined,
  charset: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>LONGBLOB</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>enum</code></summary>
		Defaults:<br>
		<pre>{ type: 'enum',
  nullable: true,
  default: undefined,
  collate: undefined,
  charset: undefined,
  comment: undefined,
  options: [] }</pre>
		Default Generated SQL:<br>
		<pre>ENUM()</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>set</code></summary>
		Defaults:<br>
		<pre>{ type: 'set',
  nullable: true,
  default: undefined,
  collate: undefined,
  charset: undefined,
  comment: undefined,
  options: [] }</pre>
		Default Generated SQL:<br>
		<pre>SET()</pre>
	</details>
</li>
</ul>

### numeric Types
#### Integer Types
<ul>
<li>
	<details>
		<summary><code>int</code></summary>
		Defaults:<br>
		<pre>{ type: 'int',
  width: 11,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>INT(11)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>integer</code></summary>
		Defaults:<br>
		<pre>{ type: 'integer',
  width: 11,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>INTEGER(11)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>tinyint</code></summary>
		Defaults:<br>
		<pre>{ type: 'tinyint',
  width: 3,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TINYINT(3)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>smallint</code></summary>
		Defaults:<br>
		<pre>{ type: 'smallint',
  width: 6,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>SMALLINT(6)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>mediumint</code></summary>
		Defaults:<br>
		<pre>{ type: 'mediumint',
  width: 9,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>MEDIUMINT(9)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>bigint</code></summary>
		Defaults:<br>
		<pre>{ type: 'bigint',
  width: 20,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>BIGINT(20)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>boolean</code></summary>
		Defaults:<br>
		<pre>{ type: 'tinyint',
  width: 1,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TINYINT(1)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>bool</code></summary>
		Defaults:<br>
		<pre>{ type: 'tinyint',
  width: 1,
  default: undefined,
  nullable: true,
  unsigned: false,
  zerofill: false,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>TINYINT(1)</pre>
	</details>
</li>
</ul>


#### Bit Types
<ul>
<li>
	<details>
		<summary><code>bit</code></summary>
		Defaults:<br>
		<pre>{ type: 'bit',
  length: 1,
  nullable: true,
  default: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>BIT(1)</pre>
	</details>
</li>
</ul>


#### Fixed-Point Types
<ul>
<li>
	<details>
		<summary><code>dec</code></summary>
		Defaults:<br>
		<pre>{ precision: 10,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'dec' }</pre>
		Default Generated SQL:<br>
		<pre>DEC(10, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>decimal</code></summary>
		Defaults:<br>
		<pre>{ precision: 10,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'decimal' }</pre>
		Default Generated SQL:<br>
		<pre>DECIMAL(10, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>fixed</code></summary>
		Defaults:<br>
		<pre>{ precision: 10,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'fixed' }</pre>
		Default Generated SQL:<br>
		<pre>FIXED(10, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>numeric</code></summary>
		Defaults:<br>
		<pre>{ precision: 10,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'numeric' }</pre>
		Default Generated SQL:<br>
		<pre>NUMERIC(10, 0)</pre>
	</details>
</li>
</ul>


#### Floating-Point Types
<ul>
<li>
	<details>
		<summary><code>float</code></summary>
		Defaults:<br>
		<pre>{ precision: 12,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'float' }</pre>
		Default Generated SQL:<br>
		<pre>FLOAT(12, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>double</code></summary>
		Defaults:<br>
		<pre>{ precision: 22,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'double' }</pre>
		Default Generated SQL:<br>
		<pre>DOUBLE(22, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>real</code></summary>
		Defaults:<br>
		<pre>{ precision: 22,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'real' }</pre>
		Default Generated SQL:<br>
		<pre>REAL(22, 0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>double precision</code></summary>
		Defaults:<br>
		<pre>{ precision: 22,
  scale: 0,
  unsigned: false,
  zerofill: false,
  nullable: true,
  default: undefined,
  comment: undefined,
  type: 'double precision' }</pre>
		Default Generated SQL:<br>
		<pre>DOUBLE PRECISION(22, 0)</pre>
	</details>
</li>
</ul>

### Date and Time Types
<ul>
<li>
	<details>
		<summary><code>date</code></summary>
		Defaults:<br>
		<pre>{ type: 'date',
  nullable: true,
  default: undefined,
  comment: undefined }</pre>
		Default Generated SQL:<br>
		<pre>DATE</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>time</code></summary>
		Defaults:<br>
		<pre>{ type: 'time',
  nullable: true,
  comment: undefined,
  default: undefined,
  fsp: 0 }</pre>
		Default Generated SQL:<br>
		<pre>TIME(0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>datetime</code></summary>
		Defaults:<br>
		<pre>{ type: 'datetime',
  default: undefined,
  on_update: undefined,
  nullable: true,
  comment: undefined,
  fsp: 0 }</pre>
		Default Generated SQL:<br>
		<pre>DATETIME(0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>timestamp</code></summary>
		Defaults:<br>
		<pre>{ type: 'timestamp',
  default: undefined,
  on_update: undefined,
  nullable: true,
  comment: undefined,
  fsp: 0 }</pre>
		Default Generated SQL:<br>
		<pre>TIMESTAMP(0)</pre>
	</details>
</li>
<li>
	<details>
		<summary><code>year</code></summary>
		Defaults:<br>
		<pre>{ type: 'year',
  nullable: true,
  comment: undefined,
  default: undefined }</pre>
		Default Generated SQL:<br>
		<pre>YEAR</pre>
	</details>
</li>
</ul>

