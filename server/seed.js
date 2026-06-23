require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const connectDB = require('./db');
const mongoose = require('mongoose');

const SchoolResponse = require('./models/SchoolResponse');
const GrantFinance = require('./models/GrantFinance');
const GrantPerformance = require('./models/GrantPerformance');
const MediaEvidence = require('./models/MediaEvidence');

// Setup file paths
const pblDataDir = path.join(__dirname, '../02_Primary_PBL_Data/csv_exports');
const grantCsvDir = path.join(__dirname, '../03_Grant_Reporting_Evidence/csv');

// Helper to parse CSV and return a promise
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

const runSeed = async () => {
    await connectDB();
    console.log('Seeding data...');

    try {
        // Clear existing data
        await SchoolResponse.deleteMany({});
        await GrantFinance.deleteMany({});
        await GrantPerformance.deleteMany({});
        await MediaEvidence.deleteMany({});
        console.log('Cleared existing collections');

        // 1. Ingest PBL Data
        const pblFiles = ['PBL_School_Response_Data_July_2025.csv', 'PBL_School_Response_Data_August_2025.csv', 'PBL_School_Response_Data_September_2025.csv'];
        for (const file of pblFiles) {
            const pblRows = await parseCSV(path.join(pblDataDir, file));
            const formattedPbl = pblRows.map(row => ({
                reportingMonth: row['Reporting Month'],
                timestamp: new Date(row['Timestamp']),
                schoolName: row['What is the name of your school?'],
                schoolCode: row['What is your school\'s synthetic school code?'],
                district: row['What is the name of your district?'],
                block: row['Block Details'],
                pblConducted: row['Was the PBL project conducted in your school this month?'] === 'Yes',
                evidenceSubmitted: row['Was evidence submitted for the completed PBL project?'] === 'Yes',
                classes: row['In which class/classes did you conduct the PBL project?'],
                subjects: row['Which subject do you teach?'],
                enrollmentClass6: parseInt(row['Total number of students enrolled in Class 6, including all sections']) || 0,
                attendanceClass6Science: parseInt(row['Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0.']) || 0,
                attendanceClass6Math: parseInt(row['Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0.']) || 0,
                enrollmentClass7: parseInt(row['Total number of students enrolled in Class 7, including all sections']) || 0,
                attendanceClass7Science: parseInt(row['Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0.']) || 0,
                attendanceClass7Math: parseInt(row['Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0.']) || 0,
                enrollmentClass8: parseInt(row['Total number of students enrolled in Class 8, including all sections']) || 0,
                attendanceClass8Science: parseInt(row['Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0.']) || 0,
                attendanceClass8Math: parseInt(row['Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0.']) || 0,
                derivedTotalEnrollment: parseInt(row['Derived: Total enrollment across Classes 6-8']) || 0,
                derivedTotalAttendance: parseInt(row['Derived: Total attendance across PBL Science and Math sessions']) || 0,
                derivedOverallAttendanceRate: parseFloat(row['Derived: Overall PBL attendance rate']) || 0,
                derivedRiskStatus: row['Derived: Risk status']
            }));
            await SchoolResponse.insertMany(formattedPbl);
            console.log(`Inserted ${formattedPbl.length} records from ${file}`);
        }

        // 2. Ingest Grant Finance Data
        const financeRows = await parseCSV(path.join(grantCsvDir, '01_Grant_Profile_and_Finance.csv'));
        const formattedFinance = financeRows.map(row => ({
            grantId: row['grant_id'],
            donor: row['donor'],
            grantName: row['grant_name'],
            periodStart: new Date(row['period_start']),
            periodEnd: new Date(row['period_end']),
            coveredDistricts: row['covered_districts'].split(';').map(d => d.trim()),
            reportingMonth: row['reporting_month'],
            budgetLine: row['budget_line'],
            approvedBudgetUnits: parseInt(row['approved_budget_units']) || 0,
            monthlyUtilizedUnits: parseInt(row['monthly_utilized_units']) || 0,
            cumulativeUtilizedUnits: parseInt(row['cumulative_utilized_units']) || 0,
            cumulativeUtilizationRate: parseFloat(row['cumulative_utilization_rate']) || 0,
            financeNote: row['finance_note']
        }));
        await GrantFinance.insertMany(formattedFinance);
        console.log(`Inserted ${formattedFinance.length} records for Grant Finance`);

        // 3. Ingest Grant Performance Data
        const perfRows = await parseCSV(path.join(grantCsvDir, '02_Grant_Performance_and_Report_Material.csv'));
        const formattedPerf = perfRows.map(row => ({
            grantId: row['grant_id'],
            donor: row['donor'],
            grantName: row['grant_name'],
            reportingMonth: row['reporting_month'],
            periodEndDate: new Date(row['period_end_date']),
            reportDueDate: new Date(row['report_due_date']),
            reportStatus: row['report_status'],
            coveredDistricts: row['covered_districts'].split(';').map(d => d.trim()),
            sampledSchoolRecords: parseInt(row['sampled_school_records']) || 0,
            schoolsCompletedPbl: parseInt(row['schools_completed_pbl']) || 0,
            pblCompletionRate: parseFloat(row['pbl_completion_rate']) || 0,
            schoolsWithEvidence: parseInt(row['schools_with_evidence']) || 0,
            evidenceSubmissionRate: parseFloat(row['evidence_submission_rate']) || 0,
            totalEnrollment: parseInt(row['total_enrollment']) || 0,
            totalAttendance: parseInt(row['total_attendance']) || 0,
            attendanceRate: parseFloat(row['attendance_rate']) || 0,
            riskStatus: row['risk_status'],
            milestoneSummary: row['milestone_summary'],
            draftReportText: row['draft_report_text']
        }));
        await GrantPerformance.insertMany(formattedPerf);
        console.log(`Inserted ${formattedPerf.length} records for Grant Performance`);

        // 4. Ingest Media Evidence
        const mediaRows = await parseCSV(path.join(grantCsvDir, '03_Evidence_and_Media_Index.csv'));
        const formattedMedia = mediaRows.map(row => ({
            recordId: row['record_id'],
            recordType: row['record_type'],
            grantId: row['grant_id'],
            donor: row['donor'],
            reportingMonth: row['reporting_month'],
            district: row['district'],
            title: row['title'],
            summaryOrCaption: row['summary_or_caption'],
            fileName: row['file_name'],
            relativePath: row['relative_path'],
            usageNote: row['usage_note']
        }));
        await MediaEvidence.insertMany(formattedMedia);
        console.log(`Inserted ${formattedMedia.length} records for Media Evidence`);

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

runSeed();
