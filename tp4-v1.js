var restify = require('restify');
var builder = require('botbuilder');
var cognitivesServices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);


// POST /knowledgebases/59b0ec6e-3d87-47ff-bf24-f25670f28fe3/generateAnswer
// Host: https://westus.api.cognitive.microsoft.com/qnamaker/v2.0
// Ocp-Apim-Subscription-Key: fb531991c09a4428b2a0e633267b5fc1
// Content-Type: application/json
// {"question":"hi"}
var qnaMakerRecognizer = new cognitivesServices.QnAMakerRecognizer({
	knowledgeBaseId: '59b0ec6e-3d87-47ff-bf24-f25670f28fe3', 
	subscriptionKey: 'fb531991c09a4428b2a0e633267b5fc1'
});

var qnaMakerDialog = new cognitivesServices.QnAMakerDialog({
	recognizers: [qnaMakerRecognizer],
	qnaThreshold: 0.4,
	defaultMessage: 'Reformule ta question ou rentre chez ta mere'
});

bot.dialog('/', qnaMakerDialog);