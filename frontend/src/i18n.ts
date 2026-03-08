import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translateAll, getCachedTranslations } from './services/translationService';

// â”€â”€â”€ English source strings (the ONLY static dictionary) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Every other language is translated dynamically via API and cached in localStorage.

export const enStrings: Record<string, string> = {
  // â”€â”€ Common / Shared â”€â”€
  welcome: 'Welcome',
  dashboard: 'Dashboard',
  logout: 'Logout',
      signOut: 'Sign out',
      login: 'Login',
      signIn: 'Sign in',
      register: 'Register',
      donations: 'Donations',
      settings: 'Settings',
      language: 'Language',
      darkMode: 'Dark Mode',
      accessibility: 'Accessibility',
      highContrast: 'High Contrast',
      selectLanguage: 'Select Language',
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      loading: 'Loading...',
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      close: 'Close',
      viewDetails: 'View Details',
      viewAll: 'View all',
      noImageUploaded: 'No image uploaded',
      processing: 'Processing...',
      active: 'Active',
      verified: 'Verified',
      suspended: 'Suspended',
      donor: 'Donor',
      ngo: 'NGO',
      volunteer: 'Volunteer',
      user: 'User',
      email: 'Email',
      password: 'Password',
      phone: 'Phone',
      name: 'Name',
      address: 'Address',
      description: 'Description',
      quantity: 'Quantity',
      status: 'Status',
      actions: 'Actions',
      unit: 'Unit',
      required: 'Required',
      optional: 'Optional',

      // â”€â”€ Sidebar / Nav â”€â”€
      addFood: 'Add Food',
      discover: 'Discover',
      history: 'History',
      impact: 'Impact',
      notifications: 'Notifications',
      profile: 'Profile',
      accessibilitySettings: 'Accessibility',

      // â”€â”€ Landing Page â”€â”€
      heroTitle1: 'Food waste is a',
      heroTitle2: 'solvable problem',
      heroSubtitle: 'SurplusSync connects donors, NGOs, and volunteers on one platform, turning meals that would be wasted into meals that are shared.',
      joinMovement: 'Join the movement',
      getStarted: 'Get Started',
      howItWorks: 'How it works',
      fourSimpleSteps: 'Four simple steps',
      stepList: 'List',
      stepListDesc: 'Donor lists surplus food with photos & details',
      stepDiscover: 'Discover',
      stepDiscoverDesc: 'NGOs find nearby donations on the live map',
      stepPickup: 'Pickup',
      stepPickupDesc: 'Volunteer picks up food from the donor',
      stepDeliver: 'Deliver',
      stepDeliverDesc: 'Food reaches the community through NGOs',
      threeRolesOneMission: 'Three roles, one mission',
      everyoneHasAPart: 'Everyone has a part to play',
      donorSubtitle: 'Restaurants Â· Caterers Â· Individuals',
      donorDesc: 'List surplus food in seconds. Upload photos, set quantities, and our safety engine auto-calculates expiry windows.',
      ngoSubtitle: 'Food banks Â· Shelters Â· Charities',
      ngoDesc: 'Discover nearby donations on a live map. Claim food, track pickups, and manage your daily intake capacity.',
      volunteerSubtitle: 'Drivers Â· Students Â· Community',
      volunteerDesc: 'Pick up claimed food from donors and deliver it to NGOs. Track your deliveries and build your impact score.',
      avgListingTime: 'Avg listing time',
      safetyValidated: 'Safety validated',
      geoFiltered: 'Geo-filtered',
      capacityTracked: 'Capacity tracked',
      statusUpdates: 'Status updates',
      impactTracked: 'Impact tracked',
      realTime: 'Real-time',
      always: 'Always',
      daily: 'Daily',
      platformCapabilities: 'Platform capabilities',
      builtDifferent: 'Built different',
      geoAwareFoodMap: 'Geo-aware food map',
      geoMapDesc: 'Interactive map powered by Leaflet showing all available donations in your radius. Filter by distance, food type, and urgency.',
      fiveKmRadius: '5 km radius',
      realTimePins: 'Real-time pins',
      routePreview: 'Route preview',
      foodSafetyEngine: 'Food safety engine',
      foodSafetyDesc: 'Auto-validates expiry windows. High-risk foods require 2+ hours of safe shelf life.',
      liveStatusTracking: 'Live status tracking',
      liveStatusDesc: 'Follow every donation from listing to delivery with real-time status updates.',
      impactDashboard: 'Impact dashboard',
      impactDashboardDesc: 'Every meal saved is tracked. See your contribution to reducing COâ‚‚ emissions, total meals redistributed, and community impact over time.',
      emissionsTracked: 'Emissions tracked',
      perDonation: 'Per donation',
      foodSaved: 'Food saved',
      communityVoices: 'Community voices',
      trustedByChangemakers: 'Trusted by changemakers',
      everyMealMatters: 'Every meal matters',
      everyMealDesc: 'Whether you have food to share, people to feed, or time to volunteer, your action makes a real difference. Join SurplusSync today.',
      startNowFree: "Start now, it's free",
      mealsRedistributed: 'Meals Redistributed',
      activeDonors: 'Active Donors',
      partnerNGOs: 'Partner NGOs',
      volunteers: 'Volunteers',
      platform: 'Platform',
      connect: 'Connect',
      forDonors: 'For Donors',
      forNGOs: 'For NGOs',
      forVolunteers: 'For Volunteers',

      // â”€â”€ Login Page â”€â”€
      welcomeBack: 'Welcome back',
      signInToContinue: 'Sign in to continue making a difference',
      emailAddress: 'Email address',
      signingIn: 'Signing in...',
      dontHaveAccount: "Don't have an account?",
      createAccount: 'Create account',
      connectDonorsNGOs: 'Connect donors with NGOs',
      realTimeFoodTracking: 'Real-time food tracking',
      reduceFoodWaste: 'Reduce food waste together',
      makeSocialImpact: 'Make a social impact',
      mealsSaved: 'Meals saved',

      // â”€â”€ Register Page â”€â”€
      createYourAccount: 'Create your account',
      startMakingDifference: 'Start making a difference today',
      joinAs: 'I want to join as',
      shareSurplusFood: 'Share surplus food',
      collectDistribute: 'Collect & distribute',
      helpWithTransport: 'Help with transport',
      yourName: 'Your Name',
      phoneNumber: 'Phone Number',
      businessName: 'Business Name',
      organizationName: 'Organization Name',
      registrationCertificate: 'Registration Certificate',
      uploadCertificate: 'Upload Certificate',
      acceptedFormats: 'Accepted formats: Images or PDF',
      creating: 'Creating...',
      alreadyHaveAccount: 'Already have an account?',
      foodSafetyAutoValidation: 'Food safety engine with auto-validation',
      realTimeStatusTracking: 'Real-time status & location tracking',
      impactAnalytics: 'Impact analytics & gamification',
      joinFightFoodWaste: 'Join the fight against food waste',
      createAccountAndImpact: 'Create your account and start making an impact today. Every meal saved matters.',
      transformSurplus: 'Transform surplus into sustenance',
      joinThousands: 'Join thousands of donors, NGOs, and volunteers making a difference in the fight against food waste.',

      // â”€â”€ Donor Home â”€â”€
      goodMorning: 'Good morning',
      goodAfternoon: 'Good afternoon',
      goodEvening: 'Good evening',
      manageDonations: 'Manage your food donations and make a difference',
      urgentExpiring: 'Urgent: Food Expiring Soon',
      expiringSoonCount: 'You have {{count}} donation(s) expiring within 3 hours',
      yourListings: 'Your Listings',
      expiringSoon: '{{count}} expiring soon',
      pendingPickup: 'Pending Pickup',
      inTransit: 'In Transit',
      delivered: 'Delivered',
      complete: 'Complete',
      discoveryMap: 'Discovery Map',
      viewDonationsOnMap: 'View your donations on map',
      yourImpact: 'Your Impact',
      seeDifference: 'See the difference you\'re making',
      recentDonations: 'Your Recent Donations',
      noDonationsYet: 'No donations yet. Start making a difference!',
      addFirstDonation: 'Add Your First Donation',
      available: 'Available',
      trustScore: 'Trust: {{score}}',
      safetyCheck: 'Safety Check',
      keptCovered: 'Kept Covered',
      notCovered: 'Not Covered',
      cleanContainer: 'Clean Container',
      dirtyContainer: 'Dirty Container',
      prepared: 'Prepared: {{time}}',

      // â”€â”€ NGO Dashboard â”€â”€
      findClaimDonations: 'Find and claim food donations to help your community',
      dailyIntakeCapacity: 'Daily Intake Capacity',
      currentLoad: 'Current load: {{current}} / {{capacity}} {{unit}}',
      readyToClaim: 'Ready to Claim',
      claimedPending: 'Claimed & Pending',
      inProgress: 'In Progress',
      availableDonationsToClaim: 'Available Donations To Claim',
      noAvailableDonations: 'No available donations right now. Try checking the map or refreshing later.',
      noClaimedDonations: 'No claimed donations yet. Start claiming from available donations!',
      pickedUp: 'Picked Up',
      claimed: 'Claimed',
      pickupLocation: 'Pickup Location',
      alreadyClaimed: 'Already Claimed - Awaiting Pickup',
      claimThisFood: 'Claim This Food',
      alreadyPickedUp: 'Already Picked Up - Pending Delivery',
      yourClaimedDonations: 'Your Claimed Donations',

      // â”€â”€ Add Food â”€â”€
      addFoodDonation: 'Add Food Donation',
      shareSurplusFoodNeed: 'Share surplus food with those in need',
      prepTimeError: 'Preparation time cannot be in the future',
      exceededSafeWindow: 'This {{foodType}} food has exceeded the safe consumption window of {{hours}} hours',
      selectPickupLocation: 'Please select a pickup location on the map',
      missingDonorInfo: 'Missing donor information. Please sign in again.',
      exceededSafeLimits: 'This food has exceeded safe consumption limits',
      foodType: 'Food Type',
      safeConsumptionWindow: 'Safe consumption window: {{hours}} hours from preparation',
      whenPrepared: 'When was this food prepared?',
      foodName: 'Food Name',
      foodNamePlaceholder: 'e.g., Vegetable Biryani',
      quantityPlaceholder: '10',
      descriptionOptional: 'Description (optional)',
      descriptionPlaceholder: 'Any additional details (ingredients, dietary info, special instructions)...',
      foodImages: 'Food Images (Optional)',
      pickupLocationLabel: 'Pickup Location',
      locationSelected: 'âœ“ Selected',
      clickMapToSet: 'Click on the map to set pickup location',
      hygieneChecklist: 'Hygiene Checklist',
      hygieneComplete: 'âœ“ Complete',
      keptCoveredAlways: 'Food was kept covered at all times',
      cleanFoodSafe: 'Container is clean and food-safe',
      hygieneNote: 'Both hygiene requirements must be met to ensure food safety',
      creatingDonation: 'Creating Donation...',
      failedCreateDonation: 'Failed to create donation',

      // â”€â”€ Discovery Map â”€â”€
      discoveryMapTitle: 'Discovery Map',
      loadingDonations: 'Loading donations...',
      viewDetailsImage: 'View Details & Image',
      urgentExpiringSoon: 'Urgent: Expiring Soon',
      alreadyClaimedLabel: 'Already Claimed',
      loginAsNGO: 'Log in as NGO or Volunteer to claim',
      confirmPickup: 'Confirm Pickup',
      confirmDelivery: 'Confirm Delivery',

      // â”€â”€ History â”€â”€
      historyTitle: 'History',
      yourPastContributions: 'Your past contributions',
      total: 'Total',
      donationList: 'Donation List',
      growthReports: 'Growth Reports',
      monthlyFoodIntake: 'Monthly Food Intake',
      totalDonationsReceived: 'Total donations received per month',
      deliveriesCompleted: 'Deliveries Completed',
      deliveriesTrend: 'Successful food deliveries trend',
      claimsMade: 'Claims Made',
      claimsPerMonth: 'Donations claimed by your NGO per month',
      sixMonthSummary: '6-Month Summary',
      totalReceived: 'Total Donations Received',
      successfulDeliveries: 'Successful Deliveries',
      deliveryRate: 'Delivery Rate',
      historyTip: 'Use this data to demonstrate impact in your funding applications. A high delivery rate signals operational efficiency to grant committees.',
      all: 'All',
      noDonationsFound: 'No donations found',
      item: 'Item',

      // â”€â”€ Impact â”€â”€
      newcomer: 'Newcomer',
      newcomerDesc: 'Earned first 10 karma points',
      localHero: 'Local Hero',
      localHeroDesc: 'Reached 50 karma points',
      champion: 'Champion',
      championDesc: 'Reached 150 karma points',
      legend: 'Legend',
      legendDesc: 'Reached 300 karma points',
      superhero: 'Superhero',
      superheroDesc: 'Reached 500 karma points',
      certificateOfAppreciation: 'Certificate of Appreciation',
      inRecognitionService: 'In Recognition of Dedicated Service',
      certificatePresented: 'This certificate is proudly presented to',
      ngoPartner: 'NGO Partner',
      foodDonor: 'Food Donor',
      mealsProvided: 'Meals Provided',
      foodRescued: 'Food Rescued',
      karmaPoints: 'Karma Points',
      platformDirector: 'Platform Director',
      surplusSyncNetwork: 'SurplusSync Network',
      dateOfIssue: 'Date of Issue',
      karmaAchievements: 'Karma & Achievements',
      nextBadge: 'Next: {{name}}',
      pointsToGo: '{{points}} pts to go',
      allBadgesUnlocked: 'All badges unlocked! You\'re a Superhero!',
      communityImpact: 'Community Impact â€” Platform Wide',
      communityImpactDesc: 'Live totals across all donors, NGOs and volunteers on SurplusSync',
      co2Saved: 'COâ‚‚ Saved',
      totalDonationsProcessed: '{{count}} total donations processed',
      successfullyDelivered: '{{count}} successfully delivered',
      currentlyActive: '{{count}} currently active',
      ngoGrowthReports: 'NGO Growth Reports',
      lastSixMonths: 'Last 6 months',
      monthlyIntakeSummaries: 'Monthly food intake summaries â€” use these for grant and funding applications',
      totalReceivedMonth: 'Total donations received each month',
      deliveryTrend: 'Delivery Trend',
      deliveriesPerMonth: 'Successful food deliveries per month',
      claimsEachMonth: 'Donations claimed each month',
      highDeliveryTip: 'A high delivery rate demonstrates operational efficiency â€” highlight this in funding applications',

      // â”€â”€ Notifications â”€â”€
      stayUpdated: 'Stay updated on your donations and deliveries',
      unread: 'Unread {{count}}',
      markAllRead: 'Mark all as read',
      loadingNotifications: 'Loading notifications...',
      noUnreadNotifications: 'No unread notifications',
      noNotificationsYet: 'No notifications yet',
      markAsRead: 'Mark as read',

      // â”€â”€ Profile â”€â”€
      printSavePDF: 'Print / Save PDF',
      inRecognitionOutstanding: 'In Recognition of Outstanding Service',
      loadingProfile: 'Loading profile...',
      failedLoadProfile: 'Failed to Load Profile',
      tryAgain: 'Try Again',
      backToLogin: 'Back to Login',
      manageAccount: 'Manage your account and view your impact',
      download: 'Download',
      levelContributor: 'Level {{level}} â€¢ {{role}}',
      progressToLevel: 'Progress to Level {{level}}',
      pointsToGoProfile: '{{points}} points to go',
      trophyCase: 'Trophy Case',
      noBadgesYet: 'No badges earned yet',
      earnFirstBadge: 'Earn 10 karma points to get your first badge!',
      accountInfo: 'Account Information',
      fullName: 'Full Name',
      emailCannotChange: 'Email cannot be changed',
      notProvided: 'Not provided',
      badgeGuide: 'Badge Guide',
      earnKarma: 'Earn {{points}} karma points',
      earned: 'âœ“ Earned',
      howToEarnKarma: 'How to Earn Karma',
      createDonation: 'Create a Donation',
      createDonationDesc: 'Donor lists new food for redistribution',
      claimDonation: 'Claim a Donation',
      claimDonationDesc: 'NGO claims available food',
      donationDeliveredDonor: 'Donation Delivered (Donor)',
      donationDeliveredDonorDesc: 'Your donated food is successfully delivered',
      donationDeliveredNGO: 'Donation Delivered (NGO)',
      donationDeliveredNGODesc: 'Food you claimed is marked as delivered',
      volunteerDelivery: 'Volunteer Delivery',
      volunteerDeliveryDesc: 'Complete a food delivery as a volunteer',
      verificationPending: 'Verification Pending',
      verificationPendingDesc: 'Your NGO account is under review. You\'ll receive access once verified by our team.',
      impactReport: 'Impact Report',
      volunteerCertificate: 'Volunteer Certificate',
      myCertificate: 'My Certificate',
      editProfile: 'Edit Profile',

      // â”€â”€ Volunteer Dashboard â”€â”€
      volunteerDashboard: 'Volunteer Dashboard',
      managePickupsDeliveries: 'Manage pickups and deliveries assigned to you.',
      assignedTasks: 'Assigned Tasks',
      noAssignedTasks: 'No assigned pickups or deliveries.',
      view: 'View',
      noImage: 'No image',

      // â”€â”€ Admin Dashboard â”€â”€
      pendingNGOs: 'Pending NGOs',
      allUsers: 'All Users',
      platformDonations: 'Platform Donations',
      systemAdministration: 'System Administration',
      manageUsersDesc: 'Manage users, approve NGOs, and monitor platform health.',
      loadingData: 'Loading data...',
      noRecordsFound: 'No records found.',
      nameOrg: 'Name / Org',
      dateStatus: 'Date / Status',
      viewCertificate: 'View Certificate',
      approve: 'Approve',
      suspend: 'Suspend',
      restore: 'Restore',
      registrationCertificateLabel: 'Registration Certificate',

      // ── Impact (role-specific) ──
      organizationImpact: 'Organization Impact',
      yourContribution: 'Your Contribution',
      trackCommunityReach: 'Track your community reach',
      everyDeliveryMatters: 'Every delivery makes a difference',
      foodCollected: 'Food Collected',
      totalDeliveries: 'Total Deliveries',
      totalDonations: 'Total Donations',
      peopleServed: 'People Served',
      peopleHelped: 'People Helped',
      foodTransported: 'Food Transported',
      downloadImpactReport: 'Download Impact Report',
      downloadVolunteerCert: 'Download Volunteer Certificate',
      downloadImpactCert: 'Download Impact Certificate',
      loadingYourImpact: 'Loading your impact...',
      foodItemsShared: 'Food items shared',
      completed: 'Completed',
      peopleImpacted: 'People impacted',
      kilograms: 'Kilograms',
      environmentalImpact: 'Environmental Impact',
      co2SavedLabel: 'CO₂ saved',
      waterSaved: 'Water saved',
      familiesHelped: 'Families helped',
      trustScoreLabel: 'Trust score',
      performanceMetrics: 'Performance Metrics',
      distanceCovered: 'Distance Covered',
      avgResponse: 'Avg Response',
      successRate: 'Success Rate',
      rating: 'Rating',
      impactReportFunding: 'Impact Report for Funding',
      shareYourImpact: 'Share Your Impact',
      generateProfessionalReport: 'Generate a professional impact report for grants and documentation',
      downloadVolunteerLinkedIn: 'Download your volunteer certificate to share on LinkedIn',
      downloadPersonalisedCert: 'Download your personalised certificate and inspire others to join',

      // CertificateModal (new keys for dynamic text)
      foodCollectionsAndCommunity: 'food collections and community service',
      foodDeliveryAndCommunity: 'food delivery and community service',
      foodDonationsAndSustainability: 'food donations and sustainability efforts',
      collections: 'Collections',
      deliveries: 'Deliveries',
      certPresentedTo: 'This certificate is proudly presented to',
      certAcknowledgement: 'in acknowledgement of their outstanding contribution through {{actionText}}, making a meaningful difference in the lives of people in our community.',
      karmaPointsLevel: '⭐ {{karma}} Karma Points · Level {{level}} Contributor',

      // NGOGrowthCharts (alternate key names used by component)
      ngoGrowthSubtitle: 'Monthly food intake summaries — use these for grant and funding applications',
      totalDonationsReceivedMonth: 'Total donations received each month',
      successfulDeliveriesPerMonth: 'Successful food deliveries per month',
      donationsClaimedMonth: 'Donations claimed each month',
      highDeliveryRateTip: '💡 A high delivery rate demonstrates operational efficiency — highlight this in funding applications',

      // Profile karma actions
      deliverDonation: 'Deliver Donation',
      deliverDonationDesc: '+20 karma for each successful delivery',
      firstDonation: 'First Donation',
      firstDonationDesc: '+25 karma bonus for your first contribution',
};

// â”€â”€â”€ Dynamic translation event bus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Components can listen to these events to show loading indicators.

export const translationEvents = new EventTarget();

// â”€â”€â”€ i18next initialization (English-only static resource) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const savedLang = localStorage.getItem('i18nLanguage') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enStrings },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Load cached translations for the initial non-English language (instant)
if (savedLang !== 'en') {
  const cached = getCachedTranslations(savedLang);
  if (cached) {
    i18n.addResourceBundle(savedLang, 'translation', cached, true, true);
  } else {
    // First visit in this language â€” kick off background translation
    translateAll(enStrings, savedLang, (partial, done, total) => {
      i18n.addResourceBundle(savedLang, 'translation', partial, true, true);
      translationEvents.dispatchEvent(
        new CustomEvent('translating', { detail: { loading: done < total, done, total } }),
      );
    });
  }
}

// â”€â”€â”€ Dynamic translation on every language change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

i18n.on('languageChanged', async (lng: string) => {
  localStorage.setItem('i18nLanguage', lng);
  if (lng === 'en') return;

  // Try cache first (synchronous â†’ instant)
  const cached = getCachedTranslations(lng);
  if (cached && Object.keys(cached).length >= Object.keys(enStrings).length) {
    i18n.addResourceBundle(lng, 'translation', cached, true, true);
    return;
  }

  // Signal start
  translationEvents.dispatchEvent(
    new CustomEvent('translating', { detail: { loading: true, done: 0, total: Object.keys(enStrings).length } }),
  );

  // Translate progressively â€” UI updates as batches arrive
  const translated = await translateAll(enStrings, lng, (partial, done, total) => {
    i18n.addResourceBundle(lng, 'translation', partial, true, true);
    translationEvents.dispatchEvent(
      new CustomEvent('translating', { detail: { loading: done < total, done, total } }),
    );
  });

  i18n.addResourceBundle(lng, 'translation', translated, true, true);
  translationEvents.dispatchEvent(
    new CustomEvent('translating', { detail: { loading: false, done: Object.keys(enStrings).length, total: Object.keys(enStrings).length } }),
  );
});

// â”€â”€â”€ REMOVED: Hindi & Tamil static dictionaries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// All non-English translations are now fetched dynamically via the MyMemory API
// and cached permanently in localStorage. This reduced this file from 1156 â†’ ~250 lines.

export default i18n;
