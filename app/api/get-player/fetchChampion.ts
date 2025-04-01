export async function fetchChampion(
  championId: number | undefined
): Promise<{ championName: string; championImageName: string } | undefined> {
  const response = await fetch(
    "https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json"
  );
  const data = await response.json();
  const champions = await data.data;

  for (const champion in champions) {
    if (parseInt(champions[champion].key) === championId) {
      return {
        championName: champions[champion].name,
        championImageName: champions[champion].id,
      };
    }
  }
}
