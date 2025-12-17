# Contributing to ThinkTap

Thank you for your interest in contributing to ThinkTap! We welcome contributions from the community.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/thinktap.git
   cd thinktap
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-username/thinktap.git
   ```

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git

### Setup Instructions

1. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   
   # Mobile
   cd mobile && npm install
   ```

2. **Setup database**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your credentials
   npx prisma migrate dev
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run start:dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   
   # Terminal 3: Mobile (optional)
   cd mobile && npm start
   ```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/thinktap/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

### Suggesting Enhancements

1. Check [Issues](https://github.com/yourusername/thinktap/issues) for similar suggestions
2. Create a new issue with:
   - Clear title and description
   - Use case and benefits
   - Possible implementation approach

### Contributing Code

1. **Pick an issue** or create one
2. **Comment** that you're working on it
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow coding standards
   - Add tests
   - Update documentation

5. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

6. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**

## Coding Standards

### General
- Use TypeScript for all new code
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Backend (NestJS)
```typescript
// Use dependency injection
@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}
  
  async getData(): Promise<Data[]> {
    return this.prisma.data.findMany();
  }
}

// Use DTOs for validation
export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(8)
  password: string;
}
```

### Frontend (React)
```typescript
// Use functional components with hooks
export function MyComponent({ data }: Props) {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{data}</div>;
}

// Use custom hooks for reusable logic
export function useData() {
  const [data, setData] = useState<Data[]>([]);
  // Logic here
  return { data, loading, error };
}
```

### Naming Conventions
- **Files**: `kebab-case.tsx`, `PascalCaseComponent.tsx`
- **Variables**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (prefix with `I` if needed)

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add social login support

fix(sessions): resolve timer sync issue

docs(readme): update installation instructions

refactor(api): optimize database queries
```

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run lint
   ```

3. **Update documentation**
   - README if needed
   - API documentation
   - Code comments

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **At least one maintainer** must review
3. **All comments** must be resolved
4. **Squash and merge** into main branch

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in the project

## Questions?

- 💬 [GitHub Discussions](https://github.com/yourusername/thinktap/discussions)
- 📧 Email: contribute@thinktap.com

Thank you for contributing to ThinkTap! 🎉

