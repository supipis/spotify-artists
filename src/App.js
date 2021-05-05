import React, { useState, useEffect } from 'react'
import './App.css'
import firebase from "firebase/app";
import "firebase/firestore";
import axios from 'axios';
import ReactAudioPlayer from 'react-audio-player'

import { FirestoreProvider, FirestoreCollection } from "@react-firebase/firestore";

var config = {
  apiKey: "AIzaSyAkPEv9v08oOv8c3hD-8SEGJt6po6U0JKg",
  authDomain: "artists-spotify.firebaseapp.com",
  projectId: "artists-spotify",
  storageBucket: "artists-spotify.appspot.com",
  messagingSenderId: "237999941202",
  appId: "1:237999941202:web:25b876a105fdeb8a35218b"
};

function App() {

  const [selectedCountry, setSelectedCountry] = useState('Sri Lanka')
  const [selectedArtistId, setSelectedArtistId] = useState('')

  function updateSelectedCountry(countryName) {
    setSelectedCountry(countryName);
    setSelectedArtistId('')
  }

  return (
    <FirestoreProvider {...config} firebase={firebase}>

      <div className="App">
        <h1>The World of Music</h1>
        <CountryList onCountrySelect={updateSelectedCountry} selectedCountry={selectedCountry} />
        <ArtistList selectedCountry={selectedCountry} onArtistSelect={setSelectedArtistId} selectedArtistId={selectedArtistId} />
        <TracksList artistId={selectedArtistId} />
      </div>

    </FirestoreProvider>
  )
}

function CountryList(props) {
  let [countries, setCountries] = useState(['Sri Lanka', 'India', 'Pakistan', 'Nepal', 'Bhutan', 'Bangladesh', 'Maldives', 'South Korea', 'Spain'])
  return <ul id='country'>

    {countries.map(country => {
      return <li className={props.selectedCountry == country ? 'selected' : ''} onClick={() => props.onCountrySelect(country)} id='countryList'>{country}</li>
    })}
  </ul>
}

function ArtistList(props) {
  let [artists, setArtists] = useState();
  return <ul id='artists'>
    <FirestoreCollection path="/artists/" limit={5} where={{ field: "NameOfCountry", operator: "==", value: props.selectedCountry }}>
      {d => {
        return d.isLoading ? "Loading" : d.value.map(artist => <li className={props.selectedArtistId == artist.ArtistId ? "selected" : ''} onClick={() => props.onArtistSelect(artist.ArtistId)} id='artist-list'> {artist.NameOfArtist} </li>)
      }}
    </FirestoreCollection>
  </ul>
}

function TracksList(props) {
  let [token, setToken] = useState('');
  let [tracks, setTracks] = useState([])

  const market = 'US';

  useEffect(() => {

    const id = props.artistId;
    if (id != '') {
      // Api call for retrieving token
      axios('https://accounts.spotify.com/api/token', {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa('b277afd5fab340199cf0f95e8f39c70e' + ':' + 'c55b5f3cdbc9429cbc293ce43b9f6394'),
        },
        data: 'grant_type=client_credentials'
      }).then(tokenresponse => {
        console.log(tokenresponse.data.access_token);
        setToken(tokenresponse.data.access_token);

        // Api call for retrieving tracks data
        axios(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=${market}`, {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + tokenresponse.data.access_token
          }
        }).then(trackresponse => {
          console.log(trackresponse.data.tracks);
          setTracks(trackresponse.data.tracks);
        }).catch(error => console.log(error))
      }).catch(error => console.log(error));
    } else {
      setTracks([])
    }


  }, [props.artistId])

  return <div className='music-track'>
    <ul id='tracks'>
      {tracks.map(track => {
        return <div className='player'>
          <li id='track-list'>{track.name} <br />
          <ReactAudioPlayer src={track.preview_url} controls /></li>
        </div>
      })}
    </ul>
  </div>
}




export default App