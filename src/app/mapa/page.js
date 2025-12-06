'use client'; // Renderização do Lado do Cliente (CSR) obrigatória para Google Maps

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MapaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pega as coordenadas passadas pela URL da página anterior
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const mapRef = useRef(null);
  const [mensagem, setMensagem] = useState({ text: '', type: '' });

  useEffect(() => {
    // Função para carregar o Google Maps dinamicamente
    const loadGoogleMaps = async () => {
      // Verifica se já carregou para não duplicar
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      // SUBSTITUA "SUA_CHAVE_GOOGLE_MAPS" PELA SUA CHAVE REAL
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB0Vi1d5cSEmOAAEpZlNuo5T-l7D5wmN2s&libraries=places,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [latParam, lngParam]);

  const initMap = async () => {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { InfoWindow } = await google.maps.importLibrary("maps");

    // Define o centro inicial (ou o recebido da Home)
    const initialCenter = (latParam && lngParam) 
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: -14.235, lng: -51.9253 }; // Centro do Brasil

    const map = new Map(document.getElementById("map"), {
      center: initialCenter,
      zoom: (latParam && lngParam) ? 15 : 4,
      mapId: 'DEMO_MAP_ID' // Necessário para AdvancedMarkerElement
    });

    const infoWindow = new InfoWindow();
    const marker = new AdvancedMarkerElement({
      map: map,
      position: (latParam && lngParam) ? initialCenter : null,
      title: "Local Selecionado"
    });

    if (latParam && lngParam) {
        setMensagem({ text: "Localização recebida da consulta!", type: "success" });
    }

    // Configuração do Autocomplete (Barra de busca do mapa)
    const autocompleteEl = document.querySelector('gmp-basic-place-autocomplete');
    if (autocompleteEl) {
        autocompleteEl.addEventListener('gmp-placechange', (event) => {
            const place = event.detail.place;
            if (!place || !place.geometry) {
                setMensagem({ text: "Local não encontrado.", type: "error" });
                return;
            }
            
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            marker.position = place.geometry.location;
            infoWindow.setContent(place.formattedAddress);
            infoWindow.open(map, marker);
            setMensagem({ text: "Nova localização encontrada!", type: "success" });
        });
    }
  };

  return (
    <div className="container" style={{maxWidth: '1200px'}}>
      <div id="container-mapa">
        <div id="controls-mapa">
          <button className="btn-voltar" onClick={() => router.push('/')}>
             ← Voltar para Clima
          </button>
          
          <h1>Localizador</h1>
          <p>Busque novos locais ou veja o CEP selecionado.</p>
          
          {/* Componente Web do Google (precisa da biblioteca carregada) */}
          <gmp-basic-place-autocomplete></gmp-basic-place-autocomplete>

          <div 
            id="message-box" 
            className={mensagem.type} 
            style={{ display: mensagem.text ? 'block' : 'none' }}
          >
            {mensagem.text}
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  );
}