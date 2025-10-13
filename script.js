let jsonData = [];
let csvData = [];
let searchResults = [];
let filteredResults = [];
let missingMasterIds = [];
let workDate = '';
let pendingDeleteAction = null;
let mpiFilterActive = false;

// Field mappings for the JSON structure
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
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (pendingDeleteAction) {
                pendingDeleteAction();
                pendingDeleteAction = null;
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
            if (modal) {
                modal.hide();
            }
        });
    }
}

function showConfirmationModal(message, deleteAction) {
    document.getElementById('confirmationMessage').textContent = message;
    pendingDeleteAction = deleteAction;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

function setupEventListeners() {
    const csvFileInput = document.getElementById('csvFileInput');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadXmlBtn = document.getElementById('downloadXmlBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const mpiFilterToggle = document.getElementById('mpiFilterToggle');
    
    if (csvFileInput) {
        csvFileInput.addEventListener('change', handleFileSelect);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    
    if (downloadXmlBtn) {
        downloadXmlBtn.addEventListener('click', downloadXML);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAll);
    }
    
    if (mpiFilterToggle) {
        mpiFilterToggle.addEventListener('change', handleMpiFilter);
        console.log('MPI filter toggle event listener added');
    } else {
        console.warn('MPI filter toggle element not found');
    }
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
        
        let fileTypeText = '';
        if (fileType === 'xlsx' || fileType === 'xls') {
            fileTypeText = '<span class="file-type-indicator">Excel</span>';
        } else if (fileType === 'csv') {
            fileTypeText = '<span class="file-type-indicator">CSV</span>';
        }
        
        showStatus(`File "${file.name}" selected ${fileTypeText}. Processing...`, 'info');
        
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

            showStatus(`CSV file loaded successfully! Found ${csvData.length - 1} data rows. Processing Master Order IDs from column E, quantities from column C, and work date from column D...`, 'success');
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
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false
            });
            
            csvData = jsonData.filter(row => row.some(cell => cell && String(cell).trim() !== ''));
            
            if (csvData.length <= 1) {
                showStatus('Excel file appears to be empty or contains only headers.', 'danger');
                return;
            }

            console.log('Excel file processed. Sample data:', csvData.slice(0, 3));
            
            showStatus(`Excel file loaded successfully! Found ${csvData.length - 1} data rows. Processing Master Order IDs from column E, quantities from column C, and work date from column D...`, 'success');
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

    const masterIdData = {};
    workDate = '';
    
    console.log('Processing file data. Total rows:', csvData.length);
    if (csvData.length > 1) {
        console.log('Sample row data:', csvData[1]);
    }
    
    for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        
        while (row.length < 5) {
            row.push('');
        }
        
        const masterIdValue = row[4];
        const quantityValue = row[2];
        const dateValue = row[3];
        
        console.log(`Row ${i}: Master Order ID = ${masterIdValue}, Quantity = ${quantityValue}, Date = ${dateValue}`);
        
        if (!workDate && dateValue && String(dateValue).trim() !== '' && String(dateValue).trim().toLowerCase() !== 'date') {
            workDate = String(dateValue).trim();
            console.log('Work date extracted:', workDate);
        }
        
        if (masterIdValue && String(masterIdValue).trim() !== '') {
            const masterId = String(masterIdValue).trim();
            if (!['master id', 'masterid', 'master', 'master order id'].includes(masterId.toLowerCase())) {
                const quantity = parseInt(String(quantityValue || '0').trim()) || 0;
                
                const orderDate = dateValue && String(dateValue).trim() !== '' && String(dateValue).trim().toLowerCase() !== 'date' 
                    ? String(dateValue).trim() 
                    : '';
                
                if (masterIdData[masterId]) {
                    masterIdData[masterId].quantity += quantity;
                    masterIdData[masterId].duplicateCount++;
                    console.log(`Duplicate found for ${masterId}. New total quantity: ${masterIdData[masterId].quantity}`);
                } else {
                    masterIdData[masterId] = {
                        quantity: quantity,
                        duplicateCount: 1,
                        orderDate: orderDate
                    };
                }
                console.log(`Processed: Master Order ID = ${masterId}, Quantity = ${quantity}, Date = ${orderDate}`);
            }
        }
    }

    const masterIds = Object.keys(masterIdData);
    const quantities = masterIds.map(id => masterIdData[id].quantity.toString());
    
    console.log('Total unique Master Order IDs processed:', masterIds.length);
    console.log('Work date from file:', workDate);
    
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
                [FIELD_MAP.coverSpine]: match[FIELD_MAP.coverSpine],
                [FIELD_MAP.status]: match[FIELD_MAP.status],
                'Quantity': quantity,
                'OrderDate': masterIdData[masterId].orderDate || '',
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
    
    const totalOriginalEntries = Object.values(masterIdData).reduce((sum, data) => sum + data.duplicateCount, 0);
    console.log(`Original entries: ${totalOriginalEntries}, Unique Master IDs: ${masterIds.length}, Duplicates consolidated: ${duplicates.length}`);
    
    displayResults(masterIds, foundIds, totalOriginalEntries, duplicates.length);
}

function handleMpiFilter() {
    const mpiFilterToggle = document.getElementById('mpiFilterToggle');
    
    if (!mpiFilterToggle) {
        console.error('MPI filter toggle element not found');
        return;
    }
    
    mpiFilterActive = mpiFilterToggle.checked;
    
    console.log('MPI filter toggled:', mpiFilterActive);
    console.log('Current search results:', searchResults.length);
    
    applyMpiFilter();
    updateResultsDisplay();
    updateFilteredSummary();
    
    console.log('Filtered results:', filteredResults.length);
}

function applyMpiFilter() {
    if (mpiFilterActive) {
        filteredResults = searchResults.filter(result => {
            const status = String(result[FIELD_MAP.status] || '').trim().toLowerCase();
            return status === 'mpi';
        });
        console.log(`Filtered to ${filteredResults.length} MPI items from ${searchResults.length} total items`);
    } else {
        filteredResults = [...searchResults];
        console.log('Filter disabled, showing all results');
    }
}

function getCurrentResults() {
    return mpiFilterActive ? filteredResults : searchResults;
}

function displayResults(searchedIds, foundIds, totalOriginalEntries = null, duplicatesCount = 0) {
    applyMpiFilter();
    updateFilteredSummary();
    updateResultsDisplay();

    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('uploadStatus').innerHTML = '';
}

function updateFilteredSummary() {
    const summary = document.getElementById('searchSummary');
    const currentResults = getCurrentResults();
    
    const totalOriginalEntries = searchResults.length + missingMasterIds.length;
    const duplicatesCount = searchResults.filter(result => result['DuplicateInfo']).length;
    
    let summaryHtml = `
        <div class="row mb-3">
            <div class="col-md-3">
                <div class="alert alert-info">
                    <strong>Total Entries:</strong> ${totalOriginalEntries}
                </div>
            </div>`;
    
    if (mpiFilterActive) {
        summaryHtml += `
            <div class="col-md-3">
                <div class="alert alert-primary">
                    <strong>MPI Items:</strong> ${currentResults.length}
                </div>
            </div>`;
    }
    
    summaryHtml += `
            <div class="col-md-3">
                <div class="alert alert-success">
                    <strong>Found:</strong> ${searchResults.length}
                </div>
            </div>
            <div class="col-md-3">
                <div class="alert alert-warning">
                    <strong>Not Found:</strong> ${missingMasterIds.length}
                </div>
            </div>
        </div>`;

    if (duplicatesCount > 0) {
        summaryHtml += `
            <div class="alert alert-info">
                <h6><i class="bi bi-info-circle"></i> Duplicate Consolidation:</h6>
                <p class="mb-1">Found <strong>${duplicatesCount}</strong> Master Order ID${duplicatesCount === 1 ? '' : 's'} with multiple entries. 
                Quantities have been automatically summed for each duplicate ID.</p>
                <small class="text-muted">Items with consolidated quantities are marked in the results table.</small>
            </div>`;
    }

    if (mpiFilterActive) {
        const podReadyCount = searchResults.filter(result => {
            const status = String(result[FIELD_MAP.status] || '').trim().toLowerCase();
            return status === 'pod ready';
        }).length;
        
        summaryHtml += `
            <div class="alert alert-primary">
                <h6><i class="bi bi-funnel"></i> MPI Filter Active:</h6>
                <p class="mb-1">Showing <strong>${currentResults.length}</strong> items with MPI status. 
                <strong>${podReadyCount}</strong> Pod Ready items are hidden.</p>
                <small class="text-muted">Toggle off "MPI Only" filter to see all results.</small>
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

    const currentResults = getCurrentResults();
    
    const groupedResults = {};
    for (const result of currentResults) {
        const paper = result[FIELD_MAP.paperDesc] || 'Unknown';
        if (!groupedResults[paper]) {
            groupedResults[paper] = [];
        }
        groupedResults[paper].push(result);
    }

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
        headerCell.colSpan = 8;
        
        const filterSuffix = mpiFilterActive ? ' (MPI filtered)' : '';
        headerCell.innerHTML = `
            <strong>${paperType} (${items.length} items${filterSuffix})</strong>
            <button class="delete-section-btn" title="Delete entire ${paperType} section">
                <i class="bi bi-trash"></i> Delete Section
            </button>`;
        
        headerCell.querySelector('.delete-section-btn').onclick = () => deletePaperTypeSection(paperType);

        for (const result of items) {
            const row = tbody.insertRow();
            row.setAttribute('data-master-id', result[FIELD_MAP.masterId]);
            
            if (result['DuplicateInfo']) {
                row.classList.add('table-info');
            }
            
            const status = String(result[FIELD_MAP.status] || '').trim().toLowerCase();
            if (status === 'mpi') {
                row.classList.add('table-warning');
            }
            
            row.insertCell(0).textContent = result[FIELD_MAP.masterId];
            row.insertCell(1).textContent = result[FIELD_MAP.isbn] || '';
            row.insertCell(2).textContent = result[FIELD_MAP.title] || '';
            row.insertCell(3).textContent = result['Trim Size'] || '';
            row.insertCell(4).textContent = result[FIELD_MAP.paperDesc] || '';
            
            const quantityCell = row.insertCell(5);
            let quantityContent = result['Quantity'] || '';
            if (result['DuplicateInfo']) {
                quantityContent += ' <i class="bi bi-stack text-info" title="' + result['DuplicateInfo'] + '"></i>';
            }
            quantityCell.innerHTML = quantityContent;
            
            const statusCell = row.insertCell(6);
            const statusText = result[FIELD_MAP.status] || '';
            if (status === 'mpi') {
                statusCell.innerHTML = `<span class="badge bg-warning text-dark">${statusText}</span>`;
            } else {
                statusCell.textContent = statusText;
            }
            
            const actionCell = row.insertCell(7);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Delete this item';
            deleteBtn.onclick = () => deleteResultRow(result[FIELD_MAP.masterId]);
            actionCell.appendChild(deleteBtn);
        }
    }
    
    const hasResults = currentResults.length > 0;
    document.getElementById('downloadPdfBtn').disabled = !hasResults;
    document.getElementById('downloadXmlBtn').disabled = !hasResults;
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
        
        applyMpiFilter();
        updateResultsDisplay();
        updateFilteredSummary();
        
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
        
        applyMpiFilter();
        updateResultsDisplay();
        updateFilteredSummary();
        
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
    const currentResults = getCurrentResults();
    
    if (currentResults.length === 0) {
        showStatus('No results to download.', 'warning');
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        showStatus('PDF library not loaded. Please refresh the page and try again.', 'danger');
        console.error('jsPDF library not found');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        console.log('Generating grouped PDF with', currentResults.length, 'results');

        const formattedWorkDate = formatDateForPDF(workDate);
        const filterSuffix = mpiFilterActive ? ' (MPI Only)' : '';

        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Master Order ID Search Results - Grouped by Paper Type${filterSuffix}`, 20, 20);

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text('Generated: ' + new Date().toLocaleString(), 20, 30);
        pdf.text('Results Found: ' + currentResults.length, 20, 36);
        
        let yPos = 50;
        if (formattedWorkDate) {
            pdf.text('Work Date: ' + formattedWorkDate, 20, 42);
            yPos = 56;
        }

        if (mpiFilterActive) {
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'italic');
            pdf.text('Filter: MPI status items only', 20, yPos - 8);
        }

        const consolidatedItems = currentResults.filter(result => result['DuplicateInfo']);
        if (consolidatedItems.length > 0) {
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'italic');
            const noteYPos = mpiFilterActive ? yPos - 3 : yPos - 4;
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
        }

        const groupedResults = {};
        for (const result of currentResults) {
            const paper = String(result[FIELD_MAP.paperDesc] || 'Unknown').trim();
            if (!groupedResults[paper]) {
                groupedResults[paper] = [];
            }
            groupedResults[paper].push(result);
        }

        const colPositions = {
            masterId: { x: 15 },
            isbn: { x: 32 },
            title: { x: 55 },
            trimSize: { x: 105 },
            paper: { x: 125 },
            quantity: { x: 165 },
            status: { x: 180 }
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
            pdf.text('ISBN', colPositions.isbn.x, yPos);
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
                    pdf.text('Master ID', colPositions.masterId.x, yPos);
                    pdf.text('ISBN', colPositions.isbn.x, yPos);
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
                const isbn = String(result[FIELD_MAP.isbn] || '');
                const title = String(result[FIELD_MAP.title] || '');
                const trimSize = String(result['Trim Size'] || '');
                const paper = String(result[FIELD_MAP.paperDesc] || '');
                const quantity = String(result['Quantity'] || '');
                const status = String(result[FIELD_MAP.status] || '');

                pdf.text(masterId.length > 10 ? masterId.substring(0, 10) + '..' : masterId, colPositions.masterId.x, yPos);
                pdf.text(isbn.length > 13 ? isbn.substring(0, 13) : isbn, colPositions.isbn.x, yPos);
                
                if (title.length > 25) {
                    pdf.text(title.substring(0, 25) + '...', colPositions.title.x, yPos);
                } else {
                    pdf.text(title, colPositions.title.x, yPos);
                }
                
                pdf.text(trimSize, colPositions.trimSize.x, yPos);
                pdf.text(paper.length > 20 ? paper.substring(0, 20) + '..' : paper, colPositions.paper.x, yPos);
                
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

        const filterPrefix = mpiFilterActive ? 'MPI_' : '';
        const fileName = `1up_WTL_${filterPrefix}${formatWorkDateForWTL(workDate)}.pdf`;
        console.log('Saving PDF as:', fileName);
        pdf.save(fileName);
        
        showStatus('PDF generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showStatus('Error generating PDF. Please try again.', 'danger');
    }
}

function downloadXML() {
    const currentResults = getCurrentResults();
    
    if (currentResults.length === 0) {
        showStatus('No results to download.', 'warning');
        return;
    }

    console.log('Generating individual XML files for', currentResults.length, 'results');

    if (typeof JSZip === 'undefined') {
        showStatus('JSZip library not loaded. Please refresh the page and try again.', 'danger');
        return;
    }

    const zip = new JSZip();

    for (const result of currentResults) {
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
        
        const filterPrefix = mpiFilterActive ? 'MPI_' : '';
        link.download = `1up_WTL_${filterPrefix}${formatWorkDateForWTL(workDate)}.zip`;
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
  <Spine>${escapeXML(item[FIELD_MAP.coverSpine] || '')}</Spine>
  <Status>${escapeXML(item[FIELD_MAP.status] || '')}</Status>
  <Quantity>${escapeXML(item['Quantity'] || '0')}</Quantity>
  <OrderDate>${escapeXML(item['OrderDate'] || '')}</OrderDate>
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
    filteredResults = [];
    missingMasterIds = [];
    workDate = '';
    mpiFilterActive = false;
    
    const csvFileInput = document.getElementById('csvFileInput');
    const mpiFilterToggle = document.getElementById('mpiFilterToggle');
    
    if (csvFileInput) {
        csvFileInput.value = '';
    }
    
    if (mpiFilterToggle) {
        mpiFilterToggle.checked = false;
    }
    
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
    if (uploadStatus) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.textContent = message;
        uploadStatus.innerHTML = '';
        uploadStatus.appendChild(alertDiv);
    }
}