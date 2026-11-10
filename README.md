# data-collection

## Run locally

1. Configure `backend/.env` with `PORT`, `MONGO_URI`, and `JWT_SECRET`. Set
   `CLIENT_URL` to the frontend origin (default: `http://localhost:5173`).
2. Start the backend with `cd backend` and `npm run dev`.
3. Start the frontend with `cd frontend` and `npm run dev`. Set
   `VITE_API_URL` to the backend host or API root when using a backend other
   than the default `https://data-collection-as75.onrender.com/`. Local
   development can set it to `http://localhost:3000/api`.
4. Register or log in, then submit POS records from the home page. Open
   `/dashboard` to see your profile and your records, or export those records as
   an `.xlsx` workbook.
5. To enable the admin panel, promote a trusted account by setting its `role`
   to `admin` in the users collection, then log out and back in. Set trusted
   accounts to `manager` to grant the manager view. Admins and managers can use
   `/admin` to see all users' presence and all submissions; both can edit or
   delete records, while only admins can assign records to users or change
   account roles. Admins can also manage workflow statuses, POS vendors, and
   role colors in portal settings. The final administrator cannot be demoted.
6. User presence updates every 30 seconds. Users are shown offline after
   90 seconds without a heartbeat or immediately after logout. Admins and
   managers can see the number of active browser devices for each user.