/**
 * Resume Builder Pro - Main Application
 */

class ResumeBuilderApp {
  constructor() {
    // Initialize modules
    this.storage = new StorageManager({ prefix: 'resumepro_' });
    this.ai = new AIWriter();
    this.pdf = new PDFGenerator();
    this.templates = new TemplateEngine();
    this.formBuilder = new FormBuilder({ cssPrefix: 'fb-' });
    this.auth = new AuthModule();

    // Application state
    this.resumeData = this.getDefaultResumeData();
    this.coverLetterData = {};
    this.selectedResumeTemplate = 'professional';
    this.selectedCoverTemplate = 'standard';
    this.isPremium = false;

    // Initialize
    this.init();
  }

  getDefaultResumeData() {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        title: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };
  }

  async init() {
    // Load saved data
    this.loadData();

    // Load API settings
    this.loadAPISettings();

    // Register templates
    this.registerTemplates();

    // Initialize UI
    this.initNavigation();
    this.initTabs();
    this.initForms();
    this.renderTemplateGrid();

    // Check auth state
    this.checkAuthState();

    console.log('Resume Builder Pro initialized');
  }

  // ============ DATA MANAGEMENT ============

  loadData() {
    const savedResume = this.storage.loadLocal('resume');
    if (savedResume) {
      this.resumeData = { ...this.getDefaultResumeData(), ...savedResume };
    }

    const savedCoverLetter = this.storage.loadLocal('coverLetter');
    if (savedCoverLetter) {
      this.coverLetterData = savedCoverLetter;
    }

    this.selectedResumeTemplate = this.storage.loadLocal('resumeTemplate') || 'professional';
    this.selectedCoverTemplate = this.storage.loadLocal('coverTemplate') || 'standard';
  }

  saveData() {
    this.storage.saveLocal('resume', this.resumeData);
    this.storage.saveLocal('coverLetter', this.coverLetterData);
    this.storage.saveLocal('resumeTemplate', this.selectedResumeTemplate);
    this.storage.saveLocal('coverTemplate', this.selectedCoverTemplate);

    // Sync to cloud if premium user
    if (this.isPremium && this.storage.isCloudEnabled) {
      this.syncToCloud();
    }
  }

  exportData() {
    const data = {
      resume: this.resumeData,
      coverLetter: this.coverLetterData,
      templates: {
        resume: this.selectedResumeTemplate,
        cover: this.selectedCoverTemplate
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-builder-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showStatus('Data exported successfully!', 'success');
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.resume) {
          this.resumeData = { ...this.getDefaultResumeData(), ...data.resume };
        }
        if (data.coverLetter) {
          this.coverLetterData = data.coverLetter;
        }
        if (data.templates) {
          this.selectedResumeTemplate = data.templates.resume || 'professional';
          this.selectedCoverTemplate = data.templates.cover || 'standard';
        }

        this.saveData();
        this.initForms();
        this.showStatus('Data imported successfully!', 'success');
      } catch (error) {
        this.showStatus('Failed to import data: ' + error.message, 'error');
      }
    };
    input.click();
  }

  clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      this.storage.clearLocal();
      this.resumeData = this.getDefaultResumeData();
      this.coverLetterData = {};
      this.initForms();
      this.showStatus('All data cleared.', 'info');
    }
  }

  // ============ API SETTINGS ============

  loadAPISettings() {
    const endpoint = this.storage.loadLocal('apiEndpoint');
    const apiKey = this.storage.loadLocal('apiKey');
    const model = this.storage.loadLocal('apiModel');

    if (endpoint) this.ai.setEndpoint(endpoint);
    if (apiKey) this.ai.setApiKey(apiKey);
    if (model) this.ai.setModel(model);

    this.updateAPIStatus();
  }

  saveAPISettings() {
    const endpoint = document.getElementById('api-endpoint').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('api-model').value;

    this.storage.saveLocal('apiEndpoint', endpoint);
    this.storage.saveLocal('apiKey', apiKey);
    this.storage.saveLocal('apiModel', model);

    this.ai.setEndpoint(endpoint);
    this.ai.setApiKey(apiKey);
    this.ai.setModel(model);

    this.updateAPIStatus();
    this.showStatus('API settings saved!', 'success');
  }

  async testAPIConnection() {
    if (!this.ai.isConfigured()) {
      this.showStatus('Please configure your API key first.', 'error');
      return;
    }

    this.showStatus('Testing connection...', 'info');

    const result = await this.ai.complete(
      'You are a helpful assistant.',
      'Say "Connection successful!" in exactly those words.'
    );

    if (result.success) {
      this.showStatus('API connection successful!', 'success');
    } else {
      this.showStatus('Connection failed: ' + result.error, 'error');
    }
  }

  updateAPIStatus() {
    const statusEl = document.getElementById('api-status');
    if (this.ai.isConfigured()) {
      statusEl.textContent = 'Connected';
      statusEl.className = 'api-status connected';
    } else {
      statusEl.textContent = 'Not Connected';
      statusEl.className = 'api-status disconnected';
    }
  }

  showAPISettings() {
    this.navigateTo('settings');
  }

  // ============ NAVIGATION ============

  initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateTo(section);
      });
    });
  }

  navigateTo(section) {
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.add('hidden');
    });
    document.getElementById(`section-${section}`).classList.remove('hidden');
  }

  // ============ TABS ============

  initTabs() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
      tabContainer.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.dataset.tab;
          this.switchTab(tabContainer, tabId);
        });
      });
    });
  }

  switchTab(container, tabId) {
    // Update tab buttons
    container.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    // Update tab content
    const parent = container.parentElement;
    parent.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
  }

  // ============ FORMS ============

  initForms() {
    this.initPersonalForm();
    this.renderExperienceList();
    this.renderEducationList();
    this.initSkillsForm();
    this.initJobForm();
  }

  initPersonalForm() {
    const form = new FormBuilder({
      cssPrefix: 'fb-',
      onChange: (data) => {
        Object.assign(this.resumeData.personalInfo, data);
        this.saveData();
      }
    });

    form.setContainer('#personal-form')
      .setFields([
        { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
        { name: 'title', label: 'Professional Title', type: 'text', placeholder: 'Software Engineer' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@example.com' },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'New York, NY' },
        { name: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'linkedin.com/in/johndoe' },
        { name: 'website', label: 'Website', type: 'text', placeholder: 'johndoe.com' },
        { name: 'summary', label: 'Professional Summary', type: 'textarea', rows: 4,
          placeholder: 'Brief overview of your experience and goals...', help: 'Keep it concise, 2-3 sentences.' }
      ])
      .setData(this.resumeData.personalInfo)
      .render();

    // Handle summary separately
    if (this.resumeData.summary) {
      const summaryField = document.querySelector('[name="summary"]');
      if (summaryField) summaryField.value = this.resumeData.summary;
    }

    // Listen for summary changes
    const summaryField = document.querySelector('[name="summary"]');
    if (summaryField) {
      summaryField.addEventListener('input', (e) => {
        this.resumeData.summary = e.target.value;
        this.saveData();
      });
    }
  }

  renderExperienceList() {
    const container = document.getElementById('experience-list');
    if (!container) return;

    if (this.resumeData.experience.length === 0) {
      container.innerHTML = `
        <p class="text-muted text-center" style="padding: 20px;">
          No work experience added yet. Click "Add Position" to get started.
        </p>
      `;
      return;
    }

    container.innerHTML = this.resumeData.experience.map((exp, index) => `
      <div class="fb-array-item">
        <div class="flex-between mb-1">
          <strong>${exp.title || 'Position'}</strong>
          <button class="btn btn-sm btn-danger" onclick="app.removeExperience(${index})">Remove</button>
        </div>
        <div class="text-muted mb-1">${exp.company || 'Company'} | ${exp.startDate || 'Start'} - ${exp.endDate || 'End'}</div>
        <div class="fb-field">
          <label class="fb-label">Job Title</label>
          <input type="text" class="fb-input" value="${exp.title || ''}"
                 onchange="app.updateExperience(${index}, 'title', this.value)">
        </div>
        <div class="fb-field">
          <label class="fb-label">Company</label>
          <input type="text" class="fb-input" value="${exp.company || ''}"
                 onchange="app.updateExperience(${index}, 'company', this.value)">
        </div>
        <div class="fb-field">
          <label class="fb-label">Location</label>
          <input type="text" class="fb-input" value="${exp.location || ''}"
                 onchange="app.updateExperience(${index}, 'location', this.value)">
        </div>
        <div class="flex gap-1">
          <div class="fb-field" style="flex:1">
            <label class="fb-label">Start Date</label>
            <input type="text" class="fb-input" value="${exp.startDate || ''}"
                   placeholder="Jan 2020"
                   onchange="app.updateExperience(${index}, 'startDate', this.value)">
          </div>
          <div class="fb-field" style="flex:1">
            <label class="fb-label">End Date</label>
            <input type="text" class="fb-input" value="${exp.endDate || ''}"
                   placeholder="Present"
                   onchange="app.updateExperience(${index}, 'endDate', this.value)">
          </div>
        </div>
        <div class="fb-field">
          <label class="fb-label">Achievements (one per line)</label>
          <textarea class="fb-textarea" rows="4"
                    onchange="app.updateExperienceAchievements(${index}, this.value)"
                    placeholder="Led team of 5 engineers...&#10;Increased revenue by 20%..."
          >${(exp.achievements || []).join('\n')}</textarea>
        </div>
        ${this.ai.isConfigured() ? `
        <button class="btn btn-sm btn-outline mt-1" onclick="app.enhanceExperience(${index})">
          ✨ Enhance with AI
        </button>
        ` : ''}
      </div>
    `).join('');
  }

  addExperience() {
    this.resumeData.experience.push({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      achievements: []
    });
    this.saveData();
    this.renderExperienceList();
  }

  removeExperience(index) {
    this.resumeData.experience.splice(index, 1);
    this.saveData();
    this.renderExperienceList();
  }

  updateExperience(index, field, value) {
    this.resumeData.experience[index][field] = value;
    this.saveData();
  }

  updateExperienceAchievements(index, value) {
    this.resumeData.experience[index].achievements = value.split('\n').filter(a => a.trim());
    this.saveData();
  }

  async enhanceExperience(index) {
    const exp = this.resumeData.experience[index];
    if (!exp.achievements || exp.achievements.length === 0) {
      this.showStatus('Add at least one achievement to enhance.', 'error');
      return;
    }

    this.showStatus('Enhancing with AI...', 'info');

    const enhanced = [];
    for (const achievement of exp.achievements) {
      const result = await this.ai.enhanceBulletPoint(achievement, exp.title);
      if (result.success) {
        enhanced.push(result.content);
      } else {
        enhanced.push(achievement);
      }
    }

    this.resumeData.experience[index].achievements = enhanced;
    this.saveData();
    this.renderExperienceList();
    this.showStatus('Achievements enhanced!', 'success');
  }

  renderEducationList() {
    const container = document.getElementById('education-list');
    if (!container) return;

    if (this.resumeData.education.length === 0) {
      container.innerHTML = `
        <p class="text-muted text-center" style="padding: 20px;">
          No education added yet. Click "Add Education" to get started.
        </p>
      `;
      return;
    }

    container.innerHTML = this.resumeData.education.map((edu, index) => `
      <div class="fb-array-item">
        <div class="flex-between mb-1">
          <strong>${edu.degree || 'Degree'}</strong>
          <button class="btn btn-sm btn-danger" onclick="app.removeEducation(${index})">Remove</button>
        </div>
        <div class="fb-field">
          <label class="fb-label">Degree</label>
          <input type="text" class="fb-input" value="${edu.degree || ''}"
                 placeholder="Bachelor of Science in Computer Science"
                 onchange="app.updateEducation(${index}, 'degree', this.value)">
        </div>
        <div class="fb-field">
          <label class="fb-label">Institution</label>
          <input type="text" class="fb-input" value="${edu.institution || ''}"
                 placeholder="University Name"
                 onchange="app.updateEducation(${index}, 'institution', this.value)">
        </div>
        <div class="fb-field">
          <label class="fb-label">Year</label>
          <input type="text" class="fb-input" value="${edu.year || ''}"
                 placeholder="2020"
                 onchange="app.updateEducation(${index}, 'year', this.value)">
        </div>
      </div>
    `).join('');
  }

  addEducation() {
    this.resumeData.education.push({
      degree: '',
      institution: '',
      year: ''
    });
    this.saveData();
    this.renderEducationList();
  }

  removeEducation(index) {
    this.resumeData.education.splice(index, 1);
    this.saveData();
    this.renderEducationList();
  }

  updateEducation(index, field, value) {
    this.resumeData.education[index][field] = value;
    this.saveData();
  }

  initSkillsForm() {
    const container = document.getElementById('skills-form');
    if (!container) return;

    container.innerHTML = `
      <div class="fb-field">
        <label class="fb-label">Skills (comma separated)</label>
        <textarea class="fb-textarea" id="skills-input" rows="3"
                  placeholder="JavaScript, Python, Project Management, Communication..."
                  onchange="app.updateSkills(this.value)"
        >${this.resumeData.skills.join(', ')}</textarea>
        <small class="fb-help">Enter your skills separated by commas</small>
      </div>

      <div class="fb-field mt-2">
        <label class="fb-label">Certifications</label>
        <div id="certifications-list"></div>
        <button class="btn btn-sm btn-outline mt-1" onclick="app.addCertification()">+ Add Certification</button>
      </div>
    `;

    this.renderCertificationsList();
  }

  updateSkills(value) {
    this.resumeData.skills = value.split(',').map(s => s.trim()).filter(s => s);
    this.saveData();
  }

  renderCertificationsList() {
    const container = document.getElementById('certifications-list');
    if (!container) return;

    if (this.resumeData.certifications.length === 0) {
      container.innerHTML = '<p class="text-muted">No certifications added.</p>';
      return;
    }

    container.innerHTML = this.resumeData.certifications.map((cert, index) => `
      <div class="flex gap-1 mb-1" style="align-items: center;">
        <input type="text" class="fb-input" value="${cert.name || ''}"
               placeholder="Certification name"
               style="flex: 2;"
               onchange="app.updateCertification(${index}, 'name', this.value)">
        <input type="text" class="fb-input" value="${cert.issuer || ''}"
               placeholder="Issuer"
               style="flex: 1;"
               onchange="app.updateCertification(${index}, 'issuer', this.value)">
        <input type="text" class="fb-input" value="${cert.year || ''}"
               placeholder="Year"
               style="width: 80px;"
               onchange="app.updateCertification(${index}, 'year', this.value)">
        <button class="btn btn-sm btn-danger" onclick="app.removeCertification(${index})">×</button>
      </div>
    `).join('');
  }

  addCertification() {
    this.resumeData.certifications.push({ name: '', issuer: '', year: '' });
    this.saveData();
    this.renderCertificationsList();
  }

  removeCertification(index) {
    this.resumeData.certifications.splice(index, 1);
    this.saveData();
    this.renderCertificationsList();
  }

  updateCertification(index, field, value) {
    this.resumeData.certifications[index][field] = value;
    this.saveData();
  }

  initJobForm() {
    const container = document.getElementById('job-form');
    if (!container) return;

    container.innerHTML = `
      <div class="fb-field">
        <label class="fb-label">Company Name</label>
        <input type="text" class="fb-input" id="job-company"
               placeholder="Company you're applying to"
               value="${this.coverLetterData.company || ''}">
      </div>
      <div class="fb-field">
        <label class="fb-label">Position</label>
        <input type="text" class="fb-input" id="job-position"
               placeholder="Job title"
               value="${this.coverLetterData.position || ''}">
      </div>
      <div class="fb-field">
        <label class="fb-label">Job Description (optional)</label>
        <textarea class="fb-textarea" id="job-description" rows="4"
                  placeholder="Paste the job description here for a more tailored letter..."
        >${this.coverLetterData.description || ''}</textarea>
      </div>
      <div class="fb-field">
        <label class="fb-label">Key Requirements (optional)</label>
        <textarea class="fb-textarea" id="job-requirements" rows="2"
                  placeholder="Key skills or requirements from the job posting..."
        >${this.coverLetterData.requirements || ''}</textarea>
      </div>
    `;
  }

  // ============ COVER LETTER ============

  async generateCoverLetter() {
    if (!this.ai.isConfigured()) {
      this.showStatus('Please configure your OpenAI API key in Settings first.', 'error');
      return;
    }

    // Get job data from form
    const jobData = {
      company: document.getElementById('job-company').value,
      position: document.getElementById('job-position').value,
      description: document.getElementById('job-description').value,
      requirements: document.getElementById('job-requirements').value
    };

    if (!jobData.company || !jobData.position) {
      this.showStatus('Please enter at least the company name and position.', 'error');
      return;
    }

    // Save job data
    this.coverLetterData = jobData;
    this.saveData();

    // Show loading
    const btn = document.getElementById('generate-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;

    const result = await this.ai.generateCoverLetter(this.resumeData, jobData);

    btn.textContent = originalText;
    btn.disabled = false;

    if (result.success) {
      this.coverLetterData.content = result.content;
      this.saveData();
      this.renderCoverLetterPreview();
      this.showStatus('Cover letter generated!', 'success');
    } else {
      this.showStatus('Failed to generate: ' + result.error, 'error');
    }
  }

  renderCoverLetterPreview() {
    const container = document.getElementById('cover-letter-preview');
    if (!container || !this.coverLetterData.content) return;

    const template = window.StandardCoverLetterTemplate;
    const data = {
      personalInfo: this.resumeData.personalInfo,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      recipient: {
        company: this.coverLetterData.company
      },
      content: this.coverLetterData.content,
      greeting: 'Dear Hiring Manager,',
      closing: 'Sincerely,'
    };

    // Simple template rendering
    let html = template.html;
    html = html.replace(/\{\{personalInfo\.fullName\}\}/g, data.personalInfo.fullName || 'Your Name');
    html = html.replace(/\{\{personalInfo\.email\}\}/g, data.personalInfo.email || '');
    html = html.replace(/\{\{personalInfo\.phone\}\}/g, data.personalInfo.phone || '');
    html = html.replace(/\{\{personalInfo\.location\}\}/g, data.personalInfo.location || '');
    html = html.replace(/\{\{date\}\}/g, data.date);
    html = html.replace(/\{\{greeting\}\}/g, data.greeting);
    html = html.replace(/\{\{content\}\}/g, data.content.replace(/\n/g, '<br>'));
    html = html.replace(/\{\{closing\}\}/g, data.closing);

    // Remove unrendered conditionals
    html = html.replace(/\{\{#if[^}]*\}\}[\s\S]*?\{\{\/if\}\}/g, '');

    container.innerHTML = `<style>${template.css}</style>${html}`;
  }

  editCoverLetter() {
    if (!this.coverLetterData.content) {
      this.showStatus('Generate a cover letter first.', 'error');
      return;
    }

    this.showModal('Edit Cover Letter', `
      <div class="fb-field">
        <label class="fb-label">Cover Letter Content</label>
        <textarea class="fb-textarea" id="edit-cover-content" rows="15"
                  style="font-family: Georgia, serif;"
        >${this.coverLetterData.content}</textarea>
      </div>
    `, [
      { text: 'Cancel', class: 'btn-secondary', action: () => this.closeModal() },
      { text: 'Save Changes', class: 'btn-primary', action: () => {
        this.coverLetterData.content = document.getElementById('edit-cover-content').value;
        this.saveData();
        this.renderCoverLetterPreview();
        this.closeModal();
      }}
    ]);
  }

  // ============ TEMPLATES ============

  registerTemplates() {
    if (window.ProfessionalTemplate) {
      this.templates.registerTemplate('professional', window.ProfessionalTemplate);
    }
    if (window.ModernTemplate) {
      this.templates.registerTemplate('modern', window.ModernTemplate);
    }
    if (window.MinimalTemplate) {
      this.templates.registerTemplate('minimal', window.MinimalTemplate);
    }
    if (window.StandardCoverLetterTemplate) {
      this.templates.registerTemplate('standard', window.StandardCoverLetterTemplate);
    }
  }

  renderTemplateGrid() {
    const resumeGrid = document.getElementById('resume-template-grid');
    if (resumeGrid) {
      const templates = [
        { id: 'professional', ...window.ProfessionalTemplate },
        { id: 'modern', ...window.ModernTemplate },
        { id: 'minimal', ...window.MinimalTemplate }
      ].filter(t => t.name);

      resumeGrid.innerHTML = templates.map(template => `
        <div class="template-card ${this.selectedResumeTemplate === template.id ? 'selected' : ''}"
             onclick="app.selectResumeTemplate('${template.id}')">
          <div class="template-preview">
            <div style="text-align: center; color: var(--text-light);">
              Preview
            </div>
          </div>
          <div class="template-info">
            <div class="template-name">${template.name}</div>
            <div class="template-desc">${template.description || ''}</div>
          </div>
          <span class="template-badge ${template.isPremium ? 'premium' : 'free'}">
            ${template.isPremium ? 'Premium' : 'Free'}
          </span>
        </div>
      `).join('');
    }
  }

  selectResumeTemplate(templateId) {
    const template = this.templates.getTemplate(templateId);
    if (template && template.isPremium && !this.isPremium) {
      this.showPremiumModal();
      return;
    }

    this.selectedResumeTemplate = templateId;
    this.saveData();
    this.renderTemplateGrid();
    this.showStatus(`Template "${templateId}" selected!`, 'success');
  }

  // ============ PDF GENERATION ============

  previewResume() {
    try {
      const doc = this.pdf.generateResume(this.resumeData);
      this.pdf.preview(doc);
    } catch (error) {
      this.showStatus('Error generating preview: ' + error.message, 'error');
    }
  }

  downloadResume() {
    try {
      const doc = this.pdf.generateResume(this.resumeData);
      const filename = `${this.resumeData.personalInfo.fullName || 'Resume'}-Resume.pdf`.replace(/\s+/g, '_');
      this.pdf.save(doc, filename);
      this.showStatus('Resume downloaded!', 'success');
    } catch (error) {
      this.showStatus('Error downloading: ' + error.message, 'error');
    }
  }

  previewCoverLetter() {
    if (!this.coverLetterData.content) {
      this.showStatus('Generate a cover letter first.', 'error');
      return;
    }

    try {
      const doc = this.pdf.generateCoverLetter(
        this.coverLetterData.content,
        this.resumeData.personalInfo
      );
      this.pdf.preview(doc);
    } catch (error) {
      this.showStatus('Error generating preview: ' + error.message, 'error');
    }
  }

  downloadCoverLetter() {
    if (!this.coverLetterData.content) {
      this.showStatus('Generate a cover letter first.', 'error');
      return;
    }

    try {
      const doc = this.pdf.generateCoverLetter(
        this.coverLetterData.content,
        this.resumeData.personalInfo
      );
      const filename = `${this.resumeData.personalInfo.fullName || 'Cover'}-CoverLetter-${this.coverLetterData.company || 'Company'}.pdf`.replace(/\s+/g, '_');
      this.pdf.save(doc, filename);
      this.showStatus('Cover letter downloaded!', 'success');
    } catch (error) {
      this.showStatus('Error downloading: ' + error.message, 'error');
    }
  }

  // ============ AUTH ============

  checkAuthState() {
    // Initialize Firebase if configured
    if (typeof initializeFirebase === 'function') {
      const firebaseReady = initializeFirebase();

      if (firebaseReady && typeof firebase !== 'undefined') {
        // Initialize auth module with Firebase
        this.auth.init(window.firebaseConfig).then(() => {
          // Listen for auth state changes
          firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              this.currentUser = user;
              this.isPremium = true; // For now, any logged-in user is premium
              this.storage.saveLocal('isPremium', true);

              // Update UI with user info
              const userName = document.getElementById('user-name');
              const userEmail = document.getElementById('user-email');
              if (userName) userName.textContent = user.displayName || 'User';
              if (userEmail) userEmail.textContent = user.email;

              // Initialize cloud storage
              this.storage.initCloud(firebase.firestore(), user.uid);

              // Sync data from cloud
              this.syncFromCloud();
            } else {
              this.currentUser = null;
              this.isPremium = false;
              this.storage.saveLocal('isPremium', false);
              this.storage.disableCloud();
            }
            this.updatePremiumUI();
          });
        });
      } else {
        // Firebase not configured, use local storage only
        this.isPremium = this.storage.loadLocal('isPremium') || false;
        this.updatePremiumUI();
      }
    } else {
      this.isPremium = this.storage.loadLocal('isPremium') || false;
      this.updatePremiumUI();
    }
  }

  async syncFromCloud() {
    if (!this.storage.isCloudEnabled) return;

    try {
      const result = await this.storage.loadCloud('data', 'resume');
      if (result.success && result.data) {
        this.resumeData = { ...this.getDefaultResumeData(), ...result.data };
        this.initForms();
        this.showStatus('Data synced from cloud!', 'success');
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
  }

  async syncToCloud() {
    if (!this.storage.isCloudEnabled) return;

    try {
      await this.storage.saveCloud('data', 'resume', this.resumeData);
      await this.storage.saveCloud('data', 'coverLetter', this.coverLetterData);
    } catch (error) {
      console.error('Cloud save error:', error);
    }
  }

  updatePremiumUI() {
    const premiumBanner = document.getElementById('premium-banner');
    const userPanel = document.getElementById('user-panel');

    if (this.isPremium && this.currentUser) {
      premiumBanner?.classList.add('hidden');
      userPanel?.classList.remove('hidden');
    } else {
      premiumBanner?.classList.remove('hidden');
      userPanel?.classList.add('hidden');
    }
  }

  showAuthModal(mode) {
    const isLogin = mode === 'login';

    // Check if Firebase is configured
    const firebaseConfigured = typeof firebase !== 'undefined' &&
                               window.firebaseConfig &&
                               window.firebaseConfig.apiKey !== 'YOUR_API_KEY';

    if (!firebaseConfigured) {
      this.showModal('Firebase Not Configured', `
        <div style="padding: 10px;">
          <p>To enable user accounts, you need to set up Firebase:</p>
          <ol style="margin: 15px 0; padding-left: 20px;">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
            <li>Create a new project</li>
            <li>Add a web app and copy the config</li>
            <li>Paste your config in <code>js/firebase-config.js</code></li>
            <li>Enable Email/Password and Google authentication</li>
            <li>Create a Firestore database</li>
          </ol>
          <p class="text-muted">See the README for detailed instructions.</p>
        </div>
      `, [
        { text: 'Close', class: 'btn-primary', action: () => this.closeModal() }
      ]);
      return;
    }

    this.showModal(isLogin ? 'Sign In' : 'Create Account', `
      <div class="fb-field">
        <label class="fb-label">Email</label>
        <input type="email" class="fb-input" id="auth-email" placeholder="your@email.com">
      </div>
      <div class="fb-field">
        <label class="fb-label">Password</label>
        <input type="password" class="fb-input" id="auth-password" placeholder="Password">
      </div>
      ${!isLogin ? `
      <div class="fb-field">
        <label class="fb-label">Confirm Password</label>
        <input type="password" class="fb-input" id="auth-password-confirm" placeholder="Confirm password">
      </div>
      ` : ''}
      <div id="auth-error" class="text-danger mt-1"></div>
      <div class="auth-divider"><span>or</span></div>
      <button type="button" class="btn btn-secondary btn-block" onclick="app.signInWithGoogle()">
        Sign in with Google
      </button>
    `, [
      { text: 'Cancel', class: 'btn-secondary', action: () => this.closeModal() },
      { text: isLogin ? 'Sign In' : 'Create Account', class: 'btn-primary', action: () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (isLogin) {
          app.signInWithEmail(email, password);
        } else {
          const confirmPassword = document.getElementById('auth-password-confirm').value;
          if (password !== confirmPassword) {
            document.getElementById('auth-error').textContent = 'Passwords do not match';
            return;
          }
          app.signUpWithEmail(email, password);
        }
      }}
    ]);
  }

  async signInWithEmail(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      this.closeModal();
      this.showStatus('Signed in successfully!', 'success');
    } catch (error) {
      document.getElementById('auth-error').textContent = this.getAuthErrorMessage(error);
    }
  }

  async signUpWithEmail(email, password) {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      this.closeModal();
      this.showStatus('Account created successfully!', 'success');
    } catch (error) {
      document.getElementById('auth-error').textContent = this.getAuthErrorMessage(error);
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      this.closeModal();
      this.showStatus('Signed in with Google!', 'success');
    } catch (error) {
      this.showStatus('Google sign-in failed: ' + error.message, 'error');
    }
  }

  getAuthErrorMessage(error) {
    const messages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    return messages[error.code] || error.message;
  }

  showPremiumModal() {
    // Check if pricing function exists (stripe-config.js loaded)
    const pricingHTML = typeof getPricingHTML === 'function'
      ? getPricingHTML()
      : `
        <div style="text-align: center;">
          <p>Configure Stripe in <code>js/stripe-config.js</code> to enable payments.</p>
        </div>
      `;

    // Use larger modal for pricing
    const modal = document.getElementById('modal');
    modal.style.maxWidth = '800px';

    this.showModal('Upgrade to Premium', `
      <div style="text-align: center; padding: 10px;">
        <p style="margin-bottom: 20px; color: var(--text-light);">
          Choose a plan to unlock all features
        </p>
        ${pricingHTML}
        <p style="margin-top: 20px; font-size: 12px; color: var(--text-light);">
          Or <a href="#" onclick="app.closeModal(); app.showAuthModal('signup'); return false;">create a free account</a>
          to try premium features for 7 days.
        </p>
      </div>
    `, [
      { text: 'Maybe Later', class: 'btn-secondary', action: () => {
        document.getElementById('modal').style.maxWidth = '500px';
        this.closeModal();
      }}
    ]);
  }

  async signOut() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
      }
      this.currentUser = null;
      this.isPremium = false;
      this.storage.saveLocal('isPremium', false);
      this.storage.disableCloud();
      this.updatePremiumUI();
      this.showStatus('Signed out.', 'info');
    } catch (error) {
      this.showStatus('Sign out error: ' + error.message, 'error');
    }
  }

  // ============ UI HELPERS ============

  showModal(title, body, buttons = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;

    const footer = document.getElementById('modal-footer');
    footer.innerHTML = buttons.map(btn =>
      `<button class="btn ${btn.class}" onclick="(${btn.action.toString()})()">${btn.text}</button>`
    ).join('');

    document.getElementById('modal-overlay').classList.add('active');
  }

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  }

  showStatus(message, type = 'info') {
    // Remove existing status
    document.querySelectorAll('.status-message').forEach(el => el.remove());

    const status = document.createElement('div');
    status.className = `status-message ${type}`;
    status.textContent = message;
    status.style.position = 'fixed';
    status.style.top = '20px';
    status.style.right = '20px';
    status.style.zIndex = '9999';
    status.style.maxWidth = '400px';

    document.body.appendChild(status);

    setTimeout(() => status.remove(), 4000);
  }
}

// Initialize app
const app = new ResumeBuilderApp();
