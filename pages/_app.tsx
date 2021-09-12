import React from "react"
import { AppProps } from "next/app"
import Head from "../components/Head"
import { AuthProvider } from "../contexts/AuthContext"
import "semantic-ui-css/semantic.min.css"
import "../styles/globals.css"

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
}

export default MyApp
