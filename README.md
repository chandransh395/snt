## Documentation for Developers

This documentation is intended for developers who want to contribute to this project. It provides an overview of the project structure, key components, and how to get started.

### Table of Contents

*   Getting Started
    *   Prerequisites
    *   Installation
    *   Running the Development Server
    *   Building for Production
*   Project Structure
*   Core Components
    *   `src/App.tsx`
    *   `src/lib/utils.ts`
    *   `src/components/Layout.tsx`
    *   ... (Document other core components)
*   Pages
    *   `src/pages/Home.tsx`
    *   `src/pages/About.tsx`
    *   ... (Document each page)
*   Components
    *   UI Components (`src/components/ui/`)
    *   Feature Components (`src/components/`)
    *   Admin Components (`src/components/admin/`)
    *   ... (Document other component categories)
*   Contexts
*   Hooks
*   Utilities
*   Integrations
    *   Supabase
*   Tutorials
    *   Tutorial 1: Setting up your Development Environment
    *   Tutorial 2: Adding a New Page
    *   Tutorial 3: Using a UI Component
    *   ... (Add more tutorials)
*   Contributing
*   License

### Project Structure

The project follows a standard React application structure with the following main directories:

*   `public/`: Contains static assets like images, manifest file, and service worker.
*   `src/`: Contains the main application code.
    *   `components/`: Reusable React components.
    *   `contexts/`: React contexts for managing global state.
    *   `hooks/`: Custom React hooks.
    *   `lib/`: Utility functions.
    *   `pages/`: Components representing different pages of the application.
    *   `utils/`: Additional utility functions and helpers.
    *   `integrations/`: Code for integrating with external services (e.g., Supabase).
*   `supabase/`: Supabase configuration and migration files.

### Core Components

#### `src/App.tsx`

This is the main entry point of the application. It sets up the routing using `react-router-dom` and wraps the application with necessary providers like `AuthProvider` and `ThemeProvider`.

*   **Purpose:** Defines the main application structure, routing, and global providers.
*   **Key Features:**
    *   Uses `BrowserRouter` for client-side routing.
    *   Defines public and protected routes using `PublicRoute` and `ProtectedRoute`.
    *   Includes an `ErrorBoundary` for handling errors gracefully.
    *   Integrates `ThemeProvider` for managing themes.
    *   Includes `Toaster` for displaying notifications.
    *   Implements lazy loading for some pages using `Suspense` and `lazy`.
    *   Includes `SecurityHeaders` and `OfflineBanner` components.
*   **Usage:** This component is the root of the application and is rendered in `src/main.tsx`. You typically don't modify this file unless you need to add new routes, providers, or change the overall application structure.

#### `src/lib/utils.ts`

This file contains a collection of utility functions used across the project.

*   **Purpose:** Provides reusable helper functions to avoid code duplication and improve maintainability.
*   **Functions:**
    *   `cn(...inputs: ClassValue[]): string`: A helper function for conditionally joining CSS class names. It uses `clsx` and `tailwind-merge` to intelligently merge Tailwind CSS classes.
*   **Usage:** Import and use the functions from this file in any component or module where they are needed.

#### `src/components/Layout.tsx`

This component defines the main layout structure for most pages in the application.

*   **Purpose:** Provides a consistent header, footer, and content area for pages.
*   **Key Features:**
    *   Includes the `Header` and `Footer` components.
    *   Wraps the content with `PageTransition` for smooth page transitions.
    *   Includes `SecurityHeaders`.
    *   Adds playful animations on page scroll and a custom cursor effect (for desktop).
    *   Uses `useIsMobile` hook to conditionally apply effects.
*   **Usage:** Wrap the content of your pages with the `Layout` component to apply the standard layout.

### Tutorials

#### Tutorial 2: Adding a New Page

This tutorial guides you through the process of adding a new page to the application.

**Steps:**

1.  **Create a new page component:**
    *   In the `src/pages/` directory, create a new file for your page component (e.g., `src/pages/NewPage.tsx`).
    *   Define a React component in this file.
```
typescript
    import React from 'react';

    const NewPage = () => {
      return (
        <div>
          <h1>This is the new page</h1>
          <p>Content for the new page goes here.</p>
        </div>
      );
    };

    export default NewPage;
    
```
2.  **Add a new route in `src/App.tsx`:**
    *   Open `src/App.tsx`.
    *   Import your new page component.
    *   Add a new `Route` for your page within the main `Routes` component. Choose a path for your new page (e.g., `/new-page`).
```
typescript
    // ... imports
    import NewPage from './pages/NewPage'; // Import your new page component
    // ...

    function App() {
      return (
        {/* ... existing code ... */}
                <Route path="/new-page" element={<Layout><NewPage /></Layout>} /> {/* Add the new route */}
        {/* ... existing code ... */}
      );
    }
    
```
3.  **Add a link to the new page (optional):**
    *   If you want to navigate to your new page from another part of the application (e.g., the header or footer), add a link using the `Link` component from `react-router-dom`.
```
typescript
    import { Link } from 'react-router-dom';

    // ... in your Header or Footer component ...
    <Link to="/new-page">New Page</Link>
    
```
4.  **Test your new page:**
    *   Run the development server (`bun dev`).
    *   Navigate to the path you defined for your new page (e.g., `http://localhost:3000/new-page`).