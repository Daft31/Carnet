/* ===================== DONNÉES ===================== */
// [nom, kcal, protéines, glucides, lipides] — valeurs pour 100 g
function slugify(s){return "b_"+String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
const RAW_FOODS = [{"id":"apple","name_fr":"Pomme","name_en":"Apple","category":"fruits","serving_g":100,"kcal":52,"protein":0.3,"carbs":14,"fat":0.2,"fiber":2.4,"state":"raw"},{"id":"banana","name_fr":"Banane","name_en":"Banana","category":"fruits","serving_g":100,"kcal":89,"protein":1.1,"carbs":23,"fat":0.3,"fiber":2.6,"state":"raw"},{"id":"orange","name_fr":"Orange","name_en":"Orange","category":"fruits","serving_g":100,"kcal":47,"protein":0.9,"carbs":12,"fat":0.1,"fiber":2.4,"state":"raw"},{"id":"strawberry","name_fr":"Fraise","name_en":"Strawberry","category":"fruits","serving_g":100,"kcal":32,"protein":0.7,"carbs":7.7,"fat":0.3,"fiber":2,"state":"raw"},{"id":"blueberry","name_fr":"Myrtille","name_en":"Blueberry","category":"fruits","serving_g":100,"kcal":57,"protein":0.7,"carbs":14,"fat":0.3,"fiber":2.4,"state":"raw"},{"id":"grapes_red","name_fr":"Raisin rouge","name_en":"Red Grapes","category":"fruits","serving_g":100,"kcal":69,"protein":0.7,"carbs":18,"fat":0.2,"fiber":0.9,"state":"raw"},{"id":"watermelon","name_fr":"Pastè·®que","name_en":"Watermelon","category":"fruits","serving_g":100,"kcal":30,"protein":0.6,"carbs":7.6,"fat":0.2,"fiber":0.4,"state":"raw"},{"id":"mango","name_fr":"Mangue","name_en":"Mango","category":"fruits","serving_g":100,"kcal":60,"protein":0.8,"carbs":15,"fat":0.4,"fiber":1.6,"state":"raw"},{"id":"pineapple","name_fr":"Ananas","name_en":"Pineapple","category":"fruits","serving_g":100,"kcal":50,"protein":0.5,"carbs":13,"fat":0.1,"fiber":1.4,"state":"raw"},{"id":"peach","name_fr":"Pê·®che","name_en":"Peach","category":"fruits","serving_g":100,"kcal":39,"protein":0.9,"carbs":9.5,"fat":0.3,"fiber":1.5,"state":"raw"},{"id":"pear","name_fr":"Poire","name_en":"Pear","category":"fruits","serving_g":100,"kcal":57,"protein":0.4,"carbs":15,"fat":0.1,"fiber":3.1,"state":"raw"},{"id":"cherries","name_fr":"Cerises","name_en":"Cherries","category":"fruits","serving_g":100,"kcal":63,"protein":1.1,"carbs":16,"fat":0.2,"fiber":2.1,"state":"raw"},{"id":"kiwi","name_fr":"Kiwi","name_en":"Kiwi","category":"fruits","serving_g":100,"kcal":61,"protein":1.1,"carbs":15,"fat":0.5,"fiber":3,"state":"raw"},{"id":"avocado","name_fr":"Avocat","name_en":"Avocado","category":"fruits","serving_g":100,"kcal":160,"protein":2,"carbs":9,"fat":15,"fiber":7,"state":"raw"},{"id":"grapefruit","name_fr":"Pamplemousse","name_en":"Grapefruit","category":"fruits","serving_g":100,"kcal":42,"protein":0.8,"carbs":11,"fat":0.1,"fiber":1.6,"state":"raw"},{"id":"cantaloupe","name_fr":"Melon cantaloup","name_en":"Cantaloupe","category":"fruits","serving_g":100,"kcal":34,"protein":0.8,"carbs":8,"fat":0.2,"fiber":0.9,"state":"raw"},{"id":"papaya","name_fr":"Papaye","name_en":"Papaya","category":"fruits","serving_g":100,"kcal":43,"protein":0.5,"carbs":11,"fat":0.3,"fiber":1.7,"state":"raw"},{"id":"plum","name_fr":"Prune","name_en":"Plum","category":"fruits","serving_g":100,"kcal":46,"protein":0.7,"carbs":11,"fat":0.3,"fiber":1.4,"state":"raw"},{"id":"apricot","name_fr":"Abricot","name_en":"Apricot","category":"fruits","serving_g":100,"kcal":48,"protein":1.4,"carbs":11,"fat":0.4,"fiber":2,"state":"raw"},{"id":"pomegranate","name_fr":"Grenade","name_en":"Pomegranate","category":"fruits","serving_g":100,"kcal":83,"protein":1.7,"carbs":19,"fat":1.2,"fiber":4,"state":"raw"},{"id":"raspberry","name_fr":"Framboise","name_en":"Raspberry","category":"fruits","serving_g":100,"kcal":52,"protein":1.2,"carbs":12,"fat":0.7,"fiber":6.5,"state":"raw"},{"id":"blackberry","name_fr":"Mure","name_en":"Blackberry","category":"fruits","serving_g":100,"kcal":43,"protein":1.4,"carbs":10,"fat":0.5,"fiber":5,"state":"raw"},{"id":"cranberry_fresh","name_fr":"Canneberge fraî­che","name_en":"Fresh Cranberry","category":"fruits","serving_g":100,"kcal":46,"protein":0.4,"carbs":12,"fat":0.1,"fiber":4.6,"state":"raw"},{"id":"guava","name_fr":"Goyave","name_en":"Guava","category":"fruits","serving_g":100,"kcal":68,"protein":2.6,"carbs":14,"fat":1,"fiber":5.4,"state":"raw"},{"id":"persimmon","name_fr":"Kaki","name_en":"Persimmon","category":"fruits","serving_g":100,"kcal":70,"protein":0.6,"carbs":19,"fat":0.2,"fiber":3.6,"state":"raw"},{"id":"lychee","name_fr":"Litchi","name_en":"Lychee","category":"fruits","serving_g":100,"kcal":66,"protein":0.8,"carbs":17,"fat":0.4,"fiber":1.3,"state":"raw"},{"id":"passion_fruit","name_fr":"Fruit de la passion","name_en":"Passion Fruit","category":"fruits","serving_g":100,"kcal":97,"protein":2.2,"carbs":23,"fat":0.7,"fiber":10,"state":"raw"},{"id":"dragon_fruit","name_fr":"Fruit du dragon","name_en":"Dragon Fruit","category":"fruits","serving_g":100,"kcal":60,"protein":1.2,"carbs":13,"fat":0.4,"fiber":3,"state":"raw"},{"id":"fig_fresh","name_fr":"Figue fraî­che","name_en":"Fresh Fig","category":"fruits","serving_g":100,"kcal":74,"protein":0.8,"carbs":19,"fat":0.3,"fiber":2.9,"state":"raw"},{"id":"date_medjool","name_fr":"Datte Medjool","name_en":"Medjool Date","category":"fruits","serving_g":100,"kcal":277,"protein":1.8,"carbs":75,"fat":0.2,"fiber":6.7,"state":"raw"},{"id":"broccoli_raw","name_fr":"Brocoli cru","name_en":"Raw Broccoli","category":"vegetables","serving_g":100,"kcal":34,"protein":2.8,"carbs":7,"fat":0.4,"fiber":2.6,"state":"raw"},{"id":"broccoli_cooked","name_fr":"Brocoli cuit","name_en":"Cooked Broccoli","category":"vegetables","serving_g":100,"kcal":35,"protein":2.4,"carbs":7,"fat":0.4,"fiber":3.3,"state":"cooked"},{"id":"spinach_raw","name_fr":"É·pinard cru","name_en":"Raw Spinach","category":"vegetables","serving_g":100,"kcal":23,"protein":2.9,"carbs":3.6,"fat":0.4,"fiber":2.2,"state":"raw"},{"id":"spinach_cooked","name_fr":"É·pinard cuit","name_en":"Cooked Spinach","category":"vegetables","serving_g":100,"kcal":23,"protein":3,"carbs":3.8,"fat":0.3,"fiber":2.4,"state":"cooked"},{"id":"carrot_raw","name_fr":"Carotte crue","name_en":"Raw Carrot","category":"vegetables","serving_g":100,"kcal":41,"protein":0.9,"carbs":10,"fat":0.2,"fiber":2.8,"state":"raw"},{"id":"carrot_cooked","name_fr":"Carotte cuite","name_en":"Cooked Carrot","category":"vegetables","serving_g":100,"kcal":35,"protein":0.8,"carbs":8,"fat":0.2,"fiber":2.3,"state":"cooked"},{"id":"tomato_raw","name_fr":"Tomate crue","name_en":"Raw Tomato","category":"vegetables","serving_g":100,"kcal":18,"protein":0.9,"carbs":3.9,"fat":0.2,"fiber":1.2,"state":"raw"},{"id":"cucumber","name_fr":"Concombre","name_en":"Cucumber","category":"vegetables","serving_g":100,"kcal":15,"protein":0.7,"carbs":3.6,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"sweet_potato_raw","name_fr":"Patate douce crue","name_en":"Raw Sweet Potato","category":"vegetables","serving_g":100,"kcal":86,"protein":1.6,"carbs":20,"fat":0.1,"fiber":3,"state":"raw"},{"id":"sweet_potato_baked","name_fr":"Patate douce au four","name_en":"Baked Sweet Potato","category":"vegetables","serving_g":100,"kcal":90,"protein":2,"carbs":21,"fat":0.2,"fiber":3.3,"state":"baked"},{"id":"bell_pepper_red","name_fr":"Poivron rouge","name_en":"Red Bell Pepper","category":"vegetables","serving_g":100,"kcal":31,"protein":1,"carbs":6,"fat":0.3,"fiber":2.1,"state":"raw"},{"id":"lettuce_iceberg","name_fr":"Laitue iceberg","name_en":"Iceberg Lettuce","category":"vegetables","serving_g":100,"kcal":14,"protein":0.9,"carbs":3,"fat":0.1,"fiber":1.2,"state":"raw"},{"id":"cabbage_raw","name_fr":"Chou cru","name_en":"Raw Cabbage","category":"vegetables","serving_g":100,"kcal":25,"protein":1.3,"carbs":6,"fat":0.1,"fiber":2.5,"state":"raw"},{"id":"zucchini_raw","name_fr":"Courgette crue","name_en":"Raw Zucchini","category":"vegetables","serving_g":100,"kcal":17,"protein":1.2,"carbs":3.1,"fat":0.3,"fiber":1,"state":"raw"},{"id":"onion_raw","name_fr":"Oignon cru","name_en":"Raw Onion","category":"vegetables","serving_g":100,"kcal":40,"protein":1.1,"carbs":9.3,"fat":0.1,"fiber":1.7,"state":"raw"},{"id":"garlic","name_fr":"Ail","name_en":"Garlic","category":"vegetables","serving_g":100,"kcal":149,"protein":6.4,"carbs":33,"fat":0.5,"fiber":2.1,"state":"raw"},{"id":"mushroom_white","name_fr":"Champignon blanc","name_en":"White Mushroom","category":"vegetables","serving_g":100,"kcal":22,"protein":3.1,"carbs":3.3,"fat":0.3,"fiber":1,"state":"raw"},{"id":"asparagus_raw","name_fr":"Asperge crue","name_en":"Raw Asparagus","category":"vegetables","serving_g":100,"kcal":20,"protein":2.2,"carbs":3.9,"fat":0.1,"fiber":2.1,"state":"raw"},{"id":"green_beans_raw","name_fr":"Haricots verts crus","name_en":"Raw Green Beans","category":"vegetables","serving_g":100,"kcal":31,"protein":1.8,"carbs":7,"fat":0.1,"fiber":2.7,"state":"raw"},{"id":"peas_green","name_fr":"Petits pois","name_en":"Green Peas","category":"vegetables","serving_g":100,"kcal":81,"protein":5.4,"carbs":14,"fat":0.4,"fiber":5.1,"state":"raw"},{"id":"kale_raw","name_fr":"Chou frisé·® cru","name_en":"Raw Kale","category":"vegetables","serving_g":100,"kcal":49,"protein":4.3,"carbs":9,"fat":0.9,"fiber":3.6,"state":"raw"},{"id":"cauliflower_raw","name_fr":"Chou-fleur cru","name_en":"Raw Cauliflower","category":"vegetables","serving_g":100,"kcal":25,"protein":1.9,"carbs":5,"fat":0.3,"fiber":2,"state":"raw"},{"id":"celery_raw","name_fr":"Cé·®leri cru","name_en":"Raw Celery","category":"vegetables","serving_g":100,"kcal":16,"protein":0.7,"carbs":3,"fat":0.2,"fiber":1.6,"state":"raw"},{"id":"eggplant_raw","name_fr":"Aubergine crue","name_en":"Raw Eggplant","category":"vegetables","serving_g":100,"kcal":25,"protein":1,"carbs":6,"fat":0.2,"fiber":3,"state":"raw"},{"id":"brussels_sprouts_raw","name_fr":"Chou de Bruxelles cru","name_en":"Raw Brussels Sprouts","category":"vegetables","serving_g":100,"kcal":43,"protein":2.8,"carbs":9,"fat":0.3,"fiber":3.8,"state":"raw"},{"id":"beetroot_raw","name_fr":"Betterave crue","name_en":"Raw Beetroot","category":"vegetables","serving_g":100,"kcal":43,"protein":1.6,"carbs":10,"fat":0.2,"fiber":2.8,"state":"raw"},{"id":"radish","name_fr":"Radis","name_en":"Radish","category":"vegetables","serving_g":100,"kcal":16,"protein":0.7,"carbs":3.4,"fat":0.1,"fiber":1.6,"state":"raw"},{"id":"leek_raw","name_fr":"Poireau cru","name_en":"Raw Leek","category":"vegetables","serving_g":100,"kcal":61,"protein":1.5,"carbs":14,"fat":0.3,"fiber":1.8,"state":"raw"},{"id":"artichoke_raw","name_fr":"Artichaut cru","name_en":"Raw Artichoke","category":"vegetables","serving_g":100,"kcal":47,"protein":3.3,"carbs":11,"fat":0.2,"fiber":5.4,"state":"raw"},{"id":"fennel_raw","name_fr":"Fenouil cru","name_en":"Raw Fennel","category":"vegetables","serving_g":100,"kcal":31,"protein":1.2,"carbs":7,"fat":0.2,"fiber":3.1,"state":"raw"},{"id":"bok_choy_raw","name_fr":"Chou de Chine cru","name_en":"Raw Bok Choy","category":"vegetables","serving_g":100,"kcal":13,"protein":1.5,"carbs":2.2,"fat":0.2,"fiber":1,"state":"raw"},{"id":"swiss_chard_raw","name_fr":"Bette à carde crue","name_en":"Raw Swiss Chard","category":"vegetables","serving_g":100,"kcal":22,"protein":1.8,"carbs":3.7,"fat":0.2,"fiber":1.6,"state":"raw"},{"id":"collard_greens_raw","name_fr":"Chou cavalier cru","name_en":"Raw Collard Greens","category":"vegetables","serving_g":100,"kcal":49,"protein":3,"carbs":9,"fat":0.7,"fiber":3.6,"state":"raw"},{"id":"turnip_raw","name_fr":"Navet cru","name_en":"Raw Turnip","category":"vegetables","serving_g":100,"kcal":28,"protein":0.9,"carbs":6.4,"fat":0.1,"fiber":1.8,"state":"raw"},{"id":"parsnip_raw","name_fr":"Panais cru","name_en":"Raw Parsnip","category":"vegetables","serving_g":100,"kcal":75,"protein":1.2,"carbs":18,"fat":0.3,"fiber":4.9,"state":"raw"},{"id":"rutabaga","name_fr":"Chou-rave","name_en":"Rutabaga","category":"vegetables","serving_g":100,"kcal":37,"protein":1.1,"carbs":9,"fat":0.2,"fiber":2.2,"state":"raw"},{"id":"kohlrabi","name_fr":"Chou-rave","name_en":"Kohlrabi","category":"vegetables","serving_g":100,"kcal":27,"protein":1.7,"carbs":6,"fat":0.1,"fiber":3.6,"state":"raw"},{"id":"watercress","name_fr":"Cresson","name_en":"Watercress","category":"vegetables","serving_g":100,"kcal":11,"protein":2.3,"carbs":1.3,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"arugula","name_fr":"Roquette","name_en":"Arugula","category":"vegetables","serving_g":100,"kcal":25,"protein":2.6,"carbs":3.7,"fat":0.7,"fiber":1.6,"state":"raw"},{"id":"endive","name_fr":"Endive","name_en":"Endive","category":"vegetables","serving_g":100,"kcal":17,"protein":1.3,"carbs":3.4,"fat":0.2,"fiber":3.1,"state":"raw"},{"id":"radicchio","name_fr":"Chicoré·®e rouge","name_en":"Radicchio","category":"vegetables","serving_g":100,"kcal":23,"protein":1.4,"carbs":4.5,"fat":0.3,"fiber":1.3,"state":"raw"},{"id":"okra_raw","name_fr":"Gombo cru","name_en":"Raw Okra","category":"vegetables","serving_g":100,"kcal":33,"protein":1.9,"carbs":7,"fat":0.2,"fiber":3.2,"state":"raw"},{"id":"pumpkin_raw","name_fr":"Citrouille crue","name_en":"Raw Pumpkin","category":"vegetables","serving_g":100,"kcal":26,"protein":1,"carbs":6.5,"fat":0.1,"fiber":0.5,"state":"raw"},{"id":"butternut_squash_raw","name_fr":"Courge musqué·®e crue","name_en":"Raw Butternut Squash","category":"vegetables","serving_g":100,"kcal":45,"protein":1,"carbs":12,"fat":0.1,"fiber":2,"state":"raw"},{"id":"chickpeas_cooked","name_fr":"Pois chiches cuits","name_en":"Cooked Chickpeas","category":"legumes","serving_g":100,"kcal":164,"protein":8.9,"carbs":27,"fat":2.6,"fiber":7.6,"state":"cooked"},{"id":"chickpeas_dry","name_fr":"Pois chiches secs","name_en":"Dry Chickpeas","category":"legumes","serving_g":100,"kcal":364,"protein":19,"carbs":61,"fat":6,"fiber":17,"state":"dry"},{"id":"lentils_green_cooked","name_fr":"Lentilles vertes cuites","name_en":"Cooked Green Lentils","category":"legumes","serving_g":100,"kcal":116,"protein":9,"carbs":20,"fat":0.4,"fiber":7.9,"state":"cooked"},{"id":"lentils_green_dry","name_fr":"Lentilles vertes sè·®ches","name_en":"Dry Green Lentils","category":"legumes","serving_g":100,"kcal":353,"protein":25,"carbs":63,"fat":1.1,"fiber":10.7,"state":"dry"},{"id":"black_beans_cooked","name_fr":"Haricots noirs cuits","name_en":"Cooked Black Beans","category":"legumes","serving_g":100,"kcal":132,"protein":8.9,"carbs":24,"fat":0.5,"fiber":8.7,"state":"cooked"},{"id":"kidney_beans_cooked","name_fr":"Haricots rouges cuits","name_en":"Cooked Kidney Beans","category":"legumes","serving_g":100,"kcal":127,"protein":8.7,"carbs":23,"fat":0.5,"fiber":6.4,"state":"cooked"},{"id":"soybeans_cooked","name_fr":"Soja cuit","name_en":"Cooked Soybeans","category":"legumes","serving_g":100,"kcal":173,"protein":17,"carbs":10,"fat":9,"fiber":6,"state":"cooked"},{"id":"edamame_cooked","name_fr":"Edamame cuits","name_en":"Cooked Edamame","category":"legumes","serving_g":100,"kcal":122,"protein":11,"carbs":10,"fat":5.2,"fiber":5.2,"state":"cooked"},{"id":"rice_white_raw","name_fr":"Riz blanc cru","name_en":"Raw White Rice","category":"grains","serving_g":100,"kcal":365,"protein":7.1,"carbs":80,"fat":0.7,"fiber":1.3,"state":"raw"},{"id":"rice_white_cooked","name_fr":"Riz blanc cuit","name_en":"Cooked White Rice","category":"grains","serving_g":100,"kcal":130,"protein":2.7,"carbs":28,"fat":0.3,"fiber":0.4,"state":"cooked"},{"id":"rice_brown_raw","name_fr":"Riz complet cru","name_en":"Raw Brown Rice","category":"grains","serving_g":100,"kcal":362,"protein":7.5,"carbs":76,"fat":2.7,"fiber":3.5,"state":"raw"},{"id":"rice_brown_cooked","name_fr":"Riz complet cuit","name_en":"Cooked Brown Rice","category":"grains","serving_g":100,"kcal":112,"protein":2.6,"carbs":23,"fat":0.9,"fiber":1.8,"state":"cooked"},{"id":"rice_basmati_raw","name_fr":"Riz basmati cru","name_en":"Raw Basmati Rice","category":"grains","serving_g":100,"kcal":356,"protein":8.2,"carbs":78,"fat":0.6,"fiber":1.4,"state":"raw"},{"id":"rice_basmati_cooked","name_fr":"Riz basmati cuit","name_en":"Cooked Basmati Rice","category":"grains","serving_g":100,"kcal":121,"protein":2.8,"carbs":25,"fat":0.2,"fiber":0.4,"state":"cooked"},{"id":"pasta_white_dry","name_fr":"Pâ·®tes blanches sè·®ches","name_en":"Dry White Pasta","category":"grains","serving_g":100,"kcal":371,"protein":13,"carbs":74,"fat":1.5,"fiber":3.2,"state":"dry"},{"id":"pasta_white_cooked","name_fr":"Pâ·®tes blanches cuites","name_en":"Cooked White Pasta","category":"grains","serving_g":100,"kcal":131,"protein":5,"carbs":25,"fat":1.1,"fiber":1.8,"state":"cooked"},{"id":"pasta_whole_wheat_dry","name_fr":"Pâ·®tes complè·®tes sè·®ches","name_en":"Dry Whole Wheat Pasta","category":"grains","serving_g":100,"kcal":348,"protein":14,"carbs":75,"fat":1.4,"fiber":11,"state":"dry"},{"id":"pasta_whole_wheat_cooked","name_fr":"Pâ·®tes complè·®tes cuites","name_en":"Cooked Whole Wheat Pasta","category":"grains","serving_g":100,"kcal":124,"protein":5,"carbs":25,"fat":0.5,"fiber":3.9,"state":"cooked"},{"id":"quinoa_dry","name_fr":"Quinoa cru","name_en":"Dry Quinoa","category":"grains","serving_g":100,"kcal":368,"protein":14,"carbs":64,"fat":6,"fiber":7,"state":"dry"},{"id":"quinoa_cooked","name_fr":"Quinoa cuit","name_en":"Cooked Quinoa","category":"grains","serving_g":100,"kcal":120,"protein":4.4,"carbs":22,"fat":1.9,"fiber":2.8,"state":"cooked"},{"id":"oats_rolled_dry","name_fr":"Flocons d'avoine secs","name_en":"Dry Rolled Oats","category":"grains","serving_g":100,"kcal":389,"protein":17,"carbs":66,"fat":7,"fiber":10,"state":"dry"},{"id":"oats_rolled_cooked","name_fr":"Flocons d'avoine cuits","name_en":"Cooked Rolled Oats","category":"grains","serving_g":100,"kcal":68,"protein":2.4,"carbs":12,"fat":1.4,"fiber":1.7,"state":"cooked"},{"id":"couscous_dry","name_fr":"Semoule sè·®che","name_en":"Dry Couscous","category":"grains","serving_g":100,"kcal":376,"protein":13,"carbs":77,"fat":0.6,"fiber":5,"state":"dry"},{"id":"couscous_cooked","name_fr":"Semoule cuite","name_en":"Cooked Couscous","category":"grains","serving_g":100,"kcal":112,"protein":3.8,"carbs":23,"fat":0.2,"fiber":1.4,"state":"cooked"},{"id":"bulgur_dry","name_fr":"Boulgour cru","name_en":"Dry Bulgur","category":"grains","serving_g":100,"kcal":342,"protein":12,"carbs":76,"fat":1.3,"fiber":18,"state":"dry"},{"id":"bulgur_cooked","name_fr":"Boulgour cuit","name_en":"Cooked Bulgur","category":"grains","serving_g":100,"kcal":83,"protein":3.1,"carbs":19,"fat":0.2,"fiber":4.5,"state":"cooked"},{"id":"potato_boiled_no_skin","name_fr":"Pomme de terre bouillie sans peau","name_en":"Boiled Potato Without Skin","category":"grains","serving_g":100,"kcal":86,"protein":1.9,"carbs":20,"fat":0.1,"fiber":1.8,"state":"boiled"},{"id":"potato_baked_with_skin","name_fr":"Pomme de terre au four avec peau","name_en":"Baked Potato With Skin","category":"grains","serving_g":100,"kcal":93,"protein":2.5,"carbs":21,"fat":0.1,"fiber":2.2,"state":"baked"},{"id":"sweet_potato_baked","name_fr":"Patate douce au four","name_en":"Baked Sweet Potato","category":"grains","serving_g":100,"kcal":90,"protein":2,"carbs":21,"fat":0.2,"fiber":3.3,"state":"baked"},{"id":"chicken_breast_raw","name_fr":"Poulet (blanc, sans peau, cru)","name_en":"Chicken Breast (Skinless, Raw)","category":"meat_fish","serving_g":100,"kcal":120,"protein":22.5,"carbs":0,"fat":2.6,"fiber":0,"state":"raw"},{"id":"chicken_breast_cooked","name_fr":"Poulet (blanc, sans peau, cuit)","name_en":"Chicken Breast (Skinless, Cooked)","category":"meat_fish","serving_g":100,"kcal":165,"protein":31,"carbs":0,"fat":3.6,"fiber":0,"state":"cooked"},{"id":"turkey_breast_raw","name_fr":"Dinde (blanc, cru)","name_en":"Turkey Breast (Raw)","category":"meat_fish","serving_g":100,"kcal":111,"protein":24,"carbs":0,"fat":1.5,"fiber":0,"state":"raw"},{"id":"ground_beef_lean_raw","name_fr":"Bœuf haché·® maigre cru (5%)","name_en":"Ground Beef (Lean 5%, Raw)","category":"meat_fish","serving_g":100,"kcal":176,"protein":20,"carbs":0,"fat":10,"fiber":0,"state":"raw"},{"id":"beef_sirloin_raw","name_fr":"Faux-filet de bœuf cru","name_en":"Beef Sirloin (Raw)","category":"meat_fish","serving_g":100,"kcal":142,"protein":21,"carbs":0,"fat":6,"fiber":0,"state":"raw"},{"id":"pork_tenderloin_raw","name_fr":"Filet de porc cru","name_en":"Pork Tenderloin (Raw)","category":"meat_fish","serving_g":100,"kcal":109,"protein":22,"carbs":0,"fat":2,"fiber":0,"state":"raw"},{"id":"salmon_atlantic_raw","name_fr":"Saumon atlantique cru","name_en":"Salmon (Atlantic, Raw)","category":"meat_fish","serving_g":100,"kcal":208,"protein":20,"carbs":0,"fat":13,"fiber":0,"state":"raw"},{"id":"salmon_atlantic_cooked","name_fr":"Saumon atlantique cuit","name_en":"Salmon (Atlantic, Cooked)","category":"meat_fish","serving_g":100,"kcal":231,"protein":25,"carbs":0,"fat":14,"fiber":0,"state":"cooked"},{"id":"tuna_fresh_raw","name_fr":"Thon frais cru","name_en":"Tuna (Fresh, Raw)","category":"meat_fish","serving_g":100,"kcal":144,"protein":23,"carbs":0,"fat":5,"fiber":0,"state":"raw"},{"id":"tuna_canned_water","name_fr":"Thon en boî®®te (eau)","name_en":"Tuna (Canned in Water)","category":"meat_fish","serving_g":100,"kcal":116,"protein":26,"carbs":0,"fat":1,"fiber":0,"state":"canned"},{"id":"cod_raw","name_fr":"Cabillaud cru","name_en":"Cod (Raw)","category":"meat_fish","serving_g":100,"kcal":82,"protein":18,"carbs":0,"fat":0.7,"fiber":0,"state":"raw"},{"id":"tilapia_raw","name_fr":"Tilapia cru","name_en":"Tilapia (Raw)","category":"meat_fish","serving_g":100,"kcal":97,"protein":20,"carbs":0,"fat":1.7,"fiber":0,"state":"raw"},{"id":"shrimp_raw","name_fr":"Crevettes crues","name_en":"Shrimp (Raw)","category":"meat_fish","serving_g":100,"kcal":99,"protein":24,"carbs":0.2,"fat":0.3,"fiber":0,"state":"raw"},{"id":"sardines_canned_oil","name_fr":"Sardines à l'huile","name_en":"Sardines (Canned in Oil)","category":"meat_fish","serving_g":100,"kcal":208,"protein":25,"carbs":0,"fat":11,"fiber":0,"state":"canned"},{"id":"mackerel_raw","name_fr":"Maquereau cru","name_en":"Mackerel (Raw)","category":"meat_fish","serving_g":100,"kcal":205,"protein":19,"carbs":0,"fat":14,"fiber":0,"state":"raw"},{"id":"whole_egg_raw","name_fr":"Œuf entier cru","name_en":"Whole Egg (Raw)","category":"eggs_dairy","serving_g":100,"kcal":155,"protein":13,"carbs":1.1,"fat":11,"fiber":0,"state":"raw"},{"id":"egg_white_raw","name_fr":"Blanc d'œuf cru","name_en":"Egg White (Raw)","category":"eggs_dairy","serving_g":100,"kcal":52,"protein":11,"carbs":0.7,"fat":0.2,"fiber":0,"state":"raw"},{"id":"egg_yolk_raw","name_fr":"Jaune d'œuf cru","name_en":"Egg Yolk (Raw)","category":"eggs_dairy","serving_g":100,"kcal":322,"protein":16,"carbs":3.6,"fat":27,"fiber":0,"state":"raw"},{"id":"whole_milk","name_fr":"Lait entier","name_en":"Whole Milk","category":"eggs_dairy","serving_g":100,"kcal":61,"protein":3.2,"carbs":4.8,"fat":3.3,"fiber":0,"state":"liquid"},{"id":"skim_milk","name_fr":"Lait écremé·®","name_en":"Skim Milk","category":"eggs_dairy","serving_g":100,"kcal":34,"protein":3.4,"carbs":5,"fat":0.1,"fiber":0,"state":"liquid"},{"id":"greek_yogurt_plain","name_fr":"Yaourt grec nature","name_en":"Greek Yogurt (Plain)","category":"eggs_dairy","serving_g":100,"kcal":97,"protein":9,"carbs":3.6,"fat":5,"fiber":0,"state":"liquid"},{"id":"regular_yogurt_plain","name_fr":"Yaourt nature","name_en":"Regular Yogurt (Plain)","category":"eggs_dairy","serving_g":100,"kcal":61,"protein":3.5,"carbs":4.7,"fat":3.3,"fiber":0,"state":"liquid"},{"id":"cottage_cheese","name_fr":"Cottage cheese","name_en":"Cottage Cheese","category":"eggs_dairy","serving_g":100,"kcal":98,"protein":11,"carbs":3.4,"fat":4.3,"fiber":0,"state":"solid"},{"id":"fromage_blanc_3_2","name_fr":"Fromage blanc 3,2%","name_en":"Plain Fromage Blanc 3.2%","category":"eggs_dairy","serving_g":100,"kcal":76,"protein":7.9,"carbs":3.6,"fat":3.2,"fiber":0,"state":"solid"},{"id":"honey","name_fr":"Miel","name_en":"Honey","category":"sweets","serving_g":100,"kcal":304,"protein":0.3,"carbs":82.4,"fat":0,"fiber":0.2,"sugars":82,"state":"solid"},{"id":"dark_chocolate_chips","name_fr":"Pépites de chocolat noir","name_en":"Dark Chocolate Chips","category":"sweets","serving_g":100,"kcal":530,"protein":6,"carbs":52,"fat":31,"fiber":0,"sugars":48,"state":"solid"},{"id":"mozzarella_cheese","name_fr":"Mozzarella","name_en":"Mozzarella Cheese","category":"eggs_dairy","serving_g":100,"kcal":280,"protein":28,"carbs":2.2,"fat":17,"fiber":0,"state":"solid"},{"id":"cheddar_cheese","name_fr":"Fromage cheddar","name_en":"Cheddar Cheese","category":"eggs_dairy","serving_g":100,"kcal":402,"protein":25,"carbs":1.3,"fat":33,"fiber":0,"state":"solid"},{"id":"parmesan_cheese","name_fr":"Parmesan","name_en":"Parmesan Cheese","category":"eggs_dairy","serving_g":100,"kcal":431,"protein":38,"carbs":4.1,"fat":29,"fiber":0,"state":"solid"},{"id":"feta_cheese","name_fr":"Feta","name_en":"Feta Cheese","category":"eggs_dairy","serving_g":100,"kcal":264,"protein":11,"carbs":4,"fat":21,"fiber":0,"state":"solid"},{"id":"butter","name_fr":"Beurre","name_en":"Butter","category":"eggs_dairy","serving_g":100,"kcal":717,"protein":0.9,"carbs":0.1,"fat":81,"fiber":0,"state":"solid"},{"id":"heavy_cream","name_fr":"Crè·®me fraî­che","name_en":"Heavy Cream","category":"eggs_dairy","serving_g":100,"kcal":340,"protein":2.1,"carbs":2.8,"fat":36,"fiber":0,"state":"liquid"},{"id":"almonds","name_fr":"Amandes","name_en":"Almonds","category":"nuts_seeds","serving_g":100,"kcal":579,"protein":21,"carbs":22,"fat":50,"fiber":12,"state":"raw"},{"id":"walnuts","name_fr":"Noix","name_en":"Walnuts","category":"nuts_seeds","serving_g":100,"kcal":654,"protein":15,"carbs":14,"fat":65,"fiber":7,"state":"raw"},{"id":"peanuts","name_fr":"Cacahuè·®tes","name_en":"Peanuts","category":"nuts_seeds","serving_g":100,"kcal":567,"protein":26,"carbs":16,"fat":49,"fiber":8.5,"state":"raw"},{"id":"cashews","name_fr":"Noix de cajou","name_en":"Cashews","category":"nuts_seeds","serving_g":100,"kcal":553,"protein":18,"carbs":30,"fat":44,"fiber":3.3,"state":"raw"},{"id":"pistachios","name_fr":"Pistaches","name_en":"Pistachios","category":"nuts_seeds","serving_g":100,"kcal":560,"protein":20,"carbs":27,"fat":45,"fiber":10.6,"state":"raw"},{"id":"hazelnuts","name_fr":"Noisettes","name_en":"Hazelnuts","category":"nuts_seeds","serving_g":100,"kcal":628,"protein":15,"carbs":17,"fat":61,"fiber":9.7,"state":"raw"},{"id":"pecans","name_fr":"Noix de pécan","name_en":"Pecans","category":"nuts_seeds","serving_g":100,"kcal":691,"protein":9.2,"carbs":14,"fat":72,"fiber":9.6,"state":"raw"},{"id":"macadamia_nuts","name_fr":"Noix de macadamia","name_en":"Macadamia Nuts","category":"nuts_seeds","serving_g":100,"kcal":718,"protein":7.9,"carbs":14,"fat":76,"fiber":8.6,"state":"raw"},{"id":"brazil_nuts","name_fr":"Noix du Bré·®sil","name_en":"Brazil Nuts","category":"nuts_seeds","serving_g":100,"kcal":659,"protein":14,"carbs":12,"fat":67,"fiber":7.5,"state":"raw"},{"id":"pine_nuts","name_fr":"Pignons de pin","name_en":"Pine Nuts","category":"nuts_seeds","serving_g":100,"kcal":673,"protein":14,"carbs":13,"fat":68,"fiber":3.7,"state":"raw"},{"id":"chestnuts","name_fr":"Châ·®taignes","name_en":"Chestnuts","category":"nuts_seeds","serving_g":100,"kcal":213,"protein":2.4,"carbs":45,"fat":2.3,"fiber":5.1,"state":"raw"},{"id":"chia_seeds","name_fr":"Graines de chia","name_en":"Chia Seeds","category":"nuts_seeds","serving_g":100,"kcal":486,"protein":17,"carbs":42,"fat":31,"fiber":34,"state":"raw"},{"id":"flaxseeds","name_fr":"Graines de lin","name_en":"Flaxseeds","category":"nuts_seeds","serving_g":100,"kcal":534,"protein":18,"carbs":29,"fat":42,"fiber":27,"state":"raw"},{"id":"pumpkin_seeds","name_fr":"Graines de courge","name_en":"Pumpkin Seeds","category":"nuts_seeds","serving_g":100,"kcal":559,"protein":30,"carbs":11,"fat":49,"fiber":6,"state":"raw"},{"id":"sunflower_seeds","name_fr":"Graines de tournesol","name_en":"Sunflower Seeds","category":"nuts_seeds","serving_g":100,"kcal":584,"protein":21,"carbs":20,"fat":51,"fiber":8.6,"state":"raw"},{"id":"sesame_seeds","name_fr":"Graines de sé­same","name_en":"Sesame Seeds","category":"nuts_seeds","serving_g":100,"kcal":573,"protein":18,"carbs":23,"fat":50,"fiber":12,"state":"raw"},{"id":"hemp_seeds","name_fr":"Graines de chanvre","name_en":"Hemp Seeds","category":"nuts_seeds","serving_g":100,"kcal":553,"protein":31,"carbs":8.7,"fat":49,"fiber":4,"state":"raw"},{"id":"peanut_butter_natural","name_fr":"Beurre de cacahuè·®te naturel","name_en":"Natural Peanut Butter","category":"nuts_seeds","serving_g":100,"kcal":598,"protein":25,"carbs":20,"fat":51,"fiber":6,"state":"processed"},{"id":"almond_butter","name_fr":"Beurre d'amande","name_en":"Almond Butter","category":"nuts_seeds","serving_g":100,"kcal":614,"protein":21,"carbs":19,"fat":56,"fiber":10,"state":"processed"},{"id":"tahini","name_fr":"Tahini","name_en":"Tahini","category":"nuts_seeds","serving_g":100,"kcal":595,"protein":17,"carbs":21,"fat":54,"fiber":9.3,"state":"processed"},{"id":"olive_oil_extra_virgin","name_fr":"Huile d'olive extra vierge","name_en":"Extra Virgin Olive Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"coconut_oil","name_fr":"Huile de coco","name_en":"Coconut Oil","category":"oils_fats","serving_g":100,"kcal":862,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"avocado_oil","name_fr":"Huile d'avocat","name_en":"Avocado Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"sesame_oil","name_fr":"Huile de sé­same","name_en":"Sesame Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"sunflower_oil","name_fr":"Huile de tournesol","name_en":"Sunflower Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"canola_oil","name_fr":"Huile de colza","name_en":"Canola Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"flaxseed_oil","name_fr":"Huile de lin","name_en":"Flaxseed Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"walnut_oil","name_fr":"Huile de noix","name_en":"Walnut Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"grapeseed_oil","name_fr":"Huile de pépins de raisin","name_en":"Grapeseed Oil","category":"oils_fats","serving_g":100,"kcal":884,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"mct_oil","name_fr":"Huile MCT","name_en":"MCT Oil","category":"oils_fats","serving_g":100,"kcal":862,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"liquid"},{"id":"lard","name_fr":"Saindoux","name_en":"Lard","category":"oils_fats","serving_g":100,"kcal":902,"protein":0,"carbs":0,"fat":100,"fiber":0,"state":"solid"},{"id":"ghee","name_fr":"Ghee","name_en":"Ghee","category":"oils_fats","serving_g":100,"kcal":897,"protein":0.3,"carbs":0,"fat":100,"fiber":0,"state":"solid"},{"id":"butter","name_fr":"Beurre","name_en":"Butter","category":"oils_fats","serving_g":100,"kcal":717,"protein":0.9,"carbs":0.1,"fat":81,"fiber":0,"state":"solid"},{"id":"water","name_fr":"Eau","name_en":"Water","category":"beverages","serving_g":100,"kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"coffee_black_brewed","name_fr":"Café·® noir","name_en":"Black Coffee (Brewed)","category":"beverages","serving_g":100,"kcal":2,"protein":0.3,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"green_tea_brewed","name_fr":"Thé·® vert","name_en":"Green Tea (Brewed)","category":"beverages","serving_g":100,"kcal":1,"protein":0.2,"carbs":0.2,"fat":0,"fiber":0,"state":"liquid"},{"id":"black_tea_brewed","name_fr":"Thé·® noir","name_en":"Black Tea (Brewed)","category":"beverages","serving_g":100,"kcal":1,"protein":0,"carbs":0.3,"fat":0,"fiber":0,"state":"liquid"},{"id":"orange_juice_fresh","name_fr":"Jus d'orange frais","name_en":"Fresh Orange Juice","category":"beverages","serving_g":100,"kcal":45,"protein":0.7,"carbs":10,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"apple_juice","name_fr":"Jus de pomme","name_en":"Apple Juice","category":"beverages","serving_g":100,"kcal":46,"protein":0.1,"carbs":11,"fat":0.1,"fiber":0.2,"state":"liquid"},{"id":"grape_juice","name_fr":"Jus de raisin","name_en":"Grape Juice","category":"beverages","serving_g":100,"kcal":60,"protein":0.4,"carbs":15,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"cranberry_juice","name_fr":"Jus de canneberge","name_en":"Cranberry Juice","category":"beverages","serving_g":100,"kcal":46,"protein":0.4,"carbs":12,"fat":0.1,"fiber":0.1,"state":"liquid"},{"id":"tomato_juice","name_fr":"Jus de tomate","name_en":"Tomato Juice","category":"beverages","serving_g":100,"kcal":17,"protein":0.9,"carbs":3.5,"fat":0.1,"fiber":0.4,"state":"liquid"},{"id":"carrot_juice","name_fr":"Jus de carotte","name_en":"Carrot Juice","category":"beverages","serving_g":100,"kcal":40,"protein":0.9,"carbs":9,"fat":0.2,"fiber":0.8,"state":"liquid"},{"id":"coconut_water","name_fr":"Eau de coco","name_en":"Coconut Water","category":"beverages","serving_g":100,"kcal":19,"protein":0.7,"carbs":3.7,"fat":0.2,"fiber":0.2,"state":"liquid"},{"id":"almond_milk_unsweetened","name_fr":"Lait d'amande non sucré·®","name_en":"Unsweetened Almond Milk","category":"beverages","serving_g":100,"kcal":13,"protein":0.4,"carbs":0.3,"fat":1.1,"fiber":0.2,"state":"liquid"},{"id":"soy_milk_unsweetened","name_fr":"Lait de soja non sucré·®","name_en":"Unsweetened Soy Milk","category":"beverages","serving_g":100,"kcal":33,"protein":2.8,"carbs":1.7,"fat":1.8,"fiber":0.4,"state":"liquid"},{"id":"oat_milk_unsweetened","name_fr":"Lait d'avoine non sucré·®","name_en":"Unsweetened Oat Milk","category":"beverages","serving_g":100,"kcal":40,"protein":1,"carbs":7,"fat":1.5,"fiber":0.8,"state":"liquid"},{"id":"rice_milk_unsweetened","name_fr":"Lait de riz non sucré·®","name_en":"Unsweetened Rice Milk","category":"beverages","serving_g":100,"kcal":47,"protein":0.3,"carbs":9.2,"fat":1,"fiber":0.3,"state":"liquid"},{"id":"coconut_milk_canned","name_fr":"Lait de coco en boî®®te","name_en":"Canned Coconut Milk","category":"beverages","serving_g":100,"kcal":230,"protein":2.3,"carbs":6,"fat":24,"fiber":0,"state":"liquid"},{"id":"protein_shake_whey_water","name_fr":"Shake protéiné·® (whey, eau)","name_en":"Protein Shake (Whey, Water)","category":"beverages","serving_g":100,"kcal":41,"protein":7.5,"carbs":2.8,"fat":0.8,"fiber":0,"state":"liquid"},{"id":"red_wine","name_fr":"Vin rouge","name_en":"Red Wine","category":"beverages","serving_g":100,"kcal":85,"protein":0.1,"carbs":2.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"white_wine","name_fr":"Vin blanc","name_en":"White Wine","category":"beverages","serving_g":100,"kcal":82,"protein":0.1,"carbs":2.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"beer_regular","name_fr":"Biè·®re","name_en":"Regular Beer","category":"beverages","serving_g":100,"kcal":43,"protein":0.5,"carbs":3.6,"fat":0,"fiber":0,"state":"liquid"},{"id":"spirits_40_abv","name_fr":"Spiritueux (40%)","name_en":"Spirits (40% ABV)","category":"beverages","serving_g":100,"kcal":231,"protein":0,"carbs":0,"fat":0,"fiber":0,"state":"liquid"},{"id":"kombucha","name_fr":"Kombucha","name_en":"Kombucha","category":"beverages","serving_g":100,"kcal":25,"protein":0.2,"carbs":5,"fat":0,"fiber":0,"state":"liquid"},{"id":"sports_drink","name_fr":"Boisson sportive","name_en":"Sports Drink","category":"beverages","serving_g":100,"kcal":26,"protein":0.1,"carbs":6.8,"fat":0.1,"fiber":0,"state":"liquid"},{"id":"cola","name_fr":"Cola","name_en":"Cola","category":"beverages","serving_g":100,"kcal":42,"protein":0,"carbs":11,"fat":0,"fiber":0,"state":"liquid"},{"id":"nutripure_whey_isolate_native_neutre","name_fr":"Whey Isolate Native (Neutre)","name_en":"Whey Isolate Native (Unflavored)","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":114,"protein":28.2,"carbs":0.9,"fat":0.6,"fiber":0,"sugars":0.15,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_native_neutre_100g","name_fr":"Whey Isolate Native (Neutre) - 100g","name_en":"Whey Isolate Native (Unflavored) - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":380,"protein":94,"carbs":3,"fat":1.9,"fiber":0,"sugars":0.5,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_vanille","name_fr":"Whey Isolate Vanille","name_en":"Whey Isolate Vanilla","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":115,"protein":24,"carbs":2.8,"fat":0.81,"fiber":0,"sugars":1.7,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_vanille_100g","name_fr":"Whey Isolate Vanille - 100g","name_en":"Whey Isolate Vanilla - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":385,"protein":80,"carbs":9.9,"fat":2.7,"fiber":0,"sugars":5.6,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_chocolat","name_fr":"Whey Isolate Chocolat","name_en":"Whey Isolate Chocolate","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":113,"protein":24,"carbs":3.4,"fat":1,"fiber":0.3,"sugars":1.6,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_chocolat_100g","name_fr":"Whey Isolate Chocolat - 100g","name_en":"Whey Isolate Chocolate - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":377,"protein":76,"carbs":11.3,"fat":3.4,"fiber":1,"sugars":5.2,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_fraise","name_fr":"Whey Isolate Fraise","name_en":"Whey Isolate Strawberry","category":"supplements","serving_g":30,"serving_label":"1 dose (30g)","kcal":115,"protein":24,"carbs":2.8,"fat":0.81,"fiber":0,"sugars":1.7,"brand":"Nutripure","state":"powder"},{"id":"nutripure_whey_isolate_fraise_100g","name_fr":"Whey Isolate Fraise - 100g","name_en":"Whey Isolate Strawberry - 100g","category":"supplements","serving_g":100,"serving_label":"100g","kcal":382,"protein":80,"carbs":9.3,"fat":2.7,"fiber":0,"sugars":5.6,"brand":"Nutripure","state":"powder"}];
const BUILTIN_FOODS = RAW_FOODS.map((f,i)=>({id:f.id||slugify(f.name_fr)+"_"+i,name:f.name_fr,kcal:f.kcal,protein:f.protein,carbs:f.carbs,fat:f.fat,fiber:f.fiber||0,category:f.category,state:f.state,serving_g:f.serving_g||100,serving_label:f.serving_label||((f.serving_g||100)+" g")}));

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
let shoppingList = LS.get('ct_shoppingList', []); // {id,name,checked,qty,source}
let recipes = LS.get('ct_recipes', []); // {id,name,ingredients:[{name,qty}],steps,servings,sourceUrl,savedAt,bookId} — recettes importées, rangées par livre (voir recipeBooks)
let recipeBooks = LS.get('ct_recipeBooks', []); // {id,name} — "livres de cuisine" créés librement par l'utilisateur, chaque recette appartient à un seul livre
let insightsSeen = LS.get('ct_insightsSeen', {}); // {insightId: dernière date d'affichage} — cooldown des Kalo Insights (voir kaloInsights(), architecture minimale volontaire : à terme, doit devenir cooldown + détection de nouveauté/amplitude du signal, pas juste un délai fixe)
// Kalo Calibration (voir calibrationBanner()/openQtyModal()) : deux flags d'état
// UI indépendants, même catégorie que insightsSeen (cache d'affichage "vu ou
// pas", jamais une connaissance dérivée des données) — chacun un booléen
// simple, montré une fois puis jamais réaffiché. Volontairement DEUX flags
// séparés (pas un système générique de "capability unlock") : rien n'indique
// aujourd'hui qu'on aura besoin d'un 3e cas, donc pas de généralisation
// prématurée — voir note dans le commit/discussion produit.
let calibrationSeen = LS.get('ct_calibrationSeen', false);
let portionRevealSeen = LS.get('ct_portionRevealSeen', false);
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
  LS.set('ct_shoppingList',shoppingList);
  LS.set('ct_recipes',recipes);
  LS.set('ct_recipeBooks',recipeBooks);
  LS.set('ct_insightsSeen',insightsSeen);
  LS.set('ct_favSports',favSports);
  LS.set('ct_calibrationSeen',calibrationSeen);
  LS.set('ct_portionRevealSeen',portionRevealSeen);
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

// Migration une seule fois : d'anciennes recettes importées avant l'introduction
// des "livres" n'ont pas de bookId. Si aucun livre n'existe encore, on en crée un
// par défaut et on y range les recettes orphelines — pas de bucket "Sans livre"
// permanent dans l'UI, juste un rattrapage au premier chargement après la mise à
// jour. N'agit qu'une fois : dès qu'un livre existe, on ne retouche plus rien ici.
function normalizeRecipeBooks(){
  recipeBooks = Array.isArray(recipeBooks) ? recipeBooks : [];
  recipes = Array.isArray(recipes) ? recipes : [];
  const orphans = recipes.filter(r=>!r.bookId);
  if(orphans.length && recipeBooks.length===0){
    const defaultBook = {id:uid(), name:'Mes recettes'};
    recipeBooks.push(defaultBook);
    orphans.forEach(r=>{ r.bookId = defaultBook.id; });
    save();
  }
}

// ===================== LIVRES DE RECETTES : opérations de données =====================
// Ces fonctions ne touchent qu'à l'état (recipes/recipeBooks) + save() ; le rendu et
// les modales vivent dans core.js (viewRecipes) / recipeimport.js (modales de choix
// de livre) / ui.js (bindTabEvents), pour rester cohérent avec le reste du fichier.
function createRecipeBook(name){
  const clean = (name||'').trim();
  if(!clean) return null;
  const book = {id:uid(), name:clean};
  recipeBooks.push(book);
  save();
  return book;
}
function renameRecipeBook(id, name){
  const book = recipeBooks.find(b=>b.id===id);
  const clean = (name||'').trim();
  if(!book || !clean) return;
  book.name = clean;
  save();
}
// Ne supprime jamais un livre non-vide directement : voir moveBookRecipesAndDelete()
// pour le cas avec recettes, appelé depuis une modale de choix de livre cible
// (ui.js/recipeimport.js) plutôt que de perdre des recettes silencieusement.
function deleteRecipeBookEmpty(id){
  recipeBooks = recipeBooks.filter(b=>b.id!==id);
  if(openRecipeBookId===id) openRecipeBookId = null;
  save();
}
function moveBookRecipesAndDelete(fromId, toId){
  recipes.forEach(r=>{ if(r.bookId===fromId) r.bookId = toId; });
  recipeBooks = recipeBooks.filter(b=>b.id!==fromId);
  if(openRecipeBookId===fromId) openRecipeBookId = toId;
  save();
}
// Factorisé depuis js/recipeimport.js (riAddShopBtn) pour être réutilisé aussi par
// le bouton "Ajouter aux courses" d'une recette déjà enregistrée (page Recettes) —
// même format d'article que le reste de la liste de courses ({id,name,checked,qty,source}).
function addIngredientsToShoppingList(ingredients, sourceName){
  if(!Array.isArray(ingredients) || !ingredients.length) return 0;
  let count = 0;
  ingredients.forEach(i=>{
    const iname = (i.name||'').trim();
    if(!iname) return;
    shoppingList.push({id:uid(), name:iname, qty:(i.qty||'').trim()||null, checked:false, source:sourceName});
    count++;
  });
  if(count) save();
  return count;
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

// Une recette dans le détail d'un livre : ligne repliable (accordéon sur
// openRecipeId, même mécanisme que l'ancienne page "Courses" avant la refonte
// livres/page dédiée) + détail
// ingrédients/étapes/lien source + bouton "Ajouter aux courses" propre à CETTE
// recette (contrairement à l'import, où l'ajout se fait avant même d'enregistrer).
function recipeRow(r){
  const open = openRecipeId===r.id;
  return `<div class="list-entry">
    <div class="main recipe-head" data-recipe-toggle="${r.id}">
      <div class="title">${escapeHtml(r.name)}</div>
      <div class="sub">${r.ingredients.length} ingrédient${r.ingredients.length>1?'s':''}${r.servings?' · '+r.servings+' pers.':''} ${open?'▲':'▼'}</div>
    </div>
    <button class="del" data-recipe-delete="${r.id}" aria-label="Supprimer la recette">✕</button>
  </div>
  ${open?`<div class="recipe-detail">
    ${r.ingredients.length?`<ul class="recipe-ing">${r.ingredients.map(i=>`<li>${escapeHtml(i.name||'')}${i.qty?' — '+escapeHtml(i.qty):''}</li>`).join('')}</ul>`:''}
    ${r.steps&&r.steps.length?`<ol class="recipe-steps">${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>`:'<div class="empty">Étapes non précisées dans la légende.</div>'}
    ${r.sourceUrl?`<div class="hint"><a href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">Voir la vidéo source ↗</a></div>`:''}
    <button class="btn ghost small" data-recipe-addshop="${r.id}" type="button" style="margin-top:10px;">Ajouter aux courses</button>
  </div>`:''}`;
}

// Un livre : accordéon sur openRecipeBookId (même pattern que l'historique par
// semaine — hist-day/hist-head/hist-body) ; renommer/supprimer n'apparaissent que
// livre ouvert, pour ne pas surcharger la vue fermée avec des actions destructives.
function recipeBookCard(book){
  const bookRecipes = recipes.filter(r=>r.bookId===book.id);
  const open = openRecipeBookId===book.id;
  return `<div class="hist-day">
    <div class="hist-head recipe-book-head" data-book-toggle="${book.id}">
      <div class="d">${escapeHtml(book.name)}</div>
      <div class="n">${bookRecipes.length} recette${bookRecipes.length>1?'s':''} ${open?'▲':'▼'}</div>
    </div>
    <div class="hist-body ${open?'open':''}">
      <div class="row2" style="margin-top:0;">
        <button class="btn ghost small" data-book-rename="${book.id}" type="button">Renommer</button>
        <button class="btn ghost small" data-book-delete="${book.id}" type="button" style="color:var(--rust);">Supprimer</button>
      </div>
      ${bookRecipes.length ? `<div class="recipe-list" style="margin-top:10px;">${bookRecipes.map(recipeRow).join('')}</div>` : '<div class="empty">Ce livre est vide pour l\'instant.</div>'}
    </div>
  </div>`;
}

// Page dédiée aux recettes ("livres de cuisine") : pas liée à une date précise
// (comme Poids/Courses), donc pas de dateStrip() — juste un page-title, à
// l'instar de viewWeight()/viewShoppingList(). Créer un livre est possible ici à
// tout moment (pas seulement pendant un import, cf. openSaveRecipeModal dans
// js/recipeimport.js).
function viewRecipes(){
  return `<h1 class="page-title">Recettes</h1>
  <section class="card">
    <h2>Nouveau livre</h2>
    <div class="todo-form">
      <input id="newBookName" type="text" maxlength="60" placeholder="Ex. Desserts, Plats rapides…" autocomplete="off">
      <button class="btn primary" id="addBookBtn" type="button">Créer le livre</button>
    </div>
  </section>
  <section class="card">
    <h2>Mes livres (${recipeBooks.length})</h2>
    ${recipeBooks.length
      ? recipeBooks.map(recipeBookCard).join('')
      : '<div class="empty">Aucun livre pour l\'instant — crée-en un ci-dessus, puis importe une recette depuis le bouton + pour la ranger dedans.</div>'}
  </section>`;
}

function viewShoppingList(){
  const pending = shoppingList.filter(i=>!i.checked);
  const checked = shoppingList.filter(i=>i.checked);
  const item = i => `<div class="todo-item ${i.checked?'done':''}">
    <input class="todo-check" type="checkbox" data-shop-toggle="${i.id}" ${i.checked?'checked':''} aria-label="Marquer ${escapeHtml(i.name)} comme prise">
    <div class="todo-copy">
      <div class="todo-label">${escapeHtml(i.name)}</div>
      ${(i.qty||i.source)?`<span class="todo-kind">${escapeHtml([i.qty, i.source?('via '+i.source):''].filter(Boolean).join(' · '))}</span>`:''}
    </div>
    <div class="todo-actions"><button data-shop-delete="${i.id}" aria-label="Supprimer">✕</button></div>
  </div>`;
  return `<h1 class="page-title">Liste de courses</h1>
  <section class="card"><h2>Ajouter un article</h2>
    <div class="todo-form">
      <input id="shopName" type="text" maxlength="80" placeholder="Ex. Tomates" autocomplete="off">
      <button class="btn primary" id="shopAdd">Ajouter</button>
      <input id="shopQty" type="text" maxlength="40" placeholder="Quantité (optionnel, ex. 500 g)" style="grid-column:1 / -1" autocomplete="off">
    </div>
  </section>
  <section class="card"><h2>À acheter${pending.length?' ('+pending.length+')':''}</h2>
    <div class="todo-list">${pending.length?pending.map(item).join(''):'<div class="empty">Liste vide — ajoute un article, ou importe une recette depuis le bouton +.</div>'}</div>
    ${checked.length?`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;">
      <h2 style="margin:0">Déjà pris (${checked.length})</h2>
      <button class="btn ghost small" id="shopClearChecked" type="button">Vider les cochés</button>
    </div>
    <div class="todo-list">${checked.map(item).join('')}</div>`:''}
  </section>`;
}

/* ===================== RENDU ===================== */
// Depuis la refonte dashboard-first, il n'y a plus de barre d'onglets persistante :
// "today" (Accueil, libellé TAB_LABELS) est le hub central, toute autre page s'y
// atteint en cliquant un bloc du dashboard (dashCard) et s'en échappe via le
// bouton retour de l'en-tête (#backBtn, voir index.html/app.js). render() pilote
// aussi l'en-tête : le logo "Kalo" ne s'affiche que sur le dashboard (pour
// regagner de la hauteur d'écran ailleurs), remplacé par [retour + titre de page]
// sur toutes les autres pages.
function render(){
  const onDashboard = activeTab==='today';
  const brandBlock = document.getElementById('brandBlock');
  const pageHead = document.getElementById('pageHead');
  const pageHeading = document.getElementById('pageHeading');
  if(brandBlock) brandBlock.hidden = !onDashboard;
  if(pageHead) pageHead.hidden = onDashboard;
  if(pageHeading) pageHeading.textContent = TAB_LABELS[activeTab] || '';
  const settingsBtn = document.getElementById('settingsBtn');
  if(settingsBtn) settingsBtn.classList.toggle('active', activeTab==='settings');
  document.title = onDashboard ? 'Kalo' : `Kalo · ${TAB_LABELS[activeTab] || ''}`;
  const main = document.getElementById('main');
  if(isNewUser() || showOnboardingConfirm) main.innerHTML = viewOnboarding();
  else if(activeTab==='today') main.innerHTML = viewToday();
  else if(activeTab==='meals') main.innerHTML = viewMeals();
  else if(activeTab==='workouts') main.innerHTML = viewWorkouts();
  else if(activeTab==='weight') main.innerHTML = viewWeight();
  else if(activeTab==='notes') main.innerHTML = viewNotes();
  else if(activeTab==='todos') main.innerHTML = viewTodos();
  else if(activeTab==='shopping') main.innerHTML = viewShoppingList();
  else if(activeTab==='recipes') main.innerHTML = viewRecipes();
  else if(activeTab==='history') main.innerHTML = viewHistory();
  else if(activeTab==='settings') main.innerHTML = viewSettings();
  bindTabEvents();
}

// Change d'onglet par programme (clic sur un bloc du dashboard, bouton retour,
// réglages, ou action rapide type bouton + flottant) : centralise le reset de
// scroll. Le scroll ici est celui de la PAGE (window/#main), pas un scroll interne
// à #main — voir la note dédiée dans CLAUDE.md avant d'y toucher. Ne pas appeler
// ceci depuis render() elle-même (rendus internes à un même onglet : ajout d'un
// repas, coche d'une case… où on ne veut surtout pas sauter en haut de page).
function switchTab(tab){
  // Créneau contextuel (brique 10) : recalculé à chaque ENTRÉE réelle sur
  // l'onglet Repas, jamais en cours de visite (les taps manuels sur
  // [data-slot] appellent render() directement, jamais switchTab() — donc un
  // choix manuel n'est jamais écrasé pendant la même visite, et aucune mémoire
  // n'est gardée d'une visite à l'autre : l'heure du moment fait toujours foi).
  if(tab==='meals') mealSlot = mealSlotForTime();
  activeTab = tab; render();
  window.scrollTo(0, 0);
  document.getElementById('main').scrollTop = 0;
}

// Bandeau de dates unique (remplace l'ancien duo dayBar()+weekStrip(), redondant :
// des flèches jour précédent/suivant ET une bande de jours cliquables juste en
// dessous). Découpé en semaines complètes lundi→dimanche (weekStart()), avec un
// snap au swipe (scroll-snap-type sur .date-strip-scroll) qui fait défiler une
// semaine entière à la fois — retour utilisateur : un ruban de jours en fenêtre
// glissante (±N jours centrés sur le jour actif) mélangeait visuellement fin de
// semaine passée et début de semaine en cours, pas assez "propre". Chaque semaine
// occupe 100% de la largeur (.ds-week), les jours se répartissent dedans à parts
// égales (.ds-day en flex:1, plus une largeur fixe comme avant). Le centrage
// visuel sur la semaine active (scrollLeft) est fait après coup dans
// bindTabEvents() — voir `centerDateStrip()` dans ui.js.
const WEEK_STRIP_RANGE = 10; // semaines affichées avant/après la semaine de currentDate
function dateStrip(){
  const dowLetters = ['L','M','M','J','V','S','D'];
  const todayS = todayStr();
  const curWeekStart = weekStart(currentDate);
  const weekStarts = [];
  for(let w=-WEEK_STRIP_RANGE; w<=WEEK_STRIP_RANGE; w++) weekStarts.push(shiftDate(curWeekStart, w*7));
  const weekBlocks = weekStarts.map(ws=>{
    const days = [0,1,2,3,4,5,6].map(i=>shiftDate(ws,i));
    const dayButtons = days.map((d,i)=>{
      const dt = new Date(d+'T12:00:00');
      const hasEntries = entriesFor(d).some(e=>e.type==='meal');
      const selected = d===currentDate;
      const isToday = d===todayS;
      return `<button class="ds-day${selected?' active':''}${isToday?' today':''}" data-jumpdate="${d}" type="button">
        <span class="ds-letter">${dowLetters[i]}</span>
        <span class="ds-num">${dt.getDate()}</span>
        <span class="ds-dot${hasEntries?' filled':''}"></span>
      </button>`;
    }).join('');
    return `<div class="ds-week" data-weekstart="${ws}">${dayButtons}</div>`;
  }).join('');
  // Le libellé ("Aujourd'hui", "Hier"...) est un vrai bouton qui ouvre le
  // sélecteur de date natif (input[type=date] cliqué par programme via
  // showPicker(), voir bindTabEvents() dans ui.js) — pour choisir directement une
  // date lointaine sans faire défiler le ruban semaine par semaine.
  return `<div class="date-strip">
    <button class="date-strip-label" id="dateStripLabel" type="button">
      <span>${dateLabel(currentDate)}<small>${new Date(currentDate+'T12:00:00').toLocaleDateString('fr-FR')}</small></span>
      <svg class="ds-cal-ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    </button>
    <input type="date" id="dateStripPicker" class="date-strip-picker" value="${currentDate}" tabindex="-1" aria-hidden="true">
    <div class="date-strip-scroll" id="dateStripScroll">${weekBlocks}</div>
  </div>`;
}

// Conseils macros : compare la part du macro déjà consommée à la part de la
// journée déjà écoulée, pour repérer un macro en avance (à limiter) ou en
// retard (à privilégier) sur le rythme de la journée — pas juste un % brut.
function frenchList(names){
  if(names.length<=1) return names[0]||'';
  return names.slice(0,-1).join(', ')+' et '+names[names.length-1];
}
// Aliments les plus riches en `key` (protein/carbs/fat) dans la base complète.
// Piocher dans les favoris/l'historique perso donnait des suggestions bizarres
// (ex. "fais-toi une collation de pâtes au saumon" parce que c'était le plat le
// plus riche en glucides déjà loggé) — mieux vaut rester sur des aliments "purs".
// `excludeIds` évite de suggérer un aliment déjà déconseillé pour un autre macro
// (ex. les pistaches sont riches en protéines ET en lipides : si les lipides sont
// déjà au max, on ne va pas dire ensuite "mange des pistaches" pour les protéines).
// Dans ces catégories, "cru"/"sec" désigne un aliment qu'on ne mange pas tel quel
// (riz cru, poulet cru, œuf cru...) — contrairement aux légumes/fruits/oléagineux,
// où le cru est la norme. On les exclut donc des suggestions.
const RAW_UNSAFE_CATEGORIES = new Set(['grains','legumes','meat_fish','eggs_dairy']);
function isEdibleAsIs(f){
  return !(RAW_UNSAFE_CATEGORIES.has(f.category) && (f.state==='raw' || f.state==='dry'));
}
// Fenêtre de "fréquence récente" (brique 9C) : un paramètre produit pragmatique,
// pas une constante physiologique ni une valeur "scientifiquement optimale" —
// volontairement simple (comptage entier borné dans le temps, pas de
// pondération/décroissance), et révisable avec l'usage réel. Choisie plus
// longue que FREQUENT_MEAL_WINDOW_DAYS (30j) pour ne pas pénaliser un aliment
// mangé une fois par semaine (30j ne lui laisserait que 4-5 occurrences),
// et plus courte que 90j pour vraiment exclure ce que l'utilisateur ne mange
// plus. Vise à faire refléter au scoring les habitudes RÉCENTES plutôt que
// tout l'historique depuis toujours — voir personalFoodFrequency() ci-dessous.
const PERSONAL_FREQUENCY_WINDOW_DAYS = 60;

// Nb de fois où chaque aliment a été loggué en repas, sur les
// PERSONAL_FREQUENCY_WINDOW_DAYS derniers jours — seule mesure de fréquence
// utilisée pour personnaliser topFoodsFor() ci-dessous (pas de ML, pas d'IA :
// un simple comptage déterministe et lisible, juste borné dans le temps).
// Volontairement PAS de repli sur tout l'historique si la fenêtre est vide
// (contrairement à typicalGramsFor()) : typicalGramsFor() cherche une portion
// représentative, où une vieille donnée reste mieux que rien ; ici on cherche
// une fréquence ACTUELLE, où une occurrence vieille de 6 mois ne doit
// justement plus compter comme "habituel" — les deux concepts ne se mélangent
// pas. Un aliment hors fenêtre retombe simplement à freq=0, et topFoodsFor()
// dégrade déjà proprement vers le score nutritionnel seul dans ce cas (bonus
// additif, pas de branche spéciale nécessaire).
function personalFoodFrequency(){
  const cutoff = shiftDate(todayStr(), -PERSONAL_FREQUENCY_WINDOW_DAYS);
  const freq = {};
  logEntries.forEach(e=>{ if(e.type==='meal' && e.foodId && e.date>=cutoff) freq[e.foodId] = (freq[e.foodId]||0)+1; });
  return freq;
}
// Suggestions "à privilégier/éviter" des conseils macro : toujours triées d'abord
// par pertinence nutritionnelle réelle (valeur du macro visé, critère d'origine),
// avec un bonus pour les aliments que l'utilisateur mange déjà (favoris + fréquence
// personnelle) plutôt que de piocher uniquement dans le catalogue générique. Le
// bonus de fréquence est plafonné à 5 occurrences pour qu'un aliment mangé une
// seule fois ne devienne jamais la recommandation principale devant un aliment
// bien plus adapté nutritionnellement — il ne fait que départager des aliments
// déjà pertinents.
function topFoodsFor(key, excludeIds){
  const freq = personalFoodFrequency();
  const candidates = allFoods()
    .filter(f=>f[key]>3 && isEdibleAsIs(f) && !(excludeIds&&excludeIds.has(f.id)))
    .map(f=>{
      const favBonus = isFavorite(f.id) ? f[key]*0.5 : 0;
      const freqBonus = Math.min(freq[f.id]||0, 5) * (f[key]*0.15);
      return {f, score: f[key] + favBonus + freqBonus};
    })
    .sort((a,b)=>b.score-a.score);
  // Diversifie : au plus un aliment par catégorie, pour ne pas proposer 3 variantes
  // du même produit (ex. whey nature/vanille/fraise, ou 3 huiles différentes).
  const picked = [], seenCategories = new Set();
  for(const {f} of candidates){
    if(seenCategories.has(f.category)) continue;
    picked.push(f); seenCategories.add(f.category);
    if(picked.length>=3) break;
  }
  return picked;
}
function macroTips(t){
  const now = new Date();
  const elapsed = (now.getHours()*60+now.getMinutes())/1440;
  const macros = [
    {key:'protein', label:'Protéines', color:'var(--blue)', consumed:t.protein, goal:settings.proteinGoal},
    {key:'carbs', label:'Glucides', color:'var(--rust)', consumed:t.carbs, goal:settings.carbGoal},
    {key:'fat', label:'Lipides', color:'var(--green)', consumed:t.fat, goal:settings.fatGoal}
  ];
  const statuses = macros.map(m=>{
    if(!m.goal) return {...m, status:null};
    const ratio = m.consumed/m.goal;
    const diff = ratio-elapsed;
    if(diff>=0.2 && ratio>=0.6) return {...m, status:'avoid'};
    if(diff<=-0.25 && elapsed>=0.3) return {...m, status:'eat'};
    return {...m, status:null};
  });
  // Les aliments "à éviter" sont calculés d'abord, pour que les suggestions
  // "à privilégier" ne piochent jamais dedans.
  const avoidIds = new Set();
  const avoidFoods = {};
  statuses.filter(m=>m.status==='avoid').forEach(m=>{
    const foods = topFoodsFor(m.key);
    avoidFoods[m.key] = foods;
    foods.forEach(f=>avoidIds.add(f.id));
  });
  const tips = [];
  statuses.forEach(m=>{
    if(m.status==='avoid'){
      const foods = avoidFoods[m.key];
      let text = `déjà ${Math.round(m.consumed)}/${m.goal} g alors que la journée n'est qu'à ${Math.round(elapsed*100)}% — mieux vaut éviter les aliments riches en ${m.label.toLowerCase()} pour la suite.`;
      if(foods.length) text += ` Par exemple, limite ${frenchList(foods.map(f=>f.name))}.`;
      tips.push({...m, text});
    } else if(m.status==='eat'){
      const foods = topFoodsFor(m.key, avoidIds);
      let text = `seulement ${Math.round(m.consumed)}/${m.goal} g pour l'instant — pense à en ajouter dans ton prochain repas.`;
      if(foods.length){
        // "Parmi tes aliments" seulement si la suggestion vient vraiment de son
        // historique (favori ou déjà mangé) — pas une formule générique plaquée sur
        // n'importe quelle suggestion du catalogue.
        const freq = personalFoodFrequency();
        const isPersonal = isFavorite(foods[0].id) || (freq[foods[0].id]||0) > 0;
        text += isPersonal
          ? ` Parmi tes aliments habituels : ${frenchList(foods.map(f=>f.name))}.`
          : ` Par exemple avec ${frenchList(foods.map(f=>f.name))}.`;
      }
      tips.push({...m, text});
    }
  });
  return tips;
}
// Icônes réutilisées telles quelles depuis l'ancienne nav (identité visuelle
// inchangée) pour les blocs du dashboard et les en-têtes de page.
const DASH_ICONS = {
  meals: '<svg viewBox="0 0 24 24"><path d="M6 3v8a2 2 0 002 2h0a2 2 0 002-2V3M6 3v18M10 3v5M18 3c-2 0-3 2-3 5s1 4 3 4v9"/></svg>',
  workouts: '<svg viewBox="0 0 24 24"><path d="M4 12h3M17 12h3M7 12a2 2 0 002-2V8a2 2 0 00-2-2 2 2 0 00-2 2v8a2 2 0 002 2 2 2 0 002-2v-2M17 12a2 2 0 01-2-2V8a2 2 0 012-2 2 2 0 012 2v8a2 2 0 01-2 2 2 2 0 01-2-2v-2"/></svg>',
  weight: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M9 5l1-2h4l1 2M12 13l2.5-3"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-7 3L3 8"/><path d="M3 4v4h4M12 7v5l3 2"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><path d="M6 4h9l4 4v12a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M14 4v4h4M8 12h8M8 16h5"/></svg>',
  todos: '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="m8 12 2.2 2.2L16 8.5"/></svg>',
  shopping: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M1.5 2h3l2.6 12.9a2 2 0 002 1.6h8.8a2 2 0 002-1.6L22 7H6.3"/></svg>',
  recipes: '<svg viewBox="0 0 24 24"><path d="M4 5.5c2.2-1.3 5.3-1.3 8 .5 2.7-1.8 5.8-1.8 8-.5v13c-2.2-1.3-5.3-1.3-8 .5-2.7-1.8-5.8-1.8-8-.5z"/><path d="M12 6v13"/></svg>',
};
// Libellés de page affichés dans l'en-tête (hors dashboard) et utilisés pour
// <title> — voir render() dans core.js. 'today' = le dashboard lui-même.
const TAB_LABELS = {
  today:'Accueil', meals:'Repas', workouts:'Séances', weight:'Poids', history:'Historique',
  notes:'Notes', todos:'To-do', shopping:'Courses', recipes:'Recettes', settings:'Réglages'
};

// Tronque un texte pour un aperçu de carte, sur un mot entier (pas de coupure en
// plein milieu d'un mot) suivi de "…".
function truncateText(text, maxLen){
  const s = String(text||'').trim();
  if(s.length<=maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace>10 ? cut.slice(0,lastSpace) : cut) + '…';
}

// Nombre de jours consécutifs (en remontant depuis aujourd'hui) où au moins un
// repas a été loggué ET où le total calorique du jour est resté sous l'objectif.
// S'arrête au premier jour sans repas loggué OU en dépassement — un jour sans
// saisie n'est ni compté ni pénalisé plus que ça, il stoppe juste le décompte
// (pas de notion de "série cassée" affichée : voir dashboardGrid()).
function calorieStreak(){
  let streak = 0;
  let d = todayStr();
  while(true){
    const dayEntries = entriesFor(d);
    if(!dayEntries.some(e=>e.type==='meal')) break;
    const t = dayTotals(d);
    if(t.kcalIn > settings.calorieGoal) break;
    streak++;
    d = shiftDate(d, -1);
  }
  return streak;
}

// Une carte cliquable du dashboard : résumé d'une section + navigation vers sa
// page complète via switchTab() (liée dans bindTabEvents(), js/ui.js — même
// mécanisme que l'ancienne nav). Volontairement un <button> sans contrôle
// interactif imbriqué (pas de bouton dans un bouton) : juste un résumé, jamais
// d'action modifiant les données directement depuis le dashboard.
// `attention` : accent visuel discret (liseré --rust, déjà utilisé ailleurs dans
// l'appli pour un dépassement calorique) pour faire ressortir une carte qui mérite
// un coup d'œil — jamais un badge/pastille "en retard" façon outil de travail. Sur
// demande explicite de l'utilisateur : on veut responsabiliser sans stresser, donc
// réservé au seul fait déjà communiqué ailleurs dans l'appli de façon neutre (le
// dépassement de l'objectif calorique du jour), pas à des rappels de tâches.
function dashCard(tab, label, value, sub, attention){
  return `<button class="dash-block${attention?' dash-block-attn':''}" data-tab="${tab}" type="button">
    <div class="dash-block-top"><span class="dash-ico">${DASH_ICONS[tab]}</span><span class="dash-label">${label}</span></div>
    <div class="dash-value">${escapeHtml(value)}</div>
    <div class="dash-sub">${escapeHtml(sub)}</div>
  </button>`;
}

// Grille de résumés cliquables (dashboard) : un bloc par section, chacun affichant
// un résumé pertinent pour la journée/l'état courant. Ne duplique aucun calcul —
// réutilise les mêmes fonctions que les pages complètes (dayTotals, weeklyDeficit,
// weighInTrend...). Cliquer navigue vers la page complète via switchTab().
function dashboardGrid(t){
  const remaining = settings.calorieGoal - t.kcalIn;
  const over = t.kcalIn > settings.calorieGoal;
  const mealsSub = over ? `Dépassé de ${Math.round(-remaining)} kcal` : `${Math.round(remaining)} kcal restants`;
  const mealsCard = dashCard('meals', 'Repas', `${Math.round(t.kcalIn)} kcal`, mealsSub, over);

  const todaysWorkouts = entriesFor(currentDate).filter(e=>e.type==='workout');
  const wkKcal = Math.round(todaysWorkouts.reduce((s,e)=>s+e.kcalBurned,0));
  const wkValue = todaysWorkouts.length ? `${todaysWorkouts.length} séance${todaysWorkouts.length>1?'s':''}` : 'Aucune';
  const wkSub = todaysWorkouts.length ? `${wkKcal} kcal brûlées (info)` : "Rien aujourd'hui";
  const workoutsCard = dashCard('workouts', 'Séances', wkValue, wkSub);

  // Placée juste après "Repas" (les deux touchent à la nutrition). Résumé sur les
  // livres plutôt qu'un simple compteur de recettes : c'est le rangement par livre
  // qui est le point d'entrée mental de cette page, pas la liste plate.
  const recipesValue = recipes.length ? `${recipes.length} recette${recipes.length>1?'s':''}` : 'Aucune';
  const recipesSub = recipeBooks.length ? `${recipeBooks.length} livre${recipeBooks.length>1?'s':''}` : 'Crée un livre';
  const recipesCard = dashCard('recipes', 'Recettes', recipesValue, recipesSub);

  const sortedW = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date));
  const latestW = sortedW[0];
  let weightValue = '—', weightSub = 'Aucune pesée';
  if(latestW){
    weightValue = `${latestW.weight} kg`;
    const trend = weighInTrend([...sortedW].reverse().map(e=>({date:e.date,weight:e.weight})), 'weight');
    if(trend && trend.perWeek!=null){
      weightSub = Math.abs(trend.perWeek)<0.15 ? 'Stable' : `${trend.perWeek<0?'↓':'↑'} ${Math.abs(trend.perWeek).toFixed(2)} kg/sem`;
    } else weightSub = dateLabel(latestW.date);
  }
  const weightCard = dashCard('weight', 'Poids', weightValue, weightSub);

  // Série de jours dans l'objectif plutôt que le déficit hebdomadaire (qui fait
  // doublon avec le graphique 7 jours juste en dessous) — cadré positivement
  // (aucune mention d'un jour manqué/"cassé") pour rester dans l'esprit
  // "responsabiliser sans stresser" demandé par l'utilisateur, plutôt qu'un
  // indicateur de retard façon outil de suivi de tâches professionnel.
  const streak = calorieStreak();
  const histValue = streak>0 ? `${streak} jour${streak>1?'s':''}` : '—';
  const histSub = streak>0 ? "d'affilée dans l'objectif" : 'Commence aujourd\'hui';
  const historyCard = dashCard('history', 'Historique', histValue, histSub);

  // Aperçu de la note du jour si il y en a une (vraiment récente, donc pertinente) —
  // sinon retombe sur un simple compteur plutôt que d'afficher une note ancienne
  // (ex. vieille de 10 jours) qui n'aurait plus rien à voir avec "aujourd'hui".
  const notesTodaySorted = entriesFor(currentDate).filter(e=>e.type==='note').sort((a,b)=>b.time.localeCompare(a.time));
  const notesTotal = logEntries.filter(e=>e.type==='note').length;
  const notesCard = notesTodaySorted[0]
    ? dashCard('notes', 'Notes', truncateText(notesTodaySorted[0].text, 42), "Aujourd'hui")
    : dashCard('notes', 'Notes', notesTotal ? `${notesTotal} note${notesTotal>1?'s':''}` : '—', 'Aucune aujourd\'hui');

  const pendingTodos = todos.filter(x=>!x.done).length;
  const todosCard = dashCard('todos', 'To-do', pendingTodos ? `${pendingTodos} à faire` : 'Tout fait ✓', `${todos.length} au total`);

  const pendingShop = shoppingList.filter(x=>!x.checked).length;
  const shopCard = dashCard('shopping', 'Courses', pendingShop ? `${pendingShop} à acheter` : (shoppingList.length ? 'Tout coché' : 'Liste vide'), `${shoppingList.length} article${shoppingList.length>1?'s':''} au total`);

  return `<section class="dash-grid">
    ${mealsCard}${recipesCard}${workoutsCard}${weightCard}${historyCard}${notesCard}${todosCard}${shopCard}
  </section>`;
}

/* ===================== KALO COMPREND (insights niveau 1/2, factuels et sourcés) =====================
   Règles volontaires, discutées avec l'utilisateur :
   - Uniquement des observations descriptives et vérifiables (jamais d'interprétation
     causale type "tu perds du gras" ou "ça ralentit ta perte") — le texte reste au
     niveau du simple constat chiffré.
   - Rien n'est affiché si les données sont insuffisantes ou si l'écart est trivial :
     pas de "Kalo a remarqué" vide ni de faux positif sur du bruit normal.
   - Seuils choisis pour rester cohérents avec l'existant plutôt qu'inventés au hasard
     (0.15kg = déjà le seuil "stable" utilisé dans dashboardGrid()/weighInSummary()). */
const INSIGHT_WEIGHT_DELTA_KG = 0.15;
const INSIGHT_MIN_DISTINCT_WEIGHIN_DAYS = 4;
const INSIGHT_MIN_WEEKDAY_LOGGED_DAYS = 5;
const INSIGHT_MIN_WEEKEND_LOGGED_DAYS = 4; // remonté de 3 à 4 : avec 3, un seul jour
// atypique (anniversaire, resto) représentait déjà un tiers de l'échantillon et
// pouvait à lui seul déclencher l'insight. Pas de suppression d'outlier pour
// autant (nouvelle hypothèse méthodologique à part entière, pas encore justifiée) —
// on préfère demander plus de données plutôt qu'un insight séduisant mais fragile.
const INSIGHT_KCAL_RELATIVE_DELTA = 0.10; // 10%
// Plancher absolu en plus du seuil relatif : sans lui, un écart relatif important
// sur une base très faible (ex. 500 -> 560 kcal, +12% mais seulement 60 kcal réels)
// déclenchait l'insight pour une différence négligeable en pratique — repéré en
// testant volontairement ce cas limite.
const INSIGHT_KCAL_ABSOLUTE_DELTA = 150;

// Moyenne "un point par jour" : si plusieurs pesées existent le même jour, ce
// jour-là ne compte qu'une fois (sa propre moyenne) dans la moyenne de fenêtre —
// sinon un jour avec 3 pesées pèserait 3x plus qu'un jour avec 1 pesée, biaisant
// le résultat vers les jours les plus mesurés plutôt que de refléter la période.
function avgOnePerDay(entries, field){
  const byDate = {};
  entries.forEach(e=>{ (byDate[e.date] = byDate[e.date]||[]).push(e[field]); });
  const dailyAvgs = Object.values(byDate).map(vals=>vals.reduce((s,v)=>s+v,0)/vals.length);
  return dailyAvgs.length ? dailyAvgs.reduce((s,v)=>s+v,0)/dailyAvgs.length : null;
}

// Compare la moyenne (un point/jour) des 7 derniers jours à celle des 7 jours
// précédents. Ne réutilise PAS weighInTrend() (delta premier/dernier point du
// tableau) : ce calcul-là est sensible à une pesée isolée en bord de fenêtre,
// exactement le biais que cet insight doit éviter.
function weightTrendInsight(){
  const today = todayStr();
  const inRange = (d, start, end) => d>=start && d<=end;
  const windowA = weightEntries.filter(e=>inRange(e.date, shiftDate(today,-6), today));
  const windowB = weightEntries.filter(e=>inRange(e.date, shiftDate(today,-13), shiftDate(today,-7)));
  const daysA = new Set(windowA.map(e=>e.date)).size;
  const daysB = new Set(windowB.map(e=>e.date)).size;
  if(daysA < INSIGHT_MIN_DISTINCT_WEIGHIN_DAYS || daysB < INSIGHT_MIN_DISTINCT_WEIGHIN_DAYS) return null;
  const avgA = avgOnePerDay(windowA, 'weight');
  const avgB = avgOnePerDay(windowB, 'weight');
  const delta = avgA - avgB;
  if(Math.abs(delta) < INSIGHT_WEIGHT_DELTA_KG) return null;
  const dir = delta<0 ? 'inférieur' : 'supérieur';
  return { id:'weight_trend', text:`Ton poids moyen des 7 derniers jours (${avgA.toFixed(1)} kg) est ${dir} à celui des 7 jours précédents (${avgB.toFixed(1)} kg).` };
}

// Compare la moyenne des apports caloriques journaliers entre jours de semaine et
// jours de week-end, sur les 14 derniers jours — uniquement sur les jours
// réellement loggués (au moins un repas ce jour-là), pas sur le nombre brut de
// repas, pour ne pas comparer 1 samedi à 5 jours de semaine complets.
function weekendVsWeekdayInsight(){
  const today = todayStr();
  const weekdayTotals = [], weekendTotals = [];
  for(let i=0;i<14;i++){
    const d = shiftDate(today, -i);
    if(!entriesFor(d).some(e=>e.type==='meal')) continue;
    const dow = new Date(d+'T12:00:00').getDay(); // 0=dimanche, 6=samedi
    const kcal = dayTotals(d).kcalIn;
    (dow===0 || dow===6 ? weekendTotals : weekdayTotals).push(kcal);
  }
  if(weekdayTotals.length < INSIGHT_MIN_WEEKDAY_LOGGED_DAYS || weekendTotals.length < INSIGHT_MIN_WEEKEND_LOGGED_DAYS) return null;
  const avgWeekday = weekdayTotals.reduce((s,v)=>s+v,0)/weekdayTotals.length;
  const avgWeekend = weekendTotals.reduce((s,v)=>s+v,0)/weekendTotals.length;
  const absDelta = Math.abs(avgWeekend-avgWeekday);
  const relDelta = absDelta/avgWeekday;
  if(relDelta < INSIGHT_KCAL_RELATIVE_DELTA || absDelta < INSIGHT_KCAL_ABSOLUTE_DELTA) return null;
  const dir = avgWeekend>avgWeekday ? 'plus élevés' : 'moins élevés';
  return { id:'weekend_vs_weekday', text:`Sur les 14 derniers jours, tes apports journaliers moyens sont ${dir} le week-end (${Math.round(avgWeekend)} kcal) que les jours de semaine (${Math.round(avgWeekday)} kcal).` };
}

/* ===================== MOTEUR DE COMPARAISON DE PÉRIODES =====================
   Couche de CONTEXTE générique (brique 7), pas un Insight : ne décide jamais de
   ce qui s'affiche, ne formule aucune phrase, ne déduit aucune causalité.
   Fondation pour un futur Insight "Ce qui a changé" (brique 7A), puis le
   contexte croisé (brique 8) — même séparation détecteur/Insight que
   recurringMealPatterns() ci-dessous : comparePeriods() remonte des faits
   mesurés et leur fiabilité, jamais une interprétation.

   "Période calendaire" (jours du range) != "période de suivi" (jours où
   l'utilisateur a réellement loggué). Deux familles de métriques :
   - déclaratives (poids, kcal, protéines) : l'absence d'entrée un jour donné
     ne dit rien sur la réalité de ce jour-là (a-t-il mangé sans logguer, ou pas
     mangé du tout ?) -> une moyenne sur trop peu de jours loggués est
     trompeuse, gatée par une couverture minimale avant d'être exposée.
   - constatées (jours loggués, séances/semaine) : l'absence d'entrée EST
     l'information (pas de séance ce jour-là = 0, un fait, pas une donnée
     manquante) -> pas de seuil de couverture, la période calendaire est déjà
     l'échantillon complet et totalement connu. */

// Couverture minimale pour qu'une moyenne déclarative (poids/kcal/protéines)
// soit jugée représentative : sous ce seuil, silence plutôt qu'une moyenne
// trompeuse sur des données trouées — même philosophie que les seuils Insights
// existants ("peu de comparaisons mais solides").
const PERIOD_MIN_COVERAGE_RATIO = 0.5;
// Plancher absolu en plus du ratio : sur une période de 7j, 50% ne représente
// que 3-4 jours — aligné sur les minimums déjà utilisés par les Insights
// existants (ex. INSIGHT_MIN_DISTINCT_WEIGHIN_DAYS = 4 plus haut).
const PERIOD_MIN_COVERAGE_DAYS = 3;
// Écart de couverture (jours loggués / longueur de période) jugé significatif,
// en points de ratio plutôt qu'en nombre brut de jours : comparable entre
// périodes de longueurs différentes (7 vs 14 vs 30j), contrairement à un delta
// de jours fixe. Nouveau seuil (pas de convention existante à reprendre pour
// cette métrique), arbitraire mais documenté, à ajuster avec l'usage réel.
const PERIOD_LOGGED_DAYS_COVERAGE_DELTA = 0.20;
// Écart de fréquence d'entraînement jugé significatif : une séance/semaine de
// plus ou de moins est la plus petite unité qui a un sens pour l'utilisateur
// ("une séance en plus/en moins par semaine"). Nouveau seuil, documenté, à
// ajuster avec l'usage.
const PERIOD_SESSIONS_DELTA_PER_WEEK = 1;

function periodDayList(start, end){
  const days = [];
  for(let d=start; d<=end; d=shiftDate(d,1)) days.push(d);
  return days;
}

// Résultat commun à toute métrique : { value, sampleSize, coverage, periodLength, enough }.
// `enough` = false => value est toujours null, jamais une moyenne calculée sur
// une couverture insuffisante puis cachée seulement côté affichage.
function declarativeMetric(calendarDays, loggedDates, dailyValue){
  const logged = calendarDays.filter(d=>loggedDates.has(d));
  const coverage = calendarDays.length ? logged.length/calendarDays.length : 0;
  const enoughCoverage = logged.length >= PERIOD_MIN_COVERAGE_DAYS && coverage >= PERIOD_MIN_COVERAGE_RATIO;
  const vals = enoughCoverage ? logged.map(dailyValue).filter(v=>v!=null) : [];
  const value = vals.length ? vals.reduce((s,v)=>s+v,0)/vals.length : null;
  return { value, sampleSize:logged.length, coverage, periodLength:calendarDays.length, enough: enoughCoverage && value!=null };
}

// Métrique constatée : pas de seuil de couverture (voir note d'en-tête), donc
// toujours `enough:true` dès que la période elle-même est valide.
function observedMetric(value, sampleSize, periodLength){
  return { value, sampleSize, coverage:1, periodLength, enough:true };
}

// Registre des métriques comparables. Chaque entrée : compute(start,end) pour
// mesurer une période, sigDelta(metricA,metricB) pour juger si l'écart entre
// deux mesures DÉJÀ jugées `enough` est assez important pour être exposé (le
// seuil et sa justification sont documentés à côté de chaque sigDelta), et
// format() pour un futur affichage (non utilisé par le moteur lui-même).
const PERIOD_METRICS = {
  weight: {
    label: 'Poids moyen',
    compute(start,end){
      const days = periodDayList(start,end);
      const inRange = weightEntries.filter(e=>e.date>=start && e.date<=end);
      const loggedDates = new Set(inRange.map(e=>e.date));
      return declarativeMetric(days, loggedDates, d=>avgOnePerDay(inRange.filter(e=>e.date===d), 'weight'));
    },
    // Reprend le seuil déjà établi par weightTrendInsight() (0.15kg) plutôt que
    // d'en inventer un nouveau pour le même type de comparaison.
    sigDelta(a,b){ return Math.abs(a.value-b.value) >= INSIGHT_WEIGHT_DELTA_KG; },
    format(m){ return m.value.toFixed(1)+' kg'; },
    unit: 'kg',
    numberFormat(v){ return v.toFixed(1); },
  },
  kcal: {
    label: 'Calories moyennes/jour',
    compute(start,end){
      const days = periodDayList(start,end);
      const loggedDates = new Set(days.filter(d=>entriesFor(d).some(e=>e.type==='meal')));
      return declarativeMetric(days, loggedDates, d=>dayTotals(d).kcalIn);
    },
    // Reprend le double seuil (relatif ET absolu) déjà établi par
    // weekendVsWeekdayInsight() pour ce même type de donnée.
    sigDelta(a,b){
      const abs = Math.abs(a.value-b.value), rel = abs/Math.max(a.value,1);
      return rel >= INSIGHT_KCAL_RELATIVE_DELTA && abs >= INSIGHT_KCAL_ABSOLUTE_DELTA;
    },
    format(m){ return Math.round(m.value)+' kcal'; },
    unit: 'kcal/j',
    numberFormat(v){ return Math.round(v); },
  },
  protein: {
    label: 'Protéines moyennes/jour',
    compute(start,end){
      const days = periodDayList(start,end);
      const loggedDates = new Set(days.filter(d=>entriesFor(d).some(e=>e.type==='meal')));
      return declarativeMetric(days, loggedDates, d=>dayTotals(d).protein);
    },
    // Pas de convention existante pour les protéines : nouveau seuil, sur le
    // même schéma (relatif + absolu) que kcal. 15% relatif (un peu plus
    // permissif que les 10% kcal, les protéines variant naturellement plus
    // d'un jour à l'autre) ET 15g absolus (~une portion de viande/whey), pour
    // éviter qu'un écart relatif important sur une base faible ne déclenche à
    // tort. Arbitraire mais documenté, à ajuster avec l'usage réel.
    sigDelta(a,b){
      const abs = Math.abs(a.value-b.value), rel = abs/Math.max(a.value,1);
      return rel >= 0.15 && abs >= 15;
    },
    format(m){ return Math.round(m.value)+' g'; },
    unit: 'g/j',
    numberFormat(v){ return Math.round(v); },
  },
  loggedDays: {
    label: 'Jours loggués',
    compute(start,end){
      const days = periodDayList(start,end);
      const logged = days.filter(d=>entriesFor(d).some(e=>e.type==='meal'));
      return observedMetric(logged.length, logged.length, days.length);
    },
    sigDelta(a,b){
      const covA = a.value/Math.max(a.periodLength,1), covB = b.value/Math.max(b.periodLength,1);
      return Math.abs(covA-covB) >= PERIOD_LOGGED_DAYS_COVERAGE_DELTA;
    },
    format(m){ return `${m.value}/${m.periodLength} j`; },
  },
  sessionsPerWeek: {
    label: 'Séances / semaine',
    compute(start,end){
      const days = periodDayList(start,end);
      const count = logEntries.filter(e=>e.type==='workout' && e.date>=start && e.date<=end).length;
      const rate = count / (days.length/7);
      return observedMetric(rate, count, days.length);
    },
    sigDelta(a,b){ return Math.abs(a.value-b.value) >= PERIOD_SESSIONS_DELTA_PER_WEEK; },
    format(m){ return m.value.toFixed(1)+'/sem'; },
    unit: '/sem',
    numberFormat(v){ return v.toFixed(1); },
  },
};

// Périodes glissantes pratiques ("7 derniers jours", "les 7 précédents"...) —
// simples générateurs de {start,end}, aucune logique métier.
function recentPeriod(days, endOffsetDays=0){
  const end = shiftDate(todayStr(), -endOffsetDays);
  const start = shiftDate(end, -(days-1));
  return {start, end};
}
function precedingPeriod(period, days){
  const end = shiftDate(period.start, -1);
  const start = shiftDate(end, -(days-1));
  return {start, end};
}

// Moteur : compare deux périodes sur un jeu de métriques. Ne retourne QUE des
// faits + leur statut de fiabilité — trois états possibles par métrique
// (jamais de 4e état "texte pas assez de données", jamais de moyenne fournie
// avec `enough:false`) :
//  - 'insufficient_data'  : au moins une des deux périodes n'a pas assez de
//                           couverture -> aucune comparaison exploitable.
//  - 'stable'              : les deux mesures sont fiables mais l'écart ne
//                           franchit pas le seuil de significativité -> rien à
//                           signaler (pas une absence de calcul, une absence
//                           de signal).
//  - 'significant_change'  : écart fiable ET assez important pour être montré.
function comparePeriods({current, previous, metrics}){
  const ids = metrics && metrics.length ? metrics : Object.keys(PERIOD_METRICS);
  const out = {};
  ids.forEach(id=>{
    const def = PERIOD_METRICS[id];
    if(!def) return;
    const a = def.compute(current.start, current.end);
    const b = def.compute(previous.start, previous.end);
    let status;
    if(!a.enough || !b.enough) status = 'insufficient_data';
    else status = def.sigDelta(a,b) ? 'significant_change' : 'stable';
    out[id] = {
      id, label: def.label, status,
      current: a, previous: b,
      delta: (a.enough && b.enough) ? a.value-b.value : null,
    };
  });
  return out;
}

// Formulations strictement descriptives (brique 7A) : jamais de qualificatif de
// magnitude ("légèrement"/"nettement") dans le texte — l'ampleur est portée par
// les chiffres affichés à côté, jamais par le choix des mots. Aucune causalité,
// aucune recommandation : un fait mesuré, pas une explication.
const WHAT_CHANGED_TEXT = {
  weight: {
    up: `Ton poids moyen est supérieur à celui de la semaine précédente.`,
    down: `Ton poids moyen est inférieur à celui de la semaine précédente.`,
  },
  kcal: {
    up: `Ton apport calorique moyen a augmenté par rapport à la semaine précédente.`,
    down: `Ton apport calorique moyen a diminué par rapport à la semaine précédente.`,
  },
  protein: {
    up: `Ton apport moyen en protéines a augmenté par rapport à la semaine précédente.`,
    down: `Ton apport moyen en protéines a diminué par rapport à la semaine précédente.`,
  },
  sessionsPerWeek: {
    up: `Tu as enregistré plus de séances cette semaine que la précédente.`,
    down: `Tu as enregistré moins de séances cette semaine que la précédente.`,
  },
  loggedDays: {
    up: `Tu as loggé plus de jours cette semaine que la semaine précédente.`,
    down: `Tu as loggé moins de jours cette semaine que la semaine précédente.`,
  },
};
// Libellés courts pour la ligne chiffrée (présentation) — distincts du `label`
// du moteur (plus verbeux, ex. "Calories moyennes/jour") qui reste un détail
// d'implémentation de comparePeriods(), pas un texte d'affichage.
const WHAT_CHANGED_FIGURE_LABEL = {
  weight: 'Poids', kcal: 'Calories', protein: 'Protéines',
  sessionsPerWeek: 'Séances', loggedDays: 'Jours loggués',
};
// Ordre de priorité + familles "contenu" vs "méta" (brique 7A, voir README /
// discussion produit) : contenu = signal sur le corps/l'alimentation/l'activité,
// méta = signal sur le comportement de tracking lui-même (pas un signal
// physiologique). `loggedDays` n'est jamais montré à côté d'une métrique de
// contenu significative — uniquement quand c'est le SEUL signal de la semaine
// (règle structurelle, pas une détection de corrélation réelle).
const WHAT_CHANGED_CONTENT_IDS = ['weight', 'kcal', 'protein', 'sessionsPerWeek'];

// Un seul calcul par rendu : whatChangedInsight() et weightIntakeAlignment()
// partagent le même objet `cmp` (comparePeriods() reste l'unique source de
// vérité, brique 8A) — pas de recalcul, pas d'état divergent entre les deux.
function weeklyMetricsComparison(){
  const current = recentPeriod(7);
  const previous = precedingPeriod(current, 7);
  return comparePeriods({ current, previous, metrics: [...WHAT_CHANGED_CONTENT_IDS, 'loggedDays'] });
}

// Construit une "figure" (ligne chiffrée préc. → actuel) pour une métrique déjà
// jugée `enough` — factorisé pour être identique entre affichage simple et
// affichage combiné (brique 8A).
function whatChangedFigure(id, m){
  const def = PERIOD_METRICS[id];
  // loggedDays reste sous forme de fraction (ex. "3/7 j") des deux côtés — pas
  // de "nombre + unité une seule fois" comme les autres métriques, sa forme
  // naturelle inclut déjà le dénominateur.
  const value = id==='loggedDays'
    ? `${def.format(m.previous)} → ${def.format(m.current)}`
    : `${def.numberFormat(m.previous.value)} → ${def.numberFormat(m.current.value)} ${def.unit}`;
  return { label: WHAT_CHANGED_FIGURE_LABEL[id], value };
}

// Contexte croisé A1 (brique 8A) : poids + calories évoluent significativement
// dans le MÊME sens sur la même fenêtre 7v7. Ne recalcule rien — lit
// uniquement les `status`/`delta` déjà produits par comparePeriods(). Directions
// opposées -> silence volontaire (pas "candidat mais non affiché" : null pur),
// parce qu'une divergence affichée sans pouvoir l'expliquer crée une question
// sans réponse plutôt qu'une observation utile. Aucune formulation causale
// ("parce que", "ce qui explique", "grâce à") : uniquement un constat de
// co-mouvement, jamais un mécanisme.
function weightIntakeAlignment(cmp){
  const w = cmp.weight, k = cmp.kcal;
  // `status` vaut déjà 'insufficient_data' dès que l'une des deux périodes n'est
  // pas `enough` (voir comparePeriods()) : exiger 'significant_change' des deux
  // côtés couvre à la fois le seuil ET la règle "limité par le signal le moins
  // fiable des deux" en une seule condition, sans relire `enough` séparément.
  if(w.status!=='significant_change' || k.status!=='significant_change') return null;
  if(Math.sign(w.delta) !== Math.sign(k.delta)) return null;
  const text = w.delta<0
    ? `Ton apport calorique moyen et ton poids moyen ont tous les deux diminué par rapport à la semaine précédente.`
    : `Ton apport calorique moyen et ton poids moyen ont tous les deux augmenté par rapport à la semaine précédente.`;
  // Ordre calories puis poids : suit l'ordre de la phrase ("apport calorique...
  // et... poids..."), pas l'ordre de priorité général weight>kcal (qui régit la
  // SÉLECTION, pas la présentation d'un groupe déjà sélectionné).
  return { metrics:['weight','kcal'], text, figures:[whatChangedFigure('kcal',k), whatChangedFigure('weight',w)] };
}

// Formulations B1 — purement descriptives, aucun mot d'interprétation ("tu
// n'as pas compensé", "cela risque de", "c'est pourquoi") : uniquement le
// contraste entre les deux faits, jamais une explication du contraste.
const ACTIVITY_INTAKE_TEXT = {
  up: `Ton nombre de séances a augmenté cette semaine alors que ton apport calorique moyen est resté stable.`,
  down: `Ton nombre de séances a diminué cette semaine alors que ton apport calorique moyen est resté stable.`,
};

// Contexte croisé B1 (brique 8B) : DIVERGENCE, pas co-mouvement comme A1 — un
// signal change significativement pendant que l'autre reste stable (avec
// assez de données, voir note ci-dessous). C'est le contraste lui-même qui est
// l'info, pas une explication de ce contraste. Volontairement restreint à
// sessionsPerWeek/kcal en V1 (pas de généralisation à d'autres paires) et
// volontairement restreint au poids EXCLU de cet Insight même s'il bouge en
// même temps (mélanger 3 signaux commencerait à suggérer une mécanique
// causale implicite) — le poids reste un contexte séparé, éventuel, pour plus
// tard.
function activityIntakeShift(cmp){
  const s = cmp.sessionsPerWeek, k = cmp.kcal;
  if(s.status!=='significant_change') return null;
  // 'stable' ne peut être atteint par comparePeriods() que si les deux côtés
  // sont `enough` (sinon le statut serait 'insufficient_data') — donc ce test
  // garantit à la fois "stable" ET "stable avec assez de données", sans
  // relire `enough` séparément (même principe que weightIntakeAlignment()).
  if(k.status!=='stable') return null;
  const dir = s.delta>0 ? 'up' : 'down';
  // Ordre séances puis calories : suit l'ordre de la phrase ("nombre de
  // séances... alors que... apport calorique..."), pas l'ordre de priorité
  // général (qui régit la SÉLECTION, pas la présentation d'un groupe déjà
  // sélectionné) — même convention que weightIntakeAlignment().
  return { metrics:['sessionsPerWeek','kcal'], text: ACTIVITY_INTAKE_TEXT[dir], figures:[whatChangedFigure('sessionsPerWeek',s), whatChangedFigure('kcal',k)] };
}

// Insight-layer (brique 7A, étendu 8A/8B) au-dessus de comparePeriods() :
// compose jusqu'à 2 "groupes" affichés dans "Ce qui a changé". Un groupe est
// soit un contexte croisé (A1 co-mouvement OU B1 divergence — structurellement
// exclusifs entre eux : A1 exige kcal significatif, B1 exige kcal stable, les
// deux ne peuvent jamais être vrais simultanément), soit une métrique simple.
// Ne décide PAS de la subsomption avec weightTrendInsight() ni de la place
// dans les 2 slots globaux — ce choix reste centralisé dans kaloInsights().
function whatChangedInsight(){
  const cmp = weeklyMetricsComparison();
  const groups = [];
  let consumedIds = [];

  const alignment = weightIntakeAlignment(cmp);
  if(alignment){
    groups.push({ kind:'weight_intake_alignment', ...alignment });
    consumedIds = consumedIds.concat(alignment.metrics);
  }

  const shift = activityIntakeShift(cmp);
  if(shift){
    groups.push({ kind:'activity_intake_shift', ...shift });
    consumedIds = consumedIds.concat(shift.metrics);
  }

  WHAT_CHANGED_CONTENT_IDS
    .filter(id => !consumedIds.includes(id) && cmp[id].status==='significant_change')
    .forEach(id=>{
      if(groups.length >= INSIGHT_MAX_SHOWN) return;
      const m = cmp[id];
      const dir = m.delta>0 ? 'up' : 'down';
      groups.push({ kind:id, metrics:[id], text: WHAT_CHANGED_TEXT[id][dir], figures:[whatChangedFigure(id,m)] });
    });

  // Repli méta loggedDays : uniquement si AUCUN signal de contenu (via A1 ou
  // seul) n'a produit de groupe — jamais en complément d'un groupe de contenu
  // (règle brique 7A inchangée).
  if(!groups.length && cmp.loggedDays.status==='significant_change'){
    const m = cmp.loggedDays, dir = m.delta>0 ? 'up' : 'down';
    groups.push({ kind:'loggedDays', metrics:['loggedDays'], text: WHAT_CHANGED_TEXT.loggedDays[dir], figures:[whatChangedFigure('loggedDays',m)] });
  }

  if(!groups.length) return null;
  return { id:'what_changed', metrics:[...new Set(groups.flatMap(g=>g.metrics))], items: groups };
}

/* ===================== DÉTECTEUR GÉNÉRIQUE DE REPAS RÉCURRENTS =====================
   Brique de CONNAISSANCE réutilisable (Insights, recherche, suggestions, future
   section "Repas habituels", quick-add...) — volontairement séparée de la couche
   Insight : cette fonction ne décide jamais de ce qui s'affiche à l'utilisateur,
   elle se contente de remonter les patterns détectés. C'est à l'appelant (ex.
   commonBreakfastInsight() ci-dessous) de choisir s'il expose tel pattern —
   remonter automatiquement TOUS les patterns détectés dans "Kalo a remarqué"
   transformerait vite le dashboard en inventaire de repas sans valeur (4 lignes
   "ton petit-déj/déjeuner/dîner/collation est récurrent").

   Signature : ensemble des foodId présents (ordre et grammage ignorés — une
   variation de portion ne doit pas fragmenter le pattern), zéro fuzzy matching,
   zéro embedding, zéro IA. Un ingrédient ajouté/retiré = signature différente,
   assumé (pas de tolérance floue). Les entrées sans foodId (repas IA en texte
   libre, sans identité stable) comptent dans l'échantillon du créneau mais ne
   peuvent jamais faire gagner une combinaison — dilue honnêtement la confiance
   plutôt que de les ignorer silencieusement.

   `mealSlots` attend directement les valeurs de MEAL_SLOTS (déjà l'identifiant
   ET le libellé dans ce modèle de données — pas de mapping anglais/français à
   maintenir en plus). Chaque créneau est détecté indépendamment : deux créneaux
   ne se mélangent jamais, et une même combinaison sur deux créneaux produit deux
   patterns distincts (ex. "café + tartines" au petit-déj ET en collation). */
function recurringMealPatterns({days, mealSlots, minSamples, minShare, minLeadPts}){
  const today = todayStr();
  const patterns = [];
  mealSlots.forEach(slot=>{
    const comboCounts = {}; // signature -> {count, foodIds, entries:[], lastSeen}
    let totalSlotDays = 0;
    for(let i=0;i<days;i++){
      const d = shiftDate(today, -i);
      const dayMeals = entriesFor(d).filter(e=>e.type==='meal' && e.mealSlot===slot);
      if(!dayMeals.length) continue;
      totalSlotDays++;
      const withFoodId = dayMeals.filter(e=>e.foodId);
      if(!withFoodId.length) continue; // jour compté, mais aucune combinaison possible
      const ids = [...new Set(withFoodId.map(e=>e.foodId))].sort();
      const sig = ids.join('|');
      if(!comboCounts[sig]) comboCounts[sig] = {count:0, foodIds:ids, entries:[], lastSeen:null};
      const bucket = comboCounts[sig];
      bucket.count++;
      bucket.entries.push(...withFoodId);
      if(!bucket.lastSeen || d>bucket.lastSeen) bucket.lastSeen = d;
    }
    if(totalSlotDays < minSamples) return;
    const combos = Object.values(comboCounts).sort((a,b)=>b.count-a.count);
    const top = combos[0];
    if(!top) return;
    const topShare = top.count/totalSlotDays;
    if(topShare <= minShare) return;
    const second = combos[1];
    if(second && (second.count/totalSlotDays) >= topShare - (minLeadPts/100)) return;
    patterns.push({
      mealSlot: slot,
      foodIds: top.foodIds,
      matchingEntries: top.entries,
      count: top.count,
      share: topShare,
      lastSeen: top.lastSeen,
    });
  });
  return patterns;
}

// Seuils de dominance (brique 6/9B) : mêmes valeurs qu'avant la généralisation
// (window 30j, 8 échantillons min, majorité stricte >50%, 2e option à plus de
// 10 points d'écart) — appliqués maintenant à N'IMPORTE QUEL créneau, pas
// seulement Petit-déj. Un seul jeu de seuils pour les 4 créneaux : pas de
// raison produit d'avoir un dîner "habituel" plus facile à établir qu'un
// petit-déj habituel.
const FREQUENT_MEAL_WINDOW_DAYS = 30;
const FREQUENT_MEAL_MIN_SAMPLES = 8;
const FREQUENT_MEAL_DOMINANT_RATIO = 0.5; // strictement >, un 50/50 pile ne compte pas
const FREQUENT_MEAL_CLOSE_MARGIN_PTS = 10; // 2e option à moins de 10 points -> trop ambigu

// Couche Insight générique (brique 9B) : UN seul helper pour les 4 créneaux —
// remplace l'ancienne logique spécifique au petit-déj. Toujours un wrapper fin
// autour de recurringMealPatterns(), aucune logique de regroupement propre.
// Le detector applique déjà exactement la règle de dominance qu'on veut (>50%
// ET marge de 10pts sur le 2e) : pas de "top-N" à construire, un seul appelant
// peut donc toujours se contenter de patterns[0] ou null.
function frequentMealFor(slot){
  const patterns = recurringMealPatterns({
    days: FREQUENT_MEAL_WINDOW_DAYS,
    mealSlots: [slot],
    minSamples: FREQUENT_MEAL_MIN_SAMPLES,
    minShare: FREQUENT_MEAL_DOMINANT_RATIO,
    minLeadPts: FREQUENT_MEAL_CLOSE_MARGIN_PTS,
  });
  const top = patterns[0];
  if(!top) return null;
  const names = top.foodIds.map(id=>allFoods().find(f=>f.id===id)?.name).filter(Boolean);
  if(!names.length) return null;
  return { mealSlot: top.mealSlot, foodIds: top.foodIds, matchingEntries: top.matchingEntries, names };
}

// Choisit d'exposer UNIQUEMENT le pattern petit-déjeuner sur "Kalo a remarqué"
// (pas les 3 autres créneaux, volontairement — voir note sur
// recurringMealPatterns() ci-dessus) : cooldown 4j, plafond 2 insights,
// formulation "Kalo a remarqué" — adapté à une OBSERVATION, pas à un
// raccourci utilitaire. Les 3 autres créneaux sont exposés différemment,
// sans cooldown, directement dans le flow d'ajout (voir viewMeals()).
function commonBreakfastInsight(){
  const pattern = frequentMealFor('Petit-déj');
  if(!pattern) return null;
  return {
    id:'breakfast_combo',
    text:`Ton petit-déjeuner le plus fréquent est : ${frenchList(pattern.names)}.`,
    mealSlot: pattern.mealSlot,
    foodIds: pattern.foodIds,
    matchingEntries: pattern.matchingEntries,
  };
}

// Médiane (pas moyenne) : résiste à l'outlier (ex. 100/100/110/105/300 -> ~105,
// pas ~143) sans logique de nettoyage ad hoc — voir spec Quick-add.
function medianGrams(values){
  const sorted = [...values].sort((a,b)=>a-b);
  const n = sorted.length;
  if(!n) return null;
  const mid = Math.floor(n/2);
  return n%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
}

// Portion habituelle d'un aliment (brique 9A) : médiane des grammages des
// TYPICAL_PORTION_RECENT_SAMPLES dernières entrées valides — pas une fenêtre
// calendaire. Pour un aliment rare, "les 8 dernières" = tout l'historique
// disponible (repli naturel, aucune branche de code séparée) ; pour un
// aliment fréquent, ça protège contre un historique ancien qui noierait un
// changement récent de portion (ex. 100g -> 160g). Seuil minimal
// TYPICAL_PORTION_MIN_SAMPLES : sous ce seuil, aucune personnalisation —
// jamais une portion suggérée sur une seule occurrence.
const TYPICAL_PORTION_MIN_SAMPLES = 3; // reprend PERIOD_MIN_COVERAGE_DAYS comme plancher déjà établi
const TYPICAL_PORTION_RECENT_SAMPLES = 8; // reprend INSIGHT_MIN_BREAKFAST_DAYS comme taille d'échantillon personnel déjà validée
function typicalGramsFor(foodId){
  const grams = logEntries
    .filter(e=>e.type==='meal' && e.foodId===foodId && e.grams!=null)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
    .slice(-TYPICAL_PORTION_RECENT_SAMPLES)
    .map(e=>e.grams);
  if(grams.length < TYPICAL_PORTION_MIN_SAMPLES) return null;
  return medianGrams(grams);
}

// Construit le brouillon Quick-add à partir d'un pattern détecté : pour chaque
// foodId, grammage = médiane des occurrences dans matchingEntries qui ont un
// grammage connu, sinon dernier grammage connu (toutes entrées confondues, pas
// seulement matchingEntries), sinon l'aliment est exclu du brouillon — jamais de
// grammage inventé.
function buildQuickAddDraft(insight){
  if(!insight || !insight.foodIds || !insight.foodIds.length) return null;
  const items = [];
  insight.foodIds.forEach(foodId=>{
    const food = allFoods().find(f=>f.id===foodId);
    if(!food) return;
    const gramsInPattern = (insight.matchingEntries||[])
      .filter(e=>e.foodId===foodId && e.grams!=null)
      .map(e=>e.grams);
    let grams = medianGrams(gramsInPattern);
    if(grams==null){
      const lastKnown = logEntries
        .filter(e=>e.type==='meal' && e.foodId===foodId && e.grams!=null)
        .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
        .pop();
      grams = lastKnown ? lastKnown.grams : null;
    }
    if(grams==null) return; // pas de quantité connue -> on n'invente rien, on exclut
    items.push({ foodId, food, grams: Math.round(grams) });
  });
  if(!items.length) return null;
  return { mealSlot: insight.mealSlot, items };
}

// Recalcule l'insight courant à partir de son id (aucun cache : appelé au clic sur
// le CTA Quick-add, sur des données potentiellement changées depuis le rendu).
function getInsightById(id){
  if(id==='weight_trend') return weightTrendInsight();
  if(id==='weekend_vs_weekday') return weekendVsWeekdayInsight();
  if(id==='breakfast_combo') return commonBreakfastInsight();
  return null;
}

// Cooldown minimal : un insight déjà montré ne réapparaît pas avant N jours, même
// s'il reste vrai — évite qu'un même constat (ex. tendance de poids stable sur
// plusieurs semaines) s'affiche à l'identique chaque jour. Volontairement basique
// (délai fixe, pas de détection d'amplitude/nouveauté du signal) : une vraie
// architecture "ne réafficher que si le signal a changé significativement" viendra
// plus tard, une fois qu'on aura du recul sur l'usage réel. Ça s'applique aussi à
// whatChangedInsight() (id 'what_changed') : le cooldown est purement temporel,
// PAS un dédoublonnage de contenu — si le poids+kcal déclenchent lundi puis que
// le signal change complètement mardi (ex. séances), l'insight reste masqué
// jusqu'à l'expiration du cooldown, même si le contenu qu'il montrerait a changé.
// Assumé pour cette V1 ; un futur "cooldown + nouveauté du signal" comparerait
// `insightsSeen[id]` à une signature du contenu (ex. hash des métriques+sens)
// plutôt qu'à une date seule — pas construit maintenant.
const INSIGHT_COOLDOWN_DAYS = 4;
// Plafond dur, indépendant du nombre d'insights qui existeront un jour : jamais
// plus de 2 affichés en même temps, pour ne pas transformer le dashboard en mur
// de cartes au fil de l'ajout de nouvelles briques.
const INSIGHT_MAX_SHOWN = 2;

function isInsightOnCooldown(id){
  const lastShown = insightsSeen[id];
  if(!lastShown) return false;
  const today = todayStr();
  // "Vu aujourd'hui" n'est pas un cooldown : c'est l'insight ACTUELLEMENT
  // affiché. Sans ce cas à part, un 2e render() le même jour (ex. changer
  // d'onglet puis revenir) le faisait disparaître pour le reste de la journée
  // (daysBetween(today,today)=0 < 4), donnant l'impression que Kalo retire une
  // info sans raison. Le cooldown de N jours ne s'applique qu'à PARTIR du
  // lendemain de la dernière apparition.
  if(lastShown === today) return false;
  return daysBetween(lastShown, today) < INSIGHT_COOLDOWN_DAYS;
}

// Toute la logique de priorité/subsomption entre Insights vit ICI, pas dispersée
// dans chaque fonction Insight (brique 7A) : whatChangedInsight() passe en
// premier (signal le plus riche), et s'il sélectionne 'weight' parmi ses
// métriques, weightTrendInsight() est subsumé (même calcul 7v7/0.15kg au fond)
// et retiré du pool pour ce rendu — pour ne jamais afficher deux fois la même
// observation de poids sous deux formulations différentes.
function kaloInsights(){
  const whatChanged = whatChangedInsight();
  const weightSubsumed = whatChanged && whatChanged.metrics.includes('weight');
  const candidates = [
    whatChanged,
    weightSubsumed ? null : weightTrendInsight(),
    weekendVsWeekdayInsight(),
    commonBreakfastInsight(),
  ].filter(Boolean);
  // Le filtrage cooldown se fait AVANT le plafond : un insight en cooldown libère
  // sa place pour un autre candidat éligible, plutôt que de bloquer un slot pour
  // rien.
  const eligible = candidates.filter(i=>!isInsightOnCooldown(i.id));
  const shown = eligible.slice(0, INSIGHT_MAX_SHOWN);
  let changed = false;
  shown.forEach(i=>{
    if(insightsSeen[i.id] !== todayStr()){ insightsSeen[i.id] = todayStr(); changed = true; }
  });
  if(changed) save();
  return shown;
}

// Carte "Kalo a remarqué" : n'apparaît PAS du tout si aucun insight ne passe ses
// seuils (jamais de carte vide ni de placeholder générique). Liseré --green (pas
// --rust : un insight n'est pas un avertissement) réutilisant le même mécanisme
// visuel déjà établi pour dash-block-attn, plutôt qu'une nouvelle couleur/pattern.
// Bloc "Ce qui a changé" (brique 7A) : distinct visuellement d'un insight simple
// (sous-titre + une ligne texte/chiffres par métrique sélectionnée) mais dans la
// MÊME carte "Kalo a remarqué" — pas de 2e carte. `items` reste une structure de
// données (id/text/figureLabel/figure) plutôt que du HTML pré-assemblé,
// volontairement, pour pouvoir brancher plus tard un "Voir le détail" sans
// reconstruire le composant ni recalculer quoi que ce soit.
function whatChangedBlock(i){
  return `<div class="insight-block" data-insight-id="${i.id}">
    <p class="insight-subhead">Ce qui a changé</p>
    ${i.items.map(g=>`<p class="insight-line">${escapeHtml(g.text)}</p>${g.figures.map(f=>`<div class="insight-figure-row"><span>${escapeHtml(f.label)}</span><span>${escapeHtml(f.value)}</span></div>`).join('')}`).join('')}
  </div>`;
}
function kaloInsightsCard(){
  const insights = kaloInsights();
  if(!insights.length) return '';
  return `<section class="card insights-card">
    <h2>Kalo a remarqué</h2>
    ${insights.map(i=> i.id==='what_changed' ? whatChangedBlock(i) :
      `<div data-insight-id="${i.id}"><p class="insight-line">${escapeHtml(i.text)}</p>${i.foodIds && i.foodIds.length ? `<button class="btn small ghost quickadd-cta" data-quickadd="${i.id}" type="button">Ajouter ce repas</button>` : ''}</div>`
    ).join('')}
  </section>`;
}

// Day 0 — onboarding minimal (voir discussion produit). Condition dérivée de
// l'état existant, pas un nouveau flag "onboardingDone" : un profil est
// considéré "nouveau" uniquement s'il n'a NI historique (repas/pesée) NI profil
// partiellement rempli — dès qu'une seule de ces conditions est fausse (même un
// utilisateur qui a juste ouvert l'onglet Poids sans finaliser), on ne force
// jamais l'écran, pour ne jamais interrompre quelqu'un qui a déjà commencé à
// utiliser l'app. Terminer l'onboarding pousse une pesée + renseigne le
// profil, donc isNewUser() redevient naturellement faux ensuite — aucun flag
// "vu" séparé à maintenir.
function isNewUser(){
  return logEntries.length===0 && weightEntries.length===0 && !profile.age && !profile.height;
}
// État transitoire (non persisté, comme mealSearchQ/qtyMode) : bascule
// l'onboarding sur son écran de confirmation juste après la validation du
// profil, moment où isNewUser() devient déjà faux (une pesée vient d'être
// ajoutée) — sans ce flag séparé, render() sauterait directement au dashboard
// sans jamais montrer l'objectif calculé.
let showOnboardingConfirm = false;

// Formulaire à un seul écran (voir discussion produit) : les 4 champs qui
// correspondent exactement aux gardes réelles de computeGoals() (weight/age/
// height) + sexe (pas bloquant dans le calcul mais ~166 kcal d'écart selon le
// choix, donc demandé quand même). Activité et objectif de poids restent
// volontairement absents ici — déjà différables nativement par computeGoals()
// (TDEE de maintenance sans eux), ajustables plus tard dans l'onglet Poids
// inchangé. Aucune nouvelle logique de calcul : computeGoals() est repris tel
// quel, à l'identique de son usage existant dans viewWeight().
function viewOnboarding(){
  if(showOnboardingConfirm){
    const latest = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date))[0];
    const goals = computeGoals(profile, latest.weight);
    // "Ton point de départ", pas "objectifs personnalisés" : à ce stade,
    // goalWeight n'a jamais été demandé, donc dans computeGoals() la condition
    // `if(goalWeight && rate)` est toujours fausse -> targetKcal === tdee,
    // littéralement. Présenter ce TDEE de maintenance comme un "objectif"
    // personnalisé de perte/prise serait trompeur — voir aussi le badge
    // dashboard (viewToday()) qui distingue la même chose. Pas de case
    // "Objectif calculé" ici : elle afficherait exactement le même chiffre que
    // TDEE, une fausse information par duplication plutôt qu'un mensonge
    // explicite, tout aussi trompeuse.
    return `
    <div class="onboarding">
      <h1 class="page-title">Ton point de départ</h1>
      <section class="card">
        <div class="trio">
          <div class="cell blue"><div class="k">Maintenance (TDEE)</div><div class="v">${goals.tdee}</div></div>
          <div class="cell rust"><div class="k">Protéines</div><div class="v">${goals.proteinG}g</div></div>
          <div class="cell green"><div class="k">Glucides</div><div class="v">${goals.carbG}g</div></div>
        </div>
        <div class="hint" style="margin-top:10px;">Calcul basé sur la formule de Mifflin-St Jeor — à ajuster si besoin après quelques semaines d'usage.</div>
        <button class="btn" id="obGoToMeal" type="button">Ajouter mon premier repas</button>
      </section>
    </div>`;
  }
  return `
  <div class="onboarding">
    <h1 class="page-title">Commençons par personnaliser Kalo</h1>
    <p class="hint" style="margin-top:-8px;">Ces quelques informations permettent de calculer un objectif quotidien adapté à ton profil.</p>
    <section class="card">
      <label>Poids actuel (kg)</label>
      <input id="obWeight" type="number" step="0.1" inputmode="decimal" placeholder="ex. 78.4">
      <label>Âge</label>
      <input id="obAge" type="number" placeholder="ex. 32">
      <label>Taille (cm)</label>
      <input id="obHeight" type="number" placeholder="ex. 178">
      <label>Sexe</label>
      <div class="seg" id="obSexSeg">
        <button type="button" data-sex="H" class="active">Homme</button>
        <button type="button" data-sex="F">Femme</button>
      </div>
      <button class="btn" id="obSubmit" type="button">Personnaliser mes objectifs</button>
    </section>
  </div>`;
}

// Kalo Calibration — message d'entrée unique (voir discussion produit) :
// répond à "pourquoi renseigner mes repas maintenant", jamais un système de
// progression. Un simple banner dismissible, état UI pur (calibrationSeen),
// aucune donnée de connaissance, aucun compteur, aucune promesse de délai.
function calibrationBanner(){
  if(calibrationSeen) return '';
  return `<section class="card calibration-banner" data-calibration>
    <p class="calibration-title">Kalo apprend de tes habitudes.</p>
    <p class="calibration-text">Plus tu renseignes tes repas au début, plus Kalo pourra progressivement te faire gagner du temps et personnaliser ses analyses.</p>
    <button class="btn small ghost" data-dismiss-calibration type="button">Compris</button>
  </section>`;
}

function viewToday(){
  const t = dayTotals(currentDate);
  // Deux notions distinctes (Day 0), pas une seule "objectif personnalisé" :
  // - "profil personnalisé" = computeGoals() peut produire un résultat (âge/
  //   taille/poids connus) -> mêmes gardes que le calcul lui-même, rien de
  //   dupliqué.
  // - "objectif de poids défini" = en plus du profil, goalWeight est renseigné
  //   (le seul terme qui gate réellement `if(goalWeight && rate)` dans
  //   computeGoals() — rate a toujours une valeur par défaut). Sans lui,
  //   targetKcal === tdee : un point de départ, jamais un objectif de perte/
  //   prise personnalisé, quel que soit l'état du profil par ailleurs.
  // Le badge doit donc pouvoir rester affiché (sous un texte différent) même
  // une fois le profil Day 0 complété, tant que l'objectif de poids ne l'est
  // pas — voir viewOnboarding() pour le même distinguo sur la carte Day 0.
  const latestWeightEntry = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const dashGoals = latestWeightEntry ? computeGoals(profile, latestWeightEntry.weight) : null;
  const hasPersonalizedProfile = !!dashGoals;
  // goalState (loss/gain/maintain/null) vient de computeGoals() — pas de
  // nouvelle comparaison goalWeight/weight ici, on réutilise directement sa
  // décision (Brique 11).
  const hasWeightGoal = hasPersonalizedProfile && dashGoals.goalState !== null;
  let goalBadge = '';
  if(!hasPersonalizedProfile) goalBadge = 'Objectif provisoire · complète ton profil pour le personnaliser';
  else if(!hasWeightGoal) goalBadge = 'Point de départ · ajoute un objectif de poids si tu veux aller plus loin';
  // Libellé d'état une fois l'objectif de poids défini (Brique 11) : le signe
  // affiché suit goalState (déjà décidé par computeGoals()), pas le signe brut
  // de profile.rate — un rythme mal orienté (cas du warning dans la carte
  // Poids) ne doit pas produire un "-X" sur une prise ou inversement ici.
  let goalStateLabel = '';
  if(hasWeightGoal){
    const rateAbs = Math.abs(parseFloat(profile.rate));
    if(dashGoals.goalState === 'maintain') goalStateLabel = 'Objectif : maintien';
    else if(dashGoals.goalState === 'loss') goalStateLabel = `Objectif : perte · -${rateAbs} kg/semaine`;
    else if(dashGoals.goalState === 'gain') goalStateLabel = `Objectif : prise · +${rateAbs} kg/semaine`;
  }
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
  ${dateStrip()}
  ${calibrationBanner()}
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
        ${goalBadge ? `<span class="pill${!hasWeightGoal && hasPersonalizedProfile ? ' clickable' : ''}" data-provisional-goal${!hasWeightGoal && hasPersonalizedProfile ? ' data-goal-badge-link' : ''}>${goalBadge}</span>` : ''}
        ${goalStateLabel ? `<span class="pill" data-goal-state>${goalStateLabel}</span>` : ''}
      </div>
    </div>
    <div class="trio">
      <div class="cell blue"><div class="k">Repas</div><div class="v">${Math.round(t.kcalIn)}</div></div>
      <div class="cell rust"><div class="k">Brûlées (info)</div><div class="v">${Math.round(t.kcalOut)}</div></div>
      <div class="cell green"><div class="k">Objectif</div><div class="v">${settings.calorieGoal}</div></div>
    </div>
  </section>
  ${kaloInsightsCard()}
  ${dashboardGrid(t)}
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
  </section>`;
}

function dayLogList(date){
  const es = entriesFor(date).filter(e=>e.type!=='note').sort((a,b)=>a.time.localeCompare(b.time));
  if(!es.length) return `<div class="empty">Rien enregistré ce jour-là.</div>`;
  return es.map((e,i)=>{
    if(e.type==='meal'){
      return `<div class="list-entry enter"><div class="main"><div class="title">${escapeHtml(e.foodName)}</div><div class="sub">${e.mealSlot} · ${mealProvenanceLabel(e)} · ${e.time}</div></div>
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

const MEAL_SLOTS = ['Petit-déj','Déjeuner','Dîner','Collation'];
// Brique 10 — créneau contextuel : aucune convention horaire n'existait déjà
// dans Kalo pour ça (vérifié : ni dans macroTips(), ni dans le prompt IA
// d'api/parse-meal.js), donc ces plages sont nouvelles, pas reprises d'un
// endroit existant. Heures pleines, couverture 24h sans trou ni chevauchement,
// Dîner traverse minuit (19h-4h59). Une SUGGESTION par défaut au moment où
// l'utilisateur entre sur l'onglet Repas, jamais une prédiction ni une
// mémoire — voir mealSlotForTime() et son unique point d'appel dans
// switchTab().
function mealSlotForTime(d = new Date()){
  const h = d.getHours();
  if(h>=5 && h<11) return 'Petit-déj';
  if(h>=11 && h<15) return 'Déjeuner';
  if(h>=15 && h<19) return 'Collation';
  return 'Dîner';
}
let mealSearchQ = '';
let mealSlot = 'Déjeuner';
let workoutPresets = LS.get('ct_wpresets', []);
// Séances "favorites" : chacune obtient son propre bloc dans le sélecteur "Type de
// séance" au lieu de repasser par le catalogue à chaque fois. Tapis/Vélo sont favoris
// par défaut (comportement identique à avant), mais restent décochables comme n'importe
// quel autre favori — ce n'est pas juste "un sport de plus", c'est le même mécanisme.
let favSports = LS.get('ct_favSports', [{type:'tapis'}, {type:'velo'}]);
let wkType = 'tapis';
let wkTapisMode = 'duree';
let wkParams = {vitesse:'', pente:'', effort:'modere', intensite:'moderee', sport:'football', sportIntensity:'modere', clubLevel:'loisir', clubMode:'entrainement', enduranceIntensity:'modere'};
let wkDuration = '';
let wkSteps = '';
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
const RENFO_MET = {faible:3.5, moderee:5, forte:8}; // conservé pour compat descendante des séances 'renfo' déjà enregistrées — plus utilisé par l'UI (types "Renfo"/"Manuel" retirés du sélecteur, remplacés par "Choisis ton sport" (dont l'entrée "Musculation") et "Sport en club")

/* ===================== SPORTS (Choisis ton sport / Sport en club) =====================
   Source des MET "casual" (mode "Choisis ton sport") : Compendium of Physical Activities
   (Ainsworth et al., 2011), la référence scientifique standard utilisée par la plupart des
   trackers fitness. Ce ne sont PAS des valeurs inventées : ce sont les MET usuels/arrondis
   des codes Compendium les plus proches de chaque discipline (ex. football 15680/15690,
   basketball 15530/15540/15550, natation 18310-18360, course à pied 12020-12090, cyclisme
   01010-01040, tennis 15675, squash 15680, escrime non listée→approximée à partir d'escrime
   compétitive ~6 MET, etc.), simplifiés à 3 paliers d'intensité génériques (léger/modéré/
   intense) par sport pour rester utilisable dans un formulaire simple.
   Le "Musculation" listée ici correspond à la musculation en salle générique (poids libres/
   machines) — c'est un sport du catalogue comme un autre, pas un type de séance à part.
   Arts martiaux : plutôt que de couvrir chaque discipline de combat séparément (boxe, judo,
   karaté, MMA, lutte ont chacune leur propre progression loisir→national très différente,
   cf. `metSportClub` plus bas), elles sont bien détaillées individuellement ci-dessous —
   volume jugé raisonnable vu leurs physiologies très différentes (percussion vs préhension/
   lutte vs MMA mixte). */
const SPORTS = [
  // Sports collectifs
  {id:'football', label:'Football', cat:'collectif', casual:{leger:5.0, modere:7.0, intense:10.0}},
  {id:'basketball', label:'Basketball', cat:'collectif', casual:{leger:4.5, modere:6.5, intense:8.0}},
  {id:'handball', label:'Handball', cat:'collectif', casual:{leger:4.0, modere:8.0, intense:12.0}},
  {id:'rugby', label:'Rugby', cat:'collectif', casual:{leger:6.0, modere:8.3, intense:10.0}},
  {id:'volleyball', label:'Volleyball', cat:'collectif', casual:{leger:3.0, modere:4.0, intense:8.0}},
  // Sports de raquette
  {id:'tennis', label:'Tennis', cat:'raquette', casual:{leger:5.0, modere:7.3, intense:8.0}},
  {id:'badminton', label:'Badminton', cat:'raquette', casual:{leger:4.5, modere:5.5, intense:7.0}},
  {id:'squash', label:'Squash', cat:'raquette', casual:{leger:5.5, modere:7.3, intense:10.0}},
  {id:'ping_pong', label:'Tennis de table (ping-pong)', cat:'raquette', casual:{leger:3.0, modere:4.0, intense:6.0}},
  {id:'padel', label:'Padel', cat:'raquette', casual:{leger:4.0, modere:5.5, intense:7.0}},
  // Sports de combat
  {id:'boxe', label:'Boxe', cat:'combat', casual:{leger:5.5, modere:7.8, intense:12.8}},
  {id:'judo', label:'Judo', cat:'combat', casual:{leger:6.0, modere:8.0, intense:10.3}},
  {id:'karate', label:'Karaté', cat:'combat', casual:{leger:6.0, modere:8.0, intense:10.3}},
  {id:'mma', label:'MMA', cat:'combat', casual:{leger:6.5, modere:9.0, intense:12.0}},
  {id:'lutte', label:'Lutte', cat:'combat', casual:{leger:5.5, modere:7.5, intense:9.5}},
  // Sports nautiques
  {id:'natation', label:'Natation', cat:'nautique', casual:{leger:5.8, modere:8.3, intense:9.8}},
  {id:'surf', label:'Surf', cat:'nautique', casual:{leger:3.0, modere:5.0, intense:6.0}},
  {id:'paddle', label:'Paddle (SUP)', cat:'nautique', casual:{leger:3.5, modere:6.0, intense:8.3}},
  {id:'voile', label:'Voile', cat:'nautique', casual:{leger:3.0, modere:4.5, intense:6.0}},
  // Sports d'hiver
  {id:'ski', label:'Ski alpin', cat:'hiver', casual:{leger:5.3, modere:6.8, intense:8.0}},
  {id:'snowboard', label:'Snowboard', cat:'hiver', casual:{leger:5.3, modere:6.8, intense:8.0}},
  // Sports individuels / endurance
  {id:'course', label:'Course à pied', cat:'endurance', casual:{leger:7.0, modere:9.8, intense:12.8}},
  {id:'cyclisme', label:'Cyclisme (loisir)', cat:'endurance', casual:{leger:4.0, modere:6.8, intense:8.0}},
  {id:'randonnee', label:'Randonnée', cat:'endurance', casual:{leger:4.3, modere:6.0, intense:7.8}},
  {id:'aviron', label:'Aviron (machine)', cat:'endurance', casual:{leger:3.5, modere:7.0, intense:8.5}},
  {id:'roller_skate', label:'Roller / skateboard', cat:'endurance', casual:{leger:5.0, modere:7.0, intense:9.8}},
  // Technique / faible intensité
  {id:'golf', label:'Golf', cat:'technique', casual:{leger:3.5, modere:4.8, intense:6.0}},
  {id:'yoga_pilates', label:'Yoga / Pilates', cat:'technique', casual:{leger:2.5, modere:3.3, intense:4.0}},
  {id:'danse', label:'Danse', cat:'technique', casual:{leger:3.0, modere:4.8, intense:7.3}},
  // Force
  {id:'musculation', label:'Musculation', cat:'force', casual:{leger:3.0, modere:5.0, intense:6.0}},
  {id:'escalade', label:'Escalade', cat:'force', casual:{leger:5.8, modere:7.5, intense:9.0}},
];
function sportById(id){ return SPORTS.find(s=>s.id===id) || SPORTS[0]; }

/* ----- "Sport en club" : libellés de niveau propres à chaque discipline -----
   Les 3 clés (loisir/semi/national) restent celles utilisées par CLUB_CATEGORY_MULT
   plus bas (même calcul de calories, déjà vérifié) : seul le TEXTE affiché change pour
   parler le vocabulaire réel de chaque sport plutôt qu'un "Loisir/Semi-amateur/National"
   générique répété partout (demande utilisateur). Volontairement pas de code de
   classement fédéral précis (numéros FFT, ceintures exactes, etc.) qu'on ne peut pas
   garantir à jour — juste une terminologie reconnaissable. */
const CLUB_LEVELS = {
  football: [{key:'loisir',label:'Loisir / foot en salle'},{key:'semi',label:'Régional (District/Ligue)'},{key:'national',label:'National / Fédéral'}],
  basketball: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Régional (Pré-national/Régionale)'},{key:'national',label:'National / Élite'}],
  handball: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Régional'},{key:'national',label:'National'}],
  rugby: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Régional (Fédérale 2-3)'},{key:'national',label:'National (Fédérale 1 et +)'}],
  volleyball: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Régional'},{key:'national',label:'National'}],
  tennis: [{key:'loisir',label:'Non classé / loisir'},{key:'semi',label:'Classé, compétiteur régional'},{key:'national',label:'Classé national'}],
  badminton: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Classé, compétiteur régional'},{key:'national',label:'Classé national'}],
  squash: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  ping_pong: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Classé, compétiteur régional'},{key:'national',label:'Classé national'}],
  padel: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  boxe: [{key:'loisir',label:'Loisir (cardio-boxe)'},{key:'semi',label:'Amateur en club, combats régionaux'},{key:'national',label:'Compétiteur national'}],
  judo: [{key:'loisir',label:'Loisir, sans compétition'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national, haut niveau'}],
  karate: [{key:'loisir',label:'Loisir, sans compétition'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  mma: [{key:'loisir',label:'Loisir (cours technique)'},{key:'semi',label:'Amateur, combats régionaux'},{key:'national',label:'Compétiteur national / pro'}],
  lutte: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  natation: [{key:'loisir',label:'Loisir / Masters'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  surf: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  paddle: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  voile: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Régatier régional'},{key:'national',label:'Régatier national'}],
  ski: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional (club)'},{key:'national',label:'Compétiteur national (FFS)'}],
  snowboard: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional (club)'},{key:'national',label:'Compétiteur national (FFS)'}],
  course: [{key:'loisir',label:'Loisir / joggeur'},{key:'semi',label:'Coureur régulier, courses régionales'},{key:'national',label:'Compétiteur national'}],
  cyclisme: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Cyclosportif, compétiteur régional'},{key:'national',label:'Compétiteur national (FFC)'}],
  randonnee: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Randonneur sportif régulier'},{key:'national',label:'Trail / rando compétitive'}],
  aviron: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  roller_skate: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
  golf: [{key:'loisir',label:'Loisir (index élevé)'},{key:'semi',label:'Compétiteur club (index intermédiaire)'},{key:'national',label:'Compétiteur national / pro-am'}],
  yoga_pilates: [{key:'loisir',label:'Débutant / loisir'},{key:'semi',label:'Pratique régulière avancée'},{key:'national',label:'Professeur / pratique intensive'}],
  danse: [{key:'loisir',label:'Loisir'},{key:'semi',label:'Compétiteur régional (danse sportive)'},{key:'national',label:'Compétiteur national'}],
  musculation: [{key:'loisir',label:'Loisir en club'},{key:'semi',label:'Amateur (powerlifting/bodybuilding régional)'},{key:'national',label:'Compétiteur national'}],
  escalade: [{key:'loisir',label:'Loisir en club'},{key:'semi',label:'Compétiteur régional'},{key:'national',label:'Compétiteur national'}],
};
function clubLevelsFor(sportId){ return CLUB_LEVELS[sportId] || [{key:'loisir',label:'Loisir'},{key:'semi',label:'Semi-amateur'},{key:'national',label:'National'}]; }

/* ----- "Sport en club" : MET par niveau compétitif, différenciés PAR FAMILLE de sport -----
   Le Compendium ne documente pas de paliers "loisir/semi-amateur/national" — ces
   multiplicateurs sont un raisonnement physiologique explicite (pas une formule unique
   plaquée partout), appliqué au MET **"modéré"** de chaque discipline (le palier casual du
   milieu, PAS "intense" — corrigé après retour utilisateur : la 1ère version partait déjà du
   palier "intense" même pour un niveau "Loisir", donc un pongiste loisir en simple match
   affichait un MET plus haut que ce que le catalogue "Choisis ton sport" appelle lui-même
   "intense" pour ce sport, ce qui gonflait le calcul de façon irréaliste — ex. ping-pong
   loisir/match donnait ~520kcal/h à 75kg, largement au-dessus de ce qu'un match loisir de
   ping-pong brûle réellement). Le niveau "loisir" = 1.0 (ancré sur l'effort "modéré" casual,
   cohérent : un pratiquant loisir en club n'est pas plus intense qu'un pratiquant loisir
   ponctuel), "semi"/"national" amènent progressivement vers, puis au-delà, du palier
   "intense" casual :
   - `collectif` (foot/basket/hand/rugby/volley) : sports intermittents à sprints répétés —
     l'écart loisir→national est marqué (VO2max et capacité à répéter les efforts très
     supérieurs en national) et le match est plus explosif que l'entraînement technique
     (davantage d'accélérations/sprints en match réel qu'à l'entraînement). Multiplicateurs
     recalibrés à la baisse après un stress-test contre le Compendium (le foot/basket
     "compétitif" y est déjà référencé à 10.0/8.0 MET — un national/match à +50% de ce
     chiffre dépassait nettement les études de terrain sur l'intensité moyenne d'un match
     élite, ~9-10 MET) : national/match retombe désormais proche de ces références plutôt
     que largement au-dessus.
   - `combat` (boxe/judo/karaté/MMA/lutte) : au niveau national l'effort en compétition est
     quasi maximal (rounds/combats à haute intensité soutenue) — écart le plus marqué de
     toutes les catégories, et le combat/compétition est bien plus intense que l'entraînement
     technique/randori.
   - `raquette` (tennis/badminton/squash/ping-pong/padel) : sports techniques où le gain
     principal du niveau est l'efficacité de déplacement plus que le métabolisme brut — écart
     modéré loisir→national, match un peu plus intense qu'entraînement (rallyes plus longs).
   - `endurance` (course/cyclisme/rando/aviron/roller) : à niveau national, un athlète
     soutient un %VO2max bien plus élevé sur la même durée — écart important, et la
     "compétition" (course) est nettement plus intense qu'une sortie d'entraînement.
   - `nautique`/`hiver` : sports très techniques/dépendants des conditions — l'écart de
     dépense énergétique entre niveaux reste modeste, la compétition un peu plus intense.
   - `technique` (golf/yoga-pilates/danse) : l'intensité physique croît peu avec le niveau
     (le geste devient plus précis, pas plus cardio) — écart faible entre niveaux.
   - `force` (musculation/escalade) : le niveau national soulève/grimpe plus lourd/dur à
     volume comparable — écart notable, la compétition (peu fréquente) un peu plus intense
     que l'entraînement standard. */
const CLUB_CATEGORY_MULT = {
  collectif:  {level:{loisir:1.0, semi:1.2,  national:1.45}, mode:{entrainement:1.0, match:1.1}},
  combat:     {level:{loisir:1.0, semi:1.35, national:1.7},  mode:{entrainement:1.0, match:1.15}},
  raquette:   {level:{loisir:1.0, semi:1.2,  national:1.4},  mode:{entrainement:1.0, match:1.1}},
  endurance:  {level:{loisir:1.0, semi:1.3,  national:1.55}, mode:{entrainement:1.0, match:1.15}},
  nautique:   {level:{loisir:1.0, semi:1.15, national:1.3},  mode:{entrainement:1.0, match:1.08}},
  hiver:      {level:{loisir:1.0, semi:1.15, national:1.3},  mode:{entrainement:1.0, match:1.08}},
  technique:  {level:{loisir:1.0, semi:1.1,  national:1.2},  mode:{entrainement:1.0, match:1.05}},
  force:      {level:{loisir:1.0, semi:1.2,  national:1.4},  mode:{entrainement:1.0, match:1.1}},
};
// Dérogation par sport, à n'utiliser que quand la famille ne colle vraiment pas à UN sport
// précis (constaté par stress-test sur les 31 sports, pas par principe — évite de
// complexifier tout le monde pour un seul cas) :
// - volleyball : rapport casual modéré→intense (4.0→8.0, x2) atypique pour "collectif"
//   (plutôt x1.3-1.5 ailleurs, cf. foot/basket) — le multiplicateur collectif standard
//   laissait le national/match sous le MET "competitive" que le Compendium attribue déjà
//   au volleyball (8.0), alors qu'un match national doit au moins l'atteindre.
// - tennis : même souci inverse dans "raquette" — plage casual très resserrée (7.3→8, à
//   peine +9%) qui faisait grimper le national/match à +41% au-dessus du palier "intense",
//   largement plus que ses voisins raquette (badminton/squash/padel : +12 à +21%).
// - danse : plage casual large (4.8→7.3, +52%) qui faisait tomber le national/match SOUS
//   son propre palier "intense" casual (0.83x, impossible physiologiquement — un·e
//   compétiteur·rice national·e ne peut pas dépenser moins qu'une séance loisir "intense") ;
//   le multiplicateur "technique" est délibérément plat (golf/yoga ne gagnent pas grand
//   chose en intensité avec le niveau) mais ne convient pas à la danse compétitive, qui est
//   réellement plus cardio qu'une séance loisir.
const CLUB_SPORT_OVERRIDE_MULT = {
  volleyball: {level:{loisir:1.0, semi:1.5, national:1.9}, mode:{entrainement:1.0, match:1.1}},
  tennis:     {level:{loisir:1.0, semi:1.1, national:1.25}, mode:{entrainement:1.0, match:1.05}},
  danse:      {level:{loisir:1.0, semi:1.3, national:1.55}, mode:{entrainement:1.0, match:1.15}},
};
function metSportCasual(sportId, intensity){ return (sportById(sportId).casual||{})[intensity] ?? sportById(sportId).casual.modere; }
// Sports d'endurance individuels (course/cyclisme/rando/aviron/roller) : contrairement au
// foot/combat/raquette où le NIVEAU du pratiquant est une bonne proxy de l'intensité d'une
// séance donnée (un joueur national court plus vite sur tout le match), un coureur national
// qui fait un footing tranquille n'est pas plus intense qu'un loisir qui pousse fort ce
// jour-là — ce qui pèse vraiment, c'est l'ALLURE de cette séance précise, pas l'étiquette de
// niveau (retour croisé avec un stress-test ChatGPT sur ce point précis). Le niveau/contexte
// gardent un rôle mineur (accès à des allures plus dures, un vrai contexte de course), mais
// l'intensité de la séance (même échelle léger/modéré/intense que "Choisis ton sport")
// pilote désormais le calcul.
const ENDURANCE_CLUB_MINOR_MULT = {level:{loisir:1.0, semi:1.05, national:1.1}, mode:{entrainement:1.0, match:1.1}};
function metSportClub(sportId, level, mode, sessionIntensity){
  const sport = sportById(sportId);
  if(sport.cat==='endurance'){
    const base = metSportCasual(sportId, sessionIntensity||'modere');
    return base * (ENDURANCE_CLUB_MINOR_MULT.level[level]||1) * (ENDURANCE_CLUB_MINOR_MULT.mode[mode]||1);
  }
  const mult = CLUB_SPORT_OVERRIDE_MULT[sportId] || CLUB_CATEGORY_MULT[sport.cat] || CLUB_CATEGORY_MULT.collectif;
  return sport.casual.modere * (mult.level[level]||1) * (mult.mode[mode]||1);
}

/* ----- Favoris de séance (bloc dédié dans le sélecteur) -----
   Un favori "club" est identifié par sport+niveau (pas le contexte entraînement/match,
   ajustable librement une fois le bloc ouvert) pour éviter d'avoir 2 blocs distincts pour
   "Foot national entraînement" et "Foot national match". */
function favSportKey(fav){
  if(fav.type==='tapis'||fav.type==='velo') return fav.type;
  if(fav.type==='sport') return 'sport:'+fav.sport;
  if(fav.type==='club') return 'club:'+fav.sport+':'+fav.level;
  return JSON.stringify(fav);
}
function isFavSport(fav){ return favSports.some(f=>favSportKey(f)===favSportKey(fav)); }
function toggleFavSport(fav){
  favSports = isFavSport(fav) ? favSports.filter(f=>favSportKey(f)!==favSportKey(fav)) : [...favSports, fav];
  save();
}
// Le favori "courant" d'après l'état du formulaire (null pour "ia", qui n'a pas de favori).
function currentWkFav(){
  if(wkType==='tapis') return {type:'tapis'};
  if(wkType==='velo') return {type:'velo'};
  if(wkType==='sport') return {type:'sport', sport:wkParams.sport};
  if(wkType==='club') return {type:'club', sport:wkParams.sport, level:wkParams.clubLevel};
  return null;
}
function wkMatchesFav(fav){
  if(fav.type==='tapis'||fav.type==='velo') return wkType===fav.type;
  if(fav.type==='sport') return wkType==='sport' && wkParams.sport===fav.sport;
  if(fav.type==='club') return wkType==='club' && wkParams.sport===fav.sport && wkParams.clubLevel===fav.level;
  return false;
}
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
  else if(type==='renfo') met = RENFO_MET[params.intensite]||5; // rétrocompat affichage/anciennes séances uniquement
  else if(type==='sport') met = metSportCasual(params.sport, params.intensity);
  else if(type==='club') met = metSportClub(params.sport, params.level, params.mode, params.enduranceIntensity);
  return met * weight * h;
}
function stepsToDurationMin(steps, vitesseKmh, heightCm){
  const strideM = (parseFloat(heightCm)||170)/100 * 0.414;
  const distanceKm = (steps*strideM)/1000;
  const v = parseFloat(vitesseKmh)||1;
  return (distanceKm/v)*60;
}
function workoutSummary(e){
  // Séance importée via "Coller un programme (IA)" (js/workoutparser.js) :
  // structure blocks/exercices + durée estimée, indépendante des types
  // tapis/vélo/sport/club/renfo/manuel ci-dessous (rétrocompatibilité : les séances plus
  // anciennes n'ont jamais de champ `blocks`, donc cette branche ne les
  // concerne jamais).
  if(Array.isArray(e.blocks) && e.blocks.length){
    const totalExercises = e.blocks.reduce((n,b)=> n + (Array.isArray(b.exercises)?b.exercises.length:0), 0);
    const exNames = e.blocks.flatMap(b=>(b.exercises||[]).map(x=>x.name)).filter(Boolean);
    const title = e.name || 'Séance (programme IA)';
    const parts = [
      `${e.blocks.length} block${e.blocks.length>1?'s':''}`,
      `${totalExercises} exercice${totalExercises>1?'s':''}`,
    ];
    if(e.estimatedDurationMin) parts.push(`~${e.estimatedDurationMin} min`);
    parts.push(e.time);
    if(exNames.length) parts.push(exNames.slice(0,4).join(', ')+(exNames.length>4?'…':''));
    return {title, sub: parts.map(escapeHtml).join(' · ')};
  }
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
  if(e.wtype==='sport'){
    const lbl = {leger:'léger',modere:'modéré',intense:'intense'}[e.params?.intensity]||e.params?.intensity;
    return {title:sportById(e.params?.sport).label, sub:`Intensité ${lbl} · ${e.duration} min · ${e.time}`};
  }
  if(e.wtype==='club'){
    const lvlLbl = (clubLevelsFor(e.params?.sport).find(l=>l.key===e.params?.level)||{}).label || e.params?.level;
    const modeLbl = {entrainement:'Entraînement',match:'Match/compétition'}[e.params?.mode]||e.params?.mode;
    const intLbl = e.params?.enduranceIntensity ? ` · Allure ${({leger:'légère',modere:'modérée',intense:'intense'})[e.params.enduranceIntensity]||e.params.enduranceIntensity}` : '';
    return {title:sportById(e.params?.sport).label+' (club)', sub:`${lvlLbl} · ${modeLbl}${intLbl} · ${e.duration} min · ${e.time}`};
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
  // Contextuel au créneau actif uniquement (brique 9B) : jamais le petit-déj
  // habituel au milieu de l'ajout d'un dîner, même si le petit-déj a un
  // pattern plus "fort" statistiquement. Masqué dès que l'utilisateur tape
  // une recherche — c'est un raccourci de démarrage, pas un widget permanent.
  const frequentMeal = q.length===0 ? frequentMealFor(mealSlot) : null;
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
  ${dateStrip()}
  <section class="card">
    <h2>Ajouter un aliment</h2>
    <div class="row2" style="margin-top:0;">
      <button class="btn secondary small" id="scanBarcodeBtn" type="button">📷 Scanner un code-barres</button>
      <button class="btn secondary small" id="aiDescribeBtn" type="button">🤖 Décrire un repas (IA)</button>
    </div>
    <label>Repas</label>
    <div class="seg" id="mealseg">
      ${MEAL_SLOTS.map(s=>`<button data-slot="${s}" class="${mealSlot===s?'active':''}">${s}</button>`).join('')}
    </div>
    ${frequentMeal ? `<div class="freq-meal">
      <div class="freq-meal-label">Repas fréquent</div>
      <div class="freq-meal-name">${escapeHtml(frenchList(frequentMeal.names))}</div>
      <button class="btn small ghost" data-quickaddslot="${frequentMeal.mealSlot}" type="button">Ajouter ce repas</button>
    </div>` : ''}
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

// Segment "provenance" affiché sur une ligne de repas du journal : discret (juste
// le grammage) pour le cas de référence (saisie manuelle/base de données), et un
// mot en plus seulement pour les cas qui sortent de cette référence — un repas
// reconnu à 100% par le catalogue officiel (McDo/BK/...) n'est PAS une estimation
// et ne doit pas être affiché comme tel (c'était un bug avant : l'absence de
// grammage faisait toujours afficher "estimé IA", même pour un match catalogue
// sans grammage explicite, ex. "1 Big Mac"). Voir la note provenance dans
// api/parse-meal.js / js/mealparser.js pour l'origine du champ `source`.
function mealProvenanceLabel(e){
  const parts = [];
  if(e.grams!=null) parts.push(e.grams+' g');
  if(e.source==='catalog' || e.source==='scan') parts.push('officiel');
  else if(e.source==='ai') parts.push('estimé IA');
  else if(e.source==='recurring') parts.push('repas habituel');
  else if(e.grams==null) parts.push('estimé');
  return parts.join(' · ');
}
function mealsOnlyList(date){
  const es = entriesFor(date).filter(e=>e.type==='meal').sort((a,b)=>a.time.localeCompare(b.time));
  return es.map(e=>`<div class="list-entry enter">
      <div class="main"><div class="title">${escapeHtml(e.foodName)}</div><div class="sub">${e.mealSlot} · ${mealProvenanceLabel(e)} · ${e.time}</div></div>
      <div class="amount blue">+${Math.round(e.kcal)}</div>
      <button class="del" data-del="${e.id}">✕</button>
    </div>`).join('');
}

function viewWorkouts(){
  const es = entriesFor(currentDate).filter(e=>e.type==='workout').sort((a,b)=>a.time.localeCompare(b.time));
  const weight = getCurrentWeight();
  const presetsForType = workoutPresets.filter(p=>p.type===wkType);
  return `
  ${dateStrip()}
  <section class="card">
    <h2>Nouvelle séance</h2>
    ${!weight ? `<div class="hint">Ajoute une pesée dans l'onglet Poids pour activer le calcul auto des calories (tapis/vélo/sport/club). En attendant, utilise "Saisie manuelle (IA)".</div>` : ''}
    <label>Type de séance</label>
    <div class="wk-cards" id="wkTypeSeg">
      ${(()=>{
        const TAPIS_SVG = '<path d="M3 12h2M7 12h1M11 12h2M15 12h1M19 12h2M3 18h18M5 18v2M19 18v2M5 20h14"/>';
        const VELO_SVG = '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-7h6l3 7M9 10l-2-4h3"/>';
        const SPORT_SVG = '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/>';
        const CLUB_SVG = '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>';
        const IA_SVG = '<path d="M5 4h11l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/>';
        // Un bloc par favori (dans l'ordre où ils ont été ajoutés), puis les 3 entrées
        // fixes non-favoritables (catalogue sport/club + saisie IA), qui restent le
        // point d'accès à tout ce qui n'a pas (encore) son propre bloc.
        const favCards = favSports.map(fav=>{
          if(fav.type==='tapis') return {k:'tapis', lbl:'Tapis', hint:'Marche/course', svg:TAPIS_SVG, favKey:favSportKey(fav)};
          if(fav.type==='velo') return {k:'velo', lbl:'Vélo', hint:'Cyclisme', svg:VELO_SVG, favKey:favSportKey(fav)};
          if(fav.type==='sport') return {k:'sport', lbl:sportById(fav.sport).label, hint:'Favori', svg:SPORT_SVG, favKey:favSportKey(fav)};
          if(fav.type==='club'){
            const lvlLbl = (clubLevelsFor(fav.sport).find(l=>l.key===fav.level)||{}).label || fav.level;
            return {k:'club', lbl:sportById(fav.sport).label, hint:`Club · ${lvlLbl}`, svg:CLUB_SVG, favKey:favSportKey(fav)};
          }
          return null;
        }).filter(Boolean);
        const staticCards = [
          {k:'sport', lbl:'Choisis ton sport', hint:'Loisir/ponctuel', svg:SPORT_SVG},
          {k:'club', lbl:'Sport en club', hint:'Régulier/encadré', svg:CLUB_SVG},
          {k:'ia', lbl:'Saisie manuelle (IA)', hint:'Coller un programme', svg:IA_SVG},
        ];
        const isActive = c => c.favKey ? favSports.some(f=>favSportKey(f)===c.favKey && wkMatchesFav(f)) : (wkType===c.k && !favSports.some(f=>wkMatchesFav(f)));
        return [...favCards, ...staticCards].map(o=>`<button class="wk-card ${isActive(o)?'active':''}" data-type="${o.k}"${o.favKey?` data-fav-key="${o.favKey}"`:''}><div class="ico"><svg viewBox="0 0 24 24">${o.svg}</svg></div><div><div class="lbl">${escapeHtml(o.lbl)}</div><div class="hint">${o.hint}</div></div></button>`).join('');
      })()}
    </div>
    ${wkType!=='ia' ? `<button class="btn ghost" id="wkFavToggle" type="button">${isFavSport(currentWkFav())?'★ Retirer des favoris':'☆ Ajouter en favori (bloc dédié)'}</button>` : ''}

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

    ${wkType==='sport' ? `
      <label>Sport</label>
      <select id="wkSport">${SPORTS.map(s=>`<option value="${s.id}" ${wkParams.sport===s.id?'selected':''}>${escapeHtml(s.label)}</option>`).join('')}</select>
      <label>Intensité</label>
      <div class="seg" id="wkSportIntSeg">
        ${[['leger','Léger'],['modere','Modéré'],['intense','Intense']].map(([k,l])=>`<button data-int="${k}" class="${wkParams.sportIntensity===k?'active':''}">${l}</button>`).join('')}
      </div>
      <label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">
    ` : ''}

    ${wkType==='club' ? `
      <label>Sport</label>
      <select id="wkSport">${SPORTS.map(s=>`<option value="${s.id}" ${wkParams.sport===s.id?'selected':''}>${escapeHtml(s.label)}</option>`).join('')}</select>
      <label>Niveau</label>
      <select id="wkClubLevel">${clubLevelsFor(wkParams.sport).map(l=>`<option value="${l.key}" ${wkParams.clubLevel===l.key?'selected':''}>${escapeHtml(l.label)}</option>`).join('')}</select>
      ${sportById(wkParams.sport).cat==='endurance' ? `
      <label>Intensité de cette séance</label>
      <div class="seg" id="wkEnduranceIntSeg">
        ${[['leger','Léger'],['modere','Modéré'],['intense','Intense']].map(([k,l])=>`<button data-eint="${k}" class="${wkParams.enduranceIntensity===k?'active':''}">${l}</button>`).join('')}
      </div>
      <div class="hint">Pour les sports d'endurance, l'allure de cette séance pèse plus dans le calcul que le niveau du pratiquant — un coureur national en footing tranquille n'est pas plus intense qu'un loisir qui pousse fort.</div>
      ` : ''}
      <label>Contexte</label>
      <div class="seg" id="wkClubModeSeg">
        ${[['entrainement','Entraînement'],['match','Match / compétition']].map(([k,l])=>`<button data-clubmode="${k}" class="${wkParams.clubMode===k?'active':''}">${l}</button>`).join('')}
      </div>
      <label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">
    ` : ''}

    ${wkType!=='ia' ? `<button class="btn rust" id="saveWorkout">Enregistrer la séance</button>
    <button class="btn ghost" id="savePresetBtn">★ Enregistrer ces réglages comme préréglage</button>` : ''}
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
let openRecipeId = null;
let openRecipeBookId = null;
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
  let targetKcal = tdee, weeksToGoal = null, warning = null, goalState = null;
  if(goalWeight && rate){
    const needsLoss = goalWeight < weight, needsGain = goalWeight > weight;
    goalState = needsLoss ? 'loss' : needsGain ? 'gain' : 'maintain';
    // goalWeight === weight (poids objectif déjà atteint) : ni needsLoss ni
    // needsGain, donc pas d'avertissement de sens — mais sans ce garde-fou,
    // targetKcal recevait quand même l'ajustement rate*7700/7, créant un
    // déficit/surplus fantôme alors qu'il n'y a plus rien à perdre/prendre.
    // weeksToGoal reste 0 dans ce cas (goalWeight-weight = 0), déjà correct
    // sans changement.
    if(goalState !== 'maintain'){
      targetKcal = tdee + (rate*7700/7);
      if((needsLoss && rate>0) || (needsGain && rate<0)) warning = "Le rythme indiqué va dans le sens opposé à ton objectif de poids.";
    }
    weeksToGoal = Math.abs((goalWeight-weight)/rate);
  }
  targetKcal = Math.max(1200, Math.round(targetKcal));
  const proteinG = Math.round(weight*2);
  let fatG = Math.round(targetKcal*0.25/9);
  let carbG = Math.round((targetKcal - proteinG*4 - fatG*9)/4);
  if(carbG < 50){ carbG = 50; fatG = Math.max(20, Math.round((targetKcal - proteinG*4 - carbG*4)/9)); }
  return {bmr:Math.round(bmr), tdee:Math.round(tdee), targetKcal, proteinG, carbG, fatG, weeksToGoal, warning, goalState};
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
  <section class="card" id="weightGoalCard">
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
  ${dateStrip()}
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
      const typeLbl = {tapis:'Tapis incliné',velo:'Vélo',renfo:'Renfo',sport:'Choisis ton sport',club:'Sport en club'}[p.type]||p.type;
      let paramSub = '';
      if(p.type==='tapis') paramSub = `${p.params.vitesse}km/h · ${p.params.pente}%`;
      else if(p.type==='velo') paramSub = `effort ${p.params.effort}`;
      else if(p.type==='renfo') paramSub = `intensité ${p.params.intensite}`; // rétrocompat anciens préréglages
      else if(p.type==='sport') paramSub = `${sportById(p.params.sport).label} · ${p.params.sportIntensity}`;
      else if(p.type==='club') paramSub = `${sportById(p.params.sport).label} · ${(clubLevelsFor(p.params.sport).find(l=>l.key===p.params.clubLevel)||{}).label || p.params.clubLevel}`;
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
