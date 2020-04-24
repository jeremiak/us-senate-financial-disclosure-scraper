import '../style.scss'
import { Container } from 'next/app';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <Container>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,300;0,400;1,300&family=Oswald:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header>
        <img src="https://protoptypes.s3-us-west-1.amazonaws.com/senate_icon.svg" />
        <h2 className="h3">
          <a href="/">US Senate financial disclosure data</a>
        </h2>
        <ul>
          <li>
            <a href="/about">About this project</a>
          </li>
          <li>
            <a href="https://github.com/jeremiak/us-senate-financial-disclosure-data/">
              Data
            </a>
          </li>
          <li>
            <a href="https://github.com/jeremiak/us-senate-financial-disclosure-scraper">
              Github
            </a>
          </li>
        </ul>
      </header>
      <main>
        <Component {...pageProps} />
      </main>
    </Container>
  )
}
