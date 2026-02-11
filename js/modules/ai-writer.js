/**
 * AI Writer Module
 * OpenAI integration for text generation
 * Reusable across applications
 */

class AIWriter {
  constructor(options = {}) {
    this.apiKey = options.apiKey || null;
    this.endpoint = options.endpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = options.model || 'gpt-4o-mini';
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature || 0.7;
  }

  /**
   * Set API key
   * @param {string} apiKey - OpenAI API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Set custom endpoint
   * @param {string} endpoint - API endpoint URL
   */
  setEndpoint(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Set model
   * @param {string} model - Model name (e.g., 'gpt-4o-mini', 'gpt-4o')
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Check if API is configured
   */
  isConfigured() {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  /**
   * Make a completion request to OpenAI
   * @param {string} systemPrompt - System message
   * @param {string} userPrompt - User message
   * @param {object} options - Override options
   */
  async complete(systemPrompt, userPrompt, options = {}) {
    if (!this.isConfigured()) {
      return { success: false, error: 'API key not configured' };
    }

    const requestBody = {
      model: options.model || this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        content: content.trim(),
        usage: data.usage
      };
    } catch (error) {
      console.error('AI completion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate a cover letter
   * @param {object} resumeData - User's resume data
   * @param {object} jobData - Job details
   */
  async generateCoverLetter(resumeData, jobData) {
    const systemPrompt = `You are an expert career coach and professional writer.
Write compelling, personalized cover letters that highlight relevant experience and skills.
Keep the tone professional yet personable. Be concise but impactful.
Do not use generic phrases. Tailor every sentence to the specific job and candidate.
Format the letter properly with appropriate greeting, body paragraphs, and closing.`;

    const userPrompt = `Write a cover letter for the following job application:

**Job Details:**
- Company: ${jobData.company}
- Position: ${jobData.position}
- Job Description: ${jobData.description || 'Not provided'}
- Key Requirements: ${jobData.requirements || 'Not provided'}

**Candidate Profile:**
- Name: ${resumeData.personalInfo?.fullName || 'Candidate'}
- Current/Recent Role: ${resumeData.experience?.[0]?.title || 'Professional'}
- Skills: ${resumeData.skills?.join(', ') || 'Various professional skills'}
- Summary: ${resumeData.summary || ''}

**Work Experience:**
${(resumeData.experience || []).slice(0, 3).map(exp =>
  `- ${exp.title} at ${exp.company}: ${exp.description || ''}`
).join('\n')}

**Education:**
${(resumeData.education || []).map(edu =>
  `- ${edu.degree} from ${edu.institution}`
).join('\n')}

Write a professional cover letter that:
1. Opens with a compelling hook mentioning the specific position
2. Highlights 2-3 most relevant experiences/achievements
3. Shows understanding of the company/role
4. Ends with a confident call to action
5. Is between 250-350 words`;

    return await this.complete(systemPrompt, userPrompt, { maxTokens: 800 });
  }

  /**
   * Improve/rewrite text
   * @param {string} text - Original text
   * @param {string} instruction - How to improve it
   */
  async improveText(text, instruction) {
    const systemPrompt = `You are a professional editor. Improve the given text based on the instruction.
Return only the improved text without explanations or commentary.`;

    const userPrompt = `Instruction: ${instruction}

Text to improve:
${text}`;

    return await this.complete(systemPrompt, userPrompt);
  }

  /**
   * Generate a professional summary for resume
   * @param {object} resumeData - User's resume data
   */
  async generateSummary(resumeData) {
    const systemPrompt = `You are an expert resume writer. Write concise, impactful professional summaries.
Focus on value proposition, key achievements, and relevant expertise.
Use strong action words. Avoid clichés. Keep it to 2-3 sentences.`;

    const userPrompt = `Generate a professional summary for:

**Current/Recent Role:** ${resumeData.experience?.[0]?.title || 'Professional'} at ${resumeData.experience?.[0]?.company || 'Company'}

**Years of Experience:** ${resumeData.yearsExperience || 'Several years'}

**Key Skills:** ${resumeData.skills?.join(', ') || 'Professional skills'}

**Target Role:** ${resumeData.targetRole || resumeData.experience?.[0]?.title || 'Similar role'}

**Key Achievements:**
${(resumeData.experience || []).slice(0, 2).map(exp =>
  exp.achievements?.join(', ') || exp.description || ''
).join('\n')}

Write a 2-3 sentence professional summary that positions this candidate strongly.`;

    return await this.complete(systemPrompt, userPrompt, { maxTokens: 200 });
  }

  /**
   * Enhance bullet points for work experience
   * @param {string} bulletPoint - Original bullet point
   * @param {string} role - Job role context
   */
  async enhanceBulletPoint(bulletPoint, role) {
    const systemPrompt = `You are an expert resume writer. Transform weak bullet points into powerful,
quantified achievement statements. Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].
Start with strong action verbs. Include metrics when possible. Keep it to one sentence.`;

    const userPrompt = `Role: ${role}

Original bullet point: "${bulletPoint}"

Rewrite this as a powerful, achievement-focused bullet point. Return only the improved bullet point.`;

    return await this.complete(systemPrompt, userPrompt, { maxTokens: 100 });
  }

  /**
   * Generate skill suggestions based on job description
   * @param {string} jobDescription - Job description text
   * @param {array} currentSkills - User's current skills
   */
  async suggestSkills(jobDescription, currentSkills = []) {
    const systemPrompt = `You are a career advisor. Analyze job descriptions and suggest relevant skills.
Return a JSON array of skill strings. Only include skills that are genuinely relevant.`;

    const userPrompt = `Job Description:
${jobDescription}

Current Skills: ${currentSkills.join(', ') || 'None listed'}

Suggest 5-10 additional relevant skills the candidate should consider adding if they have them.
Return as a JSON array of strings, e.g., ["Skill 1", "Skill 2"]`;

    const result = await this.complete(systemPrompt, userPrompt, { maxTokens: 200 });

    if (result.success) {
      try {
        // Extract JSON array from response
        const match = result.content.match(/\[[\s\S]*\]/);
        if (match) {
          result.skills = JSON.parse(match[0]);
        } else {
          result.skills = [];
        }
      } catch (e) {
        result.skills = [];
      }
    }

    return result;
  }
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.AIWriter = AIWriter;
}
