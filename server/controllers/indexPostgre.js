const { pullReviews, pullReviewPhotos, pullReviewsMeta, pullReviewsCharacteristics, saveReviews, savePhotos, saveCharacteristics,
        updateReviewsHelpful, updateReviewsReport } = require('../models/indexPostgre.js');
const Promise = require('bluebird');

const getProductReviews = async (req, res) => {
  try {
    if ((req.body.product_id === undefined) && (req.query.product_id === undefined) && (req.params.product_id === undefined)) {
      res.sendStatus(404);
    }
    let params = [ req.body.product_id || req.params.product_id || req.query.product_id,
                 req.body.page || req.params.page || req.query.page || 0,
                 req.body.count || req.params.count || req.query.count || 5 ];
    console.log(params)
    let data = await pullReviews(params);
    let photosData = await Promise.all(data.map(review => pullReviewPhotos([review.id])))
    let result = {
      "product": parseInt(req.params.product_id || req.query.product_id || req.body.product_id) || 1,
      "page": parseInt(req.params.page) || 0,
      "count": parseInt(req.params.count) || 5,
      "results": data.map(review => {
        return {
        "review_id": review.id,
        "rating": review.rating,
        "summary": review.summary,
        "recommend": review.recommend,
        "response": review.response || ' ',
        "body": review.body,
        "reviewer_name": review.reviewer_name,
        "helpfulness": review.helpfulness,
        "photos": photosData[data.indexOf(review)]
      }
      })
    }
    res.send((result));
  } catch {
    res.sendStatus(404);
  }
}

const getProductMeta = async (req, res) => {
  try {
    if ((req.body.product_id === undefined) && (req.query.product_id === undefined) && (req.params.product_id === undefined)) {
      res.sendStatus(404);
    }

    let params = [ req.body.product_id || req.params.product_id || req.query.product_id];
    let data = await pullReviewsMeta(params);

    let ratings = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };

    let recommended = {
      "false":0,
      "true":0
    };

    data.forEach(review => {
        ratings[review.rating]++
        recommended[review.recommend]++
    })

    let characteristicsData = await pullReviewsCharacteristics(params);
    let characteristics = {};
    let charLength = {};
    let charData = {};
    characteristicsData.forEach(char => {
      if (!charData.hasOwnProperty(char.name)) {
        charData[char.name] = char.value;
        charLength[char.name] = 1;
      } else {
        charData[char.name] += char.value;
        charLength[char.name]++;
      }
    })
    characteristicsData.forEach(char => {
      characteristics[char.name] = {
        "id": char.id,
        "value": charData[char.name]/charLength[char.name]
      }
    })
    let result = {
      "product_id": req.params.product_id || req.query.product_id || req.body.product_id,
      "ratings": ratings,
      "recommended": recommended,
      "characteristics": characteristics
    }
    res.send(result);
  } catch {
    res.sendStatus(404);
  }
}

const postReviews = async (req, res) => {
  let reviewsParams = [req.body.product_id, req.body.rating, Date.now().toString(), req.body.summary, req.body.body, req.body.recommend, false, req.body.reviewer_name,
                req.body.reviewer_email, req.body.helpfulness]
  try {
    await saveReviews(reviewsParams)
    req.body.photos.forEach( async (photo) => {
      await savePhotos([photo])
    })
    for (let char of req.body.characteristics) {
      await saveCharacteristics([ParseInt(char), req.body.characteristics[char]])
    }
    res.send(201).status('CREATED!')
  } catch {
    res.send(404);
  }
}

const putReviewsHelpful = async (req, res) => {
  let params = [req.body.review_id]
  try {
    updateReviewsHelpful(params)
    res.send('Updated Helpful')
  } catch (error) {
    res.send(404)
  }
}

const putReviewsReport = async (req, res) => {
  let params = [req.body.review_id]
  try {
    updateReviewsReport(params)
    res.send('Updated Helpful')
  } catch (error) {
    res.send(404)
  }
}

module.exports.getProductReviews = getProductReviews;
module.exports.getProductMeta = getProductMeta;
module.exports.postReviews = postReviews;
module.exports.putReviewsHelpful = putReviewsHelpful;
module.exports.putReviewsReport = putReviewsReport;