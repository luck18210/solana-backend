import dotenv from 'dotenv';

dotenv.config();

export const BIRDEYE_API_URL = process.env.BIRDEYE_API_URL || "BirdEye API URL";
export const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "BirdEye API KEY";