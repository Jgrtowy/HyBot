import env from '../env';

const hypFetch = async (uuid: string) => {
    const res = await fetch(`https://api.hypixel.net/v2/player?uuid=${uuid}`, {
        method: 'GET',
        headers: {
            'API-Key': `${env.hypixelApiKey}`,
        },
    }).then((res) => res);
    if (res.status !== 200) throw new Error(`Hypixel API returned ${res.status}`);
    return res.json().then((res) => res.player);
};

export default hypFetch;
