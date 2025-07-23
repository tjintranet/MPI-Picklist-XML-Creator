# Master ID Search & PDF Generator

A web application that searches for Master IDs in a JSON database and generates downloadable PDF reports with detailed product information. Features both single Master ID lookup and bulk Excel file processing.

## Overview

This application allows users to quickly lookup individual Master IDs or upload Excel files containing multiple Master IDs, automatically searches for matches in a JSON database, and generates professional PDF reports with the found results. The tool is designed for efficiently processing both individual queries and large lists of Master IDs.

## Features

- **Single Master ID Lookup**: Instant search with on-screen results display
- **Bulk Excel Processing**: Upload Excel files with multiple Master IDs
- **Automatic JSON Database Loading**: Loads `masterID_paper.json` automatically from the same directory
- **Excel File Upload**: Drag & drop or click to upload Excel files (.xlsx/.xls)
- **Automatic Column Detection**: Automatically finds and selects the "Master ID" column
- **Real-time Search**: Instantly searches the database for matching Master IDs
- **PDF Report Generation**: Creates professional A4 PDF reports with optimized layout
- **Template Download**: Provides Excel template for consistent data input
- **Clear All Functionality**: Reset application state without page refresh
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile devices

## File Structure

```
project-folder/
├── index.html              # Main application file
├── masterID_paper.json     # JSON database (your data)
├── Master_POD_Search.xlsx  # Excel template for uploads
└── README.md              # This file
```

## Setup Instructions

1. **Download/Clone** all files to a directory on your web server or local machine
2. **Ensure JSON Database** is named exactly `masterID_paper.json` and placed in the same directory as `index.html`
3. **Include Excel Template** named `Master_POD_Search.xlsx` for users to download
4. **Open** `index.html` in a web browser

## Usage

### Single Master ID Lookup

1. **Enter Master ID** in the "Quick Lookup" text field at the top
2. **Click "Lookup"** or press Enter to search
3. **View Results** displayed instantly on screen with all product details
4. **Click "Clear"** to reset and search for another Master ID

### Bulk Processing with Excel Files

#### Step 1: Get Template (Optional)
- Click the "Download Template" button to get the Excel template
- This ensures the correct file format and column structure

#### Step 2: Prepare Your Data
- Open the downloaded template or create an Excel file
- Add your Master IDs to the "Master ID" column (column A)
- Save the file in Excel format (.xlsx or .xls)

#### Step 3: Upload & Process
- Upload your Excel file using drag & drop or the file browser
- The application automatically detects the Master ID column and processes the data
- View the search results and summary statistics

#### Step 4: Download Report
- Click "Download PDF Report" to generate and download the results
- The PDF includes all matched records with complete details
- Reports are optimized for A4 printing with proper formatting

### Additional Features

- **Clear All**: Reset the entire application (clears both single lookup and bulk results)
- **Template Download**: Get the correct Excel format for bulk uploads
- **Responsive Interface**: Works on desktop, tablet, and mobile devices

## JSON Database Format

The JSON database should follow this structure:

```json
[
  {
    "Master ID": "TCE104",
    "ISBN": 9780091856267,
    "Title": "THE INTEGRATED HEALTH BIBLE (014)",
    "Trim Size": "245x184",
    "Paper": "Holmen Book 55gsm 108micron"
  },
  {
    "Master ID": "TCB056",
    "ISBN": 9780436205408,
    "Title": "A PATRIOT AFTER ALL (009)",
    "Trim Size": "234x153",
    "Paper": "Holmen Book 55gsm 108micron"
  }
]
```

## Excel Template Format

The Excel file should contain a single column:

| Master ID |
|-----------|
| TCE104    |
| TCB056    |
| TCE105    |

## PDF Output Features

- **A4 Optimized Layout**: Designed specifically for A4 paper size
- **Complete Information**: Shows Master ID, Title, Trim Size, and full Paper specifications
- **Professional Formatting**: Clean headers, proper spacing, and page numbering
- **Multi-page Support**: Automatically handles large datasets across multiple pages
- **Header Repetition**: Column headers repeat on each new page
- **Summary Statistics**: Shows total searched, found, and not found counts
- **Optimized Columns**: Prioritizes paper specifications with maximum width for complete details

## User Interface Features

### Single Lookup Display
- **Compact Layout**: Clean, minimal design with essential information
- **Instant Results**: No file upload required for individual searches
- **Black Text**: Professional appearance with high contrast
- **Responsive Grid**: Adapts to different screen sizes
- **Key Information Highlighted**: Master ID, Title, and Paper details emphasized

### Bulk Processing Interface
- **Drag & Drop Upload**: Easy file handling with visual feedback
- **Progress Indicators**: Clear status messages throughout the process
- **Results Summary**: Statistical overview of search results
- **Tabular Display**: Organized view of all found records

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