# Directory Structure

```
training-hub/
├── assets/
│   ├── images/
│   │   └── logo.png
│   ├── css/
│   │   ├── styles.css
│   │   ├── admin.css
│   │   └── editor.css
│   └── js/
│       ├── lib/
│       │   ├── tinymce/
│       │   ├── monaco-editor/
│       │   └── chart.js
│       └── utils/
│           ├── auth.js
│           ├── database.js
│           └── validators.js
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── questionEditor.js
│   │   │   ├── studyGuideEditor.js
│   │   │   ├── quizManager.js
│   │   │   ├── accessCodeGenerator.js
│   │   │   └── resultsViewer.js
│   │   ├── quiz/
│   │   │   ├── quizInterface.js
│   │   │   ├── questionRenderer.js
│   │   │   └── resultsSummary.js
│   │   └── study/
│   │       ├── guideViewer.js
│   │       ├── practiceTest.js
│   │       └── interactiveElements.js
│   └── services/
│       ├── supabase.js
│       ├── questionService.js
│       ├── quizService.js
│       ├── studyGuideService.js
│       └── resultService.js
├── admin/
│   ├── index.html
│   ├── questions.html
│   ├── study-guides.html
│   ├── quizzes.html
│   └── results.html
├── study/
│   ├── index.html
│   ├── install/
│   │   └── [category].html
│   └── service/
│       └── [category].html
├── quiz/
│   ├── index.html
│   └── take.html
├── index.html
└── config/
    ├── supabase.js
    └── constants.js
```

## Key Directory Explanations

1. **assets/**: Static files and libraries
   - Images, CSS, and third-party JavaScript libraries
   - Organized by type for easy management

2. **src/**: Application source code
   - Components: Reusable UI components
   - Services: Business logic and API interactions

3. **admin/**: Admin interface pages
   - Protected by password
   - Separate concerns for different admin functions

4. **study/**: Public study guide pages
   - Dynamic category pages
   - Interactive content and practice tests

5. **quiz/**: Quiz taking interface
   - Access code validation
   - Quiz session management

6. **config/**: Configuration files
   - Supabase initialization
   - Global constants and settings
