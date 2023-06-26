// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
contract BoardGame {
  
   // we take the root beacuse anyone can check if we change the initial choiche
   // at the end of the game anyone can check the board correspond the board have previous committed

  // Players  Merkle tree root
  mapping(address => bytes32) plyrsMerkleRt;
  enum phase {WaitP,first, Second, Therd}
  address public firstPlayer;
  address public SecondPlayer;
  phase public currphase;


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

  constructor(address creator) 
  {
    
  }
}
