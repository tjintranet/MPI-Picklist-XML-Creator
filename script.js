let jsonData = [];
let csvData = [];
let searchResults = [];
let missingMasterIds = [];
let workDate = '';
let pendingDeleteAction = null;

// Field mappings for the new JSON structure
const FIELD_MAP = {
    masterId: 'Master Order ID',
    isbn: 'ISBN',
    title: 'Title',
    trimHeight: 'Trim Height',
    trimWidth: 'Trim Width',
    paperDesc: 'Paper Desc',
    bindStyle: 'Bind Style',
    extent: 'Extent',
    coverSpec: 'Cover Spec',
    coverSpine: 'Cover Spine',
    packing: 'Packing',
    status: 'Status'
};

document.addEventListener('DOMContentLoaded', function() {
    loadJsonData();
    setupEventListeners();
    setupConfirmationModal();
});

function setupConfirmationModal() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.addEventListener('click', function() {
        if (pendingDeleteAction) {
            pendingDeleteAction();
            pendingDeleteAction = null;
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
        modal.hide();
    });
}

function showConfirmationModal(message, deleteAction) {
    document.getElementById('confirmationMessage').textContent = message;
    pendingDeleteAction = deleteAction;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

function setupEventListeners() {
    const csvFileInput = document.getElementById('csvFileInput');
    
    csvFileInput.addEventListener('change', handleFileSelect);
    
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('downloadXmlBtn').addEventListener('click', downloadXML);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
}

function loadJsonData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            jsonData = data;
            console.log(`JSON database loaded successfully! Found ${jsonData.length} records.`);
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            showStatus('Error loading JSON database. Make sure "data.json" is in the same directory as this HTML file.', 'danger');
        });
}

function getFileType(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    return extension;
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const fileType = getFileType(file.name);
        
        // Update status with file type indicator
        let fileTypeText = '';
        if (fileType === 'xlsx' || fileType === 'xls') {
            fileTypeText = '<span class="file-type-indicator">Excel</span>';
        } else if (fileType === 'csv') {
            fileTypeText = '<span class="file-type-indicator">CSV</span>';
        }
        
        showStatus(`File "${file.name}" selected ${fileTypeText}. Processing...`, 'info');
        
        // Process immediately after selection
        setTimeout(() => handleFile(file), 500);
    } else {
        document.getElementById('uploadStatus').innerHTML = '';
    }
}

function handleFile(file) {
    const fileType = getFileType(file.name);
    
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
        showStatus('Please select a CSV or Excel file (.csv, .xlsx, .xls).', 'danger');
        return;
    }

    showStatus(`Processing ${fileType.toUpperCase()} file...`, 'info');

    if (fileType === 'csv') {
        handleCsvFile(file);
    } else {
        handleExcelFile(file);
    }
}

function handleCsvFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const lines = e.target.result.split('\n');
            csvData = lines.map(line => parseCSVLine(line))
                .filter(row => row.length > 3 && row.some(cell => cell.length > 0));
            
            if (csvData.length <= 1) {
                showStatus('CSV file appears to be empty or contains only headers.', 'danger');
                return;
            }

            showStatus(`CSV file loaded successfully! Found ${csvData.length - 1} data rows. Processing Master Order IDs from column D, quantities from column B, and work date from column C...`, 'success');
            setTimeout(processData, 1000);
            
        } catch (error) {
            showStatus('Error reading CSV file. Please check the file format.', 'danger');
            console.error('CSV parsing error:', error);
        }
    };
    reader.readAsText(file);
}

function handleExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { 
                type: 'array',
                cellDates: true,
                cellNF: false,
                cellText: false
            });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to array of arrays (similar to CSV structure)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false // This will format dates and numbers as strings
            });
            
            // Filter out completely empty rows
            csvData = jsonData.filter(row => row.some(cell => cell && String(cell).trim() !== ''));
            
            if (csvData.length <= 1) {
                showStatus('Excel file appears to be empty or contains only headers.', 'danger');
                return;
            }

            console.log('Excel file processed. Sample data:', csvData.slice(0, 3));
            
            showStatus(`Excel file loaded successfully! Found ${csvData.length - 1} data rows. Processing Master Order IDs from column D, quantities from column B, and work date from column C...`, 'success');
            setTimeout(processData, 1000);
            
        } catch (error) {
            showStatus('Error reading Excel file. Please check the file format and ensure it\'s not corrupted.', 'danger');
            console.error('Excel parsing error:', error);
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    cells.push(current.trim());
    return cells;
}

function findByMasterId(masterId) {
    return jsonData.find(item => 
        String(item[FIELD_MAP.masterId]).trim().toLowerCase() === masterId.toLowerCase()
    );
}

function formatTrimSize(height, width) {
    if (!height || !width) return 'N/A';
    return `${width}x${height}mm`;
}

function formatWorkDateForWTL(workDateString) {
    if (!workDateString) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear());
        return `${day}-${month}-${year}`;
    }
    
    const cleanDateStr = String(workDateString).trim();
    let day, month, year;
    
    if (cleanDateStr.includes('/')) {
        const parts = cleanDateStr.split('/');
        if (parts.length === 3) {
            day = parts[0].padStart(2, '0');
            month = parts[1].padStart(2, '0');
            year = parts[2];
            
            if (year.length === 2) {
                year = parseInt(year) < 50 ? '20' + year : '19' + year;
            }
        }
    } else if (cleanDateStr.includes('-')) {
        const parts = cleanDateStr.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                year = parts[0];
                month = parts[1].padStart(2, '0');
                day = parts[2].padStart(2, '0');
            } else {
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
                year = parts[2];
                if (year.length === 2) {
                    year = parseInt(year) < 50 ? '20' + year : '19' + year;
                }
            }
        }
    } else {
        const date = new Date(cleanDateStr);
        if (!isNaN(date.getTime())) {
            day = String(date.getDate()).padStart(2, '0');
            month = String(date.getMonth() + 1).padStart(2, '0');
            year = String(date.getFullYear());
        } else {
            const numbers = cleanDateStr.replace(/[^0-9]/g, '');
            if (numbers.length >= 6) {
                day = numbers.slice(0, 2);
                month = numbers.slice(2, 4);
                year = numbers.slice(4);
                if (year.length === 2) {
                    year = parseInt(year) < 50 ? '20' + year : '19' + year;
                }
            } else {
                const today = new Date();
                day = String(today.getDate()).padStart(2, '0');
                month = String(today.getMonth() + 1).padStart(2, '0');
                year = String(today.getFullYear());
            }
        }
    }
    
    return `${day}-${month}-${year}`;
}

function processData() {
    if (jsonData.length === 0) {
        showStatus('JSON database not loaded. Please refresh the page.', 'danger');
        return;
    }

    if (csvData.length === 0) {
        showStatus('Please upload a file first.', 'warning');
        return;
    }

    const masterIdData = {}; // Object to track Master IDs and their combined quantities
    workDate = '';
    
    console.log('Processing file data. Total rows:', csvData.length);
    if (csvData.length > 1) {
        console.log('Sample row data:', csvData[1]);
    }
    
    // First pass: collect all Master IDs and sum quantities for duplicates
    for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Ensure row has enough columns
        while (row.length < 4) {
            row.push('');
        }
        
        const masterIdValue = row[3]; // Column D (index 3)
        const quantityValue = row[1]; // Column B (index 1)
        const dateValue = row[2]; // Column C (index 2)
        
        console.log(`Row ${i}: Master Order ID = ${masterIdValue}, Quantity = ${quantityValue}, Date = ${dateValue}`);
        
        // Extract work date from first valid date found
        if (!workDate && dateValue && String(dateValue).trim() !== '' && String(dateValue).trim().toLowerCase() !== 'date') {
            workDate = String(dateValue).trim();
            console.log('Work date extracted:', workDate);
        }
        
        if (masterIdValue && String(masterIdValue).trim() !== '') {
            const masterId = String(masterIdValue).trim();
            if (!['master id', 'masterid', 'master', 'master order id'].includes(masterId.toLowerCase())) {
                const quantity = parseInt(String(quantityValue || '0').trim()) || 0;
                
                // Check if this Master ID already exists
                if (masterIdData[masterId]) {
                    // Add to existing quantity
                    masterIdData[masterId].quantity += quantity;
                    masterIdData[masterId].duplicateCount++;
                    console.log(`Duplicate found for ${masterId}. New total quantity: ${masterIdData[masterId].quantity}`);
                } else {
                    // First occurrence of this Master ID
                    masterIdData[masterId] = {
                        quantity: quantity,
                        duplicateCount: 1
                    };
                }
                console.log(`Processed: Master Order ID = ${masterId}, Quantity = ${quantity}`);
            }
        }
    }

    // Convert the masterIdData object to arrays for processing
    const masterIds = Object.keys(masterIdData);
    const quantities = masterIds.map(id => masterIdData[id].quantity.toString());
    
    console.log('Total unique Master Order IDs processed:', masterIds.length);
    console.log('Work date from file:', workDate);
    
    // Check for duplicates and log them
    const duplicates = Object.entries(masterIdData).filter(([id, data]) => data.duplicateCount > 1);
    if (duplicates.length > 0) {
        console.log('Duplicates detected and consolidated:');
        duplicates.forEach(([id, data]) => {
            console.log(`  ${id}: appeared ${data.duplicateCount} times, total quantity: ${data.quantity}`);
        });
    }

    searchResults = [];
    missingMasterIds = [];
    const foundIds = [];

    // Second pass: search for matches in JSON database
    for (let i = 0; i < masterIds.length; i++) {
        const masterId = masterIds[i];
        const quantity = quantities[i];
        const match = findByMasterId(masterId);
        
        if (match) {
            const trimSize = formatTrimSize(match[FIELD_MAP.trimWidth], match[FIELD_MAP.trimHeight]);
            const resultWithQuantity = {
                [FIELD_MAP.masterId]: match[FIELD_MAP.masterId],
                [FIELD_MAP.isbn]: match[FIELD_MAP.isbn],
                [FIELD_MAP.title]: match[FIELD_MAP.title],
                'Trim Size': trimSize,
                [FIELD_MAP.paperDesc]: match[FIELD_MAP.paperDesc],
                [FIELD_MAP.bindStyle]: match[FIELD_MAP.bindStyle],
                [FIELD_MAP.extent]: match[FIELD_MAP.extent],
                [FIELD_MAP.status]: match[FIELD_MAP.status],
                'Quantity': quantity,
                'DuplicateInfo': masterIdData[masterId].duplicateCount > 1 ? 
                    `Consolidated from ${masterIdData[masterId].duplicateCount} entries` : null
            };
            
            searchResults.push(resultWithQuantity);
            foundIds.push(masterId);
        } else {
            missingMasterIds.push(masterId);
        }
    }

    console.log('Search results with consolidated quantities:', searchResults);
    
    // Display summary including duplicate information
    const totalOriginalEntries = Object.values(masterIdData).reduce((sum, data) => sum + data.duplicateCount, 0);
    console.log(`Original entries: ${totalOriginalEntries}, Unique Master IDs: ${masterIds.length}, Duplicates consolidated: ${duplicates.length}`);
    
    displayResults(masterIds, foundIds, totalOriginalEntries, duplicates.length);
}

function displayResults(searchedIds, foundIds, totalOriginalEntries = null, duplicatesCount = 0) {
    const totalSearched = searchedIds.length;
    const totalFound = foundIds.length;
    const notFound = totalSearched - totalFound;

    // Use the original entry count if provided, otherwise use unique count
    const displaySearchedCount = totalOriginalEntries !== null ? totalOriginalEntries : totalSearched;
    
    displayResultsSummary(displaySearchedCount, totalFound, notFound, totalSearched, duplicatesCount);
    updateResultsDisplay();

    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('downloadPdfBtn').disabled = searchResults.length === 0;
    document.getElementById('downloadXmlBtn').disabled = searchResults.length === 0;
    document.getElementById('uploadStatus').innerHTML = '';
}

function displayResultsSummary(totalSearched, totalFound, notFound, uniqueCount = null, duplicatesCount = 0) {
    const summary = document.getElementById('searchSummary');
    
    let summaryHtml = `
        <div class="row mb-3">
            <div class="col-md-3">
                <div class="alert alert-info">
                    <strong>Total Entries:</strong> ${totalSearched}
                </div>
            </div>`;
    
    // Show unique count if duplicates were found
    if (uniqueCount !== null && duplicatesCount > 0) {
        summaryHtml += `
            <div class="col-md-3">
                <div class="alert alert-warning">
                    <strong>Unique IDs:</strong> ${uniqueCount}
                </div>
            </div>`;
    }
    
    summaryHtml += `
            <div class="col-md-3">
                <div class="alert alert-success">
                    <strong>Found:</strong> ${totalFound}
                </div>
            </div>
            <div class="col-md-3">
                <div class="alert alert-warning">
                    <strong>Not Found:</strong> ${notFound}
                </div>
            </div>
        </div>`;

    // Show duplicate information if any duplicates were consolidated
    if (duplicatesCount > 0) {
        summaryHtml += `
            <div class="alert alert-info">
                <h6><i class="bi bi-info-circle"></i> Duplicate Consolidation:</h6>
                <p class="mb-1">Found <strong>${duplicatesCount}</strong> Master Order ID${duplicatesCount === 1 ? '' : 's'} with multiple entries. 
                Quantities have been automatically summed for each duplicate ID.</p>
                <small class="text-muted">Items with consolidated quantities are marked in the results table.</small>
            </div>`;
    }

    if (missingMasterIds.length > 0) {
        summaryHtml += `
            <div class="alert alert-warning">
                <h6>Missing Master Order IDs:</h6>
                <div class="row">`;
        
        for (let i = 0; i < missingMasterIds.length; i++) {
            summaryHtml += `<div class="col-md-3 col-sm-4 col-6"><small>${missingMasterIds[i]}</small></div>`;
        }
        
        summaryHtml += '</div></div>';
    }

    summary.innerHTML = summaryHtml;
}

function updateResultsDisplay() {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    // Group results by paper type
    const groupedResults = {};
    for (const result of searchResults) {
        const paper = result[FIELD_MAP.paperDesc] || 'Unknown';
        if (!groupedResults[paper]) {
            groupedResults[paper] = [];
        }
        groupedResults[paper].push(result);
    }

    // Sort paper types and items alphabetically
    const paperTypes = Object.keys(groupedResults).sort();
    
    for (const paperType of paperTypes) {
        const items = groupedResults[paperType];
        
        items.sort((a, b) => {
            const masterIdA = String(a[FIELD_MAP.masterId] || '').toLowerCase();
            const masterIdB = String(b[FIELD_MAP.masterId] || '').toLowerCase();
            return masterIdA.localeCompare(masterIdB);
        });
        
        const headerRow = tbody.insertRow();
        headerRow.className = 'table-secondary';
        const headerCell = headerRow.insertCell();
        headerCell.colSpan = 7;
        
        headerCell.innerHTML = `
            <strong>${paperType} (${items.length} items)</strong>
            <button class="delete-section-btn" title="Delete entire ${paperType} section">
                <i class="bi bi-trash"></i> Delete Section
            </button>`;
        
        headerCell.querySelector('.delete-section-btn').onclick = () => deletePaperTypeSection(paperType);

        for (const result of items) {
            const row = tbody.insertRow();
            row.setAttribute('data-master-id', result[FIELD_MAP.masterId]);
            
            // Add duplicate indicator class if this item was consolidated
            if (result['DuplicateInfo']) {
                row.classList.add('table-info');
            }
            
            row.insertCell(0).textContent = result[FIELD_MAP.masterId];
            row.insertCell(1).textContent = result[FIELD_MAP.title] || '';
            row.insertCell(2).textContent = result['Trim Size'] || '';
            row.insertCell(3).textContent = result[FIELD_MAP.paperDesc] || '';
            
            // Quantity cell with duplicate indicator
            const quantityCell = row.insertCell(4);
            let quantityContent = result['Quantity'] || '';
            if (result['DuplicateInfo']) {
                quantityContent += ' <i class="bi bi-stack text-info" title="' + result['DuplicateInfo'] + '"></i>';
            }
            quantityCell.innerHTML = quantityContent;
            
            // Status cell
            row.insertCell(5).textContent = result[FIELD_MAP.status] || '';
            
            // Action cell
            const actionCell = row.insertCell(6);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Delete this item';
            deleteBtn.onclick = () => deleteResultRow(result[FIELD_MAP.masterId]);
            actionCell.appendChild(deleteBtn);
        }
    }
}

function deletePaperTypeSection(paperType) {
    const itemCount = searchResults.filter(result => 
        (result[FIELD_MAP.paperDesc] || 'Unknown') === paperType
    ).length;
    
    const message = `Are you sure you want to delete the entire "${paperType}" section? This will remove ${itemCount} item${itemCount === 1 ? '' : 's'}.`;
    
    showConfirmationModal(message, function() {
        searchResults = searchResults.filter(result => 
            (result[FIELD_MAP.paperDesc] || 'Unknown') !== paperType
        );
        
        updateResultsDisplay();
        
        const foundIds = searchResults.map(r => r[FIELD_MAP.masterId]);
        const originalSearched = foundIds.length + missingMasterIds.length;
        displayResultsSummary(originalSearched, foundIds.length, missingMasterIds.length);
        
        document.getElementById('downloadPdfBtn').disabled = searchResults.length === 0;
        document.getElementById('downloadXmlBtn').disabled = searchResults.length === 0;
        
        if (searchResults.length === 0) {
            document.getElementById('resultsCard').style.display = 'none';
        }
    });
}

function deleteResultRow(masterId) {
    const message = `Are you sure you want to delete the item with Master Order ID: ${masterId}?`;
    
    showConfirmationModal(message, function() {
        const index = searchResults.findIndex(r => r[FIELD_MAP.masterId] === masterId);
        if (index > -1) {
            searchResults.splice(index, 1);
        }
        
        updateResultsDisplay();
        
        const foundIds = searchResults.map(r => r[FIELD_MAP.masterId]);
        const originalSearched = foundIds.length + missingMasterIds.length;
        displayResultsSummary(originalSearched, foundIds.length, missingMasterIds.length);
        
        document.getElementById('downloadPdfBtn').disabled = searchResults.length === 0;
        document.getElementById('downloadXmlBtn').disabled = searchResults.length === 0;
        
        if (searchResults.length === 0) {
            document.getElementById('resultsCard').style.display = 'none';
        }
    });
}

function formatDateForPDF(dateString) {
    if (!dateString) return '';
    
    let date = null;
    
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            let year = parseInt(parts[2], 10);
            
            if (year < 100) {
                year += (year < 50) ? 2000 : 1900;
            }
            
            if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                date = new Date(year, month - 1, day);
            }
        }
    } else if (dateString.includes('-')) {
        date = new Date(dateString);
    } else {
        date = new Date(dateString);
    }
    
    if (!date || isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day}/${month}/${year}`;
}

function downloadPDF() {
    if (searchResults.length === 0) {
        showStatus('No results to download.', 'warning');
        return;
    }

    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF('p', 'mm', 'a4');

    console.log('Generating grouped PDF with', searchResults.length, 'results');

    const formattedWorkDate = formatDateForPDF(workDate);

    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Master Order ID Search Results - Grouped by Paper Type', 20, 20);

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text('Generated: ' + new Date().toLocaleString(), 20, 30);
    pdf.text('Results Found: ' + searchResults.length, 20, 36);
    
    let yPos = 50;
    if (formattedWorkDate) {
        pdf.text('Work Date: ' + formattedWorkDate, 20, 42);
        yPos = 56;
    }

    // Check if any items were consolidated from duplicates
    const consolidatedItems = searchResults.filter(result => result['DuplicateInfo']);
    if (consolidatedItems.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Note: ${consolidatedItems.length} item${consolidatedItems.length === 1 ? ' has' : 's have'} consolidated quantities from duplicate entries.`, 20, yPos - 6);
    }

    if (missingMasterIds.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Missing Master Order IDs (' + missingMasterIds.length + ' not found):', 20, yPos);
        yPos += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        
        let missingText = '';
        for (let i = 0; i < missingMasterIds.length; i++) {
            if (i > 0) missingText += ', ';
            missingText += missingMasterIds[i];
            
            if (missingText.length > 80 * Math.floor(i / 10 + 1)) {
                pdf.text(missingText.substring(missingText.lastIndexOf(',', missingText.length - 20) + 2), 20, yPos);
                yPos += 6;
                missingText = missingMasterIds[i];
            }
        }
        
        if (missingText.length > 0) {
            pdf.text(missingText, 20, yPos);
            yPos += 6;
        }
        
        yPos += 10;
        
        if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
        }
    }

    // Group results by paper type
    const groupedResults = {};
    for (const result of searchResults) {
        const paper = String(result[FIELD_MAP.paperDesc] || 'Unknown').trim();
        if (!groupedResults[paper]) {
            groupedResults[paper] = [];
        }
        groupedResults[paper].push(result);
    }

    console.log('Paper groups created:', Object.keys(groupedResults));

    const colPositions = {
        masterId: { x: 15 },
        title: { x: 35 },
        trimSize: { x: 95 },
        paper: { x: 110 },
        quantity: { x: 150 },
        status: { x: 165 }
    };

    const paperTypes = Object.keys(groupedResults).sort();
    
    for (let groupIndex = 0; groupIndex < paperTypes.length; groupIndex++) {
        const paperType = paperTypes[groupIndex];
        const items = groupedResults[paperType];
        
        items.sort((a, b) => {
            const masterIdA = String(a[FIELD_MAP.masterId] || '').toLowerCase();
            const masterIdB = String(b[FIELD_MAP.masterId] || '').toLowerCase();
            return masterIdA.localeCompare(masterIdB);
        });
        
        console.log(`Processing group ${groupIndex + 1}: ${paperType} with ${items.length} items (sorted by Master Order ID)`);

        if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
        }

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(220, 220, 220);
        pdf.rect(15, yPos - 3, 180, 10, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${paperType} (${items.length} items)`, 17, yPos + 3);
        yPos += 15;

        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        pdf.text('Master ID', colPositions.masterId.x, yPos);
        pdf.text('Title', colPositions.title.x, yPos);
        pdf.text('Trim Size', colPositions.trimSize.x, yPos);
        pdf.text('Paper', colPositions.paper.x, yPos);
        pdf.text('Qty', colPositions.quantity.x, yPos);
        pdf.text('Status', colPositions.status.x, yPos);

        pdf.setLineWidth(0.2);
        pdf.line(15, yPos + 2, 195, yPos + 2);
        yPos += 8;

        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(7);

        for (const result of items) {
            if (yPos > 280) {
                pdf.addPage();
                yPos = 20;
                
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'bold');
                pdf.setFillColor(220, 220, 220);
                pdf.rect(15, yPos - 3, 180, 10, 'F');
                pdf.text(`${paperType} (continued)`, 17, yPos + 3);
                yPos += 15;
                
                pdf.setFontSize(8);
                pdf.text('Master Order ID', colPositions.masterId.x, yPos);
                pdf.text('Title', colPositions.title.x, yPos);
                pdf.text('Trim Size', colPositions.trimSize.x, yPos);
                pdf.text('Paper', colPositions.paper.x, yPos);
                pdf.text('Qty', colPositions.quantity.x, yPos);
                pdf.text('Status', colPositions.status.x, yPos);
                pdf.line(15, yPos + 2, 195, yPos + 2);
                yPos += 8;
                pdf.setFontSize(7);
                pdf.setFont(undefined, 'normal');
            }

            const masterId = String(result[FIELD_MAP.masterId] || '');
            const title = String(result[FIELD_MAP.title] || '');
            const trimSize = String(result['Trim Size'] || '');
            const paper = String(result[FIELD_MAP.paperDesc] || '');
            const quantity = String(result['Quantity'] || '');
            const status = String(result[FIELD_MAP.status] || '');

            pdf.text(masterId.length > 10 ? masterId.substring(0, 10) + '..' : masterId, colPositions.masterId.x, yPos);
            
            if (title.length > 30) {
                pdf.text(title.substring(0, 30) + '...', colPositions.title.x, yPos);
            } else {
                pdf.text(title, colPositions.title.x, yPos);
            }
            
            pdf.text(trimSize, colPositions.trimSize.x, yPos);
            pdf.text(paper.length > 20 ? paper.substring(0, 20) + '..' : paper, colPositions.paper.x, yPos);
            
            // Add asterisk for consolidated quantities
            let quantityText = quantity;
            if (result['DuplicateInfo']) {
                quantityText += '*';
            }
            pdf.text(quantityText, colPositions.quantity.x, yPos);
            
            pdf.text(status.length > 15 ? status.substring(0, 15) + '..' : status, colPositions.status.x, yPos);
            
            yPos += 5;
        }

        if (groupIndex < paperTypes.length - 1) {
            yPos += 10;
        }
    }

    // Add footnote about consolidated quantities if any exist
    if (consolidatedItems.length > 0) {
        if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
        }
        yPos += 10;
        pdf.setFontSize(7);
        pdf.setFont(undefined, 'italic');
        pdf.text('* Quantity consolidated from multiple duplicate entries', 15, yPos);
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, 175, 287);
    }

    const fileName = `1up_WTL_${formatWorkDateForWTL(workDate)}.pdf`;
    console.log('Saving PDF as:', fileName);
    pdf.save(fileName);
}

function downloadXML() {
    if (searchResults.length === 0) {
        showStatus('No results to download.', 'warning');
        return;
    }

    console.log('Generating individual XML files for', searchResults.length, 'results');

    if (typeof JSZip === 'undefined') {
        showStatus('JSZip library not loaded. Please refresh the page and try again.', 'danger');
        return;
    }

    const zip = new JSZip();

    for (const result of searchResults) {
        const isbn = String(result[FIELD_MAP.isbn] || '').trim();
        const masterId = String(result[FIELD_MAP.masterId] || '').trim();
        
        let filename;
        if (isbn && isbn !== '' && isbn.toLowerCase() !== 'n/a') {
            filename = sanitizeFilename(isbn) + '.xml';
        } else {
            filename = sanitizeFilename(masterId) + '_no_isbn.xml';
        }
        
        const xmlContent = generateIndividualXMLContent(result);
        zip.file(filename, xmlContent);
        console.log('Added XML file:', filename, 'for Master Order ID:', masterId);
    }

    zip.generateAsync({type: 'blob'}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `1up_WTL_${formatWorkDateForWTL(workDate)}.zip`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('XML zip file downloaded successfully');
    }).catch(function(error) {
        console.error('Error generating zip file:', error);
        showStatus('Error generating XML files. Please try again.', 'danger');
    });
}

function generateIndividualXMLContent(item) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<BookOrder>
  <MasterOrderID>${escapeXML(item[FIELD_MAP.masterId] || '')}</MasterOrderID>
  <ISBN>${escapeXML(item[FIELD_MAP.isbn] || '')}</ISBN>
  <Title>${escapeXML(item[FIELD_MAP.title] || '')}</Title>
  <TrimSize>${escapeXML(item['Trim Size'] || '')}</TrimSize>
  <Paper>${escapeXML(item[FIELD_MAP.paperDesc] || '')}</Paper>
  <BindStyle>${escapeXML(item[FIELD_MAP.bindStyle] || '')}</BindStyle>
  <Extent>${escapeXML(item[FIELD_MAP.extent] || '')}</Extent>
  <Status>${escapeXML(item[FIELD_MAP.status] || '')}</Status>
  <Quantity>${escapeXML(item['Quantity'] || '0')}</Quantity>
  <ConsolidatedQuantity>${item['DuplicateInfo'] ? 'true' : 'false'}</ConsolidatedQuantity>
  <GeneratedDate>${new Date().toISOString()}</GeneratedDate>
</BookOrder>
`;
    
    return xml;
}

function escapeXML(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function clearAll() {
    csvData = [];
    searchResults = [];
    missingMasterIds = [];
    workDate = '';
    
    const csvFileInput = document.getElementById('csvFileInput');
    
    csvFileInput.value = '';
    
    document.getElementById('uploadStatus').innerHTML = '';
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('resultsTableBody').innerHTML = '';
    document.getElementById('searchSummary').innerHTML = '';
    document.getElementById('downloadPdfBtn').disabled = true;
    document.getElementById('downloadXmlBtn').disabled = true;
    
    showStatus('Application cleared successfully. Ready for new upload.', 'success');
    
    setTimeout(() => {
        document.getElementById('uploadStatus').innerHTML = '';
    }, 3000);
}

function showStatus(message, type) {
    const uploadStatus = document.getElementById('uploadStatus');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.textContent = message;
    uploadStatus.innerHTML = '';
    uploadStatus.appendChild(alertDiv);
}