# Access Control System - Frontend

A modern Next.js frontend application for managing users, roles, permissions, and access control with a beautiful, responsive UI.

## Features

- **User Management**
  - Create, read, update, and delete users
  - Assign roles to users
  - Manage user claims
  - User details drawer with comprehensive information

- **Role Management**
  - Create and manage roles
  - Assign permissions to roles
  - Hierarchical role structure
  - Role inheritance

- **Permission Management**
  - Granular permission control
  - Permission tree visualization
  - Group-based permissions
  - Dynamic permission assignment

- **Access Control**
  - Permission-based UI rendering
  - Dynamic menu system
  - Audit log viewing
  - Policy management

- **Modern UI/UX**
  - Responsive design
  - Glass morphism effects
  - Smooth animations
  - Dark mode support
  - Professional components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind

## Prerequisites

- Node.js (v18 or higher)
- Backend API running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm run start
```

The application will be available at `http://localhost:3001`

## Default Login Credentials

**Admin User:**
- Email: `admin@example.com`
- Password: `Admin@123`

**Manager User:**
- Email: `manager@example.com`
- Password: `Manager@123`

## Main Features & Pages

### Authentication
- **Login Page** (`/login`)
  - Email/password authentication
  - Remember me functionality
  - Redirect to admin dashboard

### Admin Dashboard
- **Users** (`/admin/users`)
  - User list with search
  - Create new users
  - Edit user details
  - Assign roles
  - Manage claims
  - View user details in drawer

- **Roles** (`/admin/roles`)
  - Role list
  - Create/edit roles
  - Assign permissions to roles
  - Role hierarchy management

- **Permissions** (`/admin/permissions`)
  - Permission tree view
  - Create/edit permissions
  - Group management
  - Permission assignment

- **Bookings** (`/admin/bookings`)
  - Example resource management
  - Demonstrates permission-based access

- **Audit Logs** (`/admin/audit`)
  - View system audit logs
  - Filter by action, user, resource
  - Export functionality

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   │   ├── users/       # User management
│   │   ├── roles/       # Role management
│   │   ├── permissions/ # Permission management
│   │   ├── bookings/    # Example resource
│   │   └── audit/       # Audit logs
│   ├── login/           # Login page
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── Modal.tsx
│   ├── PermissionGate.tsx
│   ├── UserDetailsDrawer.tsx
│   ├── DynamicSelect.tsx
│   └── ...
├── services/            # API service layer
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── roles.service.ts
│   └── ...
├── hooks/               # Custom React hooks
│   └── useDynamicMenu.ts
├── lib/                 # Utilities
│   └── api.ts           # Axios configuration
└── styles/              # Global styles
    └── globals.css
```

## Key Components

### PermissionGate
Renders content only if user has required permission:
```tsx
<PermissionGate permission="User.Create">
  <button>Create User</button>
</PermissionGate>
```

### UserDetailsDrawer
Comprehensive user details with tabs for:
- Overview (user info and stats)
- Roles (assigned roles)
- Permissions (inherited permissions)
- Claims (user claims)

### DynamicSelect
Advanced select component with:
- Multi-select support
- Search functionality
- Custom rendering
- Description support

### PermissionTree
Hierarchical permission visualization with:
- Group-based organization
- Checkbox selection
- Save functionality
- Search and filter

## Styling

The project uses Tailwind CSS with custom configurations:

### Design Tokens
- **Colors**: Blue and purple gradients
- **Effects**: Glass morphism, shadows, gradients
- **Animations**: Fade-in, slide-in, hover effects
- **Typography**: Inter font family

### Utilities
Custom CSS classes in `globals.css`:
- `.card` - Card container with shadow
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.badge` - Status badge
- `.table-header` - Table header styling
- `.table-row` - Table row with hover effects

## API Integration

All API calls are centralized in service files:

```typescript
// Example: users.service.ts
import { api } from '@/lib/api';

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },
  // ... more methods
};
```

The `api` instance includes:
- Automatic JWT token injection
- Request/response interceptors  
- Error handling
- Base URL configuration

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Permission-Based Rendering
Components automatically show/hide based on user permissions using the `PermissionGate` component.

### Dynamic Menu
The menu system loads dynamically based on user permissions, showing only authorized menu items.

### Audit Trail
All critical actions are logged and viewable in the audit log page with filtering and search capabilities.

### Responsive Design
Fully responsive design that works on desktop, tablet, and mobile devices.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
