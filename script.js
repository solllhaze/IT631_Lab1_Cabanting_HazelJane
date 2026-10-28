/**
 * Davao del Sur State College (DSSC) - Student Services Dashboard
 * Course: IT 631 - Integrative Programming and Technologies I
 * Lesson 1 Laboratory Activity: Vanilla JavaScript Logic
 * Student: Hazel Jane Cabanting | Section: BSIT-3B
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 0. Theme Switcher — Dark (navy) / Light mode with localStorage persistence
  // --------------------------------------------------------------------------
  const themeToggleBtns = document.querySelectorAll('.theme-toggle');
  const htmlEl = document.documentElement;

  const DARK = 'dark';
  const LIGHT = 'light';

  // Restore saved theme preference (default: light)
  const savedTheme = localStorage.getItem('dssc-theme') || LIGHT;
  applyTheme(savedTheme);

  themeToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') === DARK ? DARK : LIGHT;
      const next = current === DARK ? LIGHT : DARK;
      applyTheme(next);
      localStorage.setItem('dssc-theme', next);
    });
  });

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    const isDark = theme === DARK;
    themeToggleBtns.forEach((btn) => {
      const icon = btn.querySelector('.theme-toggle-icon');
      const label = btn.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = isDark ? '☀️' : '🌙';
      if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  // --------------------------------------------------------------------------
  // 1. Mobile Navigation Toggle (Phase 2 & Accessibility)
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const sidebarHeader = document.getElementById('sidebar-header');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      menuToggle.setAttribute('aria-expanded', String(newState));
      primaryNav.classList.toggle('is-open', newState);
      if (sidebarHeader) {
        sidebarHeader.classList.toggle('is-open', newState);
      }

      if (newState) {
        menuToggle.setAttribute('aria-label', 'Close navigation menu');
      } else {
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
      }
    });

    // Close menu on Escape key press or backdrop click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        if (sidebarHeader) {
          sidebarHeader.classList.remove('is-open');
        }
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        menuToggle.focus();
      }
    });

    // Tab View Switching System: Dashboard, Requests, Enrollment, Grades, Settings
    const navLinks = primaryNav.querySelectorAll('.nav-link');
    const tabViews = document.querySelectorAll('.tab-view');

    function activateTab(targetViewId) {
      if (!targetViewId) return;
      tabViews.forEach((view) => {
        if (view.id === targetViewId) {
          view.classList.add('is-active-view');
        } else {
          view.classList.remove('is-active-view');
        }
      });

      navLinks.forEach((link) => {
        const isMatch = link.getAttribute('data-target') === targetViewId;
        if (isMatch) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        }
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetViewId = link.getAttribute('data-target');
        if (targetViewId) {
          activateTab(targetViewId);
        }

        // Close mobile drawer on navigation
        if (window.innerWidth < 768) {
          primaryNav.classList.remove('is-open');
          if (sidebarHeader) {
            sidebarHeader.classList.remove('is-open');
          }
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open navigation menu');
        }
      });
    });

    // Quick Action button in top pill bar (+ New Request)
    const btnQuickNewRequest = document.getElementById('btn-quick-new-request');
    if (btnQuickNewRequest) {
      btnQuickNewRequest.addEventListener('click', () => {
        activateTab('view-requests');
        const formCategory = document.getElementById('service-category');
        if (formCategory) {
          setTimeout(() => formCategory.focus(), 100);
        }
      });
    }

    // Auto-detect view from URL hash on load
    const hashToView = {
      '#overview': 'view-dashboard',
      '#my-requests': 'view-requests',
      '#new-request': 'view-requests',
      '#enrollment': 'view-enrollment',
      '#grades': 'view-grades',
      '#settings': 'view-settings'
    };
    if (window.location.hash && hashToView[window.location.hash]) {
      activateTab(hashToView[window.location.hash]);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Phase 3: Accessible Request Form Validation & Dynamic Table Updates
  // --------------------------------------------------------------------------
  const requestForm = document.getElementById('service-request-form');
  const categorySelect = document.getElementById('service-category');
  const detailsTextarea = document.getElementById('request-details');
  const categoryError = document.getElementById('category-error');
  const detailsError = document.getElementById('details-error');
  const formFeedback = document.getElementById('form-feedback');
  const requestsTableBody = document.getElementById('requests-table-body');
  const pendingRequestsCountEl = document.getElementById('pending-requests-count');

  let pendingCount = 2; // Baseline state: 2 active pending requests

  // Immediate error clearance when input is updated
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      validateCategory(false);
    });
  }

  if (detailsTextarea) {
    detailsTextarea.addEventListener('input', () => {
      validateDetails(false);
    });
  }

  function validateCategory(showError = true) {
    const value = categorySelect.value.trim();
    if (!value) {
      if (showError) {
        categorySelect.classList.add('is-invalid');
        categorySelect.setAttribute('aria-invalid', 'true');
        categoryError.textContent = 'Please choose a service category from the options.';
        categoryError.classList.add('is-visible');
      }
      return false;
    } else {
      categorySelect.classList.remove('is-invalid');
      categorySelect.removeAttribute('aria-invalid');
      categoryError.textContent = '';
      categoryError.classList.remove('is-visible');
      return true;
    }
  }

  function validateDetails(showError = true) {
    const value = detailsTextarea.value.trim();
    if (!value) {
      if (showError) {
        detailsTextarea.classList.add('is-invalid');
        detailsTextarea.setAttribute('aria-invalid', 'true');
        detailsError.textContent = 'Request reason and details are required.';
        detailsError.classList.add('is-visible');
      }
      return false;
    } else if (value.length < 10) {
      if (showError) {
        detailsTextarea.classList.add('is-invalid');
        detailsTextarea.setAttribute('aria-invalid', 'true');
        detailsError.textContent = `Details are too brief (${value.length}/10 characters). Please provide at least 10 characters explaining your request.`;
        detailsError.classList.add('is-visible');
      }
      return false;
    } else {
      detailsTextarea.classList.remove('is-invalid');
      detailsTextarea.removeAttribute('aria-invalid');
      detailsError.textContent = '';
      detailsError.classList.remove('is-visible');
      return true;
    }
  }

  if (requestForm) {
    requestForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const isCategoryValid = validateCategory(true);
      const isDetailsValid = validateDetails(true);

      if (!isCategoryValid || !isDetailsValid) {
        // Shift keyboard focus to the first invalid control
        if (!isCategoryValid) {
          categorySelect.focus();
        } else {
          detailsTextarea.focus();
        }

        if (formFeedback) {
          formFeedback.classList.remove('is-visible');
          formFeedback.innerHTML = '';
        }
        return;
      }

      // Successful Client-side Validation
      const selectedCategory = categorySelect.value;
      const detailsValue = detailsTextarea.value.trim();

      // Generate realistic DSSC Request ID: REQ-2026-XXXX
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const newRequestId = `REQ-2026-${randomIdSuffix}`;

      // Date formatted: Oct 28, 2026
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      // Show accessible success feedback in live region
      if (formFeedback) {
        formFeedback.className = 'feedback-banner feedback-success is-visible';
        formFeedback.innerHTML = `
          <div><strong>Request Submitted Successfully</strong></div>
          <p>Assigned Reference ID: <strong>${newRequestId}</strong> (${selectedCategory}).</p>
          <div class="feedback-meta">
            Academic Prototype Notice: Front-end validation passed. In production, this record would dispatch to the DSSC Student Information System.
          </div>
        `;
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Dynamically add record to Recent Requests table
      if (requestsTableBody) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td data-label="Request ID">
            <span class="request-code">${newRequestId}</span>
          </td>
          <td data-label="Service Type">
            <div class="service-cell-content">
              <div class="service-main">${escapeHtml(selectedCategory)}</div>
              <div class="service-desc">${escapeHtml(detailsValue.substring(0, 48))}${detailsValue.length > 48 ? '...' : ''}</div>
            </div>
          </td>
          <td data-label="Date Filed">${formattedDate}</td>
          <td data-label="Status">
            <span class="status-pill status-pill-pending">
              <span class="status-badge-dot status-badge-dot-amber" aria-hidden="true"></span>
              Pending
            </span>
          </td>
        `;
        requestsTableBody.insertBefore(newRow, requestsTableBody.firstChild);
      }

      // Increment Pending Requests metric counter
      pendingCount += 1;
      if (pendingRequestsCountEl) {
        pendingRequestsCountEl.textContent = String(pendingCount);
      }

      // Reset form controls
      requestForm.reset();
      categorySelect.classList.remove('is-invalid');
      detailsTextarea.classList.remove('is-invalid');
    });

    // Reset button clears validation states
    requestForm.addEventListener('reset', () => {
      categorySelect.classList.remove('is-invalid');
      categorySelect.removeAttribute('aria-invalid');
      categoryError.textContent = '';
      categoryError.classList.remove('is-visible');

      detailsTextarea.classList.remove('is-invalid');
      detailsTextarea.removeAttribute('aria-invalid');
      detailsError.textContent = '';
      detailsError.classList.remove('is-visible');

      if (formFeedback) {
        formFeedback.classList.remove('is-visible');
        formFeedback.innerHTML = '';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Evaluation Modals & Verification Controls
  // --------------------------------------------------------------------------
  const modalWireframes = document.getElementById('modal-wireframes');
  const modalExitTicket = document.getElementById('modal-exit-ticket');
  const modalRubric = document.getElementById('modal-rubric');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close-btn')) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach((m) => closeModal(m));
    }
  });

  const btnOpenWireframe = document.getElementById('btn-open-wireframe');
  const btnOpenExitTicket = document.getElementById('btn-open-exit-ticket');
  const btnOpenRubric = document.getElementById('btn-open-rubric');
  const btnToggleMobileSim = document.getElementById('btn-toggle-mobile-sim');

  if (btnOpenWireframe) {
    btnOpenWireframe.addEventListener('click', () => openModal(modalWireframes));
  }
  if (btnOpenExitTicket) {
    btnOpenExitTicket.addEventListener('click', () => openModal(modalExitTicket));
  }
  if (btnOpenRubric) {
    btnOpenRubric.addEventListener('click', () => openModal(modalRubric));
  }

  // Mobile simulation toggle
  if (btnToggleMobileSim) {
    btnToggleMobileSim.addEventListener('click', () => {
      const isSimulating = document.body.classList.toggle('simulating-mobile');
      if (isSimulating) {
        btnToggleMobileSim.textContent = 'Exit 360px Simulation';
        btnToggleMobileSim.classList.add('btn-tool-accent');
      } else {
        btnToggleMobileSim.textContent = 'Simulate Mobile (360px)';
        btnToggleMobileSim.classList.remove('btn-tool-accent');
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
