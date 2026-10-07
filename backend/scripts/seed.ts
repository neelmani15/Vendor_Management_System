import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';
import { logger } from '../src/config/logger';
import { UserModel } from '../src/modules/auth/user.model';
import { VendorModel } from '../src/modules/vendors/vendor.model';
import { VendorDocumentModel } from '../src/modules/vendor-documents/vendor-document.model';
import { WorkRequirementModel } from '../src/modules/work-requirements/work-requirement.model';
import { RecommendationRunModel } from '../src/modules/recommendations/recommendation-run.model';
import { AISummaryModel } from '../src/modules/ai/ai-summary.model';
import { AuditLogModel } from '../src/modules/audit/audit-log.model';
import { UserRole } from '../src/common/constants/roles';
import {
  VendorType,
  VendorStatus,
  OnboardingStatus,
  ComplianceStatus,
  DocumentType,
  DocumentStatus,
  WorkPriority,
  WorkStatus,
} from '../src/common/constants/enums';

async function seed() {
  logger.info('Connecting to MongoDB for seeding...');
  await mongoose.connect(env.MONGODB_URI);

  logger.info('Clearing existing collections...');
  await Promise.all([
    UserModel.deleteMany({}),
    VendorModel.deleteMany({}),
    VendorDocumentModel.deleteMany({}),
    WorkRequirementModel.deleteMany({}),
    RecommendationRunModel.deleteMany({}),
    AISummaryModel.deleteMany({}),
    AuditLogModel.deleteMany({}),
  ]);

  // 1. Seed Users with different roles
  logger.info('Seeding default role users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const admin = await UserModel.create({
    name: 'Eleanor Vance (Admin)',
    email: 'admin@fieldnerve.com',
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
  });

  const manager = await UserModel.create({
    name: 'Marcus Brody (Procurement Mgr)',
    email: 'manager@fieldnerve.com',
    passwordHash,
    role: UserRole.PROCUREMENT_MANAGER,
    isActive: true,
  });

  const buyer = await UserModel.create({
    name: 'Sophia Chen (Procurement User)',
    email: 'buyer@fieldnerve.com',
    passwordHash,
    role: UserRole.PROCUREMENT_USER,
    isActive: true,
  });

  await UserModel.create({
    name: 'David Kim (Auditor/Viewer)',
    email: 'viewer@fieldnerve.com',
    passwordHash,
    role: UserRole.VIEWER,
    isActive: true,
  });

  logger.info('Users created successfully.');

  // 2. Seed 15 Diverse Vendors
  logger.info('Seeding 15 realistic vendors with targeted scenarios...');

  const now = new Date();
  const pastDate = new Date(now.getTime() - 60 * 24 * 3600 * 1000); // 60 days ago
  const futureDate = new Date(now.getTime() + 180 * 24 * 3600 * 1000); // 180 days ahead
  const expiringDate = new Date(now.getTime() + 15 * 24 * 3600 * 1000); // 15 days ahead

  // Scenario 1: Apex Power & Electrical - The Clear Winner for Austin Electrical Requirement
  const vApex = await VendorModel.create({
    name: 'Apex Power Grid Systems',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering', 'Substation Automation'],
    description: 'Premier regional industrial electrical contractor specializing in high-voltage substations and commercial power grid integration.',
    contact: { primaryContactName: 'Robert Vance', email: 'contact@apexpower.com', phone: '+1-512-555-0101' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701', address: '400 Congress Ave' },
      { country: 'USA', state: 'TX', city: 'San Antonio', postalCode: '78205' },
    ],
    rating: 4.9,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 14,
    completedProjects: 48,
    averageProjectValue: 250000,
    capabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Transformers', 'Industrial Safety', 'CAD Schematics'],
    serviceAreas: ['Central Texas', 'South Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  // Scenario 2: Voltaic Solutions - Disqualified by Expired Safety Certificate
  const vVoltaic = await VendorModel.create({
    name: 'Voltaic Energy Contractors',
    vendorType: VendorType.CONTRACTOR,
    categories: ['Electrical Engineering', 'Renewable Energy'],
    description: 'Fast-paced electrical contractor. Holds strong rating but has lapsed safety certifications.',
    contact: { primaryContactName: 'Gary Miller', email: 'gary@voltaic.com', phone: '+1-512-555-0102' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78702', address: '1200 E 7th St' },
    ],
    rating: 4.7,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 8,
    completedProjects: 26,
    averageProjectValue: 180000,
    capabilities: ['High Voltage Wiring', 'Solar Interconnect', 'Switchgear Installation'],
    serviceAreas: ['Travis County'],
    complianceStatus: ComplianceStatus.NON_COMPLIANT,
  });

  // Scenario 3: Lumina High Voltage - High Rating, but Wrong Location (Denver, CO instead of Austin, TX)
  const vLumina = await VendorModel.create({
    name: 'Lumina Industrial Electric',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering'],
    description: 'Rocky Mountain electrical powerhouse with stellar rating and deep industrial certifications.',
    contact: { primaryContactName: 'Sarah Jenkins', email: 'sjenkins@lumina-elec.com', phone: '+1-303-555-0199' },
    operatingLocations: [
      { country: 'USA', state: 'CO', city: 'Denver', postalCode: '80202', address: '1700 Broadway' },
      { country: 'USA', state: 'CO', city: 'Boulder', postalCode: '80301' },
    ],
    rating: 4.95,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 18,
    completedProjects: 65,
    averageProjectValue: 400000,
    capabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety', 'Grid SCADA'],
    serviceAreas: ['Colorado', 'Wyoming'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  // Scenario 4 & 5: Tied Candidates for Austin Electrical (Austin ElectroCorp vs Beacon Power Labs)
  // Both match location (Austin, TX), category, capabilities. Demonstrates Tie-Breaking!
  const vAustinElectro = await VendorModel.create({
    name: 'Austin ElectroCorp Ltd',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering'],
    description: 'Dependable commercial electrical firm focused on corporate campuses and datacenters.',
    contact: { primaryContactName: 'Michael Chang', email: 'mchang@austinelectro.com', phone: '+1-512-555-0150' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78758', address: '11000 Metric Blvd' },
    ],
    rating: 4.6,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 10,
    completedProjects: 35,
    averageProjectValue: 220000,
    capabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety'],
    serviceAreas: ['Greater Austin'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vBeaconPower = await VendorModel.create({
    name: 'Beacon Power Labs',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering'],
    description: 'Tech-enabled power engineering team providing switchgear and substation solutions.',
    contact: { primaryContactName: 'Claire Redfield', email: 'claire@beaconpower.com', phone: '+1-512-555-0151' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78746', address: '300 Westlake Dr' },
    ],
    rating: 4.6,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 10,
    completedProjects: 30, // 5 fewer completed projects -> Austin ElectroCorp wins tie-break!
    capabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety'],
    serviceAreas: ['Austin Metropolitan'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  // Additional realistic vendors across various categories
  const vTerra = await VendorModel.create({
    name: 'TerraFirm Civil Infrastructure',
    vendorType: VendorType.COMPANY,
    categories: ['Civil Engineering', 'Structural Works'],
    description: 'Heavy civil construction firm specializing in highways, retaining walls, and earthmoving.',
    contact: { primaryContactName: 'Hank Schrader', email: 'hank@terrafirm.com', phone: '+1-214-555-0130' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Dallas', postalCode: '75201' },
      { country: 'USA', state: 'TX', city: 'Fort Worth', postalCode: '76102' },
    ],
    rating: 4.75,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 20,
    completedProjects: 72,
    averageProjectValue: 750000,
    capabilities: ['Excavation', 'Foundation Reinforcement', 'Heavy Machinery', 'Concrete Pouring', 'OSHA Certified'],
    serviceAreas: ['North Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vKeystone = await VendorModel.create({
    name: 'Keystone Foundations & Piling',
    vendorType: VendorType.CONTRACTOR,
    categories: ['Civil Engineering'],
    description: 'Deep foundation drilling and geotechnical foundation contractor.',
    contact: { primaryContactName: 'Bruce Wayne', email: 'bruce@keystonefoundations.com', phone: '+1-713-555-0144' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Houston', postalCode: '77002' },
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    ],
    rating: 4.8,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 15,
    completedProjects: 52,
    averageProjectValue: 500000,
    capabilities: ['Foundation Reinforcement', 'Geotechnical Soil Testing', 'Concrete Pouring'],
    serviceAreas: ['Texas Gulf Coast', 'Central Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vCloudScale = await VendorModel.create({
    name: 'CloudScale DevOps & Infrastructure',
    vendorType: VendorType.AGENCY,
    categories: ['IT & Cloud Infrastructure', 'Cybersecurity'],
    description: 'Enterprise cloud migration and Kubernetes infrastructure consulting firm.',
    contact: { primaryContactName: 'Ada Lovelace', email: 'ada@cloudscale.io', phone: '+1-415-555-0182' },
    operatingLocations: [
      { country: 'USA', state: 'CA', city: 'San Francisco', postalCode: '94105' },
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    ],
    rating: 4.9,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 11,
    completedProjects: 60,
    averageProjectValue: 120000,
    capabilities: ['AWS Architecture', 'Kubernetes Deployment', 'SOC2 Compliance', 'Terraform Automation'],
    serviceAreas: ['National Remote', 'Central Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vDataShield = await VendorModel.create({
    name: 'DataShield InfoSec Partners',
    vendorType: VendorType.SERVICE_PROVIDER,
    categories: ['IT & Cloud Infrastructure', 'Cybersecurity'],
    description: 'Cybersecurity defense, penetration testing, and compliance certification consultants.',
    contact: { primaryContactName: 'Elliot Alderson', email: 'elliot@datashield.sec', phone: '+1-212-555-0199' },
    operatingLocations: [
      { country: 'USA', state: 'NY', city: 'New York', postalCode: '10001' },
      { country: 'USA', state: 'TX', city: 'Dallas', postalCode: '75201' },
    ],
    rating: 4.85,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 9,
    completedProjects: 40,
    averageProjectValue: 95000,
    capabilities: ['SOC2 Compliance', 'Penetration Testing', 'Incident Response'],
    serviceAreas: ['Nationwide'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vCleanAir = await VendorModel.create({
    name: 'CleanAir Commercial HVAC & Mechanical',
    vendorType: VendorType.COMPANY,
    categories: ['Facility Management', 'HVAC & Mechanical'],
    description: 'Chiller plant overhauls, building automation, and cleanroom air handling solutions.',
    contact: { primaryContactName: 'Walter White', email: 'walter@cleanairhvac.com', phone: '+1-505-555-0120' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78759' },
      { country: 'USA', state: 'TX', city: 'San Antonio', postalCode: '78201' },
    ],
    rating: 4.7,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 16,
    completedProjects: 85,
    averageProjectValue: 140000,
    capabilities: ['Chiller Maintenance', 'Building Automation', 'EPA Certified Refrigerant', 'Cleanroom Standards'],
    serviceAreas: ['Central Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vSafeGuard = await VendorModel.create({
    name: 'SafeGuard Facility Security & Patrol',
    vendorType: VendorType.SERVICE_PROVIDER,
    categories: ['Facility Management', 'Security Services'],
    description: 'Armed/unarmed site patrol, access control hardware, and CCTV monitoring center.',
    contact: { primaryContactName: 'Jonathan Banks', email: 'mike@safeguardsec.com', phone: '+1-512-555-0177' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78704' },
    ],
    rating: 4.65,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 12,
    completedProjects: 44,
    averageProjectValue: 80000,
    capabilities: ['Access Control', 'CCTV Integration', 'Armed Guards', '24/7 Dispatch'],
    serviceAreas: ['Travis County', 'Williamson County'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  const vFreightX = await VendorModel.create({
    name: 'FreightX Heavy Haulage & Rigging',
    vendorType: VendorType.SUPPLIER,
    categories: ['Logistics & Heavy Transport'],
    description: 'Oversized machinery transport, cranes, and interstate logistics fleet.',
    contact: { primaryContactName: 'Dom Toretto', email: 'dom@freightx.com', phone: '+1-213-555-0100' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Houston', postalCode: '77029' },
      { country: 'USA', state: 'TX', city: 'Dallas', postalCode: '75212' },
    ],
    rating: 4.55,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 14,
    completedProjects: 90,
    averageProjectValue: 60000,
    capabilities: ['Oversize Permits', 'Hydraulic Trailers', 'Crane Operations', 'DOT Certified'],
    serviceAreas: ['All Southern States'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  // Blacklisted vendor scenario
  const vRogue = await VendorModel.create({
    name: 'Rogue Electrical Works',
    vendorType: VendorType.CONTRACTOR,
    categories: ['Electrical Engineering'],
    description: 'Vendor under investigation for safety non-compliance. Currently blacklisted.',
    contact: { primaryContactName: 'Bad Actor', email: 'rogue@fake-mail.com', phone: '+1-512-555-0000' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    ],
    rating: 2.1,
    status: VendorStatus.BLACKLISTED,
    onboardingStatus: OnboardingStatus.REJECTED,
    yearsOfExperience: 2,
    completedProjects: 3,
    averageProjectValue: 15000,
    capabilities: ['Basic Wiring'],
    serviceAreas: ['Austin'],
    complianceStatus: ComplianceStatus.NON_COMPLIANT,
  });

  // Low rating vendor
  const vBudget = await VendorModel.create({
    name: 'Budget Wire Specialists',
    vendorType: VendorType.INDIVIDUAL,
    categories: ['Electrical Engineering'],
    description: 'Low-cost individual electrician. Rating falls below mandatory 4.0 threshold.',
    contact: { primaryContactName: 'Joe Quick', email: 'joe@budgetwire.com', phone: '+1-512-555-0111' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    ],
    rating: 3.2,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 4,
    completedProjects: 11,
    averageProjectValue: 20000,
    capabilities: ['Basic Wiring', 'Switchgear Installation'],
    serviceAreas: ['Austin'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  // Inactive vendor
  const vDormant = await VendorModel.create({
    name: 'Dormant Power Corp',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering'],
    description: 'Operations paused for corporate restructuring.',
    contact: { primaryContactName: 'Anna Dormant', email: 'anna@dormant.com', phone: '+1-512-555-0999' },
    operatingLocations: [
      { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    ],
    rating: 4.8,
    status: VendorStatus.INACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 10,
    completedProjects: 22,
    averageProjectValue: 190000,
    capabilities: ['High Voltage Wiring'],
    serviceAreas: ['Central Texas'],
    complianceStatus: ComplianceStatus.COMPLIANT,
  });

  logger.info('Vendors created successfully.');

  // 3. Seed Vendor Documents (Crucial for compliance & disqualification logic)
  logger.info('Seeding vendor compliance documents...');

  // Documents for Apex Power (Winner: All Valid)
  await VendorDocumentModel.create([
    {
      vendorId: vApex._id,
      documentType: DocumentType.TAX_REGISTRATION,
      documentNumber: 'EIN-74-9284102',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vApex._id}/docs/ein.pdf`,
      fileName: 'apex-tax-registration.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vApex._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'POL-GL-9938210',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vApex._id}/docs/gl-insurance.pdf`,
      fileName: 'general-liability-apex.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vApex._id,
      documentType: DocumentType.SAFETY_CERTIFICATE,
      documentNumber: 'OSHA-30-MASTER-882',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vApex._id}/docs/safety.pdf`,
      fileName: 'osha-30-safety-cert.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vApex._id,
      documentType: DocumentType.TRADE_LICENSE,
      documentNumber: 'TX-ELEC-MASTER-4921',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vApex._id}/docs/trade-license.pdf`,
      fileName: 'tx-master-electrician-license.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  // Documents for Voltaic (Disqualification Scenario: Expired Safety Certificate)
  await VendorDocumentModel.create([
    {
      vendorId: vVoltaic._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'POL-VOLT-2201',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vVoltaic._id}/docs/ins.pdf`,
      fileName: 'voltaic-insurance.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vVoltaic._id,
      documentType: DocumentType.SAFETY_CERTIFICATE,
      documentNumber: 'OSHA-EXPIRED-991',
      issuedAt: new Date(now.getTime() - 400 * 24 * 3600 * 1000),
      expiresAt: new Date(now.getTime() - 35 * 24 * 3600 * 1000), // Expired 35 days ago!
      status: DocumentStatus.EXPIRED,
      storageKey: `vendors/${vVoltaic._id}/docs/safety-expired.pdf`,
      fileName: 'voltaic-safety-cert-2023.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vVoltaic._id,
      documentType: DocumentType.TRADE_LICENSE,
      documentNumber: 'TX-ELEC-44910',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vVoltaic._id}/docs/license.pdf`,
      fileName: 'voltaic-license.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  // Documents for Lumina (Valid documents)
  await VendorDocumentModel.create([
    {
      vendorId: vLumina._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'POL-CO-5510',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vLumina._id}/docs/ins.pdf`,
      fileName: 'lumina-insurance.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vLumina._id,
      documentType: DocumentType.SAFETY_CERTIFICATE,
      documentNumber: 'OSHA-30-CO-102',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vLumina._id}/docs/safety.pdf`,
      fileName: 'lumina-safety.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  // Documents for Austin ElectroCorp (Valid)
  await VendorDocumentModel.create([
    {
      vendorId: vAustinElectro._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'POL-AUSTIN-771',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vAustinElectro._id}/docs/ins.pdf`,
      fileName: 'austin-electro-ins.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vAustinElectro._id,
      documentType: DocumentType.SAFETY_CERTIFICATE,
      documentNumber: 'OSHA-AUSTIN-88',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vAustinElectro._id}/docs/safety.pdf`,
      fileName: 'austin-electro-safety.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  // Documents for Beacon Power (Valid)
  await VendorDocumentModel.create([
    {
      vendorId: vBeaconPower._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'POL-BEACON-33',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vBeaconPower._id}/docs/ins.pdf`,
      fileName: 'beacon-ins.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vBeaconPower._id,
      documentType: DocumentType.SAFETY_CERTIFICATE,
      documentNumber: 'OSHA-BEACON-11',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vBeaconPower._id}/docs/safety.pdf`,
      fileName: 'beacon-safety.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  // Documents for other vendors
  await VendorDocumentModel.create([
    {
      vendorId: vTerra._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'TERRA-INS-99',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vTerra._id}/docs/ins.pdf`,
      fileName: 'terra-ins.pdf',
      mimeType: 'application/pdf',
    },
    {
      vendorId: vCloudScale._id,
      documentType: DocumentType.INSURANCE,
      documentNumber: 'CLOUD-INS-44',
      issuedAt: pastDate,
      expiresAt: futureDate,
      status: DocumentStatus.VALID,
      storageKey: `vendors/${vCloudScale._id}/docs/ins.pdf`,
      fileName: 'cloud-ins.pdf',
      mimeType: 'application/pdf',
    },
  ]);

  logger.info('Documents seeded.');

  // 4. Seed 5 Realistic Work Requirements
  logger.info('Seeding work requirements...');

  // Primary Benchmark Work Requirement (Austin Substation Modernization)
  const req1 = await WorkRequirementModel.create({
    title: 'High-Voltage Substation Automation & Switchgear Upgrade',
    description: 'Turnkey engineering and electrical contractor required to replace aging 138kV switchgear and automate SCADA monitoring for municipal facility in Austin, TX.',
    category: 'Electrical Engineering',
    location: { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701', address: '500 E 4th St' },
    estimatedValue: 450000,
    currency: 'USD',
    priority: WorkPriority.CRITICAL,
    expectedStartDate: new Date(now.getTime() + 45 * 24 * 3600 * 1000),
    requiredCapabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety'],
    preferredVendorTypes: [VendorType.COMPANY, VendorType.CONTRACTOR],
    minimumRating: 4.0, // Filters out Budget Wire (3.2)
    complianceRequirements: [DocumentType.INSURANCE, DocumentType.SAFETY_CERTIFICATE], // Disqualifies Voltaic (expired OSHA)
    status: WorkStatus.OPEN,
    createdBy: buyer._id,
  });

  const req2 = await WorkRequirementModel.create({
    title: 'Highway Overpass Structural Concrete Foundation Pouring',
    description: 'Bridge foundation reinforcement and deep drilling for north expansion corridor.',
    category: 'Civil Engineering',
    location: { country: 'USA', state: 'TX', city: 'Dallas', postalCode: '75201' },
    estimatedValue: 850000,
    currency: 'USD',
    priority: WorkPriority.HIGH,
    expectedStartDate: new Date(now.getTime() + 60 * 24 * 3600 * 1000),
    requiredCapabilities: ['Foundation Reinforcement', 'Concrete Pouring'],
    preferredVendorTypes: [VendorType.COMPANY],
    minimumRating: 4.5,
    complianceRequirements: [DocumentType.INSURANCE],
    status: WorkStatus.OPEN,
    createdBy: manager._id,
  });

  const req3 = await WorkRequirementModel.create({
    title: 'Multi-Cloud Kubernetes Migration & SOC2 Hardening',
    description: 'Transition bare metal workloads into automated multi-region EKS clusters with continuous SOC2 compliance auditing.',
    category: 'IT & Cloud Infrastructure',
    location: { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78701' },
    estimatedValue: 175000,
    currency: 'USD',
    priority: WorkPriority.MEDIUM,
    expectedStartDate: new Date(now.getTime() + 30 * 24 * 3600 * 1000),
    requiredCapabilities: ['Kubernetes Deployment', 'SOC2 Compliance'],
    preferredVendorTypes: [VendorType.AGENCY, VendorType.SERVICE_PROVIDER],
    minimumRating: 4.5,
    complianceRequirements: [DocumentType.INSURANCE],
    status: WorkStatus.OPEN,
    createdBy: buyer._id,
  });

  const req4 = await WorkRequirementModel.create({
    title: 'Commercial Chiller Overhaul & Cleanroom Air Balancing',
    description: 'Quarterly mechanical maintenance and cleanroom filtration testing for pharmaceutical R&D labs.',
    category: 'Facility Management',
    location: { country: 'USA', state: 'TX', city: 'Austin', postalCode: '78759' },
    estimatedValue: 95000,
    currency: 'USD',
    priority: WorkPriority.HIGH,
    expectedStartDate: new Date(now.getTime() + 20 * 24 * 3600 * 1000),
    requiredCapabilities: ['Chiller Maintenance', 'Building Automation'],
    preferredVendorTypes: [VendorType.COMPANY],
    minimumRating: 4.0,
    complianceRequirements: [],
    status: WorkStatus.OPEN,
    createdBy: manager._id,
  });

  const req5 = await WorkRequirementModel.create({
    title: 'Emergency Generator Interconnect & Microgrid Study',
    description: 'Feasibility analysis and backup diesel generation hookup.',
    category: 'Electrical Engineering',
    location: { country: 'USA', state: 'CO', city: 'Denver', postalCode: '80202' },
    estimatedValue: 210000,
    currency: 'USD',
    priority: WorkPriority.LOW,
    expectedStartDate: new Date(now.getTime() + 90 * 24 * 3600 * 1000),
    requiredCapabilities: ['High Voltage Wiring'],
    preferredVendorTypes: [VendorType.COMPANY],
    minimumRating: 4.0,
    complianceRequirements: [DocumentType.INSURANCE],
    status: WorkStatus.DRAFT,
    createdBy: admin._id,
  });

  logger.info('Work requirements seeded.');
  logger.info('========================================================');
  logger.info('✅ SEEDING COMPLETE!');
  logger.info(`- Seeded 4 Users: admin@fieldnerve.com, manager@fieldnerve.com, buyer@fieldnerve.com, viewer@fieldnerve.com (Password: Password123!)`);
  logger.info(`- Seeded 15 Vendors with real test scenarios`);
  logger.info(`- Seeded 5 Work Requirements`);
  logger.info(`- Benchmark Requirement ID: ${req1._id.toString()}`);
  logger.info('========================================================');

  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error({ err }, 'Seeding failed');
  process.exit(1);
});
