import dotenv from "dotenv";

dotenv.config();

export const SYSTEM_PROGRAM = "11111111111111111111111111111111";
export const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const TOKEN_2022_PROGRAM = "TokenzQdB5nCzFj3nVvV53H6qD3n4X5saAMuNVRdHqgt";
export const JWT_SECRET = process.env.JWT_SECRET || "scout";

export const IS_MVP = process.env.IS_MVP || "true";