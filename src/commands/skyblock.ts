import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { CommandObject, CommandType, CommandUsage } from "wokcommands";

export default {
	description: "Displays your Minecraft profile.",
	type: CommandType.SLASH,
	testOnly: true,
	ownerOnly: false,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "auctions",
			description: "Displays auctions.",
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: "mention",
					description: "Other user's profile in Minecraft.",
					required: false,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "profiles",
			description: "Displays profiles.",
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: "mention",
					description: "Other user's profile in Minecraft.",
					required: false,
				},
			],
		},
	],

	callback: async ({ interaction, client, guild }: CommandUsage) => {
		try {
			const userRepo = await import("../db").then((res) => res.userRepo);
			const hypFetch = await import("../tools/hypFetch").then(
				(res) => res.default,
			);
			if (!interaction || !client || !guild) return;
			const command = interaction.options.getSubcommand();
			switch (command) {
				case "auctions": {
					const user = await userRepo
						.search()
						.where("id")
						.equals(
							(interaction.options.getUser("mention")?.id as string) ??
								interaction.user.id,
						)
						.returnFirst()
						.then((res) => {
							if (!res) {
								interaction.reply({
									content: `> Error: You aren't linked to an account\n> Use \`/link\` to link your account`,
									ephemeral: true,
								});
								return;
							}
							return res;
						});
					if (!user) return;

					const hyp = await hypFetch(
						"skyblock/auction",
						"player",
						`${user.uuid}`,
					).then((res) => res.auctions);

					const embed = new EmbedBuilder()
						.setAuthor({
							name: `${user.nickname}`,
							iconURL: `https://mc-heads.net/avatar/${user.uuid}`,
						})
						.addFields(
							hyp.length > 0
								? hyp.map((auction, i) => {
										if (i > 24) return;
										return {
											name: auction.item_name,
											value: `\`\`\`yml\n${auction.starting_bid.toString()}\`\`\``,
											inline: true,
										};
								  })
								: { name: "No auctions", value: "No auctions", inline: true },
						);
					interaction.reply({
						embeds: [embed],
					});
					break;
				}
				case "profiles": {
					const user = await userRepo
						.search()
						.where("id")
						.equals(
							(interaction.options.getUser("mention")?.id as string) ??
								interaction.user.id,
						)
						.returnFirst()
						.then((res) => {
							if (!res) {
								interaction.reply({
									content: `> Error: You aren't linked to an account\n> Use \`/link\` to link your account`,
									ephemeral: true,
								});
								return;
							}
							return res;
						});
					if (!user) return;
					const hyp = await hypFetch(
						"skyblock/profiles",
						"uuid",
						`${user.uuid}`,
					).then((res) => res.profiles);

					const embed = new EmbedBuilder()
						.setAuthor({
							name: `${user.nickname}`,
							iconURL: `https://mc-heads.net/avatar/${user.uuid}`,
						})
						.addFields(
							hyp.length > 0
								? hyp.map((profile, i) => {
										if (i > 24) return;
										return {
											name: `${profile.cute_name} | ${
												profile.game_mode === "ironman" ? "IronMan" : "Normal"
											} (${Object.keys(profile.members).length})`,
											value: `\`\`\`yml\n${profile.profile_id}\`\`\``,
											inline: true,
										};
								  })
								: { name: "No profiles", value: "No profiles", inline: true },
						);
					interaction.reply({
						embeds: [embed],
					});
					break;
				}
			}
		} catch (err) {
			console.error(err);
			interaction?.reply({
				content: "> Error ocurred, please try again",
				ephemeral: true,
			});
		}
	},
} satisfies CommandObject;
