const Promise = require('bluebird');
const {
  pullReviews, pullReviewPhotos, pullReviewsMeta, pullReviewsCharacteristics,
  saveReviews, savePhotos, saveCharacteristics, updateReviewsHelpful, updateReviewsReport,
} = require('../models/indexPostgre');

const getProductReviews = async (req, res) => {
  try {
    if (req.body.product_id === undefined && req.query.product_id === undefined
      && req.params.product_id === undefined) {
      res.sendStatus(404);
    }

    const data = await pullReviews(req.body.product_id || req.params.product_id
      || req.query.product_id, req.params.page || 0, req.params.count || 5);

    const photosData = await Promise.all(data.rows.map((review) => pullReviewPhotos(review.id)));

    const result = await {
      product: req.params.product_id || req.query.product_id || req.body.product_id || 1,
      page: req.params.page || 0,
      count: req.params.count || 5,
      results: data.rows.map((review) => ({
        review_id: review.id,
        rating: review.rating,
        summary: review.summary,
        recommend: review.recommend,
        response: review.response || ' ',
        body: review.body,
        reviewer_name: review.reviewer_name,
        helpfulness: review.helpfulness,
        photos: photosData[data.rows.indexOf(review)].rows,
      })),
    };

    res.send((result));
  } catch {
    res.sendStatus(404);
  }
};

const getProductMeta = async (req, res) => {
  try {
    if (req.body.product_id === undefined && req.query.product_id === undefined
      && req.params.product_id === undefined) {
      res.sendStatus(404);
    }

    const params = req.body.product_id || req.params.product_id || req.query.product_id;
    const data = await pullReviewsMeta(params);

    const ratings = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const recommended = {
      false: 0,
      true: 0,
    };

    data.rows.forEach((review) => {
      ratings[review.rating] += 1;
      recommended[review.recommend] += 1;
    });

    const characteristicsData = await pullReviewsCharacteristics(params);
    const characteristics = {};
    const charLength = {};
    const charData = {};
    characteristicsData.rows.forEach((char) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!charData.hasOwnProperty(char.name)) {
        charData[char.name] = char.value;
        charLength[char.name] = 1;
      } else {
        charData[char.name] += char.value;
        charLength[char.name] += 1;
      }
    });

    characteristicsData.rows.forEach((char) => {
      characteristics[char.name] = {
        id: char.id,
        value: (charData[char.name] / charLength[char.name]).toString(),
      };
    });

    const result = {
      product_id: req.params.product_id || req.query.product_id || req.body.product_id,
      ratings,
      recommended,
      characteristics,
    };

    res.send(result);
  } catch {
    res.sendStatus(404);
  }
};

const postReviews = async (req, res) => {
  const productId = req.body.product_id || req.params.product_id || req.query.product_id;

  if (typeof productId !== 'number') {
    res.sendStatus(422);
  }

  if (typeof req.body.rating !== 'number' && (req.body.rating < 1 || req.body.rating > 5)) {
    res.sendStatus(422);
  }

  if (req.body.summary.length === 0 || req.body.summary > 255) {
    res.sendStatus(422);
  }

  if (req.body.body.length === 0) {
    res.sendStatus(422);
  }

  if (typeof req.body.recommend !== 'boolean') {
    res.sendStatus(422);
  }

  if (req.body.reviewer_name === 0 || req.body.reviewer_name > 50) {
    res.sendStatus(422);
  }

  if (req.body.reviewer_email === 0 || req.body.reviewer_email > 50) {
    res.sendStatus(422);
  }

  try {
    await saveReviews(
      productId,
      req.body.rating,
      Date.now().toString(),
      req.body.summary,
      req.body.body,
      req.body.recommend,
      req.body.reviewer_name,
      req.body.reviewer_email,
    );

    req.body.photos.forEach((photo) => {
      savePhotos(photo);
    });

    const chars = Object.entries(req.body.characteristics);
    await chars.forEach((char) => {
      saveCharacteristics(char[0], char[1]);
    });

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(404);
  }
};

const putReviewsHelpful = async (req, res) => {
  const params = req.body.review_id || req.params.review_id || req.query.review_id;
  try {
    updateReviewsHelpful(params);
    res.sendStatus('Updated Helpful');
  } catch (error) {
    res.sendStatus(404);
  }
};

const putReviewsReport = async (req, res) => {
  const params = req.body.review_id || req.params.review_id || req.query.review_id;
  try {
    updateReviewsReport(params);
    res.sendStatus('Updated Helpful');
  } catch (error) {
    res.sendStatus(404);
  }
};

module.exports.getProductReviews = getProductReviews;
module.exports.getProductMeta = getProductMeta;
module.exports.postReviews = postReviews;
module.exports.putReviewsHelpful = putReviewsHelpful;
module.exports.putReviewsReport = putReviewsReport;
