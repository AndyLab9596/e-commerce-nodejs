const app = require("./src/app");
const { checkOverload } = require("./src/helpers/check.connect");

const PORT = process.env.DEV_APP_PORT || 3056;

const server = app.listen(PORT, () => {
  console.log(`WSV e-commerce with port ${PORT}`);
});

const overloadInterval = checkOverload();

process.on("SIGINT", () => {
  clearInterval(overloadInterval);

  server.close(() => console.log("\nExit Server Express"));
  
  process.exit(1);
});
