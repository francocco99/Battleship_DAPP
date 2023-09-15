const Game = artifacts.require("GameRule");
const truffleAssert=require("truffle-assertions")
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256')

//Testing Creation
contract("Testing creation of a game --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
   

  describe("Creating a game", () =>{
    it("Creating a game using accounts[3]", async () => {
      let dim=4;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: accounts[3] });
      let result;
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl==accounts[3]
      });
    });
    
  })
});

//Testing Creation and Joining a game
contract("Test Creating and joining a Game --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Creating a game and Join a Game with Id" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=4;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
      
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl1==pl1
      });
    });
    
  })
});

/// testing creation an d joinig random game
contract("Test Creating and joining Random Game --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Creating a game and Join a Game random" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=4;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
      
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a random game ", async () => {
      const gametx=await game.joinrndGame({ from: pl2 });
      console.log("GAS USED TO JOIN RANDOM GAME----->"+ gametx.receipt.gasUsed+"\n");
      let result;
      truffleAssert.eventEmitted(gametx,"GamerndJoin",(ev) => {
        result="Game Joined, Info---> idGame:"+ ev.Id +" ,pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);

        return   ev.pl1==pl1
      });
    });
    
  })
});


/////// TESTING  BETTING ////
contract("Test Betting --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Creating a game and Join a Game with Id and Place the amount" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=4;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
      
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl1==pl1
      });
    });
    it("Bet from players ", async () => {
       let Amount=1
      const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
      const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
      truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
        result="Game Start, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,Amount: "+ev.Amount;
        console.log(result);
        return  true
      });
      
    });


    
  })
});

function Salt()
{
  const seed = Math.floor(Math.random() * 256);
  return seed;
}
/////// TESTING  COMMIT THE BOARDS + GAS ANALYSIS ////
contract("Test Commit the board --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed(); 
  })
  describe("Testing Commit the board" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    values=[1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0];
    valuesH=[]
  
    values2=[1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0];
    values2H=[]

    Salts=[]
    Salts2=[]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=16;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
     
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
      
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl1==pl1
      });
    });
    it("Bet from players ", async () => {
       let Amount=1
      const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
        
      const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
        
      truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
        result="Game Start, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,Amount: "+ev.Amount;
        console.log(result);
        return  true
      });
    });
    it("Commit the boards ", async() =>{ 
      let salt;
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts.includes(salt))
        {
          salt=Salt();
        }  
        Salts.push(salt)
        valuesH[i]=values[i]+ salt;
        
      }
      ///Salts
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts2.includes(salt))
        {
          salt=Salt();
        }  
        Salts2.push(salt)
        values2H[i]=values2[i]+ salt;
        
      }
      //Player1 Tree
      let valuesh=valuesH.map(x=>keccak256(x))
      const tree=new MerkleTree(valuesh,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root=tree.getHexRoot()

      //Player2 Tree
      let valuesh2=values2H.map(x=>keccak256(x))
      const tree2=new MerkleTree(valuesh2,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root2=tree2.getHexRoot()
      
      game1x=await game.storeRoot(id,root,{from: pl1});
     
      game2x=await game.storeRoot(id,root2,{from: pl2});
      
      
      
      truffleAssert.eventEmitted(game2x,"Startshoting",(ev) => {
        result="Shooting Start, Info---> FirstPlayer to Shoot: "+ev.plt;
        console.log(result);
        return  pl1==ev.plt
      });

    });   
  })
});
////// Testing Shooting phase
/////// TESTING  SHOOTING IN THE GAME ////
contract("Test Shooting  --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Testing Shooting phase btw two player" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    values=[1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0];
    valuesH=[]
  
    values2=[1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0];
    values2H=[]


    let tree;
    let tree2;
    Salts=[]
    Salts2=[]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=4;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl1==pl1
      });
    });
    it("Bet from players ", async () => {
       let Amount=1
      const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
      const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
      truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
        result="Game Start, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,Amount: "+ev.Amount;
        console.log(result);
        return  true
      });
    });
    it("Commit the boards ", async() =>{ 
      let salt;
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts.includes(salt))
        {
          salt=Salt();
        }  
        Salts.push(salt)
        valuesH[i]=values[i]+ salt;
        
      }
      ///Salts
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts2.includes(salt))
        {
          salt=Salt();
        }  
        Salts2.push(salt)
        values2H[i]=values2[i]+ salt;
        
      }
      //Player1 Tree
      let valuesh=valuesH.map(x=>keccak256(x))
       tree=new MerkleTree(valuesh,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root=tree.getHexRoot()

      //Player2 Tree
      let valuesh2=values2H.map(x=>keccak256(x))
       tree2=new MerkleTree(valuesh2,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root2=tree2.getHexRoot()
      
      game1x=await game.storeRoot(id,root,{from: pl1});
      game2x=await game.storeRoot(id,root2,{from: pl2});
      
      truffleAssert.eventEmitted(game2x,"Startshoting",(ev) => {
        result="Shooting Start, Info---> FirstPlayer to Shoot: "+ev.plt;
        console.log(result);
        return  pl1==ev.plt
      });
      
    
    });
    let pos; //poszione colpita
    it("Shooting by palyer 1 ", async () => {
      game1x=await game.attack(id,3,{from:pl1})
      truffleAssert.eventEmitted(game1x,"ShotTaken",(ev) => {
        result="Shot Taken info, Posizione colpita: "+ ev.pos +" pl: "+ev.pl;        
        pos=ev.pos
        console.log(result)
        return  ev.pl==accounts[3]
      });
     
    });
    it("Player 2 send the proof ", async () => {
      let res=values2[pos];
      const leaf=keccak256(values2H[pos])
      const proof=tree2.getHexProof(leaf)
      game1x=await game.verify(id,proof,values2H[pos],pos,res,{from:pl2})
      truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
        result="Result of the shot, Posizione colpita: "+ ev.pos +" Result shot: "+ev.resutlShot;
        console.log(result)        
        return  true;
      });
      
    });
  })
});
 // TEST COMPLETE GAME
 contract("Test Complete Game btw two players --------------------------------------------------------------", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Testing Complete Game btw two players" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    values=[0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0];
    valuesH=[]
  
    values2=[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0];
    values2H=[]


    let tree;
    let tree2;
    Salts=[]
    Salts2=[]
    let result;
    let id
    it("Creating a game ", async () => {
      
      let dim=16;
      let boats=4;
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
        console.log(result);
        return  ev.pl1==pl1
      });
    });
    it("Bet from players ", async () => {
       let Amount=1
      const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
      const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
      truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
        result="Game Start, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,Amount: "+ev.Amount;
        console.log(result);
        return  true
      });
    });
    it("Commit the boards ", async() =>{ 
      let salt;
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts.includes(salt))
        {
          salt=Salt();
        }  
        Salts.push(salt)
        valuesH[i]=values[i]+ salt;
        
      }
      ///Salts
      for(let i=0;i<16;i++)
      {
        salt=Salt()
        while(Salts2.includes(salt))
        {
          salt=Salt();
        }  
        Salts2.push(salt)
        values2H[i]=values2[i]+ salt;
        
      }
      //Player1 Tree
      let valuesh=valuesH.map(x=>keccak256(x))
       tree=new MerkleTree(valuesh,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root=tree.getHexRoot()

      //Player2 Tree
      let valuesh2=values2H.map(x=>keccak256(x))
       tree2=new MerkleTree(valuesh2,keccak256,{
          sortLeaves: true,
          sortPairs: true,
        })
      const root2=tree2.getHexRoot()
      
      game1x=await game.storeRoot(id,root,{from: pl1});
      game2x=await game.storeRoot(id,root2,{from: pl2});
      
      truffleAssert.eventEmitted(game2x,"Startshoting",(ev) => {
        result="Shooting Start, Info---> FirstPlayer to Shoot: "+ev.plt;
        console.log(result);
        return  pl1==ev.plt
      });
      
    
    });
    let pos; //poszione colpita
    for(let i=0;i<4;i++)
    {
      it("Shooting by player 1 ", async () => {
        game1x=await game.attack(id,i,{from:pl1})
        truffleAssert.eventEmitted(game1x,"ShotTaken",(ev) => {
          result="Shot Taken info, Posizione colpita: "+ ev.pos +" pl: "+ev.pl;        
          pos=ev.pos
          console.log(result)
          return  ev.pl==accounts[3]
        });
      
      });
      it("Player 2 send the proof ", async () => {
        let res=values2[pos];
        const leaf=keccak256(values2H[pos])
        const proof=tree2.getHexProof(leaf)
        game1x=await game.verify(id,proof,values2H[pos],pos,res,{from:pl2})
        truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
          result="Result of the shot, Posizione colpita: "+ ev.pos +" Result shot: "+ev.resutlShot;
          console.log(result)        
          return  true;
        });
        
      });

      it("Shooting by player 2 ", async () => {
        game1x=await game.attack(id,i,{from:pl2})
        truffleAssert.eventEmitted(game1x,"ShotTaken",(ev) => {
          result="Shot Taken info, Posizione colpita: "+ ev.pos +" pl: "+ev.pl;        
          pos=ev.pos
          console.log(result)
          return  ev.pl==accounts[4]
        });
      
      });
      it("Player 1 send the proof ", async () => {
        let res=values[pos];
        const leaf=keccak256(valuesH[pos])
        const proof=tree.getHexProof(leaf)
        game1x=await game.verify(id,proof,valuesH[pos],pos,res,{from:pl1})
        truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
          result="Result of the shot, Posizione colpita: "+ ev.pos +" Result shot: "+ev.resutlShot;
          console.log(result)        
          return  true;
        });
        
      });
    }
    valuesverify=[];
    it("Player 1 get the position to check ", async () => {
        
      const shotTaken=await game.GetTocheck(id,{from:pl1})
      const array=shotTaken.toString().split(',');
      for(let i=0;i<array.length;i++)
      {
        if(Number(array[i])===1)
        {
          valuesverify.push(valuesH[i])
        }
      }
      return  true;
      });  
      it("Player 1 check the win ", async () => {
      
        const proofLeaves = valuesverify.map(keccak256).sort()
        const proof = tree.getMultiProof(proofLeaves)
        const proofFlags = tree.getProofFlags(proofLeaves, proof)
        verifywin=await game.verifyWin(id,proof,proofFlags,proofLeaves,values,{from: pl1});
        truffleAssert.eventEmitted(verifywin,"Winner",(ev) => {
            console.log("The winner is: "+ ev.win)
            return  true
          });
  
      });
  })
 });

    ///TEST REPORT PLAYER IN THE GAME
    contract("TEST  REPORT --------------------------------------------------------------", ( accounts) => {
      before(async () =>{
        game=await Game.deployed();
      })
      describe("Testing Report btw two player" , () =>{
        let pl1=accounts[3]
        let pl2=accounts[4]

        let pl3=accounts[5]
        let pl4=accounts[6]
        
        let result;
        let id

        let id2
        it("Creating a game ", async () => {
          
          let dim=4;
          let boats=4;
          const gametx=await game.createGame(dim,boats,{ from: pl1 });
          truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
            result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
            console.log(result);
            id=ev.id
            return  ev.pl==accounts[3]
          });
        });
        it("Joining a game ", async () => {
          const gametx=await game.joinGame(id,{ from: pl2 });
          let result;
          truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
            result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
            console.log(result);
            return  ev.pl1==pl1
          });
        });
        it("Bet from player1  ", async () => {
           let Amount=0.1
          const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
          return true;
        });
        it("Create antoher game", async () => {
          
          let dim=4;
          let boats=4;
          const gametx=await game.createGame(dim,boats,{ from: pl3 });
          truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
            result="Game Created info, idGame: "+ ev.id +" pl: "+ev.pl+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
            console.log(result);
            id2=ev.id
            return  ev.pl==accounts[5]
          });
       });
       it("Joining another game", async () => {  
        const gametx=await game.joinGame(id2,{ from: pl4 });
        let result;
        truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
          result="Game Joined, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,dimboard: "+ev.dimboard+" ,boats "+ ev.boats;
          console.log(result);
          return  ev.pl1==pl3
        });
  
      });
      it("Bet from the new player  ", async () => {
        let Amount=1
        const joinx1=await game.proposedBet(id2,{ from: pl3,value:web3.utils.toWei(String(Amount), "ether") });
        const joinx2=await game.proposedBet(id2,{ from: pl4,value:web3.utils.toWei(String(Amount), "ether") });
       truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
         result="Game Start, Info---> pl1: "+ev.pl1+" ,pl2: "+ev.pl2+" ,Amount: "+ev.Amount;
         console.log(result);
         return  true
       });
      
     });
     it("player1 report player2 and win", async () => {
      const rep1=await game.Playerafk(id,{ from: pl1});
      truffleAssert.eventEmitted(rep1,"Winner",(ev) => {
        result="Game Win, the other player is afk, Info---> player winner: "+ev.win;
        console.log(result);
        return  true
      });
    })
       

        
    
  })
});
