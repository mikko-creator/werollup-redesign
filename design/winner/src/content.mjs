// content.mjs — verbatim strings for Designer B's prototype (from audit/raw/index.html, audit/raw/products-flower.html
// and docs/data/site-map.json). Nothing here is invented: UI microcopy added by the design (aria labels, "Skip to
// content", "Open menu", "Close menu", "Previous review", "Next review", "Choose your store") is marked UI below.

export const SP_SHOP = '/location/san-pedro/shop/?filters%5Broot_types%5D%5B%5D=';
export const LAX_SHOP = (cat) => `/location/culver-city/shop/?store_path=%2F&store_query=filter%255BanyClientCategories%255D%255B%255D%3D${cat}-category-pages%26sortBy%3Dmost_popular%26page%3D1&locationId=10599`;

export const productsTree = {
  sanPedro: [
    ['Best Selling', SP_SHOP + 'best_selling'],
    ['Order Flower', SP_SHOP + 'flower'],
    ['Order Pre-Rolls', SP_SHOP + 'pre-roll'],
    // A8: the San Pedro vape link points at the San Pedro shop (the old /shop-playa-vista/ target dropped the filter)
    ['Order Vaporizers & Cartridges', SP_SHOP + 'vape'],
    ['Order Edibles & Gummies', SP_SHOP + 'edible'],
    ['Order Concentrates', SP_SHOP + 'extract'],
    ['Order Topicals', SP_SHOP + 'topical'],
  ],
  lax: [
    ['Best Selling', '/location/culver-city/shop/?store_path=%2F&store_query=page%3D1%26sortBy%3Dmost_popular&locationId=10599'],
    ['Order Flower', LAX_SHOP('flower')],
    ['Order Pre-Rolls', LAX_SHOP('pre-rolls')],
    ['Order Vaporizers & Cartridges', LAX_SHOP('vape-pens')],
    ['Order Edibles & Gummies', LAX_SHOP('edibles')],
    ['Order Concentrates', LAX_SHOP('concentrates')],
    ['Order Topicals', LAX_SHOP('topicals')],
  ],
};

// Category image cards: labels and hrefs are the Education > product items of menu-primary-navigation.
export const categories = [
  { label: 'Flower', href: '/products/flower/', img: 'img/card-flower.webp', proto: 'flower.html' },
  { label: 'Pre-Rolls', href: '/products/pre-rolls/', img: 'img/card-prerolls.webp' },
  { label: 'Vaporizers & Cartridges', href: '/products/vaporizers-cartridges/', img: 'img/card-vape.webp' },
  { label: 'Edibles', href: '/products/edibles/', img: 'img/card-edibles.webp' },
  { label: 'Concentrates', href: '/products/concentrates/', img: 'img/card-concentrates.webp' },
  { label: 'Topicals', href: '/products/topicals/', img: 'img/card-topicals.webp' },
];

export const education = [
  ['Flower', '/products/flower/', 'flower.html'],
  ['Pre-Rolls', '/products/pre-rolls/'],
  ['Vaporizers & Cartridges', '/products/vaporizers-cartridges/'],
  ['Edibles', '/products/edibles/'],
  ['Concentrates', '/products/concentrates/'],
  ['Topicals', '/products/topicals/'],
  ['Cannabis 101', '/education/cannabis-101/'],
  ['Recreational & Medicinal', '/education/recreational-medicinal/'],
];

export const social = [
  ['Instagram', 'https://www.instagram.com/we.roll.up/?hl=en'],
  ['Google', 'https://www.google.com/maps?cid=5006542390870460260'],
  ['Yelp', 'https://www.yelp.com/biz/we-roll-up-los-angeles-4'],
  ['Weedmaps', 'https://weedmaps.com/dispensaries/the-green-co-dispensary-inc'],
];

export const reviews = [
  { name: 'Jennifer', html: 'Awesome staff, friendly and knowledgeable. Welcomed from the moment you check in. Need more stars! Recommend to everyone.<br>\nFirst time discount! Head here for quality products and FANTASTIC service.' },
  { name: 'Patricia H', html: 'I went in for the first time today. Perfect. Every tender was so nice and the guy that helped me pick out my stuff was so helpful and made sure I was really taken care of. I love that this new local place opened up and is awesome. I will definitely be making this my new first stop shop.' },
  { name: 'Thomas H', html: 'This place is amazing! Awesome service, the guys here take care of me!! Real blessing to this town! Awesome to see a legal dispensary in San Pedro! Come see David he’ll take care of you!' },
  { name: 'James', html: 'Great staff. They inform you on deals and are very friendly and efficient. Love this place.' },
  { name: 'Greg S', html: 'I finally made it in here and man its rad! Super chill spot with a cool vibe, good product and budtenders who know their stuff. Stoked that there is a legal shop in Pedro now. Will for sure be going back.' },
];

export const reviewCtas = [
  { label: 'Explore All Reviews', cls: 'btn--forest', href: 'https://www.google.com/search?hl=en-US&gl=us&q=We+Roll+Up,+1705+S+Gaffey+St,+San+Pedro,+CA+90731&ludocid=5006542390870460260&lsig=AB86z5W0PW8o5oD0v0X_fMdgOIro' },
  { label: 'Leave a Review', cls: 'btn--line', href: 'https://www.google.com/search?hl=en-US&gl=us&q=We+Roll+Up,+1705+S+Gaffey+St,+San+Pedro,+CA+90731&ludocid=5006542390870460260&lsig=AB86z5W0PW8o5oD0v0X_fMdgOIro#lrd=0x80dd371d9ba6c7d7:0x457acfc758c4c764,3', edit: true },
  { label: 'Explore All Reviews - LAX', cls: 'btn--forest', href: 'https://www.google.com/search?q=werollup+lax' },
  { label: 'Leave a Review - LAX', cls: 'btn--line', href: 'https://search.google.com/local/writereview?placeid=ChIJAfFmFwCxwoARC7V95hl5OQU', edit: true },
];

export const zip = {
  location1zips: ["90254","90277","90275","90732","90274","90505","90503","90501","90502","90745","90717","90710","90744","90731","90822","","90813","90806","90755","90810","90502","90501"],
  location2zips: ["90402","90403","90401","90404","90405","90291","90292","90094","90066","90293","90245","90266","90254","90503","90278","90504","90506","90260","90250","90304","90301","90302","90304","90303","90305","90047","90043","90094","90230","90066","90056","90062","90018","90016","90232","90034","90066","90034","90232","90008","90014","90015","90019","90211","90095","90024","90048","90069","90036","90019","90007","90210","90077","90071"],
};
