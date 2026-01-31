# 🧾 Invoico

## Modern Invoicing, Made Simple

**Invoico** is a sleek, modern, and efficient web application for creating, managing, and tracking invoices. Built with simplicity and performance in mind, it is designed for freelancers, small businesses, and service providers who want a clean, no‑nonsense billing workflow — from invoice creation to client delivery.

---

## 🚀 Key Features

- 📄 Create, view, and manage professional invoices with ease  
- 🧑‍💼 Client management (add, edit, and reuse client details)  
- 💰 Track payments and invoice statuses (paid / unpaid)  
- 📦 Support for multiple line items per invoice  
- 🖨️ Export invoices as polished PDF documents  
- 🗃️ Optional self‑hosted deployment  
- 🔐 Built with scalability, security, and performance in mind

Whether you’re a solo freelancer or a growing business, Invoico provides the essential tools you need — without unnecessary complexity.

---

## 🏗️ Architecture Overview

![Invoico System Architecture](docs/isa.png)

---

## 🧱 Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI & Styling | Tailwind CSS |
| State / Logic | React Hooks |
| Database | Prisma (SQLite / PostgreSQL) |
| API Layer | Next.js Route Handlers |
| PDF Generation | @react-pdf/renderer (or equivalent) |
| Tooling | ESLint, Prettier |

**Project Structure**

- `/src` — Main application source (app routes, components, logic)
- `/prisma` — Database schema and migrations (if present)
- Root config files — `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, etc.

---

## ⚙️ Installation & Setup

### 📌 Clone the Repository

```bash
git clone https://github.com/AJ4200/invoico.git
cd invoico
```

### 📦 Install Dependencies

All dependencies are managed from the project root.

```bash
npm install
```

### 🔐 Environment Configuration

Create a local environment file if required:

```bash
cp .env.example .env
```

Update environment variables such as database connection strings or API keys as needed.

### ▶️ Run the App Locally

```bash
npm run dev
```

Open your browser at:

```text
http://localhost:3000
```

---

## 🧾 Application Usage

1. **Create Clients** — Store client details such as name, email, and billing address.
2. **Generate Invoices** — Add line items, pricing, and applicable taxes.
3. **Export or Send** — Download invoices as PDFs or share them digitally.
4. **Track Status** — Monitor paid and unpaid invoices in real time.

---

## 🔐 Environment Variables

The application relies on the following environment variables:

| Variable | Description |
|---------|-------------|
| DATABASE_URL | Database connection string |
| JWT_SECRET | Authentication secret |
| APP_URL | Application base URL |
| SMTP_HOST | Email server host |
| SMTP_USER | Email username |
| SMTP_PASS | Email password |

Ensure sensitive values are kept secure, especially in production environments.

---

## 🗄️ Database & Migrations

If Prisma is used in this project, database migrations and client generation can be run from the root:

```bash
npx prisma migrate dev
npx prisma generate
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📡 API Architecture

Invoico uses **Next.js Route Handlers** for server-side logic and APIs.

API routes are typically located under:

```text
/src/app/api
```

Endpoints are structured by feature (e.g., invoices, clients) and follow REST-like conventions.

---

## 📄 PDF Export

Invoico includes built‑in PDF generation, allowing invoices to be exported as clean, professional documents suitable for client delivery and record‑keeping.

---

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repository  
2. Create a new feature branch  
3. Commit your changes with clear messages  
4. Open a pull request for review

---

## 🚨 Issues & Support

If you encounter bugs or have feature requests, please use the GitHub **Issues** tab and provide as much detail as possible.

---

## 📜 License

This project is licensed under the **MIT License**, allowing you to use, modify, and distribute the software freely.

---

## 🙌 Acknowledgements

Thank you to all contributors and users who help improve **Invoico**. Your support and feedback make this project better 💙

