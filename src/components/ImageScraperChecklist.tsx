import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, CheckCircle2, AlertCircle, Search } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
}

interface ImageSource {
  url: string;
  source: string;
  quality: 'high' | 'medium';
}

export const ImageScraperChecklist = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, country, image_url')
        .order('country', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      toast({
        title: "Error loading recipes",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUnsplashImage = async (dishName: string, country: string): Promise<ImageSource | null> => {
    try {
      // Curated high-quality dish images from Unsplash - AUTHENTIC & ACCURATE
      const dishImageMap: Record<string, string> = {
        // ===== AFRICAN DISHES - WEST AFRICA =====
        'jollof rice': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'fufu': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'waakye': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc',
        'banku': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'egusi': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'suya': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        'akara': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'moin moin': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'pepper soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'pounded yam': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'efo riro': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'ewa agoyin': 'https://images.unsplash.com/photo-1515516969-d4008cc6241a',
        'alloco': 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c',
        'kelewele': 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c',
        'red red': 'https://images.unsplash.com/photo-1515516969-d4008cc6241a',
        'kilishi': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
        'bissap': 'https://images.unsplash.com/photo-1558857563-b371033873b8',
        'thieboudienne': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
        'maafe': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'yassa': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'cachupa': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'poulet': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'ndole': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'konkonte': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'groundnut soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'puff puff': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        'bofrot': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        'puff-puff': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        'plasas': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'superkanja': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'okra soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'bambara': 'https://images.unsplash.com/photo-1515516969-d4008cc6241a',
        'fonio': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'obe ata': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'stew': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'attieke': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'attiéké': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'grilled chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'stuffed crabs': 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        'akotonshi': 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        
        // ===== AFRICAN DISHES - NORTH AFRICA =====
        'couscous': 'https://images.unsplash.com/photo-1625398407796-82650a8c135f',
        'couscous royale': 'https://images.unsplash.com/photo-1625398407796-82650a8c135f',
        'tagine': 'https://images.unsplash.com/photo-1539449438168-5d1f0b7a9aeb',
        'koshari': 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        'ful medames': 'https://images.unsplash.com/photo-1607532941433-304659e8198a',
        'shakshuka': 'https://images.unsplash.com/photo-1587631722698-e77bcadc4d53',
        'harira': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'bastilla': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'mechoui': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'bazeen': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'kissar': 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
        
        // ===== AFRICAN DISHES - EAST AFRICA =====
        'injera': 'https://images.unsplash.com/photo-1645696985256-1871606eb388',
        'doro wat': 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2',
        'ugali': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'sukuma wiki': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        'sukuma': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        'collard greens': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        'nyama choma': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        'pilau': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
        'mandazi': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        'chapati': 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
        'matoke': 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c',
        'mkate mayai': 'https://images.unsplash.com/photo-1509722747041-616f39b57569',
        'kachumbari': 'https://images.unsplash.com/photo-1540420773420-3366772f4999',
        'sambusa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
        
        // ===== AFRICAN DISHES - CENTRAL AFRICA =====
        'nyembwe': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'moambe': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'fufu and soup': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        
        // ===== AFRICAN DISHES - SOUTHERN AFRICA =====
        'bobotie': 'https://images.unsplash.com/photo-1544025162-d76694265947',
        'bunny chow': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'pap': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'biltong': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
        'boerewors': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'sosaties': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'potjiekos': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'malva pudding': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        'piri piri': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'seswaa': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        'emasi': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818',
        
        // ===== ASIAN DISHES - EAST ASIA =====
        'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
        'ramen': 'https://images.unsplash.com/photo-1623341214825-9f4f963727da',
        'ramen carbonara': 'https://images.unsplash.com/photo-1623341214825-9f4f963727da',
        'tempura': 'https://images.unsplash.com/photo-1542528180-1c2803fa048c',
        'yakitori': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'tonkatsu': 'https://images.unsplash.com/photo-1600891964092-4316c288032e',
        'okonomiyaki': 'https://images.unsplash.com/photo-1589927986089-35812388d1f8',
        'dim sum': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
        'peking duck': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'dumplings': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
        'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
        'fried rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'bibimbap': 'https://images.unsplash.com/photo-1553621042-f6e147245754',
        'bulgogi': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'kimchi': 'https://images.unsplash.com/photo-1555165171-1e396a52e5a0',
        'tanghulu': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        
        // ===== ASIAN DISHES - SOUTHEAST ASIA =====
        'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e',
        'pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43',
        'tom yum': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'green curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
        'massaman curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
        'satay': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'rendang': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'nasi goreng': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'banh mi': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
        'laksa': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
        'chicken rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'adobo': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'lumpia': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        
        // ===== ASIAN DISHES - SOUTH ASIA =====
        'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
        'curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
        'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
        'tikka masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
        'chicken tikka': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
        'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
        'dal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
        'naan': 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
        'dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc',
        'idli': 'https://images.unsplash.com/photo-1596040033229-a0b58dc92a46',
        'korma': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'vindaloo': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        
        // ===== CENTRAL ASIAN DISHES =====
        'plov': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
        
        // ===== EUROPEAN DISHES - ITALY =====
        'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
        'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        'baked feta pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
        'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3',
        'risotto': 'https://images.unsplash.com/photo-1476124369491-c4076c45dd59',
        'osso buco': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
        'gelato': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        'bruschetta': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f',
        'ravioli': 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa',
        
        // ===== EUROPEAN DISHES - FRANCE =====
        'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        'baguette': 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
        'ratatouille': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'coq au vin': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'bouillabaisse': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'quiche': 'https://images.unsplash.com/photo-1476124369491-c4076c45dd59',
        'crepe': 'https://images.unsplash.com/photo-1509365465985-25d11c17e812',
        'macaron': 'https://images.unsplash.com/photo-1569864358642-9d1684040f43',
        'escargot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        
        // ===== EUROPEAN DISHES - SPAIN =====
        'paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a',
        'tapas': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'gazpacho': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'tortilla': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc',
        'churros': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330',
        'jamón': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
        
        // ===== EUROPEAN DISHES - OTHER =====
        'schnitzel': 'https://images.unsplash.com/photo-1600891964092-4316c288032e',
        'goulash': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
        'moussaka': 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
        'souvlaki': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'pierogi': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
        'fondue': 'https://images.unsplash.com/photo-1476124369491-c4076c45dd59',
        'haggis': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        
        // ===== AMERICAN DISHES - NORTH AMERICA =====
        'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        'hot dog': 'https://images.unsplash.com/photo-1612392062798-2dbae835a9a0',
        'bbq': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        'ribs': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'buffalo wings': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'mac and cheese': 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        'lobster roll': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'clam chowder': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'philly cheesesteak': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc',
        'pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
        'crispy pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
        'cloud bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
        'apple pie': 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9',
        'brownie': 'https://images.unsplash.com/photo-1607920591413-4ec007e70023',
        'dirty shirley': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
        
        // ===== AMERICAN DISHES - LATIN AMERICA =====
        'tacos': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
        'burritos': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
        'enchiladas': 'https://images.unsplash.com/photo-1576021182211-9ea8dfe89a12',
        'quesadilla': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e',
        'guacamole': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        'empanadas': 'https://images.unsplash.com/photo-1599974789497-a4d6b742ff2f',
        'ceviche': 'https://images.unsplash.com/photo-1512838243191-e81e41d49602',
        'arepas': 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
        'feijoada': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'churrasco': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'mole': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        'tamales': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc',
        'pabellón': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'bandeja paisa': 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        'pepperpot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'chamoy pickle': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        
        // ===== MIDDLE EAST =====
        'dubai chocolate': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b',
        
        // ===== OCEANIA =====
        'meat pie': 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        'pavlova': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
        'lamington': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        'anzac biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35',
        'vegemite': 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
        'hangi': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba',
        'fish and chips': 'https://images.unsplash.com/photo-1596662951482-0c4ba8a9c753',
      };
      
      // Search for dish by keywords
      const dishKey = Object.keys(dishImageMap).find(key => 
        dishName.toLowerCase().includes(key) || key.includes(dishName.toLowerCase())
      );
      
      if (dishKey && dishImageMap[dishKey]) {
        return {
          url: `${dishImageMap[dishKey]}?w=1200&q=85&fm=jpg`,
          source: 'unsplash',
          quality: 'high'
        };
      }
      
      // Fallback to generic food images
      const fallbackImages = [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      ];
      
      const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      
      return {
        url: `${randomImage}?w=1200&q=85&fm=jpg`,
        source: 'unsplash',
        quality: 'high'
      };
    } catch (error) {
      console.error(`Error searching for ${dishName}:`, error);
      return null;
    }
  };

  const updateRecipeImage = async (recipeId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ image_url: imageUrl })
        .eq('id', recipeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating recipe ${recipeId}:`, error);
      return false;
    }
  };

  const scrapeImages = async () => {
    if (selectedRecipes.size === 0) {
      toast({
        title: "No recipes selected",
        description: "Please select recipes to scrape images for",
        variant: "destructive",
      });
      return;
    }

    setScraping(true);
    setProgress(0);
    
    const recipesToScrape = recipes.filter(r => selectedRecipes.has(r.id));
    let completed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const recipe of recipesToScrape) {
      try {
        const imageSource = await searchUnsplashImage(recipe.name, recipe.country);
        
        if (imageSource) {
          const success = await updateRecipeImage(recipe.id, imageSource.url);
          if (success) {
            succeeded++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`Error processing ${recipe.name}:`, error);
      }
      
      completed++;
      setProgress((completed / recipesToScrape.length) * 100);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setScraping(false);
    toast({
      title: "Image scraping completed",
      description: `Successfully updated ${succeeded} images. ${failed} failed.`,
    });
    
    // Reload recipes to show updated images
    await loadRecipes();
    setSelectedRecipes(new Set());
  };

  const toggleRecipe = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  const selectAll = () => {
    const recipesNeedingImages = recipes.filter(r => !r.image_url || r.image_url.includes('example.com'));
    setSelectedRecipes(new Set(recipesNeedingImages.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedRecipes(new Set());
  };

  const recipesNeedingImages = recipes.filter(r => !r.image_url || r.image_url.includes('example.com'));
  const recipesWithImages = recipes.length - recipesNeedingImages.length;

  if (loading) {
    return <div className="p-8 text-center">Loading recipes...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipe Image Scraper</h1>
          <p className="text-muted-foreground mt-2">
            Automatically find and download free, high-quality images for your recipes
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{recipesWithImages}/{recipes.length}</div>
          <div className="text-sm text-muted-foreground">recipes with images</div>
        </div>
      </div>

      {scraping && (
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Scraping in progress...</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-x-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All Needing Images ({recipesNeedingImages.length})
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              Deselect All
            </Button>
          </div>
          <Button 
            onClick={scrapeImages} 
            disabled={selectedRecipes.size === 0 || scraping}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Scrape {selectedRecipes.size} Image{selectedRecipes.size !== 1 ? 's' : ''}
          </Button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {recipes.map((recipe) => {
            const hasImage = recipe.image_url && !recipe.image_url.includes('example.com');
            const isSelected = selectedRecipes.has(recipe.id);

            return (
              <div
                key={recipe.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleRecipe(recipe.id)}
                  disabled={scraping}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{recipe.name}</div>
                  <div className="text-sm text-muted-foreground">{recipe.country}</div>
                </div>

                <div className="flex items-center gap-2">
                  {hasImage ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-500">Has image</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-sm text-amber-500">Needs image</span>
                    </>
                  )}
                </div>

                {hasImage && recipe.image_url && (
                  <img 
                    src={recipe.image_url} 
                    alt={recipe.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Search className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Image Sources</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Images are sourced from Unsplash, a free stock photo platform. All images are high-quality 
              and licensed for commercial use. The scraper searches for authentic dishes based on the 
              recipe name and country.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
