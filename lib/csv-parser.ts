import Papa from 'papaparse';
import { AdMetrics } from './metrics';

export const REQUIRED_COLUMNS = [
  'adName',
  'impressions',
  'clicks',
  'spend',
  'conversions',
];

export interface ParseResult {
  success: boolean;
  data?: AdMetrics[];
  error?: string;
}

/**
 * Parse CSV file and validate required columns
 */
export function parseCSV(csvContent: string): ParseResult {
  try {
    const parsed = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => results,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing error: ${parsed.errors[0].message}`,
      };
    }

    const rows = parsed.data as Record<string, string>[];

    if (rows.length === 0) {
      return {
        success: false,
        error: 'CSV file is empty',
      };
    }

    // Validate headers
    const firstRow = rows[0];
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !(col in firstRow)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      };
    }

    // Convert and validate data
    const data: AdMetrics[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (Object.values(row).every((val) => !val)) {
        continue;
      }

      try {
        const adMetrics: AdMetrics = {
          adName: String(row.adName).trim(),
          impressions: parseInt(String(row.impressions), 10),
          clicks: parseInt(String(row.clicks), 10),
          spend: parseFloat(String(row.spend)),
          conversions: parseInt(String(row.conversions), 10),
        };

        // Validate values
        if (
          !adMetrics.adName ||
          isNaN(adMetrics.impressions) ||
          isNaN(adMetrics.clicks) ||
          isNaN(adMetrics.spend) ||
          isNaN(adMetrics.conversions)
        ) {
          return {
            success: false,
            error: `Invalid data in row ${i + 2}: all numeric fields must be valid numbers`,
          };
        }

        if (adMetrics.impressions < 0 ||
            adMetrics.clicks < 0 ||
            adMetrics.spend < 0 ||
            adMetrics.conversions < 0) {
          return {
            success: false,
            error: `Invalid data in row ${i + 2}: values cannot be negative`,
          };
        }

        data.push(adMetrics);
      } catch (err) {
        return {
          success: false,
          error: `Error processing row ${i + 2}: ${String(err)}`,
        };
      }
    }

    if (data.length === 0) {
      return {
        success: false,
        error: 'No valid data rows found in CSV',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: `CSV parsing failed: ${String(err)}`,
    };
  }
}
