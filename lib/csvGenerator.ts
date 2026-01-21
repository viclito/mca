/**
 * Convert table data to CSV format
 */
export function generateCSV(columns: string[], rows: Record<string, any>[]): string {
  // Create header row
  const header = columns.map(col => escapeCSVField(col)).join(',');
  
  // Create data rows
  const dataRows = rows.map(row => {
    return columns.map(col => {
      const value = row[col] != null ? String(row[col]) : '';
      return escapeCSVField(value);
    }).join(',');
  });

  return [header, ...dataRows].join('\n');
}

/**
 * Escape a CSV field value
 * - Wrap in quotes if it contains comma, newline, or quote
 * - Escape quotes by doubling them
 */
function escapeCSVField(value: string): string {
  // Check if field needs quoting
  const needsQuotes = value.includes(',') || value.includes('\n') || value.includes('"') || value.includes('\r');
  
  if (needsQuotes) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return value;
}

/**
 * Trigger CSV file download in browser
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
