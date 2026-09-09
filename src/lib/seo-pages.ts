export type SeoPage = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  keyword: string;
  brandHint?: string;
  intro: string;
  cta: string;
  ctaHref: string;
  faqs: { q: string; a: string }[];
};

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "sell-old-phone-mumbai",
    title: "Sell Old Phone in Mumbai | Doorstep Pickup | PhoneSell",
    headline: "Sell Your Old Phone in Mumbai",
    description:
      "Sell your old phone in Mumbai with free doorstep pickup. Get an estimated value online and a transparent purchase after inspection. Serving Mira Road, Bhayandar, Thane and more.",
    keyword: "sell old phone in Mumbai",
    intro:
      "If you are searching for a trusted old mobile buyer in Mumbai, PhoneSell offers a clear online valuation, scheduled doorstep pickup and a documented purchase. We buy working, refurbished, damaged and non-starting smartphones across Mumbai and nearby areas.",
    cta: "Get My Phone's Value",
    ctaHref: "/sell",
    faqs: [
      { q: "Do you buy old phones across Mumbai?", a: "Yes. We schedule doorstep pickup across Mumbai, Mira Road, Bhayandar, Thane, Navi Mumbai and listed service areas." },
      { q: "Is the online price final?", a: "No. The website shows an estimate. Final value is confirmed after physical inspection." },
    ],
  },
  {
    slug: "sell-old-phone-mira-road",
    title: "Sell Old Phone in Mira Road | PhoneSell",
    headline: "Sell Your Old Phone in Mira Road",
    description:
      "Sell used and old phones in Mira Road East with doorstep pickup from Singapore Plaza's local team. Instant online estimate and scheduled collection.",
    keyword: "sell old phone Mira Road",
    intro:
      "PhoneSell operates from Singapore Plaza, Mira Road East. Residents of Mira Road, Shanti Nagar, Beverly Park and nearby societies can book a same-area pickup after getting an estimated resale value online.",
    cta: "Sell My Phone in Mira Road",
    ctaHref: "/sell",
    faqs: [
      { q: "Where are you based in Mira Road?", a: "Singapore Plaza, Opp. Razzas Mall, Mira Road East, Thane – 401107." },
      { q: "How fast is pickup in Mira Road?", a: "Mira Road pickups are typically arranged within 24 hours of a confirmed slot." },
    ],
  },
  {
    slug: "sell-old-phone-thane",
    title: "Sell Old Phone in Thane | Doorstep Pickup | PhoneSell",
    headline: "Sell Your Old Phone in Thane",
    description:
      "Sell used phones in Thane with doorstep pickup. Get a fair market estimate for iPhone, Samsung, OnePlus and Android devices.",
    keyword: "sell old phone Thane",
    intro:
      "From Ghodbunder Road to Thane West and nearby pockets, you can sell an old smartphone without travelling to a store. Select your model, share condition details and book a pickup slot.",
    cta: "Get My Phone's Value",
    ctaHref: "/sell",
    faqs: [
      { q: "Do you cover Thane city?", a: "Yes. Thane is a listed service area with configurable pickup charges and timing from the admin panel." },
    ],
  },
  {
    slug: "sell-old-phone-bhayandar",
    title: "Sell Old Phone in Bhayandar | PhoneSell",
    headline: "Sell Your Old Phone in Bhayandar",
    description:
      "Sell old and used mobiles in Bhayandar with doorstep pickup. Local Mira Road team, transparent estimate and documented payment.",
    keyword: "sell old phone Bhayandar",
    intro:
      "Bhayandar East and West residents can sell unused, upgraded or damaged phones through our Mira Road based pickup team. The process is the same: model, variant, condition, estimate, address, slot.",
    cta: "Sell My Phone",
    ctaHref: "/sell",
    faqs: [
      { q: "Is Bhayandar pickup free?", a: "Pickup charges are admin-controlled. Many nearby areas including Bhayandar are set to free doorstep pickup." },
    ],
  },
  {
    slug: "sell-iphone-mumbai",
    title: "Sell iPhone in Mumbai | Old iPhone Buyer | PhoneSell",
    headline: "Sell Your iPhone in Mumbai",
    description:
      "Sell your old iPhone in Mumbai. Get an estimated value for iPhone 11 to iPhone 17 series, including Pro and Pro Max models, with doorstep pickup.",
    keyword: "sell iPhone in Mumbai",
    brandHint: "Apple",
    intro:
      "Want to sell an old iPhone in Mumbai? Choose your exact model — from iPhone 11 to the latest iPhone 17 series — then share storage, battery health and condition. We buy working, damaged and non-starting iPhones after inspection.",
    cta: "Get My iPhone Value",
    ctaHref: "/sell?brand=apple",
    faqs: [
      { q: "Which iPhones do you buy?", a: "We buy iPhone 11 through iPhone 17 series, SE models and earlier listed devices, including phones with battery wear or screen damage." },
      { q: "Do I need to share battery health?", a: "Yes for iPhones. Select a battery health range so the estimate can apply the correct adjustment." },
    ],
  },
  {
    slug: "sell-samsung-mumbai",
    title: "Sell Samsung Phone in Mumbai | Galaxy Buyer | PhoneSell",
    headline: "Sell Your Samsung Phone in Mumbai",
    description:
      "Sell used Samsung Galaxy phones in Mumbai — S series, A series, M series, F series, Note and Z Fold/Flip — with doorstep pickup.",
    keyword: "sell Samsung phone Mumbai",
    brandHint: "Samsung",
    intro:
      "Samsung Galaxy devices remain among the most requested models we purchase. Select your S, A, M, F, Note or foldable model, pick RAM and storage, and get an estimated resale value before booking pickup.",
    cta: "Get My Samsung Value",
    ctaHref: "/sell?brand=samsung",
    faqs: [
      { q: "Do you buy damaged Galaxy phones?", a: "Yes. Cracked screens, body dents and non-starting devices can still be evaluated. The estimate will drop based on condition rules." },
    ],
  },
  {
    slug: "sell-oneplus-mumbai",
    title: "Sell OnePlus Phone in Mumbai | PhoneSell",
    headline: "Sell Your OnePlus Phone in Mumbai",
    description:
      "Sell old OnePlus and Nord phones in Mumbai with an online estimate and doorstep pickup from Mira Road based PhoneSell.",
    keyword: "sell OnePlus phone Mumbai",
    brandHint: "OnePlus",
    intro:
      "From OnePlus 7 through OnePlus 13, plus Nord and Nord CE series, you can sell your OnePlus phone without visiting a store. Tell us the variant and condition to see an estimated price.",
    cta: "Get My OnePlus Value",
    ctaHref: "/sell?brand=oneplus",
    faqs: [
      { q: "Do you buy Nord series phones?", a: "Yes. Nord, Nord 2, Nord CE and later Nord models are in the catalog and can be added by admin as new launches arrive." },
    ],
  },
  {
    slug: "sell-google-pixel-mumbai",
    title: "Sell Google Pixel in Mumbai | PhoneSell",
    headline: "Sell Your Google Pixel in Mumbai",
    description:
      "Sell used Google Pixel phones in Mumbai. Pixel 6 to Pixel 9 series with doorstep pickup and fair market estimates.",
    keyword: "sell Google Pixel Mumbai",
    brandHint: "Google Pixel",
    intro:
      "Pixel owners in Mumbai can sell older and current Pixel models through our catalog. Choose RAM/storage, describe screen and camera condition, then schedule pickup.",
    cta: "Get My Pixel Value",
    ctaHref: "/sell?brand=google-pixel",
    faqs: [
      { q: "Do you buy Pixel phones with screen issues?", a: "Yes. Display lines, dead pixels and cracked glass are captured in the condition wizard and priced through admin rules." },
    ],
  },
  {
    slug: "sell-used-phone-mumbai",
    title: "Sell Used Phone in Mumbai | Used Mobile Buyer | PhoneSell",
    headline: "Sell Your Used Phone in Mumbai",
    description:
      "Sell a used mobile phone in Mumbai for cash after inspection. Online estimate, OTP-verified booking and doorstep pickup.",
    keyword: "sell used phone Mumbai",
    intro:
      "Used does not mean unclear pricing. Our wizard asks for variant, wear, accessories and photos so the estimate is grounded in the same rules our team uses after pickup.",
    cta: "Sell My Used Phone",
    ctaHref: "/sell",
    faqs: [
      { q: "Do I get paid immediately?", a: "Payment is released after inspection and your acceptance of the final price, via UPI, bank transfer or cash." },
    ],
  },
  {
    slug: "sell-broken-phone-mumbai",
    title: "Sell Broken Phone in Mumbai | Damaged Mobile Buyer | PhoneSell",
    headline: "Sell Your Broken Phone in Mumbai",
    description:
      "Sell a broken phone in Mumbai. We buy devices with cracked screens, body damage and hardware faults after inspection.",
    keyword: "sell broken phone Mumbai",
    intro:
      "A broken phone still has parts and residual value. Select cracked, damaged or non-working options in the condition flow. The pricing engine applies configured deductions so you see a realistic estimate before pickup.",
    cta: "Get Value for a Broken Phone",
    ctaHref: "/sell",
    faqs: [
      { q: "Can I sell a phone that does not turn on?", a: "Yes. Choose “Does not switch on” or “Completely dead”. The estimate is reduced and confirmed after inspection." },
    ],
  },
  {
    slug: "sell-damaged-phone-mumbai",
    title: "Sell Damaged Phone in Mumbai | PhoneSell",
    headline: "Sell Your Damaged Phone in Mumbai",
    description:
      "Sell damaged smartphones in Mumbai including water issues, camera faults and charging port problems, with doorstep pickup.",
    keyword: "sell damaged phone Mumbai",
    intro:
      "Damage is assessed component by component: screen, body, display, battery, cameras, charging port, biometrics and power. Upload photos of the damage area so our team can prepare before arrival.",
    cta: "Get My Phone's Value",
    ctaHref: "/sell",
    faqs: [
      { q: "Should I repair the phone before selling?", a: "Usually no. Unauthorised repairs can reduce value. Share previous repair history honestly in the extra questions." },
    ],
  },
];
