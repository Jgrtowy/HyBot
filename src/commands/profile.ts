import { ApplicationCommandOptionType, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { TimeSeriesBucketTimestamp } from 'redis';
import { CommandObject, CommandType, CommandUsage } from 'wokcommands';
import { hypRankEnum } from '../tools/hypRankEnum';

export default {
    description: 'Displays your Minecraft profile.',
    type: CommandType.SLASH,
    testOnly: true,
    ownerOnly: true,

    callback: async ({ interaction, client, guild }: CommandUsage) => {
        try {
            const userRepo = await import('../db').then((res) => res.userRepo);
            const hypFetch = await import('../tools/hypFetch').then((res) => res.default);
            if (!interaction || !client || !guild) return;

            const user = await userRepo
                .search()
                .where('id')
                .equals(interaction.user.id)
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

            const hyp = await hypFetch(`${user.uuid}`);
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${user.nickname}`, iconURL: `https://mc-heads.net/avatar/${user.uuid}` })
                .setThumbnail(`https://mc-heads.net/body/${user.uuid}/left`)
                .addFields({ name: 'UUID', value: `${user.uuid}`, inline: true }, { name: 'Rank', value: `${hyp.newPackageRank ? hypRankEnum[hyp.newPackageRank] : 'None'}`, inline: true });
            interaction.reply({
                embeds: [embed],
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
