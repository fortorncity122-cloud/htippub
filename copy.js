// copy.js

// Function to copy table data to the clipboard
function copyTableData() {
  // Get the table element
  const table = document.getElementById('resultsTable');

  // Create a range and select the table content
  const range = document.createRange();
  range.selectNode(table);

  // Add the range to the clipboard
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Execute the copy command
  document.execCommand('copy');

  // Clear the selection
  selection.removeAllRanges();

  // Show a confirmation message (optional)
  alert('Table data copied to clipboard!');
}

// Add event listener to the Copy button
const copyButton = document.getElementById('copyButton');
if (copyButton) {
  copyButton.addEventListener('click', copyTableData);
}
