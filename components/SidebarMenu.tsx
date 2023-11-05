import React, { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import ProfileImage from "./ProfileImage"
import { Dropdown } from "semantic-ui-react"
import Link from "next/link"
import styles from "../styles/components/SidebarMenu.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faHome } from "@fortawesome/free-solid-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
library.add(faHome, faEnvelope)

export default function SidebarMenu(): JSX.Element {
  const { authState } = useContext(AuthContext)

  function logout(): void {
    localStorage.removeItem("uid")
    localStorage.removeItem("access-token")
    localStorage.removeItem("client")
    location.pathname = "/"
  }

  return (
    <div className={styles["sidebar-menu"]}>
      <nav className={styles["sidebar-navigation"]}>
        <Link href={`/mypage/${authState.user.id}`}>
          <a>
            <div
              className={`${styles["sidebar-menu-link"]} ${styles["sidebar-menu-profile"]}`}
            >
              <ProfileImage profileImage={authState.user.profile_image} />
              <span className={styles["sidebar-menu-profile__name"]}>
                {authState.user.username}
              </span>
            </div>
          </a>
        </Link>
        <Link href={`/home`}>
          <a
            className={`${styles["sidebar-menu-link"]} ${styles["sidebar-menu-icon-link"]}`}
          >
            <FontAwesomeIcon
              icon="home"
              className={styles["sidebar-menu__icon"]}
            />
            <span>ホーム</span>
          </a>
        </Link>
        <Link href={`/message`}>
          <a
            className={`${styles["sidebar-menu-link"]} ${styles["sidebar-menu-icon-link"]}`}
          >
            <FontAwesomeIcon
              icon="envelope"
              className={styles["sidebar-menu__icon"]}
            />
            <span>メッセージ</span>
          </a>
        </Link>
        <Dropdown className={styles["sidebar-menu-link"]} text={"アカウント"}>
          <Dropdown.Menu>
            <Dropdown.Item text="Logout" onClick={logout} />
          </Dropdown.Menu>
        </Dropdown>
      </nav>
    </div>
  )
}
