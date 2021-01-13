module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URL: process.env.DB_URL || "postgresql://postgres@localhost/naturehood",
  CLIENT_ORIGIN: "https://naturehood-app-3r8od4sop.vercel.app/",
};
