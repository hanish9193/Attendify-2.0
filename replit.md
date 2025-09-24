# Attendify 2.0

## Overview

Attendify 2.0 is a modern student attendance tracking application designed to help students strategically manage their class attendance while meeting institutional requirements. The application features an innovative 3D visualization system using Spline, a glassmorphic dark UI design, and AI-powered screenshot analysis for automatic attendance data extraction using TrOCR (Text Recognition from Screenshots).

The platform supports both guest and authenticated users, provides multi-subject tracking, and includes advanced features like attendance prediction, calendar integration, and focus modes for productivity tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for server-side rendering and modern React patterns
- **UI Framework**: Custom component system built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom glassmorphic design system and dark theme support
- **3D Visualization**: Spline integration for interactive 3D attendance data visualization
- **State Management**: React hooks and context for client-side state, with session management via NextAuth.js

### Backend Architecture
- **API Routes**: Next.js API routes for server-side logic and database operations
- **Authentication**: NextAuth.js with Google OAuth integration and guest login support
- **Database ORM**: Drizzle ORM for type-safe database queries and migrations
- **Session Management**: JWT-based authentication with secure token handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured for Neon serverless deployment
- **Schema Design**: 
  - Users table for authentication and profile management
  - Subjects table for course/subject tracking with attendance targets
  - Attendance records table for individual class attendance tracking
  - Processed screenshots table for TrOCR integration and data extraction history
- **Relationships**: Foreign key relationships between users, subjects, and attendance records

### Authentication and Authorization
- **OAuth Integration**: Google OAuth for secure third-party authentication
- **Guest Access**: Anonymous user support for quick access without registration
- **Session Security**: Secure JWT tokens with configurable expiration
- **User Management**: Database-backed user profiles with Google account linking

### AI and Automation Features
- **TrOCR Integration**: Optical Character Recognition for automatic attendance data extraction from screenshots
- **Screenshot Processing**: File upload system with drag-and-drop support for academic portal screenshots
- **Data Parsing**: Intelligent text parsing to extract attendance percentages and class counts
- **Validation System**: User review and correction of extracted data before database updates

### User Experience Features
- **Onboarding Flow**: Multi-step setup for semester dates, subjects, and initial attendance data
- **Multi-Subject Dashboard**: Comprehensive overview of all subjects with progress tracking
- **3D Data Visualization**: Interactive Spline models showing attendance statistics in three dimensions
- **Focus Mode**: Productivity-focused views for concentrated study sessions
- **Calendar Integration**: Visual calendar with attendance history and holiday tracking
- **Responsive Design**: Mobile-optimized interface with glassmorphic design elements

## External Dependencies

### Core Infrastructure
- **Neon Database**: PostgreSQL serverless database hosting with connection pooling
- **Vercel/Netlify**: Frontend deployment and hosting platform
- **NextAuth.js**: Authentication library with OAuth provider integration

### UI and Visualization
- **Spline**: 3D model creation and rendering for interactive data visualization
- **Radix UI**: Accessible component primitives for form controls and overlays
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent visual elements

### AI and Text Processing
- **TrOCR**: Text recognition service for screenshot processing and data extraction
- **File Upload API**: Image processing pipeline for screenshot analysis

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety and enhanced developer experience
- **ESLint**: Code quality and consistency enforcement

### Authentication Services
- **Google OAuth**: Third-party authentication provider
- **JWT**: Token-based session management for secure user authentication

## Recent Changes

### September 24, 2025 - Replit Environment Setup
- Successfully imported GitHub project and configured for Replit environment
- Set up PostgreSQL database with connection pooling using Neon driver
- Pushed database schema with all tables (users, subjects, attendance_records, processed_screenshots, user_settings)
- Configured Next.js dev server for port 5000 with 0.0.0.0 host binding
- Added Replit proxy support with allowedDevOrigins configuration
- Resolved dependency conflicts using legacy peer deps
- Set up autoscale deployment configuration for production
- Application is fully functional with 3D visualization and database integration

### Development Environment
- **Frontend Server**: Running on port 5000 with proper Replit proxy support
- **Database**: PostgreSQL with Drizzle ORM migrations completed
- **Build System**: Next.js 15.2.4 with TypeScript and Tailwind CSS
- **Deployment**: Configured for autoscale deployment with npm build/start commands