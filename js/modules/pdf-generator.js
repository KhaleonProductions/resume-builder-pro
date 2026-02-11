/**
 * PDF Generator Module
 * PDF creation using jsPDF
 * Reusable across applications
 */

class PDFGenerator {
  constructor(options = {}) {
    this.defaultFont = options.font || 'helvetica';
    this.defaultFontSize = options.fontSize || 12;
    this.margin = options.margin || 20;
    this.lineHeight = options.lineHeight || 7;
  }

  /**
   * Check if jsPDF is loaded
   */
  isReady() {
    return typeof window !== 'undefined' && typeof window.jspdf !== 'undefined';
  }

  /**
   * Create a new PDF document
   * @param {object} options - PDF options
   */
  createDocument(options = {}) {
    if (!this.isReady()) {
      throw new Error('jsPDF library not loaded');
    }

    const { jsPDF } = window.jspdf;
    return new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: options.unit || 'mm',
      format: options.format || 'a4'
    });
  }

  /**
   * Generate a resume PDF
   * @param {object} resumeData - Resume data object
   * @param {object} template - Template configuration
   */
  generateResume(resumeData, template = {}) {
    const doc = this.createDocument();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = template.margin || this.margin;
    const contentWidth = pageWidth - (margin * 2);

    let y = margin;

    // Colors
    const primaryColor = template.primaryColor || [41, 65, 114]; // Dark blue
    const textColor = template.textColor || [51, 51, 51];
    const lightGray = [128, 128, 128];

    // Helper function to check page break
    const checkPageBreak = (requiredSpace) => {
      if (y + requiredSpace > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      checkPageBreak(15);
      doc.setFontSize(14);
      doc.setFont(this.defaultFont, 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(title.toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // ===== HEADER / PERSONAL INFO =====
    const personalInfo = resumeData.personalInfo || {};

    // Name
    doc.setFontSize(24);
    doc.setFont(this.defaultFont, 'bold');
    doc.setTextColor(...primaryColor);
    const name = personalInfo.fullName || 'Your Name';
    doc.text(name, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Contact info line
    doc.setFontSize(10);
    doc.setFont(this.defaultFont, 'normal');
    doc.setTextColor(...lightGray);
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);

    const contactLine = contactParts.join('  |  ');
    doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // ===== PROFESSIONAL SUMMARY =====
    if (resumeData.summary) {
      addSectionHeader('Professional Summary');
      doc.setFontSize(10);
      doc.setFont(this.defaultFont, 'normal');
      doc.setTextColor(...textColor);

      const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;
    }

    // ===== WORK EXPERIENCE =====
    if (resumeData.experience && resumeData.experience.length > 0) {
      addSectionHeader('Work Experience');

      resumeData.experience.forEach((exp, index) => {
        checkPageBreak(25);

        // Job title and company
        doc.setFontSize(11);
        doc.setFont(this.defaultFont, 'bold');
        doc.setTextColor(...textColor);
        doc.text(exp.title || 'Job Title', margin, y);

        // Date on the right
        doc.setFontSize(10);
        doc.setFont(this.defaultFont, 'normal');
        doc.setTextColor(...lightGray);
        const dateText = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
        doc.text(dateText, pageWidth - margin, y, { align: 'right' });
        y += 5;

        // Company and location
        doc.setFontSize(10);
        doc.setFont(this.defaultFont, 'italic');
        doc.setTextColor(...lightGray);
        const companyLine = [exp.company, exp.location].filter(Boolean).join(' | ');
        doc.text(companyLine, margin, y);
        y += 6;

        // Description / Achievements
        doc.setFont(this.defaultFont, 'normal');
        doc.setTextColor(...textColor);

        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach(achievement => {
            checkPageBreak(8);
            const bulletText = `• ${achievement}`;
            const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
            doc.text(lines, margin + 3, y);
            y += lines.length * 4.5;
          });
        } else if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, contentWidth);
          doc.text(descLines, margin, y);
          y += descLines.length * 4.5;
        }

        y += 6;
      });
    }

    // ===== EDUCATION =====
    if (resumeData.education && resumeData.education.length > 0) {
      addSectionHeader('Education');

      resumeData.education.forEach((edu) => {
        checkPageBreak(15);

        doc.setFontSize(11);
        doc.setFont(this.defaultFont, 'bold');
        doc.setTextColor(...textColor);
        doc.text(edu.degree || 'Degree', margin, y);

        doc.setFontSize(10);
        doc.setFont(this.defaultFont, 'normal');
        doc.setTextColor(...lightGray);
        doc.text(edu.year || '', pageWidth - margin, y, { align: 'right' });
        y += 5;

        doc.setFont(this.defaultFont, 'italic');
        doc.text(edu.institution || 'Institution', margin, y);
        y += 8;
      });
    }

    // ===== SKILLS =====
    if (resumeData.skills && resumeData.skills.length > 0) {
      addSectionHeader('Skills');

      doc.setFontSize(10);
      doc.setFont(this.defaultFont, 'normal');
      doc.setTextColor(...textColor);

      const skillsText = resumeData.skills.join('  •  ');
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
      doc.text(skillsLines, margin, y);
      y += skillsLines.length * 5 + 5;
    }

    // ===== CERTIFICATIONS =====
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      addSectionHeader('Certifications');

      resumeData.certifications.forEach((cert) => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setFont(this.defaultFont, 'normal');
        doc.setTextColor(...textColor);

        const certText = `• ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.year ? ` (${cert.year})` : ''}`;
        doc.text(certText, margin, y);
        y += 5;
      });
    }

    return doc;
  }

  /**
   * Generate a cover letter PDF
   * @param {string} content - Cover letter content
   * @param {object} personalInfo - Sender's info
   * @param {object} template - Template configuration
   */
  generateCoverLetter(content, personalInfo = {}, template = {}) {
    const doc = this.createDocument();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = template.margin || this.margin;
    const contentWidth = pageWidth - (margin * 2);

    let y = margin;

    const primaryColor = template.primaryColor || [41, 65, 114];
    const textColor = template.textColor || [51, 51, 51];
    const lightGray = [128, 128, 128];

    // ===== HEADER =====
    doc.setFontSize(18);
    doc.setFont(this.defaultFont, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(personalInfo.fullName || 'Your Name', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont(this.defaultFont, 'normal');
    doc.setTextColor(...lightGray);

    if (personalInfo.email) {
      doc.text(personalInfo.email, margin, y);
      y += 5;
    }
    if (personalInfo.phone) {
      doc.text(personalInfo.phone, margin, y);
      y += 5;
    }
    if (personalInfo.location) {
      doc.text(personalInfo.location, margin, y);
      y += 5;
    }

    y += 5;

    // Date
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(today, margin, y);
    y += 15;

    // ===== BODY =====
    doc.setFontSize(11);
    doc.setFont(this.defaultFont, 'normal');
    doc.setTextColor(...textColor);

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    paragraphs.forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5.5 + 5;
    });

    return doc;
  }

  /**
   * Save PDF to file
   * @param {object} doc - jsPDF document
   * @param {string} filename - Output filename
   */
  save(doc, filename) {
    doc.save(filename);
  }

  /**
   * Get PDF as blob
   * @param {object} doc - jsPDF document
   */
  getBlob(doc) {
    return doc.output('blob');
  }

  /**
   * Get PDF as base64
   * @param {object} doc - jsPDF document
   */
  getBase64(doc) {
    return doc.output('datauristring');
  }

  /**
   * Open PDF in new window
   * @param {object} doc - jsPDF document
   */
  preview(doc) {
    const blob = this.getBlob(doc);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.PDFGenerator = PDFGenerator;
}
