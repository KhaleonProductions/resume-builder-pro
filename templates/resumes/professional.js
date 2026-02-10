/**
 * Professional Resume Template (FREE)
 * Clean, traditional design suitable for most industries
 */

const ProfessionalTemplate = {
  id: 'professional',
  name: 'Professional',
  description: 'Clean, traditional design suitable for corporate and professional roles',
  isPremium: false,
  thumbnail: 'assets/templates/professional-thumb.png',

  // PDF styling configuration
  pdf: {
    margin: 20,
    primaryColor: [41, 65, 114],      // Dark blue
    secondaryColor: [70, 130, 180],   // Steel blue
    textColor: [51, 51, 51],          // Dark gray
    lightGray: [128, 128, 128],
    fonts: {
      heading: 'helvetica',
      body: 'helvetica'
    }
  },

  // HTML preview template
  html: `
    <div class="resume-template resume-professional">
      <!-- Header -->
      <header class="resume-header">
        <h1 class="resume-name">{{personalInfo.fullName}}</h1>
        <div class="resume-contact">
          {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
          {{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}
          {{#if personalInfo.location}}<span>{{personalInfo.location}}</span>{{/if}}
          {{#if personalInfo.linkedin}}<span>{{personalInfo.linkedin}}</span>{{/if}}
        </div>
      </header>

      <!-- Summary -->
      {{#if summary}}
      <section class="resume-section">
        <h2 class="section-title">Professional Summary</h2>
        <p class="resume-summary">{{summary}}</p>
      </section>
      {{/if}}

      <!-- Experience -->
      {{#if experience}}
      <section class="resume-section">
        <h2 class="section-title">Work Experience</h2>
        {{#each experience}}
        <div class="experience-item">
          <div class="experience-header">
            <div class="experience-title">{{this.title}}</div>
            <div class="experience-date">{{this.startDate}} - {{this.endDate}}</div>
          </div>
          <div class="experience-company">{{this.company}}{{#if this.location}} | {{this.location}}{{/if}}</div>
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

      <!-- Education -->
      {{#if education}}
      <section class="resume-section">
        <h2 class="section-title">Education</h2>
        {{#each education}}
        <div class="education-item">
          <div class="education-header">
            <div class="education-degree">{{this.degree}}</div>
            <div class="education-year">{{this.year}}</div>
          </div>
          <div class="education-institution">{{this.institution}}</div>
        </div>
        {{/each}}
      </section>
      {{/if}}

      <!-- Skills -->
      {{#if skills}}
      <section class="resume-section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-list">
          {{#each skills}}
          <span class="skill-tag">{{this}}</span>
          {{/each}}
        </div>
      </section>
      {{/if}}

      <!-- Certifications -->
      {{#if certifications}}
      <section class="resume-section">
        <h2 class="section-title">Certifications</h2>
        <ul class="certifications-list">
          {{#each certifications}}
          <li>{{this.name}}{{#if this.issuer}} - {{this.issuer}}{{/if}}{{#if this.year}} ({{this.year}}){{/if}}</li>
          {{/each}}
        </ul>
      </section>
      {{/if}}
    </div>
  `,

  // CSS styles for preview
  css: `
    .resume-professional {
      font-family: 'Georgia', serif;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }

    .resume-professional .resume-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #294172;
    }

    .resume-professional .resume-name {
      font-size: 28px;
      color: #294172;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .resume-professional .resume-contact {
      color: #666;
      font-size: 14px;
    }

    .resume-professional .resume-contact span {
      margin: 0 10px;
    }

    .resume-professional .resume-contact span:not(:last-child)::after {
      content: '|';
      margin-left: 20px;
      color: #ccc;
    }

    .resume-professional .resume-section {
      margin-bottom: 25px;
    }

    .resume-professional .section-title {
      font-size: 16px;
      color: #294172;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #294172;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }

    .resume-professional .resume-summary {
      font-size: 14px;
      line-height: 1.6;
      color: #444;
    }

    .resume-professional .experience-item,
    .resume-professional .education-item {
      margin-bottom: 20px;
    }

    .resume-professional .experience-header,
    .resume-professional .education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .resume-professional .experience-title,
    .resume-professional .education-degree {
      font-weight: bold;
      font-size: 15px;
      color: #333;
    }

    .resume-professional .experience-date,
    .resume-professional .education-year {
      font-size: 13px;
      color: #666;
    }

    .resume-professional .experience-company,
    .resume-professional .education-institution {
      font-style: italic;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .resume-professional .experience-achievements {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      line-height: 1.5;
    }

    .resume-professional .experience-achievements li {
      margin-bottom: 5px;
    }

    .resume-professional .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .resume-professional .skill-tag {
      background: #f0f4f8;
      color: #294172;
      padding: 5px 12px;
      border-radius: 3px;
      font-size: 13px;
    }

    .resume-professional .certifications-list {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
    }

    .resume-professional .certifications-list li {
      margin-bottom: 5px;
    }
  `
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfessionalTemplate;
}
if (typeof window !== 'undefined') {
  window.ProfessionalTemplate = ProfessionalTemplate;
}
