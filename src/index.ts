import { Client, IntentsBitField, Partials } from "discord.js";
import path from "path";
import WOK from "wokcommands";
import { pingRedis } from "./db.js";
import env from "./env.js";

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent,
	],
	partials: [Partials.Channel],
});

client.once("ready", () => {
	new WOK({
		client,
		commandsDir: path.join(__dirname, "commands"),
		testServers: ["1040650205202227261"],
		botOwners: ["315531146953752578", "304961013202288651"],
		events: {
			dir: path.join(__dirname, "events"),
		},
	});

	pingRedis
		.then(() => {
			console.log("\x1b[31m🔗 HyBot connected to Redis!\x1b[0m");
		})
		.catch((err) => {
			console.error("\x1b[41m❌ HyBot failed to connect to Redis!\x1b[0m");
			throw err;
		});
});

client.login(env.botToken);
console.log("\x1b[42m✅ HyBot is now running!\x1b[0m");
