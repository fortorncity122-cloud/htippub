document.addEventListener('DOMContentLoaded', function () {
  let currentPage = 1;
  const recordsPerPage = 100;
  let data = [];
  let filteredData = [];
  let finalFilteredData = [];

  async function fetchData() {
    try {
      const response = await fetch('data.json');
      data = await response.json();
      filteredData = data.slice();
      finalFilteredData = data.slice(); 
      showCurrentPageData(currentPage);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function showCurrentPageData(page) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = '';

    const startIdx = (page - 1) * recordsPerPage;
    const endIdx = startIdx + recordsPerPage;
    const currentPageData = finalFilteredData.slice(startIdx, endIdx);

    currentPageData.forEach((record) => {
      const row = document.createElement('tr');
      
      const logoHtml = record.logo && record.logo !== "" 
        ? `<img src="${record.logo}" alt="Logo" style="width: 140px; height: 140px; object-fit: contain; background: white; padding: 4px; border-radius: 8px; border: 1px solid #e5e7eb;">` 
        : `<div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; color: #9ca3af; font-size: 0.85rem;">No Logo</div>`;

      const markName = record['Mark:'] || record['Trademark Name'] || 'N/A';
      const applicantName = record.Applicant && record.Applicant.name ? record.Applicant.name : (record['Applicant Name'] || 'N/A');
      const repName = record.Representative && record.Representative.name ? record.Representative.name : 'N/A';
      
      const statusValue = record['Status:'] || record['Status'] || 'Unknown';
      let statusClass = 'status-default';
      const lowerStatus = statusValue.toLowerCase();

      if (lowerStatus.includes('active') || lowerStatus.includes('registered')) {
        statusClass = 'status-active';
      } else if (lowerStatus.includes('pending') || lowerStatus.includes('examining') || lowerStatus.includes('published')) {
        statusClass = 'status-pending';
      } else if (lowerStatus.includes('expired') || lowerStatus.includes('refused') || lowerStatus.includes('abandoned') || lowerStatus.includes('cancelled')) {
        statusClass = 'status-expired';
      }
      
      const statusHtml = `<span class="status-badge ${statusClass}">${statusValue}</span>`;

      const classNumbers = record.Classes && Array.isArray(record.Classes)
        ? record.Classes.map(c => c.class_no).filter(Boolean).join(', ')
        : processClassValue(record['Class'] || '');

      row.innerHTML = `
        <td>${logoHtml}</td>
        <td><a href="detail.html?id=${encodeURIComponent(record['Application Number'])}" target="_blank">${record['Application Number']}</a></td>
        <td>${markName}</td>
        <td>${statusHtml}</td>
        <td>${applicantName}</td>
        <td>${repName}</td>
        <td>${classNumbers}</td>
      `;
      tableBody.appendChild(row);
    });

    updatePaginationInfo(page);
  }

  function updatePaginationInfo(page) {
    const totalRecordsElement = document.getElementById('totalRecords');
    const totalPages = Math.ceil(finalFilteredData.length / recordsPerPage);
    totalRecordsElement.textContent = `Total records: ${finalFilteredData.length}`;

    const currentPageElement = document.getElementById('currentPage');
    currentPageElement.textContent = `Page ${page} of ${totalPages || 1}`;

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    prevButton.disabled = page === 1;
    nextButton.disabled = page === totalPages || totalPages === 0;
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage--;
      showCurrentPageData(currentPage);
    }
  }

  function goToNextPage() {
    const totalPages = Math.ceil(finalFilteredData.length / recordsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      showCurrentPageData(currentPage);
    }
  }

  function searchByApplicationNumber(query) {
    finalFilteredData = data.filter((record) =>
      typeof record['Application Number'] === 'string' &&
      record['Application Number'].toLowerCase().includes(query.toLowerCase())
    );
  }

  function searchByTrademarkName(query) {
    finalFilteredData = data.filter((record) => {
      const mark = record['Mark:'] || record['Trademark Name'] || '';
      return mark.toLowerCase().includes(query.toLowerCase());
    });
  }

  function searchByApplicantName(query) {
    finalFilteredData = data.filter((record) => {
      const applicant = record.Applicant && record.Applicant.name ? record.Applicant.name : (record['Applicant Name'] || '');
      return applicant.toLowerCase().includes(query.toLowerCase());
    });
  }

  function searchByRepresentativeName(query) {
    finalFilteredData = data.filter((record) => {
      const rep = record.Representative && record.Representative.name ? record.Representative.name : '';
      return rep.toLowerCase().includes(query.toLowerCase());
    });
  }

  function searchAllFields(query) {
    const lowerQuery = query.toLowerCase();
    finalFilteredData = data.filter((record) => {
      const appNum = (record['Application Number'] || '').toLowerCase();
      const mark = (record['Mark:'] || record['Trademark Name'] || '').toLowerCase();
      const applicant = (record.Applicant && record.Applicant.name ? record.Applicant.name : (record['Applicant Name'] || '')).toLowerCase();
      const rep = (record.Representative && record.Representative.name ? record.Representative.name : '').toLowerCase();
      
      return appNum.includes(lowerQuery) || mark.includes(lowerQuery) || applicant.includes(lowerQuery) || rep.includes(lowerQuery);
    });
  }

  function processClassValue(classValue) {
    if (typeof classValue === 'string' && classValue.includes(',')) {
      return classValue.split(',').map(cls => cls.trim()).join(', ');
    } else {
      return classValue;
    }
  }

  function addClassCheckboxes() {
    const classesContainer = document.getElementById("classesContainer");
    for (let i = 1; i <= 45; i++) {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.classList.add("checkbox-item");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `class${i}`;
      checkbox.value = i;

      const label = document.createElement("label");
      label.htmlFor = `class${i}`;
      label.textContent = `${i}`;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      classesContainer.appendChild(checkboxContainer);
    }
  }

  function getSelectedClasses() {
    const selectedClasses = [];
    const checkboxes = document.querySelectorAll("#classesContainer input[type='checkbox']:checked");
    checkboxes.forEach((checkbox) => {
      selectedClasses.push(checkbox.value); 
    });
    return selectedClasses;
  }

  function handleSearchFieldChange(event) {
    const searchInput = document.getElementById('searchInput');
    const searchInputLabel = document.getElementById('searchInputLabel');
    const searchField = event.target.value;

    if (searchField === 'appNumber') {
      searchInputLabel.textContent = 'Search by Application Number:';
      searchInput.placeholder = 'Search by Application Number';
    } else if (searchField === 'tmName') {
      searchInputLabel.textContent = 'Search by Trademark Name:';
      searchInput.placeholder = 'Search by Trademark Name';
    } else if (searchField === 'applicantName') {
      searchInputLabel.textContent = 'Search by Applicant Name:';
      searchInput.placeholder = 'Search by Applicant Name';
    } else if (searchField === 'repName') {
      searchInputLabel.textContent = 'Search by Representative Name:';
      searchInput.placeholder = 'Search by Representative Name';
    } else if (searchField === 'allFields') {
      searchInputLabel.textContent = 'Search All Fields:';
      searchInput.placeholder = 'Search App No, Trademark, Applicant, or Representative';
    }
    applyFilters();
  }

  window.handleSearchFieldChange = handleSearchFieldChange;

  function applyFilters() {
    const searchText = document.getElementById('searchInput').value.trim();
    const searchField = document.querySelector('input[name="searchField"]:checked').value;
    const selectedClasses = getSelectedClasses();

    if (searchText !== '') {
      if (searchField === 'appNumber') {
        searchByApplicationNumber(searchText);
      } else if (searchField === 'tmName') {
        searchByTrademarkName(searchText);
      } else if (searchField === 'applicantName') {
        searchByApplicantName(searchText);
      } else if (searchField === 'repName') {
        searchByRepresentativeName(searchText);
      } else if (searchField === 'allFields') {
        searchAllFields(searchText);
      }
    } else {
        finalFilteredData = data.slice();
    }

    if (selectedClasses.length > 0) {
      finalFilteredData = finalFilteredData.filter((record) => {
        let recordClasses = [];
        
        if (record.Classes && Array.isArray(record.Classes)) {
            recordClasses = record.Classes.map(c => c.class_no.toString());
        } else if (record['Class']) {
            recordClasses = record['Class'].toString().split(',').map(cls => cls.trim());
        }

        return selectedClasses.every((selectedClass) => recordClasses.includes(selectedClass));
      });
    }
    
    currentPage = 1; 
    showCurrentPageData(currentPage);
  }

  document.getElementById('prevButton').addEventListener('click', goToPreviousPage);
  document.getElementById('nextButton').addEventListener('click', goToNextPage);
  document.getElementById('searchButton').addEventListener('click', () => applyFilters());

  document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilters();
    }
  });

  // FIXED: LOGOUT FUNCTIONALITY using localStorage
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('isAuth');
      window.location.href = 'login.html';
    });
  }

  fetchData();
  addClassCheckboxes();
  
  setTimeout(() => {
      const checkboxes = document.querySelectorAll("#classesContainer input[type='checkbox']");
      checkboxes.forEach(checkbox => checkbox.addEventListener("change", applyFilters));
  }, 100);
});