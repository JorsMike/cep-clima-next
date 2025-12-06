// src/app/mapa/page.js
'use client'; 

import { useEffect, useRef, useState, Suspense } from 'react'; 
import { useSearchParams, useRouter } from 'next/navigation';

// 1. COMPONENTE INTERNO: Contém a lógica que lê a URL (?lat=...&lng=...)
function MapaContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // O causador do erro (precisa de Suspense)
  
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const mapRef = useRef(null);
  const [mensagem, setMensagem] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }
      const script = document.createElement('script');
      // --- COLOQUE SUA CHAVE ABAIXO ---
      script.src = `https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_GOOGLE_MAPS&libraries=places,marker&v=weekly`;
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

    const initialCenter = (latParam && lngParam) 
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: -14.235, lng: -51.9253 }; 

    const map = new Map(document.getElementById("map"), {
      center: initialCenter,
      zoom: (latParam && lngParam) ? 15 : 4,
      mapId: 'DEMO_MAP_ID' 
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
          <gmp-basic-place-autocomplete></gmp-basic-place-autocomplete>
          <div id="message-box" className={mensagem.type} style={{ display: mensagem.text ? 'block' : 'none' }}>
            {mensagem.text}
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  );
}

// 2. COMPONENTE PRINCIPAL: Envolve o conteúdo no Suspense para corrigir o erro
export default function MapaPage() {
  return (
    <Suspense fallback={<div>Carregando mapa...</div>}>
      <MapaContent />
    </Suspense>
  );
}
