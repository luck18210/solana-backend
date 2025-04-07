import dotenv from 'dotenv';

dotenv.config();

export const HELIUS_SERVER = process.env.HELIUS_SERVER || "HELIUS_SERVER";
export const HELIUS_API_SERVER = process.env.HELIUS_API_SERVER || "HELIUS_API_SERVER";
export const HELIUS_BASE_URI = process.env.HELIUS_BASE_URI || "HELIUS_BASE_URI";
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "HELIUS_API_KEY";