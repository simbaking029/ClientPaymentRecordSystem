const Payment = require('../models/Payment');

  // Get payments monthly and by client
  exports.getMonthlyPayments=async(req,res)=>{
    try{
        const payments = await Payment.aggregate([
            {
              // Stage 1: Extract the month from the date field
              $addFields: {
                month: { $month: "$date" }
              }
            },
            {
              // Stage 2: Group by userId and month, sum payments
              $group: {
                _id: {
                  userId: "$userId",
                  month: "$month"
                },
                totalPayAmount: { $sum: "$amount" }
              }
            },
            {
              // Stage 3: Group by userId and push the monthly data (month and totalPayAmount)
              $group: {
                _id: "$_id.userId",
                monthlyData: {
                  $push: {
                    month: "$_id.month",
                    totalPayAmount: "$totalPayAmount"
                  }
                }
              }
            },
            {
              // Stage 4: Generate all months (1-12) with names and merge with the actual data
              $addFields: {
                allMonths: [
                  { month: 1, monthName: "January", totalPayAmount: 0 },
                  { month: 2, monthName: "February", totalPayAmount: 0 },
                  { month: 3, monthName: "March", totalPayAmount: 0 },
                  { month: 4, monthName: "April", totalPayAmount: 0 },
                  { month: 5, monthName: "May", totalPayAmount: 0 },
                  { month: 6, monthName: "June", totalPayAmount: 0 },
                  { month: 7, monthName: "July", totalPayAmount: 0 },
                  { month: 8, monthName: "August", totalPayAmount: 0 },
                  { month: 9, monthName: "September", totalPayAmount: 0 },
                  { month: 10, monthName: "October", totalPayAmount: 0 },
                  { month: 11, monthName: "November", totalPayAmount: 0 },
                  { month: 12, monthName: "December", totalPayAmount: 0 }
                ]
              }
            },
            {
              // Stage 5: Merge zeroed months with actual data
              $project: {
                userId: "$_id",
                monthlyData: {
                  $map: {
                    input: "$allMonths",
                    as: "m",
                    in: {
                      monthName: "$$m.monthName",
                      totalPayAmount: {
                        $let: {
                          vars: {
                            matchingMonth: {
                              $filter: {
                                input: "$monthlyData",
                                as: "md",
                                cond: { $eq: ["$$md.month", "$$m.month"] }
                              }
                            }
                          },
                          in: {
                            $cond: {
                              if: { $gt: [{ $size: "$$matchingMonth" }, 0] },
                              then: { $arrayElemAt: ["$$matchingMonth.totalPayAmount", 0] },
                              else: "$$m.totalPayAmount"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              // Stage 6: Perform a $lookup to join with the user collection to get email and password
              $lookup: {
                from: "users",        // The name of the collection where users are stored
                localField: "userId", // The field in the payments collection (from stage 5)
                foreignField: "_id",  // The field in the user collection that matches userId
                as: "userInfo"        // The output array that contains matched user information
              }
            },
            {
              // Stage 7: Unwind the userInfo array to include the email and password fields
              $unwind: "$userInfo"
            },
            {
              // Stage 8: Replace the root so month data, email, and password appear at the top level
              $addFields: {
                mergedData: {
                  $arrayToObject: {
                    $map: {
                      input: "$monthlyData",
                      as: "md",
                      in: {
                        k: "$$md.monthName",
                        v: "$$md.totalPayAmount"
                      }
                    }
                  }
                }
              }
            },
            {
              // Stage 9: Flatten the result so month names, email, and password appear directly under the userId
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    { userId: "$userId", email: "$userInfo.email", password: "$userInfo.password" },
                    "$mergedData"
                  ]
                }
              }
            }
          ]);
          res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
  }