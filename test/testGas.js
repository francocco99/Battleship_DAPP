const Game = artifacts.require("GameRule");
const truffleAssert=require("truffle-assertions")
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256')


function Salt()
{
  const seed = Math.floor(Math.random() * 256);
  return seed;
}

/////// TESTING  COMMIT THE BOARDS + TEST SHOOTS ////
contract("GAS test ", ( accounts) => {
  before(async () =>{
    game=await Game.deployed();
  })
  describe("Testing the amount gas used for each phase of the game" , () =>{
    let pl1=accounts[3]
    let pl2=accounts[4]
    values2H=[]
    valuesH=[]

    values=[1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0];
    values2=[1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0];
    
    let dim=16;
    let boats=4; 

 

    let tree;
    let tree2;
    Salts=[]
    Salts2=[]
    let result;
    let id
    it("Creating a game ", async () => {
      const gametx=await game.createGame(dim,boats,{ from: pl1 });
         console.log("GAS USED TO CREATE THE GAME-------------->"+ gametx.receipt.gasUsed+ "\n\n")
      truffleAssert.eventEmitted(gametx,"GameCreated",(ev) => {
        id=ev.id
        return  ev.pl==accounts[3]
      });
    });
    it("Joining a game with Id ", async () => {
      const gametx=await game.joinGame(id,{ from: pl2 });
        console.log("GAS USED TO JOIN THE GAME-------------->"+ gametx.receipt.gasUsed+ "\n\n")
      let result;
      truffleAssert.eventEmitted(gametx,"GameJoin",(ev) => {
        return  ev.pl1==pl1
      });
    });
    it("Bet from players ", async () => {
       let Amount=1
      const joinx1=await game.proposedBet(id,{ from: pl1,value:web3.utils.toWei(String(Amount), "ether") });
        console.log("GAS USED TO BET FIRST PLAYER-------------->"+ joinx1.receipt.gasUsed+ "\n\n")
      const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
        console.log("GAS USED TO BET SECOND PLAYER-------------->"+ joinx2.receipt.gasUsed+ "\n\n")
      truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
        return true;
      });
    });
    it("Commit the boards ", async() =>{ 
      let salt;
      for(let i=0;i<values.length;i++)
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
      for(let i=0;i<values.length;i++)
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
        console.log("GAS USED TO STORE THE ROOT BY FIRST PLAYER-------------->"+ game1x.receipt.gasUsed+ "\n\n")
      game2x=await game.storeRoot(id,root2,{from: pl2});
        console.log("GAS USED TO STORE THE ROOT BY SECOND PLAYER-------------->"+ game2x.receipt.gasUsed+ "\n\n")
      
      truffleAssert.eventEmitted(game2x,"Startshoting",(ev) => {
        return  pl1==ev.plt
      });
      
    
    });
    let pos; //poszione colpita
    it("Shooting by palyer 1 ", async () => {
        game1x=await game.attack(id,3,{from:pl1})
        console.log("GAS USED TO SHOOT -------------->"+ game1x.receipt.gasUsed+ "\n\n")
        truffleAssert.eventEmitted(game1x,"ShotTaken",(ev) => {
            pos=ev.pos
            return  ev.pl==accounts[3]
      });
     
    });
    it("Player 2 send the proof ", async () => {
      
        let res=values2[pos];
        const leaf=keccak256(values2H[pos])
        const proof=tree2.getHexProof(leaf)
        game1x=await game.verify(id,proof,values2H[pos],pos,res,{from:pl2})
        console.log("GAS USED TO CHECK THE PROOF -------------->"+ game1x.receipt.gasUsed+ "\n\n")
        truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
            return  true;
        }); 
        return true;
      
    });
    valuesverify=[]
    it("Player 2 get the position to check ", async () => {
        
        const shotTaken=await game.GetTocheck(id,{from:pl2})
        const array=shotTaken.toString().split(',');
            for(let i=0;i<array.length;i++)
            {
                if(Number(array[i])===1)
                {
                    valuesverify.push(values2H[i])
                }
            }
            return  true;
        });  
        it("Player 2 check the win ", async () => {
        
          const proofLeaves = valuesverify.map(keccak256).sort()
          const proof = tree2.getMultiProof(proofLeaves)
          const proofFlags = tree2.getProofFlags(proofLeaves, proof)
          verifywin2=await game.verifyWin(id,proof,proofFlags,proofLeaves,values2,{from: pl2});
          console.log("GAS USED TO CHECK THE WIN -------------->"+ verifywin2.receipt.gasUsed+ "\n\n")
          truffleAssert.eventEmitted(verifywin2,"Winner",(ev) => {
              return  true
            });
    
        }); 
       
        
    });
    
    
  })



