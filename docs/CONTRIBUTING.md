# Contributing to Sorted

Thank you for your interest in contributing to Sorted! This document provides guidelines and instructions for contributing.

## Branch Strategy

```
main (protected) <- PR only, requires approval
  └── develop <- integration branch
        ├── feature/phase-X-name
        ├── feature/new-feature
        ├── fix/bug-description
        └── docs/documentation-update
```

### Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/cuisine-filters` |
| Bug Fix | `fix/description` | `fix/search-relevance` |
| Documentation | `docs/description` | `docs/api-documentation` |
| Refactor | `refactor/description` | `refactor/matcher-logic` |
| Performance | `perf/description` | `perf/cache-optimization` |

### Workflow

1. **Create branch from `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add <specific-files>
   git commit -m "type: description"
   ```

3. **Push and create PR**:
   ```bash
   git push -u origin feature/your-feature
   # Create PR to develop (NOT main)
   ```

4. **After approval, merge to develop**:
   - Squash merge preferred for feature branches
   - Delete branch after merge

5. **Release to main**:
   - Only release branches merge to main
   - Requires maintainer approval

## Commit Message Format

```
type: subject

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, etc.

### Examples
```
feat: add cuisine-based relevance scoring

Implement scoring algorithm that prioritizes restaurants
matching the searched cuisine type.

Closes #123
```

```
fix: correct price normalization for Swiggy items

Swiggy returns prices in paise, not rupees.
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types from dedicated `types.ts` files

### React Components
- Use functional components with hooks
- Props interface should be named `{ComponentName}Props`
- Keep components focused and single-purpose
- Extract complex logic to custom hooks

### File Organization
```
src/
├── app/                 # Next.js pages and API routes
├── components/          # React components
│   ├── Component.tsx    # Component implementation
│   └── __tests__/       # Component tests
├── lib/                 # Business logic
│   ├── feature/
│   │   ├── index.ts     # Public API
│   │   ├── types.ts     # Types
│   │   └── __tests__/   # Tests
└── hooks/               # Custom React hooks
```

### Naming Conventions
- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **CSS Classes**: Tailwind utility classes

## Testing Requirements

### Unit Tests
- All utility functions must have unit tests
- Test edge cases and error conditions
- Use descriptive test names

### Integration Tests
- API routes should have integration tests
- Test with mocked external services

### Component Tests
- Test user interactions
- Test different states (loading, error, empty)
- Test accessibility

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No new linting warnings
- [ ] Documentation updated if needed
- [ ] Screenshots added for UI changes

### PR Description
- Clearly describe what the PR does
- Link related issues
- List any breaking changes
- Include testing instructions

### Review Process
1. At least one approval required
2. All CI checks must pass
3. No unresolved conversations
4. Branch must be up to date with target

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Redis (or use Upstash)

### Installation
```bash
git clone https://github.com/your-org/sorted.git
cd sorted
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Environment Variables
See `docs/ENV_VARS.md` for required environment variables.

## Questions?

- Check existing issues and discussions
- Open a new issue for bugs
- Open a discussion for questions
- Reach out to maintainers

Thank you for contributing!
