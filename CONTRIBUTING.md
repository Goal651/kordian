# Contributing to GitGuard

python
First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to GitGuard. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Development Workflow

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:

    ```bash
    git clone https://github.com/your-username/kordian.git
    cd kordian
    ```

3. **Create a branch** for your feature or bugfix:

    ```bash
    git checkout -b feature/amazing-feature
    # or
    git checkout -b fix/annoying-bug
    ```

4. **Install dependencies** and start the dev server:

    ```bash
    npm install
    npm run dev
    ```

5. **Make your changes**.

## Coding Standards

- **TypeScript**: We use strict TypeScript. Please avoid using `any` unless absolutely necessary.
- **Styling**: We use Tailwind CSS. Try to stick to utility classes and avoiding custom CSS files where possible.
- **Components**: We use a composition pattern similar to shadcn/ui. Keep components small, focused, and reusable.
- **Linting**: Run `npm run lint` before committing to ensure there are no errors.

## Submitting a Pull Request

1. **Push your branch** to your fork:

    ```bash
    git push origin feature/amazing-feature
    ```

2. **Open a Pull Request** against the `main` branch of the original repository.
3. **Describe your changes** clearly. usage screenshots or GIFs are highly encouraged for UI changes!
4. **Reference issues**: If your PR fixes an issue, please link it (e.g., "Fixes #123").

## Reporting Bugs

Bugs are tracked as GitHub issues. When filing an issue, please include:

- A clear title and description.
- Steps to reproduce the bug.
- Expected behavior vs. actual behavior.
- Screenshots if applicable.
- Your environment details (OS, Browser, etc.).

## Feature Requests

We love new ideas! Please open an issue with the "enhancement" label to discuss your idea before implementing it. This ensures we're aligned on the direction and avoids wasted effort.

Thank you for contributing to making GitGuard better!
