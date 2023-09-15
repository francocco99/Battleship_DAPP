# BattleShip
## Project Peer to Peer and Blockchain, 2022-2023
The Battleship board game is played by two players who cannot see each others’ board until the 
end of the game. The game operates on hidden information, and that hidden state influences 
each action taken by the players.
The game is divided into two phases: during the placement phase, each player places k ships 
of varying lengths and of constant width on their board, a **n X n** matrix which represents a coarse 
discretization of the ocean. After the first phase, the game proceeds to the shooting phase, which 
consists of players taking turns and making guesses about the location of the ships on the 
opponent’s board (referred to as launching a torpedo). The guess consists of telling the 
opponents the coordinates **[i,j]** of a zone of the board. If any of the opponent’s ships are at that 
location, the opponent replies *Hit!*, otherwise *Miss!*. Once all the squares that the ship 
occupies have been hit, the ship is considered *sunk*. 
 The termination of the game happens when one of the players has sunk all of their opponent’s 
ships and that player wins the game.

To avoid making the board visible to the opponent, the board is stored on the blockchain using the ***root of a MerkleTree***.
When both players are in the match, the game begins, and the ***ETH*** wagered will be awarded to the winner of the match.

Battleship is implemented as a **DApp** application, so the functions of the application are implemented through smart contracts.
### SmartContract & Front-End

The **GameRule.sol** contract is responsible for managing all the main functions, such as creating a new game and participating via an ID, joining randomly, and then overseeing all the game functions.

The front-end part has been implemented through an **.html** file and a **.js** file for interactions with the smart contract.




### Instruction & User Manual
• Install **Ganache** to simulate the Ethereum blockchain and load the Truffle configuration file (The truffle -config.js file in the smart contract folder).

• Install **Truffle** to migrate the contract.

• Insert the correct port corresponding to the port present in Ganache in the **truffleconfig.js** configuration file.

• Install **npm** to execute.

• In the Battleship folder run **npm ci** for installing the libraries.

• In the same folder truffle migrate to deploy the contract on the blockchain.

• In the same folder, run npm run dev, at this point, the default web browser
opens, displaying the main page at **localhost:3000**, before starting, make sure you
have logged in to the Metamask extension with one of the Ganache accounts and
ensure that the selected network in Metamask is **localhost:7545**.

• open also another browser in the same localhost:3000 and in **localhost:3001**, **sync
Options disable all**. Make sure to use two different accounts.
