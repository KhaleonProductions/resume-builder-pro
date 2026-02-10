/**
 * Form Builder Module
 * Dynamic form creation and validation
 * Reusable across applications
 */

class FormBuilder {
  constructor(options = {}) {
    this.container = null;
    this.fields = [];
    this.data = {};
    this.validators = new Map();
    this.onChangeCallback = options.onChange || null;
    this.cssPrefix = options.cssPrefix || 'fb-';

    this.registerDefaultValidators();
  }

  /**
   * Register default validators
   */
  registerDefaultValidators() {
    this.registerValidator('required', (value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value.toString().trim() !== '';
    }, 'This field is required');

    this.registerValidator('email', (value) => {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }, 'Please enter a valid email address');

    this.registerValidator('phone', (value) => {
      if (!value) return true;
      return /^[\d\s\-\+\(\)]{7,}$/.test(value);
    }, 'Please enter a valid phone number');

    this.registerValidator('url', (value) => {
      if (!value) return true;
      try {
        new URL(value.startsWith('http') ? value : `https://${value}`);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL');

    this.registerValidator('minLength', (value, min) => {
      if (!value) return true;
      return value.length >= min;
    }, (min) => `Must be at least ${min} characters`);

    this.registerValidator('maxLength', (value, max) => {
      if (!value) return true;
      return value.length <= max;
    }, (max) => `Must be no more than ${max} characters`);
  }

  /**
   * Register a custom validator
   * @param {string} name - Validator name
   * @param {function} fn - Validation function (value, ...args) => boolean
   * @param {string|function} message - Error message or function
   */
  registerValidator(name, fn, message) {
    this.validators.set(name, { fn, message });
  }

  /**
   * Set the container element
   * @param {string|Element} container - Container element or selector
   */
  setContainer(container) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    return this;
  }

  /**
   * Define form fields
   * @param {array} fields - Array of field definitions
   */
  setFields(fields) {
    this.fields = fields;
    return this;
  }

  /**
   * Set form data
   * @param {object} data - Form data object
   */
  setData(data) {
    this.data = { ...data };
    return this;
  }

  /**
   * Get current form data
   */
  getData() {
    return { ...this.data };
  }

  /**
   * Build and render the form
   */
  render() {
    if (!this.container) {
      throw new Error('Container not set. Call setContainer() first.');
    }

    const form = document.createElement('form');
    form.className = `${this.cssPrefix}form`;
    form.addEventListener('submit', (e) => e.preventDefault());

    this.fields.forEach(field => {
      const fieldElement = this.createField(field);
      form.appendChild(fieldElement);
    });

    this.container.innerHTML = '';
    this.container.appendChild(form);

    return this;
  }

  /**
   * Create a form field element
   * @param {object} field - Field definition
   */
  createField(field) {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.cssPrefix}field ${this.cssPrefix}field-${field.type || 'text'}`;
    wrapper.dataset.fieldName = field.name;

    // Label
    if (field.label) {
      const label = document.createElement('label');
      label.className = `${this.cssPrefix}label`;
      label.textContent = field.label;
      if (field.required) {
        label.innerHTML += ' <span class="required">*</span>';
      }
      label.setAttribute('for', `field-${field.name}`);
      wrapper.appendChild(label);
    }

    // Input element
    let input;
    switch (field.type) {
      case 'textarea':
        input = this.createTextarea(field);
        break;
      case 'select':
        input = this.createSelect(field);
        break;
      case 'checkbox':
        input = this.createCheckbox(field);
        break;
      case 'radio':
        input = this.createRadioGroup(field);
        break;
      case 'array':
        input = this.createArrayField(field);
        break;
      case 'group':
        input = this.createGroupField(field);
        break;
      default:
        input = this.createInput(field);
    }

    if (input) {
      wrapper.appendChild(input);
    }

    // Help text
    if (field.help) {
      const help = document.createElement('small');
      help.className = `${this.cssPrefix}help`;
      help.textContent = field.help;
      wrapper.appendChild(help);
    }

    // Error container
    const error = document.createElement('div');
    error.className = `${this.cssPrefix}error`;
    wrapper.appendChild(error);

    return wrapper;
  }

  /**
   * Create input element
   */
  createInput(field) {
    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.id = `field-${field.name}`;
    input.name = field.name;
    input.className = `${this.cssPrefix}input`;
    input.placeholder = field.placeholder || '';
    input.value = this.getValueByPath(this.data, field.name) || field.default || '';

    if (field.required) input.required = true;
    if (field.disabled) input.disabled = true;
    if (field.readonly) input.readOnly = true;
    if (field.min !== undefined) input.min = field.min;
    if (field.max !== undefined) input.max = field.max;

    input.addEventListener('input', (e) => this.handleChange(field.name, e.target.value));
    input.addEventListener('blur', () => this.validateField(field));

    return input;
  }

  /**
   * Create textarea element
   */
  createTextarea(field) {
    const textarea = document.createElement('textarea');
    textarea.id = `field-${field.name}`;
    textarea.name = field.name;
    textarea.className = `${this.cssPrefix}textarea`;
    textarea.placeholder = field.placeholder || '';
    textarea.rows = field.rows || 4;
    textarea.value = this.getValueByPath(this.data, field.name) || field.default || '';

    if (field.required) textarea.required = true;
    if (field.disabled) textarea.disabled = true;

    textarea.addEventListener('input', (e) => this.handleChange(field.name, e.target.value));
    textarea.addEventListener('blur', () => this.validateField(field));

    return textarea;
  }

  /**
   * Create select element
   */
  createSelect(field) {
    const select = document.createElement('select');
    select.id = `field-${field.name}`;
    select.name = field.name;
    select.className = `${this.cssPrefix}select`;

    if (field.placeholder) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = field.placeholder;
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
    }

    (field.options || []).forEach(opt => {
      const option = document.createElement('option');
      option.value = typeof opt === 'object' ? opt.value : opt;
      option.textContent = typeof opt === 'object' ? opt.label : opt;
      select.appendChild(option);
    });

    const currentValue = this.getValueByPath(this.data, field.name);
    if (currentValue) select.value = currentValue;

    if (field.required) select.required = true;
    if (field.disabled) select.disabled = true;

    select.addEventListener('change', (e) => this.handleChange(field.name, e.target.value));

    return select;
  }

  /**
   * Create checkbox element
   */
  createCheckbox(field) {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.cssPrefix}checkbox-wrapper`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `field-${field.name}`;
    input.name = field.name;
    input.className = `${this.cssPrefix}checkbox`;
    input.checked = this.getValueByPath(this.data, field.name) || false;

    input.addEventListener('change', (e) => this.handleChange(field.name, e.target.checked));

    const label = document.createElement('label');
    label.setAttribute('for', `field-${field.name}`);
    label.textContent = field.checkboxLabel || field.label;

    wrapper.appendChild(input);
    wrapper.appendChild(label);

    return wrapper;
  }

  /**
   * Create radio button group
   */
  createRadioGroup(field) {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.cssPrefix}radio-group`;

    const currentValue = this.getValueByPath(this.data, field.name);

    (field.options || []).forEach((opt, index) => {
      const radioWrapper = document.createElement('div');
      radioWrapper.className = `${this.cssPrefix}radio-wrapper`;

      const input = document.createElement('input');
      input.type = 'radio';
      input.id = `field-${field.name}-${index}`;
      input.name = field.name;
      input.value = typeof opt === 'object' ? opt.value : opt;
      input.checked = input.value === currentValue;

      input.addEventListener('change', (e) => this.handleChange(field.name, e.target.value));

      const label = document.createElement('label');
      label.setAttribute('for', `field-${field.name}-${index}`);
      label.textContent = typeof opt === 'object' ? opt.label : opt;

      radioWrapper.appendChild(input);
      radioWrapper.appendChild(label);
      wrapper.appendChild(radioWrapper);
    });

    return wrapper;
  }

  /**
   * Create array field (repeatable)
   */
  createArrayField(field) {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.cssPrefix}array-field`;
    wrapper.dataset.fieldName = field.name;

    const items = this.getValueByPath(this.data, field.name) || [];

    const renderItems = () => {
      const itemsContainer = wrapper.querySelector(`.${this.cssPrefix}array-items`) || document.createElement('div');
      itemsContainer.className = `${this.cssPrefix}array-items`;
      itemsContainer.innerHTML = '';

      items.forEach((item, index) => {
        const itemWrapper = document.createElement('div');
        itemWrapper.className = `${this.cssPrefix}array-item`;

        // Render sub-fields for this item
        (field.fields || []).forEach(subField => {
          const subFieldDef = {
            ...subField,
            name: `${field.name}[${index}].${subField.name}`
          };
          const subFieldElement = this.createField(subFieldDef);
          itemWrapper.appendChild(subFieldElement);
        });

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = `${this.cssPrefix}btn ${this.cssPrefix}btn-remove`;
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          items.splice(index, 1);
          this.setValueByPath(this.data, field.name, items);
          renderItems();
          if (this.onChangeCallback) this.onChangeCallback(this.data);
        });
        itemWrapper.appendChild(removeBtn);

        itemsContainer.appendChild(itemWrapper);
      });

      if (!wrapper.contains(itemsContainer)) {
        wrapper.appendChild(itemsContainer);
      }
    };

    // Add button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = `${this.cssPrefix}btn ${this.cssPrefix}btn-add`;
    addBtn.textContent = field.addLabel || 'Add Item';
    addBtn.addEventListener('click', () => {
      const newItem = {};
      (field.fields || []).forEach(f => {
        newItem[f.name] = f.default || '';
      });
      items.push(newItem);
      this.setValueByPath(this.data, field.name, items);
      renderItems();
      if (this.onChangeCallback) this.onChangeCallback(this.data);
    });

    renderItems();
    wrapper.appendChild(addBtn);

    return wrapper;
  }

  /**
   * Create group field (nested object)
   */
  createGroupField(field) {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.cssPrefix}group-field`;

    if (field.title) {
      const title = document.createElement('h4');
      title.className = `${this.cssPrefix}group-title`;
      title.textContent = field.title;
      wrapper.appendChild(title);
    }

    (field.fields || []).forEach(subField => {
      const subFieldDef = {
        ...subField,
        name: `${field.name}.${subField.name}`
      };
      const subFieldElement = this.createField(subFieldDef);
      wrapper.appendChild(subFieldElement);
    });

    return wrapper;
  }

  /**
   * Handle field value change
   */
  handleChange(name, value) {
    this.setValueByPath(this.data, name, value);
    if (this.onChangeCallback) {
      this.onChangeCallback(this.data);
    }
  }

  /**
   * Validate a single field
   * @param {object} field - Field definition
   */
  validateField(field) {
    const value = this.getValueByPath(this.data, field.name);
    const errors = [];

    // Check required
    if (field.required) {
      const validator = this.validators.get('required');
      if (!validator.fn(value)) {
        errors.push(validator.message);
      }
    }

    // Check other validators
    if (field.validate) {
      Object.entries(field.validate).forEach(([validatorName, args]) => {
        const validator = this.validators.get(validatorName);
        if (validator) {
          const validatorArgs = Array.isArray(args) ? args : [args];
          if (!validator.fn(value, ...validatorArgs)) {
            const message = typeof validator.message === 'function'
              ? validator.message(...validatorArgs)
              : validator.message;
            errors.push(message);
          }
        }
      });
    }

    // Update UI
    this.showFieldError(field.name, errors[0] || null);

    return errors.length === 0;
  }

  /**
   * Validate entire form
   */
  validate() {
    let isValid = true;

    this.fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show error for a field
   */
  showFieldError(fieldName, error) {
    const wrapper = this.container.querySelector(`[data-field-name="${fieldName}"]`);
    if (!wrapper) return;

    const errorElement = wrapper.querySelector(`.${this.cssPrefix}error`);
    const input = wrapper.querySelector('input, textarea, select');

    if (error) {
      wrapper.classList.add(`${this.cssPrefix}has-error`);
      if (errorElement) errorElement.textContent = error;
      if (input) input.classList.add('error');
    } else {
      wrapper.classList.remove(`${this.cssPrefix}has-error`);
      if (errorElement) errorElement.textContent = '';
      if (input) input.classList.remove('error');
    }
  }

  /**
   * Get value from nested path
   */
  getValueByPath(obj, path) {
    // Handle array notation: name[0].property
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    return normalizedPath.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set value at nested path
   */
  setValueByPath(obj, path, value) {
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const keys = normalizedPath.split('.');
    const lastKey = keys.pop();

    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = isNaN(keys[keys.indexOf(key) + 1]) ? {} : [];
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Reset form to initial data
   */
  reset() {
    this.data = {};
    this.render();
  }

  /**
   * Set onChange callback
   */
  onChange(callback) {
    this.onChangeCallback = callback;
    return this;
  }
}

// Export for ES6 modules
export { FormBuilder };

// Export for non-module usage
if (typeof window !== 'undefined') {
  window.FormBuilder = FormBuilder;
}
