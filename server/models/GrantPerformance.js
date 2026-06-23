const mongoose = require('mongoose');

const GrantPerformanceSchema = new mongoose.Schema({
    grantId: String,
    donor: String,
    grantName: String,
    reportingMonth: String,
    periodEndDate: Date,
    reportDueDate: Date,
    reportStatus: String,
    coveredDistricts: [String],
    sampledSchoolRecords: Number,
    schoolsCompletedPbl: Number,
    pblCompletionRate: Number,
    schoolsWithEvidence: Number,
    evidenceSubmissionRate: Number,
    totalEnrollment: Number,
    totalAttendance: Number,
    attendanceRate: Number,
    riskStatus: String,
    milestoneSummary: String,
    draftReportText: String
});

module.exports = mongoose.model('GrantPerformance', GrantPerformanceSchema);
