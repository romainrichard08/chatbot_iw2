var builder = require('botbuilder');
var restify = require('restify');

// restify Server 
var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log(`server name:${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
appId: process.env.APP_ID,
appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){

    // Retourne des informations concernant le bot
    if(session.message.text == "/info") {
	   	session.send(`OK, ça fonctionne !! | [Message.length = ${session.message.text.length}]`);
	    session.send(`DialogSata = ${JSON.stringify(session.dialogData)}`);
	    session.send(`Session = ${JSON.stringify(session.sessionState)}`);
    }

    // Ajoute un temps de réponse pour le bot 
    if(session.message.text == "doheavywork"){
    	for(var i=0; i<=10; i++){
    		session.sendTyping().delay(1000);
    	}
    	session.send("Désolé pour le temps de réponse");
    }

    // Détecte que le bot est en train d'écrire
    bot.on('typing', function(message){
        session.send(`haha, t'es en train d'écrire`);
    });
});

// Affiche un message de bienvenue
bot.on('conversationUpdate', function (message) {

    if (message.membersAdded && message.membersAdded.length > 0) {
        message.membersAdded.forEach(function (user) {
            if (user.id !== "default-bot") {
                var msg = new builder.Message()
                    .address(message.address)
                    .text('Welcome ' + user.name);
                bot.send(msg);
            }
        });
    }

});
