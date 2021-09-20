import React from "react"
import styles from "../styles/components/ProfileImage.module.scss"
import Image from "next/image"

type Props = {
  profileImage: string
}

export default function ProfileImage(props: Props): JSX.Element {
  const { profileImage } = props

  if (profileImage) {
    return (
      <Image
        className={styles["profile-image"]}
        width={48}
        height={48}
        src={`/profile-image/${profileImage}`}
        alt={"Profile image"}
      />
    )
  }

  return (
    <Image
      className={styles["profile-image"]}
      width={48}
      height={48}
      src={`/profile-image/default-profile-image.png`}
      alt={"Profile image"}
    />
  )
}
