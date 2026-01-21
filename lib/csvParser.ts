export interface ParsedCSV {
  columns: string[];
  rows: Record<string, any>[];
}

/**
 * Parse CSV file content into structured data
 */
export function parseCSV(csvContent: string): ParsedCSV {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header row
  const columns = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    // Skip empty rows
    if (values.every(v => !v)) continue;
    
    const row: Record<string, any> = {};
    columns.forEach((col, index) => {
      row[col] = values[index] || '';
    });
    rows.push(row);
  }

  return { columns, rows };
}

/**
 * Parse a single CSV line, handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Validate CSV structure
 */
export function validateCSV(parsed: ParsedCSV): { valid: boolean; error?: string } {
  if (parsed.columns.length === 0) {
    return { valid: false, error: 'No columns found in CSV' };
  }

  if (parsed.rows.length === 0) {
    return { valid: false, error: 'No data rows found in CSV' };
  }

  // Check for duplicate column names
  const uniqueColumns = new Set(parsed.columns);
  if (uniqueColumns.size !== parsed.columns.length) {
    return { valid: false, error: 'Duplicate column names found' };
  }

  return { valid: true };
}
