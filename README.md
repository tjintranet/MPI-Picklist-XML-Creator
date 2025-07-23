# Master ID Search & PDF Generator

A web application that searches for Master IDs in a JSON database and generates downloadable PDF reports with detailed product information. Features both single Master ID lookup and bulk CSV file processing with automatic grouping by paper type.

## Overview

This application allows users to quickly lookup individual Master IDs or upload CSV files containing multiple Master IDs, automatically searches for matches in a JSON database, and generates professional PDF reports with the found results grouped by paper type. Missing Master IDs are clearly identified in both the interface and PDF output.

## Features

- **Single Master ID Lookup**: Instant search with on-screen results display
- **Bulk CSV Processing**: Upload CSV files with Master IDs in column D
- **Automatic JSON Database Loading**: Loads `masterID_paper.json` automatically from the same directory
- **CSV File Upload**: Drag & drop or click to upload CSV files (.csv)
- **Automatic Grouping**: Results always grouped by paper type for better organization
- **Missing ID Tracking**: Identifies and reports Master IDs not found in database
- **PDF Report Generation**: Creates professional A4 PDF reports with optimized layout
- **Complete Audit Trail**: PDF includes both found results and missing Master IDs
- **Clean Interface**: Minimal, professional design without unnecessary icons
- **Responsive Design**: Works on desktop, tablet, and mobile devices

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
- View the search results grouped by paper type with summary statistics

#### Step 3: Download Complete Report
- Click "Download PDF" to generate and download the results
- The PDF includes:
  - Summary with total searched, found, and missing counts
  - Missing Master IDs section (if any exist)
  - Results grouped by paper type with gray section headers
  - Complete product details including print quantities
  - Professional formatting optimized for A4 printing

### Additional Features

- **Clear All**: Reset the entire application (clears both single lookup and bulk results)
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

## PDF Output Features

- **A4 Optimized Layout**: Designed specifically for A4 paper size with proper margins
- **Complete Audit Trail**: Shows both found results and missing Master IDs
- **Missing Master IDs Section**: Listed at the top of PDF if any Master IDs weren't found
- **Grouped Results**: Results organized by paper type with gray section headers
- **Complete Information**: Shows Master ID, Title, Trim Size, Paper specifications, and print quantities
- **Professional Formatting**: Clean headers, proper spacing, and page numbering
- **Multi-page Support**: Automatically handles large datasets across multiple pages
- **Header Repetition**: Column headers repeat on each new page
- **Summary Statistics**: Shows total searched, found, and not found counts
- **Optimized Columns**: Balanced layout showing all essential information including quantities

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
- **Quantity Display**: Print quantities shown alongside product details

## Technical Details

### Technologies Used
- **HTML5** with responsive Bootstrap 5 framework
- **JavaScript** for file processing and PDF generation
- **SheetJS (XLSX)** for Excel file parsing
- **jsPDF** for PDF generation
- **Bootstrap Icons** for UI elements

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Requires**: Modern browser with JavaScript enabled

### File Size Limits
- **Excel Files**: Recommended under 10MB for optimal performance
- **JSON Database**: No practical limit, tested with 10,000+ records
- **PDF Output**: Handles thousands of results with automatic pagination

## Error Handling

The application includes comprehensive error handling for:
- **Missing JSON Database**: Clear error message if masterID_paper.json not found
- **Invalid Excel Files**: Validation for proper Excel format
- **Missing Master ID Column**: Automatic detection with fallback error
- **Empty Files**: Proper handling of empty or corrupted files
- **Network Issues**: Graceful handling of file loading problems

## Performance Notes

- **Client-side Processing**: All processing happens in the browser for privacy
- **No Server Required**: Can be run from any web server or locally
- **Memory Efficient**: Optimized for large datasets
- **Fast Search**: Efficient matching algorithm for quick results

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

#### Excel Upload Issues
- Ensure file is in .xlsx or .xls format
- Check that "Master ID" column exists and contains data
- Try re-saving the Excel file if upload fails

#### PDF Generation Problems
- Ensure browser allows downloads
- Check for popup blockers that might prevent PDF download
- Try with a smaller dataset if memory issues occur

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

## License

This project is provided as-is for internal use. Modify as needed for your specific requirements.

## Support

For issues or questions about this application, please contact your system administrator or development team.