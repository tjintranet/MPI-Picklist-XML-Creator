# Master ID Search & PDF/XML Generator with Duplicate Detection

A web application that searches for Master IDs in a JSON database and generates downloadable PDF reports and individual XML files with detailed product information. Features both single Master ID lookup and bulk CSV file processing with automatic grouping by paper type, alphabetical sorting by Master ID, automatic work date extraction from CSV data, **duplicate Master ID detection with quantity consolidation**, and clean user interface with automatic status message management.

## Overview

This application allows users to quickly lookup individual Master IDs or upload CSV files containing multiple Master IDs, automatically searches for matches in a JSON database, **detects and consolidates duplicate Master Order IDs by summing their quantities**, and generates professional PDF reports grouped by paper type with Master IDs sorted alphabetically within each group, or individual XML files named by ISBN. The work date is automatically extracted from the CSV file, and missing Master IDs are clearly identified in both the interface and output files. The interface features automatic cleanup of status messages for a streamlined user experience.

## Key Features

- **Single Master ID Lookup**: Instant search with on-screen results display
- **Bulk CSV Processing**: Upload CSV files with Master IDs in column D, quantities in column B, and work dates in column C
- **🆕 Duplicate Detection & Consolidation**: Automatically detects duplicate Master Order IDs and sums their quantities
- **Automatic JSON Database Loading**: Loads `data.json` automatically from the same directory
- **CSV File Upload**: Drag & drop or click to upload CSV files (.csv)
- **Excel File Support**: Full support for .xlsx and .xls files
- **Intelligent Sorting**: Results grouped by paper type with Master IDs sorted alphabetically within each group
- **Automatic Work Date Extraction**: Work date automatically extracted from column C of CSV file
- **Dual Export Options**:
  - **PDF Reports**: Results grouped by paper type with alphabetical Master ID sorting, automatic work date header, and duplicate indicators
  - **XML Files**: Individual XML files per item, named by ISBN for automated processing, includes duplicate consolidation flags
- **Missing ID Tracking**: Identifies and reports Master IDs not found in database
- **Complete Audit Trail**: Both PDF and XML exports include comprehensive data with duplicate indicators
- **Clean Interface**: Minimal, professional design with automatic status message cleanup and streamlined workflow
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Individual Item Management**: Delete specific items or entire paper type sections
- **🆕 Visual Duplicate Indicators**: Clear marking of consolidated items in both interface and exports

## New Duplicate Detection Features

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
- **PDF Asterisk Notation**: Consolidated quantities marked with asterisk (*)
- **PDF Footnotes**: Explanatory notes about consolidated entries
- **XML Flags**: Individual XML files include `<ConsolidatedQuantity>` field
- **Summary Notes**: Export headers include consolidation information

## File Structure