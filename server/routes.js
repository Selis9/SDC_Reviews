// const controllerMongo = require('./controllers/indexMongo.js');
const router = require('express').Router();
const controllerPostgre = require('./controllers/indexPostgre');

// Connect controller methods to their corresponding routes

// MongoDB
// router.post('/reviews', controllerMongo.postReviews);
// router.post('/photos', controllerMongo.postPhotos);
// router.post('/characteristics', controllerMongo.postCharacteristics);

// Postgre
router.get('/reviews/meta/:product_id', controllerPostgre.getProductMeta);
router.get('/reviews/meta', controllerPostgre.getProductMeta);
router.get('/reviews/:product_id', controllerPostgre.getProductReviews);
router.get('/reviews', controllerPostgre.getProductReviews);

router.post('/reviews/:product_id', controllerPostgre.postReviews);
router.post('/reviews', controllerPostgre.postReviews);

router.put('/reviews/:review_id/helpful', controllerPostgre.putReviewsHelpful);
router.put('/reviews/:review_id/report', controllerPostgre.putReviewsReport);

module.exports = router;
