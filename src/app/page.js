import WeatherForm from '../components/WeatherForm';

// Esta página é renderizada estaticamente (SSG) por padrão no Next.js
export default function Home() {
  return (
    <main>
       {/* O componente WeatherForm contém a lógica interativa (Client Side) */}
       <WeatherForm />
    </main>
  );
}