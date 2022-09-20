const { Reviews, ReviewsPhotos, ReviewsCharacteristics } = require('../databases/mongodb');

const saveReviews = (data, callback) => {
  Reviews.create(data, (err, result) => {
    if (err) {
      console.log('MODELS ERROR');
      callback(err, null);
    } else {
      console.log('MODELS SAVED');
      callback(null, result);
    }
  });
};

const savePhotos = (data, callback) => {
  ReviewsPhotos.create(data)((err, result) => {
    if (err) {
      console.log('MODELS ERROR');
      callback(err, null);
    } else {
      console.log('MODELS SAVED');
      callback(null, result);
    }
  });
};

const saveCharacteristics = (data, callback) => {
  ReviewsCharacteristics.create(data, (err, result) => {
    if (err) {
      console.log('MODELS ERROR');
      callback(err, null);
    } else {
      console.log('MODELS SAVED');
      callback(null, result);
    }
  });
};

module.exports.saveReviews = saveReviews;
module.exports.savePhotos = savePhotos;
module.exports.saveCharacteristics = saveCharacteristics;
