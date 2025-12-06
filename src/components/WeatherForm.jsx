'use client'; // Indica que este componente roda no navegador (Client Component)

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Hook de navegação do Next.js

const OPENWEATHER_API_KEY = 'a8fa11182eb49e859b2fb8a310084290';

export default function WeatherForm() {
  const router = useRouter(); // Para navegar para a página do mapa

  const [cepInput, setCepInput] = useState('');
  const [cepData, setCepData] = useState(null);
  const [clima, setClima] = useState(null);
  const [previsao, setPrevisao] = useState(null);
  const [horaLocal, setHoraLocal] = useState('--:--');
  
  // Ref para guardar coordenadas para o mapa
  const coordsRef = useRef({ lat: null, lon: null });
  const clockIntervalRef = useRef(null);
  const weatherRefreshIntervalRef = useRef(null);

  // Efeito para mudar o background do Body
  useEffect(() => {
    if (clima) {
      const weatherMain = clima.weather[0].main;
      let bgClass = 'bg-default';
      if (weatherMain === 'Clear') bgClass = 'bg-sunny';
      else if (weatherMain === 'Clouds') bgClass = 'bg-cloudy';
      else if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain)) bgClass = 'bg-rainy';
      
      document.body.className = bgClass;
    } else {
      document.body.className = 'bg-default';
    }
  }, [clima]);

  // Limpeza dos timers ao sair
  useEffect(() => {
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (weatherRefreshIntervalRef.current) clearInterval(weatherRefreshIntervalRef.current);
    };
  }, []);

  // --- LÓGICA DE API ---
  async function buscarDadosViaCEP(cep) {
    let response = await fetch(`https://viacep.com.br/ws/${cep}/xml/`);
    if (!response.ok) throw new Error('Falha ao buscar CEP.');
    let data = await response.text();
    let parser = new DOMParser();
    let xml = parser.parseFromString(data, 'application/xml');
    if (xml.getElementsByTagName('erro').length > 0) throw new Error('CEP não encontrado.');
    return xml;
  }

  async function buscarClimaAtual(cidade, uf) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade},${uf},BR&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Clima não encontrado.');
    return await response.json();
  }

  async function buscarPrevisao5Dias(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    const response = await fetch(url);
    return await response.json();
  }

  // --- Lógica Relógio ---
  function startClock(timezoneOffset) {
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    const update = () => {
      const now = new Date();
      const utc_ms = now.getTime() + (now.getTimezoneOffset() * 60000);
      const city_ms = utc_ms + (timezoneOffset * 1000);
      setHoraLocal(new Date(city_ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    clockIntervalRef.current = setInterval(update, 1000);
  }

  const consultarTudo = async () => {
    if (!/^[0-9]{8}$/.test(cepInput)) {
      alert('CEP inválido.');
      return;
    }
    try {
      const xml = await buscarDadosViaCEP(cepInput);
      const cidade = xml.getElementsByTagName('localidade')[0].textContent;
      const uf = xml.getElementsByTagName('uf')[0].textContent;

      setCepData({
        cep: xml.getElementsByTagName('cep')[0].textContent,
        logradouro: xml.getElementsByTagName('logradouro')[0].textContent || '-',
        bairro: xml.getElementsByTagName('bairro')[0].textContent || '-',
        localidade: cidade,
        uf: uf,
        ddd: xml.getElementsByTagName('ddd')[0].textContent,
      });

      const dadosClima = await buscarClimaAtual(cidade, uf);
      const lat = dadosClima.coord.lat;
      const lon = dadosClima.coord.lon;
      
      // Salva coordenadas para o botão do mapa
      coordsRef.current = { lat, lon };

      const dadosPrevisao = await buscarPrevisao5Dias(lat, lon);
      
      // Filtrar previsão (12:00 de cada dia)
      const dailyForecasts = [];
      const seenDays = {};
      dadosPrevisao.list.forEach(item => {
         if (item.dt_txt.includes("12:00:00") || !seenDays[item.dt_txt.split(' ')[0]]) {
             const day = item.dt_txt.split(' ')[0];
             if(!seenDays[day]) {
                 dailyForecasts.push(item);
                 seenDays[day] = true;
             }
         }
      });

      setClima(dadosClima);
      setPrevisao(dailyForecasts.slice(0, 5));
      startClock(dadosClima.timezone);

    } catch (error) {
      alert(error.message);
      limparDados();
    }
  };

  const limparDados = () => {
    setCepInput('');
    setCepData(null);
    setClima(null);
    setPrevisao(null);
    setHoraLocal('--:--');
    document.body.className = 'bg-default';
  };

  // Função para ir para a página 2
  const irParaMapa = () => {
    if (coordsRef.current.lat) {
        // Envia as coordenadas via URL para a página do mapa
        router.push(`/mapa?lat=${coordsRef.current.lat}&lng=${coordsRef.current.lon}`);
    }
  };

  return (
    <div className="container">
      {clima && (
        <div id="weather-current">
          <img src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`} alt="ícone" />
          <div>
            <span id="weather-time">{horaLocal}</span>
            <strong>{Math.round(clima.main.temp)}°C</strong>
            <span className="description">{clima.weather[0].description}</span>
            <span className="feels-like">Sensação: {Math.round(clima.main.feels_like)}°C</span>
          </div>
        </div>
      )}

      <section className="consultas">
        <h1>Consultas</h1>
        <input 
          type="text" 
          placeholder="Digite o CEP (só números)" 
          maxLength="8"
          value={cepInput}
          onChange={(e) => setCepInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && consultarTudo()}
        />
        <div className="buttons">
            <button onClick={limparDados}>Limpar</button>
            <button onClick={consultarTudo} style={{backgroundColor: '#007bff'}}>Buscar</button>
        </div>
      </section>

      <section className="resultados">
        <h1>Resultados CEP</h1>
        <table>
          <thead>
            <tr><th>#</th><th>CEP</th><th>Logradouro</th><th>Bairro</th><th>Cidade</th><th>UF</th></tr>
          </thead>
          <tbody>
            {cepData ? (
              <tr>
                <td>1</td><td>{cepData.cep}</td><td>{cepData.logradouro}</td>
                <td>{cepData.bairro}</td><td>{cepData.localidade}</td><td>{cepData.uf}</td>
              </tr>
            ) : (
              <tr><td>1</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
            )}
          </tbody>
        </table>
        
        {/* BOTÃO PARA A PÁGINA 2 */}
        {cepData && (
            <button className="btn-mapa" onClick={irParaMapa}>
                Ver no Mapa
            </button>
        )}
      </section>

      {previsao && (
        <section id="forecast-section">
          <h1>Previsão Próximos Dias</h1>
          <div id="forecast-container">
            {previsao.map((day) => (
              <div className="forecast-card" key={day.dt}>
                <strong>{new Date(day.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' })}</strong>
                <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt="clima" />
                <span>{Math.round(day.main.temp)}°C</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}