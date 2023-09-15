

App = {

    contracts: {},
    web3Provider: null,             // Web3 provider
    url: 'http://localhost:7545',   // Url for web3
    account: '0x0',                 // current ethereum account
    IdGame: 0,                      //ID of the  current game
    values:[],                      //array of the 0,1 representing the board
    salt:[],                        //salt used for create the MerkleTree 
    valuesSalt:[],                  //salt + values
    Opponent:"",                    // Id of the Opponent
    tree:null,                      // Merkle Tree
    dimboard:0,                     // dimension of the board
    boats:0,                        // number of positions occupy by the boats  
    MapBoats:new Map([[4,[1,1,1,1]],[6,[4,3,2,1]],[8,[5,4,3,2]]]),      //Map the dimension of the board with the lenght of each bot
    init: function() {
        return App.initWeb3();
    },

    /* initialize Web3 */
    initWeb3: function() {
        console.log("Entered")
        
        if(typeof web3 != 'undefined') {
            App.web3Provider = window.ethereum; 
            web3 = new Web3(App.web3Provider);
            try {
                    ethereum.enable().then(async() => {
                        console.log("Battleship connected to Metamask");
                    });
            }
            catch(error) {
                console.log(error);
            }
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(App.url); // <==
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },

    /* Upload the contract's abstractions */
    initContract: function() {

        // Get current account
        web3.eth.getCoinbase(function(err, account) {
            if(err == null) {
                App.account = account;
                $("#accountId").html("Your address: " + account); //Show the address of the player
            }
        });

        // Load content's abstractions
        $.getJSON("GameRule.json").done(function(c) {
            App.contracts["Contract"] = TruffleContract(c);
            App.contracts["Contract"].setProvider(App.web3Provider);

            return App.listenForEvents();
        });
    },

    //Event listener
    listenForEvents: function() {

        App.contracts["Contract"].deployed().then(async (instance) => {
                //Save the information of the game
                instance.GameCreated().on('data', function (event) {
                    if(event.returnValues.pl.toLowerCase()===App.account)
                    {
                        $("#ResultCreate").html("Game Created, The id of the game is: "+event.returnValues.id);
                        App.IdGame=event.returnValues.id;
                        console.log("event, Game Created")
                    }
                });

                instance.GameJoin().on('data', function (event) {
                    //CREATOR OF THE GAME
                    if(event.returnValues.pl1.toLowerCase()===App.account)
                    {
                        $("#Opponent").html("Your Oppents is: "+event.returnValues.pl2.toLowerCase());
                        $("#modulo2").css("visibility", "visible");
                        App.Opponent=event.returnValues.pl2.toLowerCase(); //save the Id of the opponent
                        console.log("event, Game Joined")
                        
                    }
                    //PLAYER WHO JOIN THE GAME
                    if(event.returnValues.pl2.toLowerCase()===App.account)
                    {
                        $("#Opponent").html("Your Oppents is: "+event.returnValues.pl1.toLowerCase());
                        $("#ResultJoin").html("Game "+App.IdGame +" Joined");
                        //save the info of the game
                        App.Opponent=event.returnValues.pl1.toLowerCase();
                        App.id=event.returnValues.id;
                        App.dimboard=Math.sqrt(Number(event.returnValues.dimboard))
                        App.boats=event.returnValues.boats;
                        $("#modulo2").css("visibility", "visible");
                        console.log("event, Game Joined")
                    }
                    
                });
                //player join a random game
                instance.GamerndJoin().on('data', function (event) {
                     //CREATOR OF THE GAME
                    if(event.returnValues.pl1.toLowerCase()===App.account)
                    {
                        $("#Opponent").html("Your Oppents is: "+event.returnValues.pl2.toLowerCase());
                        App.Opponent=event.returnValues.pl2.toLowerCase(); //SAve namo of the opponet
                        $("#modulo2").css("visibility", "visible");
                        console.log("event, Game Joined Random")
                    }
                    //PLAYER WHO JOIN THE GAME
                    if(event.returnValues.pl2.toLowerCase()===App.account)
                    {
                        $("#Opponent").html("Your Oppents is: "+event.returnValues.pl1.toLowerCase());
                        App.IdGame=event.returnValues.Id;
                        $("#ResultJoin").html("Game "+App.IdGame +" Joined");
                        //save various info of the game
                        App.Opponent=event.returnValues.pl1.toLowerCase();
                        
                        App.dimboard=Math.sqrt(Number(event.returnValues.dimboard));
                        App.boats=event.returnValues.boats;
                        $("#modulo2").css("visibility", "visible");
                        console.log("event, Game Joined Random")
                    }
                    
                });
                //The Game start, both player have written the same amount
                instance.GameStart().on('data', function (event) {
                    if(event.returnValues.pl1.toLowerCase() === App.account || event.returnValues.pl2.toLowerCase() ===App.account )
                    {
                        //SHOW THE INFO OF THE GAME
                        $("#pAmnt").css("visibility", "hidden")
                        $("#RepAmm").css("visibility","hidden")
                        $("#ResultBetting").html("Game is started, agreement reached");
                        $("#player1").html("Player1: "+event.returnValues.pl1);
                        $("#player2").html("Player2: "+event.returnValues.pl2);
                        $("#Amount2").html("Amount (ETH): "+event.returnValues.Amount);
                        $("#pBoard1").css("visibility", "visible");
                        $("#pBoard2").css("visibility", "visible");
                        $("#player1").css("visibility", "visible");
                        $("#player2").css("visibility", "visible");
                        $("#Amount2").css("visibility", "visible");  
                        $("#modulo3").css("visibility", "visible");
                        $("#legend").css("visibility", "visible");
                        
                        //generate the form for insert the boats
                        App.CreateForm();
                        //show the board
                        App.CreateCells('table1'); 
                        App.CreateCells('table2');
                    }                 
               });
               
               // Joining by Id, but the game is full
               instance.GameFull().on('data', function (event) {
                if(event.returnValues.pl.toLowerCase()===App.account)
                {
                    $("#Opponent").html("The game is full");
                }
               });
               // The amount insert differ
               instance.NotEqualAmnt().on('data', function (event) {
                if(event.returnValues.pl1.toLowerCase() === App.account || event.returnValues.pl2.toLowerCase() ===App.account )
                {
                    $("#ResultBetting").html("agreement not reached");        
                    $("#pAmnt").html(" ")
                    $("#RepAmm").css("visibility","hidden")
                }  
                });

                //both player have commited the board start the second phase
                instance.Startshoting().on('data', function (event) {
                   
                    if(event.returnValues.plt.toLowerCase()===App.account)
                    {
                        $("#moduloShot").css("visibility", "visible");
                        $("#RepComm").css("visibility","hidden")
                        console.log("Startshoting")
                    }
                    else if(event.returnValues.plt.toLowerCase()===App.Opponent)
                    {   
                        $("#RepComm").css("visibility","hidden");
                        $("#ReportAFK").css("visibility","visible");
                    }
                
                });
                //the opponent see the position of the shot + THE PLAYER SEND THE PROOF
                instance.ShotTaken().on('data', function (event) {
                    if(event.returnValues.pl.toLowerCase()===App.Opponent)
                    {
                       
                        let p=Number(event.returnValues.pos);
                        let result=App.values[p];
                       
                        if(result==1)
                        {
                            $('#table1 td').eq(p).css('background','green');
                            $('#table1 td').eq(p).css("color","green");
                            
                        }
                        else
                        {
                            $('#table1 td').eq(p).addClass('cellred');
                            $('#table1 td').eq(p).css("color","red");
                            
                        }
                        // PLAYER CREATE AND SEND THE PROOF OF THE RESULT
                        const leaf=keccak256(App.valuesSalt[p])
                        const proof=App.tree.getHexProof(leaf)
                       
                        App.contracts["Contract"].deployed().then(async(instance) =>{
                            await instance.verify(App.IdGame,proof,App.valuesSalt[p],p,result,{from: App.account});
                        });
                        $('#ShotP').html(" ");
                        $("#moduloShot").css("visibility", "visible");
                        $("#resForm").html(' ')
                        $("#ReportAFK").css("visibility", "hidden");

                    }  
                 });
                 // THE PLAYER SEE THE RESUTL OF HIS SHOT
                instance.Resultshot().on('data', function (event) {
                    
                    if(App.account==event.returnValues.opp.toLowerCase())
                    {
                        
                        let pos=event.returnValues.pos;
                        let Resultshot=event.returnValues.resutlShot;
                        if(Resultshot==1)
                        {
                            $('#table2 td').eq(pos).addClass('cellgreen');
                            $('#table2 td').eq(pos).css("color","green");
                            $('#ShotP').html("Boat hit");
                        }
                        else
                        {
                            $('#table2 td').eq(pos).addClass('cellred');
                            $('#table2 td').eq(pos).css("color","red");
                            $('#ShotP').html("Boat missed");
                        }
                        $("#ReportAFK").css("visibility", "visible");
                    }
               
                });
                // THE PLAYER CAN WIN, CAN INVOKE THE FUNCTION verifywin()
                instance.CheckWinner().on('data', function (event){
                    if(App.account==event.returnValues.win.toLowerCase())
                    {
                        $("#table2").css("visibility","hidden");
                        $("#btcheck").css("visibility","visible");
                        $("#ReportAFK").css("visibility", "hidden");
                        $("#moduloShot").css("visibility", "hidden");
                        
                    }
                    else if(App.Opponent==event.returnValues.win.toLowerCase())
                    {
                        $("#moduloShot").css("visibility", "hidden");
                    }
                   
                });
                //The player win the game
                instance.Winner().on('data', function (event){
                    if(App.account==event.returnValues.win.toLowerCase())
                    {
                        $('#ShotP').html(" ");
                        $("#legend").css("visibility","hidden");
                        $("#table2").css("visibility","hidden");
                        $("#winlose").html("Congratulation :) "+ App.account + " you won!");
                        
                    }
                    else if(App.Opponent==event.returnValues.win.toLowerCase())
                    {
                        $('#ShotP').html(" ");
                        $("#legend").css("visibility","hidden");
                        $("#table2").css("visibility","hidden");
                        $("#winlose").html("Sorry :( "+ App.account + " you lose!");
                    }
                    
                });
               
        });

        
    },
    
    // create the Game
    CreateGame: function() {
        if(App.IdGame!=0)
        {
            $("#ResultCreate").html("You are already inside in the  game: " + App.IdGame);
            return;
        }
        let dimboard=document.modulocreate.dim.value;
        let boats;
        if(dimboard==4)
        {
            boats=4;
        }
        else if(dimboard==8)
        {
            boats=14;
        }
        else
        {
            boats=10;
        }
       
        let realdim=dimboard*dimboard; //send the real dim 4x4, 6x6,8x8
        App.contracts["Contract"].deployed().then(async(instance) =>{
        
            await instance.createGame(realdim,boats,{from: App.account});
            App.boats=boats;
            App.dimboard=dimboard;
        });
    }, 
    //FUNCTION TO JOIN THE GAME
    JoinGame: function(){
        const  Id=document.modulo.IdGame.value;
        if(App.IdGame!=0)
        {
            $("#ResultJoin").html("You are already inside in the  game: " + App.IdGame);
            return;
        }
        if(isNaN(Id))
        {
            console.log(Id)
            $("#Opponent").html("The Id of the game is not correct");
            console.log("Id game not correct")
            return;
        }
        
        App.contracts["Contract"].deployed().then(async(instance) =>{
            try{
                await instance.joinGame(Id,{from: App.account});
                App.IdGame=Id;
            }
            catch(error)
            {
                console.log(error.message)
                $("#Opponent").html("The Game not exsits");
            }
            
        });
        
    },
    JoinrndGame: function(){
        if(App.IdGame!=0)
        {
            $("#ResultJoin").html("You are already inside in the  game: " + App.IdGame);
            return;
        }
        App.contracts["Contract"].deployed().then(async(instance) =>{
            try
            {
                await instance.joinrndGame({from: App.account});
            }
            catch
            {
                $("#ResultJoin").html("No Game Avaiable");
            }
            
        });
    },

    GameBet: function(){
        
        let Amount=document.modulo2.Amount.value;
            App.contracts["Contract"].deployed().then(async(instance) =>{
            try
            {
                await instance.proposedBet(App.IdGame,{from: App.account,value:web3.utils.toWei(Amount, "ether")});
                $("#pAmnt").html('Waiting the other Player...')
                $("#RepAmm").css('visibility','visible')
            }
            catch(error)
            {   
                $("#pAmnt").html('You have already commited the amount');
                $("#pAmnt").css("visibility", "visible")
            }
        });
        
    },
    //Commit the root of merkle tree and create the cells. 
    CommitBoard: function()
    {
        if(App.tree!=null)
        {
            console.log("Board already commited");
            $("#resForm").html('You have already commited the board')
            return;
        }
        const map1 = new Map();
    
        map1.set('a', 0);
        map1.set('b', 1);
        map1.set('c', 2);
        map1.set('d', 3);
        map1.set('e', 4);
        map1.set('f', 5);
        map1.set('g', 6);
        map1.set('h', 7);
       
        
        B5I= document.modulo3.pos1.value;
        B5O=document.modulo3.or1.value;

        B4I=document.modulo3.pos2.value;
        B4O=document.modulo3.or2.value;

        B3I=document.modulo3.pos3.value;
        B3O=document.modulo3.or3.value;

        B2I=document.modulo3.pos4.value;
        B2O=document.modulo3.or4.value;

        let Br5 = B5I.substring(0,1).toLowerCase();
        let Bc5 = B5I.substring(2,3);

        let Br4 = B4I.substring(0,1).toLowerCase();
        let Bc4 = B4I.substring(2,3);

        let Br3 = B3I.substring(0,1).toLowerCase();
        let Bc3 = B3I.substring(2,3);

        let Br2 = B2I.substring(0,1).toLowerCase();
        let Bc2 = B2I.substring(2,3);


        //////////////////////////////// Various checks on the initial position of the boats ////////////
        
        if(B5I.length!=3 || B4I.length!=3 || B3I.length!=3 || B2I.length!=3)
        {
            $("#resForm").html('Error Wrong Position')
            return
        }

        
        if(App.dimboard==4)
        {
            if(!(/^[a-d]$/i.test(Br5) && /^[a-d]$/i.test(Br4) && /^[a-d]$/i.test(Br3) && /^[a-d]$/i.test(Br2)))
            {
                $("#resForm").html('Error Wrong Position')
                return;
            }
            if(!(/^[1-4]$/i.test(Bc5) && /^[1-4]$/i.test(Bc4) && /^[1-4]$/i.test(Bc3) && /^[1-4]$/i.test(Bc2)))
            {
                console.log('wrong number')
                $("#resForm").html('Error Wrong Position')
                return
            }
            //starting postion different
            if((Br5==Br4 && Bc5==Bc4) || (Br5==Br3 && Bc5==Bc3) || (Br5==Br2 && Bc5==Bc2) || (Br4==Br3 && Bc4==Bc3) || (Br4==Br2 && Bc4==Bc2) || (Br3==Br2 && Bc3==Bc2) )
            {
                $("#resForm").html('Error Equal Starting Position')
                return;
            }

        }
        // if dimboardd is euqal to 6
        else if(App.dimboard==6)
        {
            if(!(/^[a-f]$/i.test(Br5) && /^[a-f]$/i.test(Br4) && /^[a-f]$/i.test(Br3) && /^[a-f]$/i.test(Br2)))
            {
                $("#resForm").html('Error Wrong Position')
                return;
            }
            if(!(/^[1-6]$/i.test(Bc5) && /^[1-6]$/i.test(Bc4) && /^[1-6]$/i.test(Bc3) && /^[1-6]$/i.test(Bc2)))
            {
                
                $("#resForm").html('Error Wrong Position')
                return
            }
            //starting postion different
            if((Br5==Br4 && Bc5==Bc4) || (Br5==Br3 && Bc5==Bc3) || (Br5==Br2 && Bc5==Bc2) || (Br4==Br3 && Bc4==Br4) || (Br4==Br2 && Bc4==Bc2) || (Br3==Br2 && Bc3==Bc2) )
            {
                $("#resForm").html('Error Equal Starting Position')
                console.log("ERROR")
                return;
            }

            //check with orientation
            if(B3O=='ozz')
            {
                if(Bc3==6)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WORNG POSITION")
                    return;
                }
            }
            if(B4O=='ozz')
            {
                if(Bc4==5 || Bc4==6)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WORNG POSITION")
                    return;
                }
            }
            if(B5O=='ozz')
            {
                if(Bc5==4 || Bc5==5 || Bc5 == 6)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG STARTING POSITION")
                    return;
                }
            }

            //check ver
            if(B3O=='ver')
            {
                if(Br3=='f')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG STARTING POSITION")
                    return;
                }
            }
            if(B4O=='ver')
            {
                if(Br4=='f' || Br4=='e')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG STARTING POSITION")
                    return;
                }
            }
            if(B5O=='ver')
            {
                if(Br5=='d' || Br5=='e' || Br5=='f')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG STARTING POSITION")
                    return;
                }
            }
            

        }
        // if dimboardd is euqal to 8
        else if(App.dimboard==8)
        {
            if(!(/^[a-h]$/i.test(Br5) && /^[a-h]$/i.test(Br4) && /^[a-h]$/i.test(Br3) && /^[a-h]$/i.test(Br2)))
            {
                $("#resForm").html('Error Wrong Position')
                return;
            }
            if(!(/^[1-8]$/i.test(Bc5) && /^[1-8]$/i.test(Bc4) && /^[1-8]$/i.test(Bc3) && /^[1-8]$/i.test(Bc2)))
            {
                console.log('wrong numberrrr')
                $("#resForm").html('Error Wrong Position')
                return
            }
            //starting postion different
            if((Br5==Br4 && Bc5==Bc4) || (Br5==Br3 && Bc5==Bc3) || (Br5==Br2 && Bc5==Bc2) || (Br4==Br3 && Bc4==Br4) || (Br4==Br2 && Bc4==Bc2) || (Br3==Br2 && Bc3==Bc2) )
            {
                $("#resForm").html('Error Equal Starting Position')
                console.log("ERROR")
                return;
            }

            //check with orientation
            if(B2O=='ozz')
            {
                if(Bc2==8)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B3O=='ozz')
            {
                if(Bc3==8 || Bc3==7)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B4O=='ozz')
            {
                if(Bc4==6 || Bc4==7 || Bc4==8) 
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B5O=='ozz')
            {
                if(Bc5==5 ||Bc5==6 || Bc5==7 || Bc5==8)
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }

            //check ver
            if(B2O=='ver')
            {
                if(Br2=='h')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B3O=='ver')
            {
                if( Br3=='g' || Br3=='h')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B4O=='ver')
            {
                if( Br4=='f' ||Br4=='g' || Br4=='h')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            if(B5O=='ver')
            {
                if(  Br5 =='e' ||Br5 =='f' ||Br5 =='g' || Br5 =='h')
                {
                    $("#resForm").html('Error, Wrong Starting Position')
                    console.log("WRONG  STARTING POSITION")
                    return;
                }
            }
            
        }

        //////////////////////////////////// Display the position in the baord  ////////
            
    
        let i=0;
        let  sum=0;
        let boat=App.MapBoats.get(Number(App.dimboard))
        if(B5O==="ozz")
        {
            sum=Number((App.dimboard*map1.get(Br5)))+Number(Bc5)-1;

            $('#table1 td').eq(sum).html('1');
            while(i<boat[0]) {
                $('#table1 td').eq(sum+i).html('1');
                i++;
            }
        }
        else
        {
            i=1;
            var dataTable = $("#table1");
            var rN=map1.get(Br5);
            var cN=Number(Bc5);
            while(i<boat[0]+1) {   
                dataTable[0].rows[rN+i].cells[cN].innerHTML = '1';
                i++
            }
        }

        if(B4O==="ozz")
        {
             sum=Number((App.dimboard*map1.get(Br4)))+Number(Bc4)-1;
            i=0;
            $('#table1 td').eq(sum).html('1');
            while(i<boat[1]) {
                $('#table1 td').eq(sum+i).html('1');
                i++;
                }    
        }
        else
        {
            i=1;
            var dataTable = $("#table1");
            var rN=map1.get(Br4);
            var cN=Number(Bc4);
            while(i<boat[1]+1) {   
                dataTable[0].rows[rN+i].cells[cN].innerHTML = '1';
                i++
            }
        }
        if(B3O==="ozz")
        {
            sum=Number((App.dimboard*map1.get(Br3)))+Number(Bc3)-1;
            i=0;
            $('#table1 td').eq(sum).html('1');
            while(i<boat[2]) {
                console.log(sum)
                $('#table1 td').eq(sum+i).html('1');
                i++;
            }
        }
        else
        {
            i=1;
            var dataTable = $("#table1");
            var rN=map1.get(Br3);
            var cN=Number(Bc3);
            while(i<boat[2]+1) {   
                dataTable[0].rows[rN+i].cells[cN].innerHTML = '1';
                i++
            }
        }
        if(B2O==="ozz")
        {
            sum=Number((App.dimboard*map1.get(Br2)))+Number(Bc2)-1;
            i=0;
            $('#table1 td').eq(sum).html('1');
            while(i<boat[3]) {
                console.log(sum)
                $('#table1 td').eq(sum+i).html('1');
                i++;
            }
        }
        else
        {
            i=1;
            var dataTable = $("#table1");
            var rN=map1.get(Br2);
            var cN=Number(Bc2);
            while(i<boat[3]+1) {   
                dataTable[0].rows[rN+i].cells[cN].innerHTML = '1';
                i++
            }
        }

        
        $("#table1 td:contains('1')").css("color","blue");
        
        // Crete the various array and the Merkle Tree
        let values=[];
        let valuesh=[];
        let Salt=[];
        let valuesSalt=[];
        i=0;
        Nof_one=0
        //CREATE THE GRID 
        $("#table1 tr").each(function(){
            $(this).find('td').each(function(){
                if(Number($(this).html())==1)
                {
                    Nof_one++;
                }
                salt=App.rndSalt();
                while(Salt.includes(salt))
                {
                    salt=App.rndSalt();
                }
                Salt.push(Number(salt));
                values.push(Number($(this).html()));
                valuesSalt.push(Number($(this).html())+salt);
                i++;
                
            })
        })
        let bsum=0;
        boat.forEach((element) => bsum=bsum+element );
        
        if(Nof_one!=bsum) //Check that the boats don't intersect
        {
            $("#resForm").html(' The Board is not Commited, The positions of the boats intersect.')
            $("#table1 tr").each(function(){
                $(this).find('td').each(function(){ 
                    $(this).html('0').css('color','white');
                    
                })
                
            });
            $("#table1 td:contains('0')").addClass('whitecell');
           
            return;
        }
        $("#table1 td:contains('1')").css('background','blue');
        App.valuesSalt=valuesSalt;
        App.salt=Salt;
        App.values=values;


        //CREATION OF THE  MERKLETREE AND STORING OF THE ROOT IN THE SMART CONTRACT
        valuesh=valuesSalt.map(x=>keccak256(x))
        const tree=new MerkleTree(valuesh,keccak256,{
            sortLeaves: true,
            sortPairs: true,
          })
        const root=tree.getHexRoot()
        App.tree=tree;
        App.contracts["Contract"].deployed().then(async(instance) =>{
            try
            {
                await instance.storeRoot(App.IdGame,root,{from: App.account});
                $("#resForm").html('Board Commited, Good Starting Position')
                $("#RepComm").css("visibility","visible")
            }
            catch(error)
            {
                $("#resForm").html('You have already commited the board')
               
            }
        });
        

    },
    //Report Afk player
    ReportAFK: function()
    {
        App.contracts["Contract"].deployed().then(async(instance) =>{
            try
            {
                await instance.Playerafk(App.IdGame,{from: App.account});
            }
            catch(error)
            {
                alert("The Player "+ App.Opponent +" is  not Offline")
                return;
            }
            
        });
    },

    /// use Only wen the player can win, so he sand at the smart contract the entire table and the last cell to check
    verifyMulti: function()
    {
        
        let valuesverify=[];
        App.contracts["Contract"].deployed().then(async(instance) =>{
        try {
            const list=await instance.GetTocheck(App.IdGame,{from: App.account});
            const array=list.toString().split(',');
            for(let i=0;i<array.length;i++)
            {
                if(Number(array[i])===1)
                {
                    valuesverify.push(App.valuesSalt[i])
                }
            }
        } catch (error) {
            console.log(error)
        }
        try {
            
            const proofLeaves = valuesverify.map(keccak256).sort()
            const proof = App.tree.getMultiProof(proofLeaves)
            const proofFlags = App.tree.getProofFlags(proofLeaves, proof)
        
            await instance.verifyWin(App.IdGame,proof,proofFlags,proofLeaves,App.values,{from: App.account});
        } catch (error) {
            console.log(error)
        }       
         });
       
        
 

    },
    /// generate the  table
    CreateCells: function(table)
    {
        const map1 = new Map();
        const boardSize=App.dimboard;
        map1.set(1,'A');
        map1.set(2,'B');
        map1.set(3,'C');
        map1.set(4,'D');
        map1.set(5,'E');
        map1.set(6,'F');
        map1.set(7,'G');
        map1.set(8,'H');
      
       
        const board = $("#"+table);
        const row = $("<tr></tr>");
        let element='<th></th>';
       
        for(let i=0;i<boardSize;i++)
        {  
            element=element+'<th>'+Number(i+1)+'</th>';
        }
        row.append(element);
        board.append(row);
        for (let i = 0; i < boardSize; i++) {
          const row = $("<tr ></tr>")
          j=i+1;
          const elem=$("<th>"+map1.get(j)+"</th>");
          row.append(elem);
          for (let j = 0; j < boardSize; j++) {
            const cell = $("<td>0</td>").css("color","white");
            row.append(cell);
          }
          board.append(row);
        }
        board.addClass()
    },
    //Generate the form for entering ship coordinates
    CreateForm: function()
    {
      
        let boat=App.MapBoats.get(Number(App.dimboard))
      
        for(let i=0;i<4;i++)
        {
            $('#modulo3').append("<p>Nave 1x"+boat[i]+"</p>")
            $('#modulo3').append(" <label for='Orient'>Initial Postition</label> <input type='text' id='pos"+Number(i+1)+"'  placeholder='EX:a,1...'>");
            $('#modulo3').append(" <label for='Orient'>Orientation:</label> <select  id='or"+Number(i+1)+"'><option value='ver'>Vertical ⇓</option><option value='ozz'>Horizontal ⇒</option></select>");
            
        }   
        $("#modulo3").append("<br><br> <input type='button'  class='button button2' value='Commit the Board' onclick='App.CommitBoard()'></input>");
        $("#modulo3").append("<br><br> <p id='resForm'  style='font-weight: bold; font-size: 20px;'></p>");
    },
    // call sthe function attack() of the smart contract
    Shoot: function()
    {
        const map = new Map();
    
        map.set('a', 0);
        map.set('b', 1);
        map.set('c', 2);
        map.set('d', 3);
        map.set('e', 4);
        map.set('f', 5);
        map.set('g', 6);
        map.set('h', 7);
        
        /// check the position in correct ////////////////////////////////////////
        const idx=document.moduloShot.TextShoot.value;
        if(idx.length!=3)
        {
            $("#Shotre").html('Error: Wrong Position')
            return
        }
        
        let rw = idx.substring(0,1).toLowerCase();
        let cl = idx.substring(2,3);
        //// check that the position is right
        if(App.dimboard==4)
        {
            if(!(/^[a-d]$/i.test(rw) && /^[1-4]$/i.test(cl)))
            {
                console.log('Wrong Position');
                $("#Shotre").html('Error: Wrong Position')
                return;
            }
        }
        else if(App.dimboard==6)
        {
            if(!(/^[a-f]$/i.test(rw) &&  /^[1-6]$/i.test(cl)))
            {
                console.log('Wrong Position');
                $("#Shotre").html('Error: Wrong Position')
                return;
            }
        }
        else if(App.dimboard==8)
        {
            if(!(/^[a-h]$/i.test(rw) &&  /^[1-8]$/i.test(cl)))
            {
                console.log('Wrong Position');
                $("#Shotre").html('Error: Wrong Position')
                return;
            }
        }
        ////////////////////////////////////////
        
        sum=Number((App.dimboard*map.get(rw)))+Number(cl)-1;
        console.log(sum+App.IdGame)
        
        App.contracts["Contract"].deployed().then(async(instance) =>{
            try {
                await instance.attack(App.IdGame,sum,{from: App.account});
                $("#moduloShot").css("visibility", "hidden");
                $("#Shotre").html(" ");
            } catch (error) {
                console.log(error.message);
                $("#Shotre").html('Error: Position Already Shot')
                return;
            }
            
        });
        
        
    },
    // genrate random salt used to commit the board
    rndSalt: function()
    {
        const seed = Math.floor(Math.random() * 256);
        return seed;
    }
}
// Call init whenever the window loads
window.addEventListener('load',
function(){
    App.init();
}
);
