import React from "react"
import styles from "../styles/components/ProfileImage.module.scss"
import Image from "next/image"

type Props = {
  profileImage: string
  width?: number
  height?: number
}

export default function ProfileImage(props: Props): JSX.Element {
  const { profileImage, width = 48, height = 48 } = props

  if (profileImage) {
    return (
      <Image
        className={styles["profile-image"]}
        width={width}
        height={height}
        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile-img/${profileImage}`}
        alt={"Profile image"}
      />
    )
  }

  return (
    <Image
      className={styles["profile-image"]}
      width={width}
      height={height}
      src={`/profile-img/default-profile-image.png`}
      alt={"Profile image"}
    />
  )
}
