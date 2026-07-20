/**
 * Robust parameter format helper.
 * Replaces '?' placeholders with appropriately formatted or escaped SQL literals,
 * preparing a standardized raw query for PostgreSQL.
 */
export function formatSql(sql: string, params: any[]): string {
  if (!params || params.length === 0) return sql;
  let index = 0;
  return sql.replace(/\?/g, () => {
    if (index >= params.length) return 'NULL';
    const val = params[index++];
    if (val === undefined || val === null) return 'NULL';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'NULL';
      return val.map(v => {
        if (v === undefined || v === null) return 'NULL';
        if (typeof v === 'number') return v.toString();
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        if (v instanceof Date) {
          return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
        }
        return `'${v.toString().replace(/'/g, "''")}'`;
      }).join(', ');
    }
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (val instanceof Date) {
      return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    const escaped = val.toString().replace(/'/g, "''");
    return `'${escaped}'`;
  });
}

/**
 * Automagic SQL dialect conversion router
 */
export function translateSqlToPg(sql: string): string {
  let pgSql = sql.trim();

  // 1. Double quotes for tables, columns and system reserved words in PostgreSQL instead of standard backticks
  pgSql = pgSql.replace(/`desc`/g, '"desc"');
  pgSql = pgSql.replace(/`visible`/g, '"visible"');
  pgSql = pgSql.replace(/`is_approved`/g, '"is_approved"');
  pgSql = pgSql.replace(/`/g, '"');

  // 2. Drop "ENGINE=InnoDB ..." clauses for standard tables
  pgSql = pgSql.replace(/\)\s*ENGINE\s*=\s*InnoDB[^;]*/gi, ')');

  // 3. Convert DATATYPES
  pgSql = pgSql.replace(/\bLONGTEXT\b/gi, 'TEXT');
  pgSql = pgSql.replace(/\bTINYINT\(1\)/gi, 'SMALLINT');
  pgSql = pgSql.replace(/\bTINYINT\b/gi, 'SMALLINT');
  pgSql = pgSql.replace(/\bINT\s+AUTO_INCREMENT\b/gi, 'SERIAL');
  pgSql = pgSql.replace(/\bINT\s+NOT\s+NULL\s+AUTO_INCREMENT\b/gi, 'SERIAL');
  pgSql = pgSql.replace(/\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');

  // 4. LIMIT \d+,\s*\d+ to LIMIT \d+ OFFSET \d+ (Postgres standard)
  pgSql = pgSql.replace(/LIMIT\s+(\d+)\s*,\s*(\d+)/gi, 'LIMIT $2 OFFSET $1');

  // 5. ON DUPLICATE KEY UPDATE transitions to PostgreSQL ON CONFLICT DO UPDATE SET
  if (pgSql.toUpperCase().includes('ON DUPLICATE KEY UPDATE')) {
    const tableNameMatch = pgSql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_"#]+)/i);
    let conflictTarget = 'id';
    if (tableNameMatch) {
      const uTab = tableNameMatch[1].replace(/"/g, '').toLowerCase();
      if (uTab === 'web_interior_layouts') {
        conflictTarget = 'type_id';
      }
    }
    const index = pgSql.toUpperCase().indexOf('ON DUPLICATE KEY UPDATE');
    const insertPart = pgSql.substring(0, index).trim();
    let updatePart = pgSql.substring(index + 'ON DUPLICATE KEY UPDATE'.length).trim();
    updatePart = updatePart.replace(/VALUES\s*\(\s*([^)]+)\s*\)/gi, 'EXCLUDED.$1');
    pgSql = `${insertPart} ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updatePart}`;
  }

  // 6. Handle insert result bindings: Append RETURNING id to INSERT queries
  if (pgSql.toUpperCase().startsWith('INSERT INTO') && !pgSql.toLowerCase().includes('returning')) {
    const tableNameMatch = pgSql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_"#]+)/i);
    if (tableNameMatch) {
      const uTab = tableNameMatch[1].replace(/"/g, '').toLowerCase();
      if (uTab !== 'web_menu_categories' && uTab !== 'web_menu_items' && uTab !== 'web_system_settings' && uTab !== 'store_connections') {
        pgSql = pgSql.trim();
        if (pgSql.endsWith(';')) {
          pgSql = pgSql.substring(0, pgSql.length - 1) + ' RETURNING id;';
        } else {
          pgSql = pgSql + ' RETURNING id';
        }
      }
    }
  }

  // 7. CONCAT('TYPE', id) -> ('TYPE' || id)
  pgSql = pgSql.replace(/CONCAT\(([^,]+)\s*,\s*([^)]+)\)/gi, '($1 || $2)');

  return pgSql;
}
