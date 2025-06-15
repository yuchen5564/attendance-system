# Employee Attendance Management System

A modern enterprise attendance management system built with React and Firebase, providing comprehensive employee attendance tracking, leave management, and reporting features.

## Features

### 🏢 Enterprise-Grade Features
- **Smart Attendance Clock-in** - One-click clock-in/out with automatic time recording
- **Department Management** - Support multi-department structure with flexible organizational management
- **Employee Management** - Complete employee data management including basic information and attendance settings
- **Leave Management** - Multiple leave types with complete application and approval workflow

### 📊 Smart Reports & Analytics
- **Attendance Statistics** - Detailed personal and departmental attendance statistics
- **Leave Reports** - Leave usage analysis and trend reporting
- **Real-time Dashboard** - Key metrics at a glance

### 🔒 Access Control
- **Role Management** - Separate permissions for administrators and regular employees
- **Secure Authentication** - Firebase Authentication ensures data security
- **Operation Logs** - Complete system operation tracking

### 📱 Responsive Design
- **Cross-device Support** - Perfect compatibility across desktop, tablet, and mobile
- **Intuitive Interface** - Built with Ant Design components
- **Real-time Updates** - Data changes sync instantly

## Tech Stack

### Frontend Technologies
- **React 19** - Latest version of React framework
- **Ant Design** - Enterprise-class UI component library
- **React Router** - Single-page application routing
- **Tailwind CSS** - Rapid styling development
- **Vite** - Fast build tool

### Backend Services
- **Firebase Authentication** - User authentication service
- **Cloud Firestore** - NoSQL cloud database
- **Firebase Hosting** - Static website hosting  

### Development Tools
- **ESLint** - Code quality checking
- **PostCSS** - CSS post-processor
- **Day.js** - Lightweight date manipulation library

## Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Firebase project account

### Installation Steps

1. **Clone the Project**
   ```bash
   git clone <repository-url>
   cd attendance-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   
   Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   
   Visit `http://localhost:5173` to start using the system

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name and complete setup

### 2. Enable Required Services

#### Authentication Setup
1. Select "Authentication" in Firebase Console
2. Click "Get started"
3. Enable "Email/Password" in the "Sign-in method" tab

#### Firestore Setup
1. Select "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (can adjust security rules later)
4. Select database location

### 3. Get Configuration

1. Select "General" tab in project settings
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register the app and copy configuration information

### 4. Security Rules Setup

Set the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Database Indexes Setup

For optimal performance, create the following composite indexes in Firestore:

#### Attendance Collection Indexes
1. **attendance** collection:
   - Fields: `userId` (Ascending), `timestamp` (Ascending)
   - Query scope: Collection

2. **attendance** collection:
   - Fields: `userId` (Ascending), `timestamp` (Descending)
   - Query scope: Collection

#### Leave Requests Collection Indexes
3. **leaveRequests** collection:
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

4. **leaveRequests** collection:
   - Fields: `status` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

**How to create indexes:**
1. Go to Firebase Console → Firestore Database
2. Click on "Indexes" tab
3. Click "Add index"
4. Select the collection and add the fields with their sort order
5. Click "Create index"

**Note:** These indexes are essential for efficient querying of attendance records and leave requests. The system will suggest creating these indexes when you first run queries that require them.

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   
   Add environment variables in Vercel Dashboard project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`  
   - `VITE_FIREBASE_APP_ID`

### Firebase Hosting Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Project**
   ```bash
   firebase init hosting
   ```

4. **Build Project**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

### Other Platform Deployments

The project can also be deployed to:
- **Netlify** - Direct deployment from Git repository
- **GitHub Pages** - Suitable for open source projects
- **AWS S3 + CloudFront** - Enterprise-grade solution

## Usage Guide

### System Initialization

On first use, the system will guide you through initialization setup:

1. **Create Administrator Account** - Set up system administrator
2. **Basic Information Setup** - Company information and basic settings
3. **Department Creation** - Establish organizational structure
4. **Employee Addition** - Add employee accounts

### Daily Operations

#### Employee Features
- **Attendance Clock-in** - Click clock-in/out buttons on homepage
- **View Records** - Check personal attendance history on attendance page
- **Apply for Leave** - Submit leave applications on leave page

#### Administrator Features
- **Employee Management** - Add, edit, disable employee accounts
- **Department Management** - Manage organizational structure and department information
- **Leave Approval** - Review employee leave applications
- **Report Viewing** - View various statistical reports

### Advanced Settings

Settings page allows adjustment of:
- **Leave Types** - Customize leave categories and quotas
- **Department Settings** - Manage organizational structure
- **System Parameters** - Adjust system operation parameters

## Development

### Development Commands

```bash
# Start development server
npm run dev

# Code linting
npm run lint

# Build for production
npm run build

# Preview build results
npm run preview
```

### Project Structure

```
src/
├── components/         # Reusable components
├── contexts/           # React Context
├── firebase/           # Firebase services
├── hooks/              # Custom Hooks
├── pages/              # Page components
├── styles/             # Style files
└── utils/              # Utility functions
```

### Code Standards

- Use ESLint for code quality checking
- Follow React Hooks best practices
- Components use functional components + Hooks pattern
- Use TypeScript JSDoc for type annotations

## FAQ

### Q: What if I forget the administrator password?
A: You can reset the password in the Authentication page of Firebase Console, or contact technical support.

### Q: How to backup data?
A: You can use Firebase CLI tools to export Firestore data, or set up regular backups in Firebase Console.

### Q: Can I customize leave types?
A: Yes, you can add or modify leave categories in "Leave Type Management" in system settings.

### Q: Does it support multiple languages?
A: Currently supports Traditional Chinese primarily. Other languages can be supported by modifying language configuration files.

## Technical Support

For technical issues or feature suggestions, please:

1. Submit GitHub Issues
2. Check project documentation
3. Refer to Firebase official documentation

## License

This project is licensed under the MIT License. See `LICENSE` file for details.
