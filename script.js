let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let editIndex = -1;
let myChart;

window.onload = () => {
  initChart();
  displayJobs();

  document
    .getElementById("btnLoadDemo")
    .addEventListener("click", loadDemoData);
  document
    .getElementById("btnExportCSV")
    .addEventListener("click", exportToCSV);
  document.getElementById("search").addEventListener("input", displayJobs);
};

function showSection(id) {
  document
    .querySelectorAll(".sec")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".sidebar li")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const navId = "nav-" + id.substring(0, 3);
  if (document.getElementById(navId))
    document.getElementById(navId).classList.add("active");
  if (id === "dashboard") updateStats();
}

function celebrate() {
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function addJob() {
  const company = document.getElementById("company").value;
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;
  const date = document.getElementById("date").value;

  if (!company || !role) return alert("Please fill company and role!");

  if (status === "Offer") celebrate();

  const jobData = {
    company,
    role,
    status,
    date: date || new Date().toISOString().split("T")[0],
  };

  if (editIndex === -1) {
    jobs.push(jobData);
  } else {
    jobs[editIndex] = jobData;
    editIndex = -1;
    document.getElementById("addBtn").innerText = "Add Application";
  }

  localStorage.setItem("jobs", JSON.stringify(jobs));
  document.getElementById("company").value = "";
  document.getElementById("role").value = "";
  displayJobs();
  updateStats();
}

function displayJobs() {
  const list = document.getElementById("jobList");
  const searchTerm = document.getElementById("search").value.toLowerCase();
  list.innerHTML = "";

  jobs.forEach((job, index) => {
    if (
      !job.company.toLowerCase().includes(searchTerm) &&
      !job.role.toLowerCase().includes(searchTerm)
    )
      return;

    list.innerHTML += `
            <div class="job-card">
                <div>
                    <h4 style="margin:0">${job.company}</h4>
                    <p style="margin:4px 0; color:var(--primary); font-size:14px;">${job.role}</p>
                    <small style="color:#94a3b8">${job.date} | <b>${job.status}</b></small>
                </div>
                <div>
                    <button onclick="editJob(${index})" class="btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteJob(${index})" class="btn-del"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
  });
}

function deleteJob(index) {
  if (confirm("Are you sure you want to delete?")) {
    jobs.splice(index, 1);
    localStorage.setItem("jobs", JSON.stringify(jobs));
    displayJobs();
    updateStats();
  }
}

function editJob(index) {
  const job = jobs[index];
  document.getElementById("company").value = job.company;
  document.getElementById("role").value = job.role;
  document.getElementById("status").value = job.status;
  document.getElementById("date").value = job.date;
  editIndex = index;
  document.getElementById("addBtn").innerText = "Update Job";
  showSection("tracker");
}

function updateStats() {
  const stats = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  jobs.forEach((j) => {
    if (stats[j.status] !== undefined) stats[j.status]++;
  });

  document.getElementById("appliedCount").innerText = stats.Applied;
  document.getElementById("interviewCount").innerText = stats.Interview;
  document.getElementById("offerCount").innerText = stats.Offer;

  if (myChart) {
    myChart.data.datasets[0].data = [
      stats.Applied,
      stats.Interview,
      stats.Offer,
      stats.Rejected,
    ];
    myChart.update();
  }
}

function initChart() {
  const ctx = document.getElementById("jobChart").getContext("2d");
  if (!ctx) return;
  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Applied", "Interview", "Offer", "Rejected"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: ["#6366f1", "#fbbf24", "#22c55e", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
      cutout: "70%",
    },
  });
  updateStats();
}

function loadDemoData() {
  const demo = [
    {
      company: "Google",
      role: "Frontend Developer",
      status: "Interview",
      date: "2026-03-24",
    },
    { company: "Amazon", role: "SDE-1", status: "Offer", date: "2026-03-20" },
    {
      company: "Meta",
      role: "React Architect",
      status: "Applied",
      date: "2026-03-22",
    },
    {
      company: "Netflix",
      role: "UI Engineer",
      status: "Rejected",
      date: "2026-03-15",
    },
  ];

  jobs = demo;
  localStorage.setItem("jobs", JSON.stringify(jobs));

  displayJobs();
  updateStats();

  alert("Demo data has been loaded successfully!");
}

function exportToCSV() {
  if (jobs.length === 0) return alert("Nothing to export!");
  let csv = "Company,Role,Status,Date\n";
  jobs.forEach(
    (j) => (csv += `${j.company},${j.role},${j.status},${j.date}\n`),
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "job_tracker.csv";
  a.click();
}

function analyzeResume() {
  const text = document.getElementById("resumeText").value.toLowerCase();
  const skills = ["html", "css", "javascript", "react", "node", "git", "sql"];
  let matched = skills.filter((s) => text.includes(s));
  const score = Math.round((matched.length / skills.length) * 100);
  document.getElementById("resultBox").classList.remove("hidden");
  document.getElementById("scoreText").innerText = `ATS Score: ${score}%`;
  document.getElementById("feedbackText").innerText =
    "Found: " + matched.join(", ");
}

document.getElementById("toggleMode").onclick = function () {
  document.body.classList.toggle("light-theme");
  this.innerHTML = document.body.classList.contains("light-theme")
    ? '<i class="fas fa-moon"></i> Dark Mode'
    : '<i class="fas fa-sun"></i> Light Mode';
};
