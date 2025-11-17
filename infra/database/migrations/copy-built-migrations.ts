import { cp, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

async function copyBuiltMigrations() {
  const projectRoot = process.cwd();
  const source = join(projectRoot, "dist", "infra", "migrations");
  const destinationBase = join(projectRoot, ".next", "server", "infra");
  const destination = join(destinationBase, "migrations");

  try {
    await stat(source);
  } catch {
    console.warn(
      `Skipping migration copy because "${source}" does not exist. Did you run "npm run build:migrations"?`,
    );
    return;
  }

  await mkdir(destinationBase, { recursive: true });
  await cp(source, destination, { recursive: true });
  console.log(`Copied migrations from "${source}" to "${destination}".`);
}

copyBuiltMigrations().catch((error) => {
  console.error("Failed to copy migrations into the .next build:", error);
  process.exit(1);
});
