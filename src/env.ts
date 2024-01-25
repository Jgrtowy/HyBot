import { StringSelectMenuBuilder } from 'discord.js';

interface Env {
    botToken: string;
    redisUrl: string;
    hypixelApiKey: string;
}

const env: Env = {
    botToken: process.env.BOT_TOKEN ?? '',
    redisUrl: process.env.REDIS_URL ?? '',
    hypixelApiKey: process.env.HYPIXEL_API_KEY ?? '',
};

if (Object.values(env).includes('')) throw new Error('Not all environment variables are set.');

export default env;
