export const calculateGameTime = (gameStartTime: number) => {
  const currentTime = Date.now();
  const gameSeconds = Math.floor((currentTime - gameStartTime) / 1000);

  const minutes = Math.floor(gameSeconds / 60);
  const seconds = gameSeconds % 60;

  const gameTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return gameTime;
};
