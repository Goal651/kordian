# Aperio

> **Complete visibility for the modern engineering organization.**

**Aperio** is a high-altitude, stateless command center designed for GitHub organization owners and engineering leads. It transforms complex repository data into actionable insights—providing clarity on security, tech stack distribution, and team engagement in a single, unified interface.

![Aperio Dashboard](./public/dashboard.jpeg)

## Why Aperio?

Managing a growing GitHub organization often feels like navigating a black box. Security alerts, contributor activity, and repository health are typically scattered across dozens of individual tabs. 

**Aperio** centralizes this data into a "Single Source of Truth," allowing leadership to monitor organization-wide health without the administrative overhead.

### Unified Security Oversight
Stop chasing alerts. Aperio provides live, aggregated scanning of **Dependabot**, **Secret Scanning**, and **Code Scanning** across your entire ecosystem. Identify critical vulnerabilities in seconds, not hours.

### Meaningful Engagement Metrics
We’ve moved beyond "raw commit" counts. Aperio utilizes a sophisticated engagement algorithm that prioritizes **Pull Requests** and **Code Reviews**—the high-value behaviors that actually build healthy, collaborative teams.

### Privacy-First Architecture
Security is at our core. Aperio is **100% stateless**. We do not use a database and we never store your tokens. The application runs entirely within your browser session, ensuring your organization's sensitive data never leaves your control.

---

## Key Capabilities

* **Organizational Health Filter**: Instantly sort and filter 50+ repositories by real-time status and risk level.
* **Dynamic Tech Stack Analysis**: Visualize your organization's language distribution and technical evolution with real-time charts.
* **Contributor Connectivity**: Interactive mapping that shows which members are driving impact in specific repositories.
* **Resource Management**: Identify active contributors and dormant projects to better allocate engineering resources.

## Technical Architecture

* **Core Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Interface**: Tailwind CSS & `shadcn/ui`
* **Data Layer**: GitHub GraphQL API for high-performance, precise data fetching.

## Getting Started

### Prerequisites

* Node.js 18+
* A GitHub App (for secure token exchange)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/Goal651/aperio.git](https://github.com/Goal651/aperio.git)
    cd aperio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Launch the Dashboard**:
    ```bash
    npm run dev
    ```

4.  Navigate to `http://localhost:3000` to begin your organization audit.

## Contributing

We welcome contributions from the community! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) for architectural guidelines and our pull request process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.