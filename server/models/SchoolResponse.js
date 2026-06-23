const mongoose = require('mongoose');

const SchoolResponseSchema = new mongoose.Schema({
    reportingMonth: String,
    timestamp: Date,
    schoolName: String,
    schoolCode: String,
    district: String,
    block: String,
    pblConducted: Boolean,
    evidenceSubmitted: Boolean,
    classes: String,
    subjects: String,
    enrollmentClass6: Number,
    attendanceClass6Science: Number,
    attendanceClass6Math: Number,
    enrollmentClass7: Number,
    attendanceClass7Science: Number,
    attendanceClass7Math: Number,
    enrollmentClass8: Number,
    attendanceClass8Science: Number,
    attendanceClass8Math: Number,
    derivedTotalEnrollment: Number,
    derivedTotalAttendance: Number,
    derivedOverallAttendanceRate: Number,
    derivedRiskStatus: String
});

module.exports = mongoose.model('SchoolResponse', SchoolResponseSchema);
