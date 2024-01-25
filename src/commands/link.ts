import { ApplicationCommandOptionType } from 'discord.js';
import { CommandObject, CommandType, CommandUsage } from 'wokcommands';

export default {
    description: 'Assigns you to Minecraft account.',
    type: CommandType.SLASH,
    testOnly: true,
    ownerOnly: true,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'nickname',
            description: 'Your nickname in Minecraft.',
            required: true,
        },
    ],

    callback: async ({ interaction, client, guild }: CommandUsage) => {
        try {
            const userRepo = await import('../db').then((res) => res.userRepo);
            if (!interaction || !client || !guild) return;
            const nickname = interaction.options.getString('nickname');
            const uuid = await fetch(`https://api.mojang.com/users/profiles/minecraft/${nickname}`).then((res) => res.json() as Promise<{ id: string }>);
            if (!uuid) {
                interaction.reply({
                    content: `> Error: Invalid nickname`,
                    ephemeral: true,
                });
                return;
            }

            await userRepo
                .search()
                .where('id')
                .equals(interaction.user.id)
                .returnFirst()
                .then((res) => {
                    if (res) {
                        interaction.reply({
                            content: `> Error: You are already linked to an account \`${res.nickname}\``,
                            ephemeral: true,
                        });
                        return;
                    }
                });
            const newUser = await userRepo
                .save({
                    id: interaction.user.id,
                    uuid: uuid.id,
                    nickname,
                })
                .then((res) => res as { id: string; uuid: string; nickname: string })
                .catch((err) => {
                    throw err;
                });

            if (!newUser) {
                interaction.reply({
                    content: `> Error: Invalid nickname`,
                    ephemeral: true,
                });
                return;
            }

            interaction.reply({
                content: `> Success: You have been linked to ${nickname} with UUID ${uuid.id}`,
                ephemeral: true,
            });
        } catch (err) {
            console.error(err);
            interaction?.reply({
                content: `> Error ocurred, please try again`,
                ephemeral: true,
            });
        }
    },
} satisfies CommandObject;
