# Resume Builder Pro

A professional resume builder and AI-powered cover letter generator built as a Progressive Web App (PWA).

## Features

### Free Features
- **Resume Builder** - Create professional resumes with a clean interface
- **Professional Template** - Free, traditional resume template
- **PDF Export** - Download your resume as a PDF
- **Local Storage** - Your data is saved in your browser
- **Cover Letter Generator** - AI-powered cover letter creation (requires OpenAI API key)

### Premium Features (requires setup)
- **Premium Templates** - Modern, Minimal, and more designs
- **Cloud Sync** - Sync your data across devices (requires Firebase)
- **Account System** - Create an account to save your work

## Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
For full PWA functionality, serve the files with a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

### Option 3: GitHub Pages
1. Push this folder to a GitHub repository
2. Go to Settings > Pages
3. Select your branch and save
4. Access at `https://yourusername.github.io/resume-builder/`

## OpenAI API Setup

To enable AI-powered cover letter generation:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Open the app and go to **Settings**
3. Enter your API endpoint and API key
4. Click **Save API Settings**
5. Click **Test Connection** to verify

Your API key is stored locally in your browser and never sent to external servers (except OpenAI).

## Reusable Modules

All modules in `js/modules/` are standalone and can be used in other projects:

| Module | Description |
|--------|-------------|
| `storage-manager.js` | Local storage + Firebase cloud sync |
| `ai-writer.js` | OpenAI API integration |
| `pdf-generator.js` | PDF creation with jsPDF |
| `template-engine.js` | Simple template rendering |
| `form-builder.js` | Dynamic form creation |
| `auth-module.js` | Firebase authentication |

### Using a Module in Another Project

```html
<script src="path/to/storage-manager.js"></script>
<script>
  const storage = new StorageManager({ prefix: 'myapp_' });
  storage.saveLocal('user', { name: 'John' });
  const user = storage.loadLocal('user');
</script>
```

## Setting Up Premium Features

### Firebase (Cloud Sync & Auth)

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Add Firebase SDK to `index.html`:

```html
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
```

5. Initialize Firebase in `app.js` with your config

### Stripe (Payments)

For monetization, integrate Stripe Checkout or Payment Links for premium subscriptions.

## Project Structure

```
resume-builder/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── app.js              # Main application
│   └── modules/            # Reusable modules
│       ├── storage-manager.js
│       ├── ai-writer.js
│       ├── pdf-generator.js
│       ├── template-engine.js
│       ├── form-builder.js
│       └── auth-module.js
├── templates/
│   ├── resumes/            # Resume templates
│   │   ├── professional.js
│   │   ├── modern.js
│   │   └── minimal.js
│   └── cover-letters/      # Cover letter templates
│       └── standard.js
└── assets/
    └── icons/              # PWA icons
```

## Customization

### Adding a New Resume Template

1. Create a new file in `templates/resumes/`
2. Follow the structure in `professional.js`
3. Include it in `index.html`
4. Register it in `app.js` in the `registerTemplates()` method

### Modifying Styles

All styles are in `css/styles.css`. The app uses CSS custom properties (variables) for theming:

```css
:root {
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  /* ... */
}
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with PWA support

## License

MIT License - Feel free to use, modify, and distribute.
