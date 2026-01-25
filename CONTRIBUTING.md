# Contributing to ESG Sustainability Analysis

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Report unacceptable behavior to project maintainers

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ESG-Sustainability-Analysis.git`
3. Add upstream remote: `git remote add upstream https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install pre-commit hooks
pre-commit install

# Set up environment
cp .env.example .env
# Edit .env with your settings
```

### Frontend
```bash
cd frontend
bun install  # or npm install
```

### Database
```bash
# Create database
createdb esg_db

# Apply schema
psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql
```

## Making Changes

### Branch Naming
- Feature: `feature/short-description`
- Bug fix: `fix/short-description`
- Documentation: `docs/short-description`
- Refactor: `refactor/short-description`

### Code Guidelines

#### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Maximum line length: 120 characters
- Use Black for formatting
- Use isort for import sorting

#### TypeScript/React (Frontend)
- Follow ESLint rules
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component names
- Use TypeScript types (avoid `any`)

## Testing

### Writing Tests

#### Backend Tests
```python
# tests/test_feature.py
import pytest

def test_feature_behavior():
    """Test description."""
    # Arrange
    expected = "result"
    
    # Act
    actual = feature_function()
    
    # Assert
    assert actual == expected
```

#### Frontend Tests
```typescript
// src/components/__tests__/Component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Running Tests
```bash
# Backend
pytest

# Frontend
cd frontend && bun test

# Pre-commit hooks
pre-commit run --all-files
```

## Code Style

### Python
```bash
# Format code
black backend/ scripts/

# Sort imports
isort backend/ scripts/

# Lint
flake8 backend/ scripts/

# Security check
bandit -r backend/ scripts/
```

### TypeScript
```bash
cd frontend

# Lint
bun run lint

# Type check
bun run type-check
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples
```
feat(api): add ESG risk prediction endpoint

Implement /predict endpoint for single company ESG risk prediction
using the trained ML model.

Closes #123
```

```
fix(frontend): resolve lazy loading issue on route navigation

Components were not loading correctly when navigating between routes.
Added Suspense boundaries to handle loading states.
```

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and checks**:
   ```bash
   # Backend
   pytest
   black backend/ scripts/
   flake8 backend/ scripts/
   
   # Frontend
   cd frontend
   bun test
   bun run lint
   ```

3. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Use a descriptive title
   - Reference related issues
   - Describe changes in detail
   - Include screenshots for UI changes
   - Ensure CI passes

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
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated documentation

## Screenshots (if applicable)

## Related Issues
Closes #issue_number
```

## Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Delete your feature branch after merge

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Contact maintainers directly for sensitive issues

## Recognition

Contributors will be acknowledged in:
- README.md
- Release notes
- GitHub contributors page

---

Thank you for contributing! 🎉
