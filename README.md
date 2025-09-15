# Master ID Search & PDF/XML Generator with Duplicate Detection & MPI Filtering

A web application that searches for Master IDs in a JSON database and generates downloadable PDF reports and individual XML files with detailed product information. Features both single Master ID lookup and bulk CSV/Excel file processing with automatic grouping by paper type, alphabetical sorting by Master ID, automatic work date extraction from CSV data, **duplicate Master ID detection with quantity consolidation**, **MPI status filtering**, and clean user interface with automatic status message management.

## Overview

This application allows users to quickly lookup individual Master IDs or upload CSV/Excel files containing multiple Master IDs, automatically searches for matches in a JSON database, **detects and consolidates duplicate Master Order IDs by summing their quantities**, **filters results by MPI status**, and generates professional PDF reports grouped by paper type with Master IDs sorted alphabetically within each group, or individual XML files named by ISBN. The work date is automatically extracted from the CSV file, and missing Master IDs are clearly identified in both the interface and output files.

## Key Features

- **Single Master ID Lookup**: Instant search with on-screen results display
- **Bulk CSV/Excel Processing**: Upload CSV (.csv) or Excel (.xlsx, .xls) files with Master IDs in column D, quantities in column B, and work dates in column C
- **🆕 Duplicate Detection & Consolidation**: Automatically detects duplicate Master Order IDs and sums their quantities
- **🆕 MPI Status Filtering**: Toggle to show only items with "MPI" status vs "Pod Ready" status
- **Automatic JSON Database Loading**: Loads `data.json` automatically from the same directory
- **File Upload Support**: Drag & drop or click to upload CSV and Excel files
- **Intelligent Sorting**: Results grouped by paper type with Master IDs sorted alphabetically within each group
- **Automatic Work Date Extraction**: Work date automatically extracted from column C of CSV file
- **Dual Export Options**:
  - **PDF Reports**: Clean, professional layout grouped by paper type with MPI filtering support
  - **XML Files**: Individual XML files per item, named by ISBN for automated processing
- **Missing ID Tracking**: Identifies and reports Master IDs not found in database
- **Complete Audit Trail**: Both PDF and XML exports include comprehensive data with duplicate indicators
- **Clean Interface**: Minimal, professional design with automatic status message cleanup
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Individual Item Management**: Delete specific items or entire paper type sections

## MPI Filtering Features

### Toggle Interface
- **MPI Only Switch**: Prominent toggle in the results header to filter by status
- **Visual Indicators**: MPI items highlighted with yellow background and warning badges
- **Real-time Filtering**: Instant results updating when toggling filter on/off

### Status Management
- **Two Status Types**: "MPI" and "Pod Ready" status detection
- **Filter Statistics**: Shows count of MPI items vs total items when filtered
- **Hidden Item Count**: Displays how many Pod Ready items are hidden when MPI filter is active

### Export Integration
- **Filtered PDF Downloads**: When MPI filter is active, PDF contains only MPI items with "(MPI Only)" in title
- **Filtered XML Downloads**: XML exports respect filter state and include only visible items
- **Filename Prefixes**: Filtered exports get "MPI_" prefix in filenames for easy identification
- **Clean PDF Layout**: Streamlined format without filter annotations in document body

## Duplicate Detection Features

### Automatic Consolidation
- **Smart Detection**: Identifies when the same Master Order ID appears multiple times in uploaded data
- **Quantity Summation**: Automatically adds up quantities from all duplicate entries
- **Case-Insensitive Matching**: Handles variations in capitalization
- **Comprehensive Logging**: Detailed console output showing consolidation process

### Visual Indicators
- **Interface Highlighting**: Consolidated items show with light blue background in results table
- **Stack Icons**: Visual indicators next to quantities that were consolidated
- **Tooltip Information**: Hover over icons to see consolidation details
- **Summary Statistics**: Clear display of total entries vs unique Master Order IDs

### Export Integration
- **PDF Asterisk Notation**: Consolidated quantities marked with asterisk (*) and footnote explanation
- **XML Flags**: Individual XML files include `<ConsolidatedQuantity>` field (true/false)
- **Audit Trail**: Complete tracking of duplicate consolidation in both formats

## File Structure

```
project-folder/
├── index.html              # Main HTML structure
├── script.js               # JavaScript functionality
├── data.json               # JSON database (your data)
└── README.md              # This file
```

## Setup Instructions

1. **Download/Clone** all files to a directory on your web server or local machine
2. **Ensure JSON Database** is named exactly `data.json` and placed in the same directory as `index.html`
3. **Open** `index.html` in a web browser

## Usage

### CSV/Excel File Processing

#### Step 1: Prepare Your Data File
Create a CSV or Excel file with the following column structure:
- **Column A**: Title (or any data)
- **Column B**: Quantity/Remaining stock
- **Column C**: Work Date (automatically extracted for PDF header)
- **Column D**: Master Order ID

**Important Notes:**
- Master Order IDs must be in **column D** (4th column)
- Print quantities must be in **column B** (2nd column)  
- Work date must be in **column C** (3rd column)
- First row should be headers (will be automatically skipped)
- Save the file in CSV (.csv) or Excel (.xlsx, .xls) format

#### Step 2: Upload & Process
- Upload your file using drag & drop or the file browser
- The application automatically detects:
  - Master Order IDs from column D
  - Print quantities from column B
  - Work date from column C (uses first valid date found)
- Duplicate Master Order IDs are automatically consolidated with summed quantities
- View the search results grouped by paper type with Master Order IDs sorted alphabetically within each group

#### Step 3: Apply MPI Filter (Optional)
- Use the **MPI Only** toggle to filter results to show only items with "MPI" status
- MPI items are highlighted with yellow background and warning badges
- Filter statistics show how many items are displayed vs hidden
- Toggle can be switched on/off at any time without re-processing data

#### Step 4: Export Results

**Option A: Download PDF Report**
- Click "Download PDF" to generate a comprehensive report
- The PDF includes:
  - **Automatic Work Date Header**: Work date from CSV column C displayed as DD/MM/YY format
  - Summary with total searched, found, and missing counts
  - Missing Master Order IDs section (if any exist)
  - Results grouped by paper type with gray section headers
  - **Master IDs sorted alphabetically within each paper type group**
  - Complete product details including print quantities and status
  - Consolidated quantities marked with asterisk (*) and footnote
  - Clean, professional formatting optimized for A4 printing
  - **MPI Filtering**: When MPI filter is active, PDF shows "(MPI Only)" in title and contains only MPI items

**Option B: Download Individual XML Files**
- Click "Download XML" to generate individual XML files
- Creates one XML file per search result (respects MPI filter if active)
- Each file is named using the ISBN (e.g., `9781234567890.xml`)
- If ISBN is missing, falls back to Master Order ID with `_no_isbn` suffix
- All XML files are packaged in a single ZIP archive
- Perfect for automated processing systems
- **Filtered Exports**: When MPI filter is active, ZIP filename includes "MPI_" prefix

### Additional Features

- **Clear All**: Reset the entire application (clears both lookup and bulk results, resets filter)
- **Delete Individual Items**: Remove specific results from the display and exports
- **Delete Paper Type Sections**: Remove entire paper type groups at once
- **Automatic Header Detection**: CSV header row is automatically skipped
- **Automatic Status Cleanup**: Loading messages disappear once processing is complete
- **Automatic Date Extraction**: Work date automatically extracted from CSV data
- **Responsive Interface**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Clear feedback for file format issues and missing data

## File Format Requirements

### CSV/Excel File Structure
The file should follow this exact column structure:

| Column A (Title) | Column B (Quantity) | Column C (Date) | Column D (Master Order ID) |
|------------------|---------------------|-----------------|----------------------|
| Book Title 1     | 500                 | 02/09/2025      | TCE104              |
| Book Title 2     | 1000                | 02/09/2025      | TCB056              |
| Book Title 3     | 250                 | 02/09/2025      | TCE105              |

**Format Notes:**
- First row (headers) is automatically skipped
- Empty rows are filtered out automatically
- File must be saved in supported format (.csv, .xlsx, .xls)
- If quantity is empty, it will show as '0'
- Work date is extracted from the first valid row in column C
- Date formats are automatically detected and parsed (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.)
- Duplicate Master Order IDs in different rows will be automatically consolidated with summed quantities

## Export Format Details

### PDF Output Features

- **A4 Optimized Layout**: Designed specifically for A4 paper size with proper margins
- **Automatic Work Date Header**: Work date from CSV column C displayed prominently as DD/MM/YY format
- **MPI Filter Support**: When MPI filter is active, PDF title includes "(MPI Only)" and shows only MPI items
- **Clean Header Design**: Streamlined layout without filter annotations in document body
- **Complete Audit Trail**: Shows both found results and missing Master Order IDs
- **Missing Master Order IDs Section**: Listed at the top of PDF if any Master Order IDs weren't found
- **Grouped Results**: Results organized by paper type with gray section headers
- **Alphabetical Sorting**: Master Order IDs sorted alphabetically within each paper type group for easy reference
- **Status Column**: Shows MPI or Pod Ready status for each item
- **Complete Information**: Shows Master ID (shortened header), Title, Trim Size, Paper specifications, and print quantities
- **Duplicate Indicators**: Consolidated quantities marked with asterisk (*) and footnote explanation
- **Professional Formatting**: Clean headers, proper spacing, and page numbering
- **Multi-page Support**: Automatically handles large datasets across multiple pages
- **Header Repetition**: Column headers repeat on each new page
- **Summary Statistics**: Shows total searched, found, and not found counts

### XML Output Features

- **Individual Files**: One XML file per search result (respects MPI filter if active)
- **ISBN-based Naming**: Files named using ISBN numbers for easy identification
- **Fallback Naming**: Uses Master Order ID with `_no_isbn` suffix when ISBN is missing
- **MPI Filter Support**: When MPI filter is active, ZIP filename includes "MPI_" prefix
- **Clean XML Structure**: Simple, standardized format for each book order:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <BookOrder>
    <MasterOrderID>TCE104</MasterOrderID>
    <ISBN>9781234567890</ISBN>
    <Title>Sample Book Title</Title>
    <TrimSize>6x9</TrimSize>
    <Paper>50# White Offset</Paper>
    <BindStyle>Perfect Bound</BindStyle>
    <Extent>256</Extent>
    <Status>MPI</Status>
    <Quantity>500</Quantity>
    <ConsolidatedQuantity>false</ConsolidatedQuantity>
    <GeneratedDate>2025-09-15T10:05:21.000Z</GeneratedDate>
  </BookOrder>
  ```
- **ZIP Archive**: All XML files packaged together for easy download
- **Automation Ready**: Perfect for feeding into automated processing systems
- **Timestamped Archive**: ZIP file includes generation date in filename
- **Duplicate Tracking**: `<ConsolidatedQuantity>` field indicates if quantities were summed from duplicates

## User Interface Features

### File Upload Interface
- **Drag & Drop Upload**: Easy file handling with visual feedback
- **Multiple Format Support**: Supports CSV (.csv) and Excel (.xlsx, .xls) files
- **Progress Indicators**: Clear status messages throughout the process
- **Automatic Message Cleanup**: Status messages disappear once processing is complete for clean interface
- **File Type Detection**: Automatic detection and validation of file formats

### Results Display
- **MPI Filter Toggle**: Prominent switch to filter by MPI status with visual feedback
- **Summary Statistics**: Statistical overview of search results with filter-aware counts
- **Missing ID Display**: Clear identification of Master Order IDs not found in database
- **Grouped Display**: Results automatically organized by paper type on screen
- **Alphabetical Ordering**: Master Order IDs sorted alphabetically within each paper type group
- **Status Highlighting**: MPI items highlighted with yellow background and warning badges
- **Duplicate Indicators**: Visual icons showing consolidated quantities with tooltips
- **Individual Controls**: Delete specific items or entire sections
- **Dual Export Options**: Choose between PDF reports or XML files with filter support

## Technical Details

### Technologies Used
- **HTML5** with responsive Bootstrap 5 framework
- **JavaScript** for file processing, filtering, and PDF/XML generation
- **JSZip** for creating ZIP archives with multiple XML files
- **jsPDF** for PDF generation with A4 optimization
- **SheetJS (XLSX)** for Excel file processing
- **Bootstrap Icons** for UI elements

### Browser Compatibility
- **Chrome/Edge**: Full support including all features
- **Firefox**: Full support including all features
- **Safari**: Full support including all features
- **Requires**: Modern browser with JavaScript enabled

### File Size Limits
- **CSV/Excel Files**: Recommended under 10MB for optimal performance
- **JSON Database**: No practical limit, tested with 10,000+ records
- **PDF Output**: Handles thousands of results with automatic pagination
- **XML Output**: Efficiently processes large datasets into individual files

## Error Handling

The application includes comprehensive error handling for:
- **Missing JSON Database**: Clear error message if data.json not found
- **Invalid Files**: Validation for proper CSV/Excel format
- **Missing Columns**: Automatic detection with fallback error messages
- **Missing Date Column**: Graceful handling when column C is empty or invalid
- **Empty Files**: Proper handling of empty or corrupted files
- **Network Issues**: Graceful handling of file loading problems
- **Missing Libraries**: Checks for required JavaScript libraries (JSZip, jsPDF, XLSX)
- **Date Format Issues**: Flexible date parsing with fallback to original format
- **Duplicate Processing**: Robust handling of complex duplicate scenarios

## Troubleshooting

### File Upload Issues
- Ensure file is in supported format (.csv, .xlsx, .xls)
- Check that Master Order IDs are in column D, quantities in column B, and dates in column C
- Verify CSV has proper column structure (4 columns minimum)
- Try re-saving the file if upload fails

### MPI Filter Issues
- **Toggle Not Working**: Refresh the page if toggle doesn't respond
- **No MPI Items**: Verify your data contains items with "MPI" status (case-insensitive)
- **Incorrect Filtering**: Check console (F12) for any JavaScript errors

### Export Problems
- **PDF Issues**: Ensure browser allows downloads and check for popup blockers
- **XML Issues**: Verify JSZip library loads properly; refresh page if needed
- **Large Datasets**: Try with smaller datasets if memory issues occur
- **Missing Filter Prefix**: Ensure MPI filter is active before downloading for "MPI_" prefix

### Date Processing Issues
- **No Date Found**: Ensure column C contains valid dates
- **Wrong Date Format**: Application handles most common formats automatically
- **Invalid Dates**: Check that dates are reasonable (not in distant past/future)
- **Missing Date Column**: Ensure CSV/Excel has at least 3 columns with date in column C

## Performance Notes

- **Client-side Processing**: All processing happens in the browser for privacy
- **No Server Required**: Can be run from any web server or locally
- **Memory Efficient**: Optimized for large datasets with smart filtering
- **Fast Search**: Efficient matching algorithm for quick results
- **Optimized Exports**: Both PDF and XML generation optimized for performance
- **Smart Filtering**: MPI filter operations are lightweight and instant
- **Duplicate Processing**: Efficient consolidation algorithms with minimal performance impact

## Recent Updates

### Version 2.0 - MPI Filtering & UI Improvements
- **MPI Status Filtering**: Added toggle to filter results by MPI vs Pod Ready status
- **Visual Status Indicators**: MPI items highlighted with yellow background and warning badges
- **Filtered Exports**: Both PDF and XML exports respect MPI filter with appropriate filename prefixes
- **Clean PDF Layout**: Removed filter annotations from PDF body for cleaner appearance
- **Enhanced Toggle**: Bold MPI Only label for better visibility
- **Column Header Update**: Changed "Master Order ID" to "Master ID" in PDF for cleaner layout

### Version 1.3 - Automatic Date Processing
- **CSV Date Extraction**: Work date automatically extracted from column C of CSV file
- **Flexible Date Parsing**: Supports multiple date formats with intelligent detection
- **Excel File Support**: Added full support for .xlsx and .xls files
- **Streamlined Interface**: Removed manual date picker for cleaner, more automated workflow

### Version 1.2 - Duplicate Detection & Consolidation
- **Duplicate Detection**: Automatic identification of duplicate Master Order IDs
- **Quantity Consolidation**: Automatic summation of quantities for duplicate entries
- **Visual Indicators**: Clear marking of consolidated items in interface and exports
- **Enhanced Exports**: Both PDF and XML include duplicate consolidation information

### Version 1.1 - Enhanced Organization
- **Alphabetical Sorting**: Added sorting of Master Order IDs within paper type groups
- **Consistent Display**: Same sorting applied to both screen results and PDF exports
- **Improved Usability**: Easier to locate specific Master Order IDs within large datasets

## License

This project is provided as-is for internal use. Modify as needed for your specific requirements.

## Support

For issues or questions about this application, please contact your system administrator or development team.