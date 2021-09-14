import React, { FC } from "react"

interface Props {
  isError: boolean
  errorMessage: string
}

export const ErrorMessage: FC<Props> = ({ isError, errorMessage }) => {
  if (isError) {
    return (
      <span
        style={{
          color: "red",
          marginBottom: "13px",
          wordBreak: "break-word",
          width: "80%",
        }}
      >
        {errorMessage}
      </span>
    )
  }

  return null
}
