const jobForm = document.getElementById('jobForm');
const jobsTableBody = document.getElementById('jobsTableBody');
let editId = null;

function fetchJobs() {
  fetch('/api/jobs')
    .then(res => res.json())
    .then(jobs => renderTable(jobs))
    .catch(err => console.error('Fetch error:', err));
}

function renderTable(jobs) {
  jobsTableBody.innerHTML = '';
  jobs.forEach(job => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${job.company}</td>
      <td>${job.position}</td>
      <td>${new Date(job.applyDate).toISOString().slice(0,10)}</td>
      <td>${job.status}</td>
      <td>
        <button onclick="startEdit('${job._id}')">Edit</button>
        <button onclick="deleteJob('${job._id}')">Delete</button>
      </td>
    `;
    jobsTableBody.appendChild(tr);
  });
}

jobForm.addEventListener('submit', e => {
  e.preventDefault();
  const company = document.getElementById('company').value;
  const position = document.getElementById('position').value;
  const applyDate = document.getElementById('applyDate').value;
  const status = document.getElementById('status').value;

  const body = { company, position, applyDate, status };

  if (editId) {
    fetch(`/api/jobs/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(() => {
      editId = null;
      jobForm.reset();
      fetchJobs();
    })
    .catch(err => console.error('Edit error:', err));
  } else {
    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(() => {
      jobForm.reset();
      fetchJobs();
    })
    .catch(err => console.error('Add error:', err));
  }
});

function startEdit(id) {
  fetch(`/api/jobs/${id}`)
    .then(res => res.json())
    .then(job => {
      document.getElementById('company').value = job.company;
      document.getElementById('position').value = job.position;
      document.getElementById('applyDate').value = new Date(job.applyDate).toISOString().slice(0,10);
      document.getElementById('status').value = job.status;
      editId = id;
    })
    .catch(err => console.error('Fetch job error:', err));
}

function deleteJob(id) {
  fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    .then(() => fetchJobs())
    .catch(err => console.error('Delete error:', err));
}

// Initial load
fetchJobs();
