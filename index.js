import express from 'express';
import { engine } from 'express-handlebars';
import mysql from 'mysql2/promise'

const app = express();

app.use(express.urlencoded({ extended: true}))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


const port = process.env.PORT || 3000


const database = await mysql.createConnection({
    host:'pauliuspetrunin.lt',
    user: 'bit',
    password: 'kulokas',
    database: 'Mantas_S'
})


app.get('/', (req,res)=> {
    res.render('login')

})


app.post('/', async (req,res)=>{
        if (req.body.email === "" || req.body.password === "") {
          res.send("neuzpildyti duomenys");
          return;
        }
    
        if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(req.body.email)) {
          res.send("neteisingas el pasto formatas")
          return;
        }

        const user = await database.query(`SELECT * FROM users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`)
        if(user[0].length > 0)
    res.redirect('/database')
    else{return res.send('nera tokio vartotojo')}
   
})



app.get('/registracija', (req,res)=>{
    res.render('registracija')
})

app.post('/registracija', async (req,res)=>{
    await database.query(`INSERT INTO users (name, last_name, email, password) VALUES ('${req.body.name}','${req.body.surname}','${req.body.email}','${req.body.password}')`)


res.redirect('/')
})



app.get('/database', async (req, res) => {
const songs = await database.query('SELECT id, song_Name, song_Album FROM songs')

    res.render('index', {songs: songs[0]});
});


app.get('/delete/:id', async (req,res)=> {
//    const id =  req.params.id
  await database.query('DELETE FROM songs WHERE id=?',[req.params.id])
    
    
    res.redirect('/database')
})





app.post('/new', async (req, res)=>{
    await database.query(`INSERT INTO songs (song_Name, song_Album) VALUES ('${req.body.pavadinimas}', '${req.body.albumas}')`)

    res.redirect('/database')
})





app.get('/edit/:id', (req,res)=>{

    res.render('edit')
})

app.post('/edit/:id', async (req, res)=>{
    const id = req.params.id
    await database.query(`UPDATE songs SET song_Name='${req.body.pavadinimas}', song_Album='${req.body.albumas}' WHERE id=${id}`)

    res.redirect('/database')
})


app.get('/playlist', async (req,res)=>{
    //Atvaizdavimas
    const playlist = await database.query('SELECT * FROM playlist')

        res.render('playlist', { playlist: playlist[0] });
})

app.get('/playlist/new', (req, res) => {
    res.render('newPlaylist')
})

app.post('/playlist/new', async (req, res)=>{
    //Pridejimas
    await database.query(`INSERT INTO playlist (name) VALUES ('${req.body.playlist}')`)

    res.redirect('/playlist')
})




app.listen(port);



