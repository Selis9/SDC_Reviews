const db = require('../databases/postgre');

const pullReviews = (productId, page, count) => db.query(`SELECT reviews.id, reviews.rating, reviews.summary,
  reviews.recommend, reviews.response, reviews.body, reviews.date, reviews.reviewer_name, reviews.helpfulness
  FROM reviews WHERE product_id = ${productId} AND reported = false OFFSET ${page} LIMIT ${count};`);

const pullReviewPhotos = (reviewId) => db.query(`SELECT id, url FROM reviews_photos WHERE review_id = ${reviewId}`);

const pullReviewsMeta = (productId) => db.query(`SELECT rating, recommend FROM reviews WHERE product_id = ${productId}`);

const pullReviewsCharacteristics = (productId) => db.query(`SELECT characteristics.id, characteristics.name, reviews_characteristics.value FROM reviews JOIN reviews_characteristics ON reviews_characteristics.review_id = reviews.id JOIN characteristics ON characteristics.id = reviews_characteristics.characteristic_id WHERE reviews.product_id = ${productId};`);

const saveReviews = (productId, pRating, pDate, pSummary, pBody, pRecommend, reviewerName, reviewerEmail) => db.query(`INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${productId}, ${pRating}, ${pDate}, '${pSummary}', '${pBody}', ${pRecommend}, false, '${reviewerName}', '${reviewerEmail}', null, 0);`);

const savePhotos = (url) => db.query(`INSERT INTO reviews_photos (review_id, url) VALUES ((SELECT MAX(id) FROM reviews), '${url}');`);

const saveCharacteristics = (charId, cValue) => db.query(`INSERT INTO reviews_characteristics (characteristic_id, review_id, value) VALUES (${charId}, (SELECT MAX(id) FROM reviews), ${cValue})`);

const updateReviewsHelpful = (reviewId) => db.query(`UPDATE reviews SET helpful = (SELECT helpful FROM reviews WHERE id = $1)+1) WHERE id = $${reviewId}`);

const updateReviewsReport = (reviewId) => db.query(`UPDATE reviews SET reported = true WHERE id = ${reviewId}`);

module.exports.pullReviews = pullReviews;
module.exports.pullReviewPhotos = pullReviewPhotos;
module.exports.pullReviewsMeta = pullReviewsMeta;
module.exports.pullReviewsCharacteristics = pullReviewsCharacteristics;
module.exports.saveReviews = saveReviews;
module.exports.savePhotos = savePhotos;
module.exports.saveCharacteristics = saveCharacteristics;
module.exports.updateReviewsHelpful = updateReviewsHelpful;
module.exports.updateReviewsReport = updateReviewsReport;
