# Master ID Search & PDF/XML Generator

A web application that searches for Master IDs in a JSON database and generates downloadable PDF reports and individual XML files with detailed product information. Features both single Master ID lookup and bulk CSV file processing with automatic grouping by paper type, alphabetical sorting by Master ID, customizable work dates, and clean user interface with automatic status message management.

## Overview

This application allows users to quickly lookup individual Master IDs or upload CSV files containing multiple Master IDs, automatically searches for matches in a JSON database, and generates professional PDF reports grouped by paper type with Master IDs sorted alphabetically within each group, or individual XML files named by ISBN. Missing Master IDs are clearly identified in both the interface and output files. The interface features a native date picker for work date specification and automatic cleanup of status messages for a streamlined user experience.

## Features

- **Single Master ID Lookup**: Instant search with on-screen results display
- **Bulk CSV Processing**: Upload CSV files with Master IDs in column D and quantities in column B
- **Automatic JSON Database Loading**: Loads `masterID_paper.json` automatically from the same directory
- **CSV File Upload**: Drag & drop or click to upload CSV files (.csv)
- **Intelligent Sorting**: Results grouped by paper type with Master IDs sorted alphabetically within each group
- **Work Date Integration**: Native HTML5 date picker with default today's date for PDF work lists
- **Dual Export Options**:
  - **PDF Reports**: Results grouped by paper type with alphabetical Master ID sorting and work date header for printing and organization
  - **XML Files**: Individual XML files per item, named by ISBN for automated processing
- **Missing ID Tracking**: Identifies and reports Master IDs not found in database
- **Complete Audit Trail**: Both PDF and XML exports include comprehensive data
- **Clean Interface**: Minimal, professional design with automatic status message cleanup and proper button spacing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Individual Item Management**: Delete specific items or entire paper type sections

## File Structure

```
project-folder/
├── index.html              # Main HTML structure
├── script.js               # JavaScript functionality
├── masterID_paper.json     # JSON database (your data)
└── README.md              # This file
```

## Setup Instructions

1. **Download/Clone** all files to a directory on your web server or local machine
2. **Ensure JSON Database** is named exactly `masterID_paper.json` and placed in the same directory as `index.html`
3. **Open** `index.html` in a web browser

## Usage

### Single Master ID Lookup

1. **Enter Master ID** in the "Quick Lookup" text field at the top
2. **Click "Lookup"** or press Enter to search
3. **View Results** displayed instantly on screen with all product details:
   - Master ID, ISBN, Title, Trim Size, Paper specifications
4. **Click "Clear"** to reset and search for another Master ID

### Bulk Processing with CSV Files

#### Step 1: Prepare Your CSV Data
- Create a CSV file with Master IDs in **column D** (4th column)
- Include print quantities in **column B** (2nd column)
- First row should be headers (will be automatically skipped)
- Save the file in CSV format (.csv)

#### Step 2: Upload & Process
- Upload your CSV file using drag & drop or the file browser
- The application automatically detects Master IDs in column D and quantities in column B
- View the search results grouped by paper type with Master IDs sorted alphabetically within each group
- Summary statistics show total searched, found, and missing counts
- Status messages automatically clear once results are displayed for a clean interface

#### Step 3: Set Work Date
- **Default Date**: The work date picker automatically sets to today's date
- **Change Date**: Click the date picker to select a different work date using the native calendar popup
- **Date Format**: The date picker displays according to your browser/system locale settings
- **PDF Integration**: Selected work date appears in PDF header as DD/MM/YY format

#### Step 4: Choose Your Export Format

**Option A: Download PDF Report**
- Click "Download PDF" to generate a comprehensive report
- The PDF includes:
  - **Work Date Header**: Selected work date displayed as DD/MM/YY format
  - Summary with total searched, found, and missing counts
  - Missing Master IDs section (if any exist)
  - Results grouped by paper type with gray section headers
  - **Master IDs sorted alphabetically within each paper type group**
  - Complete product details including print quantities
  - Professional formatting optimized for A4 printing

**Option B: Download Individual XML Files**
- Click "Download XML" to generate individual XML files
- Creates one XML file per found result
- Each file is named using the ISBN (e.g., `9781234567890.xml`)
- If ISBN is missing, falls back to Master ID with `_no_isbn` suffix
- All XML files are packaged in a single ZIP archive
- Perfect for automated processing systems

### Additional Features

- **Clear All**: Reset the entire application (clears both single lookup and bulk results)
- **Delete Individual Items**: Remove specific results from the display and exports
- **Delete Paper Type Sections**: Remove entire paper type groups at once
- **Automatic Header Detection**: CSV header row is automatically skipped
- **Automatic Status Cleanup**: Loading messages disappear once processing is complete
- **Responsive Interface**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Clear feedback for file format issues and missing data

## CSV File Format

The CSV file should contain Master IDs in **column D** and print quantities in **column B**:

| Column A | Column B (Quantity) | Column C | Column D (Master ID) |
|----------|---------------------|----------|----------------------|
| Data     | 500                 | Data     | TCE104              |
| Data     | 1000                | Data     | TCB056              |
| Data     | 250                 | Data     | TCE105              |

**Important Notes:**
- Master IDs must be in column D (4th column)
- Print quantities must be in column B (2nd column)
- First row (headers) is automatically skipped
- Empty rows are filtered out automatically
- File must be saved in .csv format
- If quantity is empty, it will show as '0'

## Export Format Details

### PDF Output Features

- **A4 Optimized Layout**: Designed specifically for A4 paper size with proper margins
- **Work Date Header**: Selected work date displayed prominently as DD/MM/YY format
- **Complete Audit Trail**: Shows both found results and missing Master IDs
- **Missing Master IDs Section**: Listed at the top of PDF if any Master IDs weren't found
- **Grouped Results**: Results organized by paper type with gray section headers
- **Alphabetical Sorting**: Master IDs sorted alphabetically within each paper type group for easy reference
- **Complete Information**: Shows Master ID, Title, Trim Size, Paper specifications, and print quantities
- **Professional Formatting**: Clean headers, proper spacing, and page numbering
- **Multi-page Support**: Automatically handles large datasets across multiple pages
- **Header Repetition**: Column headers repeat on each new page
- **Summary Statistics**: Shows total searched, found, and not found counts
- **Optimized Columns**: Balanced layout showing all essential information including quantities

### XML Output Features

- **Individual Files**: One XML file per search result
- **ISBN-based Naming**: Files named using ISBN numbers for easy identification
- **Fallback Naming**: Uses Master ID with `_no_isbn` suffix when ISBN is missing
- **Clean XML Structure**: Simple, standardized format for each book order:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <BookOrder>
    <MasterID>TCE104</MasterID>
    <ISBN>9781234567890</ISBN>
    <Title>Sample Book Title</Title>
    <TrimSize>6x9</TrimSize>
    <Paper>50# White Offset</Paper>
    <Quantity>500</Quantity>
    <GeneratedDate>2025-07-24T...</GeneratedDate>
  </BookOrder>
  ```
- **ZIP Archive**: All XML files packaged together for easy download
- **Automation Ready**: Perfect for feeding into automated processing systems
- **Timestamped Archive**: ZIP file includes generation date in filename

## User Interface Features

### Single Lookup Display
- **Compact Layout**: Clean, minimal design with essential information
- **Instant Results**: No file upload required for individual searches
- **Professional Appearance**: High contrast text without distracting colors
- **Responsive Grid**: Adapts to different screen sizes
- **Key Information Highlighted**: Master ID, Title, and Paper details emphasized

### Bulk Processing Interface
- **Drag & Drop Upload**: Easy file handling with visual feedback
- **Progress Indicators**: Clear status messages throughout the process
- **Automatic Message Cleanup**: Status messages disappear once processing is complete for clean interface
- **Results Summary**: Statistical overview of search results
- **Missing ID Display**: Clear identification of Master IDs not found in database
- **Grouped Display**: Results automatically organized by paper type on screen
- **Alphabetical Ordering**: Master IDs sorted alphabetically within each paper type group
- **Work Date Selection**: Native HTML5 date picker with calendar dropdown and today's date as default
- **Quantity Display**: Print quantities shown alongside product details
- **Individual Controls**: Delete specific items or entire sections
- **Dual Export Options**: Choose between PDF reports or XML files with proper button spacing

## Date Management Features

### Work Date Picker
- **Native HTML5 Date Input**: Browser-provided calendar popup for easy date selection
- **Default Value**: Automatically sets to today's date when page loads
- **Locale-Aware Display**: Date format in UI follows browser/system locale preferences
- **Calendar Dropdown**: Click to open native calendar for easy date selection
- **Cross-Browser Support**: Works consistently across all modern browsers

### PDF Date Integration
- **Standardized Output**: Work date always appears as DD/MM/YY format in PDF regardless of UI display format
- **Header Placement**: Work date prominently displayed in PDF header
- **Validation**: Invalid dates are handled gracefully without breaking PDF generation
- **Consistent Formatting**: Same date format used throughout PDF document

## Sorting and Organization

### Results Organization Hierarchy
1. **Primary Grouping**: Results grouped by Paper Type (sorted alphabetically)
2. **Secondary Sorting**: Master IDs sorted alphabetically within each paper type group
3. **Consistent Ordering**: Same sorting applied to both screen display and PDF export

### Sorting Features
- **Case Insensitive**: Sorting ignores case differences (e.g., "abc123" comes before "XYZ789")
- **Locale-aware**: Uses `localeCompare()` for proper string comparison
- **Stable Sorting**: Maintains consistent order across refreshes and exports
- **Visual Organization**: Easy to scan and locate specific Master IDs within paper type groups

## Technical Details

### Technologies Used
- **HTML5** with responsive Bootstrap 5 framework and native date input
- **JavaScript** for file processing and PDF/XML generation
- **JSZip** for creating ZIP archives with multiple XML files
- **jsPDF** for PDF generation
- **Bootstrap Icons** for UI elements

### Browser Compatibility
- **Chrome/Edge**: Full support including native date picker
- **Firefox**: Full support including native date picker
- **Safari**: Full support including native date picker
- **Requires**: Modern browser with JavaScript enabled and HTML5 date input support

### File Size Limits
- **CSV Files**: Recommended under 10MB for optimal performance
- **JSON Database**: No practical limit, tested with 10,000+ records
- **PDF Output**: Handles thousands of results with automatic pagination
- **XML Output**: Efficiently processes large datasets into individual files

## Error Handling

The application includes comprehensive error handling for:
- **Missing JSON Database**: Clear error message if masterID_paper.json not found
- **Invalid CSV Files**: Validation for proper CSV format
- **Missing Master ID Column**: Automatic detection with fallback error
- **Empty Files**: Proper handling of empty or corrupted files
- **Network Issues**: Graceful handling of file loading problems
- **Missing Libraries**: Checks for required JavaScript libraries (JSZip, jsPDF)
- **Date Validation**: Handles invalid dates in work date picker gracefully

## Performance Notes

- **Client-side Processing**: All processing happens in the browser for privacy
- **No Server Required**: Can be run from any web server or locally
- **Memory Efficient**: Optimized for large datasets
- **Fast Search**: Efficient matching algorithm for quick results
- **Optimized Exports**: Both PDF and XML generation optimized for performance
- **Smart Sorting**: Efficient alphabetical sorting algorithms with minimal performance impact
- **Clean Interface**: Automatic status message cleanup reduces visual clutter and improves user focus

## Troubleshooting

### Single Master ID Issues
- **Case Sensitivity**: Search is case-insensitive, so "tce104" will find "TCE104"
- **Whitespace**: Extra spaces are automatically trimmed from input
- **Not Found Results**: Clear messaging when Master ID doesn't exist in database
- **Input Validation**: Prevents empty searches with helpful prompts

### Bulk Processing Issues

#### JSON Database Not Loading
- Ensure `masterID_paper.json` is in the same directory as `index.html`
- Check file permissions and web server configuration
- Verify JSON syntax is valid

#### CSV Upload Issues
- Ensure file is in .csv format
- Check that Master IDs are in column D and quantities in column B
- Try re-saving the CSV file if upload fails

#### Export Problems
- **PDF Issues**: Ensure browser allows downloads and check for popup blockers
- **XML Issues**: Verify JSZip library loads properly; refresh page if needed
- **Large Datasets**: Try with smaller datasets if memory issues occur

#### Date Picker Issues
- **No Calendar Dropdown**: Ensure browser supports HTML5 date input (all modern browsers do)
- **Wrong Date Format**: Date picker display follows browser locale, but PDF output is always DD/MM/YY
- **Default Date Issues**: Refresh page if today's date doesn't appear automatically

#### Sorting Issues
- **Unexpected Order**: Refresh the page if sorting appears inconsistent
- **Mixed Case Results**: Sorting is case-insensitive by design for better organization
- **Performance**: Large datasets (10,000+ items) may take a moment to sort

#### Interface Issues
- **Status Messages Stuck**: Messages should clear automatically when results display; refresh if they persist
- **Responsive Layout**: Interface adapts to screen size; try refreshing if layout appears broken

## Keyboard Shortcuts

- **Enter Key**: Press Enter in the single lookup field to search immediately
- **Tab Navigation**: Use Tab to navigate between form elements
- **Escape Key**: Clears focus from input fields
- **Date Picker**: Use arrow keys to navigate calendar when date picker is open

## Performance Optimization

### Single Lookups
- **Instant Search**: No processing delay for individual Master ID searches
- **Memory Efficient**: Minimal resource usage for single queries
- **Fast Response**: Optimized search algorithm for quick results

### Bulk Processing
- **Efficient Parsing**: Optimized CSV processing for large files
- **Memory Management**: Smart handling of large datasets
- **Export Optimization**: Both PDF and XML generation optimized for speed
- **Sorting Performance**: Efficient alphabetical sorting with minimal overhead
- **Interface Optimization**: Automatic cleanup of temporary messages improves performance

## Recent Updates

### Version 1.2 - Enhanced User Experience
- **Work Date Integration**: Added native HTML5 date picker with default today's date
- **PDF Work Date Header**: Selected work date appears in PDF as DD/MM/YY format
- **Automatic Status Cleanup**: Loading messages automatically disappear once results are displayed
- **Interface Improvements**: Cleaner user experience with reduced visual clutter

### Version 1.1 - Alphabetical Sorting
- **Enhanced Organization**: Added alphabetical sorting of Master IDs within paper type groups
- **Consistent Display**: Same sorting applied to both screen results and PDF exports
- **Improved Usability**: Easier to locate specific Master IDs within large datasets
- **Performance Optimized**: Efficient sorting algorithms with minimal impact on processing speed

## License

This project is provided as-is for internal use. Modify as needed for your specific requirements.

## Support

For issues or questions about this application, please contact your system administrator or development team.

## File Structure

```
project-folder/
├── index.html              # Main HTML structure
├── script.js               # JavaScript functionality
├── masterID_paper.json     # JSON database (your data)
└── README.md              # This file
```

## Setup Instructions

1. **Download/Clone** all files to a directory on your web server or local machine
2. **Ensure JSON Database** is named exactly `masterID_paper.json` and placed in the same directory as `index.html`
3. **Open** `index.html` in a web browser

## Usage

### Single Master ID Lookup

1. **Enter Master ID** in the "Quick Lookup" text field at the top
2. **Click "Lookup"** or press Enter to search
3. **View Results** displayed instantly on screen with all product details:
   - Master ID, ISBN, Title, Trim Size, Paper specifications
4. **Click "Clear"** to reset and search for another Master ID

### Bulk Processing with CSV Files

#### Step 1: Prepare Your CSV Data
- Create a CSV file with Master IDs in **column D** (4th column)
- Include print quantities in **column B** (2nd column)
- First row should be headers (will be automatically skipped)
- Save the file in CSV format (.csv)

#### Step 2: Upload & Process
- Upload your CSV file using drag & drop or the file browser
- The application automatically detects Master IDs in column D and quantities in column B
- View the search results grouped by paper type with Master IDs sorted alphabetically within each group
- Summary statistics show total searched, found, and missing counts

#### Step 3: Choose Your Export Format

**Option A: Download PDF Report**
- Click "Download PDF" to generate a comprehensive report
- The PDF includes:
  - Summary with total searched, found, and missing counts
  - Missing Master IDs section (if any exist)
  - Results grouped by paper type with gray section headers
  - **Master IDs sorted alphabetically within each paper type group**
  - Complete product details including print quantities
  - Professional formatting optimized for A4 printing

**Option B: Download Individual XML Files**
- Click "Download XML" to generate individual XML files
- Creates one XML file per found result
- Each file is named using the ISBN (e.g., `9781234567890.xml`)
- If ISBN is missing, falls back to Master ID with `_no_isbn` suffix
- All XML files are packaged in a single ZIP archive
- Perfect for automated processing systems

### Additional Features

- **Clear All**: Reset the entire application (clears both single lookup and bulk results)
- **Delete Individual Items**: Remove specific results from the display and exports
- **Delete Paper Type Sections**: Remove entire paper type groups at once
- **Automatic Header Detection**: CSV header row is automatically skipped
- **Responsive Interface**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Clear feedback for file format issues and missing data

## CSV File Format

The CSV file should contain Master IDs in **column D** and print quantities in **column B**:

| Column A | Column B (Quantity) | Column C | Column D (Master ID) |
|----------|---------------------|----------|----------------------|
| Data     | 500                 | Data     | TCE104              |
| Data     | 1000                | Data     | TCB056              |
| Data     | 250                 | Data     | TCE105              |

**Important Notes:**
- Master IDs must be in column D (4th column)
- Print quantities must be in column B (2nd column)
- First row (headers) is automatically skipped
- Empty rows are filtered out automatically
- File must be saved in .csv format
- If quantity is empty, it will show as '0'

## Export Format Details

### PDF Output Features

- **A4 Optimized Layout**: Designed specifically for A4 paper size with proper margins
- **Complete Audit Trail**: Shows both found results and missing Master IDs
- **Missing Master IDs Section**: Listed at the top of PDF if any Master IDs weren't found
- **Grouped Results**: Results organized by paper type with gray section headers
- **Alphabetical Sorting**: Master IDs sorted alphabetically within each paper type group for easy reference
- **Complete Information**: Shows Master ID, Title, Trim Size, Paper specifications, and print quantities
- **Professional Formatting**: Clean headers, proper spacing, and page numbering
- **Multi-page Support**: Automatically handles large datasets across multiple pages
- **Header Repetition**: Column headers repeat on each new page
- **Summary Statistics**: Shows total searched, found, and not found counts
- **Optimized Columns**: Balanced layout showing all essential information including quantities

### XML Output Features

- **Individual Files**: One XML file per search result
- **ISBN-based Naming**: Files named using ISBN numbers for easy identification
- **Fallback Naming**: Uses Master ID with `_no_isbn` suffix when ISBN is missing
- **Clean XML Structure**: Simple, standardized format for each book order:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <BookOrder>
    <MasterID>TCE104</MasterID>
    <ISBN>9781234567890</ISBN>
    <Title>Sample Book Title</Title>
    <TrimSize>6x9</TrimSize>
    <Paper>50# White Offset</Paper>
    <Quantity>500</Quantity>
    <GeneratedDate>2025-07-24T...</GeneratedDate>
  </BookOrder>
  ```
- **ZIP Archive**: All XML files packaged together for easy download
- **Automation Ready**: Perfect for feeding into automated processing systems
- **Timestamped Archive**: ZIP file includes generation date in filename

## User Interface Features

### Single Lookup Display
- **Compact Layout**: Clean, minimal design with essential information
- **Instant Results**: No file upload required for individual searches
- **Professional Appearance**: High contrast text without distracting colors
- **Responsive Grid**: Adapts to different screen sizes
- **Key Information Highlighted**: Master ID, Title, and Paper details emphasized

### Bulk Processing Interface
- **Drag & Drop Upload**: Easy file handling with visual feedback
- **Progress Indicators**: Clear status messages throughout the process
- **Results Summary**: Statistical overview of search results
- **Missing ID Display**: Clear identification of Master IDs not found in database
- **Grouped Display**: Results automatically organized by paper type on screen
- **Alphabetical Ordering**: Master IDs sorted alphabetically within each paper type group
- **Quantity Display**: Print quantities shown alongside product details
- **Individual Controls**: Delete specific items or entire sections
- **Dual Export Options**: Choose between PDF reports or XML files with proper button spacing

## Sorting and Organization

### Results Organization Hierarchy
1. **Primary Grouping**: Results grouped by Paper Type (sorted alphabetically)
2. **Secondary Sorting**: Master IDs sorted alphabetically within each paper type group
3. **Consistent Ordering**: Same sorting applied to both screen display and PDF export

### Sorting Features
- **Case Insensitive**: Sorting ignores case differences (e.g., "abc123" comes before "XYZ789")
- **Locale-aware**: Uses `localeCompare()` for proper string comparison
- **Stable Sorting**: Maintains consistent order across refreshes and exports
- **Visual Organization**: Easy to scan and locate specific Master IDs within paper type groups

## Technical Details

### Technologies Used
- **HTML5** with responsive Bootstrap 5 framework
- **JavaScript** for file processing and PDF/XML generation
- **JSZip** for creating ZIP archives with multiple XML files
- **jsPDF** for PDF generation
- **Bootstrap Icons** for UI elements

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Requires**: Modern browser with JavaScript enabled

### File Size Limits
- **CSV Files**: Recommended under 10MB for optimal performance
- **JSON Database**: No practical limit, tested with 10,000+ records
- **PDF Output**: Handles thousands of results with automatic pagination
- **XML Output**: Efficiently processes large datasets into individual files

## Error Handling

The application includes comprehensive error handling for:
- **Missing JSON Database**: Clear error message if masterID_paper.json not found
- **Invalid CSV Files**: Validation for proper CSV format
- **Missing Master ID Column**: Automatic detection with fallback error
- **Empty Files**: Proper handling of empty or corrupted files
- **Network Issues**: Graceful handling of file loading problems
- **Missing Libraries**: Checks for required JavaScript libraries (JSZip, jsPDF)

## Performance Notes

- **Client-side Processing**: All processing happens in the browser for privacy
- **No Server Required**: Can be run from any web server or locally
- **Memory Efficient**: Optimized for large datasets
- **Fast Search**: Efficient matching algorithm for quick results
- **Optimized Exports**: Both PDF and XML generation optimized for performance
- **Smart Sorting**: Efficient alphabetical sorting algorithms with minimal performance impact

## Troubleshooting

### Single Master ID Issues
- **Case Sensitivity**: Search is case-insensitive, so "tce104" will find "TCE104"
- **Whitespace**: Extra spaces are automatically trimmed from input
- **Not Found Results**: Clear messaging when Master ID doesn't exist in database
- **Input Validation**: Prevents empty searches with helpful prompts

### Bulk Processing Issues

#### JSON Database Not Loading
- Ensure `masterID_paper.json` is in the same directory as `index.html`
- Check file permissions and web server configuration
- Verify JSON syntax is valid

#### CSV Upload Issues
- Ensure file is in .csv format
- Check that Master IDs are in column D and quantities in column B
- Try re-saving the CSV file if upload fails

#### Export Problems
- **PDF Issues**: Ensure browser allows downloads and check for popup blockers
- **XML Issues**: Verify JSZip library loads properly; refresh page if needed
- **Large Datasets**: Try with smaller datasets if memory issues occur

#### Sorting Issues
- **Unexpected Order**: Refresh the page if sorting appears inconsistent
- **Mixed Case Results**: Sorting is case-insensitive by design for better organization
- **Performance**: Large datasets (10,000+ items) may take a moment to sort

## Keyboard Shortcuts

- **Enter Key**: Press Enter in the single lookup field to search immediately
- **Tab Navigation**: Use Tab to navigate between form elements
- **Escape Key**: Clears focus from input fields

## Performance Optimization

### Single Lookups
- **Instant Search**: No processing delay for individual Master ID searches
- **Memory Efficient**: Minimal resource usage for single queries
- **Fast Response**: Optimized search algorithm for quick results

### Bulk Processing
- **Efficient Parsing**: Optimized CSV processing for large files
- **Memory Management**: Smart handling of large datasets
- **Export Optimization**: Both PDF and XML generation optimized for speed
- **Sorting Performance**: Efficient alphabetical sorting with minimal overhead

## Recent Updates

### Version 1.1 - Alphabetical Sorting
- **Enhanced Organization**: Added alphabetical sorting of Master IDs within paper type groups
- **Consistent Display**: Same sorting applied to both screen results and PDF exports
- **Improved Usability**: Easier to locate specific Master IDs within large datasets
- **Performance Optimized**: Efficient sorting algorithms with minimal impact on processing speed

## License

This project is provided as-is for internal use. Modify as needed for your specific requirements.

## Support

For issues or questions about this application, please contact your system administrator or development team.