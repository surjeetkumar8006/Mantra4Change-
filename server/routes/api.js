const express = require('express');
const router = express.Router();
const SchoolResponse = require('../models/SchoolResponse');
const GrantFinance = require('../models/GrantFinance');
const GrantPerformance = require('../models/GrantPerformance');
const MediaEvidence = require('../models/MediaEvidence');

// Helper to get previous month (e.g. '2025-08' -> '2025-07')
function getPreviousMonth(monthStr) {
    if (!monthStr) return null;
    const [year, month] = monthStr.split('-');
    let prevMonth = parseInt(month) - 1;
    let prevYear = parseInt(year);
    if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
    return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
}

// Get Dashboard Metrics
router.get('/dashboard/metrics', async (req, res) => {
    try {
        const { month, district, block, grade, subject } = req.query;
        
        // Current Month Data
        let matchStage = {};
        if (month) matchStage.reportingMonth = month;
        if (district) matchStage.district = district;
        if (block) matchStage.block = block;
        if (grade) matchStage.classes = new RegExp(grade, 'i');
        if (subject) matchStage.subjects = new RegExp(subject, 'i');

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSchools: { $sum: 1 },
                    participatingSchools: { $sum: { $cond: [{ $eq: ["$pblConducted", true] }, 1, 0] } },
                    schoolsWithEvidence: { $sum: { $cond: [{ $eq: ["$evidenceSubmitted", true] }, 1, 0] } },
                    totalEnrollment: { $sum: "$derivedTotalEnrollment" },
                    totalAttendance: { $sum: "$derivedTotalAttendance" }
                }
            }
        ];

        const result = await SchoolResponse.aggregate(pipeline);
        const metrics = result[0] || { totalSchools: 0, participatingSchools: 0, schoolsWithEvidence: 0, totalEnrollment: 0, totalAttendance: 0 };
        
        const participationPercentage = metrics.totalSchools > 0 ? (metrics.participatingSchools / metrics.totalSchools) * 100 : 0;
        const evidenceSubmissionPercentage = metrics.totalSchools > 0 ? (metrics.schoolsWithEvidence / metrics.totalSchools) * 100 : 0;
        const attendancePercentage = metrics.totalEnrollment > 0 ? (metrics.totalAttendance / metrics.totalEnrollment) * 100 : 0;

        // Previous Month Data for MoM Trend
        let prevParticipationPercentage = participationPercentage;
        let prevAttendancePercentage = attendancePercentage;
        
        if (month) {
            let prevMatchStage = { ...matchStage, reportingMonth: getPreviousMonth(month) };
            const prevResult = await SchoolResponse.aggregate([{ $match: prevMatchStage }, pipeline[1]]);
            if (prevResult.length > 0) {
                const p = prevResult[0];
                prevParticipationPercentage = p.totalSchools > 0 ? (p.participatingSchools / p.totalSchools) * 100 : 0;
                prevAttendancePercentage = p.totalEnrollment > 0 ? (p.totalAttendance / p.totalEnrollment) * 100 : 0;
            }
        }

        const momParticipation = participationPercentage - prevParticipationPercentage;
        const momAttendance = attendancePercentage - prevAttendancePercentage;

        res.json({
            ...metrics,
            participationPercentage,
            evidenceSubmissionPercentage,
            attendancePercentage,
            momParticipation,
            momAttendance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get District and Block Performance
router.get('/dashboard/performance', async (req, res) => {
    try {
        const { month } = req.query;
        let matchStage = {};
        if (month) matchStage.reportingMonth = month;

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: { district: "$district", block: "$block" },
                    totalSchools: { $sum: 1 },
                    pblConducted: { $sum: { $cond: [{ $eq: ["$pblConducted", true] }, 1, 0] } },
                    totalEnrollment: { $sum: "$derivedTotalEnrollment" },
                    totalAttendance: { $sum: "$derivedTotalAttendance" }
                }
            },
            {
                $project: {
                    _id: 0,
                    district: "$_id.district",
                    block: "$_id.block",
                    totalSchools: 1,
                    participationRate: {
                        $cond: [{ $gt: ["$totalSchools", 0] }, { $divide: ["$pblConducted", "$totalSchools"] }, 0]
                    },
                    attendanceRate: {
                        $cond: [{ $gt: ["$totalEnrollment", 0] }, { $divide: ["$totalAttendance", "$totalEnrollment"] }, 0]
                    }
                }
            },
            { $sort: { participationRate: -1 } }
        ];

        let results = await SchoolResponse.aggregate(pipeline);

        // Deterministic Risk & Gap Engine
        // On Track >= 75%; Behind 60% to below 75%; At Risk 35% to below 60%; Critical below 35%
        results = results.map(row => {
            const score = row.participationRate * 100;
            let riskStatus = 'Critical';
            if (score >= 75) riskStatus = 'On Track';
            else if (score >= 60) riskStatus = 'Behind';
            else if (score >= 35) riskStatus = 'At Risk';
            
            return { ...row, riskStatus };
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Grants List
router.get('/grants', async (req, res) => {
    try {
        const grants = await GrantFinance.aggregate([
            { $group: { _id: { grantId: "$grantId", grantName: "$grantName" } } },
            { $project: { _id: 0, id: "$_id.grantId", name: "$_id.grantName" } }
        ]);
        const months = await GrantPerformance.distinct("reportingMonth");
        res.json({ grants, months });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific Grant Report
router.get('/grants/report', async (req, res) => {
    try {
        const { grantId, month } = req.query;
        if (!grantId || !month) return res.status(400).json({ error: "grantId and month are required" });

        const finance = await GrantFinance.find({ grantId, reportingMonth: month });
        const performance = await GrantPerformance.findOne({ grantId, reportingMonth: month });
        const media = await MediaEvidence.find({ grantId, reportingMonth: month });

        res.json({ finance, performance, media });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Narrative Mock Endpoint
router.post('/grants/generate-narrative', async (req, res) => {
    try {
        const { performance, finance } = req.body;
        if (!performance) return res.status(400).json({ error: "Missing performance data" });

        // Deterministic rule-based narrative generation
        const completionRateStr = (performance.pblCompletionRate * 100).toFixed(1) + '%';
        const evidenceRateStr = (performance.evidenceSubmissionRate * 100).toFixed(1) + '%';
        const attendanceRateStr = (performance.attendanceRate * 100).toFixed(1) + '%';

        let narrative = `In ${performance.reportingMonth}, ${performance.grantName} reached ${completionRateStr} PBL completion, `;
        narrative += `${evidenceRateStr} evidence submission, and ${attendanceRateStr} attendance. `;
        narrative += `Status: ${performance.riskStatus}. `;

        if (performance.riskStatus !== 'On Track') {
            narrative += `Needs attention on areas falling behind expectations. Use district and block dashboards to identify priority follow-up areas. `;
        }
        
        narrative += `Report Status: ${performance.reportStatus}.`;

        res.json({ narrative, generatedFromFacts: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Program Review Summary (Tier 2)
router.get('/dashboard/summary', async (req, res) => {
    try {
        const { month, district } = req.query;
        let matchStage = {};
        if (month) matchStage.reportingMonth = month;
        if (district) matchStage.district = district;

        // Fetch performance data for the summary
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSchools: { $sum: 1 },
                    pblConducted: { $sum: { $cond: [{ $eq: ["$pblConducted", true] }, 1, 0] } },
                    totalEnrollment: { $sum: "$derivedTotalEnrollment" },
                    totalAttendance: { $sum: "$derivedTotalAttendance" }
                }
            }
        ];
        const result = await SchoolResponse.aggregate(pipeline);
        if (!result.length) return res.json({ summary: "No data available to generate a summary for this selection." });

        const metrics = result[0];
        const participationRate = (metrics.pblConducted / metrics.totalSchools) * 100;
        const attendanceRate = (metrics.totalEnrollment > 0) ? (metrics.totalAttendance / metrics.totalEnrollment) * 100 : 0;
        
        let overallRisk = 'Critical';
        if (participationRate >= 75) overallRisk = 'On Track';
        else if (participationRate >= 60) overallRisk = 'Behind';
        else if (participationRate >= 35) overallRisk = 'At Risk';

        const summary = `In ${month || 'the selected period'}, ${district ? district : 'the overall program'} achieved a participation rate of ${participationRate.toFixed(1)}% across ${metrics.totalSchools} schools, with an attendance rate of ${attendanceRate.toFixed(1)}%. The overall status is currently classified as "${overallRisk}". Priorities for the upcoming month should focus on mobilizing blocks with high non-participation and improving evidence submission practices.`;
        
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Recommended Actions (Tier 3)
router.get('/dashboard/actions', async (req, res) => {
    try {
        const { month, district } = req.query;
        let matchStage = {};
        if (month) matchStage.reportingMonth = month;
        if (district) matchStage.district = district;

        // Find worst performing blocks
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: { district: "$district", block: "$block" },
                    totalSchools: { $sum: 1 },
                    pblConducted: { $sum: { $cond: [{ $eq: ["$pblConducted", true] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    district: "$_id.district",
                    block: "$_id.block",
                    participationRate: {
                        $cond: [{ $gt: ["$totalSchools", 0] }, { $divide: ["$pblConducted", "$totalSchools"] }, 0]
                    }
                }
            },
            { $sort: { participationRate: 1 } },
            { $limit: 3 }
        ];

        const worstBlocks = await SchoolResponse.aggregate(pipeline);
        const actions = worstBlocks.map((b, index) => {
            const riskStr = (b.participationRate * 100) < 35 ? 'Critical' : 'At Risk';
            return {
                id: `ACT-${Date.now()}-${index}`,
                title: `Conduct immediate PBL mobilization visit in ${b.block}`,
                owner: `${b.district} Program Manager`,
                priority: 'High',
                dueDate: 'Within 7 days',
                status: 'Open',
                linkedMetric: `${riskStr} Participation (${(b.participationRate * 100).toFixed(1)}%)`
            };
        });

        res.json(actions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
