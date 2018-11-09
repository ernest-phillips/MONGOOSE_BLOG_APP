'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

const expect = chai.expect

const {
    BlogPost
} = require('../models')

const {
    runServer,
    app,
    closeServer
} = require('../server')
const {
    TEST_DATABASE_URL
} = require('../config')

chai.use(chaiHttp)

function seedBlogPostData() {
    console.info('seeding blog post data')
    const seedData = []

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPostData())
    }

    return BlogPost.insertMany(seedData)
}

function generateBlogPostData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        created: faker.date.past()
    }
}

function tearDownDb() {
    console.warn('Deleteing database')
    return mongoose.connection.dropDatabase()
}

describe('BlogPosts', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL)
    })

    beforeEach(function() {
        return seedBlogPostData()
    })

    afterEach(function() {
        return tearDownDb()
    })

    after(function() {
        return closeServer()
    })

    describe('GET endpoint', function() {
        it('should return blog posts', function() {
            console.log('Inside test')
            let res
            return chai.request(app)
                .get('/posts')
                .then(function(_res) {
                    console.log('Then started')
                    res = _res
                    expect(res).to.have.status(200)
                    expect(res.body).to.be.a('array')
                    expect(res.body).to.have.lengthOf.at.least(1)
                        //   expect(res.body).to.equal(BlogPost.count())
                })
        })
    })

    describe('POST endpoint', function() {
        it('should add new blog post', function() {
            const newPost = generateBlogPostData()

            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function(res) {
                    expect(res).to.have.status(201)
                    expect(res).to.be.json // why?
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys(
                        'title', 'content', 'author')
                })
        })
    })

    describe('PUT endpoint', function() {
        it('should update fields you send over', function() {
            const updateData = {
                title: 'fee fi fo fum',
                author: 'Jake Conflate'
            }

            return BlogPost
                .findOne()
                .then(function(posts) {
                    updateData.id = posts.id

                    return chai.request(app)
                        .put(`/posts/${posts.id}`)
                        .send(updateData)
                })
                .then(function(res) {
                    expect(res).to.have.status(204)

                    return BlogPost.findById(updateData.id)
                })
                .then(function(posts) {
                    expect(posts.title).to.equal(updateData.title)
                    expect(posts.author).to.equal(updateData.author)
                })
        })
    })

    describe('DELETE endpoint', function() {
            it('delete a post by id', function() {
                let posts

                return BlogPost
                    .findOne()
                    .then(function(_posts) {
                        posts = _posts
                        return chai.request(app).delete(`/posts/${posts.id}`)
                    })
                    .then(function(res) {
                        expect(res).to.have.status(204)
                        return BlogPost.findById(posts.id)
                    })
                    .then(function(_posts) {
                        expect(_posts).to.be.null
                    })
            })
        }) // end tests
})