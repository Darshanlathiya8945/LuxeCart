const products = [
  {
    id: 1,
    name: "Sunlit Hooded Set",
    price: 148,
    category: "Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A bright hooded set with a cropped top, relaxed trousers, and an easy sport line."
  },
  {
    id: 2,
    name: "Cashmere Overcoat",
    price: 420,
    category: "Women",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A long overcoat in warm cashmere, cut with a clean shoulder and a quiet line."
  },
  {
    id: 3,
    name: "Wide-Leg Trousers",
    price: 168,
    category: "Women",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "High-rise trousers with a relaxed leg, a pressed crease, and a smooth wool hand."
  },
  {
    id: 4,
    name: "Satin Slip Dress",
    price: 240,
    category: "Women",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A bias-cut slip dress that falls lightly to the ankle and catches the light."
  },
  {
    id: 5,
    name: "Wool Topcoat",
    price: 390,
    category: "Men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A structured topcoat in dense wool with a narrow lapel and a tailored shoulder."
  },
  {
    id: 6,
    name: "Oxford Cloth Shirt",
    price: 96,
    category: "Men",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A crisp cotton shirt with a soft collar and mother-of-pearl buttons."
  },
  {
    id: 7,
    name: "Merino Crewneck",
    price: 148,
    category: "Men",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "Fine-gauge merino with a close fit, a ribbed hem, and a smooth hand."
  },
  {
    id: 8,
    name: "Pleated Trousers",
    price: 178,
    category: "Men",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "Pleated wool trousers with a straight leg and a comfortable, higher rise."
  },
  {
    id: 9,
    name: "Leather Day Tote",
    price: 265,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A structured tote in smooth leather, sized for a day in the city."
  },
  {
    id: 10,
    name: "Gold Hoop Earrings",
    price: 78,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "Lightweight hoops with a brushed gold finish and a quiet shine."
  },
  {
    id: 11,
    name: "Silk Twill Scarf",
    price: 88,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A square silk scarf in a muted tone, soft enough to wear at the neck."
  },
  {
    id: 12,
    name: "Leather Strap Watch",
    price: 215,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&h=1200&q=80",
    description: "A slim watch with a cream dial, fine markers, and a tan leather strap."
  }
];

function getProductById(id) {
  const numericId = Number(id);

  for (let index = 0; index < products.length; index++) {
    if (products[index].id === numericId) {
      return products[index];
    }
  }

  return null;
}
