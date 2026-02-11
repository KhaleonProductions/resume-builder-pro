/**
 * Template Engine Module
 * Template rendering and management
 * Reusable across applications
 */

class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.helpers = new Map();
    this.registerDefaultHelpers();
  }

  /**
   * Register default template helpers
   */
  registerDefaultHelpers() {
    // Date formatting
    this.registerHelper('formatDate', (date, format = 'short') => {
      if (!date) return '';
      const d = new Date(date);
      if (format === 'short') {
        return d.toLocaleDateString();
      } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return d.toISOString();
    });

    // Capitalize first letter
    this.registerHelper('capitalize', (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Join array
    this.registerHelper('join', (arr, separator = ', ') => {
      if (!Array.isArray(arr)) return '';
      return arr.join(separator);
    });

    // Truncate text
    this.registerHelper('truncate', (str, length = 100) => {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    // Conditional
    this.registerHelper('if', (condition, trueValue, falseValue = '') => {
      return condition ? trueValue : falseValue;
    });
  }

  /**
   * Register a template
   * @param {string} name - Template name
   * @param {object} template - Template object with html and styles
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
  }

  /**
   * Get a registered template
   * @param {string} name - Template name
   */
  getTemplate(name) {
    return this.templates.get(name);
  }

  /**
   * Get all template names
   */
  getTemplateNames() {
    return Array.from(this.templates.keys());
  }

  /**
   * Register a helper function
   * @param {string} name - Helper name
   * @param {function} fn - Helper function
   */
  registerHelper(name, fn) {
    this.helpers.set(name, fn);
  }

  /**
   * Render a template with data
   * @param {string} templateName - Template name or raw template string
   * @param {object} data - Data to render
   */
  render(templateName, data) {
    let template = this.templates.get(templateName);
    let html = '';

    if (template) {
      html = template.html || template;
    } else {
      // Assume templateName is raw template string
      html = templateName;
    }

    // Process template syntax
    html = this.processTemplate(html, data);

    return html;
  }

  /**
   * Process template string with data
   * @param {string} template - Template string
   * @param {object} data - Data object
   */
  processTemplate(template, data) {
    let result = template;

    // Process loops: {{#each items}}...{{/each}}
    result = this.processLoops(result, data);

    // Process conditionals: {{#if condition}}...{{/if}}
    result = this.processConditionals(result, data);

    // Process variables: {{variable}} and {{object.property}}
    result = this.processVariables(result, data);

    // Process helpers: {{helper arg1 arg2}}
    result = this.processHelpers(result, data);

    return result;
  }

  /**
   * Process loop blocks
   */
  processLoops(template, data) {
    const loopRegex = /\{\{#each\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return template.replace(loopRegex, (match, path, content) => {
      const items = this.getValueByPath(data, path);
      if (!Array.isArray(items)) return '';

      return items.map((item, index) => {
        const itemData = {
          ...data,
          this: item,
          '@index': index,
          '@first': index === 0,
          '@last': index === items.length - 1
        };

        // Handle simple item references
        let itemContent = content.replace(/\{\{this\.(\w+)\}\}/g, (m, prop) => {
          return item[prop] !== undefined ? item[prop] : '';
        });

        itemContent = itemContent.replace(/\{\{this\}\}/g,
          typeof item === 'object' ? JSON.stringify(item) : item
        );

        return this.processTemplate(itemContent, itemData);
      }).join('');
    });
  }

  /**
   * Process conditional blocks
   */
  processConditionals(template, data) {
    // {{#if condition}}...{{else}}...{{/if}}
    const ifElseRegex = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
    template = template.replace(ifElseRegex, (match, path, trueContent, falseContent) => {
      const value = this.getValueByPath(data, path);
      return value ? this.processTemplate(trueContent, data) : this.processTemplate(falseContent, data);
    });

    // {{#if condition}}...{{/if}}
    const ifRegex = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    template = template.replace(ifRegex, (match, path, content) => {
      const value = this.getValueByPath(data, path);
      return value ? this.processTemplate(content, data) : '';
    });

    return template;
  }

  /**
   * Process variable placeholders
   */
  processVariables(template, data) {
    // Match {{variable}} or {{object.property.nested}}
    const varRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;

    return template.replace(varRegex, (match, path) => {
      // Skip if it looks like a helper or block
      if (path.startsWith('#') || path.startsWith('/')) return match;

      const value = this.getValueByPath(data, path);
      if (value === undefined || value === null) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  }

  /**
   * Process helper functions
   */
  processHelpers(template, data) {
    // Match {{helperName arg1 arg2 ...}}
    const helperRegex = /\{\{(\w+)\s+([^}]+)\}\}/g;

    return template.replace(helperRegex, (match, helperName, argsString) => {
      const helper = this.helpers.get(helperName);
      if (!helper) return match;

      // Parse arguments
      const args = this.parseHelperArgs(argsString, data);
      return helper(...args);
    });
  }

  /**
   * Parse helper arguments
   */
  parseHelperArgs(argsString, data) {
    const args = [];
    const parts = argsString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

    parts.forEach(part => {
      // Remove quotes from strings
      if (part.startsWith('"') && part.endsWith('"')) {
        args.push(part.slice(1, -1));
      } else if (part === 'true') {
        args.push(true);
      } else if (part === 'false') {
        args.push(false);
      } else if (!isNaN(part)) {
        args.push(Number(part));
      } else {
        // Treat as data path
        args.push(this.getValueByPath(data, part));
      }
    });

    return args;
  }

  /**
   * Get value from nested object by path
   * @param {object} obj - Data object
   * @param {string} path - Dot-notation path
   */
  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Render template to DOM element
   * @param {string} templateName - Template name
   * @param {object} data - Data to render
   * @param {string|Element} target - Target element or selector
   */
  renderTo(templateName, data, target) {
    const html = this.render(templateName, data);
    const element = typeof target === 'string' ? document.querySelector(target) : target;

    if (element) {
      element.innerHTML = html;
    }

    return html;
  }

  /**
   * Create a reusable template function
   * @param {string} templateString - Template string
   */
  compile(templateString) {
    return (data) => this.processTemplate(templateString, data);
  }
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.TemplateEngine = TemplateEngine;
}
