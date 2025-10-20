# Development Guidelines

## Naming
- **CSS**: kebab-case (classes), `--kebab-case` (variables)
- **Components**: PascalCase
- **Functions**: camelCase, prefix handlers with `handle`
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase

## Structure
- React.FC functional components with explicit props interfaces
- Imports: external → internal → utils → types
- useState, useCallback, useMemo for state/performance
- One export per file

## Key Patterns
- **State Updates**: Functional updates with `prevData => ({ ...prevData, ...update })`
- **Conditionals**: Early returns, ternaries, logical AND
- **Async**: try-catch-finally with loading/error states
- **LocalStorage**: JSON.stringify/parse with try-catch
- **Retry**: Exponential backoff (2 retries, 1s delay)
- **Tables**: Semantic HTML with editable inputs
- **Modals**: overlay + content + actions structure
- **Agentic**: Multi-agent loops with progress callbacks (20-50 iterations)

## Best Practices
- **TypeScript**: Explicit interfaces, union types, optional chaining (`?.`), nullish coalescing (`??`)
- **Performance**: useCallback/useMemo/useRef, early returns
- **Errors**: try-catch async, user-friendly UI messages, console logging
- **Accessibility**: Semantic HTML, aria-labels, focus management, heading hierarchy
- **State**: Local by default, functional updates, localStorage persistence
- **API**: Centralized services, retry logic, rate limiting, payload truncation
- **Agentic**: Multi-agent (20-50 iterations), progress tracking, graceful failures
- **Email**: Opt-in notifications with Phase 1 context and owner coordination
