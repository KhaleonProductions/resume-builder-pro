/**
 * Modern Resume Template (PREMIUM)
 * Contemporary design with accent colors and clean typography
 */

const ModernTemplate = {
  id: 'modern',
  name: 'Modern',
  description: 'Contemporary design with bold accents, perfect for creative and tech roles',
  isPremium: true,
  thumbnail: 'assets/templates/modern-thumb.png',

  // PDF styling configuration
  pdf: {
    margin: 20,
    primaryColor: [79, 70, 229],      // Indigo
    secondaryColor: [99, 102, 241],   // Lighter indigo
    textColor: [31, 41, 55],          // Gray-800
    lightGray: [107, 114, 128],       // Gray-500
    accentBg: [238, 242, 255],        // Indigo-50
    fonts: {
      heading: 'helvetica',
      body: 'helvetica'
    }
  },

  // HTML preview template
  html: `
    <div class="resume-template resume-modern">
      <!-- Sidebar -->
      <aside class="resume-sidebar">
        <div class="sidebar-header">
          <h1 class="resume-name">{{personalInfo.fullName}}</h1>
          {{#if personalInfo.title}}
          <div class="resume-title">{{personalInfo.title}}</div>
          {{/if}}
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">Contact</h3>
          <div class="contact-list">
            {{#if personalInfo.email}}
            <div class="contact-item">
              <span class="contact-icon">✉</span>
              <span>{{personalInfo.email}}</span>
            </div>
            {{/if}}
            {{#if personalInfo.phone}}
            <div class="contact-item">
              <span class="contact-icon">☎</span>
              <span>{{personalInfo.phone}}</span>
            </div>
            {{/if}}
            {{#if personalInfo.location}}
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>{{personalInfo.location}}</span>
            </div>
            {{/if}}
            {{#if personalInfo.linkedin}}
            <div class="contact-item">
              <span class="contact-icon">🔗</span>
              <span>{{personalInfo.linkedin}}</span>
            </div>
            {{/if}}
          </div>
        </div>

        {{#if skills}}
        <div class="sidebar-section">
          <h3 class="sidebar-title">Skills</h3>
          <div class="skills-list">
            {{#each skills}}
            <span class="skill-pill">{{this}}</span>
            {{/each}}
          </div>
        </div>
        {{/if}}

        {{#if education}}
        <div class="sidebar-section">
          <h3 class="sidebar-title">Education</h3>
          {{#each education}}
          <div class="education-item">
            <div class="education-degree">{{this.degree}}</div>
            <div class="education-institution">{{this.institution}}</div>
            <div class="education-year">{{this.year}}</div>
          </div>
          {{/each}}
        </div>
        {{/if}}

        {{#if certifications}}
        <div class="sidebar-section">
          <h3 class="sidebar-title">Certifications</h3>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{this.name}}</div>
            {{#if this.year}}<div class="cert-year">{{this.year}}</div>{{/if}}
          </div>
          {{/each}}
        </div>
        {{/if}}
      </aside>

      <!-- Main Content -->
      <main class="resume-main">
        {{#if summary}}
        <section class="main-section">
          <h2 class="section-title">
            <span class="title-icon">👤</span>
            About Me
          </h2>
          <p class="resume-summary">{{summary}}</p>
        </section>
        {{/if}}

        {{#if experience}}
        <section class="main-section">
          <h2 class="section-title">
            <span class="title-icon">💼</span>
            Experience
          </h2>
          {{#each experience}}
          <div class="experience-item">
            <div class="experience-header">
              <div>
                <div class="experience-title">{{this.title}}</div>
                <div class="experience-company">{{this.company}}{{#if this.location}} • {{this.location}}{{/if}}</div>
              </div>
              <div class="experience-date">{{this.startDate}} - {{this.endDate}}</div>
            </div>
            {{#if this.achievements}}
            <ul class="experience-achievements">
              {{#each this.achievements}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
            {{else}}
            <p class="experience-description">{{this.description}}</p>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
      </main>
    </div>
  `,

  // CSS styles for preview
  css: `
    .resume-modern {
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      color: #1f2937;
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: 100%;
      background: white;
    }

    .resume-modern .resume-sidebar {
      background: linear-gradient(180deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      padding: 40px 25px;
    }

    .resume-modern .sidebar-header {
      margin-bottom: 30px;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .resume-modern .resume-name {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 5px 0;
      line-height: 1.2;
    }

    .resume-modern .resume-title {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }

    .resume-modern .sidebar-section {
      margin-bottom: 25px;
    }

    .resume-modern .sidebar-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 12px 0;
      opacity: 0.8;
    }

    .resume-modern .contact-list {
      font-size: 13px;
    }

    .resume-modern .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .resume-modern .contact-icon {
      margin-right: 10px;
      font-size: 14px;
    }

    .resume-modern .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .resume-modern .skill-pill {
      background: rgba(255,255,255,0.2);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
    }

    .resume-modern .education-item {
      margin-bottom: 15px;
    }

    .resume-modern .education-degree {
      font-weight: 600;
      font-size: 13px;
    }

    .resume-modern .education-institution {
      font-size: 12px;
      opacity: 0.9;
    }

    .resume-modern .education-year {
      font-size: 11px;
      opacity: 0.7;
    }

    .resume-modern .cert-item {
      margin-bottom: 10px;
    }

    .resume-modern .cert-name {
      font-size: 13px;
    }

    .resume-modern .cert-year {
      font-size: 11px;
      opacity: 0.7;
    }

    .resume-modern .resume-main {
      padding: 40px 35px;
    }

    .resume-modern .main-section {
      margin-bottom: 30px;
    }

    .resume-modern .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      color: #4f46e5;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e7ff;
    }

    .resume-modern .title-icon {
      margin-right: 10px;
    }

    .resume-modern .resume-summary {
      font-size: 14px;
      line-height: 1.7;
      color: #4b5563;
      margin: 0;
    }

    .resume-modern .experience-item {
      margin-bottom: 25px;
      padding-left: 15px;
      border-left: 3px solid #e0e7ff;
    }

    .resume-modern .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .resume-modern .experience-title {
      font-weight: 600;
      font-size: 15px;
      color: #1f2937;
    }

    .resume-modern .experience-company {
      font-size: 13px;
      color: #6b7280;
    }

    .resume-modern .experience-date {
      font-size: 12px;
      color: #4f46e5;
      background: #eef2ff;
      padding: 3px 10px;
      border-radius: 10px;
      white-space: nowrap;
    }

    .resume-modern .experience-achievements {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      line-height: 1.6;
      color: #4b5563;
    }

    .resume-modern .experience-achievements li {
      margin-bottom: 5px;
    }
  `
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernTemplate;
}
if (typeof window !== 'undefined') {
  window.ModernTemplate = ModernTemplate;
}
