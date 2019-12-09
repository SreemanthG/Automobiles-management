
var htmltext1 = [];
var express=require("express");
var bodyParser=require("body-parser");
var  mime = require('mime-types');
mime.lookup('Ford main/vendor/bootstrap/css/bootstrap-grid.css');
var mongo  = require('mongodb');
var Product = require("./models/product");
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ford');
var db=mongoose.connection;
var ObjectID = require('mongodb').ObjectID;
   var flash = require('connect-flash');
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
console .log(__dirname);
    console.log("connection succeeded");
});

var session=require('express-session');
var status = false;
var qrcode = false;

// db.collection('dealer').find({"email":"sree@123"}).toArray(function(err, collection){
//         if (err) throw err;
//             console.log(collection.find({"email":"sree@123"}));
//
//     });
var app=express();
app.set('view engine','ejs');
app.use('/css',express.static('css'));
app.use(flash())
// app.use('/login/css',express.static('css'));
app.use(express.static(__dirname +'/public'));
// app.use('/vendor/mdi-font/css/material-design-iconic-font.css', express.static('files'))
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
var userid;
var pass;
var subject;
var uid;
// var email;
app.use(session({secret:'app',cookie:{maxAge:14 * 24 * 3600 * 1000}}));
 app.use(flash());
var checkUser=function(req,res,next){
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/');
  }
};


function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page <a href = "/">Login</a> ');
  } else {
    next();

  }
}

// function checkRes(req, res, next) {
//   if (!req.session.user_id) {
//     req.session.redirectTo = '/';
//         res.redirect('/');
//   } else {
//     next();
//
//   }
// }
app.get('/logout', function (req, res) {
  delete req.session.user_id;
  status = false;
  res.redirect('/login');
});

// app.post()
app.post('/formfilled', function(req,res){
    var fname = req.body.su_first_name;
    var lname = req.body.su_last_name;
    var email =req.body.su_email;
    var pass = req.body.su_password;
    var city =req.body.su_city;
    var state = req.body.su_state;
    var pincode = req.body.su_pin_code;
    var country = req.body.su_country;
    var company = req.body.su_company;
    var areacode = req.body.su_area_code;
    var subject = req.body.su_subject;
    var phone = req.body.su_phone;
    // var lat = req.script.lat;
    // var lng = req.script.log;

    var data = {
        "fname": fname,
        "lname": lname,
        "email":email,
        "password":pass,
        "city": city,
        "state": state,
        "pincode": pincode,
        "country": country,
        "company": company,
        "areacode": areacode,
        "subject": subject,
        "phone":phone
        // "lat": lat,
        // "lng": lng

    };

if(subject == "Dealer"){

  db.collection('dealer').find({"email": email}).toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);

            return res.redirect("/login");
              // res.send(500,'Credentials already exist');
            }
            else{
            console.log("Dealer");
            db.collection('dealer').insertOne(data,function(err, collection){
                    if (err) throw err;
                    console.log("Record inserted Successfully");

                });

                return res.redirect('/login');
              }
      });

}
else if (subject == "Distrubution Center") {

  db.collection('distrubution').find({"email": email}).toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);

            return res.redirect("/login");
              // res.send(500,'Credentials already exist');
            }
            else{
              console.log("Distrubution Center");
              db.collection('distrubution').insertOne(data,function(err, collection){
                      if (err) throw err;
                      console.log("Record inserted Successfully");

                  });

                return res.redirect('/login');
              }
            });

      //
      // return res.redirect('/login');
}
else if(subject == "Customer"){
  console.log("Customer");
  db.collection('customer').insertOne(data,function(err, collection){
          if (err) throw err;
          console.log("Record inserted Successfully");

      });

      return res.redirect('/login');
}
// db.collection('dbmsford').insertOne(data,function(err, collection){
//         if (err) throw err;
//         console.log("Record inserted Successfully");
//
//     });
//
//     return res.redirect('/login');
});

app.post('/loginfilled',function(req,res){




  console.log("entered");
      userid = req.body.l_name;
     pass = req.body.l_password;
      subject = req.body.l_subject;
     console.log(subject);

     // var uidfetch = {"email":userid,"password":pass};
     // db.collection('dealer').find({},{_id:0}).toArray(function(err,collection){
     //   if(err) throw err;
     //      console.log(collection);
     // });

    var data = {
      "email": userid,
      "password": pass,
      "subject": subject
    };

if(subject == "Dealer"){
  db.collection('dealer').find(data).toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);
              req.session.user_id = userid;
              // uid = collection._id;
              db.collection('product').find().toArray(function(err,doc){
                status = true;
                return res.render("home.ejs",{items:doc});
              });

            }
            else
                    {
                      return res.redirect('/login');
                    }
      });
}

else if(subject == "Distrubution Center"){
  db.collection('distrubution').find(data).toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);
              req.session.user_id = userid;
              // uid = collection._id;
              db.collection('product').find({"email":userid}).toArray(function(err, collection){
                      if (err) throw err;
                          console.log(collection);
                          status = true;
                          res.render('dhome.ejs',{items: collection});
                  });
            }
            else
                    {

                      // return done(null, false, {message: "Incorrect credentials"}),res.redirect('/login');
                      return res.redirect('/login');
                    }
      });
}

else if(subject == "Customer"){
  db.collection('customer').find(data).toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);
              req.session.user_id = userid;
              // uid = collection._id;
              status = true;
              return res.sendFile(__dirname+ "/index.html");
            }
            else
                    {
                      return res.redirect('/login');
                    }
      });

}
else{
  return res.redirect('/login');
}
    // db.collection('dbmsford').find(data).toArray(function(err, collection){
    //         if (err) throw err;
    //           if(collection!=""){
    //             console.log(collection);
    //
    //             return res.sendFile(__dirname+ "/index.html");
    //           }
    //           else
    //                   {
    //                     return res.redirect('/login');
    //                   }
    //     });


});
// app.get('/index', function(req,res){
//   res.set({
//       'Access-control-Allow-Origin': '*'
//       });
//   res.sendFile(__dirname + '/index.html');
// })

// app.post('/wait',function(req,res){
//   db.auth(res.body.email,res.body.pass);
// })

app.get('/signup',function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
  // console.log("djfisa");
res.sendFile(__dirname + '/index.html');
});
app.get('/binarysearch',function(req,res){
  let recursiveFunction = function (arr, x, start, end) {

    // Base Condtion
    if (start > end) return false;

    // Find the middle index
    let mid=Math.floor((start + end)/2);

    // Compare mid with given key x
    if (arr[mid]===x) return true;

    // If element at mid is greater than x,
    // search in the left half of mid
    if(arr[mid] > x)
        return recursiveFunction(arr, x, start, mid-1);
    else

        // If element at mid is smaller than x,
        // search in the right half of mid
        return recursiveFunction(arr, x, mid+1, end);
}

// Driver code
let arr = [1, 3, 5, 7, 8, 9];
let x = 5;

if (recursiveFunction(arr, x, 0, arr.length-1))
    document.write("Element found!<br>");
else document.write("Element not found!<br>");

x = 6;

if (recursiveFunction(arr, x, 0, arr.length-1))
    document.write("Element found!<br>");
else document.write("Element not found!<br>");
});
app.get('/',function(req,res){
  console.log(userid);
  console.log(subject);
  if(status)
  {
    req.session.user_id = userid;
    if(subject == 'Distrubution Center'){
      db.collection('product').find({"email":userid}).toArray(function(err, collection){
              if (err) throw err;
                  res.render('dhome.ejs',{items: collection});
          });
         }

         if(subject == "Dealer"){
           db.collection('product').find().toArray(function(err,doc){
              res.render("home.ejs",{items:doc});
           });
         }

         if(subject == "Customer"){
         res.sendFile(__dirname+ "/index.html");

       }
  }
  else{
  res.sendFile(__dirname + '/login.html');
  }
res.set({
    'Access-control-Allow-Origin': '*'
    });


//DEALER/////

// res.sendFile(__dirname + '/login.html');
}).listen(3000);

app.get('/login',function(req,res){
console.log(status);
if(status)
{
  req.session.user_id = userid;
  if(subject == 'Distrubution Center'){
    db.collection('product').find({"email":userid}).toArray(function(err, collection){
            if (err) throw err;
                console.log(collection);
                res.render('dhome.ejs',{items: collection});
        });
       }


       if(subject == "Dealer"){
         db.collection('product').find().toArray(function(err,doc){
            res.render("home.ejs",{items:doc});
         });
       }

       if(subject == "Customer"){
       res.sendFile(__dirname+ "/index.html");

     }
}
else{
res.sendFile(__dirname + '/login.html');
}
res.set({
    'Access-control-Allow-Origin': '*'
    });

//     if(userid!=""){
//       if(subject == 'Distrubution Center'){
//         db.collection('product').find().toArray(function(err,doc){
//           res.render("dhome.ejs",{items:doc});
//         });
//       }
//
//       if(subject == "Dealer"){
//         db.collection('product').find().toArray(function(err,doc){
//            res.render("home.ejs",{items:doc});
//         });
//       }
//
//       if(subject == "Customer")
//       res.sendFile(__dirname+ "/index.html");
//
//     }
//
//     else{
//       res.sendFile(__dirname + '/login.html');
// }

});

app.get('/home.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
    db.collection('product').find().toArray(function(err, collection){

      if(err) throw err;
      // for(var key in collection){
      //   finalArray.push(collection[key]);
      // }
      // console.log(finalArray);
      res.render('home.ejs',{items: collection});
    });
//
// res.sendFile(__dirname + '/home.html');
});

app.get('/distrubution.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });

    db.collection('distrubution').find().toArray(function(err, collection){

      if(err) throw err;
      // for(var key in collection){
      //   finalArray.push(collection[key]);
      // }
      // console.log(finalArray);
      res.render('distrubution.ejs',{items: collection});
    });


//
// res.sendFile(__dirname + '/distrubution.html');
});

app.get('/myproducts.html',checkAuth,function(req,res){
var arr = [];
  db.collection('productpurchased').find({"email": userid}).toArray(function(err, collection){
    if(err) throw err;
    // console.log(collection);
    // for(var key in collection){
      db.collection('product').find().toArray(function(err,doc){

        for(var key in collection){
          for(var lock in doc){
              // console.log(doc[lock]._id ==  ObjectID(collection[key].productid));
            if(doc[lock]._id==collection[key].productid){
              arr.push(doc[lock]);
              // console.log(arr);
          }

          }
          // console.log(arr);

        }
        console.log(arr);
  res.render('myproducts.ejs',{items: arr});

    });
  // }


    // for(var key in collection){
    //   finalArray.push(collection[key]);
    // }
    // console.log(finalArray);
    // db.collection('  dealer').find({emai: userid}).toArray(function(err,doc){
    //
    // })

  });

// res.sendFile(__dirname + '/myproducts.html');
});
app.get('/addproduct.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
res.sendFile(__dirname + '/addproduct.html');
});


app.post('/addproduct',function(req,res){
  console.log("entered");
    var name = req.body.add_name;
    var val = req.body.add_value;
    var weight = req.body.add_weight;
    var addproductid = req.body.add_email;
console.log(userid);
    var data = {
      "name": name,
      "val": val,
      "weight": weight,
      "email": userid
    };
    db.collection('product').insertOne(data,function(err, collection){
            if (err) throw err;
            console.log("Record inserted Successfully");

        });

        return res.redirect('/dhome.html');
  });

  app.get("/products",checkAuth,function(req,res){
    db.collection('product').find().toArray(function(err, collection){
            if (err) throw err;
              if(collection!=""){
                console.log(collection);
                console.log(this.body);
                var htmlText = '';
                htmlText += '<link rel="stylesheet" href="css/home.css">';
                  htmlText += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">';
                  htmlText += '<meta name="viewport" content="width=device-width, initial-scale=1">';
                  htmlText += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">';
                  htmlText += '<div class="card-columns row">';
                for (var key in collection) {
                  // htmlText += '<div class="div-conatiner">';
                  // htmlText += '<p class="p-name"> Name: ' + collection[key].name + '</p>';
                  // htmlText += '<p class="p-loc"> Location: ' + collection[key].val + '</p>';
                  // htmlText += '<p class="p-desc"> Description: ' + collection[key].weight + '</p>';
                  // htmlText += '<p class="p-created"> Created by: ' + collection[key].email + '</p>';
                  // htmlText += '</div>';


                    htmlText += '<div class="card column"><img class="cardimg" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbYBj71u-p7FGmoF0Vbew4N6kN0tMeYCYEeHQrMwUZ-lfjW5Yv" alt="" style="width:100%">';
                    htmlText += '<h1>'+collection[key].name +'</h1>';
                    htmlText += '<p class="price">'+ collection[key].val+'$</p>';
                    htmlText += '<p> Weight: '+collection[key].weight+ '</p>';
                    htmlText += '<p> Id: '+collection[key]._id+ '</p>';
                    htmlText += '<p><button><a href = "/buyproducts/'+collection[key]._id+'">BUY</a></button></p>';

                    // htmlText +=            '<button data-toggle="modal" data-target="#myModal">view</button>';

                  // htmlText +=              '<!-- <a href="">View</a>  -->';

                  htmlText +=            '</div>';
                }
                htmlText += '</div>';
                htmltext1 = htmlText;
                // res.setHeader('Content-Type', 'text/html');

                // this.body.innerHTML = this.body.innerHTML + htmlText;
                res.send(htmlText);
                // res.setHeader('Content-Type', 'text/javascript');


                // res.render({html: htmlText});
              }

        });
  });

  app.get("/viewdistrubution",checkAuth,function(req,res){
    db.collection('distrubution').find().toArray(function(err, collection){
            if (err) throw err;
              if(collection!=""){
                console.log(collection);
                console.log(this.body);
                var htmlText = '';
                htmlText += '<link rel="stylesheet" href="css/home.css">';
                  htmlText += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">';
                  htmlText += '<meta name="viewport" content="width=device-width, initial-scale=1">';
                  htmlText += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">';
                  htmlText += '<div class="card-columns row">';
                for (var key in collection) {
                  // htmlText += '<div class="div-conatiner">';
                  // htmlText += '<p class="p-name"> Name: ' + collection[key].name + '</p>';
                  // htmlText += '<p class="p-loc"> Location: ' + collection[key].val + '</p>';
                  // htmlText += '<p class="p-desc"> Description: ' + collection[key].weight + '</p>';
                  // htmlText += '<p class="p-created"> Created by: ' + collection[key].email + '</p>';
                  // htmlText += '</div>';


                    // htmlText += '<div class="card column"><img class="cardimg" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbYBj71u-p7FGmoF0Vbew4N6kN0tMeYCYEeHQrMwUZ-lfjW5Yv" alt="" style="width:100%">';
                    htmlText += '<div class="card dcard">';
                    htmlText += '  <img src="https://images.livemint.com/img/2019/09/11/600x338/Amazon_1568182179661.PNG" alt="Avatar" style="width:100%">';
                    htmlText += '<button class="btn" style="border-radius:0  "data-toggle="modal" data-target="#myModal">';
                    htmlText += '  <div class="dcontainer">';
                    htmlText +=            '<h4><b>'+collection[key].fname+'</b> </h4>';
                    htmlText +=            '<p>'+collection[key].country+' ,'+ collection[key].state+' </p>';
                    htmlText +=            '</div>';
                    // htmlText +=            '<button data-toggle="modal" data-target="#myModal">view</button>';

                  // htmlText +=              '<!-- <a href="">View</a>  -->';
                  htmlText +=              '</p>';
                  htmlText +=            '</div>';
                }
                htmlText += '</div>';
                htmltext1 = htmlText;
                // res.setHeader('Content-Type', 'text/html');

                // this.body.innerHTML = this.body.innerHTML + htmlText;
                res.send(htmlText);
                // res.setHeader('Content-Type', 'text/javascript');


                // res.render({html: htmlText});
              }


        });
  });


///Distrubution Center///
app.get('/dhome.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
    db.collection('product').find({"email":userid}).toArray(function(err, collection){
            if (err) throw err;
                console.log(collection);
                res.render('dhome.ejs',{items: collection});
        });
    // var resultArray = [];
    // var  hello;
    // var cursor = db.collection('product').find();
    // cursor.forEach(function(doc, err){
    //   resultArray.push(doc);
    //   // console.log(resultArray);
    //
    // });
    // console(db.collection("product").find({}));

// Product.find({},function(err, allProduct){
//   if(err){
//     console.log(err);
//   }
//   else{
//     res.render({products: allProduct})
//   }
// });
// res.render({})

// db.collection('product').find().toArray(function(err, collection){
//         if (err) throw err;
//           if(collection!=""){
//             console.log(collection);
//             console.log(this.body);
//             var htmlText = '';
//             for (var key in collection) {
//               htmlText += '<div class="div-conatiner">';
//               htmlText += '<p class="p-name"> Name: ' + collection[key].name + '</p>';
//               htmlText += '<p class="p-loc"> Location: ' + collection[key].val + '</p>';
//               htmlText += '<p class="p-desc"> Description: ' + collection[key].weight + '</p>';
//               htmlText += '<p class="p-created"> Created by: ' + collection[key].email + '</p>';
//               htmlText += '</div>';
//             }
//             htmltext1 = htmlText;
            // res.setHeader('Content-Type', 'text/html');

            // this.body.innerHTML = this.body.innerHTML + htmlText;
            // res.write(htmlText);
            // res.setHeader('Content-Type', 'text/javascript');


            // res.render({html: htmlText});
          // }

    //
    // });

  //
  // res.sendFile(__dirname + '/dhome.html');

});

app.get("/viewproducts",checkAuth,function(req,res){
  db.collection('product').find().toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);
              console.log(this.body);
              var htmlText = '';
              htmlText += '<link rel="stylesheet" href="css/home.css">';
                htmlText += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">';
                htmlText += '<meta name="viewport" content="width=device-width, initial-scale=1">';
                htmlText += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">';
                  htmlText += '<div class="card-columns row">';
              for (var key in collection) {
                // htmlText += '<div class="div-conatiner">';
                // htmlText += '<p class="p-name"> Name: ' + collection[key].name + '</p>';
                // htmlText += '<p class="p-loc"> Location: ' + collection[key].val + '</p>';
                // htmlText += '<p class="p-desc"> Description: ' + collection[key].weight + '</p>';
                // htmlText += '<p class="p-created"> Created by: ' + collection[key].email + '</p>';
                // htmlText += '</div>';


                  htmlText += '<div class="card column"><img class="cardimg" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbYBj71u-p7FGmoF0Vbew4N6kN0tMeYCYEeHQrMwUZ-lfjW5Yv" alt="" style="width:100%">';
                  htmlText += '<h1>'+collection[key].name +'</h1>';
                  htmlText += '<p class="price">'+ collection[key].val+'$</p>';
                  htmlText += '<p> Weight: '+collection[key].weight+ '</p>';
                  htmlText += '<p><a href="editproduct.html">Edit</a>';
                  htmlText +=            '<a href="">Delete</a>';
                  // htmlText +=            '<button data-toggle="modal" data-target="#myModal">view</button>';

                // htmlText +=              '<!-- <a href="">View</a>  -->';
                htmlText +=              '</p>';
                htmlText +=            '</div>';
              }
              htmlText +=            '</div>';
              htmltext1 = htmlText;
              // res.setHeader('Content-Type', 'text/html');

              // this.body.innerHTML = this.body.innerHTML + htmlText;
              res.send(htmlText);
              // res.setHeader('Content-Type', 'text/javascript');


              // res.render({html: htmlText});
            }


      });
});

app.get("/viewdealers",checkAuth,function(req,res){
  db.collection('dealer').find().toArray(function(err, collection){
          if (err) throw err;
            if(collection!=""){
              console.log(collection);
              console.log(this.body);
              var htmlText = '';
              htmlText += '<link rel="stylesheet" href="css/home.css">';
                htmlText += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">';
                htmlText += '<meta name="viewport" content="width=device-width, initial-scale=1">';
                htmlText += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">';
                htmlText += '<div class="card-columns row">';
              for (var key in collection) {
                // htmlText += '<div class="div-conatiner">';
                // htmlText += '<p class="p-name"> Name: ' + collection[key].name + '</p>';
                // htmlText += '<p class="p-loc"> Location: ' + collection[key].val + '</p>';
                // htmlText += '<p class="p-desc"> Description: ' + collection[key].weight + '</p>';
                // htmlText += '<p class="p-created"> Created by: ' + collection[key].email + '</p>';
                // htmlText += '</div>';


                  // htmlText += '<div class="card column"><img class="cardimg" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbYBj71u-p7FGmoF0Vbew4N6kN0tMeYCYEeHQrMwUZ-lfjW5Yv" alt="" style="width:100%">';
                  htmlText += '<div class="card dcard">';
                  htmlText += '  <img src="https://images.livemint.com/img/2019/09/11/600x338/Amazon_1568182179661.PNG" alt="Avatar" style="width:100%">';
                  htmlText += '<button class="btn" style="border-radius:0  "data-toggle="modal" data-target="#myModal">';
                  htmlText += '  <div class="dcontainer">';
                  htmlText +=            '<h4><b>'+collection[key].fname+'</b> </h4>';
                  htmlText +=            '<p>'+collection[key].country+' ,'+ collection[key].state+' </p>';
                  htmlText +=            '</div>';
                  // htmlText +=            '<button data-toggle="modal" data-target="#myModal">view</button>';

                // htmlText +=              '<!-- <a href="">View</a>  -->';
                htmlText +=              '</p>';
                htmlText +=            '</div>';
              }
              htmlText +=            '</div>';
              htmltext1 = htmlText;
              // res.setHeader('Content-Type', 'text/html');

              // this.body.innerHTML = this.body.innerHTML + htmlText;
              res.send(htmlText);
              // res.setHeader('Content-Type', 'text/javascript');


              // res.render({html: htmlText});
            }

      });
});

app.get('/dealer.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
    db.collection('dealer').find().toArray(function(err, collection){
            if (err) throw err;
              if(collection!=""){
                console.log(collection);
                res.render('dealer.ejs',{items: collection});
              }

        });

});
app.get('/shipment.html',checkAuth,function(req,res){
var finalArray = [];
res.set({
    'Access-control-Allow-Origin': '*'
    });
db.collection('productpurchased').find().toArray(function(err, collection){
    if(err) throw err;

  db.collection('product').find({"email":userid}).toArray(function(err, doc){

    for(var key in collection){
        for(var lock in doc){

          if(collection[key].productid == doc[lock]._id){
            finalArray.push(collection[key]);

          }
        }
    }
                  res.render('shipments.ejs',{items: finalArray});
    // console.log(doc);
  });

  // for(var key in collection){
  //   finalArray.push(collection[key]);
  // }
  // console.log(finalArray);

});
});


app.get('/orders',checkAuth,function(req,res){
  db.collection('productpurchased').find({"email":userid}).toArray(function(err,doc){
      res.render('dealerorders.ejs',{items:doc});
  });

});


app.get('/editproduct.html',checkAuth,function(req,res){

res.set({
    'Access-control-Allow-Origin': '*'
    });
res.sendFile(__dirname + '/editproduct.html');
});


// app.get("/vendor/mdi-font/css/material-design-iconic-font.min.css",function(req,res){
//   res.sendFile(__dirname + "vendor/mdi-font/css/material-design-iconic-font.min.css");
// })


app.get('/buyproducts/:id',checkAuth,function(req,res){
var id = req.params.id;

  res.render('checkout.ejs',{id1: id});
});

app.post('/purchase',checkAuth,function(req,res){
  let date_ob = new Date();
  var productid = req.body.productid;
  var date = date_ob;
  var holdername = req.body.c_name;
  var emailid = userid;
var data = {
  "productid": productid,
  "date": date_ob,
  "holdername": holdername,
  "email": emailid,
  "shipped":false,
  "qrcode":false
};


db.collection('productpurchased').find(data).toArray(function(err, collection){
      if (err) throw err;
        if(collection!=""){
          // console.log(collection);
          return res.redirect('/products');
          // return res.flash('success', 'Your name was updated');
        }
        else{
          db.collection('productpurchased').insertOne(data,function(err, collection){
                  if (err) throw err;{
                  console.log("Record inserted Successfully");
                  // console.log(collection);
                }
              });

            return res.redirect('/home.html');
          }
  });

});

app.get('/editproduct.html/:id',checkAuth,function(req,res){
  var id = req.params.id;
  db.collection('product').find({"_id":ObjectID(id)}).toArray(function(err,collection){
    console.log(collection);
      res.render("editproduct.ejs",{items :collection});
  });
});
app.post('/editsubmit/:id',checkAuth,function(req,res){
  var id = req.params.id;
  var name,weight,val;

    name = req.body.exampleInputName;
    weight = req.body.exampleInputWeight;
    val = req.body.exampleInputValue;

  if(name!=""&&weight!=""&&val!=""){
  var data = {
    "name":name,
    "weight":weight,
    "val":val
  };

  db.collection('product').update({"_id":ObjectID(id)},{$set : data});}
  res.redirect("../dhome.html");
});

app.get('/suc_ship/:email/:id',checkAuth,function(req,res){
  var id = req.params.id;
  var email = req.params.email;
    db.collection('productpurchased').update({"productid":id,"email":email},{$set :{"shipped":true}});
  res.redirect('../../shipment.html');
});
app.get('/can_ship/:email/:id',checkAuth,function(req,res){
  var id = req.params.id;
  var email = req.params.email;
  db.collection('productpurchased').update({"productid":id,"email":email},{$set :{"shipped":false}});
  res.redirect('../../shipment.html');
});

app.get('/purchase',checkAuth,function(req,res){
  res.redirect('products');
});
app.get('/deleteproduct/:id',checkAuth,function(req,res){
  var id = req.params.id;
  db.collection('product').remove({"_id":ObjectID(id)});
  res.redirect("../dhome.html");
});
app.get("/qrcodescan/:email/:id",checkAuth,function(req,res){
    var id = req.params.id;
    var email = req.params.email;
    db.collection('productpurchased').find({"email":email,"productid":id}).toArray(function(err,doc){
      if(userid == doc[0].email){
        if(doc[0].qrcode == false){
        db.collection('productpurchased').update({"productid":id},{$set : {qrcode:true}});
        res.render("done.ejs");
      }
      else{
        res.send("<h1>YOU HAVE ALREADY UPDATED THE STATUS.<a href='/'>Home</a></h1> ");
      }
      }
      else{
        res.send("Failed. Login and scan the code again");
      }
    });


});
app.get("/productview/:id",checkAuth,function(req,res){
res.end();

});
console.log("server listening at port 3000");
