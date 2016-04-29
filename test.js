var tweet;

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
      screen_name:'razorfish' , // the user id passed in as part of the route
      count: 1 // how many tweets to return
    };

//    console.log("Requesting data for account :: " + account);

    // request data 
    twitter.get('https://api.twitter.com/1.1/statuses/user_timeline.json', params, function (data) {
        console.log("Hi");
        console.log("Hi");
      console.log(util.inspect(data));

    });
    
    twitter.get('statuses/user_timeline', params, function(error, tweets, response){
  if (!error) {
    console.log(tweets[0].text);
  }});
