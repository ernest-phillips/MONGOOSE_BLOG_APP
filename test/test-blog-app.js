'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {
    BlogPost
} = require('../models');

const {
    runServer,
    app,
    closeServer
} = require('../server');
const {
    TEST_DATABASE_URL
} = require('../config')

chai.use(chaiHttp);

function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogPostData());
    }

    return BlogPost.insertMany(seedData);

}

function generateBlogPostData() {
    return {
        author: {
            firstName: faker.firstName,
            lastName: faker.lastName
        },
        title: faker.words,
        content: faker.paragraphs,
        created: faker.past
    };

}

function tearDownDb() {
    console.warn('Deleteing database');
    return mongoose.connection.dropDatabase();
}

describe('BlogPosts', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {

        return seedBlogPostData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });
});

describe('GET endpoint', function() {

    it('should return blog posts', function() {

        let res;
        return chai.request(app)
            .get('/posts')
            .then(function(_res) {
                res = _res;
                expect(res).to.have.status(200);
                expect(res.body.posts).to.be.a('object');
            });
    });
});