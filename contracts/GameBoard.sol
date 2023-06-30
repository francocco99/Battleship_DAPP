// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
contract BoardGame {
  
   // we take the root beacuse anyone can check if we change the initial choiche
   // at the end of the game anyone can check the board correspond the board have previous committed

  // Players  Merkle tree root
  uint IDgame;
  mapping(address => bytes32) plyrsMerkleRt;
  enum phase {WaitP,GameSt,Deal, PlaceSh, Shot,End}
  address public firstPlayer;
  address public SecondPlayer;

  uint256 dealMoney;
  uint256 amountMoney1;
  uint256 amountMoney2;

  phase public currphase;


  // events
  event Gamestart(); // Second Player join the game
  event Dealaccept(uint value);
  event Dealrefuse();


  function setSecondPl(address pl2) public
  {
    SecondPlayer=pl2;
    emit Gamestart();
    currphase=phase.GameSt;
  }
    //memorizzo il merkel tree dell'utente
  function storeRoot(bytes32 Rootm) public
  {
    plyrsMerkleRt[msg.sender]=Rootm;
  }

   // controllo in che fase mi trovo
  function check_phase() public
  {
  
  }
  
// controllo che l'avversario non stia barando
  function Proof(
        bool Ship,
        uint256 salt,
        uint8 ix,
        bytes32[] memory proof,
        bytes32 root
    ) internal pure returns (bool) {
      bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(salt,Ship, ix)))); 

        return MerkleProof.verify(proof, root, leaf);
    }

  // controllo che la posizione sia corretta
  function  shot(uint8 pos) internal
  {

  }
  function placemoney1(uint256 money) public
  {
    amountMoney1=money;
  }
  function placemoney2(uint256 money) public
  {
    amountMoney2=money;
  }
  function checkmoney() public
  {
    if(amountMoney1==amountMoney2) 
    {
      dealMoney=amountMoney1;
      currphase=phase.Deal;
      emit Dealaccept(dealMoney);

    }
    else
    {
      emit Dealrefuse();
    }
  }

  constructor(address creator, uint Id) 
  {
    firstPlayer = creator;
    IDgame=Id;
    currphase=phase.WaitP; //Waiting for the player
  }
}
