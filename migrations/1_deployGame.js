const GameBoard = artifacts.require("GameBoard");

module.exports = (deployer) => {
  deployer.deploy(GameBoard);
};
