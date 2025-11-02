import { execSync } from "child_process";

console.log("⚙️ Running Sequelize migrations...");
execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });
execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
console.log("✅ Migration + Seed complete");
