import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { CommandObject, CommandType, CommandUsage } from "wokcommands";
import hypFetch from "../tools/hypFetch";

export default {
	description: "Assigns you to Minecraft account.",
	type: CommandType.SLASH,
	testOnly: true,
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "nickname",
			description: "Your nickname in Minecraft.",
			required: true,
		},
	],

	callback: async ({ interaction, client, guild }: CommandUsage) => {
		try {
			const userRepo = await import("../db").then((res) => res.userRepo);
			if (!interaction || !client || !guild) return;
			const nickname = interaction.options.getString("nickname");
			const user = await fetch(
				`https://api.mojang.com/users/profiles/minecraft/${nickname}`,
			).then((res) => res.json() as Promise<{ id: string; name: string }>);
			if (!user) {
				interaction.reply({
					content: "> Error: Invalid nickname",
					ephemeral: true,
				});
				return;
			}
			let taken = false;
			await userRepo
				.search()
				.where("id")
				.equals(interaction.user.id)
				.returnFirst()
				.then((res) => {
					if (res) {
						interaction.reply({
							content: `> Error: You are already linked to an account \`${res.nickname}\``,
							ephemeral: true,
						});
						taken = true;
						return;
					}
				});

			await userRepo
				.search()
				.where("uuid")
				.equals(user.id)
				.returnFirst()
				.then((res) => {
					if (res) {
						interaction.reply({
							content: `> Error: This account is already linked to <@${res.id}>`,
							ephemeral: true,
						});
						taken = true;
						return;
					}
				});

			if (taken) return;
			const newUser = await userRepo
				.save({
					id: interaction.user.id,
					uuid: user.id,
					nickname: user.name,
				})
				.then((res) => res as { id: string; uuid: string; nickname: string })
				.catch((err) => {
					throw err;
				});

			if (!newUser) {
				interaction.reply({
					content: "> Error: Invalid nickname",
					ephemeral: true,
				});
				return;
			}

			interaction.reply({
				content: `> Success: You have been linked to ${user.name} with UUID ${user.id}`,
				ephemeral: true,
			});
		} catch (err) {
			console.error(err);
			interaction?.reply({
				content: "> Error ocurred, please try again",
				ephemeral: true,
			});
		}
	},
} satisfies CommandObject;
