import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Cigarette, ThumbsUp, ThumbsDown, AlertTriangle, Skull, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const API_TOKEN = '69a78238e15f94c45ceae05acbf887019a9d90ef';

const AQI_LEVELS = [
  { max: 50, label: 'Good', color: '#4CAF50' },              // Bright green
  { max: 100, label: 'Moderate', color: '#ffcd37' },         // Bright yellow
  { max: 150, label: 'Unhealthy for Sensitive Groups', color: '#FF9800' }, // Bright orange
  { max: 200, label: 'Unhealthy', color: '#F44336' },        // Bright red
  { max: 300, label: 'Very Unhealthy', color: '#9C27B0' },   // Bright purple
  { max: 500, label: 'Hazardous', color: '#4A148C' },        // Dark purple
];

const getAQIInfo = (aqi) => {
  return AQI_LEVELS.find(level => aqi <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
};

const CigaretteEquivalent = ({ aqi }) => {
  let validAqi = isNaN(aqi) || aqi < 0 ? 0 : aqi;
  
  // Check if AQI is 980 or above
  if (validAqi >= 980) {
    return (
      <div className="mt-8 text-center">
        <div className="text-2xl mb-6">
          The AQI of the current region has exceeded the maximum reading of the sensor. 
          But it's at least {Math.round(1000/22)} cigarettes in 24 hours
       <div className="grid grid-cols-3 gap-6 justify-items-center max-w-[300px] mx-auto">
        {[...Array(45)].map((_, i) => (
          <Cigarette key={i} size={100} className="text-gray-600" />
        ))}
      </div>
        </div>
      </div>
    );
  }

  // Calculate cigarettes and clamp the value between 0 and a reasonable upper bound, say 50
  let cigarettes = Math.max(0, Math.floor(validAqi / 22));

  return (
    <div className="mt-8 text-center">
      <div className="text-2xl mb-6">If you were breathing this air for 24 hours, you would have smoked</div>
      <div className="text-6xl font-bold mb-4">{cigarettes}</div>
      <div className="text-2xl mb-6">Cigarettes Equivalents</div>
      <div className="grid grid-cols-3 gap-6 justify-items-center max-w-[300px] mx-auto">
        {[...Array(cigarettes)].map((_, i) => (
          <Cigarette key={i} size={100} className="text-gray-600" />
        ))}
      </div>
    </div>
  );
};

const getAQIIcon = (aqi) => {
  const { color } = getAQIInfo(aqi);
  
  if (aqi <= 50) {
    return <ThumbsUp size={100} style={{ color }} />; // Good
  } else if (aqi <= 100) {
    return <ThumbsDown size={100} style={{ color }} />; // Moderate
  } else if (aqi <= 150) {
    return <AlertTriangle size={100} style={{ color }} />; }// Unhealthy for Sensitive Groups
 else if (aqi < 300) {
    return (
      <div className="flex justify-center">
        <Skull size={100} style={{ color }} />
        
      </div>
    ); // Unhealthy: One skull
  } else if (aqi < 400) {
    return (
      <div className="flex justify-center">
        {/* Two skulls for Very Unhealthy */}
        <Skull size={100} style={{ color }}  />
        <Skull size={100} style={{ color }}  />
      </div>
    );
  } else {
    return (
      <div className="flex justify-center">
        {/* Three skulls for Hazardous */}
        <Skull size={100} style={{ color }} />
        <Skull size={100} style={{ color }}  />
        <Skull size={100} style={{ color }}  />
      </div>
    );
  }
};

const AQIIndicator = ({ aqi, location }) => {
  const { label, color } = getAQIInfo(aqi);

  const handleShare = async () => {
    try {
      const element = document.getElementById('share-content');
      const canvas = await html2canvas(element);
      const imageUrl = canvas.toDataURL('image/png');
      
      const shareText = `The AQI where I am is currently ${aqi} ppm. \n\nIf I was breathing this air for 24 hours, I would have smoked approximately ${Math.floor(aqi/22)} 🚬.\n \nFind out how many cigarette equivalents are you smoking at www.howmanycigs.com `;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      
      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div id="share-content">
        <div className="mb-4 text-6xl font-bold" style={{ color }}>
          {aqi}
        </div>
        <div className="mb-6 text-2xl font-medium text-gray-600">{label}</div>

        {/* Show the appropriate icon based on the AQI */}
        <div className="flex justify-center mb-6">
          {getAQIIcon(aqi)}
        </div>

       <div className="relative w-full h-4 flex rounded-full overflow-hidden mt-4 mb-4">
        {/* AQI levels bar */}
        {AQI_LEVELS.map((level, index) => (
          <div
            key={index}
            className="h-full"
            style={{
              width: `${(level.max - (index > 0 ? AQI_LEVELS[index - 1].max : 0)) / 4}%`,
              backgroundColor: level.color,
            }}
          />
        ))}

        {/* AQI indicator */}
        <div
          className="absolute top-[-5px] transform -translate-x-1/2"
          style={{
            left: `${(aqi / 500) * 100}%`,
            top:-1
          }}
        >
          <div className="w-5 h-5 bg-white rounded-full border-2 border-black"></div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 flex justify-between">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500</span>
      </div>
        <CigaretteEquivalent aqi={aqi} />
      </div>
      
      {/* Share button */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={handleShare}
          className="flex items-center px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8]"
        >
          <Share2 className="mr-2" size={20} />
          Share on X
        </button>
      </div>
    </div>
  );
};

const QuickCityButton = ({ city, aqi, onSelect }) => {
  const { color } = getAQIInfo(aqi);
  return (
    <button
      onClick={() => onSelect(city)}
    className="w-full p-6 mb-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex justify-between items-center text-lg"

    >
      <span className="font-large">{city}</span>
      <span className="font-bold" style={{ color }}>{aqi}</span>
    </button>
  );
};

const CitySearch = ({ onCitySelect, showQuickCities = true }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [quickCityAQIs, setQuickCityAQIs] = useState({});
  const quickCities = ['London', 'New Delhi', 'New York', 'Paris', 'Tokyo'];

  useEffect(() => {
    if (showQuickCities) {
      // Fetch AQI for quick access cities
      quickCities.forEach(async (city) => {
        try {
          const response = await axios.get(`https://api.waqi.info/feed/${city}/?token=${API_TOKEN}`);
          if (response.data.status === 'ok') {
            setQuickCityAQIs(prev => ({
              ...prev,
              [city]: response.data.data.aqi
            }));
          }
        } catch (error) {
          console.error(`Error fetching AQI for ${city}:`, error);
        }
      });
    }
  }, [showQuickCities]);

  const searchCity = async (input) => {
    if (input.length > 2) {
      try {
        const response = await axios.get(`https://api.waqi.info/search/?token=${API_TOKEN}&keyword=${input}`);
        setResults(response.data.data);
      } catch (error) {
        console.error('Error searching cities:', error);
      }
    } else {
      setResults([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchCity(query), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {results.length > 0 && (
        <ul className="mb-4 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {results.map((result) => (
            <li
              key={result.uid}
              onClick={() => onCitySelect(result.station.name)}
              className="p-3 hover:bg-gray-100 cursor-pointer"
            >
              {result.station.name}
            </li>
          ))}
        </ul>
      )}

      {showQuickCities && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Quick Access Cities</h3>
          {quickCities.map((city) => (
            <QuickCityButton
              key={city}
              city={city}
              aqi={quickCityAQIs[city]}
              onSelect={onCitySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AQIDashboard = () => {
  const [currentAQI, setCurrentAQI] = useState(null);
  const [location, setLocation] = useState('Loading...');
  const [error, setError] = useState(null);

  const fetchAQI = async (city) => {
    try {
      const response = await axios.get(`https://api.waqi.info/feed/${city}/?token=${API_TOKEN}`);
      if (response.data.status === 'error' || response.data.data.aqi === '-') {
        setError("The AQI of the current location cannot be determined due to lack of AQI monitors.");
        setCurrentAQI(null);
      } else {
        setCurrentAQI(response.data.data.aqi);
        setLocation(city);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching AQI:', error);
      setError("The AQI of the current location cannot be determined due to lack of AQI monitors.");
      setCurrentAQI(null);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${API_TOKEN}`);
          if (response.data.status === 'error' || response.data.data.aqi === '-') {
            setError("The AQI of the current location cannot be determined due to lack of AQI monitors.");
            setCurrentAQI(null);
          } else {
            setCurrentAQI(response.data.data.aqi);
            setLocation(response.data.data.city.name);
            setError(null);
          }
        } catch (error) {
          console.error('Error fetching current location AQI:', error);
          setError("The AQI of the current location cannot be determined due to lack of AQI monitors.");
          setCurrentAQI(null);
        }
      }, () => {
        setLocation('Unable to get location');
        setError("The AQI of the current location cannot be determined due to lack of AQI monitors.");
      });
    } else {
      setLocation('Geolocation not supported');
      setError("The AQI of the current location cannot be determined due to lack of AQI monitors. Please check nearby locations.");
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Search Bar */}
      <div className="md:hidden w-full bg-white p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">How Many Cigs?</h2>
        <CitySearch onCitySelect={fetchAQI} showQuickCities={false} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-1/4 bg-white p-6 shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">How Many Cigs?</h2>
        <CitySearch onCitySelect={fetchAQI} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col items-center justify-start">
          <div className="text-3xl font-bold mb-4 text-gray-800">{location}</div>
          {error ? (
            <div className="text-xl text-red-600 text-center">{error}</div>
          ) : (
            currentAQI !== null && <AQIIndicator aqi={currentAQI} location={location} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AQIDashboard;