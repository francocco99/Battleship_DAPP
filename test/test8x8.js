const Game = artifacts.require("GameRule");
const truffleAssert=require("truffle-assertions")
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256')


function Salt()
{
  const seed = Math.floor(Math.random() * 256);
  return seed;
}



////// TEST 8X8 GAME ///////////////////
contract("Test 8x8 Game ", ( accounts) => {
    before(async () =>{
      game=await Game.deployed();
    })
    describe("Testing a 8X8 game with all failure" , () =>{
        let pl1=accounts[3]
        let pl2=accounts[4]
        values=new Array(64);
        let dim=64;
        let boats=14;
        for(let i=0;i<64;i++)
        {
            if(i<14)
                values[i]=1;
            else
                values[i]=0;
        }
        valuesH=new Array(64);
        
        values2=new Array(64);;
        for(let i=0;i<64;i++)
        {
            if(i<14)
                values2[i]=1;
            else
                values2[i]=0;
        }
        values2H=new Array(64);
        
  
    
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
        it("Joining a game ", async () => {
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
            console.log("GAS USED TO BET BY PLAYER 1-------------->"+ joinx1.receipt.gasUsed+ "\n\n")
            const joinx2=await game.proposedBet(id,{ from: pl2,value:web3.utils.toWei(String(Amount), "ether") });
            console.log("GAS USED TO BET BY PLAYER 2-------------->"+ joinx2.receipt.gasUsed+ "\n\n")
            truffleAssert.eventEmitted(joinx2,"GameStart",(ev) => {
            return true;
            });
        });
        it("Commit the boards ", async() =>{ 
            let salt;
            for(let i=0;i<64;i++)
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
            for(let i=0;i<64;i++)
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
            console.log("GAS USED TO STORE THE ROOT BY PLAYER1-------------->"+ game1x.receipt.gasUsed+ "\n\n")
            game2x=await game.storeRoot(id,root2,{from: pl2});
            console.log("GAS USED TO STORE THE ROOT PLAYER2-------------->"+ game2x.receipt.gasUsed+ "\n\n")
            
            truffleAssert.eventEmitted(game2x,"Startshoting",(ev) => {
            return  pl1==ev.plt
            });
            
        
        });
        let pos; //poszione colpita
        let sum1=0;
        let sum2=0;
       
            /////////////// SHOOTING BY PLAYER 1  ////////////////////
            
        for(let i=14;i<50;i++)
        {
            /////////////// SHOOTING BY PLAYER 1  ////////////////////
            it("Shooting by player 1 ", async () => {
                game1x=await game.attack(id,i,{from:pl1})
                sum1=sum1+game1x.receipt.gasUsed;
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
                sum2=sum2+game1x.receipt.gasUsed;
                truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
                    return  true;
                });
                
            });
            /////////////// SHOOTING BY PLAYER 2  ////////////////////
            it("Shooting by player 2 ", async () => {
                game1x=await game.attack(id,i,{from:pl2})
                sum2=sum2+game1x.receipt.gasUsed;
                truffleAssert.eventEmitted(game1x,"ShotTaken",(ev) => {
                    pos=ev.pos
                    return  ev.pl==accounts[4]
                });
            
            });
            it("Player 1 send the proof ", async () => {
                let res=values[pos];
                const leaf=keccak256(valuesH[pos])
                const proof=tree.getHexProof(leaf)
                game1x=await game.verify(id,proof,valuesH[pos],pos,res,{from:pl1})
                sum1=sum1+game1x.receipt.gasUsed;
                truffleAssert.eventEmitted(game1x,"Resultshot",(ev) => {
                    return  true;
                });  
            });
            
        }
        it("RESULT OF COMPUTATION ", async () => {
            console.log("SUM PLAYER 1 FOR SHOOTING: "+sum1)
            console.log("SUM PLAYER 2 FOR SHOOTING: "+sum2)
        });
       
       
    })
});