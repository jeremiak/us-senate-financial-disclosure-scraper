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
        <h2 class="h3">US Senate financial disclosure data</h2>
      </header>
      <main>
        <Component {...pageProps} />
      </main>
    </Container>
  )
}
