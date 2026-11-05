# No-Buy

No-Buy is a peer-to-peer equipment rental app for the Indian market. All listing rates, deposits, and simulated payments are in Indian rupees (INR). The frontend is React + Vite, the API is Flask, and persistent application data is stored in MySQL (`nobuy_db`). Payments are simulated for the project; this app does not process real payments.

## Requirements

- MySQL Server 8.x (Workbench is the GUI client; it does not install or run the server by itself)
- Python 3.10 or later with `pip`
- Node.js with `npm`
- MySQL Workbench, for the manual setup and database inspection below

## Start MySQL Server

Install **MySQL Server** with the MySQL Installer and configure it to run as a Windows service. Keep the port at `3306` unless you change `MYSQL_PORT` in `backend/.env`.

Open Workbench and connect to the local server using host `127.0.0.1`, port `3306`, and the MySQL account/password you created during installation. If Workbench cannot connect, start the Windows service named `MySQL80` from Windows Services (`services.msc`). The included `start_mysql.bat` and `stop_mysql.bat` scripts use that service name; edit `MYSQL_SERVICE_NAME` in those two files if your installer used a different name.

## Set up the database in Workbench

1. In Workbench, connect to your local MySQL Server and open a new SQL tab.
2. Create the database and an app account. Replace the sample password with a private password of your choice:

   ```sql
   CREATE DATABASE IF NOT EXISTS nobuy_db
     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

   CREATE USER IF NOT EXISTS 'nobuy_app'@'127.0.0.1'
     IDENTIFIED BY 'choose_a_local_password';

   GRANT ALL PRIVILEGES ON nobuy_db.* TO 'nobuy_app'@'127.0.0.1';
   ```

3. Run the SQL tab with the lightning-bolt button. The app account has privileges only inside `nobuy_db`.
4. In Workbench, open `backend/schema.sql` (File → Open SQL Script) and run it. This creates the eight tables and their foreign keys. You can also let `init_db.py` create the tables in step 6 below.
5. Copy `backend/.env.example` to `backend/.env`. Set `MYSQL_PASSWORD` to the same password used for `nobuy_app`. Keep the host, port, and database values as shown if you used the defaults. Do not commit `backend/.env`.
6. Open a terminal in the project folder and initialize the schema:

   ```powershell
   cd backend
   python -m pip install -r requirements.txt
   python init_db.py
   ```

   The initializer creates `nobuy_db` if it is missing (so the configured account needs permission to create it in that case), creates missing tables, and leaves existing records intact. Creating the database in Workbench first avoids needing a global `CREATE DATABASE` privilege.

7. In Workbench, run these checks. You should see eight tables, and initially zero users/products unless you opted into sample data:

   ```sql
   USE nobuy_db;
   SHOW TABLES;
   SELECT COUNT(*) AS users FROM users;
   SELECT COUNT(*) AS products FROM products;
   ```

## Run the application

From the project root, double-click `start_all.bat`. Or start each process in a separate terminal:

```powershell
# Terminal 1: project root
call .\start_mysql.bat

# Terminal 2: backend
cd backend
python app.py

# Terminal 3: frontend
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Check <http://127.0.0.1:5000/api/health>; a working response includes `"database_status":"connected"`. A disconnected database now returns HTTP 503.

Create an account in the app, then list a product. Products, users, categories, bookings, negotiations, payments, returns, reviews, and notifications are read from or written to MySQL through the Flask API. A new database is empty by default. To load the included fictional sample records for a demonstration, set `SEED_DEMO_DATA=true` in `backend/.env` **before the first initialization**. Seeding runs only when the users table is empty; the demo login buttons were removed, so use the sample credentials listed in `backend/init_db.py` if you enable it.

## Product photo upload and storage

When a lender chooses a photo, the browser sends the file as `multipart/form-data` to the authenticated `POST /api/products/upload` endpoint. The Flask API accepts JPEG, PNG, GIF, or WebP files up to 5 MB, validates the file signature, and saves the bytes under `backend/uploads/` with a generated filename. The listing request then stores a relative URL such as `/api/products/uploads/abc123.jpg` in `products.image_url`.

The image bytes themselves are **not** stored in MySQL. MySQL stores the URL/path; Flask serves the image from `backend/uploads/` when the browser requests that URL. This keeps normal catalog queries small and avoids large BLOB values. Back up `backend/uploads/` along with the database. If you deploy to multiple servers or ephemeral hosting, move uploads to shared object storage and keep the resulting URL in `image_url`.

## Database overview

- `users`: account/profile data
- `products`: listings and image paths
- `bookings`: rental requests and state
- `negotiations`: renter/owner offers
- `payments`: simulated transactions and escrow state
- `returns`: return inspections and deposit outcomes
- `reviews`: completed-rental feedback
- `notifications`: in-app activity alerts

`backend/schema.sql` is the schema source. It uses InnoDB, `utf8mb4`, foreign keys, and indexes. Re-run `python init_db.py` after starting MySQL if the API health check reports a database connection failure.
