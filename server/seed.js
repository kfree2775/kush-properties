import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import logger from './logger.js';
import connectDB from './db.js';

// Models
import SiteConfig from './models/SiteConfig.js';
import NavbarConfig from './models/NavbarConfig.js';
import FooterConfig from './models/FooterConfig.js';
import PopupConfig from './models/PopupConfig.js';
import CookieConfig from './models/CookieConfig.js';
import LegalPage from './models/LegalPage.js';
import Slide from './models/Slide.js';
import Achievement from './models/Achievement.js';
import Category from './models/Category.js';
import Project from './models/Project.js';
import AboutContent from './models/AboutContent.js';
import AdminUser from './models/AdminUser.js';
import SeedVersion from './models/SeedVersion.js';

const CURRENT_VERSION = 1;

const seeds = {
  1: async () => {
    logger.info('Applying seed version 1...');

    // --- Admin Users ---
    let admins;
    if (process.env.ADMIN_SEED) {
      try {
        admins = JSON.parse(process.env.ADMIN_SEED);
      } catch {
        logger.error('ADMIN_SEED is not valid JSON');
        process.exit(1);
      }
    } else {
      admins = [
        { name: 'Admin', email: 'admin@kushproperties.in', password: 'changeme123' },
      ];
    }

    for (const admin of admins) {
      const exists = await AdminUser.findOne({ email: admin.email });
      if (!exists) {
        const hash = await bcrypt.hash(admin.password, 12);
        await AdminUser.create({
          name: admin.name,
          email: admin.email,
          passwordHash: hash,
          role: 'admin',
        });
        logger.info(`Admin seeded: ${admin.email}`);
      }
    }

    // --- SiteConfig ---
    const siteExists = await SiteConfig.findOne();
    if (!siteExists) {
      await SiteConfig.create({
        branding: {
          companyName: 'KushProperties',
          tagline: 'Crafting Homes, Building Dreams',
          logoUrl: '',
          faviconUrl: '',
        },
        contact: {
          phonePrimary: '+91 98XXX XXXXX',
          phoneSecondary: '+91 91XX XXXX XXXX',
          emailPrimary: 'info@kushproperties.in',
          emailSales: 'sales@kushproperties.in',
          addressFull: 'KushProperties International Office,\n4th Floor, Kumar Pacific Mall,\nSanghvi Nagar, Aundh,\nPune, Maharashtra 411007',
          officeHours: 'Mon-Sat: 10:00 AM - 7:00 PM\nSunday: By Appointment Only',
          mapEmbedUrl: 'https://maps.google.com/maps?q=18.5584,73.8077&output=embed',
        },
        social: [
          { platform: 'Facebook', url: '#', icon: 'facebook', sortOrder: 0 },
          { platform: 'Instagram', url: '#', icon: 'instagram', sortOrder: 1 },
          { platform: 'LinkedIn', url: '#', icon: 'linkedin', sortOrder: 2 },
          { platform: 'YouTube', url: '#', icon: 'youtube', sortOrder: 3 },
        ],
        whatsapp: { phone: '919XXXXXXXXX', message: 'Hi, I am interested in KushProperties', enabled: true },
        analytics: { ga4Id: '', enabled: false },
        rera: {
          companyRegNumber: 'RERA/REG/XXXX',
          disclaimerText: 'MahaRERA registration number for KushProperties projects. Verify all details on https://maharera.mahaonline.gov.in before making any decisions.',
        },
        pageSeo: {
          home: { title: 'KushProperties — Luxury Real Estate in Pune', metaDescription: 'Premium residential & commercial properties. Crafting homes, building dreams.' },
          about: { title: 'About KushProperties — Our Story', metaDescription: 'Transforming the real estate landscape with excellence and trust.' },
          contact: { title: 'Contact KushProperties — Get In Touch', metaDescription: 'Reach out for property inquiries, site visits, or any questions. Our team is here to help.' },
          projects: { title: 'Our Projects — KushProperties', metaDescription: 'Explore our portfolio of premium residential and commercial projects.' },
        },
        copyright: '© 2024 KushProperties. All Rights Reserved.',
      });
      logger.info('SiteConfig seeded');
    }

    // --- NavbarConfig ---
    const navExists = await NavbarConfig.findOne();
    if (!navExists) {
      await NavbarConfig.create({
        links: [
          { label: 'Home', href: '/', sortOrder: 0 },
          { label: 'About', href: '/about', sortOrder: 1 },
          { label: 'Projects', href: '/projects', sortOrder: 2 },
          { label: 'Contact', href: '/contact', sortOrder: 3 },
        ],
        ctaText: 'Book a Visit',
        ctaPhone: '+91 98XXX XXXXX',
      });
      logger.info('NavbarConfig seeded');
    }

    // --- FooterConfig ---
    const footerExists = await FooterConfig.findOne();
    if (!footerExists) {
      await FooterConfig.create({
        aboutText: 'KushProperties is a premier real estate developer in Pune, creating exceptional living spaces with a focus on quality, trust, and innovation.',
        columns: [
          {
            title: 'Explore',
            sortOrder: 0,
            links: [
              { label: 'Home', href: '/', sortOrder: 0 },
              { label: 'About Us', href: '/about', sortOrder: 1 },
              { label: 'Projects', href: '/projects', sortOrder: 2 },
              { label: 'Contact', href: '/contact', sortOrder: 3 },
            ],
          },
          {
            title: 'Investors',
            sortOrder: 1,
            links: [
              { label: 'Current Projects', href: '/projects', sortOrder: 0 },
              { label: 'Contact Sales', href: '/contact', sortOrder: 1 },
            ],
          },
          {
            title: 'Corporate Office',
            sortOrder: 2,
            links: [
              { label: 'Pune, Maharashtra', href: '#', sortOrder: 0 },
            ],
          },
        ],
      });
      logger.info('FooterConfig seeded');
    }

    // --- PopupConfig ---
    const popupExists = await PopupConfig.findOne();
    if (!popupExists) {
      await PopupConfig.create({
        enabled: true,
        delaySeconds: 30,
        heading: 'Get Exclusive Property Updates',
        subtext: 'Be the first to know about new launches and special offers in our curated collection.',
        ctaText: 'Submit',
        fields: [
          { name: 'fullName', label: 'Full Name', required: true },
          { name: 'email', label: 'Email Address', required: true },
          { name: 'phone', label: 'Mobile Number', required: true },
        ],
      });
      logger.info('PopupConfig seeded');
    }

    // --- CookieConfig ---
    const cookieExists = await CookieConfig.findOne();
    if (!cookieExists) {
      await CookieConfig.create({
        enabled: true,
        bannerText: 'We use cookies to enhance your browsing experience and analyze site traffic.',
        acceptText: 'Accept',
        declineText: 'Decline',
        policyLinkText: 'Privacy Policy',
      });
      logger.info('CookieConfig seeded');
    }

    // --- Achievements (always exactly 4) ---
    const achCount = await Achievement.countDocuments();
    if (achCount === 0) {
      await Achievement.insertMany([
        { value: 5000, suffix: '+', label: 'Families Served', icon: '🏠', sortOrder: 0 },
        { value: 20, suffix: ' Lakh+', label: 'Sq.Ft. Developed', icon: '📐', sortOrder: 1 },
        { value: 50, suffix: '+', label: 'Projects Completed', icon: '🏗️', sortOrder: 2 },
        { value: 18, suffix: '+', label: 'Years of Trust', icon: '⭐', sortOrder: 3 },
      ]);
      logger.info('Achievements seeded (4)');
    }

    // --- Categories ---
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: 'All', slug: 'all', sortOrder: 0 },
        { name: 'Residential', slug: 'residential', sortOrder: 1 },
        { name: 'Commercial', slug: 'commercial', sortOrder: 2 },
        { name: 'Villa', slug: 'villa', sortOrder: 3 },
        { name: 'Plot', slug: 'plot', sortOrder: 4 },
      ]);
      logger.info('Categories seeded');
    }

    // --- Demo Projects ---
    const projCount = await Project.countDocuments();
    if (projCount === 0) {
      const residential = await Category.findOne({ slug: 'residential' });
      const villa = await Category.findOne({ slug: 'villa' });
      const commercial = await Category.findOne({ slug: 'commercial' });

      await Project.insertMany([
        {
          name: 'KushVilla Heights',
          slug: 'kushvilla-heights',
          location: 'Baner, Pune, Maharashtra',
          coordinates: { lat: 18.5590, lng: 73.7868 },
          priceRange: 'Starting ₹85 Lakhs*',
          priceNumeric: 85,
          status: 'active',
          isPublished: true,
          category: residential?._id,
          coverImage: { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', publicId: '' },
          images: [
            { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', publicId: '', caption: 'Front View', sortOrder: 0 },
            { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', publicId: '', caption: 'Living Room', sortOrder: 1 },
            { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', publicId: '', caption: 'Pool Area', sortOrder: 2 },
          ],
          description: '<p>KushVilla Heights is a premium residential project offering modern 2 & 3 BHK apartments in the heart of Baner. Designed with contemporary architecture and world-class amenities.</p><p>Features include a rooftop infinity pool, landscaped gardens, fully-equipped gymnasium, and 24/7 security.</p>',
          amenities: ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children\'s Play Area', 'Landscaped Gardens', '24/7 Security', 'Power Backup', 'Covered Parking'],
          specs: { area: '1,200 - 1,850 Sq.Ft.', bedrooms: '2 & 3 BHK', bathrooms: '2-3', floors: '15', totalUnits: '120', possessionDate: 'December 2025', yearBuilt: '2023' },
          reraNumber: 'MahaRERA P52100XXXXX',
          seo: { metaTitle: 'KushVilla Heights — 2 & 3 BHK in Baner, Pune', metaDescription: 'Premium apartments starting ₹85 Lakhs in Baner, Pune. Modern amenities, prime location.' },
          sortOrder: 0,
          featuredRank: 1,
        },
        {
          name: 'KushCommerce Hub',
          slug: 'kushcommerce-hub',
          location: 'Hinjewadi, Pune, Maharashtra',
          coordinates: { lat: 18.5912, lng: 73.7390 },
          priceRange: 'Starting ₹65 Lakhs*',
          priceNumeric: 65,
          status: 'active',
          isPublished: true,
          category: commercial?._id,
          coverImage: { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', publicId: '' },
          images: [],
          description: '<p>KushCommerce Hub offers premium commercial office spaces in Pune\'s IT corridor. Perfect for startups and established businesses alike.</p>',
          amenities: ['High-Speed Elevators', 'Cafeteria', 'Conference Rooms', 'Ample Parking', 'Fire Safety Systems', 'Power Backup'],
          specs: { area: '500 - 5,000 Sq.Ft.', bedrooms: 'N/A', bathrooms: 'Shared', floors: '12', totalUnits: '80', possessionDate: 'March 2026' },
          reraNumber: 'MahaRERA P52100YYYYY',
          seo: { metaTitle: 'KushCommerce Hub — Commercial Spaces in Hinjewadi', metaDescription: 'Premium commercial spaces in Hinjewadi IT Park, Pune.' },
          sortOrder: 1,
          featuredRank: 2,
        },
        {
          name: 'TheKush Reserve',
          slug: 'thekush-reserve',
          location: 'Koregaon Park, Pune, Maharashtra',
          coordinates: { lat: 18.5362, lng: 73.8929 },
          priceRange: 'Starting ₹3.5 Cr*',
          priceNumeric: 350,
          status: 'coming_soon',
          isPublished: true,
          category: villa?._id,
          coverImage: { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', publicId: '' },
          images: [],
          description: '<p>TheKush Reserve — ultra-luxury villas in the prestigious Koregaon Park. Limited edition homes for the discerning few.</p>',
          amenities: ['Private Pool', 'Home Theater', 'Smart Home Automation', 'Landscaped Private Garden', 'Staff Quarters', 'Triple Car Garage'],
          specs: { area: '4,500 - 6,000 Sq.Ft.', bedrooms: '4 & 5 BHK', bathrooms: '4-6', floors: '3', totalUnits: '24', possessionDate: 'June 2027' },
          reraNumber: 'MahaRERA P52100ZZZZZ',
          seo: { metaTitle: 'TheKush Reserve — Luxury Villas in Koregaon Park', metaDescription: 'Ultra-luxury villas starting ₹3.5 Cr in Koregaon Park, Pune.' },
          sortOrder: 2,
          featuredRank: 3,
        },
      ]);
      logger.info('Demo projects seeded (3)');
    }

    // --- Slides ---
    const slideCount = await Slide.countDocuments();
    if (slideCount === 0) {
      await Slide.insertMany([
        {
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600',
          headline: 'Crafting Homes, Building Dreams',
          subtext: 'Premium residential & commercial properties across Maharashtra.',
          ctaText: 'Explore Projects',
          ctaLink: '/projects',
          secondaryCtaText: 'Schedule Visit',
          secondaryCtaLink: '/contact',
          sortOrder: 0,
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600',
          headline: 'Luxury Living Redefined',
          subtext: 'Curating exclusive lifestyles for the discerning few.',
          ctaText: 'Schedule Visit',
          ctaLink: '/contact',
          secondaryCtaText: 'Explore Projects',
          secondaryCtaLink: '/projects',
          sortOrder: 1,
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600',
          headline: 'Premium Commercial Spaces',
          ctaText: 'View Details',
          ctaLink: '/projects',
          sortOrder: 2,
        },
      ]);
      logger.info('Slides seeded (3)');
    }

    // --- AboutContent ---
    const aboutExists = await AboutContent.findOne();
    if (!aboutExists) {
      await AboutContent.create({
        heroImage: { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600', publicId: '' },
        heroTagline: 'Building Trust, One Home at a Time',
        storyTitle: 'Our Journey',
        storyContent: '<p>What began as a single vision in 2008 has evolved into one of Maharashtra\'s most trusted real estate entities. KushProperties was founded on a simple premise: luxury living shouldn\'t come at the cost of trust.</p><p>Over the past decade and a half, we\'ve consistently delivered homes that combine contemporary design with uncompromising quality, creating spaces that stand the test of time.</p>',
        mission: 'To deliver uncompromising quality and unparalleled experiences that transform how people perceive and live in their homes.',
        vision: 'To be the vanguard of real estate in India, creating sustainable, community-centric properties that define the future of living.',
        teamMembers: [
          { name: 'Rajesh Kush', role: 'Founder & Chairman', image: { url: '', publicId: '' } },
          { name: 'Priya Kush', role: 'Managing Director', image: { url: '', publicId: '' } },
          { name: 'Amit Sharma', role: 'Chief Architect', image: { url: '', publicId: '' } },
        ],
        isPublished: true,
      });
      logger.info('AboutContent seeded');
    }

    // --- Legal Pages ---
    const termsExists = await LegalPage.findOne({ slug: 'terms' });
    if (!termsExists) {
      await LegalPage.create({
        slug: 'terms',
        title: 'Terms of Service',
        content: '<h2>Terms of Service</h2><p>These terms govern your use of the KushProperties website and services. By accessing our website, you agree to be bound by these terms.</p><p><strong>1. Use of Website</strong><br>This website is intended to provide information about KushProperties\' real estate projects. All content is for informational purposes only.</p><p><strong>2. Property Information</strong><br>All property details, specifications, and prices mentioned on this website are indicative and subject to change without notice. Please verify all details directly with our sales team.</p><p><strong>3. RERA Compliance</strong><br>All our projects are registered under MahaRERA. Registration numbers are displayed on respective project pages.</p>',
        metaTitle: 'Terms of Service — KushProperties',
        metaDescription: 'Terms and conditions governing the use of KushProperties website and services.',
        isPublished: true,
      });
      logger.info('Terms page seeded');
    }

    const privacyExists = await LegalPage.findOne({ slug: 'privacy' });
    if (!privacyExists) {
      await LegalPage.create({
        slug: 'privacy',
        title: 'Privacy Policy',
        content: '<h2>Privacy Policy</h2><p>KushProperties is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p><p><strong>1. Information We Collect</strong><br>We collect personal information such as name, email, phone number, and property preferences when you fill out forms on our website.</p><p><strong>2. How We Use Your Information</strong><br>Your information is used solely for responding to your inquiries, sending property updates, and improving our services.</p><p><strong>3. Data Security</strong><br>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>',
        metaTitle: 'Privacy Policy — KushProperties',
        metaDescription: 'Learn how KushProperties collects, uses, and protects your personal information.',
        isPublished: true,
      });
      logger.info('Privacy page seeded');
    }

    logger.info('Seed version 1 completed');
  },
};

async function runSeeds() {
  await connectDB();

  for (let version = 1; version <= CURRENT_VERSION; version++) {
    const applied = await SeedVersion.findOne({ version });
    if (applied) {
      logger.info(`Seed version ${version} already applied, skipping`);
      continue;
    }

    if (seeds[version]) {
      await seeds[version]();
      await SeedVersion.create({ version });
      logger.info(`Seed version ${version} recorded`);
    }
  }

  logger.info('All seeds applied');
  await mongoose.connection.close();
}

// Run if called directly
runSeeds().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});

export { runSeeds };
