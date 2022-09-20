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
    const params = [req.body.product_id || req.params.product_id || req.query.product_id,
      req.params.page || 0,
      req.params.count || 5];

    const data = await pullReviews(params);
    const photosData = await Promise.all(data.map((review) => pullReviewPhotos([review.id])));

    const result = {
      product: req.params.product_id || req.query.product_id || req.body.product_id || 1,
      page: req.params.page || 0,
      count: req.params.count || 5,
      results: data.map((review) => ({
        review_id: review.id,
        rating: review.rating,
        summary: review.summary,
        recommend: review.recommend,
        response: review.response || ' ',
        body: review.body,
        reviewer_name: review.reviewer_name,
        helpfulness: review.helpfulness,
        photos: photosData[data.indexOf(review)],
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

    const params = [req.body.product_id || req.params.product_id || req.query.product_id];
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

    data.forEach((review) => {
      ratings[review.rating] += 1;
      recommended[review.recommend] += 1;
    });

    const characteristicsData = await pullReviewsCharacteristics(params);
    const characteristics = {};
    const charLength = {};
    const charData = {};
    characteristicsData.forEach((char) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!charData.hasOwnProperty(char.name)) {
        charData[char.name] = char.value;
        charLength[char.name] = 1;
      } else {
        charData[char.name] += char.value;
        charLength[char.name] += 1;
      }
    });

    characteristicsData.forEach((char) => {
      characteristics[char.name] = {
        id: char.id,
        value: charData[char.name] / charLength[char.name],
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
  const reviewsParams = [req.body.product_id, req.body.rating, Date.now().toString(),
    req.body.summary, req.body.body, req.body.recommend, false, req.body.reviewer_name,
    req.body.reviewer_email, 0];

  try {
    await saveReviews(reviewsParams);
    req.body.photos.forEach(async (photo) => {
      await savePhotos([photo]);
    });

    const chars = Object.entries(req.body.characteristics);
    chars.forEach(async (char) => {
      await saveCharacteristics([char]);
    });

    res.send(201).status('CREATED!');
  } catch {
    res.send(404);
  }
};

const putReviewsHelpful = async (req, res) => {
  const params = [req.body.review_id];
  try {
    updateReviewsHelpful(params);
    res.send('Updated Helpful');
  } catch (error) {
    res.send(404);
  }
};

const putReviewsReport = async (req, res) => {
  const params = [req.body.review_id];
  try {
    updateReviewsReport(params);
    res.send('Updated Helpful');
  } catch (error) {
    res.send(404);
  }
};

module.exports.getProductReviews = getProductReviews;
module.exports.getProductMeta = getProductMeta;
module.exports.postReviews = postReviews;
module.exports.putReviewsHelpful = putReviewsHelpful;
module.exports.putReviewsReport = putReviewsReport;
