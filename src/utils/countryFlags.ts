// Country to flag emoji mapping
export const countryToFlag: Record<string, string> = {
  // Africa
  'Algeria': '🇩🇿',
  'Angola': '🇦🇴',
  'Benin': '🇧🇯',
  'Botswana': '🇧🇼',
  'Burkina Faso': '🇧🇫',
  'Burundi': '🇧🇮',
  'Cameroon': '🇨🇲',
  'Cape Verde': '🇨🇻',
  'Central African Republic': '🇨🇫',
  'Chad': '🇹🇩',
  'Comoros': '🇰🇲',
  'Congo': '🇨🇬',
  'DRC': '🇨🇩',
  "Côte d'Ivoire": '🇨🇮',
  'Ivory Coast': '🇨🇮',
  'Djibouti': '🇩🇯',
  'Egypt': '🇪🇬',
  'Equatorial Guinea': '🇬🇶',
  'Eritrea': '🇪🇷',
  'Eswatini': '🇸🇿',
  'Ethiopia': '🇪🇹',
  'Gabon': '🇬🇦',
  'Gambia': '🇬🇲',
  'Ghana': '🇬🇭',
  'Guinea': '🇬🇳',
  'Guinea-Bissau': '🇬🇼',
  'Kenya': '🇰🇪',
  'Lesotho': '🇱🇸',
  'Liberia': '🇱🇷',
  'Libya': '🇱🇾',
  'Madagascar': '🇲🇬',
  'Malawi': '🇲🇼',
  'Mali': '🇲🇱',
  'Mauritania': '🇲🇷',
  'Mauritius': '🇲🇺',
  'Morocco': '🇲🇦',
  'Mozambique': '🇲🇿',
  'Namibia': '🇳🇦',
  'Niger': '🇳🇪',
  'Nigeria': '🇳🇬',
  'Rwanda': '🇷🇼',
  'Senegal': '🇸🇳',
  'Seychelles': '🇸🇨',
  'Sierra Leone': '🇸🇱',
  'Somalia': '🇸🇴',
  'South Africa': '🇿🇦',
  'South Sudan': '🇸🇸',
  'Sudan': '🇸🇩',
  'Tanzania': '🇹🇿',
  'Togo': '🇹🇬',
  'Tunisia': '🇹🇳',
  'Uganda': '🇺🇬',
  'Zambia': '🇿🇲',
  'Zimbabwe': '🇿🇼',

  // Asia
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Indonesia': '🇮🇩',
  'Japan': '🇯🇵',
  'Malaysia': '🇲🇾',
  'Philippines': '🇵🇭',
  'South Korea': '🇰🇷',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'Singapore': '🇸🇬',
  'Taiwan': '🇹🇼',
  'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩',
  'Nepal': '🇳🇵',
  'Sri Lanka': '🇱🇰',

  // Europe
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Greece': '🇬🇷',
  'Hungary': '🇭🇺',
  'Italy': '🇮🇹',
  'Poland': '🇵🇱',
  'Spain': '🇪🇸',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Ireland': '🇮🇪',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Cyprus': '🇨🇾',
  'Turkey': '🇹🇷',
  'Russia': '🇷🇺',
  'Ukraine': '🇺🇦',
  'Romania': '🇷🇴',
  'Czech Republic': '🇨🇿',

  // Middle East
  'Lebanon': '🇱🇧',
  'Israel': '🇮🇱',
  'Palestine': '🇵🇸',
  'Jordan': '🇯🇴',
  'Syria': '🇸🇾',
  'Iraq': '🇮🇶',
  'Iran': '🇮🇷',
  'Saudi Arabia': '🇸🇦',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Yemen': '🇾🇪',
  'Oman': '🇴🇲',
  'Kuwait': '🇰🇼',
  'Qatar': '🇶🇦',
  'Bahrain': '🇧🇭',

  // Americas
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'Mexico': '🇲🇽',
  'Cuba': '🇨🇺',
  'Jamaica': '🇯🇲',
  'Puerto Rico': '🇵🇷',
  'Dominican Republic': '🇩🇴',
  'Haiti': '🇭🇹',
  'El Salvador': '🇸🇻',
  'Guatemala': '🇬🇹',
  'Honduras': '🇭🇳',
  'Nicaragua': '🇳🇮',
  'Costa Rica': '🇨🇷',
  'Panama': '🇵🇦',
  'Colombia': '🇨🇴',
  'Venezuela': '🇻🇪',
  'Ecuador': '🇪🇨',
  'Peru': '🇵🇪',
  'Bolivia': '🇧🇴',
  'Chile': '🇨🇱',
  'Argentina': '🇦🇷',
  'Brazil': '🇧🇷',
  'Uruguay': '🇺🇾',
  'Paraguay': '🇵🇾',
  'Guyana': '🇬🇾',
  'Suriname': '🇸🇷',

  // Oceania
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Fiji': '🇫🇯',
  'Papua New Guinea': '🇵🇬',
  'Hawaii': '🇺🇸',

  // Multi-country/Fusion
  'Global': '🌍',
  'International': '🌍',
  'Fusion': '🌏',
};

// Get flag for a country, with fallback
export const getCountryFlag = (country: string): string => {
  if (!country) return '🌍';
  
  // Direct match
  if (countryToFlag[country]) {
    return countryToFlag[country];
  }
  
  // Case-insensitive search
  const lowerCountry = country.toLowerCase();
  const match = Object.keys(countryToFlag).find(
    key => key.toLowerCase() === lowerCountry
  );
  
  if (match) {
    return countryToFlag[match];
  }
  
  // Check for partial matches (e.g., "Angola/DRC" should match Angola)
  for (const [key, flag] of Object.entries(countryToFlag)) {
    if (country.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(country.toLowerCase())) {
      return flag;
    }
  }
  
  return '🌍'; // Default globe
};

// Get continent from country
export const getContinent = (country: string): string => {
  const africaCountries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
    'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'DRC',
    "Côte d'Ivoire", 'Ivory Coast', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
    'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
    'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
    'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];
  
  const asiaCountries = [
    'China', 'India', 'Indonesia', 'Japan', 'Malaysia', 'Philippines', 'South Korea',
    'Thailand', 'Vietnam', 'Singapore', 'Taiwan', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka'
  ];
  
  const europeCountries = [
    'France', 'Germany', 'Greece', 'Hungary', 'Italy', 'Poland', 'Spain', 'United Kingdom',
    'UK', 'Portugal', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Sweden',
    'Norway', 'Denmark', 'Finland', 'Ireland', 'Scotland', 'Cyprus', 'Turkey', 'Russia',
    'Ukraine', 'Romania', 'Czech Republic', 'Lebanon'
  ];
  
  const middleEastCountries = [
    'Israel', 'Palestine', 'Jordan', 'Syria', 'Iraq', 'Iran', 'Saudi Arabia',
    'UAE', 'United Arab Emirates', 'Yemen', 'Oman', 'Kuwait', 'Qatar', 'Bahrain'
  ];
  
  const northAmericaCountries = [
    'United States', 'USA', 'Canada', 'Mexico', 'Cuba', 'Jamaica', 'Puerto Rico',
    'Dominican Republic', 'Haiti', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua',
    'Costa Rica', 'Panama'
  ];
  
  const southAmericaCountries = [
    'Colombia', 'Venezuela', 'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina',
    'Brazil', 'Uruguay', 'Paraguay', 'Guyana', 'Suriname'
  ];
  
  const oceaniaCountries = ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Hawaii'];
  
  const lowerCountry = country.toLowerCase();
  
  if (africaCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'Africa';
  if (asiaCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'Asia';
  if (europeCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'Europe';
  if (middleEastCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'Middle East';
  if (northAmericaCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'North America';
  if (southAmericaCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'South America';
  if (oceaniaCountries.some(c => lowerCountry.includes(c.toLowerCase()))) return 'Oceania';
  
  return 'Global';
};
