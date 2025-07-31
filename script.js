var jsonData = [];
var csvData = [];
var searchResults = [];
var missingMasterIds = [];
var pendingDeleteAction = null;

document.addEventListener('DOMContentLoaded', function() {
    loadJsonData();
    setupEventListeners();
    setupConfirmationModal();
    initializeDatePicker();
});

function initializeDatePicker() {
    // Set today's date as default in YYYY-MM-DD format (HTML5 date input format)
    var today = new Date();
    var dateString = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');
    
    document.getElementById('workDatePicker').value = dateString;
}

function formatDateInput(input) {
    // Not needed for HTML5 date input
}

function parseInputDate(dateString) {
    // HTML5 date input returns YYYY-MM-DD format
    if (!dateString) return null;
    return new Date(dateString);
}

function updateDateDisplay() {
    // Not needed for HTML5 date input
}

function setupConfirmationModal() {
    var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.addEventListener('click', function() {
        if (pendingDeleteAction) {
            pendingDeleteAction();
            pendingDeleteAction = null;
        }
        
        // Hide the modal
        var modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
        modal.hide();
    });
}

function showConfirmationModal(message, deleteAction) {
    document.getElementById('confirmationMessage').textContent = message;
    pendingDeleteAction = deleteAction;
    
    var modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

function setupEventListeners() {
    var csvUploadArea = document.getElementById('csvUploadArea');
    var csvFileInput = document.getElementById('csvFileInput');
    
    csvUploadArea.addEventListener('click', function() { 
        csvFileInput.click(); 
    });
    csvUploadArea.addEventListener('dragover', handleDragOver);
    csvUploadArea.addEventListener('drop', handleCsvDrop);
    csvFileInput.addEventListener('change', handleCsvFileSelect);

    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('downloadXmlBtn').addEventListener('click', downloadXML);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
    document.getElementById('lookupBtn').addEventListener('click', lookupSingleMasterId);
    document.getElementById('clearLookupBtn').addEventListener('click', clearLookup);
    
    document.getElementById('singleMasterIdInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupSingleMasterId();
        }
    });
}

function loadJsonData() {
    fetch('masterID_paper.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            jsonData = data;
            console.log('JSON database loaded successfully! Found ' + jsonData.length + ' records.');
        })
        .catch(function(error) {
            console.error('Error loading JSON:', error);
            alert('Error loading JSON database. Make sure "masterID_paper.json" is in the same directory as this HTML file.');
        });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleCsvDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    var files = e.dataTransfer.files;
    if (files.length > 0) {
        handleCsvFile(files[0]);
    }
}

function handleCsvFileSelect(e) {
    if (e.target.files.length > 0) {
        handleCsvFile(e.target.files[0]);
    }
}

function handleCsvFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showStatus('Please select a CSV file.', 'danger');
        return;
    }

    showStatus('Processing CSV file...', 'info');

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var lines = e.target.result.split('\n');
            csvData = lines.map(function(line) {
                var cells = [];
                var current = '';
                var inQuotes = false;
                
                for (var i = 0; i < line.length; i++) {
                    var char = line[i];
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
            }).filter(function(row) {
                return row.length > 3 && row.some(function(cell) { 
                    return cell.length > 0; 
                });
            });
            
            if (csvData.length <= 1) {
                showStatus('CSV file appears to be empty or contains only headers.', 'danger');
                return;
            }

            showStatus('CSV file loaded successfully! Found ' + (csvData.length - 1) + ' data rows. Processing Master IDs from column D and quantities from column B...', 'success');
            setTimeout(processData, 1000);
            
        } catch (error) {
            showStatus('Error reading CSV file. Please check the file format.', 'danger');
            console.error('CSV parsing error:', error);
        }
    };
    reader.readAsText(file);
}

function lookupSingleMasterId() {
    var input = document.getElementById('singleMasterIdInput');
    var resultDiv = document.getElementById('singleLookupResult');
    var masterId = input.value.trim();
    
    if (!masterId) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a Master ID to search.</div>';
        return;
    }
    
    if (jsonData.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-danger">JSON database not loaded. Please refresh the page.</div>';
        return;
    }
    
    var result = null;
    for (var i = 0; i < jsonData.length; i++) {
        if (String(jsonData[i]['Master ID']).trim().toLowerCase() === masterId.toLowerCase()) {
            result = jsonData[i];
            break;
        }
    }
    
    if (result) {
        var html = '<div class="border rounded p-3" style="background-color: #f8f9fa;">';
        html += '<div class="d-flex align-items-center mb-2">';
        html += '<span class="text-success me-2">Found</span>';
        html += '<strong>Master ID Found</strong>';
        html += '</div>';
        html += '<div class="row g-2">';
        html += '<div class="col-6 col-md-3">';
        html += '<small class="text-muted">Master ID:</small><br>';
        html += '<span class="fw-bold">' + result['Master ID'] + '</span>';
        html += '</div>';
        html += '<div class="col-6 col-md-3">';
        html += '<small class="text-muted">ISBN:</small><br>';
        html += '<span>' + (result['ISBN'] || 'N/A') + '</span>';
        html += '</div>';
        html += '<div class="col-6 col-md-3">';
        html += '<small class="text-muted">Trim Size:</small><br>';
        html += '<span>' + (result['Trim Size'] || 'N/A') + '</span>';
        html += '</div>';
        html += '<div class="col-6 col-md-3">';
        html += '<small class="text-muted">Paper:</small><br>';
        html += '<span class="fw-bold">' + (result['Paper'] || 'N/A') + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="row mt-2">';
        html += '<div class="col-12">';
        html += '<small class="text-muted">Title:</small><br>';
        html += '<span class="fw-bold">' + (result['Title'] || 'N/A') + '</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        resultDiv.innerHTML = html;
    } else {
        var html = '<div class="border rounded p-2" style="background-color: #fff3cd;">';
        html += '<div class="d-flex align-items-center">';
        html += '<span class="text-warning me-2">Not Found</span>';
        html += '<span><strong>Master ID "' + masterId + '" was not found in the database.</strong></span>';
        html += '</div>';
        html += '</div>';
        resultDiv.innerHTML = html;
    }
}

function processData() {
    if (jsonData.length === 0) {
        alert('JSON database not loaded. Please refresh the page.');
        return;
    }

    if (csvData.length === 0) {
        alert('Please upload a CSV file first.');
        return;
    }

    var masterIds = [];
    var quantities = [];
    
    console.log('Processing CSV data. Total rows:', csvData.length);
    if (csvData.length > 1) {
        console.log('Sample row data:', csvData[1]);
    }
    
    for (var i = 1; i < csvData.length; i++) {
        var masterIdValue = csvData[i][3]; // Column D = index 3
        var quantityValue = csvData[i][1]; // Column B = index 1
        
        console.log('Row ' + i + ': Master ID =', masterIdValue, ', Quantity =', quantityValue);
        
        if (masterIdValue && String(masterIdValue).trim() !== '') {
            var masterId = String(masterIdValue).trim();
            if (masterId.toLowerCase() !== 'master id' && masterId.toLowerCase() !== 'masterid') {
                masterIds.push(masterId);
                quantities.push(String(quantityValue || '0').trim());
                console.log('Added: Master ID =', masterId, ', Quantity =', quantityValue);
            }
        }
    }

    console.log('Total Master IDs processed:', masterIds.length);
    console.log('Quantities array:', quantities);

    searchResults = [];
    missingMasterIds = [];
    var foundIds = [];

    for (var i = 0; i < masterIds.length; i++) {
        var masterId = masterIds[i];
        var quantity = quantities[i];
        var match = null;
        
        for (var j = 0; j < jsonData.length; j++) {
            if (String(jsonData[j]['Master ID']).trim() === masterId) {
                match = jsonData[j];
                break;
            }
        }
        
        if (match) {
            var resultWithQuantity = {
                'Master ID': match['Master ID'],
                'ISBN': match['ISBN'],
                'Title': match['Title'],
                'Trim Size': match['Trim Size'],
                'Paper': match['Paper'],
                'Quantity': quantity
            };
            
            console.log('Result with quantity:', resultWithQuantity);
            
            searchResults.push(resultWithQuantity);
            foundIds.push(masterId);
        } else {
            missingMasterIds.push(masterId);
        }
    }

    console.log('Search results with quantities:', searchResults);
    displayResults(masterIds, foundIds);
}

function displayResults(searchedIds, foundIds) {
    var tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    var summary = document.getElementById('searchSummary');
    var totalSearched = searchedIds.length;
    var totalFound = foundIds.length;
    var notFound = totalSearched - totalFound;

    displayResultsSummary(totalSearched, totalFound, notFound);
    updateResultsDisplay();

    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('downloadPdfBtn').disabled = searchResults.length === 0;
    document.getElementById('downloadXmlBtn').disabled = searchResults.length === 0;
    
// Hide the CSV loading message once results are displayed
document.getElementById('uploadStatus').innerHTML = '';
}

function displayResultsSummary(totalSearched, totalFound, notFound) {
    var summary = document.getElementById('searchSummary');
    
    var summaryHtml = '<div class="row mb-3">';
    summaryHtml += '<div class="col-md-4">';
    summaryHtml += '<div class="alert alert-info">';
    summaryHtml += '<strong>Total Searched:</strong> ' + totalSearched;
    summaryHtml += '</div>';
    summaryHtml += '</div>';
    summaryHtml += '<div class="col-md-4">';
    summaryHtml += '<div class="alert alert-success">';
    summaryHtml += '<strong>Found:</strong> ' + totalFound;
    summaryHtml += '</div>';
    summaryHtml += '</div>';
    summaryHtml += '<div class="col-md-4">';
    summaryHtml += '<div class="alert alert-warning">';
    summaryHtml += '<strong>Not Found:</strong> ' + notFound;
    summaryHtml += '</div>';
    summaryHtml += '</div>';
    summaryHtml += '</div>';

    if (missingMasterIds.length > 0) {
        summaryHtml += '<div class="alert alert-warning">';
        summaryHtml += '<h6>Missing Master IDs:</h6>';
        summaryHtml += '<div class="row">';
        
        for (var i = 0; i < missingMasterIds.length; i++) {
            summaryHtml += '<div class="col-md-3 col-sm-4 col-6"><small>' + missingMasterIds[i] + '</small></div>';
        }
        
        summaryHtml += '</div></div>';
    }

    summary.innerHTML = summaryHtml;
}

function updateResultsDisplay() {
    var tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    // Group results by paper type
    var groupedResults = {};
    for (var i = 0; i < searchResults.length; i++) {
        var result = searchResults[i];
        var paper = result['Paper'] || 'Unknown';
        if (!groupedResults[paper]) {
            groupedResults[paper] = [];
        }
        groupedResults[paper].push(result);
    }

    // Sort paper types alphabetically
    var paperTypes = Object.keys(groupedResults).sort();
    
    for (var i = 0; i < paperTypes.length; i++) {
        var paperType = paperTypes[i];
        var items = groupedResults[paperType];
        
        // Sort items by Master ID alphabetically within each paper type
        items.sort(function(a, b) {
            var masterIdA = String(a['Master ID'] || '').toLowerCase();
            var masterIdB = String(b['Master ID'] || '').toLowerCase();
            return masterIdA.localeCompare(masterIdB);
        });
        
        var headerRow = tbody.insertRow();
        headerRow.className = 'table-secondary';
        var headerCell = headerRow.insertCell();
        headerCell.colSpan = 6;
        
        var headerContent = '<strong>' + paperType + ' (' + items.length + ' items)</strong>';
        headerContent += '<button class="delete-section-btn" title="Delete entire ' + paperType + ' section">';
        headerContent += '<i class="bi bi-trash"></i> Delete Section';
        headerContent += '</button>';
        
        headerCell.innerHTML = headerContent;
        
        // Add click event to the delete section button
        var deleteSectionBtn = headerCell.querySelector('.delete-section-btn');
        deleteSectionBtn.onclick = function(paperTypeName) {
            return function() {
                deletePaperTypeSection(paperTypeName);
            };
        }(paperType);

        for (var j = 0; j < items.length; j++) {
            var result = items[j];
            var row = tbody.insertRow();
            row.setAttribute('data-master-id', result['Master ID']);
            row.insertCell(0).textContent = result['Master ID'];
            row.insertCell(1).textContent = result['Title'] || '';
            row.insertCell(2).textContent = result['Trim Size'] || '';
            row.insertCell(3).textContent = result['Paper'] || '';
            row.insertCell(4).textContent = result['Quantity'] || '';
            
            var actionCell = row.insertCell(5);
            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Delete this item';
            deleteBtn.onclick = function(masterId) {
                return function() {
                    deleteResultRow(masterId);
                };
            }(result['Master ID']);
            actionCell.appendChild(deleteBtn);
        }
    }
}

function deletePaperTypeSection(paperType) {
    var itemCount = 0;
    for (var i = 0; i < searchResults.length; i++) {
        if ((searchResults[i]['Paper'] || 'Unknown') === paperType) {
            itemCount++;
        }
    }
    
    var message = 'Are you sure you want to delete the entire "' + paperType + '" section? This will remove ' + itemCount + ' item' + (itemCount === 1 ? '' : 's') + '.';
    
    showConfirmationModal(message, function() {
        // Remove all items with this paper type from searchResults array
        searchResults = searchResults.filter(function(result) {
            return (result['Paper'] || 'Unknown') !== paperType;
        });
        
        // Refresh the display
        updateResultsDisplay();
        
        // Update the summary
        var foundIds = [];
        for (var i = 0; i < searchResults.length; i++) {
            foundIds.push(searchResults[i]['Master ID']);
        }
        
        // Recalculate summary
        var originalSearched = foundIds.length + missingMasterIds.length;
        displayResultsSummary(originalSearched, foundIds.length, missingMasterIds.length);
        
        // Update buttons state
        document.getElementById('downloadPdfBtn').disabled = searchResults.length === 0;
        document.getElementById('downloadXmlBtn').disabled = searchResults.length === 0;
        
        // Hide results section if no results left
        if (searchResults.length === 0) {
            document.getElementById('resultsCard').style.display = 'none';
        }
    });
}

function deleteResultRow(masterId) {
    var message = 'Are you sure you want to delete the item with Master ID: ' + masterId + '?';
    
    showConfirmationModal(message, function() {
        for (var i = 0; i < searchResults.length; i++) {
            if (searchResults[i]['Master ID'] === masterId) {
                searchResults.splice(i, 1);
                break;
            }
        }
        
        updateResultsDisplay();
        
        var foundIds = [];
        for (var i = 0; i < searchResults.length; i++) {
            foundIds.push(searchResults[i]['Master ID']);
        }
        
        var originalSearched = foundIds.length + missingMasterIds.length;
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
    
    // HTML5 date input returns YYYY-MM-DD format
    var date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year
    
    return day + '/' + month + '/' + year;
}

function downloadPDF() {
    if (searchResults.length === 0) {
        alert('No results to download.');
        return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF('p', 'mm', 'a4');

    console.log('Generating grouped PDF with', searchResults.length, 'results');

    // Get the selected work date
    var workDateInput = document.getElementById('workDatePicker');
    var workDate = workDateInput.value;
    var formattedWorkDate = formatDateForPDF(workDate);

    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Master ID Search Results - Grouped by Paper Type', 20, 20);

    // pdf.setFontSize(10);
    // pdf.setFont(undefined, 'normal');
    //pdf.text('Generated: ' + new Date().toLocaleString(), 20, 30);
    //pdf.text('Results Found: ' + searchResults.length, 20, 36);
    
    // Add work date to PDF header
    if (formattedWorkDate) {
        pdf.text('Missing List Date: ' + formattedWorkDate, 20, 36);
        var yPos = 56;
    } else {
        var yPos = 50;
    }

    if (missingMasterIds.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Missing Master IDs (' + missingMasterIds.length + ' not found):', 20, yPos);
        yPos += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        
        var missingText = '';
        for (var i = 0; i < missingMasterIds.length; i++) {
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
    var groupedResults = {};
    for (var i = 0; i < searchResults.length; i++) {
        var result = searchResults[i];
        var paper = String(result['Paper'] || 'Unknown').trim();
        if (!groupedResults[paper]) {
            groupedResults[paper] = [];
        }
        groupedResults[paper].push(result);
    }

    console.log('Paper groups created:', Object.keys(groupedResults));

    var colPositions = {
        masterId: { x: 15 },
        title: { x: 37 },
        trimSize: { x: 105 },
        paper: { x: 125 },
        quantity: { x: 175 }
    };

    // Sort paper types alphabetically
    var paperTypes = Object.keys(groupedResults).sort();
    
    for (var groupIndex = 0; groupIndex < paperTypes.length; groupIndex++) {
        var paperType = paperTypes[groupIndex];
        var items = groupedResults[paperType];
        
        // Sort items by Master ID alphabetically within each paper type
        items.sort(function(a, b) {
            var masterIdA = String(a['Master ID'] || '').toLowerCase();
            var masterIdB = String(b['Master ID'] || '').toLowerCase();
            return masterIdA.localeCompare(masterIdB);
        });
        
        console.log('Processing group ' + (groupIndex + 1) + ': ' + paperType + ' with ' + items.length + ' items (sorted by Master ID)');

        if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
        }

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(220, 220, 220);
        pdf.rect(15, yPos - 3, 180, 10, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.text(paperType + ' (' + items.length + ' items)', 17, yPos + 3);
        yPos += 15;

        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        pdf.text('Master ID', colPositions.masterId.x, yPos);
        pdf.text('Title', colPositions.title.x, yPos);
        pdf.text('Trim Size', colPositions.trimSize.x, yPos);
        pdf.text('Paper', colPositions.paper.x, yPos);
        pdf.text('Quantity', colPositions.quantity.x, yPos);

        pdf.setLineWidth(0.2);
        pdf.line(15, yPos + 2, 195, yPos + 2);
        yPos += 8;

        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(7);

        for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
            var result = items[itemIndex];
            
            if (yPos > 280) {
                pdf.addPage();
                yPos = 20;
                
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'bold');
                pdf.setFillColor(220, 220, 220);
                pdf.rect(15, yPos - 3, 180, 10, 'F');
                pdf.text(paperType + ' (continued)', 17, yPos + 3);
                yPos += 15;
                
                pdf.setFontSize(8);
                pdf.text('Master ID', colPositions.masterId.x, yPos);
                pdf.text('Title', colPositions.title.x, yPos);
                pdf.text('Trim Size', colPositions.trimSize.x, yPos);
                pdf.text('Paper', colPositions.paper.x, yPos);
                pdf.text('Quantity', colPositions.quantity.x, yPos);
                pdf.line(15, yPos + 2, 195, yPos + 2);
                yPos += 8;
                pdf.setFontSize(7);
                pdf.setFont(undefined, 'normal');
            }

            var masterId = String(result['Master ID'] || '');
            var title = String(result['Title'] || '');
            var trimSize = String(result['Trim Size'] || '');
            var paper = String(result['Paper'] || '');
            var quantity = String(result['Quantity'] || '');

            pdf.text(masterId.length > 10 ? masterId.substring(0, 10) + '..' : masterId, colPositions.masterId.x, yPos);
            
            if (title.length > 35) {
                pdf.text(title.substring(0, 35) + '...', colPositions.title.x, yPos);
            } else {
                pdf.text(title, colPositions.title.x, yPos);
            }
            
            pdf.text(trimSize, colPositions.trimSize.x, yPos);
            pdf.text(paper.length > 25 ? paper.substring(0, 25) + '..' : paper, colPositions.paper.x, yPos);
            pdf.text(quantity, colPositions.quantity.x, yPos);
            
            yPos += 5;
        }

        if (groupIndex < paperTypes.length - 1) {
            yPos += 10;
        }
    }

    var pageCount = pdf.internal.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text('Page ' + i + ' of ' + pageCount, 175, 287);
    }

    var fileName = 'master_id_results_grouped_by_paper_' + new Date().toISOString().split('T')[0] + '.pdf';
    console.log('Saving PDF as:', fileName);
    pdf.save(fileName);
}

function downloadXML() {
    if (searchResults.length === 0) {
        alert('No results to download.');
        return;
    }

    console.log('Generating individual XML files for', searchResults.length, 'results');

    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded. Please refresh the page and try again.');
        return;
    }

    // Create JSZip instance
    var zip = new JSZip();

    // Generate individual XML file for each result
    for (var i = 0; i < searchResults.length; i++) {
        var result = searchResults[i];
        
        // Use ISBN as filename, fallback to Master ID if ISBN is missing
        var isbn = String(result['ISBN'] || '').trim();
        var masterId = String(result['Master ID'] || '').trim();
        
        var filename;
        if (isbn && isbn !== '' && isbn.toLowerCase() !== 'n/a') {
            filename = sanitizeFilename(isbn) + '.xml';
        } else {
            // Fallback to Master ID if ISBN is not available
            filename = sanitizeFilename(masterId) + '_no_isbn.xml';
        }
        
        var xmlContent = generateIndividualXMLContent(result);
        
        zip.file(filename, xmlContent);
        console.log('Added XML file:', filename, 'for Master ID:', masterId);
    }

    // Generate the zip file and download
    zip.generateAsync({type: 'blob'}).then(function(content) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'master_id_xml_files_' + new Date().toISOString().split('T')[0] + '.zip';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('XML zip file with', searchResults.length, 'individual files downloaded successfully');
    }).catch(function(error) {
        console.error('Error generating zip file:', error);
        alert('Error generating XML files. Please try again.');
    });
}

function generateIndividualXMLContent(item) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<BookOrder>\n';
    xml += '  <MasterID>' + escapeXML(item['Master ID'] || '') + '</MasterID>\n';
    xml += '  <ISBN>' + escapeXML(item['ISBN'] || '') + '</ISBN>\n';
    xml += '  <Title>' + escapeXML(item['Title'] || '') + '</Title>\n';
    xml += '  <TrimSize>' + escapeXML(item['Trim Size'] || '') + '</TrimSize>\n';
    xml += '  <Paper>' + escapeXML(item['Paper'] || '') + '</Paper>\n';
    xml += '  <Quantity>' + escapeXML(item['Quantity'] || '0') + '</Quantity>\n';
    xml += '  <GeneratedDate>' + new Date().toISOString() + '</GeneratedDate>\n';
    xml += '</BookOrder>\n';
    
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

function clearLookup() {
    document.getElementById('singleMasterIdInput').value = '';
    document.getElementById('singleLookupResult').innerHTML = '';
    document.getElementById('singleMasterIdInput').focus();
}

function clearAll() {
    csvData = [];
    searchResults = [];
    missingMasterIds = [];
    
    document.getElementById('csvFileInput').value = '';
    document.getElementById('uploadStatus').innerHTML = '';
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('resultsTableBody').innerHTML = '';
    document.getElementById('searchSummary').innerHTML = '';
    document.getElementById('downloadPdfBtn').disabled = true;
    document.getElementById('downloadXmlBtn').disabled = true;
    
    clearLookup();
    
    showStatus('Application cleared successfully. Ready for new upload.', 'success');
    
    setTimeout(function() {
        document.getElementById('uploadStatus').innerHTML = '';
    }, 3000);
}

function showStatus(message, type) {
    var uploadStatus = document.getElementById('uploadStatus');
    var alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type;
    alertDiv.textContent = message;
    uploadStatus.innerHTML = '';
    uploadStatus.appendChild(alertDiv);
}