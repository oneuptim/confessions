// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require mongoose
var mongoose = require('mongoose');
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request

app.get('/', function(req, res) {
  Post.find({}, false, true).populate('comments').exec(function (err, data) {
    if (err) return handleError(err);
    // console.log('The ', data[0].comments[0].text);
    console.log(data);

    res.render('index',{ confessions:data });
  });

  // console.log(comments);

  // var data = Post.find({}, function(err, data) {
  // res.render('index',{ confessions:data });
  // })



})

// Add Post Request
app.post('/post', function(req, res) {
  console.log("POST DATA", req.body);
  // create a new User with the name and age corresponding to those from req.body
  var post = new Post({name: req.body.name, text: req.body.text});
  console.log(post, "This is the confession that has just been submitted to the database!");
  post.save(function(err) {
    // if there is an error console.log that something went wrong!
    if(err) {
      console.log('Shit! Something went wrong');
    } else { // else console.log that we did well and then redirect to the root route
      console.log('Successfully added confession!');
      res.redirect('/');
    }
  })
})

//  just a sample route.  Post request to update a post.
//  your routes will probably look different.

// app.post("/post/:id", function(req, res){
// 	var message_id = req.params.id;
// 	Post.findOne({_id: message_id}, function(err, message){
// 		var newComment = new Comment({name: req.body.name, text: req.body.comment});
// 		newComment._post = post._id;
// 		Post.update({_id: post._id}, {$push: {"_comments": newComment}}, function(err){
//
// 		});
// 		newComment.save(function(err){
// 			if(err){
// 				console.log(err);
// 				res.render('index.ejs', {errors: newComment.errors});
// 			} else {
// 				console.log("comment added");
// 				res.redirect("/");
// 			}
// 		});
// 	});
// });



app.post('/post/:id', function (req, res){
   Post.findOne({_id: req.params.id}, function(err, post){
       // data from form on the front end
       var comment = new Comment({name: req.body.name, text: req.body.text});

       comment._post = post._id;
       Post.update({_id: post._id}, {$push: {"_comments": comment}}, function(err){
       });

       console.log(comment, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
       //  set the reference like this:
       comment._post = post._id;
       // now save both to the DB
       comment.save(function(err){
               post.comments.push(comment);
               post.save(function(err){
                    if(err) {
                         console.log('Error');
                    } else {
                         res.redirect('/');
                    }
                });
        });
   });
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("Message Board App Listening on port 8000");
})

// Use native promises
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/message_board'); // <== DON'T FORGET TO CHANGE THIS EVERYTIME!!!!!!!!!!!

var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({name: { type: String, required: true}, text: { type: String, required: true }, comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]}, {timestamps: true});

var CommentSchema = new mongoose.Schema({ name: {type: String, required: true}, _post: { type: Schema.Types.ObjectId, ref: 'Post'}, text: {type: String, required: true}}, {timestamp: true});

mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
