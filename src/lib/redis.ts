import Redis from "ioredis";
import { connection } from "@/shared/connection.ts";

export const subscriber = new Redis(connection);
