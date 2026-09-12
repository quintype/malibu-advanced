let eventSource = null;
let projectsList = [];

// Fetch initial data on load
window.addEventListener('DOMContentLoaded', () => {
  fetchProjects();
  fetchReports();
});

function fetchProjects() {
  fetch('/api/projects')
    .then(res => res.json())
    .then(data => {
      projectsList = data.projects || [];
      populateCustomDropdown();
    })
    .catch(err => console.error('Error fetching projects:', err));
}

function fetchReports() {
  fetch('/api/reports')
    .then(res => res.json())
    .then(data => {
      renderReports(data.reports || []);
    })
    .catch(err => console.error('Error fetching reports:', err));
}

function populateCustomDropdown() {
  const container = document.getElementById('projectDropdownOptions');
  container.innerHTML = '';
  projectsList.forEach(proj => {
    const div = document.createElement('div');
    div.className = 'custom-option-item';
    div.textContent = proj;
    div.style.padding = '10px 14px';
    div.style.cursor = 'pointer';
    div.style.transition = 'background 0.2s';
    div.style.fontSize = '0.95rem';
    div.style.color = '#ffffff';
    div.onmousedown = () => selectProjectOption(proj);
    container.appendChild(div);
  });
}

function showDropdown() {
  document.getElementById('projectDropdownOptions').style.display = 'block';
  populateCustomDropdown();
}

function hideDropdown() {
  setTimeout(() => {
    document.getElementById('projectDropdownOptions').style.display = 'none';
  }, 150);
}

function filterDropdownOptions() {
  const input = document.getElementById('projectSelect');
  const query = input.value.toLowerCase();
  const container = document.getElementById('projectDropdownOptions');
  container.style.display = 'block';
  
  Array.from(container.children).forEach(child => {
    if (child.textContent.toLowerCase().includes(query)) {
      child.style.display = 'block';
    } else {
      child.style.display = 'none';
    }
  });
}

function selectProjectOption(val) {
  const input = document.getElementById('projectSelect');
  input.value = val;
  document.getElementById('projectDropdownOptions').style.display = 'none';
}

function renderReports(reports) {
  const grid = document.getElementById('reportsGrid');
  grid.innerHTML = '';
  
  if (reports.length === 0) {
    grid.innerHTML = '<p style="color: #64748b; grid-column: span 2;">No reports generated yet. Run an audit above!</p>';
    return;
  }
  
  reports.forEach(projObj => {
    const block = document.createElement('div');
    block.className = 'project-block';
    
    // Header
    const header = document.createElement('div');
    header.className = 'project-header';
    header.innerHTML = `
      <div class="project-title-group">
        <svg class="folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>Project: ${projObj.project}</h3>
      </div>
      <button class="options-btn" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1.5"></circle>
          <circle cx="12" cy="5" r="1.5"></circle>
          <circle cx="12" cy="19" r="1.5"></circle>
        </svg>
      </button>
    `;
    
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    
    projObj.runs.forEach(r => {
      const dateObj = new Date(r.timestamp);
      const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const formattedTime = `${dateStr} at ${timeStr}`;

      const item = document.createElement('div');
      item.className = 'run-item';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '12px 14px';
      item.style.background = 'rgba(255, 255, 255, 0.01)';
      item.style.border = '1px solid rgba(255, 255, 255, 0.03)';
      item.style.borderRadius = '10px';
      item.style.marginBottom = '8px';
      
      let htmlBtn = '';
      if (r.html) {
        htmlBtn = `
          <a class="file-icon-badge html-badge" href="${r.html}" target="_blank" style="text-decoration: none; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;">
            <span style="font-family: system-ui, sans-serif; font-size: 0.75rem; font-weight: bold;">&lt;/&gt; HTML</span>
          </a>
        `;
      }

      let pdfBtn = '';
      if (r.pdf) {
        pdfBtn = `
          <a class="file-icon-badge pdf-badge" href="${r.pdf}" target="_blank" style="text-decoration: none; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>PDF</span>
          </a>
        `;
      }
      
      item.innerHTML = `
        <div class="run-time" style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); font-weight: 500;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${formattedTime}</span>
        </div>
        <div class="run-links" style="display: flex; gap: 8px;">
          ${htmlBtn}
          ${pdfBtn}
        </div>
      `;
      fileList.appendChild(item);
    });
    
    block.appendChild(header);
    block.appendChild(fileList);
    grid.appendChild(block);
  });
}

function filterReports() {
  const query = document.getElementById('reportSearch').value.toLowerCase();
  document.querySelectorAll('.project-block').forEach(block => {
    const projectName = block.querySelector('.project-title-group h3').textContent.toLowerCase();
    let hasVisibleRuns = false;
    block.querySelectorAll('.run-item').forEach(item => {
      const runTimeText = item.querySelector('.run-time').textContent.toLowerCase();
      if (projectName.includes(query) || runTimeText.includes(query)) {
        item.style.display = 'flex';
        hasVisibleRuns = true;
      } else {
        item.style.display = 'none';
      }
    });
    if (hasVisibleRuns) {
      block.style.display = 'block';
    } else {
      block.style.display = 'none';
    }
  });
}

function switchSidebarTab(tabName, element) {
  document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  } else {
    const homeBtn = document.querySelector('.sidebar-menu .menu-item');
    if (homeBtn) homeBtn.classList.add('active');
  }

  const configSec = document.getElementById('auditConfigSection');
  const reportsSec = document.getElementById('reportsContainer');
  const helpSec = document.getElementById('helpContainer');

  // Hide all sections first
  configSec.style.display = 'none';
  reportsSec.style.display = 'none';
  helpSec.style.display = 'none';

  if (tabName === 'home') {
    configSec.style.display = 'block';
    reportsSec.style.display = 'block';
  } else if (tabName === 'audit') {
    configSec.style.display = 'block';
  } else if (tabName === 'reports') {
    reportsSec.style.display = 'block';
  } else if (tabName === 'help') {
    helpSec.style.display = 'block';
  }
}

function runAudit(event) {
  event.preventDefault();
  
  const project = document.getElementById('projectSelect').value;
  const urlInput = document.getElementsByName('url')[0].value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  // UI state updates
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Auditing...';
  
  const outputConsole = document.getElementById('terminalOutput');
  outputConsole.textContent = 'Starting process...\n';
  document.getElementById('terminalContainer').style.display = 'block';
  
  const viewReportBtn = document.getElementById('viewReportBtn');
  viewReportBtn.style.display = 'none';

  // Connect to dynamic log stream
  const eventUrl = '/run-audit?project=' + encodeURIComponent(project) + '&url=' + encodeURIComponent(urlInput);
  eventSource = new EventSource(eventUrl);

  eventSource.onmessage = function(event) {
    const data = event.data;
    
    if (data.startsWith('[COMPLETE]')) {
      const reportUrl = data.replace('[COMPLETE]', '');
      eventSource.close();
      
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Run Inspector';
      
      if (reportUrl) {
        viewReportBtn.href = reportUrl;
        viewReportBtn.style.display = 'flex';
        // Refresh the reports list
        fetchReports();
        // Automatically open the report in a new tab!
        window.open(reportUrl, '_blank');
      } else {
        outputConsole.textContent += '\n❌ Audit finished but no report HTML could be found.';
      }
    } else {
      outputConsole.textContent += data + '\n';
      outputConsole.scrollTop = outputConsole.scrollHeight; // Auto scroll to bottom
    }
  };

  eventSource.onerror = function() {
    eventSource.close();
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Run Inspector';
    outputConsole.textContent += '\n⚠️ Connection lost or completed.';
  };
}

function resetTerminal() {
  document.getElementById('terminalContainer').style.display = 'none';
  document.getElementById('terminalOutput').textContent = '';
}

function selectFolderDialog(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const btn = event.currentTarget;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Opening...';
  
  fetch('/api/select-folder')
    .then(res => res.json())
    .then(data => {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      if (data && data.path) {
        document.getElementById('projectSelect').value = data.path;
      }
    })
    .catch(err => {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      console.error('Error selecting folder:', err);
    });
}
