require([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api"], function ($, Hypr, Backbone, api) {


        var flavour_Guides1 = '[{"name":"Jelly Belly 50 Official Flavors","shopName":"50 Official","category":"335","guide":"original50","description":"The most amazing, delightful and delicious collection of gourmet jelly beans is an adventure in taste. The best and most popular flavors we’ve made are gathered in the Official 50 flavors, your guide to discovering each and every one. Whatever your preferences we are absolutely sure there is a flavor here for you.  Eating Directions: Savor one flavor at a time to experience the true and distinctive taste of each Jelly Belly bean. Or, experiment by combining flavors in a Jelly Belly Recipe to create an entirely original taste experience.","childcategories":[{"name":"A&W® Cream Soda","slug":"13","image":"CreamSoda.jpg"},{"name":"A&W® Root Beer","slug":"73","image":"rootBeer.jpg"},{"name":"Berry Blue","slug":"66","image":"berryBlue.jpg"},{"name":"Blueberry","slug":"67","image":"blueberry.jpg"},{"name":"Bubble Gum","slug":"18","image":"BubbleGum.jpg"},{"name":"Buttered Popcorn","slug":"68","image":"popcorn.jpg"},{"name":"Cantaloupe","slug":"69","image":"Cantaloupe.jpg"},{"name":"Cappuccino","slug":"70","image":"Cappuccino.jpg"},{"name":"Caramel Corn","slug":"71","image":"CarmelCorn.jpg"},{"name":"Chili Mango","slug":"189","image":"ChiliMango.jpg"},{"name":"Chocolate Pudding","slug":"266","image":"ChocolatePudding.jpg"},{"name":"Cinnamon","slug":"75","image":"Cinnamon.jpg"},{"name":"Coconut","slug":"14","image":"Coconut.jpg"},{"name":"Cotton Candy","slug":"15","image":"CottonCandy.jpg"},{"name":"Crushed Pineapple","slug":"76","image":"CocktailPinaColada.jpg"},{"name":"Dr Pepper®","slug":"77","image":"DrPepper.jpg"},{"name":"French Vanilla","slug":"16","image":"vanilla.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Island Punch","slug":"80","image":"IslandPunch.jpg"},{"name":"Juicy Pear","slug":"81","image":"Pear.jpg"},{"name":"Kiwi","slug":"274","image":"Kiwi.jpg"},{"name":"Lemon Drop","slug":"83","image":"lemonDrop.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Licorice","slug":"86","image":"Licorice.jpg"},{"name":"Mango","slug":"87","image":"Mango.jpg"},{"name":"Margarita","slug":"88","image":"Margarita.jpg"},{"name":"Mixed Berry Smoothie","slug":"190","image":"BerrySmoothie.jpg"},{"name":"Orange Sherbet","slug":"91","image":"OrangeSherbet.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Piña Colada","slug":"93","image":"PinaColada.jpg"},{"name":"Plum","slug":"95","image":"Plum.jpg"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"},{"name":"Raspberry","slug":"97","image":"raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"redApple.jpg"},{"name":"Sizzling Cinnamon","slug":"99","image":"sizCin.jpg"},{"name":"Sour Cherry","slug":"191","image":"SourCherry.jpg"},{"name":"Strawberry Cheesecake","slug":"17","image":"strwCheesecake.jpg"},{"name":"Strawberry Daiquiri","slug":"100","image":"strwDaquiri.jpg"},{"name":"Strawberry Jam","slug":"101","image":"StrawberryJam.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"sour_lemon.jpg"},{"name":"Sunkist® Lime","slug":"185","image":"lime.jpg"},{"name":"Sunkist® Orange","slug":"90","image":"orange.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"},{"name":"Toasted Marshmallow","slug":"103","image":"Marshmallow.jpg"},{"name":"Top Banana","slug":"104","image":"topBanana.jpg"},{"name":"Tutti-Fruitti","slug":"105","image":"tuttiFruitti.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"},{"name":"Wild Blackberry","slug":"108","image":"WildBlackberry.jpg"}]},{"name":"Jewel Bean Collection","shopName":"Jewel Collection","category":"46","guide":"jewelBeans","description":"Popular Jelly Belly jelly bean flavors finished with a beautiful pearlescent sheen!","childcategories":[{"name":"Jewel Blueberry","slug":"67","image":"BlueberryJewelBean.png"},{"name":"Jewel Bubble Gum","slug":"18","image":"bubblegumJewelBean.png"},{"name":"Jewel Sour Apple","slug":"46","image":"sourAppleJewelBean.png"},{"name":"Jewel Cream Soda","slug":"46","image":"CreamSodaJewelBean.png"},{"name":"Jewel Berry Blue","slug":"66","image":"BerryBlueJewelBean.png"},{"name":"Jewel Orange","slug":"90","image":"OrangeJewelBean.png"},{"name":"Jewel Very Cherry","slug":"106","image":"verCherryJewelBean.png"}]},{"name":"Rookie Flavors®","shopName":"Rookie Flavors®","category":"335","guide":"rookie","description":"The newest Jelly Belly jelly bean flavors hope to become official flavors someday. Until then try these latest innovations. Rookie flavors change from time to time, so make this page a regular stop to find out about new flavors. In this collection, you will enjoy 7UP, Grape Crush, Orange Crush, Pomegranate Cosmo, Mojito, Peach Bellini and TABASCO®.","childcategories":[{"name":"7UP®","slug":"72","image":"7UP.jpg"},{"name":"Grape Crush®","slug":"78","image":"GrapeCrush.jpg"},{"name":"Orange Crush®","slug":"89","image":"OrgCrush.jpg"},{"name":"TABASCO®","slug":"346","image":"tabasco.jpg"},{"name":"Birthday Cake Remix™","slug":"162","image":"cs_birthdayCake.jpg"}]},{"name":"Kids Mix","shopName":"Kids Mix","category":"335","guide":"kids","description":"Kids know what they like and they\'re more than happy to tell you. We asked hundreds of kids to choose their most favorite Jelly Belly jelly bean flavors. The result is this kid-approved collection the whole family will enjoy!","childcategories":[{"name":"7UP®","slug":"72","image":"7UP.jpg"},{"name":"Berry Blue","slug":"66","image":"berryBlue.jpg"},{"name":"Blueberry","slug":"67","image":"Blueberry.jpg"},{"name":"Bubble Gum","slug":"18","image":"BubbleGum.jpg"},{"name":"Buttered Popcorn","slug":"68","image":"popcorn.jpg"},{"name":"Chocolate Pudding","slug":"74","image":"ChocolatePudding.jpg"},{"name":"Cotton Candy","slug":"15","image":"CottonCandy.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"lemon.jpg"},{"name":"Orange Sherbet","slug":"91","image":"OrangeSherbet.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Raspberry","slug":"97","image":"Raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"RedApple.jpg"},{"name":"Sour Apple","slug":"293","image":"sour_apple.jpg"},{"name":"Sour Cherry","slug":"191","image":"SourCherry.jpg"},{"name":"Strawberry Jam","slug":"101","image":"strawberryJam.jpg"},{"name":"Toasted Marshmallow","slug":"103","image":"Marshmallow.jpg"},{"name":"Tutti-Fruitti","slug":"105","image":"tuttiFruitti.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"}]},{"name":"Jelly Bean Chocolate Dips®","shopName":"Chocolate Dips®","category":"340","guide":"dips","description":"No flavor combination is quite as decadent as juicy fruit smothered in rich dark chocolate. These are our most popular beans...with a succulent twist.","childcategories":[{"name":"Mint","slug":"340","image":"dips_mint.jpg"},{"name":"Orange","slug":"340","image":"dips_orange.jpg"},{"name":"Strawberry","slug":"340","image":"dips_strawberry.jpg"},{"name":"Coconut","slug":"340","image":"dips_coconut.jpg"},{"name":"Very Cherry","slug":"106","image":"dips_cherry.jpg"},{"name":"Raspberry","slug":"340","image":"dips_raspberry.jpg"}]},{"name":"Sunkist® Citrus Mix","shopName":"Citrus Mix","category":"342","guide":"citrus","description":"Our favorite citrus flavors are all together in one mouthwatering mix. A little bit tart, a little bit sweet, and always refreshing and sunny. In this collection, you will enjoy Sunkist Orange, Sunkist Pink Grapefruit, Sunkist Lemon, Sunkist Tangerine and Sunkist Lime. Refresh your taste buds!","childcategories":[{"name":"Sunkist® Lemon","slug":"84","image":"lemon.jpg"},{"name":"Sunkist® Lime","slug":"185","image":"lime.jpg"},{"name":"Sunkist® Orange","slug":"90","image":"orange.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"}]},{"name":"Soda Pop Shoppe®","shopName":"Soda Pop Shoppe","category":"335","guide":"sodaPop","description":"The Soda Pop Shoppe® quenches your thirst for your favorite soft drinks. Find out which genuine soda brands have been given the Jelly Belly treatment.","childcategories":[{"name":"7UP","slug":"72","image":"7up.jpg"},{"name":"A&W® Cream Soda","slug":"13","image":"creamSoda.jpg"},{"name":"A&W® Root Beer","slug":"73","image":"rootBeer.jpg"},{"name":"Dr Pepper®","slug":"77","image":"drPepper.jpg"},{"name":"Orange Crush","slug":"89","image":"orgCrush.jpg"},{"name":"Grape Crush","slug":"78","image":"grapeCrush.jpg"}]},{"name":"Snapple™ Mix","shopName":"Snapple™ Mix","category":"223","guide":"snapple","description":"Five 100% natural flavors based on Snapple juice drinks. Just like the juices you love, they\'re Made from The Best Stuff on Earth™!","childcategories":[{"name":"Cranberry Raspberry","slug":"223","image":"snpl_cranras.png"},{"name":"Fruit Punch","slug":"223","image":"snpl_fruitPunch.jpg"},{"name":"Kiwi Strawberry","slug":"223","image":"snpl_kiwiStrw.jpg"},{"name":"Mango Madness","slug":"223","image":"snpl_mangoMad.jpg"},{"name":"Pink Lemonade","slug":"223","image":"snpl_pinkLemon.png"}]},{"name":"Superfruit","shopName":"Superfruit","category":"335","guide":"superfruit","description":"Superfruit Mix includes five exciting flavors bursting with fresh fruit taste. They\'re all made with real fruit juices and purees, as well as all natural flavors and colors from natural sources.","childcategories":[{"name":"Acai Berry","slug":"335","image":"snpl_fruitPunch.jpg"},{"name":"Barbados Cherry","slug":"335","image":"snpl_pinkLemon.png"},{"name":"Blueberry","slug":"67","image":"Blueberry.jpg"},{"name":"Cranberry","slug":"335","image":"snpl_cranras.png"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"}]},{"name":"Sport Beans®","shopName":"Sport Beans®","category":"336","guide":"sportBeans","description":"Sport Beans® refill your energy levels and taste great too! Find out what flavors are available here.","childcategories":[{"name":"Lemon Lime","slug":"336","image":"sb_lemonLime.jpg"},{"name":"Orange","slug":"336","image":"sb_orange.jpg"},{"name":"Fruit Punch","slug":"336","image":"sb_fruitPunch.jpg"},{"name":"Berry","slug":"336","image":"sb_berry.jpg"},{"name":"Cherry (Extreme Sport Beans®)","slug":"336","image":"sb_cherry.jpg"},{"name":"Watermelon (Extreme Sport Beans®)","slug":"336","image":"sb_watermelon.jpg"},{"name":"Pomegranate (Extreme Sport Beans®)","slug":"336","image":"sb_pomegranate.png"}]},{"name":"Fruit Bowl","shopName":"Fruit Bowl","category":"335","guide":"fruitBowl","description":"Vibrant, juicy and so right on you won\'t believe your taste buds. Each flavor is distinct and special, so explore one at a time for the full flavor adventure. No wild flavors here, just the best of the best of our fruit-inspired collection, many of them made with real juice, purees and flavor essence. In this collection, you will enjoy Blueberry, Coconut, Grape, Green Apple, Juicy Pear, Lemon, Lemon Lime, Peach, Pink Grapefruit, Plum, Raspberry, Red Apple, Tangerine, Top Banana, Very Cherry and Watermelon.","childcategories":[{"name":"Blueberry","slug":"67","image":"blueberry.jpg"},{"name":"Coconut","slug":"14","image":"Coconut.jpg"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Juicy Pear","slug":"81","image":"Pear.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"lemon.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Plum","slug":"95","image":"Plum.jpg"},{"name":"Raspberry","slug":"97","image":"Raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"RedApple.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"},{"name":"Top Banana","slug":"104","image":"TopBanana.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"}]},{"name":"Cocktail Classics®","shopName":"Cocktail Classics®","category":"335","guide":"cocktail","description":"This is a modern twist on the classic cocktail. No shaking or stirring necessary. All the flavor without the alcohol, this collection is ideal for celebrations large and small. This mix includes Margarita, Mojito, Peach Bellini, Piña Colada, Pomegranate Cosmo and Strawberry Daiquiri.","childcategories":[{"name":"Margarita","slug":"88","image":"cocktail_margarita.jpg"},{"name":"Mojito","slug":"210","image":"cocktail_mojito.jpg"},{"name":"Peach Bellini","slug":"209","image":"cocktail_PeachBellini.jpg"},{"name":"Piña Colada","slug":"93","image":"cocktail_pinaColada.jpg"},{"name":"Pomegranate Cosmo","slug":"208","image":"cocktail_pomCosmo.jpg"},{"name":"Strawberry Daiquiri","slug":"100","image":"cocktail_strwDaq.jpg"}]},{"name":"5-Flavor Sours","shopName":"5-Flavor Sours","category":"293","guide":"sours","description":"Thrill your taste buds with the lip-puckering Jelly Belly Sours flavors of fruits with a hint of sour.This mix includes Sour Lemon, Sour Cherry, Sour Grape, Sour Apple and Sour Orange.","childcategories":[{"name":"Sour Apple","slug":"293","image":"sour_apple.jpg"},{"name":"Sour Orange","slug":"293","image":"sour_orange.jpg"},{"name":"Sour Cherry","slug":"191","image":"sour_cherry.jpg"},{"name":"Sour Grape","slug":"293","image":"sour_grape.jpg"},{"name":"Sour Lemon","slug":"293","image":"sour_lemon.jpg"}]},{"name":"Sugar-Free Assorted","shopName":"Sugar-Free Assorted","category":"338","guide":"sugarFree","description":"Check out our assortment of Sugar-Free Jelly Belly jelly beans. They\'re just as sweet as the originals!","childcategories":[{"name":"Sugar-Free Cherry","slug":"338","image":"free_cherry.jpg"},{"name":"Sugar-Free Sizzling Cinnamon","slug":"338","image":"free_cinnamon.jpg"},{"name":"Sugar-Free Green Apple","slug":"338","image":"free_greenApple.jpg"},{"name":"Sugar-Free Juicy Pear","slug":"338","image":"free_pear.jpg"},{"name":"Sugar-Free Lemon","slug":"338","image":"free_lemon.jpg"},{"name":"Sugar-Free Licorice","slug":"338","image":"free_licorice.jpg"},{"name":"Sugar-Free Pineapple","slug":"338","image":"free_pineapple.jpg"},{"name":"Sugar-Free Buttered Popcorn","slug":"338","image":"free_popcorn.jpg"},{"name":"Sugar-Free Strawberry","slug":"338","image":"free_Strawberry.jpg"},{"name":"Sugar-Free Tangerine","slug":"338","image":"free_tangerine.jpg"}]},{"name":"Harry Potter™ Bertie Bott\'s Every Flavor Beans™","shopName":"Harry Potter™","category":"344","guide":"bertieBotts","description":"Harry Potter\'s favorite candy has returned! Get a box of tasty jelly beans blended with weird, wild ones!","childcategories":[{"name":"Banana","slug":"344","image":"bb_banana.jpg"},{"name":"Black Pepper","slug":"344","image":"bb_blackPepper.jpg"},{"name":"Blueberry","slug":"344","image":"bb_blueberry.jpg"},{"name":"Booger","slug":"344","image":"bb_booger.jpg"},{"name":"Candyfloss","slug":"344","image":"bb_candyFloss.jpg"},{"name":"Cherry","slug":"344","image":"bb_cherry.jpg"},{"name":"Cinnamon","slug":"344","image":"bb_cinnamon.jpg"},{"name":"Dirt","slug":"344","image":"bb_dirt.jpg"},{"name":"Earthworm","slug":"344","image":"bb_earthworm.jpg"},{"name":"Earwax","slug":"344","image":"bb_earwax.jpg"},{"name":"Grass","slug":"344","image":"bb_grass.jpg"},{"name":"Green Apple","slug":"344","image":"bb_greenApple.jpg"},{"name":"Lemon","slug":"344","image":"bb_lemon.jpg"},{"name":"Marshmallow","slug":"344","image":"bb_marshmallow.jpg"},{"name":"Rotten Egg","slug":"344","image":"bb_rottenEgg.jpg"},{"name":"Sausage","slug":"344","image":"bb_sausage.jpg"},{"name":"Soap","slug":"344","image":"bb_soap.jpg"},{"name":"Tutti-Fruitti","slug":"344","image":"bb_tuttiFrutti.jpg"},{"name":"Vomit","slug":"344","image":"bb_vomit.jpg"},{"name":"Watermelon","slug":"344","image":"bb_watermelon.jpg"}]}]';

        /**
         * Render model.
         * Rearange category.
         **/
        $(document).ready(function () {

            $('#jb-childcategory-container').empty();
            var category = JSON.parse(flavour_Guides1);
            $(category).each(function (index, data) {
                $('#jb-childcategory-container').append(Hypr.getTemplate('pages/flavor-guides-item').render({ model: data }));
            });
            /**
             * Add click handler
             **/
            $(".jb-colapsing-title").bind("click", function (e) {
                $(this).parent().find(".jb_contentfolder").slideToggle();
                if ($(this).find(".mz-mobile").css("display") == "block") {
                    var temphtml = $(this).find(".mz-mobile").text();
                    if (temphtml == "+") {
                        $(this).find(".mz-mobile").text("-");
                    } else {
                        $(this).find(".mz-mobile").text("+");
                    }
                }
            });

            /**
             * 1. Re-arange the order of items if URL has value of 'guide'
             *      1.1. currentItem = Get the first child.
             *      1.2. newItem = Get the URL referenced item
             *      1.3. newItem.insertBefore(currentItem);
             *      1.4. Open the new Item div.
             * 2. Else open the default first child item.
             **/
            var guide = GetURLParameter('guide');
            if (guide) {
                var currentFirstItem = $('#jb-childcategory-container').children()[0];
                if ($('[data-mz-category-guide=' + guide + ']').length > 0) {
                    $('[data-mz-category-guide=' + guide + ']').insertBefore(currentFirstItem);
                    $('[data-mz-category-guide=' + guide + ']').find(".jb_contentfolder").slideToggle();
                    $('[data-mz-category-guide=' + guide + ']').find(".mz-mobile").text('-');
                } else {
                    $(currentFirstItem).find(".jb_contentfolder").slideToggle();
                }
            }
        });


        function GetURLParameter(sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
            return '';
        }


    });

















require([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api"], function ($, Hypr, Backbone, api) {


        var flavour_Guides1 = '[{"name":"Jelly Belly 50 Official Flavors","shopName":"50 Official","category":"335","guide":"original50","description":"The most amazing, delightful and delicious collection of gourmet jelly beans is an adventure in taste. The best and most popular flavors we’ve made are gathered in the Official 50 flavors, your guide to discovering each and every one. Whatever your preferences we are absolutely sure there is a flavor here for you.  Eating Directions: Savor one flavor at a time to experience the true and distinctive taste of each Jelly Belly bean. Or, experiment by combining flavors in a Jelly Belly Recipe to create an entirely original taste experience.","childcategories":[{"name":"A&W® Cream Soda","slug":"13","image":"CreamSoda.jpg"},{"name":"A&W® Root Beer","slug":"73","image":"rootBeer.jpg"},{"name":"Berry Blue","slug":"66","image":"berryBlue.jpg"},{"name":"Blueberry","slug":"67","image":"blueberry.jpg"},{"name":"Bubble Gum","slug":"18","image":"BubbleGum.jpg"},{"name":"Buttered Popcorn","slug":"68","image":"popcorn.jpg"},{"name":"Cantaloupe","slug":"69","image":"Cantaloupe.jpg"},{"name":"Cappuccino","slug":"70","image":"Cappuccino.jpg"},{"name":"Caramel Corn","slug":"71","image":"CarmelCorn.jpg"},{"name":"Chili Mango","slug":"189","image":"ChiliMango.jpg"},{"name":"Chocolate Pudding","slug":"266","image":"ChocolatePudding.jpg"},{"name":"Cinnamon","slug":"75","image":"Cinnamon.jpg"},{"name":"Coconut","slug":"14","image":"Coconut.jpg"},{"name":"Cotton Candy","slug":"15","image":"CottonCandy.jpg"},{"name":"Crushed Pineapple","slug":"76","image":"CocktailPinaColada.jpg"},{"name":"Dr Pepper®","slug":"77","image":"DrPepper.jpg"},{"name":"French Vanilla","slug":"16","image":"vanilla.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Island Punch","slug":"80","image":"IslandPunch.jpg"},{"name":"Juicy Pear","slug":"81","image":"Pear.jpg"},{"name":"Kiwi","slug":"274","image":"Kiwi.jpg"},{"name":"Lemon Drop","slug":"83","image":"lemonDrop.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Licorice","slug":"86","image":"Licorice.jpg"},{"name":"Mango","slug":"87","image":"Mango.jpg"},{"name":"Margarita","slug":"88","image":"Margarita.jpg"},{"name":"Mixed Berry Smoothie","slug":"190","image":"BerrySmoothie.jpg"},{"name":"Orange Sherbet","slug":"91","image":"OrangeSherbet.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Piña Colada","slug":"93","image":"PinaColada.jpg"},{"name":"Plum","slug":"95","image":"Plum.jpg"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"},{"name":"Raspberry","slug":"97","image":"raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"redApple.jpg"},{"name":"Sizzling Cinnamon","slug":"99","image":"sizCin.jpg"},{"name":"Sour Cherry","slug":"191","image":"SourCherry.jpg"},{"name":"Strawberry Cheesecake","slug":"17","image":"strwCheesecake.jpg"},{"name":"Strawberry Daiquiri","slug":"100","image":"strwDaquiri.jpg"},{"name":"Strawberry Jam","slug":"101","image":"StrawberryJam.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"sour_lemon.jpg"},{"name":"Sunkist® Lime","slug":"185","image":"lime.jpg"},{"name":"Sunkist® Orange","slug":"90","image":"orange.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"},{"name":"Toasted Marshmallow","slug":"103","image":"Marshmallow.jpg"},{"name":"Top Banana","slug":"104","image":"topBanana.jpg"},{"name":"Tutti-Fruitti","slug":"105","image":"tuttiFruitti.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"},{"name":"Wild Blackberry","slug":"108","image":"WildBlackberry.jpg"}]},{"name":"Jewel Bean Collection","shopName":"Jewel Collection","category":"46","guide":"jewelBeans","description":"Popular Jelly Belly jelly bean flavors finished with a beautiful pearlescent sheen!","childcategories":[{"name":"Jewel Blueberry","slug":"67","image":"BlueberryJewelBean.png"},{"name":"Jewel Bubble Gum","slug":"18","image":"bubblegumJewelBean.png"},{"name":"Jewel Sour Apple","slug":"46","image":"sourAppleJewelBean.png"},{"name":"Jewel Cream Soda","slug":"46","image":"CreamSodaJewelBean.png"},{"name":"Jewel Berry Blue","slug":"66","image":"BerryBlueJewelBean.png"},{"name":"Jewel Orange","slug":"90","image":"OrangeJewelBean.png"},{"name":"Jewel Very Cherry","slug":"106","image":"verCherryJewelBean.png"}]},{"name":"Rookie Flavors®","shopName":"Rookie Flavors®","category":"335","guide":"rookie","description":"The newest Jelly Belly jelly bean flavors hope to become official flavors someday. Until then try these latest innovations. Rookie flavors change from time to time, so make this page a regular stop to find out about new flavors. In this collection, you will enjoy 7UP, Grape Crush, Orange Crush, Pomegranate Cosmo, Mojito, Peach Bellini and TABASCO®.","childcategories":[{"name":"7UP®","slug":"72","image":"7UP.jpg"},{"name":"Grape Crush®","slug":"78","image":"GrapeCrush.jpg"},{"name":"Orange Crush®","slug":"89","image":"OrgCrush.jpg"},{"name":"TABASCO®","slug":"346","image":"tabasco.jpg"},{"name":"Birthday Cake Remix™","slug":"162","image":"cs_birthdayCake.jpg"}]},{"name":"Kids Mix","shopName":"Kids Mix","category":"335","guide":"kids","description":"Kids know what they like and they\'re more than happy to tell you. We asked hundreds of kids to choose their most favorite Jelly Belly jelly bean flavors. The result is this kid-approved collection the whole family will enjoy!","childcategories":[{"name":"7UP®","slug":"72","image":"7UP.jpg"},{"name":"Berry Blue","slug":"66","image":"berryBlue.jpg"},{"name":"Blueberry","slug":"67","image":"Blueberry.jpg"},{"name":"Bubble Gum","slug":"18","image":"BubbleGum.jpg"},{"name":"Buttered Popcorn","slug":"68","image":"popcorn.jpg"},{"name":"Chocolate Pudding","slug":"74","image":"ChocolatePudding.jpg"},{"name":"Cotton Candy","slug":"15","image":"CottonCandy.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"lemon.jpg"},{"name":"Orange Sherbet","slug":"91","image":"OrangeSherbet.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Raspberry","slug":"97","image":"Raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"RedApple.jpg"},{"name":"Sour Apple","slug":"293","image":"sour_apple.jpg"},{"name":"Sour Cherry","slug":"191","image":"SourCherry.jpg"},{"name":"Strawberry Jam","slug":"101","image":"strawberryJam.jpg"},{"name":"Toasted Marshmallow","slug":"103","image":"Marshmallow.jpg"},{"name":"Tutti-Fruitti","slug":"105","image":"tuttiFruitti.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"}]},{"name":"Jelly Bean Chocolate Dips®","shopName":"Chocolate Dips®","category":"340","guide":"dips","description":"No flavor combination is quite as decadent as juicy fruit smothered in rich dark chocolate. These are our most popular beans...with a succulent twist.","childcategories":[{"name":"Mint","slug":"340","image":"dips_mint.jpg"},{"name":"Orange","slug":"340","image":"dips_orange.jpg"},{"name":"Strawberry","slug":"340","image":"dips_strawberry.jpg"},{"name":"Coconut","slug":"340","image":"dips_coconut.jpg"},{"name":"Very Cherry","slug":"106","image":"dips_cherry.jpg"},{"name":"Raspberry","slug":"340","image":"dips_raspberry.jpg"}]},{"name":"Sunkist® Citrus Mix","shopName":"Citrus Mix","category":"342","guide":"citrus","description":"Our favorite citrus flavors are all together in one mouthwatering mix. A little bit tart, a little bit sweet, and always refreshing and sunny. In this collection, you will enjoy Sunkist Orange, Sunkist Pink Grapefruit, Sunkist Lemon, Sunkist Tangerine and Sunkist Lime. Refresh your taste buds!","childcategories":[{"name":"Sunkist® Lemon","slug":"84","image":"lemon.jpg"},{"name":"Sunkist® Lime","slug":"185","image":"lime.jpg"},{"name":"Sunkist® Orange","slug":"90","image":"orange.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"}]},{"name":"Soda Pop Shoppe®","shopName":"Soda Pop Shoppe","category":"335","guide":"sodaPop","description":"The Soda Pop Shoppe® quenches your thirst for your favorite soft drinks. Find out which genuine soda brands have been given the Jelly Belly treatment.","childcategories":[{"name":"7UP","slug":"72","image":"7up.jpg"},{"name":"A&W® Cream Soda","slug":"13","image":"creamSoda.jpg"},{"name":"A&W® Root Beer","slug":"73","image":"rootBeer.jpg"},{"name":"Dr Pepper®","slug":"77","image":"drPepper.jpg"},{"name":"Orange Crush","slug":"89","image":"orgCrush.jpg"},{"name":"Grape Crush","slug":"78","image":"grapeCrush.jpg"}]},{"name":"Snapple™ Mix","shopName":"Snapple™ Mix","category":"223","guide":"snapple","description":"Five 100% natural flavors based on Snapple juice drinks. Just like the juices you love, they\'re Made from The Best Stuff on Earth™!","childcategories":[{"name":"Cranberry Raspberry","slug":"223","image":"snpl_cranras.png"},{"name":"Fruit Punch","slug":"223","image":"snpl_fruitPunch.jpg"},{"name":"Kiwi Strawberry","slug":"223","image":"snpl_kiwiStrw.jpg"},{"name":"Mango Madness","slug":"223","image":"snpl_mangoMad.jpg"},{"name":"Pink Lemonade","slug":"223","image":"snpl_pinkLemon.png"}]},{"name":"Superfruit","shopName":"Superfruit","category":"335","guide":"superfruit","description":"Superfruit Mix includes five exciting flavors bursting with fresh fruit taste. They\'re all made with real fruit juices and purees, as well as all natural flavors and colors from natural sources.","childcategories":[{"name":"Acai Berry","slug":"335","image":"snpl_fruitPunch.jpg"},{"name":"Barbados Cherry","slug":"335","image":"snpl_pinkLemon.png"},{"name":"Blueberry","slug":"67","image":"Blueberry.jpg"},{"name":"Cranberry","slug":"335","image":"snpl_cranras.png"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"}]},{"name":"Sport Beans®","shopName":"Sport Beans®","category":"336","guide":"sportBeans","description":"Sport Beans® refill your energy levels and taste great too! Find out what flavors are available here.","childcategories":[{"name":"Lemon Lime","slug":"336","image":"sb_lemonLime.jpg"},{"name":"Orange","slug":"336","image":"sb_orange.jpg"},{"name":"Fruit Punch","slug":"336","image":"sb_fruitPunch.jpg"},{"name":"Berry","slug":"336","image":"sb_berry.jpg"},{"name":"Cherry (Extreme Sport Beans®)","slug":"336","image":"sb_cherry.jpg"},{"name":"Watermelon (Extreme Sport Beans®)","slug":"336)","image":"sb_watermelon.jpg"},{"name":"Pomegranate (Extreme Sport Beans®)","slug":"336","image":"sb_pomegranate.png"}]},{"name":"Fruit Bowl","shopName":"Fruit Bowl","category":"335","guide":"fruitBowl","description":"Vibrant, juicy and so right on you won\'t believe your taste buds. Each flavor is distinct and special, so explore one at a time for the full flavor adventure. No wild flavors here, just the best of the best of our fruit-inspired collection, many of them made with real juice, purees and flavor essence. In this collection, you will enjoy Blueberry, Coconut, Grape, Green Apple, Juicy Pear, Lemon, Lemon Lime, Peach, Pink Grapefruit, Plum, Raspberry, Red Apple, Tangerine, Top Banana, Very Cherry and Watermelon.","childcategories":[{"name":"Blueberry","slug":"67","image":"blueberry.jpg"},{"name":"Coconut","slug":"14","image":"Coconut.jpg"},{"name":"Pomegranate","slug":"96","image":"Pomegranate.jpg"},{"name":"Green Apple","slug":"79","image":"GreenApple.jpg"},{"name":"Juicy Pear","slug":"81","image":"Pear.jpg"},{"name":"Sunkist® Lemon","slug":"276","image":"lemon.jpg"},{"name":"Lemon Lime","slug":"85","image":"lime.jpg"},{"name":"Peach","slug":"92","image":"Peach.jpg"},{"name":"Sunkist® Pink Grapefruit","slug":"94","image":"pinkGrapefruit.jpg"},{"name":"Plum","slug":"95","image":"Plum.jpg"},{"name":"Raspberry","slug":"97","image":"Raspberry.jpg"},{"name":"Red Apple","slug":"98","image":"RedApple.jpg"},{"name":"Sunkist® Tangerine","slug":"102","image":"tangerine.jpg"},{"name":"Top Banana","slug":"104","image":"TopBanana.jpg"},{"name":"Very Cherry","slug":"106","image":"VeryCherry.jpg"},{"name":"Watermelon","slug":"107","image":"Watermelon.jpg"}]},{"name":"Cocktail Classics®","shopName":"Cocktail Classics®","category":"335","guide":"cocktail","description":"This is a modern twist on the classic cocktail. No shaking or stirring necessary. All the flavor without the alcohol, this collection is ideal for celebrations large and small. This mix includes Margarita, Mojito, Peach Bellini, Piña Colada, Pomegranate Cosmo and Strawberry Daiquiri.","childcategories":[{"name":"Margarita","slug":"88","image":"cocktail_margarita.jpg"},{"name":"Mojito","slug":"210","image":"cocktail_mojito.jpg"},{"name":"Peach Bellini","slug":"209","image":"cocktail_PeachBellini.jpg"},{"name":"Piña Colada","slug":"93","image":"cocktail_pinaColada.jpg"},{"name":"Pomegranate Cosmo","slug":"208","image":"cocktail_pomCosmo.jpg"},{"name":"Strawberry Daiquiri","slug":"100","image":"cocktail_strwDaq.jpg"}]},{"name":"5-Flavor Sours","shopName":"5-Flavor Sours","category":"293","guide":"sours","description":"Thrill your taste buds with the lip-puckering Jelly Belly Sours flavors of fruits with a hint of sour.This mix includes Sour Lemon, Sour Cherry, Sour Grape, Sour Apple and Sour Orange.","childcategories":[{"name":"Sour Apple","slug":"293","image":"sour_apple.jpg"},{"name":"Sour Orange","slug":"293","image":"sour_orange.jpg"},{"name":"Sour Cherry","slug":"191","image":"sour_cherry.jpg"},{"name":"Sour Grape","slug":"293","image":"sour_grape.jpg"},{"name":"Sour Lemon","slug":"293","image":"sour_lemon.jpg"}]},{"name":"Sugar-Free Assorted","shopName":"Sugar-Free Assorted","category":"338","guide":"sugarFree","description":"Check out our assortment of Sugar-Free Jelly Belly jelly beans. They\'re just as sweet as the originals!","childcategories":[{"name":"Sugar-Free Cherry","slug":"338","image":"free_cherry.jpg"},{"name":"Sugar-Free Sizzling Cinnamon","slug":"338","image":"free_cinnamon.jpg"},{"name":"Sugar-Free Green Apple","slug":"338","image":"free_greenApple.jpg"},{"name":"Sugar-Free Juicy Pear","slug":"338","image":"free_pear.jpg"},{"name":"Sugar-Free Lemon","slug":"338","image":"free_lemon.jpg"},{"name":"Sugar-Free Licorice","slug":"338","image":"free_licorice.jpg"},{"name":"Sugar-Free Pineapple","slug":"338","image":"free_pineapple.jpg"},{"name":"Sugar-Free Buttered Popcorn","slug":"338","image":"free_popcorn.jpg"},{"name":"Sugar-Free Strawberry","slug":"338","image":"free_Strawberry.jpg"},{"name":"Sugar-Free Tangerine","slug":"338","image":"free_tangerine.jpg"}]},{"name":"Harry Potter™ Bertie Bott\'s Every Flavor Beans™","shopName":"Harry Potter™","category":"344","guide":"bertieBotts","description":"Harry Potter\'s favorite candy has returned! Get a box of tasty jelly beans blended with weird, wild ones!","childcategories":[{"name":"Banana","slug":"344","image":"bb_banana.jpg"},{"name":"Black Pepper","slug":"344","image":"bb_blackPepper.jpg"},{"name":"Blueberry","slug":"344","image":"bb_blueberry.jpg"},{"name":"Booger","slug":"344","image":"bb_booger.jpg"},{"name":"Candyfloss","slug":"344","image":"bb_candyFloss.jpg"},{"name":"Cherry","slug":"344","image":"bb_cherry.jpg"},{"name":"Cinnamon","slug":"344","image":"bb_cinnamon.jpg"},{"name":"Dirt","slug":"344","image":"bb_dirt.jpg"},{"name":"Earthworm","slug":"344","image":"bb_earthworm.jpg"},{"name":"Earwax","slug":"344","image":"bb_earwax.jpg"},{"name":"Grass","slug":"344","image":"bb_grass.jpg"},{"name":"Green Apple","slug":"344","image":"bb_greenApple.jpg"},{"name":"Lemon","slug":"344","image":"bb_lemon.jpg"},{"name":"Marshmallow","slug":"344","image":"bb_marshmallow.jpg"},{"name":"Rotten Egg","slug":"344","image":"bb_rottenEgg.jpg"},{"name":"Sausage","slug":"344","image":"bb_sausage.jpg"},{"name":"Soap","slug":"344","image":"bb_soap.jpg"},{"name":"Tutti-Fruitti","slug":"344","image":"bb_tuttiFrutti.jpg"},{"name":"Vomit","slug":"344","image":"bb_vomit.jpg"},{"name":"Watermelon","slug":"344","image":"bb_watermelon.jpg"}]}]';

        /**
         * Render model.
         * Rearange category.
         **/
        $(document).ready(function () {

            $('#jb-childcategory-container').empty();
            var category = JSON.parse(flavour_Guides1);
            $(category).each(function (index, data) {
                $('#jb-childcategory-container').append(Hypr.getTemplate('pages/flavor-guides-item').render({ model: data }));
            });
            /**
             * Add click handler
             **/
            $(".jb-colapsing-title").bind("click", function (e) {
                $(this).parent().find(".jb_contentfolder").slideToggle();
                if ($(this).find(".mz-mobile").css("display") == "block") {
                    var temphtml = $(this).find(".mz-mobile").text();
                    if (temphtml == "+") {
                        $(this).find(".mz-mobile").text("-");
                    } else {
                        $(this).find(".mz-mobile").text("+");
                    }
                }
            });

            /**
             * 1. Re-arange the order of items if URL has value of 'guide'
             *      1.1. currentItem = Get the first child.
             *      1.2. newItem = Get the URL referenced item
             *      1.3. newItem.insertBefore(currentItem);
             *      1.4. Open the new Item div.
             * 2. Else open the default first child item.
             **/
            var guide = GetURLParameter('guide');
            if (guide) {
                var currentFirstItem = $('#jb-childcategory-container').children()[0];
                if ($('[data-mz-category-guide=' + guide + ']').length > 0) {
                    $('[data-mz-category-guide=' + guide + ']').insertBefore(currentFirstItem);
                    $('[data-mz-category-guide=' + guide + ']').find(".jb_contentfolder").slideToggle();
                    $('[data-mz-category-guide=' + guide + ']').find(".mz-mobile").text('-');
                } else {
                    $(currentFirstItem).find(".jb_contentfolder").slideToggle();
                }
            }
        });


        function GetURLParameter(sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
            return '';
        }


    });

















