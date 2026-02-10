/**
 * Minimal Resume Template (PREMIUM)
 * Clean, minimalist design with maximum whitespace
 */

const MinimalTemplate = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, minimalist design that lets your content speak for itself',
  isPremium: true,
  thumbnail: 'assets/templates/minimal-thumb.png',

  // PDF styling configuration
  pdf: {
    margin: 25,
    primaryColor: [0, 0, 0],          // Black
    secondaryColor: [100, 100, 100],  // Gray
    textColor: [40, 40, 40],          // Dark gray
    lightGray: [150, 150, 150],
    fonts: {
      heading: 'helvetica',
      body: 'helvetica'
    }
  },

  // HTML preview template
  html: `
    <div class="resume-template resume-minimal">
      <!-- Header -->
      <header class="resume-header">
        <h1 class="resume-name">{{personalInfo.fullName}}</h1>
        <div class="resume-contact">
          {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
          {{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}
          {{#if personalInfo.location}}<span>{{personalInfo.location}}</span>{{/if}}
          {{#if personalInfo.linkedin}}<span>{{personalInfo.linkedin}}</span>{{/if}}
          {{#if personalInfo.website}}<span>{{personalInfo.website}}</span>{{/if}}
        </div>
      </header>

      <!-- Summary -->
      {{#if summary}}
      <section class="resume-section">
        <p class="resume-summary">{{summary}}</p>
      </section>
      {{/if}}

      <!-- Experience -->
      {{#if experience}}
      <section class="resume-section">
        <h2 class="section-title">Experience</h2>
        {{#each experience}}
        <div class="experience-item">
          <div class="experience-meta">
            <span class="experience-date">{{this.startDate}} — {{this.endDate}}</span>
          </div>
          <div class="experience-content">
            <div class="experience-title">{{this.title}}</div>
            <div class="experience-company">{{this.company}}</div>
            {{#if this.achievements}}
            <ul class="experience-list">
              {{#each this.achievements}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
            {{else}}
            <p class="experience-description">{{this.description}}</p>
            {{/if}}
          </div>
        </div>
        {{/each}}
      </section>
      {{/if}}

      <!-- Education -->
      {{#if education}}
      <section class="resume-section">
        <h2 class="section-title">Education</h2>
        {{#each education}}
        <div class="education-item">
          <div class="education-meta">
            <span class="education-year">{{this.year}}</span>
          </div>
          <div class="education-content">
            <div class="education-degree">{{this.degree}}</div>
            <div class="education-institution">{{this.institution}}</div>
          </div>
        </div>
        {{/each}}
      </section>
      {{/if}}

      <!-- Skills -->
      {{#if skills}}
      <section class="resume-section">
        <h2 class="section-title">Skills</h2>
        <p class="skills-text">{{join skills " · "}}</p>
      </section>
      {{/if}}

      <!-- Certifications -->
      {{#if certifications}}
      <section class="resume-section">
        <h2 class="section-title">Certifications</h2>
        {{#each certifications}}
        <div class="cert-line">{{this.name}}{{#if this.issuer}}, {{this.issuer}}{{/if}}{{#if this.year}} ({{this.year}}){{/if}}</div>
        {{/each}}
      </section>
      {{/if}}
    </div>
  `,

  // CSS styles for preview
  css: `
    .resume-minimal {
      font-family: 'Helvetica Neue', 'Arial', sans-serif;
      color: #282828;
      max-width: 750px;
      margin: 0 auto;
      padding: 50px;
      background: white;
      line-height: 1.5;
    }

    .resume-minimal .resume-header {
      margin-bottom: 40px;
    }

    .resume-minimal .resume-name {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .resume-minimal .resume-contact {
      font-size: 13px;
      color: #666;
    }

    .resume-minimal .resume-contact span {
      margin-right: 20px;
    }

    .resume-minimal .resume-section {
      margin-bottom: 35px;
    }

    .resume-minimal .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #999;
      margin: 0 0 20px 0;
    }

    .resume-minimal .resume-summary {
      font-size: 15px;
      line-height: 1.7;
      color: #444;
      margin: 0;
      font-weight: 300;
    }

    .resume-minimal .experience-item,
    .resume-minimal .education-item {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 30px;
      margin-bottom: 25px;
    }

    .resume-minimal .experience-meta,
    .resume-minimal .education-meta {
      text-align: right;
    }

    .resume-minimal .experience-date,
    .resume-minimal .education-year {
      font-size: 12px;
      color: #999;
    }

    .resume-minimal .experience-title {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 2px;
    }

    .resume-minimal .experience-company {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .resume-minimal .experience-list {
      margin: 0;
      padding-left: 18px;
      font-size: 14px;
      color: #444;
      font-weight: 300;
    }

    .resume-minimal .experience-list li {
      margin-bottom: 5px;
    }

    .resume-minimal .experience-description {
      font-size: 14px;
      color: #444;
      margin: 0;
      font-weight: 300;
    }

    .resume-minimal .education-degree {
      font-size: 15px;
      font-weight: 500;
    }

    .resume-minimal .education-institution {
      font-size: 14px;
      color: #666;
    }

    .resume-minimal .skills-text {
      font-size: 14px;
      color: #444;
      margin: 0;
      font-weight: 300;
    }

    .resume-minimal .cert-line {
      font-size: 14px;
      color: #444;
      margin-bottom: 8px;
      font-weight: 300;
    }

    @media print {
      .resume-minimal {
        padding: 0;
      }
    }
  `
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinimalTemplate;
}
if (typeof window !== 'undefined') {
  window.MinimalTemplate = MinimalTemplate;
}
