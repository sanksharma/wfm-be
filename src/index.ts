import "dotenv/config";
import { start } from "./server";

try {
  start();
} catch (error) {
  console.error(error);
}
