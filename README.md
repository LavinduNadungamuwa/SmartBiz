# 🚀 SmartBiz — AI-Powered Business Management Suite

A full-stack ERP-lite platform for small and medium businesses to manage sales, inventory, customers, and daily operations — with OpenAI-powered insights, report generation, and email/content writing built in.

---

## ✨ Features

### 👨‍💼 Business Owner (Web & Mobile)

* 📊 Dashboard overview — sales, inventory, profits at a glance
* 👥 Customer and supplier management
* 📦 Product and stock management (add / update / delete)
* 🧾 Sales and invoice management
* 💰 Daily income and expense tracking

### 🤖 AI Features

* 💡 AI business insights — Ask in plain English:

  > *"How did I perform last month?"*

### 🛠️ Administrator

* 🏢 Manage registered businesses and users
* 📈 Review AI usage logs and system-wide statistics
* 💳 Manage subscription or pricing plans

---

## 🛠️ Tech Stack

| Layer                    | Technology                                     |
| ------------------------ | ---------------------------------------------- |
| 🌐 **Frontend (Web)**    | React + Vite, React Router v6, Axios, Recharts |
| 📱 **Frontend (Mobile)** | React Native (planned)                         |
| ⚙️ **Backend**           | Spring Boot 3, MySQL                           |
| 🤖 **AI Integration**    | OpenAI API (GPT)                               |
| 🔐 **Authentication**    | JWT (JSON Web Tokens)                          |
| ☁️ **Deployment**        | AWS EC2 with custom domain                     |

---

## 📁 Project Structure

```text
smartbiz/
├── smartbiz-backend/          # Spring Boot API
│   └── src/main/java/com/smartbiz/
│       ├── controller/        # REST endpoints
│       ├── dto/               # Request / response objects
│       ├── model/             # JPA entities
│       ├── repository/        # Spring Data repositories
│       └── service/           # Business logic
│
└── smartbiz-frontend/         # React web app
    └── src/
        ├── api/               # Axios client + per-resource hooks
        ├── store/             # Auth context (token, role)
        ├── router/            # App routes + ProtectedRoute
        └── pages/
            ├── auth/          # Login, Register
            ├── dashboard/     # Overview + charts
            ├── products/      # Inventory CRUD
            ├── sales/         # Sales + invoices
            ├── customers/     # Customer CRM
            ├── suppliers/     # Supplier management
            ├── expenses/      # Income & expense tracker
            └── ai/            # AI assistant chat
```

---

## 🚀 Getting Started

### 📋 Prerequisites

* ✅ Node.js 18+
* ✅ Java 17+
* ✅ MySQL 8+
* ✅ OpenAI API Key

---

## ⚙️ Backend Setup

### 1️⃣ Create the Database

```sql
CREATE DATABASE smartbiz_db;
```

### 2️⃣ Configure Environment

Open:

```text
smartbiz-backend/src/main/resources/application.properties
```

Update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartbiz_db
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password

openai.api.key=your_openai_api_key
```

> ⚠️ **Never commit real credentials or API keys to version control.** Use environment variables in production.

### 3️⃣ Run the Backend

```bash
cd smartbiz-backend
./mvnw spring-boot:run
```

🌐 API URL:

```text
http://localhost:8080
```

---

## 💻 Frontend Setup

### 1️⃣ Install Dependencies

```bash
cd smartbiz-frontend
npm install
```

### 2️⃣ Start the Development Server

```bash
npm run dev
```

🌐 Frontend URL:

```text
http://localhost:5173
```

> 💡 Make sure the backend is running first, as login and registration immediately communicate with the API.

### 3️⃣ Build for Production

```bash
npm run build
```

📦 Production files are generated inside the `dist/` directory.

---

## 🔗 API Overview

> 🔐 **All endpoints except authentication require a Bearer token in the `Authorization` header.**

| Resource      | Base Path                                           |
| ------------- | --------------------------------------------------- |
| 🔑 Auth       | `POST /api/auth/register`<br>`POST /api/auth/login` |
| 📊 Dashboard  | `GET /api/dashboard/summary`                        |
| 📦 Products   | `GET/POST/PUT/DELETE /api/products`                 |
| 🛒 Sales      | `GET/POST/PUT/DELETE /api/sales`                    |
| 📄 Sale Items | `GET/POST/PUT/DELETE /api/sale-items`               |
| 👥 Customers  | `GET/POST/PUT/DELETE /api/customers`                |
| 🚚 Suppliers  | `GET/POST/PUT/DELETE /api/suppliers`                |
| 🧾 Invoices   | `GET/POST/PUT/DELETE /api/invoices`                 |
| 💸 Expenses   | `GET/POST/PUT/DELETE /api/expenses`                 |
| 🤖 AI         | `POST /api/ai/ask`                                  |

#### 🔑 Authentication Response

```json
{
  "token": "eyJhbGci...",
  "message": "Login successful"
}
```

#### 🤖 AI Request

```json
{
  "question": "What were my top 5 selling products last month?"
}
```

---

## 🌍 Environment Variables

### ⚙️ Backend (`application.properties`)

| Key                          | Description                |
| ---------------------------- | -------------------------- |
| `spring.datasource.url`      | MySQL JDBC connection URL  |
| `spring.datasource.username` | MySQL username             |
| `spring.datasource.password` | MySQL password             |
| `openai.api.key`             | Your OpenAI secret key     |
| `openai.model`               | Model name (e.g. `gpt-4o`) |
| `server.port`                | Defaults to `8080`         |

### 💻 Frontend

Create a `.env` file inside `smartbiz-frontend/`.

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then update `src/api/axiosClient.js` to use:

```javascript
import.meta.env.VITE_API_BASE_URL
```

---

## ☁️ Deployment (AWS EC2)

#### 📦 Build the Frontend

```bash
npm run build
```

Upload the generated `dist/` folder to your server or S3 + CloudFront.

#### ⚙️ Package the Backend

```bash
./mvnw package
```

Upload the generated `.jar` file to your EC2 instance.

Run using:

```bash
java -jar smartbiz-backend.jar --spring.config.location=/etc/smartbiz/application.properties
```

Use **Nginx** as a reverse proxy:

* 🌐 Serve the frontend on ports **80/443**
* 🔀 Proxy `/api/*` requests to **port 8080**
* 🔒 Enable SSL using **Let's Encrypt (certbot)**

---

## 🔒 Security Notes

* 🔑 JWT tokens are signed server-side and validated on every request.
* 👤 `ROLE_ADMIN` → Create / Update / Delete
* 👥 `ROLE_USER` → Read access
* 🚫 Never expose your `openai.api.key` or database password.
* 🔐 Use environment variables or AWS Secrets Manager in production.
* 🌍 Tighten CORS before deployment by replacing:

```java
allowedOrigins("*")
```

with your actual domain.

---

## 🎓 Project Information

This project was developed as the **final project for the AFSD Programme**.
