const http = require('http')
const express = require('express')
const es6Renderer = require('express-es6-template-engine')
const bodyParser = require('body-parser')
const pgPromise = require('pg-promise')();


const hostname = 'localhost'
const port = 3001
const config = {
    host: 'localhost',
    port: 5432,
    database: 'bloganon',
    user: 'postgres',

}

const app = express()
const server = http.createServer(app)
const db = pgPromise(config)

app.engine('html', es6Renderer)
app.set('views', 'templates')
app.set('view engine', 'html')

//parse request body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// routes go here

app.get('/', function(req, res){
    res.render('home', {
       
    })
})
  

app.get('/blogs', (req, res) => {
    db.query('SELECT * FROM posts;')
      .then((results) => {
        res.render('partials/blogs', {
          partials: {
            body: 'partials/blogs'
          },
          locals: {
            title: 'Blogs!!!',
            posts: results
          }
        })
      })
  })

app.get('/blogs/new', function(req, res){
    res.render('partials/blog-form', {
        partials: {
            body: 'partials/blog-form'
        },
        locals: {
            title: 'Add a new blog'
        }
    })
})



  app.post('/blogs/new', function(req, res){
    const name = req.body.name
    const likes = req.body.likes
    const date_created = req.body.date_created
    const active_status = req.body.active_status
    db.query('INSERT INTO posts (name, likes, date_created, active_status) VALUES ($1, $2, $3, $4)', [name, likes, date_created, active_status])
    
    .then (() =>{
        // res.send('created!')
        res.redirect('/blogs')
    })
    
    .catch ((e) => {
        console.log(e)
        res.send('nope')
    })

})





app.get('/blogs/:id', function(req,res){
    const id = req.params.id
    db.oneOrNone('SELECT * FROM posts WHERE id = $1', [id])
    .then(blogID => {
        if(!blogID){
            res.status(404).json({error: 'restaurant not found'})
            return
        }
        res.render('partials/blog-single', {
            partials: {
                body: 'partials/blog-single'
            },
            locals: {
                title: blogID.name,
                blogID

            }
        })
    })
    .catch((e) => {
        console.log(e)
        res.status(400).json({error: 'invalid id'})
    })
})


app.get('*', (req, res) => {
  res.status(404).send('404 Not Found')
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})



