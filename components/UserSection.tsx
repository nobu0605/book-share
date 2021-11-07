import React, { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import styles from "../styles/components/UserSection.module.scss"
import Link from "next/link"
import ProfileImage from "./ProfileImage"

type Props = {
  username: string
  profileImage: string
}

export default function UserSection(props: Props): JSX.Element {
  const { authState } = useContext(AuthContext)
  const { username, profileImage } = props

  return (
    <Link href={`/mypage/${authState.user.id}`}>
      <a
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className={styles["user-section"]}>
          <ProfileImage profileImage={profileImage} />
          <span className={styles["user-section__name"]}>{username}</span>
        </div>
      </a>
    </Link>
  )
}
