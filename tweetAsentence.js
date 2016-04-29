/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session, context,
                function callback(sessionAttributes, speechletResponse) {
                    //context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, context, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("ReadLatestTweet" === intentName) {
        readLatesttweet(intent, session, context,callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Alexa Skills Kit sample. " +
        "Please tell me from whose account you would like to hear the latest tweet. You can say ," + "Please read latest tweet from Alexa.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me from whose account you would like to hear the latest tweet. You can say ," + "Please read latest tweet from Alexa.";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function readLatesttweet(intent, session, context, callback) {
    var cardTitle = intent.name;
    var accountSlot = intent.slots.account;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (accountSlot) {
        var account = accountSlot.value;
        sessionAttributes = setAccountInSession(account);
        repromptText = "You can ask me to read the latest tweet from an account by saying, read latest tweet from account name?";
        tweetFromAccount(account, sessionAttributes, context, cardTitle, repromptText, shouldEndSession);
       
    } else {
        speechOutput = "I'm not sure what account name you said. Please try again";
        repromptText = "You can ask me to read the latest tweet from an account by saying, read latest tweet from account name?";
    }

    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function setAccountInSession(account) {
    return {
        account:account
    };
}

function tweetFromAccount(account, sessionAttributes, context, cardTitle, repromptText, shouldEndSession) {

   

    var twit = require('twitter'),
    twitter = new twit({
        consumer_key:'KMMOwF5pzFxHKT7UJMOwx9aFs',
        consumer_secret:'alQpkGKLYl9rIojBQWuEthxIrSmYvabN1nU1TA8kl7shYqxDRT',
        access_token_key:'22864260-Z5T0E0BPXU2d71HXf6BRhek1ZNcYP5c6lbj3AWfuI',
        access_token_secret:'m3Qit5XWlUkWv3HydHxHfb8MjSZgUDP1EWaxeBer9KeRP'
    });
    //var count = 0;
    var util = require('util');

    params = {
      screen_name: account, // the user id passed in as part of the route
      count: 1 // how many tweets to return
    };

    console.log("Requesting data for account :: " + account);

      twitter.get('statuses/user_timeline', params, function(error, tweets, response){
      if (!error) {
        console.log(tweets[0].text);
         var speechOutput = "Account " + account + " has recently tweeted," +  tweets[0].text;; 
        context.succeed(buildResponse(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession)));
      }else {
        console.log("Error!!");
      }
      });

   
}

function getTweetFromSession(intent, session, callback) {
    var account;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        account = session.attributes.account;
    }

    if (account) {
        speechOutput = "Account " + account + " has recently tweeted," +
            getTweetFromAccount(account) + "Goodbye!";
        shouldEndSession = true;
    } else {
        speechOutput = "I'm not sure what account name you said. Please try again by saying, read latest tweet from account name?";
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}