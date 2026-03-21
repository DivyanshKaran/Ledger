INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Margherita Pizza',
  'Classic Italian pizza with fresh mozzarella, tomatoes, and basil on a crispy homemade crust.',
  'Italian',
  'Comfort Food',
  'Medium',
  4,
  20,
  25,
  '/recipe-pizza.jpg',
  '[{"name":"Pizza Flour","quantity":500,"unit":"g","pricePerUnit":0.003},{"name":"Yeast","quantity":7,"unit":"g","pricePerUnit":0.05},{"name":"Olive Oil","quantity":30,"unit":"ml","pricePerUnit":0.02},{"name":"San Marzano Tomatoes","quantity":400,"unit":"g","pricePerUnit":0.008},{"name":"Fresh Mozzarella","quantity":250,"unit":"g","pricePerUnit":0.025},{"name":"Fresh Basil","quantity":20,"unit":"g","pricePerUnit":0.10},{"name":"Salt","quantity":10,"unit":"g","pricePerUnit":0.001},{"name":"Garlic","quantity":3,"unit":"cloves","pricePerUnit":0.25}]',
  '[{"id":1,"title":"Prepare the Dough","description":"Mix flour, yeast, salt, and warm water. Knead for 10 minutes until smooth and elastic.","duration":10,"tips":"Dough should be slightly tacky but not sticky"},{"id":2,"title":"Let Dough Rise","description":"Cover the dough and let it rise in a warm place until doubled in size.","duration":60,"tips":"A warm oven (turned off) works great for rising"},{"id":3,"title":"Prepare the Sauce","description":"Crush tomatoes and mix with minced garlic, olive oil, salt, and fresh basil.","duration":5},{"id":4,"title":"Preheat Oven","description":"Preheat your oven to the highest setting (usually 250°C/480°F). If using a pizza stone, place it in now.","duration":15},{"id":5,"title":"Shape the Pizza","description":"Punch down the dough and stretch it into a round shape on a floured surface.","duration":5},{"id":6,"title":"Add Toppings","description":"Spread sauce evenly, tear mozzarella and distribute across the pizza, drizzle with olive oil.","duration":3},{"id":7,"title":"Bake","description":"Bake until the crust is golden and cheese is bubbly with slight charring.","duration":12,"tips":"Watch carefully - pizzas can go from perfect to burnt quickly"},{"id":8,"title":"Finish & Serve","description":"Remove from oven, add fresh basil leaves, slice and serve immediately.","duration":0}]',
  '{"calories":285,"protein":12,"carbs":38,"fat":10,"fiber":2,"sugar":4,"sodium":580}',
  ARRAY['Italian','Classic'],
  ARRAY['Vegetarian'],
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Masala Dosa',
  'Crispy South Indian crepe filled with spiced potato masala, served with coconut chutney and sambar.',
  'Indian',
  'Budget Friendly',
  'Medium',
  4,
  15,
  15,
  '/recipe-dosa.jpg',
  '[{"name":"Dosa Batter","quantity":500,"unit":"g","pricePerUnit":0.004},{"name":"Potatoes","quantity":400,"unit":"g","pricePerUnit":0.002},{"name":"Onion","quantity":150,"unit":"g","pricePerUnit":0.003},{"name":"Mustard Seeds","quantity":10,"unit":"g","pricePerUnit":0.03},{"name":"Curry Leaves","quantity":15,"unit":"pcs","pricePerUnit":0.05},{"name":"Turmeric Powder","quantity":5,"unit":"g","pricePerUnit":0.08},{"name":"Green Chilies","quantity":4,"unit":"pcs","pricePerUnit":0.10},{"name":"Ghee","quantity":40,"unit":"ml","pricePerUnit":0.025},{"name":"Coconut","quantity":100,"unit":"g","pricePerUnit":0.012}]',
  '[{"id":1,"title":"Boil Potatoes","description":"Boil potatoes until fork-tender, then peel and roughly mash them.","duration":15,"tips":"Don''t over-mash - some texture is good"},{"id":2,"title":"Prepare Tempering","description":"Heat ghee, add mustard seeds. When they splutter, add curry leaves and green chilies.","duration":2},{"id":3,"title":"Cook Onions","description":"Add sliced onions and sauté until translucent and slightly golden.","duration":5},{"id":4,"title":"Make Potato Filling","description":"Add turmeric, salt, and mashed potatoes. Mix well and cook for 2 minutes.","duration":3},{"id":5,"title":"Heat the Tawa","description":"Heat a flat griddle (tawa) on medium-high heat. Sprinkle water to test - it should sizzle.","duration":2},{"id":6,"title":"Spread the Dosa","description":"Pour a ladleful of batter in the center, spread in circular motion to make a thin crepe.","duration":1},{"id":7,"title":"Cook the Dosa","description":"Drizzle ghee around edges, cook until bottom is golden and crispy.","duration":2,"tips":"Don''t flip - dosa is cooked only on one side"},{"id":8,"title":"Fill & Fold","description":"Place potato filling in the center, fold dosa over it. Serve immediately with chutney.","duration":0}]',
  '{"calories":245,"protein":6,"carbs":42,"fat":7,"fiber":4,"sugar":3,"sodium":320}',
  ARRAY['Indian','Vegetarian'],
  ARRAY['Vegetarian','Vegan','Dairy-Free'],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Classic Beef Burger',
  'Juicy beef patty with melted cheese, crispy bacon, fresh vegetables on a toasted sesame bun.',
  'American',
  'Comfort Food',
  'Easy',
  4,
  15,
  10,
  '/recipe-burger.jpg',
  '[{"name":"Ground Beef","quantity":600,"unit":"g","pricePerUnit":0.015},{"name":"Burger Buns","quantity":4,"unit":"pcs","pricePerUnit":0.80},{"name":"Cheddar Cheese","quantity":120,"unit":"g","pricePerUnit":0.02},{"name":"Bacon","quantity":200,"unit":"g","pricePerUnit":0.025},{"name":"Lettuce","quantity":100,"unit":"g","pricePerUnit":0.015},{"name":"Tomato","quantity":200,"unit":"g","pricePerUnit":0.005},{"name":"Onion","quantity":100,"unit":"g","pricePerUnit":0.003},{"name":"Pickles","quantity":80,"unit":"g","pricePerUnit":0.018},{"name":"Ketchup","quantity":40,"unit":"ml","pricePerUnit":0.008},{"name":"Mayonnaise","quantity":40,"unit":"ml","pricePerUnit":0.012}]',
  '[{"id":1,"title":"Prepare Patties","description":"Divide ground beef into 4 portions. Shape into patties slightly larger than your buns (they shrink). Season generously with salt and pepper.","duration":5,"tips":"Make a small indent in the center to prevent puffing"},{"id":2,"title":"Cook Bacon","description":"Cook bacon strips in a pan until crispy. Set aside on paper towels.","duration":8},{"id":3,"title":"Heat Grill/Pan","description":"Heat your grill or cast iron pan to high heat. It should be smoking hot.","duration":3},{"id":4,"title":"Cook Patties","description":"Place patties on the hot surface. Don''t press! Cook 3-4 minutes per side for medium.","duration":8,"tips":"Only flip once for best crust"},{"id":5,"title":"Add Cheese","description":"In the last minute, add cheese slices on top and cover to melt.","duration":1},{"id":6,"title":"Toast Buns","description":"Slice buns and toast them cut-side down on the grill until golden.","duration":2},{"id":7,"title":"Assemble","description":"Spread mayo and ketchup on buns. Layer lettuce, patty with cheese, bacon, tomato, onion, and pickles.","duration":0}]',
  '{"calories":650,"protein":38,"carbs":32,"fat":42,"fiber":2,"sugar":8,"sodium":1100}',
  ARRAY['American','Grilled'],
  ARRAY[]::text[],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Butter Chicken',
  'Tender chicken in a rich, creamy tomato-based curry with aromatic spices and butter.',
  'Indian',
  'Comfort Food',
  'Medium',
  4,
  20,
  30,
  '/recipe-butterchicken.jpg',
  '[{"name":"Chicken Thighs","quantity":800,"unit":"g","pricePerUnit":0.012},{"name":"Tomato Puree","quantity":400,"unit":"g","pricePerUnit":0.005},{"name":"Heavy Cream","quantity":200,"unit":"ml","pricePerUnit":0.008},{"name":"Butter","quantity":80,"unit":"g","pricePerUnit":0.012},{"name":"Yogurt","quantity":150,"unit":"g","pricePerUnit":0.006},{"name":"Garam Masala","quantity":15,"unit":"g","pricePerUnit":0.12},{"name":"Ginger","quantity":30,"unit":"g","pricePerUnit":0.025},{"name":"Garlic","quantity":6,"unit":"cloves","pricePerUnit":0.25},{"name":"Kashmiri Chili","quantity":10,"unit":"g","pricePerUnit":0.15},{"name":"Cilantro","quantity":30,"unit":"g","pricePerUnit":0.08}]',
  '[{"id":1,"title":"Marinate Chicken","description":"Cut chicken into chunks. Mix with yogurt, half the garam masala, ginger-garlic paste, salt. Marinate for at least 30 minutes.","duration":30,"tips":"Overnight marination gives best flavor"},{"id":2,"title":"Cook Chicken","description":"Heat butter in a pan, cook marinated chicken pieces until browned on all sides.","duration":10},{"id":3,"title":"Remove Chicken","description":"Set chicken aside. Don''t wash the pan - those brown bits add flavor!","duration":0},{"id":4,"title":"Make the Sauce","description":"In the same pan, add more butter. Sauté remaining ginger-garlic until fragrant.","duration":3},{"id":5,"title":"Add Tomatoes","description":"Add tomato puree and Kashmiri chili. Cook until oil separates from the sauce.","duration":10,"tips":"Low-medium heat prevents burning"},{"id":6,"title":"Blend Sauce","description":"If desired, blend the sauce until smooth for a silkier texture.","duration":2},{"id":7,"title":"Combine & Simmer","description":"Add chicken back, pour in cream, remaining garam masala. Simmer until chicken is cooked through.","duration":10},{"id":8,"title":"Finish","description":"Adjust salt, add a knob of butter for richness. Garnish with fresh cilantro.","duration":0}]',
  '{"calories":520,"protein":42,"carbs":12,"fat":35,"fiber":2,"sugar":6,"sodium":680}',
  ARRAY['Indian','Creamy'],
  ARRAY['Gluten-Free'],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Beef Tacos',
  'Seasoned ground beef in soft flour tortillas topped with fresh salsa, guacamole, and lime.',
  'Mexican',
  'Quick & Easy',
  'Easy',
  4,
  15,
  15,
  '/recipe-tacos.jpg',
  '[{"name":"Ground Beef","quantity":500,"unit":"g","pricePerUnit":0.015},{"name":"Flour Tortillas","quantity":12,"unit":"pcs","pricePerUnit":0.30},{"name":"Taco Seasoning","quantity":30,"unit":"g","pricePerUnit":0.08},{"name":"Avocado","quantity":2,"unit":"pcs","pricePerUnit":1.50},{"name":"Tomato","quantity":200,"unit":"g","pricePerUnit":0.005},{"name":"Lime","quantity":3,"unit":"pcs","pricePerUnit":0.40},{"name":"Onion","quantity":100,"unit":"g","pricePerUnit":0.003},{"name":"Cilantro","quantity":30,"unit":"g","pricePerUnit":0.08},{"name":"Sour Cream","quantity":150,"unit":"g","pricePerUnit":0.008},{"name":"Jalapeño","quantity":2,"unit":"pcs","pricePerUnit":0.25}]',
  '[{"id":1,"title":"Prep Vegetables","description":"Dice tomatoes and onion. Mince jalapeños (remove seeds for less heat). Chop cilantro.","duration":8},{"id":2,"title":"Make Pico de Gallo","description":"Combine diced tomatoes, onion, jalapeño, cilantro with lime juice and salt.","duration":3},{"id":3,"title":"Make Guacamole","description":"Mash avocados, mix with lime juice, salt, and a bit of the pico de gallo.","duration":5,"tips":"Leave it slightly chunky for texture"},{"id":4,"title":"Cook Beef","description":"Brown ground beef in a hot pan, breaking it into small pieces.","duration":8},{"id":5,"title":"Season Beef","description":"Add taco seasoning and a splash of water. Simmer until liquid reduces.","duration":5},{"id":6,"title":"Warm Tortillas","description":"Heat tortillas in a dry pan for 20-30 seconds each side, or wrap in foil and warm in oven.","duration":3},{"id":7,"title":"Assemble Tacos","description":"Fill each tortilla with seasoned beef, top with guacamole, pico, sour cream, and extra cilantro.","duration":0}]',
  '{"calories":380,"protein":22,"carbs":28,"fat":20,"fiber":5,"sugar":3,"sodium":520}',
  ARRAY['Mexican','Spicy'],
  ARRAY['Dairy-Free'],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Salmon Sushi Rolls',
  'Fresh salmon sushi rolls with avocado, cucumber, and seasoned rice wrapped in nori.',
  'Japanese',
  'Gourmet',
  'Hard',
  4,
  30,
  30,
  '/recipe-sushi.jpg',
  '[{"name":"Sushi Rice","quantity":400,"unit":"g","pricePerUnit":0.006},{"name":"Fresh Salmon","quantity":300,"unit":"g","pricePerUnit":0.045},{"name":"Nori Sheets","quantity":6,"unit":"pcs","pricePerUnit":0.35},{"name":"Rice Vinegar","quantity":60,"unit":"ml","pricePerUnit":0.015},{"name":"Avocado","quantity":2,"unit":"pcs","pricePerUnit":1.50},{"name":"Cucumber","quantity":150,"unit":"g","pricePerUnit":0.008},{"name":"Wasabi","quantity":20,"unit":"g","pricePerUnit":0.25},{"name":"Soy Sauce","quantity":60,"unit":"ml","pricePerUnit":0.012},{"name":"Pickled Ginger","quantity":50,"unit":"g","pricePerUnit":0.04}]',
  '[{"id":1,"title":"Wash Rice","description":"Rinse sushi rice under cold water until water runs clear. This removes excess starch.","duration":5},{"id":2,"title":"Cook Rice","description":"Cook rice with slightly less water than usual. Let it steam for 10 minutes after cooking.","duration":20,"tips":"Don''t lift the lid while steaming"},{"id":3,"title":"Season Rice","description":"Transfer hot rice to a wide bowl. Gently fold in rice vinegar mixture while fanning to cool.","duration":5},{"id":4,"title":"Prep Fillings","description":"Slice salmon into long strips. Cut avocado and cucumber into thin strips.","duration":8},{"id":5,"title":"Set Up Rolling Station","description":"Place bamboo mat with nori sheet, shiny side down. Have a bowl of water ready.","duration":2},{"id":6,"title":"Spread Rice","description":"Wet hands, spread a thin layer of rice on nori, leaving 2cm at the top edge.","duration":3},{"id":7,"title":"Add Fillings","description":"Lay salmon, avocado, and cucumber strips in a line across the center.","duration":2},{"id":8,"title":"Roll","description":"Using the mat, roll away from you, tucking the fillings tight. Seal edge with water.","duration":3,"tips":"Apply even pressure for tight rolls"},{"id":9,"title":"Slice & Serve","description":"Wet a sharp knife, slice roll into 6-8 pieces. Serve with wasabi, soy sauce, and ginger.","duration":0}]',
  '{"calories":320,"protein":18,"carbs":45,"fat":8,"fiber":3,"sugar":2,"sodium":420}',
  ARRAY['Japanese','Fresh'],
  ARRAY['Dairy-Free'],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Spaghetti Carbonara',
  'Classic Roman pasta with crispy guanciale, creamy egg sauce, and pecorino romano cheese.',
  'Italian',
  'Quick & Easy',
  'Medium',
  4,
  10,
  15,
  '/recipe-pasta.jpg',
  '[{"name":"Spaghetti","quantity":400,"unit":"g","pricePerUnit":0.005},{"name":"Guanciale","quantity":200,"unit":"g","pricePerUnit":0.035},{"name":"Eggs","quantity":4,"unit":"pcs","pricePerUnit":0.35},{"name":"Pecorino Romano","quantity":100,"unit":"g","pricePerUnit":0.04},{"name":"Black Pepper","quantity":5,"unit":"g","pricePerUnit":0.05},{"name":"Parmesan","quantity":50,"unit":"g","pricePerUnit":0.04},{"name":"Salt","quantity":10,"unit":"g","pricePerUnit":0.001}]',
  '[{"id":1,"title":"Boil Pasta Water","description":"Bring a large pot of well-salted water to boil. It should taste like the sea.","duration":8},{"id":2,"title":"Prepare Egg Mixture","description":"Whisk eggs with grated pecorino, parmesan, and generous black pepper.","duration":3,"tips":"Use room temperature eggs"},{"id":3,"title":"Cut Guanciale","description":"Cut guanciale into small strips or cubes.","duration":3},{"id":4,"title":"Cook Guanciale","description":"Cook guanciale in a cold pan, slowly rendering the fat until crispy.","duration":8,"tips":"Start with a cold pan for even rendering"},{"id":5,"title":"Cook Pasta","description":"Cook spaghetti until just under al dente. Reserve 1 cup pasta water before draining.","duration":10},{"id":6,"title":"Combine","description":"Remove pan from heat! Add hot pasta to guanciale, toss. Then add egg mixture, tossing constantly.","duration":2,"tips":"Off the heat prevents scrambled eggs"},{"id":7,"title":"Adjust & Serve","description":"Add pasta water as needed for creamy consistency. Serve immediately with extra pepper and cheese.","duration":0}]',
  '{"calories":580,"protein":24,"carbs":62,"fat":26,"fiber":3,"sugar":2,"sodium":890}',
  ARRAY['Italian','Quick'],
  ARRAY[]::text[],
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Caesar Salad',
  'Crisp romaine lettuce with homemade caesar dressing, parmesan crisps, and garlic croutons.',
  'American',
  'Healthy',
  'Easy',
  2,
  10,
  5,
  '/recipe-salad.jpg',
  '[{"name":"Romaine Lettuce","quantity":300,"unit":"g","pricePerUnit":0.008},{"name":"Parmesan","quantity":80,"unit":"g","pricePerUnit":0.04},{"name":"Eggs","quantity":2,"unit":"pcs","pricePerUnit":0.35},{"name":"Garlic","quantity":4,"unit":"cloves","pricePerUnit":0.25},{"name":"Olive Oil","quantity":80,"unit":"ml","pricePerUnit":0.02},{"name":"Lemon","quantity":1,"unit":"pcs","pricePerUnit":0.50},{"name":"Bread","quantity":150,"unit":"g","pricePerUnit":0.008},{"name":"Anchovy Fillets","quantity":20,"unit":"g","pricePerUnit":0.15},{"name":"Dijon Mustard","quantity":15,"unit":"g","pricePerUnit":0.06}]',
  '[{"id":1,"title":"Make Croutons","description":"Cube bread, toss with olive oil and minced garlic. Toast in oven at 200°C until golden.","duration":10,"tips":"Toss halfway through for even browning"},{"id":2,"title":"Prepare Dressing","description":"Blend anchovy, garlic, mustard, egg yolk, and lemon juice. Slowly drizzle in olive oil to emulsify.","duration":5},{"id":3,"title":"Finish Dressing","description":"Stir in grated parmesan. Season with salt and pepper. Thin with water if needed.","duration":2},{"id":4,"title":"Prep Lettuce","description":"Wash and dry romaine leaves. Tear into bite-sized pieces or leave whole for a classic presentation.","duration":3},{"id":5,"title":"Assemble","description":"Toss lettuce with dressing, add croutons and shaved parmesan. Serve immediately.","duration":0}]',
  '{"calories":380,"protein":14,"carbs":18,"fat":29,"fiber":4,"sugar":3,"sodium":620}',
  ARRAY['Healthy','Quick'],
  ARRAY['Gluten-Free','Keto','Low-Carb'],
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO preset_recipes (title, description, cuisine, category, difficulty, servings, prep_time, cook_time, image_url, ingredients, steps, nutrition, tags, dietary_tags, is_featured)
VALUES (
  'Tom Yum Soup',
  'Spicy and sour Thai soup with shrimp, mushrooms, lemongrass, and aromatic herbs.',
  'Thai',
  'Healthy',
  'Medium',
  4,
  15,
  20,
  '/recipe-soup.jpg',
  '[{"name":"Large Shrimp","quantity":400,"unit":"g","pricePerUnit":0.025},{"name":"Mushrooms","quantity":200,"unit":"g","pricePerUnit":0.012},{"name":"Lemongrass","quantity":3,"unit":"stalks","pricePerUnit":0.50},{"name":"Galangal","quantity":30,"unit":"g","pricePerUnit":0.08},{"name":"Kaffir Lime Leaves","quantity":6,"unit":"pcs","pricePerUnit":0.15},{"name":"Thai Chili","quantity":4,"unit":"pcs","pricePerUnit":0.20},{"name":"Fish Sauce","quantity":45,"unit":"ml","pricePerUnit":0.02},{"name":"Lime Juice","quantity":60,"unit":"ml","pricePerUnit":0.03},{"name":"Coconut Milk","quantity":200,"unit":"ml","pricePerUnit":0.01}]',
  '[{"id":1,"title":"Prep Aromatics","description":"Slice lemongrass, galangal, and tear kaffir lime leaves. Halve the Thai chilies.","duration":5},{"id":2,"title":"Make Broth","description":"Bring 4 cups water to boil with lemongrass, galangal, and lime leaves. Simmer 10 minutes.","duration":10},{"id":3,"title":"Add Mushrooms","description":"Slice mushrooms and add to the broth. Cook for 3 minutes.","duration":3},{"id":4,"title":"Cook Shrimp","description":"Add shrimp and cook until pink, about 2-3 minutes.","duration":3,"tips":"Don''t overcook - remove as soon as pink"},{"id":5,"title":"Season","description":"Add fish sauce, lime juice, and chilies. Adjust to taste.","duration":2},{"id":6,"title":"Finish","description":"Stir in coconut milk if using creamy version. Garnish with cilantro and serve.","duration":0}]',
  '{"calories":185,"protein":24,"carbs":8,"fat":7,"fiber":2,"sugar":3,"sodium":890}',
  ARRAY['Thai','Spicy','Healthy'],
  ARRAY['Gluten-Free','Dairy-Free','Low-Carb'],
  false
) ON CONFLICT (id) DO NOTHING;
