const BoardGame = artifacts.require("BoardGame");

module.exports = (deployer) => {
  deployer.deploy(BoardGame);
};
