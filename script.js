/**
 * KQ Settlement Checklist Builder
 * Production-ready legal intake tool for Partner Routes (SET(M)/SET(O))
 * Version: 1.1.0 (6-Step UX Refactor)
 */

// ============================================
// APPLICATION STATE MANAGEMENT
// ============================================

const TOTAL_STEPS = 6; // 🔥 UPDATED

const AppState = {
    currentStep: 0,
    data: {
        routeType: null,
        moduleType: null,
        hasChildren: false,
        childrenCount: 0,
        childrenNonEnglish: false,
        nonEnglishDocs: false,

        sponsorEmployed: null,
        employerDuration: null,
        incomeType: null,
        salaryBank: null,
        employmentChanges: null,
        payslipsComplete: null,

        businessType: null,
        financialYearDocs: null,
        saSubmitted: null,
        sa302Available: null,
        businessBankStatements: null,
        ongoingTrading: null,
        vatRegistered: null,
        accountantUsed: null,

        deathCertAvailable: null,
        lastLeavePartner: null,
        marriageCertAvailable: null,
        relationshipEvidence: null,
        previousMarriage: 'No',
        nameChanged: 'no',

        cohabitationType: null,
        accommodationType: null,
        accommodationOvercrowded: null,

        riskFlags: [],
        checklistItems: [],
        generatedAt: null
    }
};

// ============================================
// CHECKLIST DATA REPOSITORY
// Centralized definition of all checklist items for maintainability
// ============================================

const ChecklistRepository = {
    // Core applicant documents (all routes)
    coreApplicant: [
        {
            id: 'app_passport',
            title: 'Valid Passport or Travel Document',
            description: 'Current passport. Include any previous passports showing UK immigration history.',
            category: 'mandatory',
            section: 'applicant'
        },
            {
            id: "evise_status",
            title: "UKVI eVisa Status (Online Immigration Status + Share Code)",
            description: "Provide your UKVI online immigration status (eVisa) and a valid share code for verification.",
            category: "mandatory",
            section: 'applicant'
        },
        {
            id: "previous_brps",
            title: "Previous BRPs or Immigration Documents (If Issued)",
            description: "Include copies of any previous BRP cards and immigration documents showing your historic immigration status.",
            category: "recommended",
            section: 'applicant'
        },
        {
            id: 'app_photos',
            title: 'Passport-Sized Photographs',
            description: 'Two colour photographs meeting UKVI specifications (if paper application).',
            category: 'conditional',
            section: 'applicant',
            condition: (state) => state.routeType === 'SETM_STANDARD'
        },
        {
            id: 'app_name_change',
            title: 'Deed Poll or Statutory Declaration (Name Change)',
            description: 'Required if applicant or sponsor has ever changed their name. Must provide deed poll, statutory declaration, or other official evidence linking previous name(s) to current name.',
            category: 'conditional',
            section: 'applicant',
            condition: (state) => state.nameChanged === 'yes'
        },
    ],
    
    // SET(M) Specific - Relationship & Cohabitation
    setmRelationship: [
        {
            id: 'rel_marriage_cert',
            title: 'Marriage/Civil Partnership Certificate',
            description: 'Original or certified copy. Foreign marriages must be legally valid in UK law.',
            category: 'mandatory',
            section: 'relationship'
        },
        {
            id: 'rel_previous_marriage_termination',
            title: 'Evidence of Termination of Previous Marriage / Civil Partnership',
            description: 'If either party has previously been married or in a civil partnership, provide the final divorce order (Decree Absolute or Final Order), dissolution order, or death certificate confirming the previous relationship has permanently broken down. Overseas divorces must be legally recognised in the UK.',
            category: 'conditional',
            section: 'relationship',
            condition: (state) => state.previousMarriage === 'Yes'
        },
        {
            id: 'rel_cohabitation',
            title: 'Cohabitation Evidence',
            description: 'Cohabitation evidence covering the period since the last grant of leave (and across the qualifying period), showing you and your partner have lived together in the UK. Joint bank statements, utility bills, tenancy agreements, or official correspondence addressed to both at same address, spread over the required period.',
            category: 'mandatory',
             section: 'relationship'
        },
        {
            id: 'rel_photos',
            title: 'Relationship Photographs',
            description: 'Selection of photos throughout relationship with dates and locations.',
            category: 'recommended',
            section: 'relationship'
        },
        {
            id: 'rel_communication',
            title: 'Communication Evidence',
            description: 'Screenshots of conversations, emails, or call logs showing ongoing relationship.',
            category: 'conditional',
            section: 'relationship',
            condition: (state) => state.cohabitationType === 'separate' || state.cohabitationType === 'limited'
        },
        {
            id: 'rel_travel_evidence',
            title: 'Travel & Visit Evidence',
            description: 'Flight tickets, boarding passes, hotel reservations, or travel itineraries showing you have met in person or traveled together. Include dates and locations.',
            category: 'recommended',
            section: 'relationship',
            condition: (state) => state.cohabitationType === 'limited' || state.cohabitationType === 'separate'
        },
    ],
    
    // SET(M) Employed Sponsor Documents
    setmEmployedSponsor: [
        {
            id: 'emp_payslips',
            title: 'Payslips (6 months or 12 months if variable)',
            description: 'All payslips covering the required period. Must be official and consecutive.',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'emp_bank_statements',
            title: 'Personal Bank Statements (Corresponding to Payslips)',
            description: 'Personal bank statements corresponding to the same period(s) as the payslips relied upon, clearly showing that the salary has been paid into an account in the name of the sponsor (or jointly with their partner).',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'emp_letter',
            title: 'Employer Letter (Appendix FM-SE Compliant)',
            description: 'Letter from the employer(s) confirming: (1) the employment; (2) the gross annual salary; (3) how long the employment has been held; (4) the period over which the person has been paid the level of salary stated; and (5) the type of employment (permanent, fixed-term contract, or agency).',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'emp_contract',
            title: 'Employment Contract',
            description: 'Signed contract of employment.',
            category: 'recommended',
            section: 'sponsor'
        },
        {
            id: 'emp_p60',
            title: 'P60 (if available)',
            description: 'Most recent P60 showing annual earnings.',
            category: 'recommended',
            section: 'sponsor'
        },
        {
            id: 'emp_multiple',
            title: 'Multiple Employer Evidence',
            description: 'If sponsor has multiple jobs, evidence for each employment covering the required periods.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.incomeType === 'mixed'
        },
        {
            id: 'emp_variable_expl',
            title: 'Variable Income Explanation',
            description: 'Written explanation of income fluctuations with supporting evidence.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.incomeType === 'variable'
        },
        {
            id: 'emp_change_expl',
            title: 'Employment Change Explanation',
            description: 'Explanation for recent job changes, maternity leave, or sick leave with supporting docs.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.employmentChanges !== 'none'
        }
    ],
    
    // SET(M) Self-Employed Sponsor Documents
    setmSelfEmployedSponsor: [
        {
            id: 'se_tax_return',
            title: 'Self-Assessment Tax Return (SA100)',
            description: 'Full tax return for the last full financial year.',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
           id: 'se_sa302',
           title: 'Statement of Account (SA200) or SA302 (HMRC)',
           description: 'Provide either an HMRC Statement of Account (SA200) or an SA302 tax calculation for the last full financial year (or the tax year(s) relied upon). This should align with the declared income and support the tax position shown in HMRC records.',
           category: 'mandatory',
           section: 'sponsor'
        },
        {
            id: 'se_statement_of_account',
            title: 'HMRC Statement of Account (SA200) / Tax Liability Status',
            description: 'HMRC Statement of Account (SA200) or equivalent document confirming the amount of tax payable, paid, and unpaid for the last full financial year. This must align with the SA302 figures and demonstrates tax compliance status.',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'se_hmrc_evidence',
            title: 'HMRC Registration & UTR Evidence',
            description: 'HMRC evidence confirming registration for Self Assessment/self-employment and the relevant Unique Taxpayer Reference (UTR). Provide UTR confirmation notice(s) or HMRC correspondence showing: (1) the sponsor’s personal UTR, and (2) where applicable, the business/partnership UTR.',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
             id: 'se_utr_notices',
             title: 'UTR Confirmation Notice(s)',
             description: 'UTR confirmation notice(s) / HMRC letter(s) showing the sponsor’s personal UTR and, if applicable, the business/partnership UTR.',
             category: 'mandatory',
             section: 'sponsor'
        },
        {
            id: 'se_bank_personal',
            title: 'Personal Bank Statements (same period as tax return(s))',
            description: 'Personal bank statements covering the same 12-month period as the tax return(s), showing that income from self-employment has been paid into an account in the name of the sponsor (or jointly with their partner).',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'se_bank_business',
            title: 'Business Bank Statements (same period as tax return(s))',
            description: 'Where a separate business bank account exists, provide statements covering the same financial period as the tax return(s) relied upon (typically the last full financial year).',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.businessBankStatements !== 'na'
        },
        {
            id: 'se_accounts_audited',
            title: 'Annual Audited Accounts (last financial year) (if applicable)',
            description: 'Annual audited accounts for the last full financial year, where the business is required to produce audited accounts.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.accountantUsed === 'yes'
        },
        {
            id: 'se_accounts_unaudited',
            title: 'Unaudited Accounts (last full financial year)',
            description: 'Unaudited accounts for the last full financial year (where audited accounts are not required).',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'se_accountant_certificate',
            title: 'Accountant’s Certificate (for unaudited accounts)',
            description: 'Accountant’s certificate confirming the unaudited accounts for the last full financial year. The accountant must be a member of a UK Recognised Supervisory Body (Companies Act 2006) or a member of the Institute of Financial Accountants (IFA). The certificate must confirm the accountant’s full details, professional membership/registration, and that they prepared or checked the accounts for the relevant period.',
            category: 'mandatory',
            section: 'sponsor',
            condition: (state) => state.accountantUsed === 'yes'
        },
        {
            id: 'se_ongoing',
            title: 'Ongoing Trading Evidence',
            description: 'Recent invoices, contracts, or client confirmations showing business continues.',
            category: 'mandatory',
            section: 'sponsor'
        },
        {
            id: 'se_vat',
            title: 'VAT Registration Certificate',
            description: 'If VAT registered, proof of VAT number and returns.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.vatRegistered === 'yes'
        },
        {
            id: 'se_franchise',
            title: 'Franchise Agreement',
            description: 'If operating as franchisee, copy of franchise agreement.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.businessType === 'franchise'
        },
        {
            id: 'se_accountant',
            title: 'Accountant Letter',
            description: 'Chartered/certified accountant confirming business details and income.',
            category: 'recommended',
            section: 'sponsor'
        },
        {
            id: 'se_amended',
            title: 'Amended Return Explanation',
            description: 'If using provisional figures or amended returns, detailed explanation required.',
            category: 'conditional',
            section: 'sponsor',
            condition: (state) => state.saSubmitted === 'provisional'
        }
    ],
    
    // SET(O) Bereavement Specific
    setoBereavement: [
        {
            id: 'ber_death_cert',
            title: 'Death Certificate',
            description: 'Original or certified copy of partner\'s death certificate. Foreign certificates may need translation/apostille.',
            category: 'mandatory',
            section: 'bereavement'
        },
        {
            id: 'ber_marriage',
            title: 'Marriage/Civil Partnership Certificate',
            description: 'Proof of relationship to deceased partner.',
            category: 'mandatory',
            section: 'bereavement'
        },
        {
            id: 'ber_partner_status',
            title: 'Deceased Partner Status Evidence',
            description: 'Proof partner was British citizen or settled (passport copy, naturalisation certificate, or BRP).',
            category: 'mandatory',
            section: 'bereavement'
        },
        {
            id: 'ber_previous_leave',
            title: 'Evidence of Previous Partner Leave',
            description: 'Evidence that last grant of leave was as a partner of the deceased.',
            category: 'mandatory',
            section: 'bereavement'
        },
        {
            id: 'ber_relationship',
            title: 'Relationship Evidence up to Death',
            description: 'Cohabitation evidence, joint documents, photos, communications up to date of death.',
            category: 'mandatory',
            section: 'bereavement'
        },
        {
            id: 'ber_shared_address',
            title: 'Shared Address Evidence',
            description: 'Utility bills, council tax, or correspondence showing shared residence.',
            category: 'recommended',
            section: 'bereavement'
        }
    ],
    
    // Accommodation Documents
    accommodation: [
        {
            id: 'acc_tenancy',
            title: 'Tenancy Agreement or Title Deeds',
            description: 'Evidence of accommodation ownership or rental agreement.',
            category: 'mandatory',
            section: 'accommodation'
        },
        {
            id: 'acc_landlord',
            title: 'Landlord Letter (if renting)',
            description: 'Confirming tenancy terms, property size, and occupancy.',
            category: 'conditional',
            section: 'accommodation',
            condition: (state) => state.accommodationType === 'rented' || state.accommodationType === 'family'
        },
        {
            id: 'acc_council_tax',
            title: 'Council Tax Statement',
            description: 'Recent council tax bill showing property details.',
            category: 'recommended',
            section: 'accommodation'
        },
        {
            id: 'acc_overcrowd',
            title: 'Overcrowding Explanation',
            description: 'If property may be overcrowded, explanation of sleeping arrangements.',
            category: 'conditional',
            section: 'accommodation',
            condition: (state) => state.accommodationOvercrowded === 'yes'
        }
    ],
    
    // English Language & Life in UK
    englishRequirements: [
        {
            id: 'eng_certificate',
            title: 'English Language Certificate (B1 CEFR minimum)',
            description: 'Secure English Language Test (SELT) certificate from approved provider, unless exempt.',
            category: 'mandatory',
            section: 'english'
        },
        {
            id: 'eng_degree',
            title: 'Degree Certificate (if claiming degree exemption)',
            description: 'UK degree or NARIC-confirmed English-taught degree.',
            category: 'conditional',
            section: 'english'
        },
        {
            id: 'lituk_certificate',
            title: 'Life in the UK Test Pass Certificate',
            description: 'Official pass letter or certificate number required.',
            category: 'mandatory',
            section: 'english'
        }
    ],
    
    // Children Documents
    childrenDocuments: [
        {
            id: 'child_passports',
            title: 'Children\'s Passports',
            description: 'Valid passports for all children included.',
            category: 'mandatory',
            section: 'children'
        },
        {
            id: 'child_brp',
            title: 'Children\'s BRPs (if applicable)',
            description: 'Current residence permits for children.',
            category: 'mandatory',
            section: 'children'
        },
        {
            id: 'child_birth_certs',
            title: 'Birth Certificates',
            description: 'Full birth certificates showing parentage.',
            category: 'mandatory',
            section: 'children'
        },
        {
            id: 'child_custody',
            title: 'Custody/Consent Evidence',
            description: 'If other parent not applying, evidence of sole responsibility or consent.',
            category: 'conditional',
            section: 'children'
        },
        {
            id: 'child_school',
            title: 'School Letters/Evidence',
            description: 'Confirmation of schooling in UK.',
            category: 'recommended',
            section: 'children'
        }
    ],
    
    // Translation Requirements
    translations: [
        {
            id: 'trans_certified',
            title: 'Certified Translations',
            description: 'All non-English documents must be accompanied by certified translation including translator confirmation.',
            category: 'mandatory',
            section: 'administrative'
        },
        {
            id: 'trans_translator',
            title: 'Translator Credentials',
            description: 'Details of translation company or qualified translator.',
            category: 'conditional',
            section: 'administrative'
        }
    ]
};

// ============================================
// RISK ASSESSMENT ENGINE
// ============================================

const RiskEngine = {
    assess: function(state) {
        const risks = [];
        
        // Critical Risks
        if (state.routeType === 'SETO_BEREAVEMENT' && state.deathCertAvailable === 'no') {
            risks.push({
                severity: 'critical',
                title: 'Missing Death Certificate',
                description: 'Death certificate is mandatory for bereavement route. Application cannot proceed without it.'
            });
        }
        
        if (state.routeType === 'SETO_BEREAVEMENT' && state.lastLeavePartner === 'no') {
            risks.push({
                severity: 'critical',
                title: 'Previous Leave Not as Partner',
                description: 'Bereavement route requires last leave to have been granted as a partner. Route eligibility may be compromised.'
            });
        }
        
        // High Risks
        if (state.routeType === 'SETM_STANDARD') {
            if (state.moduleType === 'EMPLOYED') {
                if (state.salaryBank === 'no') {
                    risks.push({
                        severity: 'high',
                        title: 'Salary Not Banked',
                        description: 'Cash-in-hand salary creates significant evidential difficulties. Bank evidence is strongly preferred by UKVI.'
                    });
                }
                
                if (state.employerDuration === 'under6' && state.employmentChanges === 'recent') {
                    risks.push({
                        severity: 'high',
                        title: 'Recent Employment Change',
                        description: 'Short employment history with recent changes may require additional evidence of previous employment.'
                    });
                }
                
                if (state.payslipsComplete === 'missing' || state.payslipsComplete === 'none') {
                    risks.push({
                        severity: 'high',
                        title: 'Incomplete Payslip Evidence',
                        description: 'Missing payslips require alternative evidence and detailed explanation. Risk of refusal elevated.'
                    });
                }
            }
            
            if (state.moduleType === 'SELF_EMPLOYED') {
                if (state.saSubmitted === 'no') {
                    risks.push({
                        severity: 'high',
                        title: 'Tax Return Not Submitted',
                        description: 'Self-assessment must be submitted to HMRC before ILR application. This is a mandatory requirement.'
                    });
                }
                
                if (state.sa302Available === 'no' || state.sa302Available === 'unsure') {
                    risks.push({
                        severity: 'high',
                        title: 'Missing SA302 Evidence',
                        description: 'HMRC tax calculations are essential for self-employed applications. Application at risk without these.'
                    });
                }
                
                if (state.ongoingTrading === 'no') {
                    risks.push({
                        severity: 'high',
                        title: 'No Ongoing Trading Evidence',
                        description: 'Evidence that business continues to trade is required. Lack of recent activity is a compliance concern.'
                    });
                }
            }
            
            if (state.cohabitationType === 'limited' || state.cohabitationType === 'separate') {
                risks.push({
                    severity: 'high',
                    title: 'Limited Cohabitation Evidence',
                    description: 'Insufficient documentary evidence of living together may raise relationship genuineness concerns.'
                });
            }
        }
        
        // Review Needed
        if (state.routeType === 'UNSURE') {
            risks.push({
                severity: 'review',
                title: 'Route Uncertainty',
                description: 'Please consult KQ Solicitors to confirm correct route before proceeding with document gathering.'
            });
        }
        
        if (state.moduleType === 'COMPLEX') {
            risks.push({
                severity: 'review',
                title: 'Complex Financial Circumstances',
                description: 'Mixed or unclear income sources require solicitor review to determine evidential requirements.'
            });
        }
        
        if (state.nonEnglishDocs) {
            risks.push({
                severity: 'review',
                title: 'Translation Requirements',
                description: 'Ensure all non-English documents have certified translations prepared by qualified translators.'
            });
        }
        
        if (state.accommodationOvercrowded === 'yes') {
            risks.push({
                severity: 'review',
                title: 'Potential Overcrowding',
                description: 'Housing standards require specific room calculations. Review needed to ensure compliance.'
            });
        }
        
        return risks;
    }
};

// ============================================
// CHECKLIST GENERATOR ENGINE
// ============================================

const ChecklistEngine = {
    generate: function(state) {
        let items = [];
        
        // Always add core applicant docs
        items = items.concat(ChecklistRepository.coreApplicant);
        
        // Route specific logic
        if (state.routeType === 'SETM_STANDARD') {
            // Add relationship docs
            items = items.concat(ChecklistRepository.setmRelationship);
            
            // Add module-specific sponsor docs
            if (state.moduleType === 'EMPLOYED') {
                items = items.concat(ChecklistRepository.setmEmployedSponsor);
            } else if (state.moduleType === 'SELF_EMPLOYED') {
                items = items.concat(ChecklistRepository.setmSelfEmployedSponsor);
            } else if (state.moduleType === 'COMPLEX') {
                // Add both but mark for review
                items = items.concat(ChecklistRepository.setmEmployedSponsor);
                items = items.concat(ChecklistRepository.setmSelfEmployedSponsor);
                items.push({
                    id: 'complex_review',
                    title: 'Solicitor Review Required',
                    description: 'Complex or mixed income sources require detailed legal assessment to determine precise evidential requirements.',
                    category: 'mandatory',
                    section: 'legal_review'
                });
            }
            
            // Add accommodation (SET(M) specific requirements)
            items = items.concat(ChecklistRepository.accommodation);
            
            // Add English requirements (SET(M))
            items = items.concat(ChecklistRepository.englishRequirements);
            
        } else if (state.routeType === 'SETO_BEREAVEMENT') {
            // Add bereavement specific docs
            items = items.concat(ChecklistRepository.setoBereavement);
            
            // Note: SET(O) may not require English test if previously met, but we include for review
            items = items.concat(ChecklistRepository.englishRequirements.map(item => ({
                ...item,
                category: 'conditional',
                description: item.description + ' (Check if previously evidenced or exemption applies)'
            })));
        }
        
        // Add children docs if applicable
        if (state.hasChildren) {
            items = items.concat(ChecklistRepository.childrenDocuments);
        }
        
        // Add translation requirements if needed
        if (state.nonEnglishDocs || state.childrenNonEnglish) {
            items = items.concat(ChecklistRepository.translations);
        }
        
        // Filter conditional items
        items = items.filter(item => {
            if (item.category === 'conditional' && item.condition) {
                return item.condition(state);
            }
            return true;
        });
        
        return items;
    }
};

// ============================================
// UI CONTROLLER
// ============================================

const UIController = {
    showStep: function(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById(stepNumber === 0 ? 'welcomeScreen' : `step${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress bar
        const progress = stepNumber === 0 ? 0 : (stepNumber / TOTAL_STEPS) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
        
        // Update step indicators
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.remove('active', 'completed');
            const itemStep = index + 1;
            if (itemStep === stepNumber) {
                item.classList.add('active');
            } else if (itemStep < stepNumber) {
                item.classList.add('completed');
            }
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    },
    
    updateModuleVisibility: function() {
        const moduleSection = document.getElementById('moduleSelection');
        const routeType = document.querySelector('input[name="routeType"]:checked')?.value;
        
        if (routeType === 'SETM_STANDARD') {
            moduleSection.classList.remove('hidden');
        } else {
            moduleSection.classList.add('hidden');
            // Reset module selection
            document.getElementById('moduleType').value = '';
            AppState.data.moduleType = null;
        }
    },
    
    showComingSoon: function(moduleType) {
        const notice = document.getElementById('comingSoonNotice');
        if (moduleType === 'DIRECTOR_LTD') {
            notice.classList.remove('hidden');
        } else {
            notice.classList.add('hidden');
        }
    },
    
    toggleChildrenSection: function(show) {
        const section = document.getElementById('childrenDetails');
        if (show) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    },
    
    toggleTranslationHint: function(show) {
        const hint = document.getElementById('translationHint');
        hint.style.display = show ? 'block' : 'none';
    },
    
    updateRouteQuestions: function() {
        const route = AppState.data.routeType;
        const module = AppState.data.moduleType;
        
        // Hide all question groups first
        document.getElementById('employedQuestions').classList.add('hidden');
        document.getElementById('selfEmployedQuestions').classList.add('hidden');
        document.getElementById('bereavementQuestions').classList.add('hidden');
        document.getElementById('cohabitationGroup').classList.remove('hidden');
        
        if (route === 'SETM_STANDARD') {
            if (module === 'EMPLOYED') {
                document.getElementById('employedQuestions').classList.remove('hidden');
            } else if (module === 'SELF_EMPLOYED') {
                document.getElementById('selfEmployedQuestions').classList.remove('hidden');
            }
        } else if (route === 'SETO_BEREAVEMENT') {
            document.getElementById('bereavementQuestions').classList.remove('hidden');
            document.getElementById('cohabitationGroup').classList.add('hidden'); // Not relevant for bereavement in same way
        }
    },
    
    updateReviewScreen: function() {
        const routeLabels = {
            'SETM_STANDARD': 'SET(M) – Standard Partner',
            'SETO_BEREAVEMENT': 'SET(O) – Bereaved Partner',
            'UNSURE': 'Unsure/Complex'
        };
        
        const moduleLabels = {
            'EMPLOYED': 'Employed (PAYE)',
            'SELF_EMPLOYED': 'Self-Employed',
            'DIRECTOR_LTD': 'Director of Ltd Co',
            'COMPLEX': 'Mixed/Complex',
            'N/A': 'Not Applicable'
        };
        
        document.getElementById('reviewRoute').textContent = routeLabels[AppState.data.routeType] || '-';
        document.getElementById('reviewModule').textContent = moduleLabels[AppState.data.moduleType] || '-';
        document.getElementById('reviewChildren').textContent = AppState.data.hasChildren ? `Yes (${AppState.data.childrenCount})` : 'No';
    },
    
    renderResults: function(state, checklist, risks) {
        // Update date
        document.getElementById('genDate').textContent = new Date().toLocaleDateString('en-GB');
        document.getElementById('year').textContent = new Date().getFullYear();
        
        // Render risks
        const riskPanel = document.getElementById('riskPanel');
        const riskList = document.getElementById('riskList');
        
        if (risks.length > 0) {
            riskPanel.classList.remove('hidden');
            riskList.innerHTML = risks.map(risk => `
                <div class="risk-item ${risk.severity}">
                    <span class="risk-severity">${risk.severity}</span>
                    <div class="risk-content">
                        <div class="risk-title">${risk.title}</div>
                        <p class="risk-desc">${risk.description}</p>
                    </div>
                </div>
            `).join('');
        } else {
            riskPanel.classList.add('hidden');
        }
        
        // Group checklist items by section
        const sections = {};
        checklist.forEach(item => {
            if (!sections[item.section]) {
                sections[item.section] = [];
            }
            sections[item.section].push(item);
        });
        
        // Section display names
        const sectionNames = {
            'applicant': 'Applicant Identity & Status',
            'sponsor': 'Sponsor Financial Evidence',
            'relationship': 'Relationship Evidence',
            'bereavement': 'Bereavement Documentation',
            'accommodation': 'Accommodation Evidence',
            'english': 'English Language & Life in UK',
            'children': 'Children Documents',
            'administrative': 'Translation & Administrative',
            'legal_review': 'Legal Review Required'
        };
        
        // Render checklist
        const output = document.getElementById('checklistOutput');
        output.innerHTML = Object.keys(sections).map(sectionKey => {
            const items = sections[sectionKey];
            return `
                <div class="checklist-section">
                    <h3 class="checklist-header">${sectionNames[sectionKey] || sectionKey}</h3>
                    <ul class="checklist-list">
                        ${items.map(item => `
                           <li class="checklist-item">
                       <label class="checklist-row">
                       <input type="checkbox" class="kq-check" aria-label="${item.title}">
                       <span class="checklist-content">
                       <span class="checklist-title">
                       ${item.title}
                       <span class="tag tag-${item.category}">${item.category}</span>
                       </span>
                      ${item.description ? `<span class="checklist-desc-wrap"><p class="checklist-desc">${item.description}</p></span>` : ''}
                      </span>
                       </label>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }).join('');
    },
    
    showLoading: function(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    console.error("Missing #loadingOverlay in HTML");
    return;
  }
  overlay.classList.toggle('hidden', !show);
}
};

// ============================================
// MAIN APPLICATION CONTROLLER
// ============================================

const app = {
    init: function() {
        // Load saved state if exists
        this.loadState();
        UIController.showStep(AppState.currentStep);
        
        // Set up auto-save on input changes
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.saveState());
            input.addEventListener('blur', () => this.saveState());
        });
        
        console.log('KQ Settlement Checklist Builder initialized');
    },
    
    startAssessment: function() {
        AppState.currentStep = 1;
        this.saveState();
        UIController.showStep(1);
    },
    
    goToWelcome: function() {
        AppState.currentStep = 0;
        this.saveState();
        UIController.showStep(0);
    },
    
    handleRouteChange: function(value) {
        AppState.data.routeType = value;
        
        // Reset module if switching away from SET(M)
        if (value !== 'SETM_STANDARD') {
            AppState.data.moduleType = 'N/A';
        }
        
        UIController.updateModuleVisibility();
        this.saveState();
    },
    
    handleModuleChange: function(value) {
        AppState.data.moduleType = value;
        UIController.showComingSoon(value);
        this.saveState();
    },
    
    toggleChildren: function(hasChildren) {
        AppState.data.hasChildren = hasChildren;
        UIController.toggleChildrenSection(hasChildren);
        this.saveState();
    },
    
    toggleTranslations: function(hasNonEnglish) {
        AppState.data.nonEnglishDocs = hasNonEnglish;
        UIController.toggleTranslationHint(hasNonEnglish);
        this.saveState();
    },
    
    validateStep: function(step) {
        const errors = [];
        
if (step === 1) {
    // Always read from UI (prevents "stuck on step 1")
    const selectedRoute =
        document.querySelector('input[name="routeType"]:checked')?.value || null;

    const selectedModule =
        document.getElementById('moduleType')?.value || '';

    // Save into state
    AppState.data.routeType = selectedRoute;

    // Validate route
    if (!selectedRoute) {
        errors.push('Please select a route');
        return false;
    }

    // Only require module if SET(M)
    if (selectedRoute === 'SETM_STANDARD') {
        if (!selectedModule) {
            errors.push('Please select a financial category');
            return false;
        }

        if (selectedModule === 'DIRECTOR_LTD') {
            errors.push('Director module coming soon - please select Employed, Self-employed, or Complex');
            return false;
        }

        AppState.data.moduleType = selectedModule;
    } else {
        // SET(O) / UNSURE
        AppState.data.moduleType = 'N/A';
    }
}
        
        if (step === 2) {
            
            if (AppState.data.hasChildren) {
                AppState.data.childrenCount = parseInt(document.getElementById('childrenCount').value) || 1;
                const childNonEng = document.querySelector('input[name="childrenNonEnglish"]:checked');
                if (childNonEng) {
                    AppState.data.childrenNonEnglish = childNonEng.value === 'yes';
                }
            }
                           // Name change check
            const nameChangedRadio = document.querySelector('input[name="nameChanged"]:checked');
            AppState.data.nameChanged = nameChangedRadio ? nameChangedRadio.value : 'no';
        }

        if (step === 3) {
            // Route-specific validation
            if (AppState.data.routeType === 'SETM_STANDARD') {
                if (AppState.data.moduleType === 'EMPLOYED') {
                    AppState.data.sponsorEmployed = document.getElementById('sponsorEmployed').value;
                    AppState.data.employerDuration = document.getElementById('employerDuration').value;
                    AppState.data.incomeType = document.getElementById('incomeType').value;
                    AppState.data.salaryBank = document.getElementById('salaryBank').value;
                    AppState.data.employmentChanges = document.getElementById('employmentChanges').value;
                    AppState.data.payslipsComplete = document.getElementById('payslipsComplete').value;
                }
                
                if (AppState.data.moduleType === 'SELF_EMPLOYED') {
                    AppState.data.businessType = document.getElementById('businessType').value;
                    AppState.data.financialYearDocs = document.getElementById('financialYearDocs').value;
                    AppState.data.saSubmitted = document.getElementById('saSubmitted').value;
                    AppState.data.sa302Available = document.getElementById('sa302Available').value;
                    AppState.data.businessBankStatements = document.getElementById('businessBankStatements').value;
                    AppState.data.ongoingTrading = document.getElementById('ongoingTrading').value;
                    AppState.data.vatRegistered = document.getElementById('vatRegistered').value;
                    AppState.data.accountantUsed = document.getElementById('accountantUsed').value;
                }
                
                // Only get cohabitation if not bereavement
                if (document.getElementById('cohabitationType')) {
                    AppState.data.cohabitationType = document.getElementById('cohabitationType').value;
                }
            }
            
            if (AppState.data.routeType === 'SETO_BEREAVEMENT') {
                AppState.data.deathCertAvailable = document.getElementById('deathCertAvailable').value;
                AppState.data.lastLeavePartner = document.getElementById('lastLeavePartner').value;
                AppState.data.marriageCertAvailable = document.getElementById('marriageCertAvailable').value;
                AppState.data.relationshipEvidence = document.getElementById('relationshipEvidence').value;
            }
               }
            
            // 🔥 NEW STEP 4 (Accommodation & Relationship)
// 🔥 STEP 4 – Accommodation & Relationship
if (step === 4) {

    if (document.getElementById('cohabitationType')) {
        AppState.data.cohabitationType =
            document.getElementById('cohabitationType').value;
    }

    AppState.data.accommodationType =
        document.getElementById('accommodationType').value;

    AppState.data.accommodationOvercrowded =
        document.getElementById('accommodationOvercrowded').value;
}

// 🔥 STEP 5 – Consent (Review Step)
if (step === 5) {
    const consent = document.getElementById('consentCheck').checked;
    if (!consent) {
        errors.push('Please confirm you understand this is not legal advice');
    }
}

if (errors.length > 0) {
    alert('Please correct the following:\n\n' + errors.join('\n'));
    return false;
}

return true;
},
    
    validateAndNext: function() {
        if (this.validateStep(AppState.currentStep)) {
            if (AppState.currentStep < TOTAL_STEPS) {
                AppState.currentStep++;
                
                // If moving to step 3, update visible questions
                if (AppState.currentStep === 3) {
                    UIController.updateRouteQuestions();
                }
                
                // If moving to step 5, populate review
                if (AppState.currentStep === 5) {
                UIController.updateReviewScreen();
    }
                
                UIController.showStep(AppState.currentStep);
                this.saveState();
            }
        }
    },
    
    prevStep: function() {
        if (AppState.currentStep > 0) {
            AppState.currentStep--;
            UIController.showStep(AppState.currentStep);
            this.saveState();
        }
    },
    
    generateResults: function() {
        if (!this.validateStep(5)) return;
        
        UIController.showLoading(true);
        
        // Simulate processing delay for UX
       setTimeout(() => {
  try {
    // Generate risks
    AppState.data.riskFlags = RiskEngine.assess(AppState.data);

    // Generate checklist
    AppState.data.checklistItems = ChecklistEngine.generate(AppState.data);

    // Render results
    UIController.renderResults(
      AppState.data,
      AppState.data.checklistItems,
      AppState.data.riskFlags
    );

    // Go to results
    AppState.currentStep = 6;
    UIController.showStep(6);
    this.saveState();

  } catch (err) {
    console.error("Generate Checklist failed:", err);
    alert("Error generating checklist. Open Console (F12) and copy the red error line to fix.");
  } finally {
    UIController.showLoading(false);
  }
}, 800);
    },
    
    restart: function() {
        if (confirm('Start a new checklist? Current data will be cleared.')) {
            localStorage.removeItem('kq_settlement_state');
            location.reload();
        }
    },
    
    saveState: function() {
        localStorage.setItem('kq_settlement_state', JSON.stringify(AppState));
    },
    
    loadState: function() {
        const saved = localStorage.getItem('kq_settlement_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(AppState, parsed);
                
                // Restore form values
               
                if (AppState.data.routeType) {
                    const radio = document.querySelector(`input[name="routeType"][value="${AppState.data.routeType}"]`);
                    if (radio) radio.checked = true;
                    UIController.updateModuleVisibility();
                }
                if (AppState.data.moduleType) {
                    document.getElementById('moduleType').value = AppState.data.moduleType;
                }
                
            } catch (e) {
                console.error('Failed to load saved state', e);
            }
        }
    }
};

// ============================================
// INITIALIZE ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});