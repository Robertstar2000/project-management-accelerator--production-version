# Project Structure

## Directory Organization

### `/src/components/`
Reusable UI components used across the application:
- **Modal Components**: AiReportModal, ChangeDeploymentModal, DeleteProjectConfirmationModal, DocumentViewerModal, HelpModal, NewProjectModal, NotificationModal, TaskDetailModal
- **Feature Components**: ApiKeyManager, Header, Hero, MyWorkView, PhaseCard, RainbowText, RecentlyViewed

### `/src/views/`
Top-level view components representing major application screens:
- **AuthView.tsx**: User authentication interface
- **LandingPage.tsx**: Application entry point and home screen
- **ProjectDashboard.tsx**: Main project management interface
- **ProjectPhasesView.tsx**: Phase-specific project view

### `/src/tools/`
Specialized tool views for different project management aspects:
- **DashboardView.tsx**: Overview metrics and analytics
- **DocumentsView.tsx**: Document management interface
- **ProjectTrackingView.tsx**: Detailed project progress tracking with agentic task execution
- **RevisionControlView.tsx**: Version control and change tracking with agentic change management
- **TeamView.tsx**: Team member management and collaboration
- **TestingView.tsx**: Quality assurance and testing interface
- **WorkloadView.tsx**: Resource allocation and workload distribution

### `/src/hmap/`
HMAP (Hierarchical Map) visualization components:
- **HmapPhasesView.tsx**: Phase visualization in hierarchical format
- **PhaseCard.tsx**: Individual phase display component
- **ProjectList.tsx**: Project listing with hierarchical structure

### `/src/constants/`
Application configuration and static data:
- **be-prompts.ts**: Backend AI prompts
- **instructions.ts**: User instructions and help content
- **projectData.ts**: Project templates and sample data
- **prompts.ts**: Frontend AI prompts
- **templates.ts**: Document and project templates
- **workflow.ts**: Workflow definitions and configurations

### `/src/utils/`
Utility functions and services:
- **authService.ts**: Frontend authentication logic
- **be-authService.ts**: Backend authentication integration
- **be-logic.ts**: Backend business logic
- **logging.ts**: Application logging utilities
- **markdownParser.ts**: Markdown content parsing
- **syncService.ts**: Data synchronization service
- **agenticWorkflow.ts**: Task execution agentic workflow (3 agents, 20 iterations)
- **revisionAgenticWorkflow.ts**: Change management agentic workflow (3 agents, 50 iterations)
- **emailService.ts**: Email notification service for task readiness alerts

### `/src/styles/`
Global styling and theme configuration:
- **GlobalStyles.ts**: Application-wide CSS-in-JS styles

### Root Files
- **App.tsx**: Main application component and routing
- **types.ts**: TypeScript type definitions
- **index.tsx**: Application entry point
- **index.html**: HTML template
- **vite.config.ts**: Vite build configuration
- **tsconfig.json**: TypeScript compiler configuration

## Architectural Patterns

### Component Hierarchy
```
App.tsx (Root)
├── AuthView (Authentication)
├── LandingPage (Home)
└── ProjectDashboard (Main App)
    ├── Header
    ├── Tools (DashboardView, ProjectTrackingView, etc.)
    ├── Views (ProjectPhasesView, MyWorkView)
    └── Modals (Various modal components)
```

### Data Flow
- **State Management**: React hooks and component state
- **AI Integration**: Google Gemini API via @google/genai
- **Authentication**: Custom auth service with API key management
- **Synchronization**: syncService for data persistence
- **Agentic Workflows**: Multi-agent systems for autonomous task execution and change management

### Key Relationships
- Views consume components and tools
- Tools provide specialized functionality to views
- Utils provide cross-cutting services to all layers
- Constants provide configuration to all components
- Agentic workflows orchestrate AI agents for autonomous operations

## Agentic Architecture

### Task Execution Workflow
- **Doer/Controller Agent**: Creates and improves task deliverables using role and context
- **Tools Agent**: Provides RAG access to documents and suggests improvements
- **Tester Agent**: Validates completion and provides feedback
- **Iteration Limit**: 20 iterations with progress tracking

### Change Management Workflow
- **Change Agent**: Identifies documents requiring updates for change requests
- **RevisionTool Agent**: Applies minimal changes to documents and updates content
- **QA Agent**: Verifies changes are necessary and appropriate
- **Iteration Limit**: 50 iterations for comprehensive document review

### Email Notification System
- **Automatic Notifications**: Sends emails when tasks become ready to start
- **Context Inclusion**: Includes Phase 1 document content for task context
- **Owner Coordination**: Provides project owner contact information and review instructions
- **Opt-in per Role**: Team members can enable/disable notifications per role assignment
