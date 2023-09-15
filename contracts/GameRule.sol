// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
  
  contract GameRule {

  enum phase {WaitP,GameSt,Deal,Placing ,Shoting,End}
  enum Shot {hit,miss,take,none}

  struct Player{
    address payable player; // address of the player
    bytes32 Root; //root of merklee tree
    uint256 hitb; // number of boat hits by the player
    uint money; //money to play the game
    Shot [] Shots; //shot take and results
  }
  struct SingleGame
  {
    Player firstPlayer; //address of the first player
    Player secondPlayer; //address of the second player
    phase currph; //current phase of the game
    address playerturn; // The address of the player of the current turn
    bool firstShot; //used to check the  shooting phase
    uint moneyDeal; //money deal
    uint8 Boardim; //dimension of the board
    uint8 Boats; //number of the boats
    uint256 BlockNumber; // last block  number, used for check the inactivity
  }
    uint rndNonce=0; //used to generate an Id
    uint256 nonce=0; //used to join random game
    uint256 modulus=10000; // used to generate an Id
    uint256 constant inactiveTime=3; //used for report the other player
   
    
    
    mapping(uint256 => bool) GamesJoin; // Use to ckeck if the game is full
    mapping(uint256=> SingleGame) ListGames; //all the  current game

    uint256 [] totalGame;  //used to join random games


    //I notify that an agreement has been reached and the player can start.
    event GameStart(address pl1, address pl2, uint Amount);
    
    //  notify the player that the game has been created.
    event GameCreated(uint id,address pl,uint256 dimboard,uint256 boats);
    
    // notify the player that they have joined the game with Id.
    event GameJoin(address pl1,address pl2,uint256 dimboard,uint256 boats);

    // notify the player that they have joined the game by entering random
    event GamerndJoin(address pl1,address pl2,uint256 dimboard,uint256 boats,uint256 Id);
    
    // notify the player who tried to join that the game is full.
    event GameFull(address pl);

    //Both players have memorized the root. The shooting phase begins
    event Startshoting(address plt);
    
    // Notify  the opponent about which position has been hit.
    event ShotTaken(address pl,uint8 pos);
    
    //The wagered amount is not the same
    event NotEqualAmnt(address pl1,address pl2);
   
    // notify the opponent of the shooting result.
    event Resultshot(uint8 pos,address opp,uint8 resutlShot);
  
    // declare who the winner of the game is.
    event Winner(address win);
    
    // notify the potential winner that they need to send the data for victory verification.
    event CheckWinner(address win);

 

   
  
    //modifier to check  if the current phase of the game is correct
    modifier checkjoinPlayer(uint256 Id)
    {
      SingleGame memory game=ListGames[Id];
      require(game.currph==phase.WaitP, " The phase is not correct");
      _;
    }
    modifier checkBet(uint256 Id)
    {
      SingleGame  memory game=ListGames[Id];
      require(game.currph==phase.GameSt, " The phase is not correct");
      _;
    }
    modifier checkPlace(uint256 Id)
    {
      SingleGame memory game=ListGames[Id];
      require(game.currph==phase.Deal," The phase is not correct");
      _;
    }
    modifier checkEnd(uint256 Id)
    {
      SingleGame memory game=ListGames[Id];
      require(game.currph==phase.Shoting," The phase is not correct");
      _;
    }

    
// Modifier to check that the position hasn't been hit already.
    modifier alreadyShoot(uint256 Id,uint8 pos)
    {
      Player memory player;
      if(ListGames[Id].firstPlayer.player==msg.sender)
      {
        player=ListGames[Id].firstPlayer;
      }
      else
      {
        player=ListGames[Id].secondPlayer;
      }
      
      require(player.Shots[pos]==Shot.none,"You have already Shot at this position");
      _;
    }
  

  // return the leaves to check, Used when there's a potential winner, to determine the missing leaves to check.
  function GetTocheck(uint256 Id)   public view returns(uint[] memory)
  {
    Player memory pl;
    uint[] memory tocheck=new uint[](ListGames[Id].Boardim);
    if(ListGames[Id].firstPlayer.player==msg.sender)
    {
      pl=ListGames[Id].secondPlayer; 
    }
    else
    {
      pl=ListGames[Id].firstPlayer;
    }
    //I am retrive an array Where the position shows 1, if the position still needs to be checked.
    for(uint i=0;i<pl.Shots.length;i++)
    {
      if(pl.Shots[i]==Shot.none)
      {
        tocheck[i]=1;
      }
      else
      {
        tocheck[i]=0;
      }
    }
    return tocheck;
  }
  //function for creating the game
  function createGame(uint8 Boardim,uint8 Boats)  public 
  {
    
    uint Id = rndId(msg.sender);
    SingleGame memory Game;

    Player memory firstPlayer;
    Player memory secondPlayer;
    firstPlayer.player= payable(msg.sender);
    firstPlayer.money=0;
    
    firstPlayer.Shots= new Shot[](Boardim);
    secondPlayer.Shots= new Shot[](Boardim);
    for(uint i =0;i<Boardim;i++)
    {
      firstPlayer.Shots[i]=Shot.none;
    }
    for(uint i =0;i<Boardim;i++)
    {
      secondPlayer.Shots[i]=Shot.none;
    }
    Game.firstPlayer=firstPlayer;
    Game.secondPlayer=secondPlayer;
    Game.firstShot=true;
    Game.currph=phase.WaitP;
    Game.Boardim=Boardim;
    Game.Boats=Boats;
    ListGames[Id]=Game;
    GamesJoin[Id]=false; // il game è joinable
    totalGame.push(Id); // other player can join random the game
    emit GameCreated(Id,msg.sender,Boardim,Boats);
  
  }
    
    //function for join  the game by Id
  function joinGame(uint256 Id)   public
  {
    uint idx;
    require(msg.sender!=ListGames[Id].firstPlayer.player,"You cannot join the game you have created");
    if(GamesJoin[Id]==true) // a player already join the game
    {
      emit GameFull(msg.sender);
    }
    else
    {
  
      GamesJoin[Id]=true;
      ListGames[Id].secondPlayer.player=payable(msg.sender);
      ListGames[Id].secondPlayer.money=0;
      ListGames[Id].currph=phase.GameSt; //change the phase
      
      for(uint i=0;i<totalGame.length;i++)
      {
        if(totalGame[i]==Id)
        {
          idx=i;
        }
      }
      delete totalGame[idx]; // Is not joinable
      if(idx==totalGame.length-1)
      {
        totalGame.pop();
      }
      else
      {
        totalGame[idx] = totalGame[totalGame.length - 1];
        totalGame.pop();
      }
      emit GameJoin(ListGames[Id].firstPlayer.player,ListGames[Id].secondPlayer.player,ListGames[Id].Boardim,ListGames[Id].Boats);

    }
  }

  //function to join a random game
  function joinrndGame() public
  {
    require(totalGame.length!=0,"No Game Avaiable");
    uint idxrnd=uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,nonce))) % totalGame.length;
    nonce ++;
    uint256 Id=totalGame[idxrnd];
    ListGames[Id].secondPlayer.player=payable(msg.sender);
    ListGames[Id].currph=phase.GameSt; //change the phase
    GamesJoin[Id]=true;
    delete totalGame[idxrnd];
    if(idxrnd==totalGame.length-1)
    {
      totalGame.pop();
    }
    else
    {
      totalGame[idxrnd] = totalGame[totalGame.length - 1];
      totalGame.pop();
    }
    
    emit GamerndJoin(ListGames[Id].firstPlayer.player,ListGames[Id].secondPlayer.player,ListGames[Id].Boardim,ListGames[Id].Boats,Id);
  }
    //function to propose the bet, and check if the amount is equal
  function proposedBet(uint256 Id)   checkBet(Id) public payable 
  {
    if(GamesJoin[Id]==true)
    {
      if(ListGames[Id].firstPlayer.player==msg.sender)
      {
        require( ListGames[Id].firstPlayer.money==0,"You have already send the money"); //Check that the first player hasn't already sent the money
        ListGames[Id].firstPlayer.money=msg.value;
        ListGames[Id].BlockNumber=block.number;
      }
      else
      {
        require( ListGames[Id].secondPlayer.money==0,"You have already send the money"); //Check that the second player hasn't already sent the money
        ListGames[Id].secondPlayer.money=msg.value;
        ListGames[Id].BlockNumber=block.number; //save the last interaction
      }
      //check if the value is equal
      if(ListGames[Id].firstPlayer.money!=0 && ListGames[Id].secondPlayer.money!=0)
      {
        if(ListGames[Id].firstPlayer.money==ListGames[Id].secondPlayer.money)
        {
          ListGames[Id].moneyDeal=ListGames[Id].firstPlayer.money+ListGames[Id].secondPlayer.money;
          ListGames[Id].currph=phase.Deal; //change the phase
          ListGames[Id].firstPlayer.Root=0;
          ListGames[Id].secondPlayer.Root=0;
          emit GameStart(ListGames[Id].firstPlayer.player,ListGames[Id].secondPlayer.player,ListGames[Id].moneyDeal); 
        }
        else
        {
          emit NotEqualAmnt(ListGames[Id].firstPlayer.player,ListGames[Id].secondPlayer.player);
          ListGames[Id].firstPlayer.player.transfer(ListGames[Id].moneyDeal); // the money return to the player
          ListGames[Id].secondPlayer.player.transfer(ListGames[Id].moneyDeal); // the money return to the player
          ListGames[Id].firstPlayer.money=0;
          ListGames[Id].secondPlayer.money=0;
        }
      }

      
    }
    
  }

    //Player turn that selects the coordinates to shoot and sends them to the smart contract.
    function attack(uint256 Id,uint8 pos)    alreadyShoot(Id,pos) public
    {
      if(ListGames[Id].firstShot==true)
      {
        require(ListGames[Id].currph==phase.Placing,"The phase is not correct");
        ListGames[Id].firstShot=false;
        ListGames[Id].currph=phase.Shoting;
      }
      require(ListGames[Id].playerturn==msg.sender,"It's not the player's turn.");
      require(pos<ListGames[Id].Boardim ,"The position is incorrect");
      if( ListGames[Id].firstPlayer.player==msg.sender) //the shot is taken, the result is update when the opponent commit the proof with the result of the shoot
      {
        ListGames[Id].firstPlayer.Shots[pos]=Shot.take;
      }
      else
      {
        ListGames[Id].secondPlayer.Shots[pos]=Shot.take;
      }
      // Set the shot as taken
      
      ListGames[Id].BlockNumber=block.number; // store the last block number is use for testing if the opponent is AFK
      emit ShotTaken(msg.sender, pos); // Notify opponent of position of the shot
      
    }
  
  

  //verify the player tell the true and not modify the merklee tree
  //the Player generates a Merkle proof demonstrating that their secret board configuration satisfies the  hit/miss result they claim
  function verify(uint32 Id,bytes32[] memory proof,uint8 leaves,uint8 pos,uint8 shotr)   public 
  {
    bool result;
    bytes32 root;   
    bytes32 leaf;
    address payable opponent;
    //take the root
    if(ListGames[Id].firstPlayer.player==msg.sender)
    {
      root=ListGames[Id].firstPlayer.Root;
      opponent=ListGames[Id].secondPlayer.player;
    }
    else 
    {
      root=ListGames[Id].secondPlayer.Root;
      opponent=ListGames[Id].firstPlayer.player;
    }  

    leaf=keccak256(abi.encodePacked(leaves)); // generate the leaf
    result=MerkleProof.verify(proof, root, leaf); 
    if(result) // if the result proof is correct
    {
      ListGames[Id].playerturn=msg.sender; //change the turn of the game

      if(shotr==1) // add hits made by the player, and check the win
      {
        if( ListGames[Id].firstPlayer.player==msg.sender)
        {
          ListGames[Id].secondPlayer.Shots[pos]=Shot.hit;
          ListGames[Id].secondPlayer.hitb++;
          checkwin(Id,payable(ListGames[Id].secondPlayer.player));
        }
        else
        {
          ListGames[Id].firstPlayer.Shots[pos]=Shot.hit;
          ListGames[Id].firstPlayer.hitb++;
          checkwin(Id,payable(ListGames[Id].firstPlayer.player));
        }
        emit Resultshot(pos,opponent,uint8(shotr)); // notify the opponent the result of the shot
      }
      else // if miss the boat 
      {
        if( ListGames[Id].firstPlayer.player==msg.sender)
        {
          ListGames[Id].secondPlayer.Shots[pos]=Shot.miss;
        }
        else
        {
          ListGames[Id].firstPlayer.Shots[pos]=Shot.miss;
        }
        emit Resultshot(pos,opponent,uint8(shotr));
      }
    }
    //if the root change the opponent win,because the player is cheating
    else
    {
      emit Winner(opponent);
      opponent.transfer(ListGames[Id].moneyDeal);
    }
    
  }

  //report the player afk
 function Playerafk(uint256 Id)  external
 {
    uint256 sumbloc=SafeMath.add(ListGames[Id].BlockNumber,inactiveTime); //use libray safe, to sum the last block numer of the game + limit block
    require(block.number> sumbloc,"The player is still online");
    address opponent;
    if(ListGames[Id].firstPlayer.player==msg.sender)
    {
      opponent=ListGames[Id].secondPlayer.player;
    }
    else if(ListGames[Id].secondPlayer.player==msg.sender)
    {
      opponent=ListGames[Id].firstPlayer.player;
    }
    if(ListGames[Id].currph==phase.GameSt)
    {
      emit Winner(msg.sender);   
      payable(msg.sender).transfer(ListGames[Id].moneyDeal); 
      
    }
    else
    {
      require(ListGames[Id].playerturn!=msg.sender,"You can't report during your turn");
      emit Winner(msg.sender);   
      payable(msg.sender).transfer(ListGames[Id].moneyDeal); 
      
    }
 }



// function to che the winner
function checkwin(uint256 Id,address payable winner)  internal
{
  uint256 Boats=ListGames[Id].Boats;
  uint hit;
  if(ListGames[Id].firstPlayer.player==winner)
  {
    hit=ListGames[Id].firstPlayer.hitb;
  }
  else
  {
    hit=ListGames[Id].secondPlayer.hitb;
  }
  if(hit==Boats) //The number of shots on target is equal to the number of hits of the boats
  {
    emit CheckWinner(winner); // the player must  provide the board
   
  }
}

  //function to verify  the proof of unverified leaves to declare the winner of the game.
  function verifyWin( uint256 Id,bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32[] memory leaves,
        uint8 [] memory values)   public
  {
    uint count=0;
    bool result=true;
    address opponent;
    bytes32 Root;
    Shot[] memory shotspl;
    SingleGame memory Game=ListGames[Id];
    uint moneyPay=ListGames[Id].moneyDeal;
    if(Game.firstPlayer.player==msg.sender)
    {
      Root=Game.firstPlayer.Root;
      opponent=Game.secondPlayer.player;
      shotspl=Game.secondPlayer.Shots; //opponent shot
    }
    else 
    {
      Root=Game.secondPlayer.Root;
      opponent=Game.firstPlayer.player; //opponent shot
      shotspl=Game.firstPlayer.Shots;
    } 
    result=MerkleProof.multiProofVerify(proof, proofFlags, Root, leaves); // check the last leaves remain if the proof is correct
    //Check if there is a ship the value of the shot must be different from Miss
    for(uint i=0;i<values.length;i++)
    {
      if(values[i]==1)
      {
        count++;
        if(shotspl[i]==Shot.miss) //The player has lied, where there was a boat, he declared a miss
        {
          result=false;
        }
      }
    }
    
    if(result==false)
    {
      //the player cheat, the opponent win the game
      emit Winner(opponent);
      ListGames[Id].currph=phase.End;
      payable(opponent).transfer(moneyPay);
      return;
    }

    if(count!=ListGames[Id].Boats) // check if the number of cordinates boats in the grid is equal to the number of cordiantes boats decalred when we create the game
    {
      emit Winner(opponent);
      ListGames[Id].currph=phase.End;
      payable(opponent).transfer(moneyPay);
      return;
    }
    if(values.length!=ListGames[Id].Boardim) // check if the dimension of the board is correct
    {
      emit Winner(opponent);
      ListGames[Id].currph=phase.End;
      payable(opponent).transfer(moneyPay);
      return;
    }
    
    
    if(result) // result of multiProofVerify
    {
      emit Winner(msg.sender);
      ListGames[Id].currph=phase.End;
      payable(msg.sender).transfer(moneyPay);
      return;
    }
    
  }

   
  // store the merkle root in the contract
  function storeRoot(uint256 Id,bytes32 Rootm) checkPlace(Id) public
  {    
    if(ListGames[Id].firstPlayer.player==msg.sender)
    {
      require(ListGames[Id].firstPlayer.Root==0,'The Root is already commited');
      ListGames[Id].firstPlayer.Root=Rootm;
      ListGames[Id].BlockNumber=block.number;
    
    }
    else if(ListGames[Id].secondPlayer.player==msg.sender)
    {
      require(ListGames[Id].secondPlayer.Root==0,'The Root is already commited'); //check that the root is not already commited
      ListGames[Id].secondPlayer.Root=Rootm;
      ListGames[Id].BlockNumber=block.number;
      
    }
    
    if(ListGames[Id].firstPlayer.Root!=0 && ListGames[Id].secondPlayer.Root!=0)
    {
      ListGames[Id].currph=phase.Placing; // change the phase of the game
      ListGames[Id].playerturn=ListGames[Id].firstPlayer.player; // is the turn of the first player
      emit Startshoting(ListGames[Id].firstPlayer.player);// the current turn is of the first player that create the game
    }
  }

  //function to generate random index
  function rndId(address player) internal returns(uint256) {
    rndNonce++;
    return uint256(keccak256(abi.encodePacked(block.timestamp,player,rndNonce))) % modulus;
    
  }
}

