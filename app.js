const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { users } = require("./users");
const { tenants } = require("./tenants");
const { generateToken, authenticate, authorizeRole } = require("./auth");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running POST /login");
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = generateToken(user);
  res.json({ token });
});

// Fetch notes (all authenticated users)
app.get("/notes", authenticate, (req, res) => {
  const tenantData = tenants[req.user.tenant];
  res.json({
    tenant: req.user.tenant,
    plan: tenantData.plan,
    notes: tenantData.notes,
  });
});

// Create a note (Members only + check subscription)
app.post("/notes", authenticate, authorizeRole("Member"), (req, res) => {
  const tenantData = tenants[req.user.tenant];
  const { note } = req.body;

  if (tenantData.plan === "Free" && tenantData.notes.length >= 3) {
    return res.status(403).json({
      error: `Free plan limit reached (3 notes). Ask admin to upgrade.`,
    });
  }

  tenantData.notes.push(note || `Note ${tenantData.notes.length + 1}`);
  res.json({
    message: `Note created by ${req.user.email}`,
    notes: tenantData.notes,
  });
});

// Upgrade plan (Admins only)
app.post("/tenants/:slug/upgrade", authenticate, authorizeRole("Admin"), (req, res) => {
  const slug = req.params.slug;

  if (!tenants[slug]) {
    return res.status(404).json({ error: "Tenant not found" });
  }

  tenants[slug].plan = "Pro";
  res.json({ message: `${slug} upgraded to Pro ✅`, tenant: tenants[slug] });
});

// Admin-only route (invite)
app.post("/invite", authenticate, authorizeRole("Admin"), (req, res) => {
  res.json({ message: `User invited by ${req.user.email} from ${req.user.tenant}` });
});

app.listen(4000, () => console.log(" Backend running "));
