/**
 * Standard Cover Letter Template
 * Clean, professional cover letter format
 */

const StandardCoverLetterTemplate = {
  id: 'standard',
  name: 'Standard',
  description: 'Professional cover letter format suitable for all industries',
  isPremium: false,

  // PDF styling configuration
  pdf: {
    margin: 25,
    primaryColor: [41, 65, 114],
    textColor: [51, 51, 51],
    fonts: {
      heading: 'helvetica',
      body: 'helvetica'
    }
  },

  // HTML preview template
  html: `
    <div class="cover-letter-template cl-standard">
      <!-- Header -->
      <header class="cl-header">
        <h1 class="cl-name">{{personalInfo.fullName}}</h1>
        <div class="cl-contact">
          {{#if personalInfo.email}}<div>{{personalInfo.email}}</div>{{/if}}
          {{#if personalInfo.phone}}<div>{{personalInfo.phone}}</div>{{/if}}
          {{#if personalInfo.location}}<div>{{personalInfo.location}}</div>{{/if}}
        </div>
      </header>

      <!-- Date -->
      <div class="cl-date">{{date}}</div>

      <!-- Recipient -->
      {{#if recipient}}
      <div class="cl-recipient">
        {{#if recipient.name}}<div>{{recipient.name}}</div>{{/if}}
        {{#if recipient.title}}<div>{{recipient.title}}</div>{{/if}}
        {{#if recipient.company}}<div>{{recipient.company}}</div>{{/if}}
        {{#if recipient.address}}<div>{{recipient.address}}</div>{{/if}}
      </div>
      {{/if}}

      <!-- Body -->
      <div class="cl-body">
        {{#if greeting}}
        <p class="cl-greeting">{{greeting}}</p>
        {{else}}
        <p class="cl-greeting">Dear Hiring Manager,</p>
        {{/if}}

        <div class="cl-content">{{content}}</div>

        <p class="cl-closing">{{closing}}</p>
        <p class="cl-signature">{{personalInfo.fullName}}</p>
      </div>
    </div>
  `,

  // CSS styles
  css: `
    .cl-standard {
      font-family: 'Georgia', serif;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 50px;
      background: white;
      line-height: 1.6;
    }

    .cl-standard .cl-header {
      margin-bottom: 30px;
    }

    .cl-standard .cl-name {
      font-size: 24px;
      color: #294172;
      margin: 0 0 10px 0;
    }

    .cl-standard .cl-contact {
      font-size: 13px;
      color: #666;
    }

    .cl-standard .cl-contact div {
      margin-bottom: 3px;
    }

    .cl-standard .cl-date {
      margin-bottom: 25px;
      font-size: 14px;
      color: #666;
    }

    .cl-standard .cl-recipient {
      margin-bottom: 25px;
      font-size: 14px;
    }

    .cl-standard .cl-recipient div {
      margin-bottom: 3px;
    }

    .cl-standard .cl-body {
      font-size: 14px;
    }

    .cl-standard .cl-greeting {
      margin-bottom: 20px;
    }

    .cl-standard .cl-content {
      margin-bottom: 25px;
      white-space: pre-wrap;
    }

    .cl-standard .cl-content p {
      margin-bottom: 15px;
    }

    .cl-standard .cl-closing {
      margin-bottom: 5px;
    }

    .cl-standard .cl-signature {
      font-weight: bold;
    }
  `
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StandardCoverLetterTemplate;
}
if (typeof window !== 'undefined') {
  window.StandardCoverLetterTemplate = StandardCoverLetterTemplate;
}
