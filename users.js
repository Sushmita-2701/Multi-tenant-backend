// Hardcoded test accounts
const users = [
  { email: "admin@acme.test", password: "password", role: "Admin", tenant: "Acme" },
  { email: "user@acme.test", password: "password", role: "Member", tenant: "Acme" },
  { email: "admin@globex.test", password: "password", role: "Admin", tenant: "Globex" },
  { email: "user@globex.test", password: "password", role: "Member", tenant: "Globex" },
];

module.exports = { users };
