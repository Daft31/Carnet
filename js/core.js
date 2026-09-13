/* ===================== DONNÉES ===================== */
// [nom, kcal, protéines, glucides, lipides] — valeurs pour 100 g
function slugify(s){return "b_"+String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
const RAW_FOODS = [{"id":"apple","name_fr":"Pomme","name_en":"Apple","category":"fruits","serving_g":100,"kcal":52,"protein":0.3,"carbs":14,"fat":0.2,"fiber":2.4,"state":"raw"},{"id":"banana","name_fr":"Banane","name_en":"Banana","category":"fruits","serving_g":100,"kcal":89,"protein":1.1,"carbs":23,"fat":0.3,"fiber":2.6,"state":"raw"},{"id":"orange","name_fr":"Orange","name_en":"Orange","category":"fruits","serving_g":100,"kcal":47,"protein":0.9,"carbs":12,"fat":0.1,"fiber":2.4,"state":"raw"},{"id":"strawberry","name_fr":"Fraise","name_en":"Strawberry","category":"fruits","serving_g":100,"kcal":32,"protein":0.7,"carbs":7.7,"fat":0.3,"fiber":2,"state":"raw"},{"id":"blueberry","name_fr":"Myrtille","name_en":"Blueberry","category":"fruits","serving_g":100,"kcal":57,"protein":0.7,"carbs":14,"fat":0.3,"fiber":2.4,"state":"raw"},{"id":"grapes_red","name_fr":"Raisin rouge","name_en":"Red Grapes","category":"fruits","serving_g":100,"kcal":69,"protein":0.7,"carbs":18,"fat":0.2,"fiber":0.9,"state":"raw"},{"id":"watermelon","name_fr":"Pastè·®que","name_en":"Watermelon","category":"fruits","serving_g":100,"kcal":30,"protein":0.6,"carbs":7.6,"fat":0.2,"fiber":0.4,"state":"raw"},{"id":"mango","name_fr":"Mangue","name_en":"Mango","category":"fruits","serving_g":100,"kcal":60,"protein":0.8,"carbs":15,"fat":0.4,"fiber":1.6,"state":"raw"},{"id":"pineapple","name_fr":"Ananas","name_en":"Pineapple","category":"fruits","serving_g":100,"kcal":50,"protein":0.5,"carbs":13,"fat":0.1,"fiber":1.4,"state":"raw"},{"id":"peach","name_fr":"Pê·®che","name_en":"Peach","category":"fruits","serving_g":100,"kcal":39,"protein":0.9,"carbs":9.5,"fat":0.3,"fiber":1.5,"state":"raw"},{"id":"pear","name_fr":"Poire","name_en":"Pear","category":"fruits","serving_g":100,"kcal":57,"protein":0.4,"carbs":15,"fat":0.1,"fiber":3.1,"state":"raw"},{"id":"cherries","name_fr":"Cerises","name_en":"Cherries","category":"fruits","serving_g":100,"kcal":63,"protein":1.1,"carbs":16,"fat":0.2,"fiber":2.1,"state":"raw"},{"id":"kiwi","name_fr":"Kiwi","name_en":"Kiwi","category":"fruits","serving_g":100,"kcal":61,"protein":1.1,"carbs":15,"fat":0.5,"fiber":3,"state":"raw"},{"id":"avocado","name_fr":"Avocat","name_en":"Avocado","category":"fruits","serving_g":100,"kcal":160,"protein":2,"carbs":9,"fat":15,"fiber":7,"state":"raw"},{"id":"grapefruit","name_fr":"Pamplemousse","name_en":"Grapefruit","category":"fruits","serving_g":100,"kcal":42,"protein":0.8,"carbs":11,"fat":0.1,"fiber":1.6,"state":"raw"},{"id":"cantaloupe","name_fr":"Melon cantaloup","name_en":"Cantaloupe","category":"fruits","serving_g":100,"kcal":34,"protein":0.8,"carbs":8,"fat":0.2,"fiber":0.9,"state":"raw"},{"id":"papaya","name_fr":"Papaye","name_en":"Papaya","category":"fruits","serving_g":100,"kcal":43,"protein":0.5,"carbs":11,"fat":0.3,"fiber":1.7,"state":"raw"},{"id":"plum","name_fr":"Prune","name_en":"Plum","category":"fruits","serving_g":100,"kcal":46,"protein":0.7,"carbs":11,"fat":0.3,"fiber":1.4,"state":"raw"},{"id":"apricot","name_fr":"Abricot","name_en":"Apricot","category":"fruits","serving_g":100,"kcal":48,"protein":1.4,"carbs":11,"fat":0.4,"fiber":2,"state":"raw"},{"id":"pomegranate","name_fr":"Grenade","name_en":"Pomegranate","category":"fruits","serving_g":100,"kcal":83,"protein":1.7,"carbs":19,"fat":1.2,"fiber":4,"state":"raw"},{"id":"raspberry","name_fr":"Framboise","name_en":"Raspberry","category":"fruits","serving_g":100,"kcal":52,"protein":1.2,"carbs":12,"fat":0.7,"fiber":6.5,"state":"raw"},{"id":"blackberry","name_fr":"Mure","name_en":"Blackberry","category":"fruits","serving_g":100,"kcal":43,"protein":1.4,"carbs":10,"fat":0.5,"fiber":5,"state":"raw"},{"id":"cranberry_fresh","name_fr":"Canneberge fraî­che","name_en":"Fresh Cranberry","category":"fruits","serving_g":100,"kcal":46,"protein":0.4,"carbs":12,"fat":0.1,"fiber":4.6,"state":"raw"},{"id":"guava","name_fr":"Goyave","name_en":"Guava","category":"fruits","serving_g":100,"kcal":68,"protein":2.6,"carbs":14,"fat":1,"fiber":5.4,"state":"raw"},{"id":"persimmon","name_fr":"Kaki","name_en":"Persimmon","category":"fruits","serving_g":100,"kcal":70,"protein":0.6,"carbs":19,"fat":0.2,"fiber":3.6,"state":"raw"},{"id":"lychee","name_fr":"Litchi","name_en":"Lychee","category":"fruits","serving_g":100,"kcal":66,"protein":0.8,"carbs":17,"fat":0.4,"fiber":1.3,"state":"raw"},{"id":"passion_fruit","name_fr":"Fruit de la passion","name_en":"Passion Fruit","category":"fruits","serving_g":100,"kcal":97,"protein":2.2,"carbs":23,"fat":0.7,"fiber":10,"state":"raw"},{"id":"dragon_fruit","name_fr":"Fruit du dragon","name_en":"Dragon Fruit","category":"fruits","serving_g":100,"kcal":60,"protein":1.2,"carbs":13,"fat":0.4,"fiber":3,"state":"raw"},{"id":"fig_fresh","name_fr":"Figue fraî­che","name_en":"Fresh Fig","category":"fruits","serving_g":100,"kcal":74,"protein":0.8,"carbs":19,"fat":0.3,"fiber":2.9,"state":"raw"},{"id":"date_medjool","name_fr":"Datte Medjool","name_en":"Medjool Date","category":"fruits","serving_g":100,"kcal":277,"protein":1.8,"carbs":75,"fat":0.2,"fiber":6.7,"state":"raw"},{"id":"broccoli_raw","name_fr":"Brocoli cru","name_en":"Raw Broccoli","category":"vegetables","serving_g":100,"kcal":34,"protein":2.8,"carbs":7,"fat":0.4,"fiber":2.6,"state":"raw"},{"id":"broccoli_cooked","name_fr":"Brocoli cuit","name_en":"Cooked Broccoli","category":"vegetables","serving_g":100,"kcal":35,"protein":2.4,"carbs":7,"fat":0.4,"fiber":3.3,"state":"cooked"},{"id":"spinach_raw","name_fr":"É·pinard cru","name_en":"Raw Spinach","category":"vegetables","serving_g":100,"kcal":23,"protein":2.9,"carbs":3.6,"fat":0.4,"fiber":2.2,"state":"raw"},{"id":"spinach_cooked","name_fr":"É·pinard cuit","name_en":"Cooked Spinach","category":"vegetables","serving_g":100,"kcal":23,"protein":3,"carbs":3.8,"fat":0.3,"fiber":2.4,"state":"cooked"},{"id":"carrot_raw","name_fr":"Carotte crue","name_en":"Raw Carrot","category":"vegetables","serving_g":100,"kcal":41,"protein":0.9,"carbs":10,"fat":0.2,"fiber":2.8,"state":"raw"},{"id":"carrot_cooked","name_fr":"Carotte cuite","name_en":"Cooked Carrot","category":"vegetables","serving_g":100,"kcal":35,"protein":0.8,"carbs":8,"fat":0.2,"fiber":2.3,"state":"cooked"},{"id":"tomato_raw","name_fr":"Tomate crue","name_en":"Raw Tomato","category":"vegetables","serving_g":100,"kcal":18,"protein":0.9,"carbs":3.9,"fat":0.2,"fiber":1.2,"state":"raw"},{"id":"cucumber","name_fr":"Concombre","name_en":"Cucumber","category":"vegetables","serving_g":100,"kcal":15,"protein":0.7,"carbs":3.6,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"sweet_potato_raw","name_fr":"Patate douce crue","name_en":"Raw Sweet Potato","category":"vegetables","serving_g":100,"kcal":86,"protein":1.6,"carbs":20,"fat":0.1,"fiber":3,"state":"raw"},{"id":"sweet_potato_baked","name_fr":"Patate douce au four","name_en":"Baked Sweet Potato","category":"vegetables","serving_g":100,"kcal":90,"protein":2,"carbs":21,"fat":0.2,"fiber":3.3,"state":"baked"},{"id":"bell_pepper_red","name_fr":"Poivron rouge","name_en":"Red Bell Pepper","category":"vegetables","serving_g":100,"kcal":31,"protein":1,"carbs":6,"fat":0.3,"fiber":2.1,"state":"raw"},{"id":"lettuce_iceberg","name_fr":"Laitue iceberg","name_en":"Iceberg Lettuce","category":"vegetables","serving_g":100,"kcal":14,"protein":0.9,"carbs":3,"fat":0.1,"fiber":1.2,"state":"raw"},{"id":"cabbage_raw","name_fr":"Chou cru","name_en":"Raw Cabbage","category":"vegetables","serving_g":100,"kcal":25,"protein":1.3,"carbs":6,"fat":0.1,"fiber":2.5,"state":"raw"},{"id":"zucchini_raw","name_fr":"Courgette crue","name_en":"Raw Zucchini","category":"vegetables","serving_g":100,"kcal":17,"protein":1.2,"carbs":3.1,"fat":0.3,"fiber":1,"state":"raw"},{"id":"onion_raw","name_fr":"Oignon cru","name_en":"Raw Onion","category":"vegetables","serving_g":100,"kcal":40,"protein":1.1,"carbs":9.3,"fat":0.1,"fiber":1.7,"state":"raw"},{"id":"garlic","name_fr":"Ail","name_en":"Garlic","category":"vegetables","serving_g":100,"kcal":149,"protein":6.4,"carbs":33,"fat":0.5,"fiber":2.1,"state":"raw"},{"id":"mushroom_white","name_fr":"Champignon blanc","name_en":"White Mushroom","category":"vegetables","serving_g":100,"kcal":22,"protein":3.1,"carbs":3.3,"fat":0.3,"fiber":1,"state":"raw"},{"id":"asparagus_raw","name_fr":"Asperge crue","name_en":"Raw Asparagus","category":"vegetables","serving_g":100,"kcal":20,"protein":2.2,"carbs":3.9,"fat":0.1,"fiber":2.1,"state":"raw"},{"id":"green_beans_raw","name_fr":"Haricots verts crus","name_en":"Raw Green Beans","category":"vegetables","serving_g":100,"kcal":31,"protein":1.8,"carbs":7,"fat":0.1,"fiber":2.7,"state":"raw"},{"id":"peas_green","name_fr":"Petits pois","name_en":"Green Peas","category":"vegetables","serving_g":100,"kcal":81,"protein":5.4,"carbs":14,"fat":0.4,"fiber":5.1,"state":"raw"},{"id":"kale_raw","name_fr":"Chou frisé·® cru","name_en":"Raw Kale","category":"vegetables","serving_g":100,"kcal":49,"protein":4.3,"carbs":9,"fat":0.9,"fiber":3.6,"state":"raw"},{"id":"cauliflower_raw","name_fr":"Chou-fleur cru","name_en":"Raw Cauliflower","category":"vegetables","serving_g":100,"kcal":25,"protein":1.9,"carbs":5,"fat":0.3,"fiber":2,"state":"raw"},{"id":"celery_raw","name_fr":"Cé·®leri cru","name_en":"Raw Celery","category":"vegetables","serving_g":100,"kcal":16,"protein":0.7,"carbs":3,"fat":0.2,"fiber":1.6,"state":"raw"},{"id":"eggplant_raw","name_fr":"Aubergine crue","name_en":"Raw Eggplant","category":"vegetables","serving_g":100,"kcal":25,"protein":1,"carbs":6,"fat":0.2,"fiber":3,"state":"raw"},{"id":"brussels_sprouts_raw","name_fr":"Chou de Bruxelles cru","name_en":"Raw Brussels Sprouts","category":"vegetables","serving_g":100,"kcal":43,"protein":2.8,"carbs":9,"fat":0.3,"fiber":3.8,"state":"raw"},{"id":"beetroot_raw","name_fr":"Betterave crue","name_en":"Raw Beetroot","category":"vegetables","serving_g":100,"kcal":43,"protein":1.6,"carbs":10,"fat":0.2,"fiber":2.8,"state":"raw"},{"id":"radish","name_fr":"Radis","name_en":"Radish","category":"vegetables","serving_g":100,"kcal":16,"protein":0.7,"carbs":3.4,"fat":0.1,"fiber":1.6,"state":"raw"},{"id":"leek_raw","name_fr":"Poireau cru","name_en":"Raw Leek","category":"vegetables","serving_g":100,"kcal":61,"protein":1.5,"carbs":14,"fat":0.3,"fiber":1.8,"state":"raw"},{"id":"artichoke_raw","name_fr":"Artichaut cru","name_en":"Raw Artichoke","category":"vegetables","serving_g":100,"kcal":47,"protein":3.3,"carbs":11,"fat":0.2,"fiber":5.4,"state":"raw"},{"id":"fennel_raw","name_fr":"Fenouil cru","name_en":"Raw Fennel","category":"vegetables","serving_g":100,"kcal":31,"protein":1.2,"carbs":7,"fat":0.2,"fiber":3.1,"state":"raw"},{"id":"bok_choy_raw","name_fr":"Chou de Chine cru","name_en":"Raw Bok Choy","category":"vegetables","serving_g":100,"kcal":13,"protein":1.5,"carbs":2.2,"fat":0.2,"fiber":1,"state":"raw"},{"id":"swiss_chard_raw","name_fr":"Bette à carde crue","name_en":"Raw Swiss Chard","category":"vegetables","serving_g":100,"kcal":22,"protein":1.8,"carbs":3.7,"fat":0.2,"fiber":1.6,"state":"raw"},{"id":"collard_greens_raw","name_fr":"Chou cavalier cru","name_en":"Raw Collard Greens","category":"vegetables","serving_g":100,"kcal":49,"protein":3,"carbs":9,"fat":0.7,"fiber":3.6,"state":"raw"},{"id":"turnip_raw","name_fr":"Navet cru","name_en":"Raw Turnip","category":"vegetables","serving_g":100,"kcal":28,"protein":0.9,"carbs":6.4,"fat":0.1,"fiber":1.8,"state":"raw"},{"id":"parsnip_raw","name_fr":"Panais cru","name_en":"Raw Parsnip","category":"vegetables","serving_g":100,"kcal":75,"protein":1.2,"carbs":18,"fat":0.3,"fiber":4.9,"state":"raw"},{"id":"rutabaga","name_fr":"Chou-rave","name_en":"Rutabaga","category":"vegetables","serving_g":100,"kcal":37,"protein":1.1,"carbs":9,"fat":0.2,"fiber":2.2,"state":"raw"},{"id":"kohlrabi","name_fr":"Chou-rave","name_en":"Kohlrabi","category":"vegetables","serving_g":100,"kcal":27,"protein":1.7,"carbs":6,"fat":0.1,"fiber":3.6,"state":"raw"},{"id":"watercress","name_fr":"Cresson","name_en":"Watercress","category":"vegetables","serving_g":100,"kcal":11,"protein":2.3,"carbs":1.3,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"arugula","name_fr":"Roquette","name_en":"Arugula","category":"vegetables","serving_g":100,"kcal":25,"protein":2.6,"carbs":3.7,"fat":0.7,"fiber":1.6,"state":"raw"},{"id":"endive","name_fr":"Endive","name_en":"Endive","category":"vegetables","serving_g":100,"kcal":17,"protein":1.3,"carbs":3.4,"fat":0.2,"fiber":3.1,"state":"raw"},{"id":"radicchio","name_fr":"Chicoré·®e rouge","name_en":"Radicchio","category":"vegetables","serving_g":100,"kcal":23,"protein":1.4,"carbs":4.5,"fat":0.3,"fiber":1.3,"state":"raw"},{"id":"okra_raw","name_fr":"Gombo cru","name_en":"Raw Okra","category":"vegetables","serving_g":100,"kcal":33,"protein":1.9,"carbs":7,"fat":0.2,"fiber":3.2,"state":"raw"},{"id":"pumpkin_raw","name_fr":"Citrouille crue","name_en":"Raw Pumpkin","category":"vegetables","serving_g":100,"kcal":26,"protein":1,"carbs":6.5,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"butternut_squash_raw","name_fr":"Courge musqué·®e crue","name_en":"Raw Butternut Squash","category":"vegetables","serving_g":100,"kcal":45,"protein":1,"carbs":12,"fat":0.1,"fiber":2,"state":"raw"},{"id":"chickpeas_cooked","name_fr":"Pois chiches cuits","name_en":"Cooked Chickpeas","category":"legumes","serving_g":100,"kcal":164,"protein":8.9,"carbs":27,"fat":2.6,"fiber":7.6,"state":"cooked"},{"id":"chickpeas_dry","name_fr":"Pois chiches secs","name_en":"Dry Chickpeas","category":"legumes","serving_g":100,"kcal":364,"protein":19,"carbs":61,"fat":6,"fiber":17,"state":"dry"},{"id":"lentils_green_cooked","name_fr":"Lentilles vertes cuites","name_en":"Cooked Green Lentils","category":"legumes","serving_g":100,"kcal":116,"protein":9,"carbs":20,"fat":0.4,"fiber":7.9,"state":"cooked"},{"id":"lentils_green_dry","name_fr":"Lentilles vertes sè·®ches","name_en":"Dry Green Lentils","category":"legumes","serving_g":100,"kcal":353,"protein":25,"carbs":63,"fat":1.1,"fiber":10.7,"state":"dry"},{"id":"black_beans_cooked","name_fr":"Haricots noirs cuits","name_en":"Cooked Black Beans","category":"legumes","serving_g":100,"kcal":132,"protein":8.9,"carbs":24,"fat":0.5,"fiber":8.7,"state":"cooked"},{"id":"kidney_beans_cooked","name_fr":"Haricots rouges cuits","name_en":"Cooked Kidney Beans","category":"legumes","serving_g":100,"kcal":127,"protein":8.7,"carbs":23,"fat":0.5,"fiber":6.4,"state":"cooked"},{"id":"soybeans_cooked","name_fr":"Soja cuit","name_en":"Cooked Soybeans","category":"legumes","serving_g":100,"kcal":173,"protein":17,"carbs":10,"fat":9,"fiber":6,"state":"cooked"},{"id":"edamame_cooked","name_fr":"Edamame cuits","name_en":"Cooked Edamame","category":"legumes","serving_g":100,"kcal":122,"protein":11,"carbs":10,"fat":5.2,"fiber":5.2,"state":"cooked"},{"id":"rice_white_raw","name_fr":"Riz blanc cru","name_en":"Raw White Rice","category":"grains","serving_g":100,"kcal":365,"protein":7.1,"carbs":80,"fat":0.7,"fiber":1.3,"state":"raw"},{"id":"rice_white_cooked","name_fr":"Riz blanc cuit","name_en":"Cooked White Rice","category":"grains","serving_g":100,"kcal":130,"protein":2.7,"carbs":28,"fat":0.3,"fiber":0.4,"state":"cooked"},{"id":"rice_brown_raw","name_fr":"Riz complet cru","name_en":"Raw Brown Rice","category":"grains","serving_g":100,"kcal":362,"protein":7.5,"carbs":76,"fat":2.7,"fiber":3.5,"state":"raw"},{"id":"rice_brown_cooked","name_fr":"Riz complet cuit","name_en":"Cooked Brown Rice","category":"grains","serving_g":100,"kcal":112,"protein":2.6,"carbs":23,"fat":0.9,"fiber":1.8,"state":"cooked"},{"id":"rice_basmati_raw","name_fr":"Riz basmati cru","name_en":"Raw Basmati Rice","category":"grains","serving_g":100,"kcal":356,"protein":8.2,"carbs":78,"fat":0.6,"fiber":1.4,"state":"raw"},{"id":"rice_basmati_cooked","name_fr":"Riz basmati cuit","name_en":"Cooked Basmati Rice","category":"grains","serving_g":100,"kcal":121,"protein":2.8,"carbs":25,"fat":0.2,"fiber":0.4,"state":"cooked"},{"id":"pasta_white_dry","name_fr":"Pâ·®tes blanches sè·®ches","name_en":"Dry White Pasta","category":"grains","serving_g":100,"kcal":371,"protein":13,"carbs":74,"fat":1.5,"fiber":3.2,"state":"dry"},{"id":"pasta_white_cooked","name_fr":"Pâ·®tes blanches cuites","name_en":"Cooked White Pasta","category":"grains","serving_g":100,"kcal":131,"protein":5,"carbs":25,"fat":1.1,"fiber":1.8,"state":"cooked"},{"id":"pasta_whole_wheat_dry","name_fr":"Pâ·®tes complè·®tes sè·®ches","name_en":"Dry Whole Wheat Pasta","category":"grains","serving_g":100,"kcal":348,"protein":14,"carbs":75,"fat":1.4,"fiber":11,"state":"dry"},{"id":"pasta_whole_wheat_cooked","name_fr":"Pâ·®tes complè·®tes cuites","name_en":"Cooked Whole Wheat Pasta","category":"grains","serving_g":100,"kcal":124,"protein":5,"carbs":25,"fat":0.5,"fiber":3.9,"state":"cooked"},{"id":"quinoa_dry","name_fr":"Quinoa cru","name_en":"Dry Quinoa","category":"grains","serving_g":100,"kcal":368,"protein":14,"carbs":64,"fat":6,"fiber":7,"state":"dry"},{"id":"quinoa_cooked","name_fr":"Quinoa cuit","name_en":"Cooked Quinoa","category":"grains","serving_g":100,"kcal":120,"protein":4.4,"carbs":22,"fat":1.9,"fiber":2.8,"state":"cooked"},{"id":"oats_rolled_dry","name_fr":"Flocons d'avoine secs","name_en":"Dry Rolled Oats","category":"grains","serving_g":100,"kcal":389,"protein":17,"carbs":66,"fat":7,"fiber":10,"state":"dry"},{"id":"oats_rolled_cooked","name_fr":"Flocons d'avoine cuits","name_en":"Cooked Rolled Oats","category":"grains","serving_g":100,"kcal":68,"protein":2.4,"carbs":12,"fat":1.4,"fiber":1.7,"state":"cooked"},{"id":"couscous_dry","name_fr":"Semoule sè·®che","name_en":"Dry Couscous","category":"grains","serving_g":100,"kcal":376,"protein":13,"carbs":77,"fat":0.6,"fiber":5,"state":"dry"},{"id":"couscous_cooked","name_fr":"Semoule cuite","name_en":"Cooked Couscous","category":"grains","serving_g":100,"kcal":112,"protein":3.8,"carbs":23,"fat":0.2,"fiber":1.4,"state":"cooked"},{"id":"bulgur_dry","name_fr":"Boulgour cru","name_en":"Dry Bulgur","category":"grains","serving_g":100,"kcal":342,"protein":12,"carbs":76,"fat":1.3,"fiber":18,"state":"dry"},{"id":"bulgur_cooked","name_fr":"Boulgour cuit","name_en":"Cooked Bulgur","category":"grains","serving_g":100,"kcal":83,"protein":3.1,"carbs":19,"fat":0.2,"fiber":4.5,"state":"cooked"},{"id":"potato_boiled_no_skin","name_fr":"Pomme de terre bouillie sans peau","name_en":"Boiled Potato Without Skin","category":"grains","serving_g":100,"kcal":86,"protein":1.9,"carbs":20,"fat":0.1,"fiber":1.8,"state":"boiled"},{"id":"potato_baked_with_skin","name_fr":"Pomme de terre au four avec peau","name_en":"Baked Potato With Skin","category":"grains","serving_g":100,"kcal":93,"protein":2.5,"carbs":21,"fat":0.1,"fiber":2.2,"state":"baked"},{"id":"sweet_potato_baked","name_fr":"Patate douce au four","name_en":"Baked Sweet Potato","category":"grains","serving_g":100,"kcal":90,"protein":2,"carbs":21,"fat":0.2,"fiber":3.3,"state":"baked"},{"id":"chicken_breast_raw","name_fr":"Poulet (blanc, sans peau, cru)","name_en":"Chicken Breast (Skinless, Raw)","category":"meat_fish","serving_g":100,"kcal":120,"protein":22.5,"carbs":0,"fat":2.6,"fiber":0,"state":"raw"},{"id":"chicken_breast_cooked","name_fr":"Poulet (blanc, sans peau, cuit)","name_en":"Chicken Breast (Skinless, Cooked)","category":"meat_fish","serving_g":100,"kcal":165,"protein":31,"carbs":0,"fat":3.6,"fiber":0,"state":"cooked"},{"id":"turkey_breast_raw","name_fr":"Dinde (blanc, cru)","name_en":"Turkey Breast (Raw)","category":"meat_fish","serving_g":100,"kcal":111,"protein":24,"carbs":0,"fat":1.5,"fiber":0,"state":"raw"},{"id":"ground_beef_lean_raw","name_fr":"Bœuf haché·® maigre cru (5%)","name_en":"Ground Beef (Lean 5%, Raw)","category":"meat_fish","serving_g":100,"kcal":176,"protein":20,"carbs":0,"fat":10,"fiber":0,"state":"raw"},{"id":"beef_sirloin_raw","name_fr":"Faux-filet de bœuf cru","name_en":"Beef Sirloin (Raw)","category":"meat_fish","serving_g":100,"kcal":142,"protein":21,"carbs":0,"fat":6,"fiber":0,"state":"raw"},{"id":"pork_tenderloin_raw","name_fr":"Filet de porc cru","name_en":"Pork Tenderloin (Raw)","category":"meat_fish","serving_g":100,"kcal":109,"protein":22,"carbs":0,"fat":2,"fiber":0,"state":"raw"},{"id":"salmon_atlantic_raw","name_fr":"Saumon atlantique cru","name_en":"Salmon (Atlantic, Raw)","category":"meat_fish","serving_g":100,"kcal":208,"protein":20,"carbs":0,"fat":13,"fiber":0,"state":"raw"},{"id":"salmon_atlantic_cooked","name_fr":"Saumon atlantique cuit","name_en":"Salmon (Atlantic, Cooked)","category":"meat_fish","serving_g":100,"kcal":231,"protein":25,"carbs":0,"fat":14,"fiber":0,"state":"cooked"},{"id":"tuna_fresh_raw","name_fr":"Thon frais cru","name_en":"Tuna (Fresh, Raw)","category":"meat_fish","serving_g":100,"kcal":144,"protein":23,"carbs":0,"fat":5,"fiber":0,"state":"raw"},{"id":"tuna_canned_water","name_fr":"Thon en boî®®te (eau)","name_en":"Tuna (Canned in Water)","category":"meat_fish","serving_g":100,"kcal":116,"protein":26,"carbs":0,"fat":1,"fiber":0,"state":"canned"},{"id":"cod_raw","name_fr":"Cabillaud cru","name_en":"Cod (Raw)","category":"meat_fish","serving_g":100,"kcal":82,"protein":18,"carbs":0,"fat":0.7,"fiber":0,"state":"raw"},{"id":"tilapia_raw","name_fr":"Tilapia cru","name_en":"Tilapia (Raw)","category":"meat_fish","serving_g":100,"kcal":97,"protein":20,"carbs":0,"fat":1.7,"fiber":0,"state":"raw"},{"id":"shrimp_raw","name_fr":"Crevettes crues","name_en":"Shrimp (Raw)","category":"meat_fish","serving_g":100,"kcal":99,"protein":24,"carbs":0.2,"fat":0.3,"fiber":0,"state":"raw"},{"id":"sardines_canned_oil","name_fr":"Sardines à l'huile","name_en":"Sardines (Canned in Oil)","category":"meat_fish","serving_g":100,"kcal":208,"protein":25,"carbs":0,"fat":11,"fiber":0,"state":"canned"},{"id":"mackerel_raw","name_fr":"Maquereau cru","name_en":"Mackerel (Raw)","category":"meat_fish","serving_g":100,"kcal":205,"protein":19,"carbs":0,"fat":14,"fiber":0,"state":"raw"},{"id":"whole_egg_raw","name_fr":"Œuf entier cru","name_en":"Whole Egg (Raw)","category":"eggs_dairy","serving_g":100,"kcal":155,"protein":13,"carbs":1.1,"fat":11,"fiber":0,"state":"raw"},{"id":"egg_white_raw","name_fr":"Blanc d'œuf cru","name_en":"Egg White (Raw)","category":"eggs_dairy","serving_g":100,"kcal":52,"protein":11,"carbs":0.7,"fat":0.2,"fiber":0,"state":"raw"},{"id":"egg_yolk_raw","name_fr":"Jaune d'œuf cru","name_en":"Egg Yolk (Raw)","category":"eggs_dairy","serving_g":100,"kcal":322,"protein":16,"carbs":3.6,"fat":27,"fiber":0,"state":"raw"},{"id":"whole_milk","name_fr":"Lait entier","name_en":"Whole Milk","category":"eggs_dairy","serving_g":100,"kcal":61,"protein":3.2,"carbs":4.8,"fat":3.3,"fiber":0,"state":"liquid"},{"id":"skim_milk","name_fr":"Lait écremé·®","name_en":"Skim Milk","category":"eggs_dairy","serving_g":100,"kcal":34,"protein":3.4,"carbs":5,"fat":0.1,"fiber":0,"state":"liquid"},{"id":"greek_yogurt_plain","name_fr":"Yaourt grec nature","name_en":"Greek Yogurt (Plain)","category":"eggs_dairy","serving_g":100,"kcal":97,"protein":9,"carbs":3.6,"fat":5,"fiber":0,"state":"liquid"},{"id":"regular_yogurt_plain","name_fr":"Yaourt nature","name_en":"Regular Yogurt (Plain)","category":"eggs_dairy","serving_g":100,"kcal":61,"protein":3.5,"carbs":4.7,"fat":3.3,"fiber":0,"state":"liquid"},{"id":"cottage_cheese","name_fr":"Fromage blanc","name_en":"Cottage Cheese","category":"eggs_dairy","serving_g":100,"kcal":98,"protein":11,"carbs":3.4,"fat":4.3,"fiber":0,"state":"solid"},{"id":"mozzarella_cheese","name_fr":"Mozzarella","name_en":"Mozzarella Cheese","category":"eggs_dairy","serving_g":100,"kcal":280,"protein":28,"carbs":2.2,"fat":17,"fiber":0,"state":"solid"},{"id":"cheddar_cheese","name_fr":"Fromage cheddar","name_en":"Cheddar Cheese","category":"eggs_dairy","serving_g":100,"kcal":402,"protein":25,"carbs":1.3,"fat":33,"fiber":0,"state":"solid"},{"id":"parmesan_cheese","name_fr":"Parmesan","name_en":"Parmesan Cheese","category":"eggs_dairy","serving_g":100,"kcal":431,"protein":38,"carbs":4.1,"fat":29,"fiber":0,"state":"solid"},{"id":"feta_cheese","name_fr":"Feta","name_en":"Feta Cheese","category":"eggs_dairy","serving_g":100,"kcal":264,"protein":11,"carbs":4,"fat":21,"fiber":0,"state":"solid"},{"id":"butter","name_fr":"Beurre","name_en":"Butter","category":"eggs_dairy","serving_g":100,"kcal":717,"protein":0.9,"carbs":0.1,"fat":81,"fiber":0,"state":"solid"},{"id":"heavy_cream","name_fr":"Crè·®me fraî­che","name_en":"Heavy Cream","category":"eggs_dairy","serving_g":100,"kcal":340,"protein":2.1,"carbs":2.8,"fat":36,"fiber":0,"state":"liquid"},{"id":"almonds","name_fr":"Amandes","name_en":"Almonds","category":"nuts_seeds","serving_g":100,"kcal":579,"protein":21,"carbs":22,"fat":50,"fiber":12,"state":"raw"},{"id":"walnuts","name_fr":"Noix","name_en":"Walnuts","category":"nuts_seeds","serving_g":100,"kcal":654,"protein":15,"carbs":14,"fat":65,"fiber":7,"state":"raw"},{"id":"peanuts","name_fr":"Cacahuè·®tes","name_en":"Peanuts","category":"nuts_seeds","serving_g":100,"kcal":567,"protein":26,"carbs":16,"fat":49,"fiber":8.5,"state":"raw"},{"id":"cashews","name_fr":"Noix de cajou","name_en":"Cashews","category":"nuts_seeds","serving_g":100,"kcal":553,"protein":18,"carbs":30,"fat":44,"fiber":3.3,"state":"raw"},{"id":"pistachios","name_fr":"Pistaches","name_en":"Pistachios","category":"nuts_seeds","serving_g":100,"kcal":560,"protein":20,"carbs":27,"fat":45,"fiber":10.6,"state":"raw"},{"id":"hazelnuts","name_fr":"Noisettes","name_en":"Hazelnuts","category":"nuts_seeds","serving_g":100,"kcal":628,"protein":15,"carbs":17,"fat":61,"fiber":9.7,"state":"raw"},{"id":"pecans","name_fr":"Noix de pécan","name_en":"Pecans","category":"nuts_seeds","serving_g":100,"kcal":691,"protein":9.2,"carbs":14,"fat":72,"fiber":9.6,"state":"raw"},{"id":"macadamia_nuts","name_fr":"Noix de macadamia","name_en":"Macadamia Nuts","category":"nuts_seeds","serving_g":100,"kcal":718,"protein":7.9,"carbs":14,"fat":76,"fiber":8.6,"state":"raw"},{"id":"brazil_nuts","name_fr":"Noix du Bré·®sil","name_en":"Brazil Nuts","category":"nuts_seeds","serving_g":100,"kcal":659,"protein":14,"carbs":12,"fat":67,"fiber":7.5,"state":"raw"},{"id":"pine_nuts","name_fr":"Pignons de pin","name_en":"Pine Nuts","category":"nuts_seeds","serving_g":100,"kcal":673,"protein":14,"carbs":13,"fat":68,"fiber":3.7,"state":"raw"},{"id":"chestnuts","name_fr":"Châ·®taignes","name_en":"Chestnuts","category":"nuts_seeds","serving_g":100,"kcal":213,"protein":2.4,"carbs":45,"fat":2.3,"fiber":5.1,"state":"raw"},{"id":"chia_seeds","name_fr":"Graines de chia","name_en":"Chia Seeds","category":"nuts_seeds","serving_g":100,"kcal":486,"protein":17,"carbs":42,"fat":31,"fiber":34,"state":"raw"},{"id":"flaxseeds","name_fr":"Graines de lin","name_en":"Flaxseeds","category":"nuts_seeds","serving_g":100,"kcal":534,"protein":18,"carbs":29,"fat":42,"fiber":27,"state":"raw"},{"id":"pumpkin_seeds","name_fr":"Graines de courge","name_en":"Pumpkin Seeds","category":"nuts_seeds","serving_g":100,"kcal":559,"protein":30,"carbs":11,"fat":49,"fiber":6,"state":"raw"},{"id":"sunflower_seeds","name_fr":"Graines de tournesol","name_en":"Sunflower Seeds","category":"nuts_seeds","serving_g":100,"kcal":584,"protein":21,"carbs":20,"fat":51,"fiber":8.6,"state":"raw"},{"id":"sesame_seeds","name_fr":"Graines de sé­same","name_en":"Sesame Seeds","category":"nuts_seeds","serving_g":100,"kcal":573,"protein":18,"carbs":23,"fat":50,"fiber":12,"state":"raw"},{"id":"hemp_seeds","name_fr":"Graines de chanvre","name_en":"Hemp Seeds","category":"nuts_seeds","serving_g":100,"kcal":553,"protein":31,"carbs":8.7,"fat":49,"fiber":4,"state":"raw"},{"id":"peanut_butter_natural","name_fr":"Beurre de cacahuè·®te naturel","name_en":"Natural Peanut Butter","category":"nuts_seeds","serving_g":100,"kcal":598,"protein":25,"carbs":20,"fat":51,"fiber":6,"state":"processed"},{"id":"almond_butter","name_fr":"Beurre d'amande","name_en":"Almond Butter","category":"nuts_seeds","serving_g":100,"kcal":614,"protein":21,"carbs":19,"fat":56,"fiber":10,"state":"processed"},{"id":"tahini","name_fr":"Tahini","name_en":"Tahini","category":"nuts_seeds","serving_g":100,"kcal":595,"protein":17,"carbs":21,"fat":54,"fiber":9.3,"state":"processed"},{"id":"olive_oil_extra_virgin","name_fr":"Huile d'olive extra vierge","name_en":"Extra Virgin Olive Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"coconut_oil","name_fr":"Huile de coco","name_en":"Coconut Oil","category":"oils_fats","serving_g":100,"kcal":862,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"avocado_oil","name_fr":"Huile d'avocat","name_en":"Avocado Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"sesame_oil","name_fr":"Huile de sé­same","name_en":"Sesame Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"sunflower_oil","name_fr":"Huile de tournesol","name_en":"Sunflower Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"canola_oil","name_fr":"Huile de colza","name_en":"Canola Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"flaxseed_oil","name_fr":"Huile de lin","name_en":"Flaxseed Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"walnut_oil","name_fr":"Huile de noix","name_en":"Walnut Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"grapeseed_oil","name_fr":"Huile de pépins de raisin","name_en":"Grapeseed Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"mct_oil","name_fr":"Huile MCT","name_en":"MCT Oil","category":"oils_fats","serving_g":100,"kcal":862,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"lard","name_fr":"Saindoux","name_en":"Lard","category":"oils_fats","serving_g":100,"kcal":902,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"solid"},{"id":"ghee","name_fr":"Ghee","name_en":"Ghee","category":"oils_fats","serving_g":100,"kcal":897,"protein":0.3,"carbs":0,"fat":100,"fiber":0,"state":"solid"},{"id":"butter","name_fr":"Beurre","name_en":"Butter","category":"oils_fats","serving_g":100,"kcal":717,"protein":0.9,"carbs":0.1,"fat":81,"fiber":0,"state":"solid"},{"id":"water","name_fr":"Eau","name_en":"Water","category":"beverages","serving_g":100,"kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"coffee_black_brewed","name_fr":"Café·® noir","name_en":"Black Coffee (Brewed)","category":"beverages","serving_g":100,"kcal":2,"protein":0.3,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"green_tea_brewed","name_fr":"Thé·® vert","name_en":"Green Tea (Brewed)","category":"beverages","serving_g":100,"kcal":1,"protein":0.2,"carbs":0.2,"fat":0,"fiber":0,"state":"liquid"},{"id":"black_tea_brewed","name_fr":"Thé·® noir","name_en":"Black Tea (Brewed)","category":"beverages","serving_g":100,"kcal":1,"protein":0,"carbs":0.3,"fat":0,"fiber":0,"state":"liquid"},{"id":"orange_juice_fresh","name_fr":"Jus d'orange frais","name_en":"Fresh Orange Juice","category":"beverages","serving_g":100,"kcal":45,"protein":0.7,"carbs":10,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"apple_juice","name_fr":"Jus de pomme","name_en":"Apple Juice","category":"beverages","serving_g":100,"kcal":46,"protein":0.1,"carbs":11,"fat":0.1,"fiber":0.2,"state":"liquid"},{"id":"grape_juice","name_fr":"Jus de raisin","name_en":"Grape Juice","category":"beverages","serving_g":100,"kcal":60,"protein":0.4,"carbs":15,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"cranberry_juice","name_fr":"Jus de canneberge","name_en":"Cranberry Juice","category":"beverages","serving_g":100,"kcal":46,"protein":0.4,"carbs":12,"fat":0.1,"fiber":0.1,"state":"liquid"},{"id":"tomato_juice","name_fr":"Jus de tomate","name_en":"Tomato Juice","category":"beverages","serving_g":100,"kcal":17,"protein":0.9,"carbs":3.5,"fat":0.1,"fiber":0.4,"state":"liquid"},{"id":"carrot_juice","name_fr":"Jus de carotte","name_en":"Carrot Juice","category":"beverages","serving_g":100,"kcal":40,"protein":0.9,"carbs":9,"fat":0.2,"fiber":0.8,"state":"liquid"},{"id":"coconut_water","name_fr":"Eau de coco","name_en":"Coconut Water","category":"beverages","serving_g":100,"kcal":19,"protein":0.7,"carbs":3.7,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"almond_milk_unsweetened","name_fr":"Lait d'amande non sucré·®","name_en":"Unsweetened Almond Milk","category":"beverages","serving_g":100,"kcal":13,"protein":0.4,"carbs":0.3,"fat":1.1,"fiber":0.2,"state":"liquid"},{"id":"soy_milk_unsweetened","name_fr":"Lait de soja non sucré·®","name_en":"Unsweetened Soy Milk","category":"beverages","serving_g":100,"kcal":33,"protein":2.8,"carbs":1.7,"fat":1.8,"fiber":0.4,"state":"liquid"},{"id":"oat_milk_unsweetened","name_fr":"Lait d'avoine non sucré·®","name_en":"Unsweetened Oat Milk","category":"beverages","serving_g":100,"kcal":40,"protein":1,"carbs":7,"fat":1.5,"fiber":0.8,"state":"liquid"},{"id":"rice_milk_unsweetened","name_fr":"Lait de riz non sucré·®","name_en":"Unsweetened Rice Milk","category":"beverages","serving_g":100,"kcal":47,"protein":0.3,"carbs":9.2,"fat":1,"fiber":0.3,"state":"liquid"},{"id":"coconut_milk_canned","name_fr":"Lait de coco en boî®®te","name_en":"Canned Coconut Milk","category":"beverages","serving_g":100,"kcal":230,"protein":2.3,"carbs":6,"fat":24,"fiber":0,"state":"liquid"},{"id":"protein_shake_whey_water","name_fr":"Shake protéiné·® (whey, eau)","name_en":"Protein Shake (Whey, Water)","category":"beverages","serving_g":100,"kcal":41,"protein":7.5,"carbs":2.8,"fat":0.8,"fiber":0,"state":"liquid"},{"id":"red_wine","name_fr":"Vin rouge","name_en":"Red Wine","category":"beverages","serving_g":100,"kcal":85,"protein":0.1,"carbs":2.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"white_wine","name_fr":"Vin blanc","name_en":"White Wine","category":"beverages","serving_g":100,"kcal":82,"protein":0.1,"carbs":2.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"beer_regular","name_fr":"Biè·®re","name_en":"Regular Beer","category":"beverages","serving_g":100,"kcal":43,"protein":0.5,"carbs":3.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"spirits_40_abv","name_fr":"Spiritueux (40%)","name_en":"Spirits (40% ABV)","category":"beverages","serving_g":100,"kcal":231,"protein":0,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"kombucha","name_fr":"Kombucha","name_en":"Kombucha","category":"beverages","serving_g":100,"kcal":25,"protein":0.2,"carbs":5,"fat":0,"fiber":0,"state":"liquid"},{"id":"sports_drink","name_fr":"Boisson sportive","name_en":"Sports Drink","category":"beverages","serving_g":100,"kcal":26,"protein":0.1,"carbs":6.8,"fat":0.1,"fiber":0,"state":"liquid"},{"id":"cola","name_fr":"Cola","name_en":"Cola","category":"beverages","serving_g":100,"kcal":42,"protein":0,"carbs":11,"fat":0,"fiber":0,"state":"liquid"},{"id":"nutripure_whey_isolate_native_neutre","name_fr":"Whey Isolate Native (Neutre)","name_en":"Whey Isolate Native (Unflavored)","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":114,"protein":28.2,"carbs":0.9,"fat":0.6,"fiber":0,"sugars":0.15,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_native_neutre_100g","name_fr":"Whey Isolate Native (Neutre) - 100g","name_en":"Whey Isolate Native (Unflavored) - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":380,"protein":94,"carbs":3,"fat":1.9,"fiber":0,"sugars":0.5,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_vanille","name_fr":"Whey Isolate Vanille","name_en":"Whey Isolate Vanilla","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":115,"protein":24,"carbs":2.8,"fat":0.81,"fiber":0,"sugars":1.7,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_vanille_100g","name_fr":"Whey Isolate Vanille - 100g","name_en":"Whey Isolate Vanilla - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":385,"protein":80,"carbs":9.9,"fat":2.7,"fiber":0,"sugars":5.6,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_chocolat","name_fr":"Whey Isolate Chocolat","name_en":"Whey Isolate Chocolate","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":113,"protein":24,"carbs":3.4,"fat":1,"fiber":0.3,"sugars":1.6,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_chocolat_100g","name_fr":"Whey Isolate Chocolat - 100g","name_en":"Whey Isolate Chocolate - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":377,"protein":76,"carbs":11.3,"fat":3.4,"fiber":1,"sugars":5.2,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_fraise","name_fr":"Whey Isolate Fraise","name_en":"Whey Isolate Strawberry","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":115,"protein":24,"carbs":2.8,"fat":0.81,"fiber":0,"sugars":1.7,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_fraise_100g","name_fr":"Whey Isolate Fraise - 100g","name_en":"Whey Isolate Strawberry - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":382,"protein":80,"carbs":9.3,"fat":2.7,"fiber":0,"sugars":5.6,"brand":"Nutripure","state":"powder"},{"id":"mcdonalds_fr_hamburger","name_fr":"Hamburger","name_en":"Hamburger","category":"mcdonalds_france","serving_g":96,"serving_label":"1 sandwich","kcal":250,"protein":14,"carbs":30,"fat":8,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_cheeseburger","name_fr":"Cheeseburger","name_en":"Cheeseburger","category":"mcdonalds_france","serving_g":110,"serving_label":"1 sandwich","kcal":300,"protein":16,"carbs":30,"fat":12,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_double_cheeseburger","name_fr":"Double Cheeseburger","name_en":"Double Cheeseburger","category":"mcdonalds_france","serving_g":148,"serving_label":"1 sandwich","kcal":450,"protein":26,"carbs":32,"fat":22,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_big_mac","name_fr":"Big Mac","name_en":"Big Mac","category":"mcdonalds_france","serving_g":236,"serving_label":"1 sandwich","kcal":540,"protein":26,"carbs":42,"fat":28,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcchicken","name_fr":"McChicken","name_en":"McChicken","category":"mcdonalds_france","serving_g":198,"serving_label":"1 sandwich","kcal":420,"protein":20,"carbs":38,"fat":20,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_filet_o_fish","name_fr":"Filet-O-Fish","name_en":"Filet-O-Fish","category":"mcdonalds_france","serving_g":158,"serving_label":"1 sandwich","kcal":340,"protein":16,"carbs":38,"fat":14,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_cbo","name_fr":"CBO","name_en":"CBO","category":"mcdonalds_france","serving_g":260,"serving_label":"1 sandwich","kcal":620,"protein":30,"carbs":48,"fat":32,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_royal_deluxe","name_fr":"Royal Deluxe","name_en":"Royal Deluxe","category":"mcdonalds_france","serving_g":245,"serving_label":"1 sandwich","kcal":560,"protein":30,"carbs":40,"fat":30,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcbaquette_jambon_emmental","name_fr":"McBaguette Jambon-Emmental","name_en":"McBaguette Ham-Cheese","category":"mcdonalds_france","serving_g":230,"serving_label":"1 sandwich","kcal":540,"protein":26,"carbs":56,"fat":22,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcbaquette_poulet","name_fr":"McBaguette Poulet","name_en":"McBaguette Chicken","category":"mcdonalds_france","serving_g":225,"serving_label":"1 sandwich","kcal":520,"protein":28,"carbs":54,"fat":20,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_croque_mcdo","name_fr":"Croque McDo","name_en":"Croque McDo","category":"mcdonalds_france","serving_g":115,"serving_label":"1 sandwich","kcal":260,"protein":14,"carbs":24,"fat":12,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_ptit_wrap_ranch","name_fr":"P'tit Wrap Ranch","name_en":"P'tit Wrap Ranch","category":"mcdonalds_france","serving_g":140,"serving_label":"1 wrap","kcal":340,"protein":14,"carbs":28,"fat":18,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_ptit_wrap_chevre","name_fr":"P'tit Wrap Chè·®vre","name_en":"P'tit Wrap Goat Cheese","category":"mcdonalds_france","serving_g":135,"serving_label":"1 wrap","kcal":320,"protein":14,"carbs":28,"fat":16,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_280","name_fr":"280","name_en":"280","category":"mcdonalds_france","serving_g":280,"serving_label":"1 sandwich","kcal":785,"protein":45,"carbs":57,"fat":41,"fiber":4.3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_big_tasty_1_viande","name_fr":"Big Tasty (1 viande)","name_en":"Big Tasty (1 patty)","category":"mcdonalds_france","serving_g":270,"serving_label":"1 sandwich","kcal":663,"protein":35,"carbs":40,"fat":38,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_big_tasty_2_viandes","name_fr":"Big Tasty (2 viandes)","name_en":"Big Tasty (2 patties)","category":"mcdonalds_france","serving_g":340,"serving_label":"1 sandwich","kcal":927,"protein":50,"carbs":36,"fat":60,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_fries_small","name_fr":"Petites frites","name_en":"Small Fries","category":"mcdonalds_france","serving_g":85,"serving_label":"1 portion","kcal":230,"protein":3,"carbs":30,"fat":11,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_fries_medium","name_fr":"Frites moyennes","name_en":"Medium Fries","category":"mcdonalds_france","serving_g":117,"serving_label":"1 portion","kcal":340,"protein":4,"carbs":44,"fat":16,"fiber":4,"brand":"McDonald's France"},{"id":"mcdonalds_fr_fries_large","name_fr":"Grandes frites","name_en":"Large Fries","category":"mcdonalds_france","serving_g":154,"serving_label":"1 portion","kcal":440,"protein":5,"carbs":57,"fat":21,"fiber":5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_potatoes_medium","name_fr":"Potatoes moyennes","name_en":"Medium Potatoes","category":"mcdonalds_france","serving_g":100,"serving_label":"1 portion","kcal":280,"protein":3,"carbs":38,"fat":13,"fiber":3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_salad_side","name_fr":"Salade d'accompagnement","name_en":"Side Salad","category":"mcdonalds_france","serving_g":50,"serving_label":"1 portion","kcal":15,"protein":1,"carbs":2,"fat":0.5,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_ptite_salade","name_fr":"P'tite salade","name_en":"P'tite Salad","category":"mcdonalds_france","serving_g":60,"serving_label":"1 portion","kcal":20,"protein":1,"carbs":3,"fat":0.5,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcnuggets_6","name_fr":"McNuggets x6","name_en":"McNuggets x6","category":"mcdonalds_france","serving_g":96,"serving_label":"6 piè­ces","kcal":260,"protein":14,"carbs":16,"fat":16,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcnuggets_9","name_fr":"McNuggets x9","name_en":"McNuggets x9","category":"mcdonalds_france","serving_g":144,"serving_label":"9 piè­ces","kcal":390,"protein":21,"carbs":24,"fat":24,"fiber":1.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcnuggets_12","name_fr":"McNuggets x12","name_en":"McNuggets x12","category":"mcdonalds_france","serving_g":192,"serving_label":"12 piè­ces","kcal":520,"protein":28,"carbs":32,"fat":32,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_galette_pommes_terre","name_fr":"Galette de pommes de terre","name_en":"Hash Brown","category":"mcdonalds_france","serving_g":50,"serving_label":"1 galette","kcal":140,"protein":2,"carbs":15,"fat":8,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcflurry_oreo","name_fr":"McFlurry Oreo","name_en":"McFlurry Oreo","category":"mcdonalds_france","serving_g":170,"serving_label":"1 dessert","kcal":340,"protein":8,"carbs":52,"fat":11,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcflurry_daim","name_fr":"McFlurry Daim","name_en":"McFlurry Daim","category":"mcdonalds_france","serving_g":175,"serving_label":"1 dessert","kcal":380,"protein":8,"carbs":54,"fat":14,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mcflurry_mms","name_fr":"McFlurry M&M's","name_en":"McFlurry M&M's","category":"mcdonalds_france","serving_g":180,"serving_label":"1 dessert","kcal":400,"protein":9,"carbs":58,"fat":15,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sundae_caramel","name_fr":"Sundae caramel","name_en":"Caramel Sundae","category":"mcdonalds_france","serving_g":130,"serving_label":"1 dessert","kcal":280,"protein":6,"carbs":48,"fat":7,"fiber":0.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sundae_chocolat","name_fr":"Sundae chocolat","name_en":"Chocolate Sundae","category":"mcdonalds_france","serving_g":130,"serving_label":"1 dessert","kcal":290,"protein":6,"carbs":49,"fat":8,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_brownie","name_fr":"Brownie","name_en":"Brownie","category":"mcdonalds_france","serving_g":65,"serving_label":"1 dessert","kcal":300,"protein":4,"carbs":42,"fat":14,"fiber":2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_donut_sucre","name_fr":"Donut sucre","name_en":"Sugar Donut","category":"mcdonalds_france","serving_g":60,"serving_label":"1 dessert","kcal":250,"protein":3,"carbs":36,"fat":11,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_compote_pommes","name_fr":"Compote de pommes","name_en":"Apple Compote","category":"mcdonalds_france","serving_g":125,"serving_label":"1 gourde","kcal":50,"protein":0.5,"carbs":12,"fat":0,"fiber":1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_apple_slices","name_fr":"Pommes fraî­ches","name_en":"Apple Slices","category":"mcdonalds_france","serving_g":100,"serving_label":"1 sachet","kcal":40,"protein":0.3,"carbs":10,"fat":0.2,"fiber":1.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_water","name_fr":"Eau","name_en":"Water","category":"mcdonalds_france","serving_g":400,"serving_label":"40 cl","kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_coca_zero_40cl","name_fr":"Coca-Cola Zero 40 cl","name_en":"Coca-Cola Zero 40 cl","category":"mcdonalds_france","serving_g":400,"serving_label":"40 cl","kcal":2,"protein":0,"carbs":0.5,"fat":0,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_coca_40cl","name_fr":"Coca-Cola 40 cl","name_en":"Coca-Cola 40 cl","category":"mcdonalds_france","serving_g":400,"serving_label":"40 cl","kcal":170,"protein":0,"carbs":44,"fat":0,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_orange_juice_25cl","name_fr":"Jus d'orange 25 cl","name_en":"Orange Juice 25 cl","category":"mcdonalds_france","serving_g":250,"serving_label":"25 cl","kcal":110,"protein":1.5,"carbs":25,"fat":0.5,"fiber":0.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_espresso","name_fr":"Espresso","name_en":"Espresso","category":"mcdonalds_france","serving_g":30,"serving_label":"1 tasse","kcal":5,"protein":0.3,"carbs":0.5,"fat":0.1,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_cappuccino","name_fr":"Cappuccino","name_en":"Cappuccino","category":"mcdonalds_france","serving_g":200,"serving_label":"1 tasse","kcal":120,"protein":6,"carbs":12,"fat":5,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_moutarde","name_fr":"Sauce moutarde","name_en":"Mustard Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":54,"protein":2,"carbs":2,"fat":4,"fiber":0.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_aigre_douce","name_fr":"Sauce aigre-douce","name_en":"Sweet & Sour Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":43,"protein":0.4,"carbs":10,"fat":0.5,"fiber":0.2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_curry","name_fr":"Sauce curry","name_en":"Curry Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":47,"protein":0.9,"carbs":8.5,"fat":1.2,"fiber":0.3,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_deluxe","name_fr":"Sauce Deluxe","name_en":"Deluxe Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":75,"protein":0.5,"carbs":4,"fat":6.5,"fiber":0.2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_bbq","name_fr":"Sauce BBQ","name_en":"BBQ Sauce","category":"mcdonalds_france","serving_g":28,"serving_label":"1 sachet","kcal":50,"protein":0.2,"carbs":12,"fat":0.3,"fiber":0.5,"brand":"McDonald's France"},{"id":"mcdonalds_fr_mayonnaise","name_fr":"Mayonnaise","name_en":"Mayonnaise","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":184,"protein":0.5,"carbs":0.5,"fat":20,"fiber":0,"brand":"McDonald's France"},{"id":"mcdonalds_fr_ketchup","name_fr":"Ketchup","name_en":"Ketchup","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":25,"protein":0.3,"carbs":6,"fat":0.1,"fiber":0.2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_bearnaise","name_fr":"Sauce béarnaise","name_en":"Bé·®arnaise Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":120,"protein":0.5,"carbs":2,"fat":12,"fiber":0.1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_fromage","name_fr":"Sauce fromage","name_en":"Cheese Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":60,"protein":2,"carbs":3,"fat":4,"fiber":0.2,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_ranch","name_fr":"Sauce ranch","name_en":"Ranch Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":110,"protein":0.5,"carbs":2,"fat":11,"fiber":0.1,"brand":"McDonald's France"},{"id":"mcdonalds_fr_sauce_moutarde_miel","name_fr":"Sauce moutarde-miel","name_en":"Honey Mustard Sauce","category":"mcdonalds_france","serving_g":25,"serving_label":"1 sachet","kcal":90,"protein":0.5,"carbs":8,"fat":6,"fiber":0.2,"brand":"McDonald's France"}];
const BUILTIN_FOODS = RAW_FOODS.map((f,i)=>({id:f.id||slugify(f.name_fr)+"_"+i,name:f.name_fr,kcal:f.kcal,protein:f.protein,carbs:f.carbs,fat:f.fat,fiber:f.fiber||0,category:f.category,serving_g:f.serving_g||100,serving_label:f.serving_label||((f.serving_g||100)+" g")}));

const EXERCISES = [{"id":"pull_up","English":"Pull-Up","Français":"Traction pronation","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction pronation"},{"id":"chin_up","English":"Chin-Up","Français":"Traction supination","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction supination"},{"id":"neutral_grip_pull_up","English":"Neutral-Grip Pull-Up","Français":"Traction prise neutre","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise neutre"},{"id":"wide_grip_pull_up","English":"Wide-Grip Pull-Up","Français":"Traction prise large","Suivi":"reps","kcal/rep":0.2,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise large"},{"id":"close_grip_pull_up","English":"Close-Grip Pull-Up","Français":"Traction prise serrée","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise serrée"},{"id":"mixed_grip_pull_up","English":"Mixed-Grip Pull-Up","Français":"Traction prise mixte","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise mixte"},{"id":"archer_pull_up","English":"Archer Pull-Up","Français":"Traction archer","Suivi":"reps","kcal/rep":0.25,"kcal/min":10.4,"Équipement":"barre","name":"Traction archer"},{"id":"one_arm_pull_up","English":"One-Arm Pull-Up","Français":"Traction à un bras","Suivi":"reps","kcal/rep":0.33,"kcal/min":11.0,"Équipement":"barre","name":"Traction à un bras"},{"id":"negative_pull_up","English":"Negative Pull-Up","Français":"Traction négative","Suivi":"reps","kcal/rep":0.25,"kcal/min":9.8,"Équipement":"barre","name":"Traction négative"},{"id":"jumping_pull_up","English":"Jumping Pull-Up","Français":"Traction avec impulsion","Suivi":"reps","kcal/rep":0.12,"kcal/min":7.35,"Équipement":"barre","name":"Traction avec impulsion"},{"id":"l_pull_up","English":"L-Pull-Up","Français":"Traction jambes en L","Suivi":"reps","kcal/rep":0.2,"kcal/min":10.4,"Équipement":"barre","name":"Traction jambes en L"},{"id":"kipping_pull_up","English":"Kipping Pull-Up","Français":"Traction avec élan","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"barre","name":"Traction avec élan"},{"id":"gorilla_chin_up","English":"Gorilla Chin-Up","Français":"Traction gorille","Suivi":"reps","kcal/rep":0.2,"kcal/min":10.4,"Équipement":"barre","name":"Traction gorille"},{"id":"scapular_pull_up","English":"Scapular Pull-Up","Français":"Traction scapulaire","Suivi":"reps","kcal/rep":0.05,"kcal/min":4.9,"Équipement":"barre","name":"Traction scapulaire"},{"id":"inverted_row","English":"Inverted Row","Français":"Rowing inversé","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre basse","name":"Rowing inversé"},{"id":"australian_pull_up","English":"Australian Pull-Up","Français":"Traction australienne","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre basse","name":"Traction australienne"},{"id":"ring_row","English":"Ring Row","Français":"Rowing aux anneaux","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"anneaux","name":"Rowing aux anneaux"},{"id":"doorframe_row","English":"Doorframe Row","Français":"Rowing au cadre de porte","Suivi":"reps","kcal/rep":0.06,"kcal/min":6.13,"Équipement":"cadre","name":"Rowing au cadre de porte"},{"id":"towel_row","English":"Towel Row","Français":"Rowing avec serviette","Suivi":"reps","kcal/rep":0.06,"kcal/min":6.13,"Équipement":"serviette","name":"Rowing avec serviette"},{"id":"dead_hang","English":"Dead Hang","Français":"Suspension passive","Suivi":"seconds","kcal/rep":null,"kcal/min":3.43,"Équipement":"barre","name":"Suspension passive"},{"id":"active_hang","English":"Active Hang","Français":"Suspension active","Suivi":"seconds","kcal/rep":null,"kcal/min":4.29,"Équipement":"barre","name":"Suspension active"},{"id":"one_arm_hang","English":"One-Arm Hang","Français":"Suspension à un bras","Suivi":"seconds","kcal/rep":null,"kcal/min":5.25,"Équipement":"barre","name":"Suspension à un bras"},{"id":"muscle_up","English":"Muscle-Up","Français":"Muscle-up","Suivi":"reps","kcal/rep":0.25,"kcal/min":10.4,"Équipement":"barre","name":"Muscle-up"},{"id":"band_assisted_pull_up","English":"Band-Assisted Pull-Up","Français":"Traction assistée élastique","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre + élastique","name":"Traction assistée élastique"},{"id":"band_assisted_chin_up","English":"Band-Assisted Chin-Up","Français":"Traction supination assistée","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre + élastique","name":"Traction supination assistée"},{"id":"band_resisted_pull_up","English":"Band-Resisted Pull-Up","Français":"Traction résistée élastique","Suivi":"reps","kcal/rep":0.18,"kcal/min":10.4,"Équipement":"barre + élastique","name":"Traction résistée élastique"},{"id":"band_assisted_muscle_up","English":"Band-Assisted Muscle-Up","Français":"Muscle-up assisté","Suivi":"reps","kcal/rep":0.15,"kcal/min":8.58,"Équipement":"barre + élastique","name":"Muscle-up assisté"},{"id":"weighted_pull_up","English":"Weighted Pull-Up","Français":"Traction lestée","Suivi":"reps","kcal/rep":0.2,"kcal/min":10.4,"Équipement":"barre + lest","name":"Traction lestée"},{"id":"weighted_chin_up","English":"Weighted Chin-Up","Français":"Traction supination lestée","Suivi":"reps","kcal/rep":0.2,"kcal/min":10.4,"Équipement":"barre + lest","name":"Traction supination lestée"},{"id":"front_lever","English":"Front Lever","Français":"Levier avant","Suivi":"seconds","kcal/rep":null,"kcal/min":7.35,"Équipement":"barre","name":"Levier avant"},{"id":"back_lever","English":"Back Lever","Français":"Levier arrière","Suivi":"seconds","kcal/rep":null,"kcal/min":7.35,"Équipement":"barre","name":"Levier arrière"},{"id":"skin_the_cat","English":"Skin the Cat","Français":"Passage arrière/avant","Suivi":"reps","kcal/rep":0.18,"kcal/min":8.0,"Équipement":"barre/anneaux","name":"Passage arrière/avant"},{"id":"human_flag","English":"Human Flag","Français":"Drapeau humain","Suivi":"seconds","kcal/rep":null,"kcal/min":7.35,"Équipement":"structure adaptée","name":"Drapeau humain"},{"id":"dips","English":"Dips","Français":"Dips classiques","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"barres","name":"Dips classiques"},{"id":"chest_dips","English":"Chest Dips","Français":"Dips pectoraux","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"barres","name":"Dips pectoraux"},{"id":"triceps_dips","English":"Triceps Dips","Français":"Dips triceps","Suivi":"reps","kcal/rep":0.08,"kcal/min":9.8,"Équipement":"barres","name":"Dips triceps"},{"id":"wide_grip_dips","English":"Wide-Grip Dips","Français":"Dips prise large","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"barres","name":"Dips prise large"},{"id":"close_grip_dips","English":"Close-Grip Dips","Français":"Dips prise serrée","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"barres","name":"Dips prise serrée"},{"id":"negative_dips","English":"Negative Dips","Français":"Dips négatifs","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"barres","name":"Dips négatifs"},{"id":"assisted_dips","English":"Assisted Dips","Français":"Dips assistés","Suivi":"reps","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"barres + élastique","name":"Dips assistés"},{"id":"band_assisted_dips","English":"Band-Assisted Dips","Français":"Dips assistés élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"barres + élastique","name":"Dips assistés élastique"},{"id":"weighted_dips","English":"Weighted Dips","Français":"Dips lestés","Suivi":"reps","kcal/rep":0.12,"kcal/min":10.4,"Équipement":"barres + lest","name":"Dips lestés"},{"id":"l_sit_dips","English":"L-Sit Dips","Français":"Dips jambes en L","Suivi":"reps","kcal/rep":0.14,"kcal/min":10.4,"Équipement":"barres","name":"Dips jambes en L"},{"id":"russian_dips","English":"Russian Dips","Français":"Dips russes","Suivi":"reps","kcal/rep":0.15,"kcal/min":10.4,"Équipement":"barres","name":"Dips russes"},{"id":"dip_hold","English":"Dip Hold","Français":"Maintien haut de dips","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"barres","name":"Maintien haut de dips"},{"id":"dip_shrug","English":"Dip Shrug","Français":"Haussement scapulaire","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"Équipement":"barres","name":"Haussement scapulaire"},{"id":"bench_dips","English":"Bench Dips","Français":"Dips sur banc","Suivi":"reps","kcal/rep":0.04,"kcal/min":6.13,"Équipement":"banc","name":"Dips sur banc"},{"id":"push_up","English":"Push-Up","Français":"Pompe classique","Suivi":"reps","kcal/rep":0.023,"kcal/min":4.66,"Équipement":"sol","name":"Pompe classique"},{"id":"knee_push_up","English":"Knee Push-Up","Français":"Pompe sur les genoux","Suivi":"reps","kcal/rep":0.018,"kcal/min":3.68,"Équipement":"sol","name":"Pompe sur les genoux"},{"id":"incline_push_up","English":"Incline Push-Up","Français":"Pompe mains surélevées","Suivi":"reps","kcal/rep":0.018,"kcal/min":3.68,"Équipement":"station","name":"Pompe mains surélevées"},{"id":"decline_push_up","English":"Decline Push-Up","Français":"Pompe pieds surélevés","Suivi":"reps","kcal/rep":0.033,"kcal/min":5.51,"Équipement":"support","name":"Pompe pieds surélevés"},{"id":"wide_push_up","English":"Wide Push-Up","Français":"Pompe prise large","Suivi":"reps","kcal/rep":0.026,"kcal/min":4.66,"Équipement":"sol","name":"Pompe prise large"},{"id":"narrow_push_up","English":"Narrow Push-Up","Français":"Pompe serrée","Suivi":"reps","kcal/rep":0.027,"kcal/min":4.9,"Équipement":"sol","name":"Pompe serrée"},{"id":"diamond_push_up","English":"Diamond Push-Up","Français":"Pompe diamant","Suivi":"reps","kcal/rep":0.033,"kcal/min":5.51,"Équipement":"sol","name":"Pompe diamant"},{"id":"archer_push_up","English":"Archer Push-Up","Français":"Pompe archer","Suivi":"reps","kcal/rep":0.049,"kcal/min":6.13,"Équipement":"sol","name":"Pompe archer"},{"id":"one_arm_push_up","English":"One-Arm Push-Up","Français":"Pompe à un bras","Suivi":"reps","kcal/rep":0.082,"kcal/min":7.35,"Équipement":"sol","name":"Pompe à un bras"},{"id":"pike_push_up","English":"Pike Push-Up","Français":"Pompe piquée","Suivi":"reps","kcal/rep":0.049,"kcal/min":6.13,"Équipement":"sol","name":"Pompe piquée"},{"id":"handstand_push_up","English":"Handstand Push-Up","Français":"Pompe en équilibre","Suivi":"reps","kcal/rep":0.082,"kcal/min":7.35,"Équipement":"mur","name":"Pompe en équilibre"},{"id":"wall_push_up","English":"Wall Push-Up","Français":"Pompe au mur","Suivi":"reps","kcal/rep":0.012,"kcal/min":3.06,"Équipement":"mur","name":"Pompe au mur"},{"id":"pseudo_planche_push_up","English":"Pseudo Planche Push-Up","Français":"Pompe pseudo-planche","Suivi":"reps","kcal/rep":0.061,"kcal/min":7.35,"Équipement":"sol","name":"Pompe pseudo-planche"},{"id":"hindu_push_up","English":"Hindu Push-Up","Français":"Pompe hindoue","Suivi":"reps","kcal/rep":0.041,"kcal/min":6.13,"Équipement":"sol","name":"Pompe hindoue"},{"id":"dive_bomber_push_up","English":"Dive Bomber Push-Up","Français":"Pompe plongeon","Suivi":"reps","kcal/rep":0.049,"kcal/min":6.13,"Équipement":"sol","name":"Pompe plongeon"},{"id":"clapping_push_up","English":"Clapping Push-Up","Français":"Pompe claquée","Suivi":"reps","kcal/rep":0.049,"kcal/min":7.35,"Équipement":"sol","name":"Pompe claquée"},{"id":"plyometric_push_up","English":"Plyometric Push-Up","Français":"Pompe pliométrique","Suivi":"reps","kcal/rep":0.049,"kcal/min":7.35,"Équipement":"sol","name":"Pompe pliométrique"},{"id":"t_push_up","English":"T-Push-Up","Français":"Pompe en T","Suivi":"reps","kcal/rep":0.038,"kcal/min":5.51,"Équipement":"sol","name":"Pompe en T"},{"id":"spiderman_push_up","English":"Spiderman Push-Up","Français":"Pompe Spiderman","Suivi":"reps","kcal/rep":0.049,"kcal/min":6.13,"Équipement":"sol","name":"Pompe Spiderman"},{"id":"typewriter_push_up","English":"Typewriter Push-Up","Français":"Pompe machine à écrire","Suivi":"reps","kcal/rep":0.061,"kcal/min":7.35,"Équipement":"sol","name":"Pompe machine à écrire"},{"id":"staggered_push_up","English":"Staggered Push-Up","Français":"Pompe décalée","Suivi":"reps","kcal/rep":0.033,"kcal/min":5.51,"Équipement":"sol","name":"Pompe décalée"},{"id":"negative_push_up","English":"Negative Push-Up","Français":"Pompe négative","Suivi":"reps","kcal/rep":0.049,"kcal/min":6.13,"Équipement":"sol","name":"Pompe négative"},{"id":"deep_push_up","English":"Deep Push-Up","Français":"Pompe profonde sur poignées","Suivi":"reps","kcal/rep":0.033,"kcal/min":5.51,"Équipement":"poignées/barres","name":"Pompe profonde sur poignées"},{"id":"band_push_up","English":"Band Push-Up","Français":"Pompe résistée élastique","Suivi":"reps","kcal/rep":0.03,"kcal/min":6.13,"Équipement":"élastique","name":"Pompe résistée élastique"},{"id":"weighted_push_up","English":"Weighted Push-Up","Français":"Pompe lestée","Suivi":"reps","kcal/rep":0.03,"kcal/min":6.13,"Équipement":"gilet/lest","name":"Pompe lestée"},{"id":"bodyweight_squat","English":"Bodyweight Squat","Français":"Squat au poids du corps","Suivi":"reps","kcal/rep":0.015,"kcal/min":3.68,"Équipement":"sol","name":"Squat au poids du corps"},{"id":"sumo_squat","English":"Sumo Squat","Français":"Squat sumo","Suivi":"reps","kcal/rep":0.015,"kcal/min":3.68,"Équipement":"sol","name":"Squat sumo"},{"id":"box_squat","English":"Box Squat","Français":"Squat sur chaise","Suivi":"reps","kcal/rep":0.015,"kcal/min":3.68,"Équipement":"chaise","name":"Squat sur chaise"},{"id":"sissy_squat","English":"Sissy Squat","Français":"Sissy squat","Suivi":"reps","kcal/rep":0.033,"kcal/min":4.9,"Équipement":"appui","name":"Sissy squat"},{"id":"pistol_squat","English":"Pistol Squat","Français":"Squat pistolet","Suivi":"reps_per_side","kcal/rep":0.077,"kcal/min":7.35,"Équipement":"sol","name":"Squat pistolet"},{"id":"assisted_pistol_squat","English":"Assisted Pistol Squat","Français":"Pistol assisté","Suivi":"reps_per_side","kcal/rep":0.049,"kcal/min":4.9,"Équipement":"station/élastique","name":"Pistol assisté"},{"id":"shrimp_squat","English":"Shrimp Squat","Français":"Squat crevette","Suivi":"reps_per_side","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"sol","name":"Squat crevette"},{"id":"skater_squat","English":"Skater Squat","Français":"Squat patineur","Suivi":"reps_per_side","kcal/rep":0.041,"kcal/min":5.51,"Équipement":"sol","name":"Squat patineur"},{"id":"cossack_squat","English":"Cossack Squat","Français":"Squat cosaque","Suivi":"reps_per_side","kcal/rep":0.041,"kcal/min":4.9,"Équipement":"sol","name":"Squat cosaque"},{"id":"lateral_squat","English":"Lateral Squat","Français":"Squat latéral","Suivi":"reps_per_side","kcal/rep":0.033,"kcal/min":4.9,"Équipement":"sol","name":"Squat latéral"},{"id":"split_squat","English":"Split Squat","Français":"Fente statique","Suivi":"reps_per_side","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Fente statique"},{"id":"bulgarian_split_squat","English":"Bulgarian Split Squat","Français":"Fente bulgare","Suivi":"reps_per_side","kcal/rep":0.038,"kcal/min":5.51,"Équipement":"chaise","name":"Fente bulgare"},{"id":"reverse_lunge","English":"Reverse Lunge","Français":"Fente arrière","Suivi":"reps_per_side","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Fente arrière"},{"id":"forward_lunge","English":"Forward Lunge","Français":"Fente avant","Suivi":"reps_per_side","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Fente avant"},{"id":"walking_lunge","English":"Walking Lunge","Français":"Fente marchée","Suivi":"reps_total","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Fente marchée"},{"id":"curtsy_lunge","English":"Curtsy Lunge","Français":"Fente courtoisie","Suivi":"reps_per_side","kcal/rep":0.038,"kcal/min":4.9,"Équipement":"sol","name":"Fente courtoisie"},{"id":"side_lunge","English":"Side Lunge","Français":"Fente latérale","Suivi":"reps_per_side","kcal/rep":0.038,"kcal/min":4.9,"Équipement":"sol","name":"Fente latérale"},{"id":"cross_lunge","English":"Cross Lunge","Français":"Fente croisée","Suivi":"reps_per_side","kcal/rep":0.038,"kcal/min":4.9,"Équipement":"sol","name":"Fente croisée"},{"id":"step_up","English":"Step-Up","Français":"Montée sur marche","Suivi":"reps_per_side","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"marche","name":"Montée sur marche"},{"id":"step_down","English":"Step-Down","Français":"Descente de marche","Suivi":"reps_per_side","kcal/rep":0.027,"kcal/min":4.29,"Équipement":"marche","name":"Descente de marche"},{"id":"single_leg_deadlift","English":"Single-Leg Deadlift","Français":"Soulevé de terre unijambiste","Suivi":"reps_per_side","kcal/rep":0.041,"kcal/min":4.29,"Équipement":"sol","name":"Soulevé de terre unijambiste"},{"id":"good_morning","English":"Good Morning","Français":"Good morning","Suivi":"reps","kcal/rep":0.033,"kcal/min":4.29,"Équipement":"sol","name":"Good morning"},{"id":"nordic_hamstring_curl","English":"Nordic Hamstring Curl","Français":"Nordic curl","Suivi":"reps","kcal/rep":0.077,"kcal/min":6.13,"Équipement":"ancrage","name":"Nordic curl"},{"id":"glute_bridge","English":"Glute Bridge","Français":"Pont fessier","Suivi":"reps","kcal/rep":0.018,"kcal/min":3.68,"Équipement":"sol","name":"Pont fessier"},{"id":"single_leg_glute_bridge","English":"Single-Leg Glute Bridge","Français":"Pont fessier unijambiste","Suivi":"reps_per_side","kcal/rep":0.027,"kcal/min":4.29,"Équipement":"sol","name":"Pont fessier unijambiste"},{"id":"hip_thrust","English":"Hip Thrust","Français":"Hip thrust","Suivi":"reps","kcal/rep":0.033,"kcal/min":4.9,"Équipement":"chaise","name":"Hip thrust"},{"id":"calf_raise","English":"Calf Raise","Français":"Élévation de mollets","Suivi":"reps","kcal/rep":0.011,"kcal/min":3.06,"Équipement":"sol","name":"Élévation de mollets"},{"id":"single_leg_calf_raise","English":"Single-Leg Calf Raise","Français":"Mollet unijambiste","Suivi":"reps_per_side","kcal/rep":0.014,"kcal/min":3.06,"Équipement":"sol","name":"Mollet unijambiste"},{"id":"wall_sit","English":"Wall Sit","Français":"Chaise contre mur","Suivi":"seconds","kcal/rep":null,"kcal/min":3.68,"Équipement":"mur","name":"Chaise contre mur"},{"id":"jump_squat","English":"Jump Squat","Français":"Squat sauté","Suivi":"reps","kcal/rep":0.053,"kcal/min":9.8,"Équipement":"sol","name":"Squat sauté"},{"id":"jumping_lunge","English":"Jumping Lunge","Français":"Fente sautée","Suivi":"reps_total","kcal/rep":0.065,"kcal/min":9.8,"Équipement":"sol","name":"Fente sautée"},{"id":"box_jump","English":"Box Jump","Français":"Saut sur boîte","Suivi":"reps","kcal/rep":0.078,"kcal/min":9.8,"Équipement":"box","name":"Saut sur boîte"},{"id":"tuck_jump","English":"Tuck Jump","Français":"Saut groupé","Suivi":"reps","kcal/rep":0.086,"kcal/min":11.03,"Équipement":"sol","name":"Saut groupé"},{"id":"star_jump","English":"Star Jump","Français":"Saut en étoile","Suivi":"reps","kcal/rep":0.092,"kcal/min":11.03,"Équipement":"sol","name":"Saut en étoile"},{"id":"broad_jump","English":"Broad Jump","Français":"Saut en longueur","Suivi":"reps","kcal/rep":0.098,"kcal/min":9.8,"Équipement":"sol","name":"Saut en longueur"},{"id":"lateral_hop","English":"Lateral Hop","Français":"Saut latéral","Suivi":"reps_total","kcal/rep":0.065,"kcal/min":9.8,"Équipement":"sol","name":"Saut latéral"},{"id":"skater_hop","English":"Skater Hop","Français":"Saut patineur","Suivi":"reps_total","kcal/rep":0.065,"kcal/min":9.8,"Équipement":"sol","name":"Saut patineur"},{"id":"band_squat","English":"Band Squat","Français":"Squat avec élastique","Suivi":"reps","kcal/rep":0.02,"kcal/min":4.9,"Équipement":"élastique","name":"Squat avec élastique"},{"id":"band_bulgarian_split_squat","English":"Band Bulgarian Split Squat","Français":"Fente bulgare élastique","Suivi":"reps_per_side","kcal/rep":0.045,"kcal/min":6.13,"Équipement":"élastique","name":"Fente bulgare élastique"},{"id":"band_glute_bridge","English":"Band Glute Bridge","Français":"Pont fessier élastique","Suivi":"reps","kcal/rep":0.024,"kcal/min":4.9,"Équipement":"élastique","name":"Pont fessier élastique"},{"id":"band_hip_thrust","English":"Band Hip Thrust","Français":"Hip thrust élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":6.13,"Équipement":"élastique","name":"Hip thrust élastique"},{"id":"band_side_step","English":"Band Side Step","Français":"Pas latéraux élastique","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"élastique","name":"Pas latéraux élastique"},{"id":"band_monster_walk","English":"Band Monster Walk","Français":"Marche monstre élastique","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"élastique","name":"Marche monstre élastique"},{"id":"band_kickback","English":"Band Kickback","Français":"Extension hanche élastique","Suivi":"reps_per_side","kcal/rep":0.025,"kcal/min":4.9,"Équipement":"élastique","name":"Extension hanche élastique"},{"id":"band_abduction","English":"Band Abduction","Français":"Abduction hanche élastique","Suivi":"reps_per_side","kcal/rep":0.02,"kcal/min":4.9,"Équipement":"élastique","name":"Abduction hanche élastique"},{"id":"weighted_squat","English":"Weighted Squat","Français":"Squat lesté","Suivi":"reps","kcal/rep":0.02,"kcal/min":6.13,"Équipement":"gilet/lest","name":"Squat lesté"},{"id":"weighted_pistol_squat","English":"Weighted Pistol Squat","Français":"Pistol lesté","Suivi":"reps_per_side","kcal/rep":0.085,"kcal/min":8.58,"Équipement":"gilet/lest","name":"Pistol lesté"},{"id":"weighted_bulgarian_split_squat","English":"Weighted Bulgarian Split Squat","Français":"Fente bulgare lestée","Suivi":"reps_per_side","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"gilet/lest","name":"Fente bulgare lestée"},{"id":"weighted_walking_lunge","English":"Weighted Walking Lunge","Français":"Fente marchée lestée","Suivi":"reps_total","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"gilet/lest","name":"Fente marchée lestée"},{"id":"weighted_calf_raise","English":"Weighted Calf Raise","Français":"Mollet lesté","Suivi":"reps","kcal/rep":0.015,"kcal/min":4.9,"Équipement":"gilet/lest","name":"Mollet lesté"},{"id":"weighted_hip_thrust","English":"Weighted Hip Thrust","Français":"Hip thrust lesté","Suivi":"reps","kcal/rep":0.045,"kcal/min":7.35,"Équipement":"gilet/lest","name":"Hip thrust lesté"},{"id":"crunch","English":"Crunch","Français":"Crunch","Suivi":"reps","kcal/rep":0.015,"kcal/min":3.68,"Équipement":"sol","name":"Crunch"},{"id":"reverse_crunch","English":"Reverse Crunch","Français":"Crunch inversé","Suivi":"reps","kcal/rep":0.022,"kcal/min":4.29,"Équipement":"sol","name":"Crunch inversé"},{"id":"bicycle_crunch","English":"Bicycle Crunch","Français":"Crunch vélo","Suivi":"reps_total","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Crunch vélo"},{"id":"sit_up","English":"Sit-Up","Français":"Relevé de buste","Suivi":"reps","kcal/rep":0.022,"kcal/min":3.68,"Équipement":"sol","name":"Relevé de buste"},{"id":"v_up","English":"V-Up","Français":"Relevé en V","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"sol","name":"Relevé en V"},{"id":"leg_raise","English":"Leg Raise","Français":"Élévation de jambes au sol","Suivi":"reps","kcal/rep":0.033,"kcal/min":4.9,"Équipement":"sol","name":"Élévation de jambes au sol"},{"id":"hanging_knee_raise","English":"Hanging Knee Raise","Français":"Élévation genoux suspendu","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"barre","name":"Élévation genoux suspendu"},{"id":"hanging_leg_raise","English":"Hanging Leg Raise","Français":"Élévation jambes suspendu","Suivi":"reps","kcal/rep":0.074,"kcal/min":7.35,"Équipement":"barre","name":"Élévation jambes suspendu"},{"id":"toes_to_bar","English":"Toes-to-Bar","Français":"Orteils à la barre","Suivi":"reps","kcal/rep":0.123,"kcal/min":9.8,"Équipement":"barre","name":"Orteils à la barre"},{"id":"knee_to_elbow","English":"Knee-to-Elbow","Français":"Genou au coude suspendu","Suivi":"reps","kcal/rep":0.074,"kcal/min":7.35,"Équipement":"barre","name":"Genou au coude suspendu"},{"id":"hanging_crunch","English":"Hanging Crunch","Français":"Crunch suspendu","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"barre","name":"Crunch suspendu"},{"id":"hanging_oblique_knee_raise","English":"Hanging Oblique Knee Raise","Français":"Élévation oblique suspendue","Suivi":"reps_per_side","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"barre","name":"Élévation oblique suspendue"},{"id":"hanging_windshield_wipers","English":"Hanging Windshield Wipers","Français":"Essuie-glaces suspendu","Suivi":"reps","kcal/rep":0.1,"kcal/min":7.35,"Équipement":"barre","name":"Essuie-glaces suspendu"},{"id":"plank","English":"Plank","Français":"Planche","Suivi":"seconds","kcal/rep":null,"kcal/min":3.43,"Équipement":"sol","name":"Planche"},{"id":"side_plank","English":"Side Plank","Français":"Planche latérale","Suivi":"seconds_per_side","kcal/rep":null,"kcal/min":3.43,"Équipement":"sol","name":"Planche latérale"},{"id":"reverse_plank","English":"Reverse Plank","Français":"Planche inversée","Suivi":"seconds","kcal/rep":null,"kcal/min":3.68,"Équipement":"sol","name":"Planche inversée"},{"id":"knee_plank","English":"Knee Plank","Français":"Planche sur genoux","Suivi":"seconds","kcal/rep":null,"kcal/min":3.06,"Équipement":"sol","name":"Planche sur genoux"},{"id":"hollow_body_hold","English":"Hollow Body Hold","Français":"Gainage creux","Suivi":"seconds","kcal/rep":null,"kcal/min":3.68,"Équipement":"sol","name":"Gainage creux"},{"id":"hollow_body_rock","English":"Hollow Body Rock","Français":"Rocking hollow body","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"sol","name":"Rocking hollow body"},{"id":"tuck_hold","English":"Tuck Hold","Français":"Gainage groupé","Suivi":"seconds","kcal/rep":null,"kcal/min":4.29,"Équipement":"sol","name":"Gainage groupé"},{"id":"l_sit_hold","English":"L-Sit Hold","Français":"Maintien en L","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"barres","name":"Maintien en L"},{"id":"v_sit_hold","English":"V-Sit Hold","Français":"Maintien en V","Suivi":"seconds","kcal/rep":null,"kcal/min":6.13,"Équipement":"barres","name":"Maintien en V"},{"id":"dead_bug","English":"Dead Bug","Français":"Dead bug","Suivi":"reps_total","kcal/rep":0.022,"kcal/min":3.68,"Équipement":"sol","name":"Dead bug"},{"id":"bird_dog","English":"Bird Dog","Français":"Bird dog","Suivi":"reps_per_side","kcal/rep":0.028,"kcal/min":3.43,"Équipement":"sol","name":"Bird dog"},{"id":"russian_twist","English":"Russian Twist","Français":"Rotation russe","Suivi":"reps_total","kcal/rep":0.031,"kcal/min":4.9,"Équipement":"sol","name":"Rotation russe"},{"id":"flutter_kick","English":"Flutter Kick","Français":"Battements de jambes","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"sol","name":"Battements de jambes"},{"id":"jackknife","English":"Jackknife","Français":"Jackknife abdos","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"sol","name":"Jackknife abdos"},{"id":"back_extension","English":"Back Extension","Français":"Extension du dos","Suivi":"reps","kcal/rep":0.028,"kcal/min":3.68,"Équipement":"sol","name":"Extension du dos"},{"id":"superman","English":"Superman","Français":"Superman","Suivi":"reps","kcal/rep":0.028,"kcal/min":3.68,"Équipement":"sol","name":"Superman"},{"id":"dragon_flag","English":"Dragon Flag","Français":"Drapeau dragon","Suivi":"reps","kcal/rep":0.123,"kcal/min":7.35,"Équipement":"banc","name":"Drapeau dragon"},{"id":"windshield_wipers","English":"Windshield Wipers","Français":"Essuie-glaces au sol","Suivi":"reps","kcal/rep":0.074,"kcal/min":6.13,"Équipement":"sol","name":"Essuie-glaces au sol"},{"id":"mountain_climber","English":"Mountain Climber","Français":"Mountain climber","Suivi":"steps","kcal/rep":0.0245,"kcal/min":9.8,"Équipement":"sol","name":"Mountain climber"},{"id":"plank_shoulder_tap","English":"Plank Shoulder Tap","Français":"Planche toucher épaule","Suivi":"reps_total","kcal/rep":0.027,"kcal/min":4.29,"Équipement":"sol","name":"Planche toucher épaule"},{"id":"plank_leg_raise","English":"Plank Leg Raise","Français":"Planche élévation jambe","Suivi":"reps_total","kcal/rep":0.035,"kcal/min":4.29,"Équipement":"sol","name":"Planche élévation jambe"},{"id":"vertical_knee_raise","English":"Vertical Knee Raise","Français":"Élévation verticale genoux","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"chaise romaine","name":"Élévation verticale genoux"},{"id":"straight_leg_raise_captains_chair","English":"Straight Leg Raise","Français":"Élévation jambes tendues chaise","Suivi":"reps","kcal/rep":0.082,"kcal/min":7.35,"Équipement":"chaise romaine","name":"Élévation jambes tendues chaise"},{"id":"oblique_knee_raise","English":"Oblique Knee Raise","Français":"Élévation oblique chaise","Suivi":"reps_per_side","kcal/rep":0.061,"kcal/min":6.13,"Équipement":"chaise romaine","name":"Élévation oblique chaise"},{"id":"twisting_knee_raise","English":"Twisting Knee Raise","Français":"Élévation genoux en rotation","Suivi":"reps_total","kcal/rep":0.074,"kcal/min":6.13,"Équipement":"chaise romaine","name":"Élévation genoux en rotation"},{"id":"l_sit_captains_chair","English":"L-Sit on Captain’s Chair","Français":"Maintien en L chaise","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"chaise romaine","name":"Maintien en L chaise"},{"id":"weighted_plank","English":"Weighted Plank","Français":"Planche lestée","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"sol + lest","name":"Planche lestée"},{"id":"weighted_side_plank","English":"Weighted Side Plank","Français":"Planche latérale lestée","Suivi":"seconds_per_side","kcal/rep":null,"kcal/min":4.9,"Équipement":"sol + lest","name":"Planche latérale lestée"},{"id":"weighted_hanging_leg_raise","English":"Weighted Hanging Leg Raise","Français":"Élévation jambes suspendue lestée","Suivi":"reps","kcal/rep":0.123,"kcal/min":8.58,"Équipement":"barre + lest","name":"Élévation jambes suspendue lestée"},{"id":"band_row","English":"Band Row","Français":"Tirage horizontal élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Tirage horizontal élastique"},{"id":"single_arm_band_row","English":"Single-Arm Band Row","Français":"Tirage unilatéral élastique","Suivi":"reps_per_side","kcal/rep":0.05,"kcal/min":4.9,"name":"Tirage unilatéral élastique"},{"id":"wide_grip_band_row","English":"Wide-Grip Band Row","Français":"Tirage large élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Tirage large élastique"},{"id":"close_grip_band_row","English":"Close-Grip Band Row","Français":"Tirage serré élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Tirage serré élastique"},{"id":"band_high_row","English":"Band High Row","Français":"Tirage haut élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":4.9,"name":"Tirage haut élastique"},{"id":"band_low_row","English":"Band Low Row","Français":"Tirage bas élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Tirage bas élastique"},{"id":"band_lat_pulldown","English":"Band Lat Pulldown","Français":"Tirage vertical élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":6.13,"name":"Tirage vertical élastique"},{"id":"band_straight_arm_pulldown","English":"Band Straight-Arm Pulldown","Français":"Pulldown bras tendus","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Pulldown bras tendus"},{"id":"band_face_pull","English":"Band Face Pull","Français":"Face pull élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Face pull élastique"},{"id":"band_reverse_fly","English":"Band Reverse Fly","Français":"Écarté arrière élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Écarté arrière élastique"},{"id":"band_chest_press","English":"Band Chest Press","Français":"Développé pectoraux élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Développé pectoraux élastique"},{"id":"band_incline_chest_press","English":"Band Incline Chest Press","Français":"Développé incliné élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":4.9,"name":"Développé incliné élastique"},{"id":"band_decline_chest_press","English":"Band Decline Chest Press","Français":"Développé décliné élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":4.9,"name":"Développé décliné élastique"},{"id":"band_fly","English":"Band Fly","Français":"Écarté pectoraux élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Écarté pectoraux élastique"},{"id":"band_overhead_press","English":"Band Overhead Press","Français":"Développé épaules élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":4.9,"name":"Développé épaules élastique"},{"id":"band_lateral_raise","English":"Band Lateral Raise","Français":"Élévations latérales élastique","Suivi":"reps","kcal/rep":0.03,"kcal/min":4.29,"name":"Élévations latérales élastique"},{"id":"band_front_raise","English":"Band Front Raise","Français":"Élévations frontales élastique","Suivi":"reps","kcal/rep":0.03,"kcal/min":4.29,"name":"Élévations frontales élastique"},{"id":"band_upright_row","English":"Band Upright Row","Français":"Tirage vertical élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Tirage vertical élastique"},{"id":"band_triceps_pushdown","English":"Band Triceps Pushdown","Français":"Extension triceps vers le bas","Suivi":"reps","kcal/rep":0.03,"kcal/min":4.29,"name":"Extension triceps vers le bas"},{"id":"band_overhead_triceps_extension","English":"Band Overhead Triceps Extension","Français":"Extension triceps au-dessus tête","Suivi":"reps","kcal/rep":0.03,"kcal/min":4.29,"name":"Extension triceps au-dessus tête"},{"id":"band_triceps_kickback","English":"Band Triceps Kickback","Français":"Kickback triceps élastique","Suivi":"reps_per_side","kcal/rep":0.03,"kcal/min":4.29,"name":"Kickback triceps élastique"},{"id":"band_woodchop","English":"Band Woodchop","Français":"Woodchop élastique","Suivi":"reps_per_side","kcal/rep":0.061,"kcal/min":6.13,"name":"Woodchop élastique"},{"id":"band_reverse_woodchop","English":"Band Reverse Woodchop","Français":"Woodchop inversé élastique","Suivi":"reps_per_side","kcal/rep":0.061,"kcal/min":6.13,"name":"Woodchop inversé élastique"},{"id":"band_pallof_press","English":"Band Pallof Press","Français":"Presse Pallof","Suivi":"reps_per_side","kcal/rep":0.049,"kcal/min":4.9,"name":"Presse Pallof"},{"id":"band_anti_rotation_hold","English":"Band Anti-Rotation Hold","Français":"Maintien anti-rotation","Suivi":"seconds_per_side","kcal/rep":null,"kcal/min":4.9,"name":"Maintien anti-rotation"},{"id":"band_standing_crunch","English":"Band Standing Crunch","Français":"Crunch debout élastique","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"name":"Crunch debout élastique"},{"id":"band_kneeling_crunch","English":"Band Kneeling Crunch","Français":"Crunch à genoux élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":6.13,"name":"Crunch à genoux élastique"},{"id":"band_side_bend","English":"Band Side Bend","Français":"Inclinaison latérale élastique","Suivi":"reps_per_side","kcal/rep":0.04,"kcal/min":4.9,"name":"Inclinaison latérale élastique"},{"id":"burpee","English":"Burpee","Français":"Burpee","Suivi":"reps","kcal/rep":0.098,"kcal/min":9.8,"name":"Burpee"},{"id":"burpee_push_up","English":"Burpee with Push-Up","Français":"Burpee avec pompe","Suivi":"reps","kcal/rep":0.123,"kcal/min":9.8,"name":"Burpee avec pompe"},{"id":"burpee_tuck_jump","English":"Burpee with Tuck Jump","Français":"Burpee saut groupé","Suivi":"reps","kcal/rep":0.138,"kcal/min":11.03,"name":"Burpee saut groupé"},{"id":"squat_thrust","English":"Squat Thrust","Français":"Squat thrust","Suivi":"reps","kcal/rep":0.074,"kcal/min":8.58,"name":"Squat thrust"},{"id":"jumping_jacks","English":"Jumping Jacks","Français":"Jumping jacks","Suivi":"reps","kcal/rep":0.0245,"kcal/min":9.8,"name":"Jumping jacks"},{"id":"walking_jacks","English":"Walking Jacks","Français":"Jumping jacks marchées","Suivi":"reps","kcal/rep":0.018,"kcal/min":7.35,"name":"Jumping jacks marchées"},{"id":"high_knees","English":"High Knees","Français":"Montées de genoux","Suivi":"seconds","kcal/rep":null,"kcal/min":9.8,"name":"Montées de genoux"},{"id":"butt_kicks","English":"Butt Kicks","Français":"Talons-fesses","Suivi":"seconds","kcal/rep":null,"kcal/min":7.35,"name":"Talons-fesses"},{"id":"bear_crawl","English":"Bear Crawl","Français":"Marche de l’ours","Suivi":"seconds_or_distance","kcal/rep":null,"kcal/min":7.35,"name":"Marche de l’ours"},{"id":"crab_walk","English":"Crab Walk","Français":"Marche du crabe","Suivi":"seconds_or_distance","kcal/rep":null,"kcal/min":6.13,"name":"Marche du crabe"},{"id":"inchworm","English":"Inchworm","Français":"Inchworm","Suivi":"reps","kcal/rep":0.061,"kcal/min":4.9,"name":"Inchworm"},{"id":"inchworm_push_up","English":"Inchworm Push-Up","Français":"Inchworm avec pompe","Suivi":"reps","kcal/rep":0.082,"kcal/min":6.13,"name":"Inchworm avec pompe"},{"id":"commando_plank","English":"Commando Plank","Français":"Planche commando","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"name":"Planche commando"},{"id":"plank_jacks","English":"Plank Jacks","Français":"Planche avec écarts sautés","Suivi":"reps","kcal/rep":0.061,"kcal/min":7.35,"name":"Planche avec écarts sautés"},{"id":"plank_to_push_up","English":"Plank to Push-Up","Français":"Passage planche à pompe","Suivi":"reps","kcal/rep":0.061,"kcal/min":6.13,"name":"Passage planche à pompe"},{"id":"shadow_boxing","English":"Shadow Boxing","Français":"Boxe dans le vide","Suivi":"seconds","kcal/rep":null,"kcal/min":7.35,"name":"Boxe dans le vide"},{"id":"jump_rope_simulation","English":"Jump Rope Simulation","Français":"Simulation corde à sauter","Suivi":"seconds","kcal/rep":null,"kcal/min":9.8,"name":"Simulation corde à sauter"},{"id":"shuttle_runs","English":"Shuttle Runs","Français":"Courses navettes","Suivi":"seconds_or_distance","kcal/rep":null,"kcal/min":9.8,"name":"Courses navettes"},{"id":"sprint_intervals","English":"Sprint Intervals","Français":"Sprints en intervalles","Suivi":"seconds_or_distance","kcal/rep":null,"kcal/min":12.25,"name":"Sprints en intervalles"},{"id":"carioca","English":"Carioca","Français":"Pas croisés latéraux","Suivi":"seconds_or_distance","kcal/rep":null,"kcal/min":7.35,"name":"Pas croisés latéraux"},{"id":"cat_cow","English":"Cat Cow","Français":"Chat-vache","Suivi":"seconds","kcal/min 70 kg":"3.0–3.4","name":"Chat-vache"},{"id":"childs_pose","English":"Child’s Pose","Français":"Posture de l’enfant","Suivi":"seconds","kcal/min 70 kg":"2.5–3.0","name":"Posture de l’enfant"},{"id":"downward_dog","English":"Downward Dog","Français":"Chien tête en bas","Suivi":"seconds","kcal/min 70 kg":"3.0–3.4","name":"Chien tête en bas"},{"id":"upward_dog","English":"Upward Dog","Français":"Chien tête en haut","Suivi":"seconds","kcal/min 70 kg":"3.0–3.4","name":"Chien tête en haut"},{"id":"pigeon_pose","English":"Pigeon Pose","Français":"Posture du pigeon","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Posture du pigeon"},{"id":"worlds_greatest_stretch","English":"World’s Greatest Stretch","Français":"Étirement du monde","Suivi":"seconds_per_side","kcal/min 70 kg":"3.4–4.0","name":"Étirement du monde"},{"id":"hip_flexor_stretch","English":"Hip Flexor Stretch","Français":"Étirement fléchisseurs hanche","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement fléchisseurs hanche"},{"id":"hamstring_stretch","English":"Hamstring Stretch","Français":"Étirement ischio-jambiers","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement ischio-jambiers"},{"id":"quad_stretch","English":"Quad Stretch","Français":"Étirement quadriceps","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement quadriceps"},{"id":"calf_stretch","English":"Calf Stretch","Français":"Étirement mollets","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement mollets"},{"id":"hip_90_90","English":"90/90 Hip Stretch","Français":"Étirement hanches 90/90","Suivi":"seconds_per_side","kcal/min 70 kg":"3.0–3.4","name":"Étirement hanches 90/90"},{"id":"deep_squat_hold","English":"Deep Squat Hold","Français":"Maintien squat profond","Suivi":"seconds","kcal/min 70 kg":"3.4–4.0","name":"Maintien squat profond"}];

/* ===================== ÉTAT / STOCKAGE ===================== */
const LS = {
  get(k,d){try{const v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){localStorage.setItem(k, JSON.stringify(v));}
};
let settings = LS.get('ct_settings', {calorieGoal:2200, proteinGoal:150, carbGoal:220, fatGoal:70});
let customFoods = LS.get('ct_customFoods', []);
let foodOverrides = LS.get('ct_foodOverrides', {}); // {builtinId: {name,kcal,protein,carbs,fat}}
let favorites = LS.get('ct_favorites', []); // array of food ids
let weightEntries = LS.get('ct_weight', []); // {id,date,weight,bodyFat,muscleMass,water,note}
// Migration ponctuelle : le muscle était saisi en % du poids, il est désormais en kg.
// On convertit une seule fois les anciennes valeurs via le poids de la même pesée.
if(!LS.get('ct_muscleUnitMigrated', false)){
  weightEntries.forEach(e=>{
    if(e.muscleMass!=null && e.weight) e.muscleMass = Math.round(e.weight*e.muscleMass/100*10)/10;
  });
  LS.set('ct_weight', weightEntries);
  LS.set('ct_muscleUnitMigrated', true);
}
let profile = LS.get('ct_profile', {sex:'H', age:'', height:'', activity:'modere', goalWeight:'', rate:'-0.5'});
let logEntries = LS.get('ct_log', []); // {id,date,type,...}
let todos = LS.get('ct_todos', []); // {id,text,daily,done,completedDate}
let currentDate = todayStr();
let activeTab = 'today';

function allFoods(){
  const builtin = BUILTIN_FOODS.map(f => foodOverrides[f.id] ? {...f, ...foodOverrides[f.id]} : f);
  return [...customFoods, ...builtin];
}
function todayStr(){ return fmtDate(new Date()); }
function fmtDate(d){ return d.toISOString().slice(0,10); }
function shiftDate(dateStr, delta){ const d=new Date(dateStr+'T12:00:00'); d.setDate(d.getDate()+delta); return fmtDate(d); }
function daysBetween(a,b){ return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000); }
function dateLabel(dateStr){
  const d = new Date(dateStr+'T12:00:00');
  const t = new Date(); const y = new Date(); y.setDate(t.getDate()-1); const tm = new Date(); tm.setDate(t.getDate()+1);
  if(dateStr===fmtDate(t)) return "Aujourd'hui";
  if(dateStr===fmtDate(y)) return "Hier";
  if(dateStr===fmtDate(tm)) return "Demain";
  return d.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function save(){
  LS.set('ct_settings',settings); LS.set('ct_customFoods',customFoods); LS.set('ct_foodOverrides',foodOverrides);
  LS.set('ct_favorites',favorites); LS.set('ct_weight',weightEntries); LS.set('ct_profile',profile);
  LS.set('ct_wpresets',workoutPresets);
  LS.set('ct_log',logEntries);
  LS.set('ct_todos',todos);
}
function isFavorite(id){ return favorites.includes(id); }
function toggleFavorite(id){
  favorites = isFavorite(id) ? favorites.filter(x=>x!==id) : [...favorites, id];
  save();
}
const TOAST_ICONS = {
  success: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
  warn:    '<svg class="ico" viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 17.5v.5"/></svg>',
  error:   '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  info:    '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h2v5"/></svg>',
};
function toast(msg, kind='info'){
  const t=document.getElementById('toast');
  t.className = 'toast ' + kind;
  t.innerHTML = (TOAST_ICONS[kind]||TOAST_ICONS.info) + '<span>'+msg+'</span>';
  // restart animation
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(window.__toastT);
  window.__toastT=setTimeout(()=>{ t.classList.remove('show'); }, 2200);
}
function flashEl(el){
  if(!el) return;
  el.classList.remove('flash'); void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(()=>el.classList.remove('flash'), 900);
}

function entriesFor(date){ return logEntries.filter(e=>e.date===date); }
function dayTotals(date){
  const es = entriesFor(date);
  let kcalIn=0, kcalOut=0, protein=0, carbs=0, fat=0;
  es.forEach(e=>{
    if(e.type==='meal'){ kcalIn+=e.kcal; protein+=e.protein; carbs+=e.carbs; fat+=e.fat; }
    else if(e.type==='workout'){ kcalOut += e.kcalBurned; }
  });
  return {kcalIn,kcalOut,protein,carbs,fat,net:kcalIn-kcalOut};
}

// Les semaines sont ancrées au lundi. Le déficit ignore volontairement les séances :
// objectif quotidien - calories consommées, et les jours sans repas ne comptent pas.
function weekStart(dateStr){
  const d = new Date(dateStr+'T12:00:00');
  const mondayOffset = (d.getDay()+6)%7;
  d.setDate(d.getDate()-mondayOffset);
  return fmtDate(d);
}
function weekEnd(startStr){ return shiftDate(startStr, 6); }
function weeklyDeficit(startStr){
  const endStr = weekEnd(startStr);
  const days = [...new Set(logEntries.filter(e=>e.type==='meal' && e.date>=startStr && e.date<=endStr).map(e=>e.date))].sort();
  const dayValues = days.map(date=>({date, calories:dayTotals(date).kcalIn, deficit:settings.calorieGoal-dayTotals(date).kcalIn}));
  // Brûlées affichées à titre informatif uniquement : ne participe pas à `total`.
  const burned = logEntries.filter(e=>e.type==='workout' && e.date>=startStr && e.date<=endStr).reduce((sum,e)=>sum+e.kcalBurned,0);
  return {start:startStr, end:endStr, days:dayValues, total:dayValues.reduce((sum,d)=>sum+d.deficit,0), burned};
}
function weeklyDeficits(){
  const starts = [...new Set(logEntries.filter(e=>e.type==='meal').map(e=>weekStart(e.date)))].sort((a,b)=>b.localeCompare(a));
  return starts.map(weeklyDeficit);
}
function weeklyRangeLabel(startStr,endStr){
  const fmt = d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
  return `${fmt(startStr)} au ${fmt(endStr)}`;
}
function weekDayDates(startStr, endStr){
  return [...new Set(logEntries.filter(e=>e.date>=startStr && e.date<=endStr).map(e=>e.date))].sort();
}
function weeklyDeficitCard(week, isCurrent){
  const surplus = week.total < 0;
  const label = surplus ? 'Surplus' : 'Déficit';
  const expanded = openHistWeek===week.start;
  const dayDates = expanded ? weekDayDates(week.start, week.end) : [];
  const daysDetail = expanded ? (dayDates.length ? dayDates.map(d=>{
    const t = dayTotals(d);
    const open = openHistDay===d;
    return `<div class="hist-day">
      <div class="hist-head" data-histday="${d}">
        <div class="d">${dateLabel(d)}</div>
        <div class="n">${Math.round(t.kcalIn)} / obj ${settings.calorieGoal}</div>
      </div>
      <div class="hist-body ${open?'open':''}">${dayLogList(d)}</div>
    </div>`;
  }).join('') : `<div class="empty">Rien enregistré cette semaine-là.</div>`) : '';
  return `<section class="weekly-deficit ${isCurrent?'current':'past'} ${expanded?'expanded':''}">
    <div class="hist-week-toggle" data-histweek="${week.start}">
      <div class="eyebrow">${isCurrent?'Semaine en cours':'Semaine précédente'} · ${label}</div>
      <div class="range">Semaine du ${weeklyRangeLabel(week.start,week.end)}</div>
      <div class="total ${surplus?'surplus':'deficit'}">${week.total < 0 ? '+' : '-'}${Math.round(Math.abs(week.total))} kcal</div>
      <div class="meta">${week.days.length} jour${week.days.length>1?'s':''} avec repas · objectif ${settings.calorieGoal} kcal/jour · séances non déduites</div>
      <div class="burned">🔥 <span class="v">${Math.round(week.burned)}</span> kcal brûlées cette semaine (info)</div>
      <div class="expand-hint">${expanded?'Masquer le détail ▲':'Voir le détail par jour ▼'}</div>
    </div>
    ${expanded?`<div class="hist-week-days">${daysDetail}</div>`:''}
  </section>`;
}

function normalizeTodos(){
  const today = todayStr();
  todos = (Array.isArray(todos)?todos:[]).map(t=>({...t, daily:!!t.daily, done:!!t.done}));
  let changed=false;
  todos.forEach(t=>{ if(t.daily && t.done && t.completedDate!==today){t.done=false; t.completedDate=null; changed=true;} });
  if(changed) save();
}
function viewTodos(){
  normalizeTodos();
  const done=todos.filter(t=>t.done).length;
  const pending=todos.filter(t=>!t.done);
  const completed=todos.filter(t=>t.done);
  const item=t=>`<div class="todo-item ${t.done?'done':''}">
    <input class="todo-check" type="checkbox" data-todo-toggle="${t.id}" ${t.done?'checked':''} aria-label="Marquer ${escapeHtml(t.text)} comme fait">
    <div class="todo-copy"><div class="todo-label">${escapeHtml(t.text)}</div><span class="todo-kind">${t.daily?'Chaque jour':'Objectif ponctuel'}</span></div>
    <div class="todo-actions"><button data-todo-edit="${t.id}" aria-label="Modifier">✎</button><button data-todo-delete="${t.id}" aria-label="Supprimer">✕</button></div>
  </div>`;
  return `<h1 class="page-title">To-do</h1>
  <section class="card todo-intro"><h2>Petits pas, grands effets</h2><p>Ajoute tes objectifs personnels ou tes rappels de médicaments. Les habitudes quotidiennes repartent à zéro chaque jour.</p></section>
  <section class="card"><h2>Ajouter une tâche</h2>
    <div class="todo-form"><input id="todoInput" type="text" maxlength="120" placeholder="Ex. Prendre mes médicaments" autocomplete="off"><button class="btn primary" id="todoAdd">Ajouter</button>
      <label class="todo-options"><input id="todoDaily" type="checkbox"> Tâche quotidienne <span class="hint" style="margin:0">(à recocher demain)</span></label>
    </div>
  </section>
  <section class="card"><h2>À faire</h2>
    <div class="todo-progress" aria-label="Progression des tâches">${done}/${todos.length} complétée${done>1?'s':''} <span aria-hidden="true">·</span> ${todos.length?Math.round(done/todos.length*100):0}%
      <div class="todo-progress-bar"><span style="--progress:${todos.length?Math.round(done/todos.length*100):0}%"></span></div>
    </div>
    <div class="todo-list">${pending.length?pending.map(item).join(''):'<div class="empty">Tout est fait pour le moment ✨</div>'}</div>
    ${completed.length?`<h2 style="margin-top:20px">Terminées</h2><div class="todo-list">${completed.map(item).join('')}</div>`:''}
  </section>`;
}

/* ===================== RENDU ===================== */
function render(){
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===activeTab));
  const moreToggle = document.getElementById('moreToggle');
  if(moreToggle) moreToggle.classList.toggle('active', ['notes','todos','settings'].includes(activeTab));
  const main = document.getElementById('main');
  if(activeTab==='today') main.innerHTML = viewToday();
  else if(activeTab==='meals') main.innerHTML = viewMeals();
  else if(activeTab==='workouts') main.innerHTML = viewWorkouts();
  else if(activeTab==='weight') main.innerHTML = viewWeight();
  else if(activeTab==='notes') main.innerHTML = viewNotes();
  else if(activeTab==='todos') main.innerHTML = viewTodos();
  else if(activeTab==='history') main.innerHTML = viewHistory();
  else if(activeTab==='settings') main.innerHTML = viewSettings();
  bindTabEvents();
}

function dayBar(){
  return `<div class="daybar">
    <button data-act="prevday">‹</button>
    <div class="label">${dateLabel(currentDate)}<small>${new Date(currentDate+'T12:00:00').toLocaleDateString('fr-FR')}</small></div>
    <button data-act="nextday">›</button>
  </div>`;
}

// Conseils macros : compare la part du macro déjà consommée à la part de la
// journée déjà écoulée, pour repérer un macro en avance (à limiter) ou en
// retard (à privilégier) sur le rythme de la journée — pas juste un % brut.
function macroTips(t){
  const now = new Date();
  const elapsed = (now.getHours()*60+now.getMinutes())/1440;
  const macros = [
    {label:'Protéines', color:'var(--blue)', consumed:t.protein, goal:settings.proteinGoal},
    {label:'Glucides', color:'var(--rust)', consumed:t.carbs, goal:settings.carbGoal},
    {label:'Lipides', color:'var(--green)', consumed:t.fat, goal:settings.fatGoal}
  ];
  const tips = [];
  macros.forEach(m=>{
    if(!m.goal) return;
    const ratio = m.consumed/m.goal;
    const diff = ratio-elapsed;
    if(diff>=0.2 && ratio>=0.6){
      tips.push({...m, text:`déjà ${Math.round(m.consumed)}/${m.goal} g alors que la journée n'est qu'à ${Math.round(elapsed*100)}% — mieux vaut éviter les aliments riches en ${m.label.toLowerCase()} pour la suite.`});
    } else if(diff<=-0.25 && elapsed>=0.3){
      tips.push({...m, text:`seulement ${Math.round(m.consumed)}/${m.goal} g pour l'instant — pense à en ajouter dans ton prochain repas.`});
    }
  });
  return tips;
}
function viewToday(){
  const t = dayTotals(currentDate);
  // Le budget restant ignore volontairement les séances de sport : brûler des
  // calories ne doit pas "rembourser" de la marge pour manger plus.
  const remaining = settings.calorieGoal - t.kcalIn;
  const pctRaw = Math.max(0,(t.kcalIn/settings.calorieGoal));
  const pct = Math.min(100, pctRaw*100);
  const over = t.kcalIn > settings.calorieGoal;
  const macroRow = (name,val,goal,color)=>{
    const p = goal? Math.min(100,(val/goal)*100) : 0;
    return `<div class="macro-row"><div class="name">${name}</div><div class="bar"><div style="width:${p}%; background:${color}"></div></div><div class="amt">${Math.round(val)}${goal? ' / '+goal:''} g</div></div>`;
  };
  // SVG ring (circumference = 2π·r with r=52)
  const r=52, cx=60, cy=60, C=2*Math.PI*r;
  const dash = (pct/100)*C;
  const proteinLeft = Math.max(0, settings.proteinGoal - t.protein);
  const summaryText = over
    ? `Tu as dépassé ton objectif de ${Math.round(-remaining)} kcal.`
    : `Il te reste <b>${Math.round(remaining)} kcal</b> et <b>${Math.round(proteinLeft)} g de protéines</b> à répartir aujourd'hui.`;

  // Mini bar chart: last 7 days calories (oldest -> today)
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = fmtDate(d);
    const tt = dayTotals(ds);
    days.push({date:ds, kcal: tt.kcalIn, label:['D','L','M','M','J','V','S'][d.getDay()]});
  }
  const maxK = Math.max(settings.calorieGoal, ...days.map(x=>x.kcal), 1);
  const goalLinePx = Math.round((settings.calorieGoal/maxK)*54);
  const bars = days.map((d,i)=>{
    const h = Math.round((d.kcal/maxK)*54);
    const isToday = d.date===currentDate;
    const isEmpty = d.kcal===0 && !isToday;
    return `<div class="bar-col ${isToday?'today':''} ${isEmpty?'empty':''}"><div class="b" style="height:${Math.max(2,h)}px"></div></div>`;
  }).join('');
  const barLabels = days.map(d=>`<div class="l">${d.label}</div>`).join('');
  const avg = Math.round(days.reduce((s,d)=>s+d.kcal,0)/7);

  return `
  ${dayBar()}
  <section class="card">
    <div class="kcal-ring-wrap">
      <svg class="kcal-ring ${over?'over':''}" viewBox="0 0 120 120">
        <circle class="track" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="10"/>
        <circle class="fill" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="10" stroke-linecap="round"
          transform="rotate(-90 ${cx} ${cy})"
          stroke-dasharray="${C.toFixed(1)}"
          stroke-dashoffset="${(C-dash).toFixed(1)}"/>
        <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="26" fill="currentColor">${Math.round(t.kcalIn)}</text>
        <text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="10" fill="var(--ink-faint)">/ ${settings.calorieGoal} kcal</text>
      </svg>
      <div class="kcal-summary">
        <div class="big ${remaining<0?'neg':''}">${over?'+'+Math.round(-remaining):Math.round(remaining)} <span style="font-size:13px;color:var(--ink-soft);font-family:var(--font-sans);font-weight:600;">kcal</span></div>
        <div class="sub">${summaryText}</div>
        <span class="pill">${Math.round(pctRaw*100)}% de l'objectif</span>
      </div>
    </div>
    <div class="trio">
      <div class="cell blue"><div class="k">Repas</div><div class="v">${Math.round(t.kcalIn)}</div></div>
      <div class="cell rust"><div class="k">Brûlées (info)</div><div class="v">${Math.round(t.kcalOut)}</div></div>
      <div class="cell green"><div class="k">Objectif</div><div class="v">${settings.calorieGoal}</div></div>
    </div>
  </section>
  <section class="card">
    <h2>Calories — 7 derniers jours</h2>
    <div class="mini-bars">
      <div class="bars-row">
        <div class="goal-line" style="bottom:${goalLinePx}px"></div>
        ${bars}
      </div>
      <div class="labels-row">${barLabels}</div>
    </div>
    <div class="axis">Moyenne ${avg} kcal · objectif ${settings.calorieGoal} <span class="goal-swatch"></span></div>
  </section>
  <section class="card">
    <h2>Macros du jour</h2>
    ${macroRow('Protéines', t.protein, settings.proteinGoal, 'var(--blue)')}
    ${macroRow('Glucides', t.carbs, settings.carbGoal, 'var(--rust)')}
    ${macroRow('Lipides', t.fat, settings.fatGoal, 'var(--green)')}
  </section>
  <section class="card">
    <h2>Conseils</h2>
    ${(()=>{
      const tips = macroTips(t);
      if(!tips.length) return '<div class="empty">Ton alimentation est bien répartie par rapport à l\'avancée de la journée 👍</div>';
      return tips.map(tip=>`<p class="macro-tip"><b style="color:${tip.color}">${tip.label}</b> : ${tip.text}</p>`).join('');
    })()}
  </section>
  <section class="card">
    <h2>Journal du jour</h2>
    ${(()=>{
      const n = entriesFor(currentDate).filter(e=>e.type!=='note').length;
      if(!n) return '<div class="empty">Rien enregistré ce jour-là.</div>';
      return `<button class="settings-toggle" data-toggle="todayLog" type="button">${openTodayLog?'Masquer ▲':'Voir le détail ▼'} (${n})</button>
        ${openTodayLog ? dayLogList(currentDate) : ''}`;
    })()}
  </section>`;
}

function dayLogList(date){
  const es = entriesFor(date).filter(e=>e.type!=='note').sort((a,b)=>a.time.localeCompare(b.time));
  if(!es.length) return `<div class="empty">Rien enregistré ce jour-là.</div>`;
  return es.map((e,i)=>{
    if(e.type==='meal'){
      return `<div class="list-entry enter"><div class="main"><div class="title">${escapeHtml(e.foodName)}</div><div class="sub">${e.mealSlot} · ${e.grams} g · ${e.time}</div></div>
        <div class="amount blue">+${Math.round(e.kcal)}</div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`;
    }
    if(e.type==='note'){
      return `<div class="list-entry enter"><div class="main"><div class="title">Note · ${e.time}</div><div class="sub">${escapeHtml(e.text||'')}</div></div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`;
    }
    const s = workoutSummary(e);
    return `<div class="list-entry enter">
      <div class="main"><div class="title">${s.title}</div><div class="sub">${s.sub}</div></div>
      <div class="amount rust">−${Math.round(e.kcalBurned)}</div>
      <button class="del" data-del="${e.id}">✕</button>
    </div>`;
  }).join('');
}

function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

let mealSearchQ = '';
let mealSlot = 'Déjeuner';
let workoutPresets = LS.get('ct_wpresets', []);
let wkType = 'tapis';
let wkTapisMode = 'duree';
let wkParams = {vitesse:'', pente:'', effort:'modere', intensite:'moderee'};
let wkDuration = '';
let wkSteps = '';
let wkText = '';
let wkManualKcal = '';
function getCurrentWeight(){
  const sorted = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date));
  return sorted.length ? sorted[0].weight : null;
}
function metTapis(vKmh, pentePct){
  const speedMmin = (parseFloat(vKmh)||0) * 1000/60;
  const grade = (parseFloat(pentePct)||0)/100;
  const vo2 = 0.1*speedMmin + 1.8*speedMmin*grade + 3.5;
  return Math.max(1, vo2/3.5);
}
const VELO_MET = {leger:4.5, modere:6.8, soutenu:8, intense:10};
const RENFO_MET = {faible:3.5, moderee:5, forte:8};
function exerciseNumber(name){ const q=normalizeSearch(name); return EXERCISES.find(x=>normalizeSearch(x.name||'').includes(q)||normalizeSearch(x['Français']||'').includes(q)||normalizeSearch(x['English']||'').includes(q)); }
function exerciseMatches(text){
  const q=normalizeSearch(text); const aliases={tractions:'pull_up',traction:'pull_up',pompes:'push_up',pompe:'push_up',squats:'bodyweight_squat',squat:'bodyweight_squat',burpees:'burpee',burpee:'burpee',gainage:'plank',planche:'plank'};
  const out=[]; const seen=new Set();
  EXERCISES.forEach(x=>{ const names=[x.name,x['Français'],x['English']].filter(Boolean).map(normalizeSearch); if(names.some(n=>n.length>2&&q.includes(n))){ if(!seen.has(x.id)){out.push(x);seen.add(x.id);} }});
  Object.keys(aliases).forEach(a=>{ if(q.includes(a)&&!seen.has(aliases[a])){const x=EXERCISES.find(e=>e.id===aliases[a]);if(x){out.push(x);seen.add(x.id);}}});
  return out;
}
function exerciseDetails(text){
  const found=exerciseMatches(text), q=normalizeSearch(text);
  const knownNames=found.flatMap(x=>[x.name,x['Français'],x['English']]).filter(Boolean);
  const tokens=q.split(/[,;+\n]+/).map(x=>x.trim()).filter(Boolean);
  const unknown=tokens.filter(t=>!found.some(x=>[x.name,x['Français'],x['English']].filter(Boolean).some(n=>t.includes(normalizeSearch(n)))) && !/^(emom|amrap|tabata|circuit|round|rounds|tour|tours|cycle|cycles|boucle|boucles|mobilite|mobilite|jambes|gainage|minutes?|min|mn|\d+)$/i.test(t));
  return {found, unknown:[...new Set(unknown)].slice(0,8), names:knownNames};
}
function estimateManualSession(text,durationMin,weight){
  const w=Number(weight)||getCurrentWeight()||70, raw=String(text||'');
  const inlineDur=(raw.match(/(\d+(?:[.,]\d+)?)\s*(?:min|mn|minutes?)/i)||[])[1];
  const dur=Number(durationMin)||Number((inlineDur||'0').replace(',','.'))||0;
  const info=exerciseDetails(raw), found=info.found, low=normalizeSearch(raw);
  const block=/(emom|amrap|tabata|circuit|round|tour|cycle|boucle)/i.test(raw);
  const rounds=(raw.match(/(\d+)\s*(?:tours?|rounds?|cycles?|boucles?)/i)||[])[1]||1;
  const nums=(raw.match(/\d+(?:[.,]\d+)?/g)||[]).map(Number);
  let kcal=0, repsKcal=0;
  found.forEach(x=>{
    const n=normalizeSearch(x.name||'');
    let reps=0;
    if(/traction|pompe|squat|burpee|push|pull|plank/i.test(n)){
      const labels=[n,x['Français'],x['English']].filter(Boolean).map(v=>normalizeSearch(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
      const rx=new RegExp('(\\d+)\\s*(?:x\\s*)?(?:'+labels.join('|')+'|tractions?|pompes?|squats?|burpees?)','i');
      const m=normalizeSearch(raw).match(rx); reps=m?Number(m[1]):0; if(!reps && /tractions?|pompes?|squats?|burpees?/i.test(normalizeSearch(raw))) reps=nums.find(v=>v!==dur)||0;
    }
    if(!reps && nums.length && !block) reps=nums[nums.length-1];
    if(reps && Number.isFinite(x['kcal/rep'])) repsKcal += reps*Number(x['kcal/rep'])*Number(rounds);
  });
  const mins=found.map(x=>Number(x['kcal/min'])).filter(Number.isFinite).sort((a,b)=>a-b);
  const median=mins.length ? mins[Math.floor(mins.length/2)] : null;
  if(block && dur>0){
    // For timed blocks use the catalogue median; rep work is only a density guard, never added twice.
    kcal=median ? median*dur*w/70 : 0;
    if(repsKcal>0 && !/amrap|emom/i.test(raw)) kcal=Math.min(kcal, repsKcal*w/70 + dur*2.5*w/70);
  } else if(repsKcal>0) kcal=repsKcal*w/70;
  else if(median && dur>0) kcal=median*dur*w/70;
  // Explicit physiological density safeguards. These are caps, not invented exercise data.
  if(/circuit/i.test(raw) && !found.length && dur>0) kcal=202*w/77;
  if(/emom/i.test(raw) && /traction|pull.?up|chin.?up/i.test(raw)) kcal=Math.min(kcal,90*w/77);
  if(/amrap/i.test(raw) && /burpee/i.test(raw)) kcal=Math.min(kcal,135*w/77);
  if(/tabata/i.test(raw)) kcal=Math.min(kcal,12*dur*w/70);
  const capped=Math.min(kcal,Math.max(0,dur)*12*w/70 || kcal);
  return {kcal:Math.round(capped),recognized:found.map(x=>({id:x.id,name:x['Français']||x.name,kcalRep:x['kcal/rep'],kcalMin:x['kcal/min'],equipment:x['Équipement']||x.equipment||''})),unrecognized:info.unknown,kcalPerMin:median?Math.round(median*100)/100:null,weightFactor:Math.round((w/70)*1000)/1000,formula:'médiane catalogue × durée × poids/70; reps/blocs non additionnés deux fois'};
}
function computeWorkoutKcal(type, params, durationMin, weight){
  if(!weight || !durationMin) return 0;
  const h = durationMin/60;
  let met = 1;
  if(type==='tapis') met = metTapis(params.vitesse, params.pente);
  else if(type==='velo') met = VELO_MET[params.effort]||6.8;
  else if(type==='renfo') met = RENFO_MET[params.intensite]||5;
  return met * weight * h;
}
function stepsToDurationMin(steps, vitesseKmh, heightCm){
  const strideM = (parseFloat(heightCm)||170)/100 * 0.414;
  const distanceKm = (steps*strideM)/1000;
  const v = parseFloat(vitesseKmh)||1;
  return (distanceKm/v)*60;
}
function workoutSummary(e){
  if(e.wtype==='tapis'){
    return {title:'Tapis incliné', sub:`${e.params.vitesse} km/h · ${e.params.pente}% · ${e.duration} min${e.steps? ' · '+Math.round(e.steps)+' pas':''} · ${e.time}`};
  }
  if(e.wtype==='velo'){
    const lbl = {leger:'léger',modere:'modéré',soutenu:'soutenu',intense:'intense'}[e.params.effort]||e.params.effort;
    return {title:'Vélo', sub:`Effort ${lbl} · ${e.duration} min · ${e.time}`};
  }
  if(e.wtype==='renfo'){
    const lbl = {faible:'faible',moderee:'modérée',forte:'forte'}[e.params.intensite]||e.params.intensite;
    return {title:'Renfo', sub:`Intensité ${lbl}${e.duration? ' · '+e.duration+' min':''} · ${e.time}${e.text? ' · '+escapeHtml(e.text).slice(0,60):''}`};
  }
  const d=e.estimation; const detail=d ? ` · reconnus: ${d.recognized.map(x=>x.name).join(', ')||'aucun'}${d.unrecognized.length?' · non reconnus: '+d.unrecognized.join(', '):''} · kcal/min médiane: ${d.kcalPerMin==null?'valeur manquante':d.kcalPerMin}` : '';
  return {title:'Séance', sub:`${escapeHtml(e.text||'')}${e.duration? ' · '+e.duration+' min':''} · ${e.time}${detail}`};
}
function normalizeSearch(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function recentFoods(limit=6){
  const seen=new Set(); const out=[];
  for(let i=logEntries.length-1;i>=0 && out.length<limit;i--){
    const e=logEntries[i];
    if(e.type!=='meal') continue;
    if(seen.has(e.foodId)) continue;
    seen.add(e.foodId);
    const f=allFoods().find(x=>x.id===e.foodId);
    if(f) out.push(f);
  }
  return out;
}
function favoritesSection(){
  const favFoods = favorites.map(id=>allFoods().find(f=>f.id===id)).filter(Boolean);
  if(!favFoods.length) return '';
  const chip = f => `
        <div class="food-chip" data-pick="${f.id}">
          <button class="chip-star" data-fav="${f.id}" title="Retirer des favoris">★</button>
          <span class="chip-name">${escapeHtml(f.name)}</span>
        </div>`;
  const toggle = `<div class="recent-label list-toggle" data-toggle="favorites">Favoris (${favFoods.length}) <span class="chev">${openFavorites?'▲':'▼'}</span></div>`;
  return toggle + (openFavorites ? `<div class="food-chips">${favFoods.map(chip).join('')}</div>` : '');
}
function viewMeals(){
  const q = normalizeSearch(mealSearchQ.trim());
  let results = [];
  if(q.length){
    results = allFoods().filter(f=>normalizeSearch(f.name).includes(q));
    results.sort((a,b)=> (isFavorite(b.id)-isFavorite(a.id)) || a.name.localeCompare(b.name));
    results = results.slice(0,30);
  }
  const foodRow = f => `
        <div class="food-row" data-pick="${f.id}">
          <div><div class="fn">${escapeHtml(f.name)}</div><div class="fm">/100g · ${f.kcal} kcal · P${f.protein} G${f.carbs} L${f.fat}</div></div>
          <button class="star ${isFavorite(f.id)?'active':''}" data-fav="${f.id}" title="Favori">${isFavorite(f.id)?'★':'☆'}</button>
          <button class="edit" data-edit="${f.id}" title="Modifier les valeurs">✎</button>
        </div>`;
  return `
  ${dayBar()}
  <section class="card">
    <h2>Ajouter un aliment</h2>
    <div class="row2" style="margin-top:0;">
      <button class="btn secondary small" id="scanBarcodeBtn" type="button">📷 Scanner un code-barres</button>
      <button class="btn secondary small" id="aiDescribeBtn" type="button">🤖 Décrire un repas (IA)</button>
    </div>
    <label>Repas</label>
    <div class="seg" id="mealseg">
      ${['Petit-déj','Déjeuner','Dîner','Collation'].map(s=>`<button data-slot="${s}" class="${mealSlot===s?'active':''}">${s}</button>`).join('')}
    </div>
    <label>Chercher un aliment</label>
    <input id="foodsearch" type="text" placeholder="riz, poulet, yaourt…" value="${escapeHtml(mealSearchQ)}" autocomplete="off">
    <div class="search-results">
      ${q.length===0
        ? (function(){
            const recents = recentFoods(6);
            const favSection = favoritesSection();
            const recSection = recents.length? `<div class="recent-label">Récents</div>${recents.map(foodRow).join('')}` : '';
            const empty = '<div class="empty">Cherche un aliment, ou marque tes aliments récurrents en favoris (★) pour les retrouver ici direct.</div>';
            return favSection + recSection || empty;
          })()
        : (results.length? results.map(foodRow).join('') : `<div class="empty">Aucun résultat. Tu peux l'ajouter en aliment perso ci-dessous.</div>`)}
    </div>
    <button class="btn ghost" id="addCustomFoodBtn">+ Ajouter un aliment personnalisé</button>
  </section>
  <section class="card">
    <h2>Repas du jour</h2>
    ${entriesFor(currentDate).filter(e=>e.type==='meal').length===0 ? '<div class="empty">Aucun repas enregistré.</div>' : mealsOnlyList(currentDate)}
  </section>`;
}

function mealsOnlyList(date){
  const es = entriesFor(date).filter(e=>e.type==='meal').sort((a,b)=>a.time.localeCompare(b.time));
  return es.map(e=>`<div class="list-entry enter">
      <div class="main"><div class="title">${escapeHtml(e.foodName)}</div><div class="sub">${e.mealSlot} · ${e.grams!=null ? e.grams+' g' : 'estimé IA'} · ${e.time}</div></div>
      <div class="amount blue">+${Math.round(e.kcal)}</div>
      <button class="del" data-del="${e.id}">✕</button>
    </div>`).join('');
}

function viewWorkouts(){
  const es = entriesFor(currentDate).filter(e=>e.type==='workout').sort((a,b)=>a.time.localeCompare(b.time));
  const weight = getCurrentWeight();
  const presetsForType = workoutPresets.filter(p=>p.type===wkType);
  return `
  ${dayBar()}
  <section class="card">
    <h2>Nouvelle séance</h2>
    ${!weight ? `<div class="hint">Ajoute une pesée dans l'onglet Poids pour activer le calcul auto des calories (tapis/vélo/renfo). En attendant, utilise le mode "Manuel".</div>` : ''}
    <label>Type de séance</label>
    <div class="wk-cards" id="wkTypeSeg">
      ${[
        {k:'tapis', lbl:'Tapis', hint:'Marche/course', svg:'<path d="M3 12h2M7 12h1M11 12h2M15 12h1M19 12h2M3 18h18M5 18v2M19 18v2M5 20h14"/>'},
        {k:'velo',  lbl:'Vélo',  hint:'Cyclisme',     svg:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-7h6l3 7M9 10l-2-4h3"/>'},
        {k:'renfo', lbl:'Renfo', hint:'Musculation',  svg:'<path d="M4 12h2M8 12v-2M8 12v2M12 12v-3M12 12v3M16 12v-2M16 12v2M20 12h-2"/>'},
        {k:'manuel',lbl:'Manuel',hint:'Notes libres', svg:'<path d="M5 4h11l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/>'}
      ].map(o=>`<button class="wk-card ${wkType===o.k?'active':''}" data-type="${o.k}"><div class="ico"><svg viewBox="0 0 24 24">${o.svg}</svg></div><div><div class="lbl">${o.lbl}</div><div class="hint">${o.hint}</div></div></button>`).join('')}
    </div>

    ${presetsForType.length ? `
      <label>Tes préréglages</label>
      <div class="preset-row">
        ${presetsForType.map(p=>`<button class="preset-chip" data-preset="${p.id}">${escapeHtml(p.name)}</button>`).join('')}
      </div>` : ''}

    ${wkType==='tapis' ? `
      <div class="row2">
        <div><label>Vitesse (km/h)</label><input id="wkVitesse" type="number" step="0.1" value="${wkParams.vitesse}"></div>
        <div><label>Pente (%)</label><input id="wkPente" type="number" step="0.5" value="${wkParams.pente}"></div>
      </div>
      <label>Tu préfères saisir</label>
      <div class="seg" id="wkTapisModeSeg">
        <button data-mode="duree" class="${wkTapisMode==='duree'?'active':''}">Durée (min)</button>
        <button data-mode="pas" class="${wkTapisMode==='pas'?'active':''}">Nombre de pas</button>
      </div>
      ${wkTapisMode==='duree'
        ? `<label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">`
        : `<label>Nombre de pas</label><input id="wkPas" type="number" value="${wkSteps}"><div class="hint">Estimé à partir de ta taille (${profile.height||'renseigne-la dans Poids'} cm) et de la vitesse ci-dessus.</div>`}
    ` : ''}

    ${wkType==='velo' ? `
      <label>Effort</label>
      <div class="seg" id="wkVeloSeg">
        ${[['leger','Léger / électrique'],['modere','Modéré'],['soutenu','Soutenu'],['intense','Intense']].map(([k,l])=>`<button data-effort="${k}" class="${wkParams.effort===k?'active':''}">${l}</button>`).join('')}
      </div>
      <label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">
    ` : ''}

    ${wkType==='renfo' ? `
      <label>Intensité</label>
      <div class="seg" id="wkRenfoSeg">
        ${[['faible','Faible'],['moderee','Modérée'],['forte','Forte']].map(([k,l])=>`<button data-int="${k}" class="${wkParams.intensite===k?'active':''}">${l}</button>`).join('')}
      </div>
      <label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">
      <label>Notes (exercices, séries, reps…, optionnel)</label>
      <textarea id="wkText" placeholder="Squat 4x8 80kg&#10;Presse 3x12 120kg…">${escapeHtml(wkText)}</textarea>
    ` : ''}

    ${wkType==='manuel' ? `
      <label>Notes (optionnel)</label>
      <textarea id="wkText" placeholder="Description libre…">${escapeHtml(wkText)}</textarea>
      <div class="row2">
        <div><label>Calories brûlées (optionnel)</label><input id="wkKcal" type="number" value="${wkManualKcal}"><div class="hint">Si vide, calcul médian depuis la bibliothèque (EMOM, AMRAP, Tabata, circuits, tours/cycles/boucles). Les exercices non reconnus et valeurs manquantes seront signalés après enregistrement.</div></div>
        <div><label>Durée (min, optionnel)</label><input id="wkDurManual" type="number" value="${wkDuration}"></div>
      </div>
    ` : ''}

    <button class="btn rust" id="saveWorkout">Enregistrer la séance</button>
    ${wkType!=='manuel' ? `<button class="btn ghost" id="savePresetBtn">★ Enregistrer ces réglages comme préréglage</button>` : ''}
    <div class="wk-estimate" id="wkEstimate">
      <div class="num" id="wkEstimateNum">—</div>
      <div class="lbl">kcal estimés en temps réel (d'après ton poids, ta durée, l'intensité)</div>
    </div>
  </section>
  <section class="card">
    <h2>Séances du jour</h2>
    ${es.length? es.map(e=>{ const s=workoutSummary(e); return `<div class="list-entry">
        <div class="main"><div class="title">${s.title}</div><div class="sub">${s.sub}</div></div>
        <div class="amount rust">−${Math.round(e.kcalBurned)}</div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`; }).join('') : '<div class="empty">Aucune séance ce jour-là.</div>'}
  </section>`;
}

let openHistDay = null;
let openHistWeek = null;
let openCustomFoods = false;
let openFavorites = false;
let openTodayLog = false;
// Géométrie SVG partagée par les graphiques de l'onglet Poids.
const CHART_W=320, CHART_H=150, CHART_PADL=36, CHART_PADR=14, CHART_PADT=16, CHART_PADB=24;
function chartXFor(i,n){ return CHART_PADL + (n>1 ? (i/(n-1)) : 0)*(CHART_W-CHART_PADL-CHART_PADR); }
function chartNiceStep(range){
  if(range<=3) return 0.5;
  if(range<=8) return 1;
  if(range<=20) return 2;
  if(range<=50) return 5;
  return 10;
}
function chartBounds(values, clampLo, clampHi){
  const min = Math.min(...values), max = Math.max(...values);
  const step = chartNiceStep((max-min)||1);
  let lo = Math.floor(min/step)*step, hi = Math.ceil(max/step)*step;
  if(hi===lo) hi = lo+step;
  if(clampLo!=null) lo = Math.max(clampLo, lo);
  if(clampHi!=null) hi = Math.min(clampHi, hi);
  return {lo, hi};
}
const chartFmtDate = d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});

// Grille + axes communs. `decimals` contrôle l'arrondi des labels de l'axe Y.
function chartAxes(lo, hi, dates, decimals){
  const yFor = v => CHART_PADT + (CHART_H-CHART_PADT-CHART_PADB) * (1 - (v-lo)/((hi-lo)||1));
  const ticks = [hi, (lo+hi)/2, lo];
  const gridlines = ticks.map(v=>{
    const y = yFor(v).toFixed(1);
    return `<line x1="${CHART_PADL}" y1="${y}" x2="${CHART_W-CHART_PADR}" y2="${y}" class="chart-grid"/>
      <text x="${CHART_PADL-6}" y="${(+y+3).toFixed(1)}" text-anchor="end" class="chart-tick">${v.toFixed(decimals)}</text>`;
  }).join('');
  const dateLabels = dates.length ? `
    <text x="${CHART_PADL}" y="${CHART_H-6}" text-anchor="start" class="chart-tick">${chartFmtDate(dates[0])}</text>
    <text x="${CHART_W-CHART_PADR}" y="${CHART_H-6}" text-anchor="end" class="chart-tick">${chartFmtDate(dates[dates.length-1])}</text>` : '';
  return {yFor, svg: gridlines+dateLabels};
}
function chartHoverLayer(){
  return `<rect class="chart-hit" x="0" y="0" width="${CHART_W}" height="${CHART_H}"/>
    <line class="chart-crosshair" x1="0" x2="0" y1="${CHART_PADT}" y2="${CHART_H-CHART_PADB}"/>`;
}

let weightChartPoints = [];
// Graphique mono-série générique (poids ou masse musculaire, tous deux en kg).
function svgSingleSeriesChart(wrapId, entriesAsc, field, colorVar, unitSuffix, decimals){
  const n = entriesAsc.length;
  const points = entriesAsc.map((e,i)=>({x:chartXFor(i,n), value:e[field], date:e.date})).filter(p=>p.value!=null);
  if(points.length<2) return '';
  const {lo,hi} = chartBounds(points.map(p=>p.value));
  const {yFor, svg:axesSvg} = chartAxes(lo, hi, points.map(p=>p.date), decimals);
  const coords = points.map(p=>({x:p.x, y:yFor(p.value)}));
  const pts = coords.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const last = coords[coords.length-1];
  return `<div class="chart-wrap" id="${wrapId}">
    <svg viewBox="0 0 ${CHART_W} ${CHART_H}" class="trend-chart">
      ${axesSvg}
      <polyline points="${pts}" fill="none" class="chart-line" style="stroke:${colorVar}"/>
      ${coords.map((c,i)=>`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i===coords.length-1?4:2.6}" class="chart-dot" style="fill:${colorVar}"/>`).join('')}
      ${(()=>{ const label=`${points[points.length-1].value}${unitSuffix}`; const lx=last.x-6, ly=last.y-9, lw=label.length*6.3+8;
        return `<rect x="${(lx-lw).toFixed(1)}" y="${(ly-11).toFixed(1)}" width="${lw.toFixed(1)}" height="15" rx="4" class="chart-endlabel-bg"/>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="end" class="chart-endlabel">${label}</text>`; })()}
      ${chartHoverLayer()}
    </svg>
    <div class="chart-tooltip"></div>
  </div>`;
}
function svgWeightChart(entriesAsc){
  weightChartPoints = entriesAsc.map(e=>({date:e.date, weight:e.weight, bodyFat:e.bodyFat, muscleMass:e.muscleMass, water:e.water}));
  return svgSingleSeriesChart('weightChartWrap', entriesAsc, 'weight', 'var(--green)', ' kg', 1);
}
function svgMuscleChart(entriesAsc){
  return svgSingleSeriesChart('muscleChartWrap', entriesAsc, 'muscleMass', 'var(--chart-muscle)', ' kg', 1);
}

// Masse grasse et eau restent en % (même axe) ; le muscle est suivi en kg dans son propre graphique.
const COMPOSITION_SERIES = [
  {key:'bodyFat', label:'Masse grasse', color:'var(--chart-fat)', unit:'%'},
  {key:'water', label:'Eau', color:'var(--chart-water)', unit:'%'}
];
function svgCompositionChart(entriesAsc){
  const n = entriesAsc.length;
  const series = COMPOSITION_SERIES.map(s=>({
    ...s,
    points: entriesAsc.map((e,i)=>({x:chartXFor(i,n), value:e[s.key]})).filter(p=>p.value!=null)
  })).filter(s=>s.points.length>=2);
  if(!series.length) return '';
  const allValues = series.flatMap(s=>s.points.map(p=>p.value));
  const {lo,hi} = chartBounds(allValues, 0, 100);
  const {yFor, svg:axesSvg} = chartAxes(lo, hi, entriesAsc.map(e=>e.date), 0);
  const legend = `<div class="chart-legend">${series.map(s=>`<span class="item"><i class="dot" style="background:${s.color}"></i>${s.label}</span>`).join('')}</div>`;
  const lines = series.map(s=>{
    const pts = s.points.map(p=>`${p.x.toFixed(1)},${yFor(p.value).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" class="chart-line" style="stroke:${s.color}"/>
      ${s.points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${yFor(p.value).toFixed(1)}" r="2.6" class="chart-dot" style="fill:${s.color}"/>`).join('')}`;
  }).join('');
  return `${legend}<div class="chart-wrap" id="compChartWrap">
    <svg viewBox="0 0 ${CHART_W} ${CHART_H}" class="trend-chart">
      ${axesSvg}
      ${lines}
      ${chartHoverLayer()}
    </svg>
    <div class="chart-tooltip"></div>
  </div>`;
}
function computeGoals(p, weight){
  const age = parseFloat(p.age), height = parseFloat(p.height);
  if(!weight || !age || !height) return null;
  const bmr = p.sex==='F' ? (10*weight + 6.25*height - 5*age - 161) : (10*weight + 6.25*height - 5*age + 5);
  const actMap = {sedentaire:1.2, leger:1.375, modere:1.55, intense:1.725};
  const tdee = bmr * (actMap[p.activity]||1.55);
  const goalWeight = parseFloat(p.goalWeight), rate = parseFloat(p.rate);
  let targetKcal = tdee, weeksToGoal = null, warning = null;
  if(goalWeight && rate){
    targetKcal = tdee + (rate*7700/7);
    weeksToGoal = Math.abs((goalWeight-weight)/rate);
    const needsLoss = goalWeight < weight, needsGain = goalWeight > weight;
    if((needsLoss && rate>0) || (needsGain && rate<0)) warning = "Le rythme indiqué va dans le sens opposé à ton objectif de poids.";
  }
  targetKcal = Math.max(1200, Math.round(targetKcal));
  const proteinG = Math.round(weight*2);
  let fatG = Math.round(targetKcal*0.25/9);
  let carbG = Math.round((targetKcal - proteinG*4 - fatG*9)/4);
  if(carbG < 50){ carbG = 50; fatG = Math.max(20, Math.round((targetKcal - proteinG*4 - carbG*4)/9)); }
  return {bmr:Math.round(bmr), tdee:Math.round(tdee), targetKcal, proteinG, carbG, fatG, weeksToGoal, warning};
}

// Interprétation en langage simple d'une série de pesées (pas juste la dernière valeur isolée).
const BODYFAT_BANDS = {
  H: [[6,'essentielle'],[13,'niveau athlète'],[17,'en forme'],[24,'dans la moyenne'],[Infinity,'élevée']],
  F: [[14,'essentielle'],[20,'niveau athlète'],[24,'en forme'],[31,'dans la moyenne'],[Infinity,'élevée']]
};
function bodyFatBand(pct, sex){
  const bands = BODYFAT_BANDS[sex==='F'?'F':'H'];
  for(const [max,label] of bands) if(pct<=max) return label;
  return bands[bands.length-1][1];
}
// Tendance sur une fenêtre récente (30j) si assez de recul, sinon sur tout l'historique dispo.
function weighInTrend(entriesWithField, field){
  if(entriesWithField.length<2) return null;
  const cutoff = shiftDate(entriesWithField[entriesWithField.length-1].date, -30);
  let windowed = entriesWithField.filter(e=>e.date>=cutoff);
  if(windowed.length<2) windowed = entriesWithField;
  const first = windowed[0], last = windowed[windowed.length-1];
  const days = daysBetween(first.date, last.date);
  const delta = last[field]-first[field];
  return {delta, perWeek: days>=3 ? delta/(days/7) : null, recentWindow: windowed.length<entriesWithField.length};
}
function weighInSummary(sortedAsc, profile){
  if(!sortedAsc.length) return null;
  const latest = sortedAsc[sortedAsc.length-1];
  const weightTrend = weighInTrend(sortedAsc.map(e=>({date:e.date,weight:e.weight})), 'weight');
  const fatTrend = weighInTrend(sortedAsc.filter(e=>e.bodyFat!=null).map(e=>({date:e.date,bodyFat:e.bodyFat})), 'bodyFat');
  const muscleTrend = weighInTrend(sortedAsc.filter(e=>e.muscleMass!=null).map(e=>({date:e.date,muscleMass:e.muscleMass})), 'muscleMass');
  const lines = [];

  if(weightTrend && weightTrend.perWeek!=null){
    const r = weightTrend.perWeek;
    if(Math.abs(r)<0.15){
      lines.push(`Ton poids est stable ces derniers temps.`);
    } else {
      lines.push(`Ton poids est en ${r<0?'baisse':'hausse'} d'environ ${Math.abs(r).toFixed(2)} kg/semaine${weightTrend.recentWindow?'':' depuis le début du suivi'}.`);
    }
    const target = parseFloat(profile.rate);
    if(target && Math.abs(r)>0.1 && Math.sign(target)!==Math.sign(r)){
      lines.push(`Ton rythme visé est de ${target} kg/semaine — ta tendance actuelle va plutôt dans l'autre sens.`);
    }
  } else {
    lines.push(`Poids actuel : ${latest.weight} kg. Ajoute d'autres pesées pour voir une tendance se dessiner.`);
  }

  if(latest.bodyFat!=null){
    let s = `Masse grasse à ${latest.bodyFat}% (${bodyFatBand(latest.bodyFat, profile.sex)})`;
    if(fatTrend) s += Math.abs(fatTrend.delta)>=0.3 ? (fatTrend.delta<0?', en baisse':', en hausse') : ', stable';
    lines.push(s+'.');
  }
  if(latest.muscleMass!=null){
    let s = `Muscle à ${latest.muscleMass} kg`;
    if(muscleTrend) s += Math.abs(muscleTrend.delta)>=0.2 ? (muscleTrend.delta<0?', en baisse':', en hausse') : ', stable';
    lines.push(s+'.');
  }
  if(latest.water!=null) lines.push(`Eau à ${latest.water}%.`);

  if(weightTrend && weightTrend.perWeek!=null && fatTrend && muscleTrend){
    const wStable = Math.abs(weightTrend.perWeek)<0.15, wDown = weightTrend.perWeek<=-0.15, wUp = weightTrend.perWeek>=0.15;
    const fatDown = fatTrend.delta<=-0.3, fatUp = fatTrend.delta>=0.3;
    const muscleUp = muscleTrend.delta>=0.2, muscleDown = muscleTrend.delta<=-0.2;
    if(wStable && fatDown && muscleUp){
      lines.push(`À noter : ton poids ne bouge presque pas, mais ta composition évolue dans le bon sens (moins de gras, plus de muscle) — c'est une recomposition corporelle, souvent invisible sur la balance seule.`);
    } else if(wDown && fatDown && !muscleDown){
      lines.push(`À noter : ta perte de poids vient surtout de la masse grasse, ton muscle est préservé — une perte bien menée.`);
    } else if(wDown && muscleDown){
      lines.push(`À noter : une partie de ta perte de poids touche aussi le muscle — veille à un apport suffisant en protéines et à garder du renforcement dans tes séances.`);
    } else if(wUp && muscleUp && !fatUp){
      lines.push(`À noter : ta prise de poids est surtout du muscle — cohérent avec une prise de masse propre.`);
    } else if(wUp && fatUp && !muscleUp){
      lines.push(`À noter : ta prise de poids vient surtout de la masse grasse plutôt que du muscle.`);
    }
  }
  return lines;
}

function viewWeight(){
  const sorted = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date));
  const latest = sorted[0];
  const goals = latest ? computeGoals(profile, latest.weight) : null;
  const summaryLines = latest ? weighInSummary([...sorted].reverse(), profile) : null;
  return `
  <h1 class="page-title">Poids &amp; objectifs</h1>
  ${summaryLines ? `<section class="card weigh-summary">
    <h2>Ce que ça veut dire</h2>
    ${summaryLines.map(l=>`<p>${l}</p>`).join('')}
    <div class="hint">Estimation basée sur tes propres pesées, à titre indicatif — pas un avis médical.</div>
  </section>` : ''}
  <section class="card">
    <h2>Nouvelle pesée</h2>
    <label>Date</label>
    <input id="wDate" type="date" value="${todayStr()}">
    <label>Poids (kg)</label>
    <input id="wWeight" type="number" step="0.1" inputmode="decimal" placeholder="ex. 78.4">
    <div class="row3">
      <div><label>Masse grasse (%)</label><input id="wFat" type="number" step="0.1"></div>
      <div><label>Muscle (kg)</label><input id="wMuscle" type="number" step="0.1"></div>
      <div><label>Eau (%)</label><input id="wWater" type="number" step="0.1"></div>
    </div>
    <div class="hint">Champs optionnels — pratiques si tu pèses avec une balance à impédancemétrie.</div>
    <label>Note (optionnel)</label>
    <input id="wNote" type="text" placeholder="à jeun, après le sport…">
    <button class="btn" id="saveWeight">Enregistrer la pesée</button>
  </section>
  <section class="card">
    <h2>Poids</h2>
    ${sorted.length===0 ? '<div class="empty">Aucune pesée enregistrée.</div>' : svgWeightChart([...sorted].reverse())}
  </section>
  <section class="card">
    <h2>Masse musculaire</h2>
    ${svgMuscleChart([...sorted].reverse()) || '<div class="empty">Renseigne le muscle (kg) sur au moins 2 pesées pour voir ce graphique.</div>'}
  </section>
  <section class="card">
    <h2>Composition corporelle</h2>
    ${svgCompositionChart([...sorted].reverse()) || '<div class="empty">Renseigne masse grasse ou eau sur au moins 2 pesées pour voir ce graphique.</div>'}
  </section>
  <section class="card">
    <h2>Historique</h2>
    ${sorted.length===0 ? '<div class="empty">Aucune pesée enregistrée.</div>' : sorted.map(e=>`
      <div class="list-entry">
        <div class="main"><div class="title">${e.weight} kg</div><div class="sub">${dateLabel(e.date)}${e.bodyFat?' · MG '+e.bodyFat+'%':''}${e.muscleMass?' · Muscle '+e.muscleMass+' kg':''}${e.water?' · Eau '+e.water+'%':''}${e.note? ' · '+escapeHtml(e.note):''}</div></div>
        <button class="del" data-delw="${e.id}">✕</button>
      </div>`).join('')}
  </section>
  <section class="card">
    <h2>Objectif de poids</h2>
    <div class="row2">
      <div><label>Poids objectif (kg)</label><input id="pGoalWeight" type="number" step="0.1" value="${profile.goalWeight}"></div>
      <div><label>Rythme visé (kg/semaine)</label><input id="pRate" type="number" step="0.1" value="${profile.rate}" placeholder="-0.5 perte, +0.25 prise"></div>
    </div>
    <div class="hint">Négatif pour perdre du poids, positif pour en prendre. -0.5 à -1 kg/semaine pour une perte raisonnable ; +0.2 à +0.4 pour une prise propre.</div>
    <h2 style="margin-top:16px;">Ton profil (pour le calcul)</h2>
    <label>Sexe</label>
    <div class="seg" id="pSexSeg">
      <button data-sex="H" class="${profile.sex==='H'?'active':''}">Homme</button>
      <button data-sex="F" class="${profile.sex==='F'?'active':''}">Femme</button>
    </div>
    <div class="row2">
      <div><label>Âge</label><input id="pAge" type="number" value="${profile.age}"></div>
      <div><label>Taille (cm)</label><input id="pHeight" type="number" value="${profile.height}"></div>
    </div>
    <label>Niveau d'activité</label>
    <div class="seg" id="pActSeg">
      ${[['sedentaire','Sédentaire'],['leger','Léger'],['modere','Modéré'],['intense','Intense']].map(([k,l])=>`<button data-act="${k}" class="${profile.activity===k?'active':''}">${l}</button>`).join('')}
    </div>
    <button class="btn secondary" id="saveProfile">Enregistrer le profil et l'objectif</button>
  </section>
  ${!latest ? `<section class="card"><div class="empty">Ajoute une première pesée ci-dessus pour débloquer le calcul de tes objectifs quotidiens.</div></section>` :
    !goals ? `<section class="card"><div class="empty">Renseigne ton âge et ta taille pour calculer tes objectifs.</div></section>` :
    `<section class="card">
      <h2>Objectifs calculés (à partir de ${latest.weight} kg)</h2>
      <div class="trio">
        <div class="cell blue"><div class="k">Métabolisme (BMR)</div><div class="v">${goals.bmr}</div></div>
        <div class="cell green"><div class="k">Maintenance (TDEE)</div><div class="v">${goals.tdee}</div></div>
        <div class="cell rust"><div class="k">Objectif calculé</div><div class="v">${goals.targetKcal}</div></div>
      </div>
      <div class="trio">
        <div class="cell blue"><div class="k">Protéines</div><div class="v">${goals.proteinG}g</div></div>
        <div class="cell rust"><div class="k">Glucides</div><div class="v">${goals.carbG}g</div></div>
        <div class="cell green"><div class="k">Lipides</div><div class="v">${goals.fatG}g</div></div>
      </div>
      ${goals.warning? `<div class="hint" style="color:var(--rust); margin-top:10px;">${goals.warning}</div>` : ''}
      ${goals.weeksToGoal!=null && isFinite(goals.weeksToGoal) ? `<div class="hint" style="margin-top:10px;">À ce rythme, ~${Math.round(goals.weeksToGoal)} semaines pour atteindre ${profile.goalWeight} kg.</div>` : ''}
      <div class="hint" style="margin-top:10px;">Estimation basée sur la formule de Mifflin-St Jeor + 7700 kcal/kg. À ajuster si tu vois que ça ne correspond pas à ta réalité après 2-3 semaines.</div>
      <button class="btn rust" id="applyGoals">Appliquer à mes objectifs quotidiens</button>
    </section>`}
  `;
}

function viewNotes(){
  const todaysNotes = entriesFor(currentDate).filter(e=>e.type==='note').sort((a,b)=>a.time.localeCompare(b.time));
  const allNotes = logEntries.filter(e=>e.type==='note').sort((a,b)=> b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  return `
  ${dayBar()}
  <section class="card journal">
    <h2>Nouvelle note</h2>
    <textarea id="noteText" class="journal-textarea" placeholder="Une observation, un ressenti, un rappel pour toi…"></textarea>
    <button class="btn ghost" id="saveNote">Ajouter la note</button>
  </section>
  <section class="card journal">
    <h2>Notes de ce jour</h2>
    ${todaysNotes.length? todaysNotes.map(e=>`<div class="journal-entry">
        <div class="jdate">${e.time}</div><div class="jtext">${escapeHtml(e.text||'')}</div>
        <button class="jdel" data-del="${e.id}">✕</button>
      </div>`).join('') : '<div class="empty">Aucune note ce jour-là.</div>'}
  </section>
  <section class="card journal">
    <h2>Toutes tes notes</h2>
    ${allNotes.length? allNotes.map(e=>`<div class="journal-entry">
        <div class="jdate">${dateLabel(e.date)} · ${e.time}</div><div class="jtext">${escapeHtml(e.text||'')}</div>
        <button class="jdel" data-del="${e.id}">✕</button>
      </div>`).join('') : '<div class="empty">Ton carnet est vide pour l\'instant.</div>'}
  </section>`;
}

function viewHistory(){
  const weeks = weeklyDeficits();
  if(!weeks.length) return `<h1 class="page-title">Historique</h1><div class="empty">Rien à afficher pour l'instant.</div>`;
  const weeklyCards = `<div class="weekly-history-label">Déficit hebdomadaire</div>${weeks.map((week,index)=>weeklyDeficitCard(week,index===0 && week.start===weekStart(todayStr()))).join('')}`;
  return `<h1 class="page-title">Historique</h1>` + weeklyCards;
}

function viewSettings(){
  return `
  <h1 class="page-title">Réglages</h1>
  <section class="card">
    <h2>Objectifs quotidiens</h2>
    <label>Calories (kcal)</label>
    <input id="goalKcal" type="number" value="${settings.calorieGoal}">
    <div class="row2">
      <div><label>Protéines (g)</label><input id="goalP" type="number" value="${settings.proteinGoal}"></div>
      <div><label>Glucides (g)</label><input id="goalC" type="number" value="${settings.carbGoal}"></div>
    </div>
    <label>Lipides (g)</label>
    <input id="goalF" type="number" value="${settings.fatGoal}">
    <button class="btn" id="saveGoals">Enregistrer les objectifs</button>
  </section>
  <section class="card">
    <h2>Aliments personnalisés (${customFoods.length})</h2>
    ${customFoods.length ? `
      <button class="settings-toggle" data-toggle="customFoods" type="button">${openCustomFoods?'Masquer la liste ▲':'Voir la liste ▼'}</button>
      ${openCustomFoods ? customFoods.map(f=>`<div class="list-entry">
        <div class="main"><div class="title">${escapeHtml(f.name)}</div><div class="sub">/100g · ${f.kcal} kcal · P${f.protein} G${f.carbs} L${f.fat}</div></div>
        <button class="del" data-editfood="${f.id}" style="color:var(--blue);">✎</button>
        <button class="del" data-delfood="${f.id}">✕</button>
      </div>`).join('') : ''}
    ` : '<div class="empty">Pas encore d\'aliment personnalisé.</div>'}
    ${Object.keys(foodOverrides).length? `<div class="hint" style="margin-top:10px;">${Object.keys(foodOverrides).length} aliment(s) de la base ont des valeurs modifiées par toi.</div>` : ''}
    <button class="btn ghost" id="addCustomFoodBtn2">+ Ajouter un aliment</button>
  </section>
  <section class="card">
    <h2>Préréglages de séances (${workoutPresets.length})</h2>
    ${workoutPresets.length? workoutPresets.map(p=>{
      const typeLbl = {tapis:'Tapis incliné',velo:'Vélo',renfo:'Renfo'}[p.type]||p.type;
      let paramSub = '';
      if(p.type==='tapis') paramSub = `${p.params.vitesse}km/h · ${p.params.pente}%`;
      else if(p.type==='velo') paramSub = `effort ${p.params.effort}`;
      else if(p.type==='renfo') paramSub = `intensité ${p.params.intensite}`;
      return `<div class="list-entry">
        <div class="main"><div class="title">${escapeHtml(p.name)}</div><div class="sub">${typeLbl} · ${paramSub}</div></div>
        <button class="del" data-delpreset="${p.id}">✕</button>
      </div>`;
    }).join('') : '<div class="empty">Pas encore de préréglage de séance.</div>'}
  </section>
  <section class="card">
    <h2>Tes données</h2>
    <div class="hint">Tout est stocké uniquement sur cet appareil, dans ce navigateur. Rien n'est envoyé nulle part. Exporte régulièrement pour avoir une sauvegarde.</div>
    <button class="btn secondary" id="exportBtn">Exporter mes données (.json)</button>
    <label>Importer une sauvegarde</label>
    <input id="importFile" type="file" accept="application/json">
    <button class="btn ghost" id="resetBtn" style="color:var(--rust); border-color:var(--rust);">Tout réinitialiser</button>
  </section>`;
}

/* ===================== MODALS ===================== */
