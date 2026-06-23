const mongoose = require('mongoose');

const MediaEvidenceSchema = new mongoose.Schema({
    recordId: String,
    recordType: String,
    grantId: String,
    donor: String,
    reportingMonth: String,
    district: String,
    title: String,
    summaryOrCaption: String,
    fileName: String,
    relativePath: String,
    usageNote: String
});

module.exports = mongoose.model('MediaEvidence', MediaEvidenceSchema);
