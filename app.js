/**
 * IUO × NUESA Academic Repository - Core Application Logic
 * Formats Allowed: PDF, PPTX, DOCX, EPUB
 * Written using Native CSS selectors.
 */

// Initialize scroll animations
AOS.init({ once: true, duration: 600 });

// Registered Users Database (Mock)
let registeredUsers = [
  {
    name: "Department Administrator",
    email: "admin@iuokada.edu.ng",
    password: "admin123",
    role: "admin",
    dept: "Electrical/Electronics",
    level: "Staff"
  },
  {
    name: "David Adeleke",
    email: "dav.190342@iuokada.edu.ng",
    password: "password123",
    role: "student",
    matric: "IUO/19/ENG04/00342",
    dept: "Computer Engineering",
    level: "400L"
  }
];

// Initial Repository Materials
let materials = [
  {
    id: 1,
    title: "EEE 411: Modern Control Engineering Past Questions (2020-2024)",
    level: "400L",
    dept: "Electrical/Electronics",
    category: "Past Question",
    type: "PDF",
    fileSize: "2.4 MB",
    status: "approved",
    uploader: "eng.okafor@iuokada.edu.ng",
    fileUrl: null
  },
  {
    id: 2,
    title: "CPE 312: Microprocessor Architecture & 8086 Assembly Slides",
    level: "300L",
    dept: "Computer Engineering",
    category: "Lecture Notes",
    type: "PPTX",
    fileSize: "6.1 MB",
    status: "approved",
    uploader: "dav.190342@iuokada.edu.ng",
    fileUrl: null
  },
  {
    id: 3,
    title: "EEE 514: High Voltage Engineering Lab & Theory Handout",
    level: "500L",
    dept: "Electrical/Electronics",
    category: "Lecture Notes",
    type: "DOCX",
    fileSize: "1.2 MB",
    status: "approved",
    uploader: "dr.adebayo@iuokada.edu.ng",
    fileUrl: null
  },
  {
    id: 4,
    title: "ECE 701: Advanced Digital Signal Processing (PG Seminar)",
    level: "PG",
    dept: "Computer Engineering",
    category: "Reference Textbook",
    type: "EPUB",
    fileSize: "4.8 MB",
    status: "approved",
    uploader: "pg.coordinator@iuokada.edu.ng",
    fileUrl: null
  },
  {
    id: 5,
    title: "CPE 201: Digital Logic Systems & Boolean Algebra Mid-Semester",
    level: "200L",
    dept: "Computer Engineering",
    category: "Past Question",
    type: "PDF",
    fileSize: "1.5 MB",
    status: "pending",
    uploader: "std.2104@iuokada.edu.ng",
    fileUrl: null
  }
];

let currentLevel = 'ALL';
let currentUser = null;
let currentAdminTab = 'pending';

// Render Public Grid
function renderUI() {
  const grid = document.getElementById("materialsGrid");
  const emptyState = document.getElementById("emptyState");
  const searchVal = document.getElementById("searchInput").value.toLowerCase();
  const deptVal = document.getElementById("deptSelect").value;

  grid.innerHTML = "";

  const filtered = materials.filter(item => {
    const matchesLevel = currentLevel === 'ALL' || item.level === currentLevel;
    const matchesDept = deptVal === 'ALL' || item.dept === deptVal;
    const matchesSearch = item.title.toLowerCase().includes(searchVal);
    return matchesLevel && matchesDept && matchesSearch && item.status === "approved";
  });

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    filtered.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-aos", "fade-up");
      card.setAttribute("data-aos-delay", (index * 40).toString());

      const badgeClass = item.type === "PDF" ? "badge-pdf" :
                         item.type === "PPTX" ? "badge-pptx" :
                         item.type === "DOCX" ? "badge-docx" : "badge-epub";

      // Admin-only direct controls on card
      const isAdmin = currentUser && currentUser.role === 'admin';
      const adminToolbar = isAdmin ? `
        <div class="admin-card-bar">
          <span class="admin-badge-label">
            <i data-lucide="shield" style="width:14px; height:14px;"></i> Admin Control
          </span>
          <div class="admin-card-actions">
            <button onclick="openFilePreview(${item.id})" class="btn-card-inspect">Inspect</button>
            <button onclick="deletePublishedFile(${item.id})" class="btn-card-remove">Remove</button>
          </div>
        </div>
      ` : '';

      card.innerHTML = `
        <div class="card-content">
          <div class="card-header-meta">
            <span class="file-badge ${badgeClass}">${item.type}</span>
            <span class="card-filesize">${item.fileSize}</span>
          </div>
          <h4 class="card-title">${item.title}</h4>
          <div class="card-tags">
            <span class="tag-level">${item.level}</span>
            <span style="color:#cbd5e1;">•</span>
            <span class="tag-dept">${item.dept}</span>
          </div>
        </div>

        <div>
          <div class="card-footer">
            <span class="card-category">${item.category}</span>
            <button onclick="downloadFile('${item.title}', '${item.fileUrl || ''}')" class="btn-download">
              <i data-lucide="download" style="width:14px; height:14px;"></i> Download
            </button>
          </div>
          ${adminToolbar}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  renderAdminPanel();
  lucide.createIcons();
}

// Render Admin Moderation Area
function renderAdminPanel() {
  const pendingContainer = document.getElementById("adminPendingView");
  const publishedContainer = document.getElementById("adminPublishedView");
  const pendingCountLabel = document.getElementById("pendingCount");
  const publishedCountLabel = document.getElementById("publishedCount");

  const pendingItems = materials.filter(m => m.status === "pending");
  const publishedItems = materials.filter(m => m.status === "approved");

  pendingCountLabel.textContent = pendingItems.length;
  publishedCountLabel.textContent = publishedItems.length;

  // 1. Pending Queue
  pendingContainer.innerHTML = "";
  if (pendingItems.length === 0) {
    pendingContainer.innerHTML = `<p style="font-size: 12px; color: #64748b; font-style: italic; padding: 8px 0;">No pending submissions awaiting review.</p>`;
  } else {
    pendingItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "admin-item-row";
      row.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${item.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            By: <span style="font-family: monospace;">${item.uploader}</span> | Level: ${item.level} • Type: <strong>${item.type}</strong> (${item.fileSize})
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="openFilePreview(${item.id})" class="btn btn-navy" style="padding: 6px 12px; font-size: 11px;">
            <i data-lucide="eye" style="width:14px; height:14px;"></i> Inspect File
          </button>
          <button onclick="moderateFile(${item.id}, 'approved')" class="btn btn-green" style="padding: 6px 12px; font-size: 11px;">
            Approve
          </button>
          <button onclick="moderateFile(${item.id}, 'rejected')" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;">
            Reject
          </button>
        </div>
      `;
      pendingContainer.appendChild(row);
    });
  }

  // 2. Published Clean-Up Area
  publishedContainer.innerHTML = "";
  if (publishedItems.length === 0) {
    publishedContainer.innerHTML = `<p style="font-size: 12px; color: #64748b; font-style: italic; padding: 8px 0;">No live files published yet.</p>`;
  } else {
    publishedItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "admin-item-row";
      row.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${item.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${item.level} • ${item.dept} | Format: <strong>${item.type}</strong> (${item.fileSize})
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="openFilePreview(${item.id})" class="btn btn-outline" style="color: #334155; border-color: #cbd5e1; padding: 6px 12px; font-size: 11px;">
            Inspect
          </button>
          <button onclick="deletePublishedFile(${item.id})" class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i> Remove
          </button>
        </div>
      `;
      publishedContainer.appendChild(row);
    });
  }

  lucide.createIcons();
}

// Admin Subtab Switcher
function switchAdminSubTab(tab) {
  currentAdminTab = tab;
  const pendingBtn = document.getElementById("adminTabPending");
  const publishedBtn = document.getElementById("adminTabPublished");
  const pendingView = document.getElementById("adminPendingView");
  const publishedView = document.getElementById("adminPublishedView");

  if (tab === 'pending') {
    pendingBtn.classList.add("active");
    publishedBtn.classList.remove("active");
    pendingView.classList.remove("hidden");
    publishedView.classList.add("hidden");
  } else {
    publishedBtn.classList.add("active");
    pendingBtn.classList.remove("active");
    publishedView.classList.remove("hidden");
    pendingView.classList.add("hidden");
  }
}

// Delete Published File
function deletePublishedFile(id) {
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Unauthorized: Only administrators can remove resources.");
    return;
  }

  const file = materials.find(m => m.id === id);
  if (!file) return;

  const confirmed = confirm(`Are you sure you want to permanently delete:\n\n"${file.title}"?\n\nThis cannot be undone.`);
  if (!confirmed) return;

  if (file.fileUrl && file.fileUrl.startsWith('blob:')) {
    URL.revokeObjectURL(file.fileUrl);
  }

  materials = materials.filter(m => m.id !== id);
  closeModal('previewModal');
  alert(`"${file.title}" was permanently removed.`);
  renderUI();
}

// Open File Preview / Inspection Modal
function openFilePreview(id) {
  const item = materials.find(m => m.id === id);
  if (!item) return;

  const titleEl = document.getElementById("previewTitle");
  const metaEl = document.getElementById("previewMeta");
  const badgeEl = document.getElementById("previewBadge");
  const container = document.getElementById("previewContainer");
  const actionsContainer = document.getElementById("previewActionButtons");
  const statusLabel = document.getElementById("previewStatusLabel");

  titleEl.textContent = item.title;
  metaEl.textContent = `Uploader: ${item.uploader} | Level: ${item.level} | Program: ${item.dept} | Size: ${item.fileSize}`;
  badgeEl.textContent = item.type;
  badgeEl.className = `file-badge ${item.type === 'PDF' ? 'badge-pdf' : item.type === 'PPTX' ? 'badge-pptx' : item.type === 'DOCX' ? 'badge-docx' : 'badge-epub'}`;

  container.innerHTML = "";

  if (item.type === "PDF") {
    if (item.fileUrl) {
      container.innerHTML = `<iframe class="preview-iframe" src="${item.fileUrl}#toolbar=1"></iframe>`;
    } else {
      container.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
          <div style="width: 50px; height: 50px; border-radius: 12px; background: #ffe4e6; color: #be123c; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i data-lucide="file-text" style="width: 28px; height: 28px;"></i>
          </div>
          <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Mock PDF Record</h4>
          <p style="font-size: 12px; color: #64748b; max-width: 400px; margin-bottom: 12px;">
            Demo entry. Files newly uploaded by students will render directly in this embedded reader frame.
          </p>
          <code style="font-size: 11px; background: #ffffff; padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 6px;">${item.title}</code>
        </div>
      `;
    }
  } else {
    container.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px;">
        <div style="width: 60px; height: 60px; border-radius: 14px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
          <i data-lucide="${item.type === 'PPTX' ? 'presentation' : item.type === 'DOCX' ? 'file-text' : 'book-open'}" style="width: 32px; height: 32px; color: var(--iuo-blue);"></i>
        </div>
        <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${item.title}</h4>
        <p style="font-size: 12px; color: #64748b; max-width: 420px; margin-bottom: 20px;">
          Format: <strong>${item.type}</strong>. Click below to inspect a local copy before approving.
        </p>

        ${item.fileUrl ? `
          <a href="${item.fileUrl}" download="${item.title}.${item.type.toLowerCase()}" class="btn btn-navy">
            <i data-lucide="external-link"></i> Download & Inspect in Desktop App
          </a>
        ` : `
          <button onclick="alert('Inspection file download simulated for demo entry.')" class="btn btn-navy">
            <i data-lucide="download"></i> Download Review Copy (${item.fileSize})
          </button>
        `}
      </div>
    `;
  }

  // Adjust preview bottom actions based on pending vs published status
  if (item.status === 'pending') {
    statusLabel.innerHTML = `Status: <strong style="color: #d97706;">Pending Review</strong>`;
    actionsContainer.innerHTML = `
      <button onclick="moderateFromPreview(${item.id}, 'rejected')" class="btn btn-danger">Reject</button>
      <button onclick="moderateFromPreview(${item.id}, 'approved')" class="btn btn-green">✓ Approve & Publish</button>
    `;
  } else {
    statusLabel.innerHTML = `Status: <strong style="color: #059669;">Live / Published</strong>`;
    actionsContainer.innerHTML = `
      <button onclick="deletePublishedFile(${item.id})" class="btn btn-danger">
        <i data-lucide="trash-2"></i> Delete File
      </button>
      <button onclick="closeModal('previewModal')" class="btn btn-outline" style="color: #334155; border-color: #cbd5e1;">Close</button>
    `;
  }

  openModal('previewModal');
  lucide.createIcons();
}

function moderateFromPreview(id, status) {
  moderateFile(id, status);
  closeModal('previewModal');
}

function moderateFile(id, status) {
  if (status === 'approved') {
    const file = materials.find(m => m.id === id);
    if (file) {
      file.status = 'approved';
      alert(`"${file.title}" is now APPROVED and visible publicly!`);
    }
  } else {
    materials = materials.filter(m => m.id !== id);
    alert("Submission REJECTED and removed.");
  }
  renderUI();
}

// Level switcher
function setLevel(level) {
  currentLevel = level;
  document.querySelectorAll(".level-btn").forEach(btn => {
    if (btn.innerText.includes(level) || (level === 'ALL' && btn.innerText.includes("All"))) {
      btn.classList.add("active-tab");
    } else {
      btn.classList.remove("active-tab");
    }
  });
  renderUI();
}

function filterMaterials() {
  renderUI();
}

// Modal Controllers
function openModal(id) { 
  document.getElementById(id).classList.remove("hidden"); 
}

function closeModal(id) { 
  document.getElementById(id).classList.add("hidden"); 
}

function openAuthModal(mode) {
  switchAuthTab(mode);
  openModal('authModal');
}

function switchAuthTab(tab) {
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");
  const signInErr = document.getElementById("signInError");
  const signUpErr = document.getElementById("signUpError");

  signInErr.classList.add("hidden");
  signUpErr.classList.add("hidden");

  if (tab === 'signin') {
    signInForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");
    tabSignIn.classList.add("active-auth");
    tabSignUp.classList.remove("active-auth");
  } else {
    signInForm.classList.add("hidden");
    signUpForm.classList.remove("hidden");
    tabSignUp.classList.add("active-auth");
    tabSignIn.classList.remove("active-auth");
  }
}

// Handle Student Sign Up
function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const matric = document.getElementById("regMatric").value.trim();
  const level = document.getElementById("regLevel").value;
  const dept = document.getElementById("regDept").value;
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const err = document.getElementById("signUpError");

  // Validate official IUO email domain
  const iuoDomainRegex = /^[a-zA-Z0-9._%+-]+@iuokada\.edu\.ng$/;
  if (!iuoDomainRegex.test(email)) {
    err.textContent = "Error: You must sign up with an official @iuokada.edu.ng email address.";
    err.classList.remove("hidden");
    return;
  }

  if (password !== confirmPassword) {
    err.textContent = "Error: Passwords do not match!";
    err.classList.remove("hidden");
    return;
  }

  if (registeredUsers.some(u => u.email === email)) {
    err.textContent = "An account with this IUO email is already registered. Please sign in.";
    err.classList.remove("hidden");
    return;
  }

  const newUser = {
    name,
    matric,
    level,
    dept,
    email,
    password,
    role: "student"
  };

  registeredUsers.push(newUser);
  loginSuccess(newUser);
  closeModal('authModal');
  document.getElementById("signUpForm").reset();
  alert(`Account registered successfully! Welcome, ${name}.`);
}

// Handle Sign In
function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const err = document.getElementById("signInError");

  const user = registeredUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    err.textContent = "Invalid credentials. Ensure your @iuokada.edu.ng email and password are correct.";
    err.classList.remove("hidden");
    return;
  }

  loginSuccess(user);
  closeModal('authModal');
  document.getElementById("signInForm").reset();
}

function loginSuccess(user) {
  currentUser = user;
  document.getElementById("unauthActions").classList.add("hidden");
  const profile = document.getElementById("authProfile");
  profile.classList.remove("hidden");

  document.getElementById("userNameDisplay").textContent = user.name;
  document.getElementById("userMetaDisplay").textContent = `${user.level || 'Staff'} • ${user.dept}`;

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById("userAvatar").textContent = initials;

  if (user.role === 'admin') {
    document.getElementById("adminPortalBtn").classList.remove("hidden");
  } else {
    document.getElementById("adminPortalBtn").classList.add("hidden");
    document.getElementById("adminPanel").classList.add("hidden");
  }

  if (user.level && user.level !== "Staff") {
    document.getElementById("uploadLevel").value = user.level;
  }
  if (user.dept) {
    document.getElementById("uploadDept").value = user.dept;
  }

  renderUI();
}

function logoutUser() {
  currentUser = null;
  document.getElementById("authProfile").classList.add("hidden");
  document.getElementById("unauthActions").classList.remove("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
  renderUI();
  alert("You have signed out.");
}

function toggleAdminPanel() {
  const panel = document.getElementById("adminPanel");
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) {
    panel.scrollIntoView({ behavior: 'smooth' });
  }
}

function checkAuthAndUpload() {
  if (!currentUser) {
    alert("Please sign in or create an account with your @iuokada.edu.ng email first.");
    openAuthModal('signin');
  } else {
    openModal('uploadModal');
  }
}

// Upload with Strict Format Enforcement
function handleUpload(e) {
  e.preventDefault();
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) return;

  const allowedExtensions = ['pdf', 'pptx', 'docx', 'epub'];
  const fileExt = file.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExt)) {
    alert("Invalid file type! Only PDF, PPTX, DOCX, and EPUB files are allowed.");
    return;
  }

  const localBlobUrl = URL.createObjectURL(file);

  const newResource = {
    id: Date.now(),
    title: document.getElementById("courseTitle").value,
    level: document.getElementById("uploadLevel").value,
    dept: document.getElementById("uploadDept").value,
    category: document.getElementById("uploadCategory").value,
    type: fileExt.toUpperCase(),
    fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
    status: "pending",
    uploader: currentUser ? currentUser.email : "student@iuokada.edu.ng",
    fileUrl: localBlobUrl
  };

  materials.unshift(newResource);
  closeModal('uploadModal');
  document.getElementById("uploadForm").reset();
  alert("File received! It is now in the admin moderation queue for review.");
  renderUI();
}

function downloadFile(title, fileUrl) {
  if (fileUrl) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = title;
    a.click();
  } else {
    alert(`Downloading: "${title}"`);
  }
}

// Boot application
document.addEventListener("DOMContentLoaded", () => {
  renderUI();
});