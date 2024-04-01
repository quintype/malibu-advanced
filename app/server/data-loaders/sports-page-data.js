const getSportsData = () => {
  const data = { name: "cricket", noOfPlayers: 11, type: "team" };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data);
    }, 200);
  });
};

export async function loadSportsPageData(client, authorSlug, config, next) {
  const data = await getSportsData();
  return data;
}
