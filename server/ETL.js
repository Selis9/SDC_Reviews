const promise = require('bluebird');
require('dotenv').config();

const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);

const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: 30,
};

const db = pgp(cn);

const initializeDB = async () => {
  await db.any(`
      COPY reviews (id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/reviews.csv' csv header;
  `);
  await db.any(`
      COPY characteristics (id,characteristic_id,review_id,value)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/characteristic_reviews.csv' csv header;
  `);
  await db.any(`
      COPY photos (id,review_id,url)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/reviews_photos.csv' csv header;
  `);
  await db.any(`
    COPY characteristics (id,product_id,name)
      FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/characteristics.csv' csv header;
  `);
};

initializeDB();
