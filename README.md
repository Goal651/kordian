# GitGuard

> **Stop managing your GitHub organization in the dark.**

GitGuard is a stateless, real-time command center designed for organization owners and maintainers who need clarity, security, and fairness.

![GitGuard Dashboard](./public/dashboard.jpeg)

## Why GitGuard?

Most GitHub Orgs are a black box. You have security in one tab, activity in another, and zero clear visibility into who is actually moving the needle.

We built **GitGuard** to fix that.

### Real-time Security

Live scanning of **Dependabot**, **Secret Scanning**, and **Code Scanning** alerts in a single view. Know your vulnerability exposure instantly.

### Fair Ranking

We’re fixing the "raw commit" trap. GitGuard ranks contributors fairly by weighing **Pull Requests** and **Code Reviews** heavily in its algorithm—rewarding the behavior that actually builds healthy teams.

### Privacy-First & Stateless

No database. No stored tokens. GitGuard runs entirely in your browser session (client-side) using a secure proxy for token exchange. Your data never leaves your session.

---

## Key Features

- **High-Altitude View**: Filter 50+ repositories by health status in seconds.
- **Interactive Contributors**: Hover over contributor avatars to see who is active in which repo.
- **Language Distribution**: visualize your organization's tech stack with real-time charts.
- **Member Velocity**: Identify inactive members and rising stars.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & `shadcn/ui`
- **Data**: GitHub GraphQL API

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub App (for token exchange)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/git-guard.git
   cd git-guard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to scan your org!

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE).
