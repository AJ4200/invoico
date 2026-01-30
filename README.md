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

## 🧱 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React / Next.js |
| Backend | Node.js / Express |
| Database | SQLite / PostgreSQL |
| Styling | Tailwind CSS |
| PDF Generation | @react-pdf/renderer |

---

## ⚙️ Installation & Setup

### 📌 Clone the Repository

```bash
git clone https://github.com/AJ4200/invoico.git
cd invoico
```

### 🧰 Backend Setup

```bash
cd backend
npm install
```

Create your environment configuration file:

```bash
cp .env.example .env
```

Start the backend development server:

```bash
npm run dev
```

### 🖥 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:

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

If using Prisma, run the following commands to set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | /invoices | Fetch all invoices |
| POST | /invoices | Create a new invoice |
| GET | /invoices/:id | Fetch invoice by ID |
| PUT | /invoices/:id | Update an existing invoice |
| DELETE | /invoices/:id | Delete an invoice |
| GET | /clients | Fetch all clients |
| POST | /clients | Create a new client |

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

