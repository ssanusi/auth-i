const express = require('express');
const app = express();
const logger = require('morgan');
const helmet = require('helmet')
const bcrypt = require('bcryptjs')
const db = require('./data/db')
const session = require('express-session')


app.use(session({
    name : 'catton',
    secret : 'this is a secret code',
    cookie : { maxAge : 1 * 24 * 60 * 60 * 1000, save : false  },
    httpOnly : true,
    resave : false,
    saveUninitialized : false

}));


app.use(express.json())
app.use(helmet());
app.use(logger("dev"));

app.get('/', (req, res) => {
    res.send('welcome to Lambda School Authentication Projects');
});

app.post('/api/register', (req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 14 )
    user.password = hash
    db.addUser(user)
        .then(response => {
            if(response){
                res.status(200).send("User Created Sucessfully")
            }
        })
        .catch( err => {
            res.status(500).json({ error : err})
        })
    
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = { username, password }
    //console.log(user)
    db.getUser(user.username).first()
        .then( response =>{
            if(response && bcrypt.compareSync(user.password,response.password)){
                req.session.username = user.username
                res.status(400).send(`welcome ${user.usersname}`)
            }
            res.status(401).send("incorrect login credentials")
        })
        .catch(err => {
            res.status(500).send("incorrect login credentials")
        })
});

app.get('/api/users', (req, res) => {
    if(req.session && req.session.username === 'ssanusi'){
        db.getUsers()
        .then(response =>{
            res.status(200).json(response)
        })
        .catch( err => {
            res.status(500).json({error : err})
        })   
    }
    else{
        res.send('you are not login')
    }
    
});

app.get('/api/logout', (req, res) => {
    if(req.session){
        req.session.destroy(err =>{
            if(err){
                res.send('error logging out')
            }
            else{
                res.send('good bye')
            }
        })
    }
    
});

app.listen(3000, () => {
    console.log('app listening on port 3000!');
});

//Run app, then load http://localhost:3000 in a browser to see the output.