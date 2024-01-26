import { createClient } from "redis";
import { Repository, Schema } from "redis-om";

const redisClient = await createClient({ url: process.env.REDIS_URL })
	.on("error", (err) => {
		throw err;
	})
	.connect();

export const pingRedis = redisClient.ping();

const userSchema = new Schema("user", {
	id: { type: "string", caseSensitive: true },
	uuid: { type: "string" },
	nickname: { type: "string" },
});

export const userRepo = new Repository(userSchema, redisClient);

await userRepo.createIndex();
