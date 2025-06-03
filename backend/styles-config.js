// frontend/tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

// frontend/src/index.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  body {
    @apply text-gray-900 antialiased;
  }
}

@layer components {
  /* Container */
  .container-custom {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  /* Buttons */
  .btn-primary {
    @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors;
  }

  .btn-secondary {
    @apply inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors;
  }

  /* Form Elements */
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  /* Cards */
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }

  .card-header {
    @apply px-4 py-5 sm:px-6 border-b border-gray-200;
  }

  .card-body {
    @apply px-4 py-5 sm:p-6;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Aspect ratio utilities */
.aspect-w-16 {
  position: relative;
  padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
  --tw-aspect-w: 16;
}

.aspect-h-9 {
  --tw-aspect-h: 9;
}

/* Loading skeleton */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

/* frontend/package.json (relevant dependencies to add)
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "axios": "^1.3.0",
    "@heroicons/react": "^2.0.16",
    "@tailwindcss/forms": "^0.5.3",
    "@tailwindcss/aspect-ratio": "^0.4.2"
  },
  "devDependencies": {
    "tailwindcss": "^3.2.4",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21"
  }
}