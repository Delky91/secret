require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const { appendFile } = require("fs");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err) => { //cuando se usa el save automaticamente se encriptara la password en una linea binaria dificil de decifrar
        if (err)
            console.log(err);
        else
            res.render("secrets");
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    //al usar find o cualquiera de sus metodos, este desencriptara la clave del usuario para comprarla en caso de encontrarse registrado el usuario
    User.findOne({ email: username }, (err, foundUser) => {
        if (err)
            console.log(err);
        else {
            if (foundUser) {
                if (foundUser.password === password)
                    res.render("secrets");
                else
                    res.render("the password is wrong");
            }
        }
    });
});

app.listen(3000, () => {
    console.log('Server up, PORT 3000');

})
