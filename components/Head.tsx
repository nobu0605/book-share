import React from "react"
import NextHead from "next/head"

export default function Head(): JSX.Element {
  return (
    <NextHead>
      <title>Book Share</title>
      <meta name="description" content="Book Share" />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  )
}
