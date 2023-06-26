// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
  contract GameRule {
    uint IncremId;
    //BattleshipGame[] private joinableGames;
    event GameStart(address indexed _from, address indexed _to);
    event GameCreated();
    
    struct game{
        address creator;
        uint id;
        phase p;
      
    }
    game [] public Listgames;
    
    function createGame() public 
    {
        IncremId=IncremId+1;
        Listgames.push(game(msg.sender,IncremId,phase.WaitP));
        emit GameCreated();
        return;
    }
    constructor() public
    {

    }
    
    
}

