var builder = require('botbuilder');
var restify = require('restify');

// restify server
var server = restify.createServer();
server.listen(process.env.port || 3978, function () {
    console.log(`server name:${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog('displayName');
    }
]);

bot.dialog('displayName', [
    function (session) {
        session.send('Bienvenue');
        session.beginDialog('askName');
    },
    function (session, results) {
        session.userData.userName = results.response;
        session.send(`Bonjour ${session.userData.userName}`);
        session.beginDialog('resa');
    }
]);

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, 'Quel est votre nom ?');
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('resa', [
    function (session) {
        session.beginDialog('resaDate');
    },
    function (session, results) {
        session.beginDialog('resaNbPeople');
    },
    function (session) {
        session.beginDialog('resaName');
    },
    function (session) {
        session.beginDialog('resaTel');
    },
    function (session) {
        var resa = {
            resaDate: session.conversationData.resaDate,
            resaNbPeople: session.conversationData.resaNbPeople,
            resaName: session.conversationData.resaName,
            resaTel: session.conversationData.resaTel,
        }

        resa.resaDate = new Date(Date.parse(resa.resaDate));
        resa.resaDate = resa.resaDate.toISOString().substr(0, 19).replace('T', ' ');

        session.send(`Voici un récapitulatif de votre réservation :<br/>Date de réservation: ${resa.resaDate}<br/>Nombre de personnes : ${resa.resaNbPeople}<br/>Réservation au nom de ${resa.resaName}<br/>Tel : ${resa.resaTel}`);
    }
]);

bot.dialog('resaDate', [
    function (session) {
        builder.Prompts.time(session, "Pour quelle date voulez vous réserver ?");
    },
    function (session, results) {
        session.conversationData.resaDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.endDialog();
    }
]);

bot.dialog('resaNbPeople', [
    function (session) {
        builder.Prompts.number(session, "Pour combien de personnes ?");
    },
    function (session, results) {
        session.conversationData.resaNbPeople = results.response;
        session.endDialog();
    }
]);

bot.dialog('resaName', [
    function (session) {
        builder.Prompts.text(session, "A quel nom ?");
    },
    function (session, results) {
        session.conversationData.resaName = results.response;
        session.endDialog();
    }
]);

bot.dialog('resaTel', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Le numéro doit contenir 10 chiffres et commencer par 01, 06 ou 07");
        } else {
            builder.Prompts.text(session, "Quel est votre numérode téléphone ?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/^(01|06|07)[0-9]{8}$/g);
        if (matched) {
            session.conversationData.resaTel = results.response;
            session.endDialog();
        } else {
            session.replaceDialog('resaTel', { reprompt: true });
        }
    }
]);


var menuItems = {
    "Afficher son prénom": {
        item: "displayName"
    },
    "Réserver": {
        item: "resa"
    }
};

bot.dialog('mainMenu', [
    function (session) {
        builder.Prompts.choice(session, "Menu :", menuItems);
    },
    function (session, results) {
        if (results.response) {
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])
    .triggerAction({
        matches: /^menu$/i,
        confirmPrompt: "Etes vous sur de vouloir annuler ?"
    })
    .reloadAction(
    "restartResa", "Recommencer", {
        matches: /^reload$/i,
        confirmPrompt: "Etes vous sur de vouloir recommencer ?"
    })
    .cancelAction(
    "cancelResa", "Annuler", {
        matches: /^cancel$/i,
        confirmPrompt: "Etes vous sur de vouloir annuler ?"
    });