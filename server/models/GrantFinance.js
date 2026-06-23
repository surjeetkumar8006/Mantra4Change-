const mongoose = require('mongoose');

const GrantFinanceSchema = new mongoose.Schema({
    grantId: String,
    donor: String,
    grantName: String,
    periodStart: Date,
    periodEnd: Date,
    coveredDistricts: [String],
    reportingMonth: String,
    budgetLine: String,
    approvedBudgetUnits: Number,
    monthlyUtilizedUnits: Number,
    cumulativeUtilizedUnits: Number,
    cumulativeUtilizationRate: Number,
    financeNote: String
});

module.exports = mongoose.model('GrantFinance', GrantFinanceSchema);
