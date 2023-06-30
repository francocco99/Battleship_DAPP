// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./GameBoard.sol";
  contract GameRule {
    uint IncremId=0;
    //BoardGame[] private Games;

    mapping(uint256 => bool) GamesJoin;
    mapping(uint256 => BoardGame) Listgames;
    event GameStart();
    event GameCreated(uint id);
    event GameJoin();
    event GameFull();
   
   
    
    function createGame() public 
    {
        // generate 
        uint Id = IncremId;
        BoardGame Gamenew= new BoardGame(msg.sender,Id);
        GamesJoin[Id]=false; // il game è joinable
        Listgames[Id]=Gamenew;
        emit GameCreated(Id);
        IncremId ++;
    }
    function joinGame(uint Id) public
    {
        if(GamesJoin[Id]==true)
        {
            emit GameFull();
        }
        else
        {
            GamesJoin[Id]=true;
            BoardGame Game=Listgames[Id];
            Game.setSecondPl(msg.sender);
            emit GameJoin();
        }
    }
    constructor() public
    {

    }
    
    
}

