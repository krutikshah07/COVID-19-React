import React, { useState,useEffect } from 'react';
import { FormControl , Select,MenuItem, Card, CardContent} from '@material-ui/core';

import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table'
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"

function App() {
  const [countries,setcountries]= useState([]);
  const [country,setcountry] = useState('worldwide')
  const [countryInfo,setCountryInfo] =useState({});
  const [tableData,setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries]=  useState([])
  const [caseType,setcaseType] = useState("cases")
  useEffect(() => {   // To load worldWide data when the page is load 
    fetch('https://disease.sh/v3/covid-19/all')
    .then((response)=>response.json())
    .then((data)=>{
      
      setCountryInfo(data)
      setMapCenter({lat:0,lng:0})
      
      
    })
  },[])
  
  useEffect(() => {
    const getCountriesData = async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=>{
        const countries = data.map((country) =>(
          {
          name:country.country,
          value:country.countryInfo.iso2
          }
        ));
        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setcountries(countries) 
      })
    }
    getCountriesData(); //To call the funcation 
  }, [])
  const onCountryChange = async (event)=>{
    const countrycode = event.target.value;
    
    setcountry(countrycode)
    const url = countrycode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all'
    : `https://disease.sh/v3/covid-19/countries/${countrycode}`
    await fetch(url)
    .then(response => response.json())
    .then((data)=>{
      setcountry(countrycode);
      setCountryInfo(data)
      const set = countrycode === 'worldwide'? setMapCenter({lat:0,lng:0}) :  setMapCenter([data.countryInfo.lat, data.countryInfo.long])
     
      setMapZoom(3.5)
     
     

    })
  }
  
  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
    
      <h1>COVID-19 TRACKER</h1>
      <FormControl className="app__dropdown">
      <Select 
         variant="outlined"
         value={country}
         onChange={onCountryChange}

      >
      <MenuItem value="worldwide">WorldWide</MenuItem>
        {countries.map(country =>(
           <MenuItem value={country.value}>{country.name}</MenuItem>
        ))}
       

      </Select>
      </FormControl>
    </div>
    <div className="app__stats">
      <InfoBox     
            active={caseType === "cases"}title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={countryInfo.cases} onClick={e=> setcaseType('cases')}/>

      <InfoBox  active={caseType === "recovered"} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered}  onClick={e=> setcaseType('recovered')}/>

      <InfoBox active={caseType === "deaths"} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)}total={countryInfo.deaths} onClick={e=> setcaseType('deaths')}/>
      </div>
      <Map casesType={caseType}
      countries={mapCountries} 
      center={mapCenter} 
           zoom={mapZoom} />
      </div>
        <Card className="app_right">
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            

          <h3 className="app__graphTitle">Worldwide new {caseType}</h3>
          </CardContent>
           <LineGraph className="app__graph"  casesType={caseType}/>
        </Card> 
    </div>

  );
}

export default App;
