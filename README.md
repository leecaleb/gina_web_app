# Gina Web App

A modern React web application built with Vite, featuring authentication and dashboard functionality.

## Features

- 🚀 Built with Vite for fast development and building
- ⚛️ React 18 with modern hooks
- 🔐 AWS Amplify authentication (configurable)
- 🎨 Clean, responsive UI design
- 📱 Mobile-friendly interface
- 🚀 Automated GitHub Pages deployment

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/leecaleb/gina_web_app.git
cd gina_web_app
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Demo Login

For testing purposes, use these credentials:
- Username: `demo`
- Password: `demo`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages

## Deployment

### Automatic Deployment (GitHub Actions)

The app automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Deployment

```bash
npm run build
npm run deploy
```

## Configuration

### AWS Amplify Setup

1. Create an AWS Amplify project
2. Add your configuration to `src/aws-config.js`:

```javascript
const awsConfig = {
  Auth: {
    region: 'your-region',
    userPoolId: 'your-user-pool-id',
    userPoolWebClientId: 'your-client-id',
  }
}

export default awsConfig
```

3. Uncomment the Amplify configuration in `src/App.jsx`

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthLoading.jsx
│   │   └── Login.jsx
│   └── Dashboard.jsx
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **AWS Amplify** - Authentication and backend services
- **CSS3** - Styling with modern features
- **GitHub Actions** - CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details