import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useThemeStore from '../../Stores/ThemeStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBar = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const inputRef = useRef(null);
  const { darkMode } = useThemeStore();
  const navigate = useNavigate();

  const products = [
    // ================= MEN =================
    { id: 1,  name: "Men's T-Shirts",    category: "mens",   type: "tshirt",      keywords: ["men","mens","man","male","guy","gentleman","tshirt","t-shirt","tee","t shirt","top","crew neck","v-neck","round neck","half sleeve","full sleeve","casual","polo","henley","graphic tee","plain tee","cotton tshirt","mens tshirt","men tshirt","menswear"] },
    { id: 2,  name: "Men's Shirts",      category: "mens",   type: "shirt",       keywords: ["men","mens","man","male","shirt","formal shirt","casual shirt","dress shirt","office shirt","business shirt","linen shirt","check shirt","striped shirt","solid shirt","full sleeve shirt","half sleeve shirt","mens shirt","men shirt","button down","button up"] },
    { id: 3,  name: "Men's Jeans",       category: "mens",   type: "jeans",       keywords: ["men","mens","man","male","jeans","denim","slim fit","skinny","straight fit","regular fit","relaxed fit","stretch jeans","blue jeans","black jeans","mens jeans","men jeans","denim pants","denim trousers"] },
    { id: 4,  name: "Men's Trousers",    category: "mens",   type: "trousers",    keywords: ["men","mens","man","male","trousers","pants","formal pants","chinos","chino","dress pants","office pants","business pants","linen trousers","cotton trousers","mens trousers","men trousers","bottom wear","formal bottom"] },
    { id: 5,  name: "Men's Shorts",      category: "mens",   type: "shorts",      keywords: ["men","mens","man","male","shorts","half pants","bermuda","cargo shorts","casual shorts","denim shorts","gym shorts","beach shorts","summer shorts","mens shorts","men shorts"] },
    { id: 6,  name: "Men's Kurta",       category: "mens",   type: "kurta",       keywords: ["men","mens","man","male","kurta","kurtha","ethnic","traditional","indian wear","festive","cotton kurta","silk kurta","casual kurta","party kurta","mens kurta","men kurta","salwar","kurta pajama"] },
    { id: 7,  name: "Men's Ethnic Sets", category: "mens",   type: "ethnicset",   keywords: ["men","mens","man","male","ethnic set","ethnic wear","traditional","indian wear","kurta set","sherwani","dhoti set","festive wear","wedding wear","mens ethnic","men ethnic","cultural wear","occasion wear"] },
    { id: 8,  name: "Men's Jackets",     category: "mens",   type: "jacket",      keywords: ["men","mens","man","male","jacket","leather jacket","bomber jacket","windbreaker","denim jacket","puffer jacket","quilted jacket","zip jacket","winter jacket","outerwear","mens jacket","men jacket","coat","overcoat"] },
    { id: 9,  name: "Men's Hoodies",     category: "mens",   type: "hoodie",      keywords: ["men","mens","man","male","hoodie","hoody","pullover hoodie","zip hoodie","sweatshirt hoodie","winter hoodie","casual hoodie","graphic hoodie","plain hoodie","warm","fleece hoodie","mens hoodie","men hoodie"] },
    { id: 10, name: "Men's Sweatshirts", category: "mens",   type: "sweatshirt",  keywords: ["men","mens","man","male","sweatshirt","pullover","crewneck","fleece","sweater","warm top","casual top","winter top","mens sweatshirt","men sweatshirt","sportswear top"] },
    { id: 11, name: "Men's Blazers",     category: "mens",   type: "blazer",      keywords: ["men","mens","man","male","blazer","suit jacket","formal blazer","casual blazer","office blazer","sport coat","tailored","mens blazer","men blazer","formal wear","business wear","smart casual"] },
    { id: 12, name: "Men's Suits",       category: "mens",   type: "suit",        keywords: ["men","mens","man","male","suit","two piece","three piece","formal suit","business suit","wedding suit","tuxedo","blazer trousers","office suit","mens suit","men suit","formal","occasion"] },
    { id: 13, name: "Men's Track Pants", category: "mens",   type: "trackpants",  keywords: ["men","mens","man","male","track pants","trackpants","joggers","sweatpants","gym pants","athletic pants","sports pants","lounge pants","casual pants","mens track pants","men track pants","activewear bottom"] },
    { id: 14, name: "Men's Activewear",  category: "mens",   type: "activewear",  keywords: ["men","mens","man","male","activewear","sportswear","gym wear","workout","athletic","running","training","fitness","sports","yoga","compression","mens activewear","men activewear","gym clothes"] },
    { id: 15, name: "Men's Innerwear",   category: "mens",   type: "innerwear",   keywords: ["men","mens","man","male","innerwear","underwear","briefs","boxers","trunks","vest","undershirt","undergarment","mens innerwear","men innerwear"] },
    { id: 16, name: "Men's Sleepwear",   category: "mens",   type: "sleepwear",   keywords: ["men","mens","man","male","sleepwear","nightwear","pyjamas","pajamas","lounge wear","night suit","sleep set","mens sleepwear","men sleepwear","nightdress","comfortable","relax wear"] },
    { id: 17, name: "Men's Swimwear",    category: "mens",   type: "swimwear",    keywords: ["men","mens","man","male","swimwear","swimming","swim trunks","board shorts","beach shorts","pool wear","swim shorts","mens swimwear","men swimwear","trunks","bikini bottom"] },
    { id: 18, name: "Men's Footwear",    category: "mens",   type: "footwear",    keywords: ["men","mens","man","male","footwear","shoes","sneakers","casual shoes","sports shoes","running shoes","loafers","oxfords","derby","formal shoes","mens footwear","men footwear","boots","ankle boots","slip on"] },
    { id: 19, name: "Men's Sandals",     category: "mens",   type: "sandals",     keywords: ["men","mens","man","male","sandals","slippers","flip flops","chappal","slides","open toe","beach sandals","casual sandals","mens sandals","men sandals","thong sandals","sport sandals"] },
    { id: 20, name: "Men's Accessories", category: "mens",   type: "accessories", keywords: ["men","mens","man","male","accessories","belt","wallet","watch","sunglasses","cap","hat","scarf","tie","pocket square","cufflinks","bag","backpack","mens accessories","men accessories","fashion accessories"] },

    // ================= WOMEN =================
    { id: 21, name: "Women's Saree",       category: "womens", type: "saree",      keywords: ["women","womens","woman","female","lady","girl","saree","sari","silk saree","cotton saree","designer saree","banarasi","kanjivaram","chiffon saree","georgette saree","party saree","wedding saree","ethnic","traditional","indian wear","womens saree","women saree"] },
    { id: 22, name: "Women's Kurti",       category: "womens", type: "kurti",      keywords: ["women","womens","woman","female","lady","girl","kurti","kurta","tunic","long top","printed kurti","cotton kurti","silk kurti","casual kurti","party kurti","ethnic top","indian top","womens kurti","women kurti","anarkali","a-line kurti"] },
    { id: 23, name: "Women's Dresses",     category: "womens", type: "dress",      keywords: ["women","womens","woman","female","lady","girl","dress","frock","gown","midi dress","maxi dress","mini dress","casual dress","party dress","summer dress","wrap dress","bodycon","shift dress","womens dress","women dress","floral dress","cocktail dress"] },
    { id: 24, name: "Women's Tops",        category: "womens", type: "top",        keywords: ["women","womens","woman","female","lady","girl","top","blouse","shirt","casual top","formal top","printed top","crop top","tank top","tube top","halter top","sleeveless top","womens top","women top","cami","peplum"] },
    { id: 25, name: "Women's T-Shirts",    category: "womens", type: "tshirt",     keywords: ["women","womens","woman","female","lady","girl","tshirt","t-shirt","tee","graphic tee","plain tee","casual tshirt","cotton tshirt","half sleeve","full sleeve","v-neck","round neck","womens tshirt","women tshirt","womenswear tee"] },
    { id: 26, name: "Women's Jeans",       category: "womens", type: "jeans",      keywords: ["women","womens","woman","female","lady","girl","jeans","denim","skinny jeans","slim fit","straight jeans","boyfriend jeans","mom jeans","high waist jeans","flare jeans","womens jeans","women jeans","denim pants","stretch jeans"] },
    { id: 27, name: "Women's Trousers",    category: "womens", type: "trousers",   keywords: ["women","womens","woman","female","lady","girl","trousers","pants","formal pants","palazzo","wide leg","straight pants","cigarette pants","office pants","casual pants","womens trousers","women trousers","cotton trousers","linen pants"] },
    { id: 28, name: "Women's Skirts",      category: "womens", type: "skirt",      keywords: ["women","womens","woman","female","lady","girl","skirt","mini skirt","midi skirt","maxi skirt","pencil skirt","pleated skirt","flared skirt","wrap skirt","denim skirt","casual skirt","womens skirt","women skirt","bottom wear"] },
    { id: 29, name: "Women's Leggings",    category: "womens", type: "leggings",   keywords: ["women","womens","woman","female","lady","girl","leggings","tights","jeggings","yoga leggings","gym leggings","casual leggings","printed leggings","cotton leggings","workout tights","womens leggings","women leggings","stretch pants","active leggings"] },
    { id: 30, name: "Women's Ethnic Sets", category: "womens", type: "ethnicset",  keywords: ["women","womens","woman","female","lady","girl","ethnic set","salwar suit","churidar","anarkali set","dupatta set","traditional set","ethnic wear","indian wear","festival wear","wedding set","womens ethnic","women ethnic","suit set","co-ord ethnic"] },
    { id: 31, name: "Women's Gowns",       category: "womens", type: "gown",       keywords: ["women","womens","woman","female","lady","girl","gown","evening gown","ball gown","party gown","wedding gown","maxi gown","floor length","formal gown","designer gown","womens gown","women gown","long dress","occasion wear"] },
    { id: 32, name: "Women's Blazers",     category: "womens", type: "blazer",     keywords: ["women","womens","woman","female","lady","girl","blazer","formal blazer","office blazer","casual blazer","suit jacket","tailored blazer","oversized blazer","womens blazer","women blazer","business wear","smart casual"] },
    { id: 33, name: "Women's Jackets",     category: "womens", type: "jacket",     keywords: ["women","womens","woman","female","lady","girl","jacket","denim jacket","leather jacket","bomber jacket","puffer jacket","windbreaker","crop jacket","long jacket","womens jacket","women jacket","outerwear","winter jacket","zip up"] },
    { id: 34, name: "Women's Sweaters",    category: "womens", type: "sweater",    keywords: ["women","womens","woman","female","lady","girl","sweater","pullover","knitwear","cardigan","knit sweater","wool sweater","winter sweater","cozy","warm top","womens sweater","women sweater","turtleneck","crewneck sweater"] },
    { id: 35, name: "Women's Nightwear",   category: "womens", type: "nightwear",  keywords: ["women","womens","woman","female","lady","girl","nightwear","sleepwear","pyjamas","pajamas","night suit","night dress","lounge wear","robe","sleep set","womens nightwear","women nightwear","nightgown","comfortable","relax wear"] },
    { id: 36, name: "Women's Activewear",  category: "womens", type: "activewear", keywords: ["women","womens","woman","female","lady","girl","activewear","sportswear","gym wear","workout","athletic","yoga","running","fitness","sports bra","leggings set","womens activewear","women activewear","gym clothes","athleisure"] },
    { id: 37, name: "Women's Lingerie",    category: "womens", type: "lingerie",   keywords: ["women","womens","woman","female","lady","girl","lingerie","innerwear","bra","panty","underwear","intimate","bralette","bikini","womens lingerie","women lingerie","undergarment","intimate wear"] },
    { id: 38, name: "Women's Swimwear",    category: "womens", type: "swimwear",   keywords: ["women","womens","woman","female","lady","girl","swimwear","swimsuit","bikini","one piece","two piece","monokini","beach wear","pool wear","swim dress","womens swimwear","women swimwear","tankini","swimming costume"] },
    { id: 39, name: "Women's Footwear",    category: "womens", type: "footwear",   keywords: ["women","womens","woman","female","lady","girl","footwear","shoes","heels","flats","sneakers","sandals","wedges","pumps","stiletto","block heels","casual shoes","formal shoes","womens footwear","women footwear","boots","loafers","slip on"] },
    { id: 40, name: "Women's Accessories", category: "womens", type: "accessories",keywords: ["women","womens","woman","female","lady","girl","accessories","handbag","purse","clutch","tote","scarf","belt","sunglasses","jewellery","earrings","necklace","bangles","watch","hair accessories","womens accessories","women accessories"] },

    // ================= KIDS =================
    { id: 41, name: "Kids T-Shirts",    category: "kids", type: "tshirt",      keywords: ["kids","kid","child","children","boy","girl","baby","toddler","junior","tshirt","t-shirt","tee","graphic tee","printed tee","cotton tshirt","casual top","half sleeve","full sleeve","kids tshirt","children tshirt","kids top","boys tshirt","girls tshirt"] },
    { id: 42, name: "Kids Shirts",      category: "kids", type: "shirt",       keywords: ["kids","kid","child","children","boy","girl","baby","toddler","shirt","formal shirt","casual shirt","check shirt","printed shirt","kids shirt","children shirt","boys shirt","school shirt","party shirt","button shirt"] },
    { id: 43, name: "Kids Jeans",       category: "kids", type: "jeans",       keywords: ["kids","kid","child","children","boy","girl","baby","toddler","jeans","denim","kids jeans","children jeans","boys jeans","girls jeans","slim fit","straight fit","casual bottom","denim pants","kids denim","stretch jeans"] },
    { id: 44, name: "Kids Shorts",      category: "kids", type: "shorts",      keywords: ["kids","kid","child","children","boy","girl","baby","toddler","shorts","half pants","casual shorts","summer shorts","beach shorts","kids shorts","children shorts","boys shorts","girls shorts","sport shorts","printed shorts"] },
    { id: 45, name: "Kids Dresses",     category: "kids", type: "dress",       keywords: ["kids","kid","child","children","girl","baby","toddler","dress","frock","party dress","casual dress","floral dress","kids dress","children dress","girls dress","midi dress","mini dress","birthday dress","printed dress"] },
    { id: 46, name: "Kids Ethnic Wear", category: "kids", type: "ethnicwear",  keywords: ["kids","kid","child","children","boy","girl","baby","toddler","ethnic","traditional","indian wear","kurta","lehenga","sherwani","salwar","festival wear","wedding wear","kids ethnic","children ethnic","occasion wear","cultural"] },
    { id: 47, name: "Kids Sleepwear",   category: "kids", type: "sleepwear",   keywords: ["kids","kid","child","children","boy","girl","baby","toddler","sleepwear","nightwear","pyjamas","pajamas","night suit","sleep set","kids sleepwear","children sleepwear","comfortable","lounge wear","nightdress"] },
    { id: 48, name: "Kids Footwear",    category: "kids", type: "footwear",    keywords: ["kids","kid","child","children","boy","girl","baby","toddler","footwear","shoes","sneakers","sandals","slippers","school shoes","sports shoes","casual shoes","kids footwear","children footwear","boots","velcro shoes","kids shoes"] },
    { id: 49, name: "Kids Toys",        category: "kids", type: "toys",        keywords: ["kids","kid","child","children","boy","girl","baby","toddler","toys","toy","play","games","educational toys","learning toys","soft toys","action figures","dolls","puzzles","kids toys","children toys","baby toys","fun","activity"] },
    { id: 50, name: "Kids Accessories", category: "kids", type: "accessories", keywords: ["kids","kid","child","children","boy","girl","baby","toddler","accessories","cap","hat","bag","backpack","school bag","belt","socks","sunglasses","hair accessories","kids accessories","children accessories","watch","hair band"] },
  ];

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      setSelectedIndex(-1);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredResults(products.filter(p => p.keywords.some(kw => kw.toLowerCase().includes(q))));
    setSelectedIndex(-1);

    // API call with 400ms debounce
    const debounce = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/search/${searchQuery.trim()}`);
        console.log('Search API results:', response.data);
      } catch (err) {
        console.error('Search API error:', err);
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    setFilteredResults([]);
    setSelectedIndex(-1);
    onClose();
  };

  const handleSelectItem = (item) => {
    console.log('Selected:', item);
    handleClose();
    const cat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    navigate(`/category/${cat}-${item.type}`);
  };

  const handleCollectionClick = (collectionName) => {
    const urlPath = collectionName.toLowerCase().replace(/\s+/g, "");
    handleClose();
    navigate(`/${urlPath}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
    else if (e.key === 'ArrowDown')
      setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
    else if (e.key === 'ArrowUp') setSelectedIndex((prev) => Math.max(prev - 1, -1));
    else if (e.key === 'Enter' && selectedIndex >= 0)
      handleSelectItem(filteredResults[selectedIndex]);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        className={`relative w-full max-w-2xl rounded-lg shadow-2xl transition-all duration-300 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-300 dark:border-gray-700">
          <MagnifyingGlassIcon className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for men, women, kids clothing..."
            className={`flex-1 outline-none text-lg ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
          />
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {searchQuery || filteredResults.length ? (
          <div className="max-h-96 overflow-y-auto">
            {filteredResults.length ? (
              filteredResults.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${index === selectedIndex
                    ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <MagnifyingGlassIcon className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)} • {item.type}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No results found</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm mb-3">Try Collections:</p>
            <div className="flex flex-wrap gap-2">
              {["mens collections", "womens collections", "kids collections"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleCollectionClick(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;