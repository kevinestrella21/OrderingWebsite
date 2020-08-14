const e = require("express");

const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"), //so i can use PUT and DELETE methods
      flash         = require("connect-flash");




mongoose.connect('mongodb://localhost:27017/pc_order', {
useNewUrlParser: true,
useUnifiedTopology: true
});


app.use(require("express-session")({
    secret: "Somebody once told me!",
    resave: false,
    saveUninitialized: false
}));

//===========================================
//PASSPORT CONFIGURATION
//===========================================

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

const productsSchema = new mongoose.Schema({
    name            : String,
    description     : String,
    price           : Number,
    dateBought      : Date,
    dateReceived    : Date,
    serialNumber    : String,
    image           : { data: Buffer, contentType: String }
});

const Products = mongoose.model("Products", productsSchema);


// const product = new Products({
//     name            : "860 evo 500gb",
//     description     : "SSD",
//     price           : "80",
//     dateBought      : '2020-08-13',
//     dateReceived    : '2020-08-24',
//     serialNumber    : "123123123"
// });




app.set("view engine", "ejs"); //so i dont have to put .ejs on every redirects and renders
app.use(bodyParser.urlencoded({extended: true})); //so i can read the body of an ejs file
app.use(express.static(__dirname + "/public")); //dont know what this is for
app.use(flash()); // so i can use the connect-flash npm
app.use(methodOverride("_method")); //so i can use the method-override library
app.use(function(req, res, next){           //store the data for my ejs to read
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});





app.get("/", function(req, res){
    res.render("index");
});


//DISPLAYS ALL PRODUCTS
app.get("/products", function(req, res){
    Products.find({}, function(err, products){
        if(err){
            console.log(err);
        } else {
            res.render("products/indexProducts", {products: products});
        }
    });
});


//DISPLAYS A SINGLE PRODUCT USING AND ID
app.get("/products/:id", function(req, res){
    Products.findById(req.params.id, function(err, foundProduct){
        if(err) {
            console.log(err);
        } else {
            res.render("products/showProducts", {product: foundProduct});
        }
    })
});


//DISPLAYS NEW FORM TO ADD NEW PRODUCT
app.get("/products/new", (req, res) => {
    res.render("products/newProducts");
});


// //PROCESSES THE NEW FORM TO ADD NEW PRODUCT TO DB
app.post("/products", function(req, res){
    Products.create(req.body.products, function(err, newProduct){
        if(err){
            console.log(err);
        } else{
            console.log("New Product added.");
            res.redirect("/products");
        }
    });
});


//SHOW EDIT PAGE
app.get("/products/:id/edit", function(req, res){
    Products.findById(req.params.id, function(err, foundProduct){
        if(err){
            console.log(err);
        } else{
            res.render("products/editProducts", {product: foundProduct});
        }
    })
});



//EDIT A PRODUCT
app.put("/products/:id", function(req, res){
    Products.findByIdAndUpdate(req.params.id, req.body.products, function(err, updatedProduct){
        if(err){
            console.log(err);
        } else {
            res.redirect(`/products/${req.params.id}`);
        }
    })
});


//DELETE A PRODUCT
app.delete("/products/:id", function(req, res){
    Products.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else{
            res.redirect("/products")
        }
    })
});




app.listen(3000, function(){
    console.log("CONNECTED TO DB");
});