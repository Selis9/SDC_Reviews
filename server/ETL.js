require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: 50,
});

const initializeDB = async () => {
  await pool.query(`
      COPY reviews (id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/reviews.csv' csv header;
  `);

  await pool.query(`SELECT setval(pg_get_serial_sequence('reviews', 'id'), coalesce(max(id),0) + 1, false) FROM reviews`);

  await pool.query(`
      COPY reviews_characteristics (id,characteristic_id,review_id,value)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/characteristic_reviews.csv' csv header;
  `);

  await pool.query(`SELECT setval(pg_get_serial_sequence('reviews_characteristics', 'id'), coalesce(max(id),0) + 1, false) FROM reviews_characteristics`);

  await pool.query(`
      COPY reviews_photos (id,review_id,url)
        FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/reviews_photos.csv' csv header;
  `);

  await pool.query(`SELECT setval(pg_get_serial_sequence('reviews_photos', 'id'), coalesce(max(id),0) + 1, false) FROM reviews_photos`);

  await pool.query(`
    COPY characteristics (id,product_id,name)
      FROM '/Users/tonykang/Hack Reactor SEI/SDC_Reviews/server/databases/initLoad/characteristics.csv' csv header;
  `);
};

initializeDB();
