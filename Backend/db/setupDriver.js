import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

function readHiddenPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Run npm run driver:setup in an interactive terminal.");
  }

  return new Promise((resolve, reject) => {
    const wasRaw = process.stdin.isRaw;
    let password = "";
    process.stdout.write(prompt);
    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();

    function finish(error) {
      process.stdin.off("data", handleInput);
      process.stdin.setRawMode(wasRaw ?? false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(password);
    }

    function handleInput(chunk) {
      for (const character of chunk) {
        if (character === "\u0003" || character === "\u0004") {
          finish(new Error("Password entry cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          password = Array.from(password).slice(0, -1).join("");
        } else if (character >= " ") {
          password += character;
        }
      }
    }

    process.stdin.on("data", handleInput);
  });
}

async function setupDriver() {
  process.stdout.write("Setting up driver account Driver1.\n");
  const { rows: memberRows } = await pool.query(
    "SELECT id FROM users WHERE lower(username) = lower($1) LIMIT 1",
    ["Driver1"],
  );
  if (memberRows.length > 0) {
    throw new Error("Username Driver1 is already used by a member account.");
  }

  const password = await readHiddenPassword("New password (input hidden): ");
  const confirmation = await readHiddenPassword("Confirm password (input hidden): ");

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }
  if (
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error("Password must be at least 12 characters and no more than 72 bytes.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO drivers (username, password_hash, full_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (lower(username)) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       auth_version = drivers.auth_version + 1,
       updated_at = now()`,
    ["Driver1", passwordHash, "คนขับรถ 1"],
  );
  process.stdout.write("Driver1 credentials saved to the database as a bcrypt hash.\n");
}

try {
  await setupDriver();
} catch (error) {
  console.error("Driver account setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
