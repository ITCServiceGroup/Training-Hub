# Application Configuration

## Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_PASSWORD_HASH=bcrypt_hash_of_admin_password

# Application Settings
APP_NAME=Training Hub
APP_DESCRIPTION=Training and certification platform
SUPPORT_EMAIL=support@example.com
```

## Third-Party Integrations

### 1. TinyMCE Editor
- **Purpose**: Rich text editing for study guides
- **Configuration**:
```javascript
{
  selector: '#editor',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
  ],
  toolbar: 'undo redo | formatselect | bold italic | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | link image | codesample | help',
  codesample_languages: [
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' }
  ]
}
```

### 2. Monaco Editor
- **Purpose**: Code editing for interactive elements
- **Configuration**:
```javascript
{
  language: 'javascript',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: {
    enabled: false
  },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  wordWrap: 'on'
}
```

### 3. Chart.js
- **Purpose**: Data visualization in admin dashboard
- **Configuration**:
```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
```

## Security Configuration

### 1. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co;
">
```

### 2. Admin Access Control
```javascript
{
  maxLoginAttempts: 5,
  lockoutDuration: 15, // minutes
  sessionDuration: 60, // minutes
  requirePasswordChange: 90, // days
  minimumPasswordLength: 12
}
```

### 3. Rate Limiting
```javascript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

## Build Configuration

### 1. GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

### 2. ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended"
  ],
  "env": {
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### 3. Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Performance Optimization

### 1. Asset Caching
```javascript
{
  staticFileGlobs: [
    'dist/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'
  ],
  stripPrefix: 'dist/',
  runtimeCaching: [{
    urlPattern: /api/,
    handler: 'networkFirst'
  }]
}
```

### 2. Lazy Loading Configuration
```javascript
{
  modules: [
    {
      name: 'admin',
      path: '/admin',
      componentPath: './src/components/admin'
    },
    {
      name: 'study',
      path: '/study',
      componentPath: './src/components/study'
    },
    {
      name: 'quiz',
      path: '/quiz',
      componentPath: './src/components/quiz'
    }
  ]
}
```

### 3. Image Optimization
```javascript
{
  quality: 85,
  maxWidth: 1920,
  withMetadata: false,
  progressive: true
}
