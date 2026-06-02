# The Royals Restaurant Management System

A comprehensive, full-stack restaurant management application designed to streamline operations for "The Royals." This system features role-based access, including a customer-facing menu and booking system, a live Kitchen Display System (KDS) for chefs, and a management dashboard for administrators.

---

## Key Features

*   **Customer Portal:** Interactive dynamic menu with "Add to Cart" functionality and an online table reservation system.
*   **Chef Dashboard (KDS):** Real-time order queue with status toggles (Received, Preparing, Ready) for a fast-paced kitchen environment.
*   **Admin Dashboard:** Secure portal for managing menu items (CRUD operations) and reviewing incoming table reservations.
*   **Secure Authentication:** Environment variable-based authentication protecting the staff and admin portals from unauthorized access.

---

## Tech Stack

| Area | Technology |
| ------ | ------ |
| **Frontend** | EJS (Embedded JavaScript Templating), Tailwind CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |

---

## Project Structure

The application follows a standard modular architecture. Based on the repository contents, here are the key directories and files:

*   **.gitignore**: Specifies intentionally untracked files to ignore, such as environment variables and node modules.
*   **package.json** & **package-lock.json**: Contains project dependencies, scripts, and configuration details.
*   **models/MenuItem.js**: Mongoose schema for storing and retrieving menu items.
*   **models/Order.js**: Mongoose schema for processing and tracking customer orders.
*   **models/Reservation.js**: Mongoose schema for the table booking system.
*   **public/images/**: Contains static visual assets used across the site.
*   **public/images/T_BoondiRaita.jpg**: Example menu item image stored in the public directory.
*   **public/images/b_MangoShake.jpg**: Example beverage image stored in the public directory.

---

## Installation and Setup

Follow these steps to run the project locally on your machine.

1.  **Clone the repository:** 
    `git clone https://github.com/varshneyprm/The-Royals-Restaurant-Management-System.git`
2.  **Navigate to the project directory:** 
    `cd The-Royals-Restaurant-Management-System`
3.  **Install dependencies:** 
    `npm install`
4.  **Configure Environment Variables:** 
    Create a `.env` file in the root directory. Add your `MONGO_URI`, `ADMIN_USER`, `ADMIN_PASS`, `CHEF_USER`, and `CHEF_PASS` credentials.
5.  **Seed the Database (Optional):** 
    Run the seed script to populate the database with the initial menu items using `node seed.js`.
6.  **Start the server:** 
    `npm run dev`

**Note:** Once the server is running, the application will be accessible at `http://localhost:3000`.
