var express = require('express'),
    mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8081).sockets,
    app = express();
    
mongo.connect('mongodb://127.0.0.1/chat', function(err, db){
	if(err) throw err;
    console.log('db connected'); 
	client.on('connection', function(socket){
        
        var col = db.collection('messages');

        // select all limit 100 sort by id desc
        col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
        	socket.emit('output', res); 
        }); 
        
		socket.on('input', function(data){
		   
		   var name = data.name,
		       message = data.message,
		       whiteSpace = /^\s*?/;
           
           var sendStatus = function(status){
              socket.emit('status', status);
           };

		   if(whiteSpace.test(name)){
		   	console.log(name + ' has white spaces');
		   }    
            
           if(name.length > 0 && message.length > 0){
			   col.insert({name: name, message: message}, function(){
			   		console.log('inserted!!');
			   		sendStatus({
			   			message: 'Message sent',
			   			clear: true
			   		});

			   		client.emit('output', [data]);  // emit data to all clients listening
			   });	
		   }else{
		   	 if(name.length == 0 && message.length == 0){
		   	    sendStatus('Name, Message are Required');
		   	 }
		     else if(name.length == 0 && message.length != 0){
		   	    sendStatus('Name Required');
		   	 }
		   	 else if(name.length != 0 && message.length == 0){
		   	    sendStatus('Message Required');
		   	 }
		   } 
		});

		socket.on('stream', function(image){
			socket.broadcast.emit('stream', image);
		});
    });     

});

app.use(express.static( __dirname + "/public"));

app.get('/', function(req, res){  		// any route go to index
	res.sendFile(__dirname + '/index.html');
});


app.listen(3000, function(err){
	if(err){
      console.log(err);
	}
	else{
      console.log("listening on port 3000");
	}
});