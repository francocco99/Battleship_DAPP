const GameRule = artifacts.require("GameRule");

module.exports = (deployer) => {
  deployer.deploy(GameRule);
};
