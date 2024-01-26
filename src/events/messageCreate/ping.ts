import { Message } from "discord.js";

export default (message: Message) => {
	if (message.content !== "h!ping" || message.author.bot) return;
	const startTime: number = performance.now();
	let endTime: number;
	try {
		(async () => {
			try {
				await fetch("https://api.hypixel.net/v2/resources/skyblock/skills", {
					method: "GET",
				});
				endTime = performance.now();
				sendMsg();
			} catch (err) {
				console.log(err);
			}
		})();
		function sendMsg() {
			message.channel
				.send("||<:Trollface:1064487093700669521>||")
				.then((msg: Message) => {
					msg.edit(
						`**hypong**\n\`\`\`js\nClient: "${
							msg.createdTimestamp - message.createdTimestamp
						}ms"\nAPI: "${Math.floor(endTime - startTime)}ms"\`\`\`
                  `,
					);
				});
		}
	} catch (err) {
		throw new Error(err);
	}
};
