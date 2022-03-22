class APIFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    filter() {
      const queryObject = {...this.queryStr}; // destructuring
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      
      // console.log(req.query);
      excludedFields.forEach(el => delete queryObject[el]);
      // const toursTest = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
      
      // 2) Advanced filtering
      let queryString = JSON.stringify(queryObject);
      queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
      // console.log(JSON.parse(queryStr));
      
      this.query = this.query.find(JSON.parse(queryString));
  
      return this;
    }
  
    sort() {
      if(this.queryStr.sort) {
        const sortBy = this.queryStr.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
          this.query = this.query.sort('-createdAt');
      }
  
      return this; //Returns the object
    }
  
    limitFields(){
      if(this.queryStr.fields){
        const fieldBy = this.queryStr.fields.split(',').join(' ');
        this.query = this.query.select(fieldBy);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    pagination() {
      const page = this.queryStr.page*1 || 1;
      const limit = this.queryStr.limit * 1 || 100;
      const skip = (page - 1) * limit;
      
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports = APIFeatures;