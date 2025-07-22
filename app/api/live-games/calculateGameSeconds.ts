export const calculateGameSeconds = (gameStartTime: number) => {
  const currentTime = Date.now();
  const gameSeconds = Math.floor((currentTime - gameStartTime) / 1000);

  return gameSeconds;
};
