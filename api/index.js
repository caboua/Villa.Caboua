import Head from "next/head";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Charge flatpickr et init calendrier si besoin
  }, []);

  return (
    <>
      <Head>
        <title>Villa CABOUA – Location en Guadeloupe</title>
        <meta name="description" content="Villa CABOUA en Guadeloupe, jusqu'à 8 personnes" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </Head>

      <div>
        <header>
          <h1>Villa CABOUA</h1>
          <p>Location villa en Guadeloupe – Jusqu'à 8 voyageurs</p>
          <a href="#reservation" className="hero-btn">Vérifier les disponibilités</a>
        </header>

        {/* Ici tu peux copier ton HTML original en JSX ou utiliser dangerouslySetInnerHTML */}
      </div>
    </>
  );
}
