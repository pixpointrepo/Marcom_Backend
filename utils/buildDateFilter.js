
const buildDateFilter = (startDate, endDate) => {
    if(!startDate && !endDate) return null;

    const filter = {};
    if (startDate) filter.$gte = new Date(startDate);
     
    if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);  // Add 1 day
        filter.$lte = end;
    }
    
    return filter;
  };

module.exports = buildDateFilter;