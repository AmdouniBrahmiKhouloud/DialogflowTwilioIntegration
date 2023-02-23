const express = require('express');
const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const { SessionsClient } = require('@google-cloud/dialogflow');

const bodyParser = require('body-parser');
const app = express();// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//try the virtual agent connection
app.get('/twiml', (req, res) => {
    const response = new VoiceResponse();
    response.say('Hello! You will be now be connected to a virtual agent.');
    const connect = response.connect();
    connect.virtualAgent({
        connectorName: 'test',
        statusCallback: '/statusCallback'
    });

    res.type('text/xml');
    console.log(response.toString());
    res.send(response.toString());
});


app.post('/statusCallback', (req, res) => {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;
    const connectorName = req.body.ConnectorName;
    const status = req.body.Status;
    const fulfillmentText = req.body.FulfillmentText;
    console.log(`Call SID: ${callSid}`);
    console.log(`Call Status: ${callStatus}`);
    console.log(`Connector Name: ${connectorName}`);
    console.log(`Status: ${status}`);
    console.log(`fulfillmentText: ${fulfillmentText}`);

    // Create a new TwiML response
    const response = new VoiceResponse();

    // Add a <Say> element to the response with the detected intent
    response.say(`Your fulfillmentText was ${fulfillmentText}`);

    res.type('text/xml');
    res.send(response.toString());
});

//personalized webhook for dialogflow

app.post('/webhook')




/*const dialogflowProjectId = 'twiliobot-fqbn';
const dialogflowSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
const dialogflowSessionClient = new SessionsClient();
const dialogflowSessionPath = dialogflowSessionClient.projectAgentSessionPath(dialogflowProjectId, dialogflowSessionId);

app.post('/twilio/call', (req, res) => {
    const twiml = new VoiceResponse();
    const gather = twiml.gather({
        input: 'dtmf speech',
        action: '/twilio/call/response',
        method: 'POST',
        language: 'en-US',
    });
    gather.say('Hello! Please say or enter your name.');

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/twilio/call/response', async (req, res) => {
    const { queryResult: { fulfillmentText } } = await dialogflowSessionClient.detectIntent({
        session: dialogflowSessionPath,
        queryInput: { text: { text: req.body.SpeechResult || req.body.Digits || '', languageCode: 'en-US' } },
    });

    const twiml = new VoiceResponse();
    if (fulfillmentText) {
        twiml.say(fulfillmentText);
    } else {
        twiml.say('I didn\'t understand what you said.');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});*/


//testing twilml verbs
app.post('/voice', (request, response) => {
    const twiml = new VoiceResponse();
    twiml.say('Hello, welcome to Twilio callbot. How can I help you today?');
    twiml.say('Hello. Please leave a message after the beep.');
    twiml.record();
    twiml.hangup();
    //twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');
    response.type('text/xml');
    response.send(twiml.toString());
});
//Try to test the record verb in twilio
app.post('/call', (req, res) => {
    const response = new VoiceResponse();
    response.record({
        timeout: 10,
        transcribe: true
    });

    console.log(response.toString());
});

//by this api we can change url for webhook on twilio console
app.post('/set-webhook', async (req, res) => {
    try {
        const client = twilio('ACcd9a5e612f8d0ea045115dce3905ca10', '5ef0fec72133c5f8e2741dd8a33db0a1');
        const phoneNumber = await client.incomingPhoneNumbers('PN29645d8dd97d10c317ddde98c26ce3c3')
            .update({ voiceUrl: req.body.url});

        console.log(`Updated webhook for phone number ${phoneNumber.phoneNumber}: ${phoneNumber.voiceUrl}`);
        res.status(200).send(`Updated webhook for phone number ${phoneNumber.phoneNumber}: ${phoneNumber.voiceUrl}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update webhook');
    }
});



app.listen(3000, () => {
    console.log('Server running on port 3000');
});
