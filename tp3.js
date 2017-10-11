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

var bot = new builder.UniversalBot(connector, [
   function (session) {
        session.send("Hello !");
        session.beginDialog('askName');
    },
    function (session, results) {
        session.dialogData.Name = results.response;
        session.beginDialog('askDate');
    },
    function (session, results) {
        session.dialogData.reservationDate = results.response;
        session.beginDialog('askNbPersonnes');
    },
    function (session, results) {
        session.dialogData.askNbPersonnes = results.response;
        session.beginDialog('askResaName');
    },
    function (session, results) {
        session.dialogData.askResaName = results.response;

        session.send(`Bon ${session.dialogData.Name}, voici les détails de ta reservation : <br/>Date de réservation : ${session.dialogData.reservationDate} <br/>Nombre de personnes : ${session.dialogData.askNbPersonnes} <br/>Nom de la réservation : ${session.dialogData.askResaName}`);
        session.endDialog();
    }
]);

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, 'Salut! Quel est ton nom?');
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


bot.dialog('askDate', [
    function (session) {
        builder.Prompts.text(session, "Pour quelle date est ta réservation ?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askNbPersonnes', [
    function (session) {
        builder.Prompts.text(session, "Pour combien de personnes ?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askResaName', [
    function (session) {
        builder.Prompts.text(session, "A quel nom ?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
