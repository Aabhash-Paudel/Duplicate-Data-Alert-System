console.log("Extension loaded");

chrome.downloads.onCreated.addListener(function(downloadItem) {
  console.log("Download started:", downloadItem);
  
  const fileData = {
    filename: downloadItem.filename,
    fileSize: downloadItem.fileSize,
    url: downloadItem.url
  };

  checkForDuplicates(fileData);
});

function checkForDuplicates(fileData) {
  console.log("Checking for duplicates:", fileData);
  
  fetch('http://localhost:3000/check-duplicate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fileData)
  })
  .then(response => response.json())
  .then(data => {
    console.log("API response:", data);
    if (data.isDuplicate) {
      alert(`Potential duplicate found: ${data.originalFile}`);
    }
  })
  .catch(error => console.error('Error:', error));
}