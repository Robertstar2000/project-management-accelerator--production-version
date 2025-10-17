# Development Guidelines

## Code Quality Standards

### Formatting and Structure
- **CSS-in-JS**: Use template literals for global styles (GlobalStyles.ts exports a single string constant)
- **CSS Variables**: Define all colors and theme values as CSS custom properties in `:root`
- **Component Structure**: Functional components with TypeScript, using React.FC type annotation
- **File Organization**: One primary export per file, with helper components/functions defined above the main export

### Naming Conventions
- **CSS Classes**: Use kebab-case (e.g., `modal-overlay`, `button-primary`, `task-list-table`)
- **CSS Variables**: Use kebab-case with `--` prefix (e.g., `--background-color`, `--accent-color`)
- **Component Names**: PascalCase for components (e.g., `ProjectDashboard`, `TaskDetailModal`)
- **Function Names**: camelCase for functions (e.g., `handleUpdateTask`, `parseMarkdownTable`)
- **Constants**: SCREAMING_SNAKE_CASE for exported constants (e.g., `PHASES`, `PROMPTS`, `DEFAULT_SPRINTS`)
- **Type Names**: PascalCase for interfaces and types (e.g., `Project`, `Task`, `GanttChartProps`)

### Code Organization Patterns
- **Imports Order**: External libraries first, then internal components, then utilities, then types
- **State Management**: useState for local state, useCallback for memoized callbacks, useMemo for computed values
- **Props Interfaces**: Define explicit interface types for component props (e.g., `ProjectDashboardProps`)
- **Helper Functions**: Define utility functions outside components or in separate utility files

## Semantic Patterns

### React Patterns (Frequency: 5/5 files)
```typescript
// Functional components with explicit props interface
interface ComponentProps {
    project: Project;
    onUpdate: (data: Partial<Project>) => void;
}

export const Component: React.FC<ComponentProps> = ({ project, onUpdate }) => {
    const [state, setState] = useState(initialValue);
    
    const handleAction = useCallback(() => {
        // Action logic
    }, [dependencies]);
    
    return (
        <div className="component-container">
            {/* JSX */}
        </div>
    );
};
```

### State Update Pattern (Frequency: 4/5 files)
```typescript
// Functional state updates for complex objects
const handleSave = useCallback((update: Partial<Project>) => {
    setProjectData(prevData => {
        const newState = { ...prevData, ...update };
        saveProject(newState);
        return newState;
    });
}, [saveProject]);
```

### Conditional Rendering Pattern (Frequency: 5/5 files)
```typescript
// Early returns for loading/empty states
if (!data || data.length === 0) {
    return <p>No data available.</p>;
}

// Ternary for inline conditionals
{isLoading ? <Spinner /> : <Content />}

// Logical AND for optional rendering
{error && <div className="error-message">{error}</div>}
```

### Event Handler Pattern (Frequency: 5/5 files)
```typescript
// Prefix handlers with 'handle' and use descriptive names
const handleUpdateTask = useCallback((taskId: string, data: Partial<Task>) => {
    const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, ...data } : t
    );
    onUpdate({ tasks: updatedTasks });
}, [tasks, onUpdate]);
```

### Data Transformation Pattern (Frequency: 4/5 files)
```typescript
// Use useMemo for expensive computations
const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => 
        a.phase - b.phase || 
        (a.sequence || 1) - (b.sequence || 1) || 
        a.title.localeCompare(b.title)
    );
}, [documents]);
```

### LocalStorage Pattern (Frequency: 3/5 files)
```typescript
// Save to localStorage with try-catch
const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save ${key}:`, e);
    }
};

// Load from localStorage with fallback
useEffect(() => {
    const stored = localStorage.getItem('key');
    if (stored) {
        setData(JSON.parse(stored));
    }
}, []);
```

### Async/Await with Error Handling (Frequency: 3/5 files)
```typescript
// Async operations with try-catch and loading states
const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
        const result = await ai.models.generateContent({ 
            model: 'gemini-2.5-flash', 
            contents: prompt 
        });
        setContent(result.text);
    } catch (err) {
        console.error('Generation failed:', err);
        setError('Failed to generate content.');
    } finally {
        setLoading(false);
    }
};
```

### Retry Logic Pattern (Frequency: 2/5 files)
```typescript
// Exponential backoff retry wrapper
async function withRetry<T>(
    fn: () => Promise<T>, 
    retries = 2, 
    delay = 1000
): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            }
        }
    }
    throw lastError;
}
```

### Table Rendering Pattern (Frequency: 3/5 files)
```typescript
// Semantic HTML tables with editable cells
<table className="task-list-table">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        {items.map(item => (
            <tr key={item.id}>
                <td>
                    <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                    />
                </td>
            </tr>
        ))}
    </tbody>
</table>
```

### Modal Pattern (Frequency: 3/5 files)
```typescript
// Modal with overlay and content structure
{isOpen && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>Modal Title</h2>
            {/* Modal body */}
            <div className="modal-actions">
                <button onClick={onClose} className="button">Cancel</button>
                <button onClick={onConfirm} className="button button-primary">Confirm</button>
            </div>
        </div>
    </div>
)}
```

### Agentic Workflow Pattern (Frequency: 2/2 files)
```typescript
// Multi-agent workflow with progress tracking
interface AgentMessage {
    agent: string;
    iteration: number;
    preview: string;
}

const runAgenticWorkflow = async (
    ai: GoogleGenAI | AWSBedrockService,
    context: any,
    onProgress: (message: AgentMessage) => void
): Promise<{ success: boolean; error?: string }> => {
    let iteration = 0;
    const MAX_ITERATIONS = 20;
    
    while (iteration < MAX_ITERATIONS) {
        iteration++;
        
        // Agent execution with progress reporting
        const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        onProgress({ agent: 'AgentName', iteration, preview: result.text.substring(0, 30) });
        
        // Check completion condition
        if (isComplete) break;
    }
    
    return { success: true };
};
```

## Best Practices

### TypeScript Usage
- Always define explicit types for component props using interfaces
- Use type annotations for function parameters and return values
- Leverage union types for status fields (e.g., `status: 'todo' | 'inprogress' | 'review' | 'done'`)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe property access

### Performance Optimization
- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations and derived data
- Use `useRef` for DOM references and mutable values that don't trigger re-renders
- Implement early returns in render logic to avoid unnecessary computation

### Error Handling
- Wrap async operations in try-catch blocks
- Display user-friendly error messages in the UI
- Log detailed errors to console for debugging
- Provide fallback UI for error states

### Accessibility
- Use semantic HTML elements (table, thead, tbody, button, etc.)
- Include `aria-label` attributes for icon-only buttons
- Manage focus states for modals and interactive elements
- Use proper heading hierarchy (h1, h2, h3)

### State Management
- Keep state as local as possible
- Lift state only when needed by multiple components
- Use functional updates when new state depends on previous state
- Persist important state to localStorage for user experience continuity

### Code Reusability
- Extract repeated logic into utility functions
- Create reusable components for common UI patterns
- Use constants files for shared configuration and data
- Implement generic helper functions with TypeScript generics

### API Integration
- Centralize API calls in service modules
- Implement retry logic for transient failures
- Handle rate limiting and quota errors gracefully
- Truncate large payloads to respect API limits

### Documentation
- Add comments for complex business logic
- Document non-obvious behavior and edge cases
- Use JSDoc comments for utility functions
- Keep comments concise and focused on "why" not "what"

### Agentic Workflows
- Implement multi-agent systems with clear role separation
- Provide real-time progress updates with agent name, iteration, and preview
- Set iteration limits to prevent infinite loops (20 for tasks, 50 for revisions)
- Display caution messages for long-running operations
- Handle failures gracefully with user-friendly error messages
- Update project state incrementally as agents complete work

### Email Notifications
- Send notifications only when explicitly enabled by team members
- Include relevant project context (Phase 1 documents) in notifications
- Provide clear instructions for coordination with project owner
- Log email attempts to console for debugging
- Design for integration with external email services (SendGrid, AWS SES)
